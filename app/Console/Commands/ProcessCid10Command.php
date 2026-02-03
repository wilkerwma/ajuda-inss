<?php

namespace App\Console\Commands;

use App\Models\Cid10Code;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProcessCid10Command extends Command
{
    protected $signature = 'cid10:process 
                            {--fresh : Clear existing data before processing}
                            {--skip-embeddings : Skip embedding generation for faster testing}
                            {--limit= : Limit number of entries to process}';

    protected $description = 'Process CID-10 CSV file, split codes, generate embeddings, and save to database and JSON';

    private const CSV_PATH = 'database/seeders/cid-10.csv';

    private const JSON_OUTPUT_PATH = 'database/seeders/cid10_completo.json';

    private const EMBEDDING_API_URL = 'http://localhost:11434/api/embeddings';

    private const EMBEDDING_MODEL = 'nomic-embed-text';

    public function handle(): int
    {
        $this->info('Starting CID-10 processing...');

        if ($this->option('fresh')) {
            $this->info('Clearing existing CID-10 codes...');
            Cid10Code::truncate();
        }

        $csvPath = base_path(self::CSV_PATH);

        if (! file_exists($csvPath)) {
            $this->error("CSV file not found at: {$csvPath}");

            return Command::FAILURE;
        }

        $results = [];
        $processedCount = 0;
        $errorCount = 0;

        $this->info('Reading CSV file...');

        $skipEmbeddings = $this->option('skip-embeddings');
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;

        if ($skipEmbeddings) {
            $this->warn('Skipping embedding generation (--skip-embeddings flag set)');
        }

        if ($limit) {
            $this->info("Processing limited to {$limit} entries");
        }

        $handle = fopen($csvPath, 'r');
        $header = fgetcsv($handle);

        if (! $header || ! in_array('CODE', $header) || ! in_array('DESC', $header)) {
            $this->error('Invalid CSV format. Expected columns: DESC, CODE');
            fclose($handle);

            return Command::FAILURE;
        }

        $descIndex = array_search('DESC', $header);
        $codeIndex = array_search('CODE', $header);
        $bpcIndex = array_search('BPC', $header);

        $bar = $this->output->createProgressBar();
        $bar->start();

        while (($row = fgetcsv($handle)) !== false) {
            if ($limit && $processedCount >= $limit) {
                break;
            }
            $description = isset($row[$descIndex]) ? trim($row[$descIndex]) : '';
            $codes = isset($row[$codeIndex]) ? trim($row[$codeIndex]) : '';
            $bpcEligibility = isset($row[$bpcIndex]) ? filter_var($row[$bpcIndex], FILTER_VALIDATE_BOOLEAN) : false;

            if (empty($codes) || empty($description)) {
                continue;
            }

            // Split codes by various delimiters: - followed by space or just -
            $splitCodes = $this->splitCidCodes($codes);

            foreach ($splitCodes as $code) {
                if ($limit && $processedCount >= $limit) {
                    break 2; // Break out of both loops
                }

                try {
                    // Generate embedding (skip if flag is set)
                    $embedding = $skipEmbeddings ? null : $this->generateEmbedding($code, $description, $bpcEligibility);

                    // Prepare data
                    $data = [
                        'cid_code' => $code,
                        'description' => $description,
                        'bpc_eligibility' => $bpcEligibility,
                        'legal_notes' => null,
                        'embedding' => $embedding,
                    ];

                    // Save to database - use create or update separately for MongoDB
                    $existing = Cid10Code::where('cid_code', $code)->first();
                    if ($existing) {
                        $existing->update($data);
                        $this->line("\nUpdated: {$code}");
                    } else {
                        $record = Cid10Code::create($data);
                        $this->line("\nCreated: {$code} (ID: {$record->id})");
                    }

                    // Add to results for JSON
                    $results[] = [
                        'cid_code' => $code,
                        'description' => $description,
                        'embedding' => $embedding,
                        'bpc_eligibility' => $bpcEligibility,
                    ];

                    $processedCount++;
                    $bar->advance();
                } catch (\Exception $e) {
                    $errorCount++;
                    $errorMessage = $e->getMessage();
                    $errorTrace = $e->getTraceAsString();
                    Log::error("Error processing code {$code}: {$errorMessage}\nTrace: {$errorTrace}");
                    $this->error("\nError processing code {$code}: {$errorMessage}");
                }
            }
        }

        fclose($handle);
        $bar->finish();
        $this->newLine();

        // Save JSON file
        $this->info('Generating JSON output...');
        $jsonPath = base_path(self::JSON_OUTPUT_PATH);
        file_put_contents($jsonPath, json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $this->newLine();
        $this->info('✓ Processing complete!');
        $this->info("  - Processed: {$processedCount} entries");
        $this->info("  - Errors: {$errorCount}");
        $this->info('  - Database: cid10_codes collection');
        $this->info("  - JSON output: {$jsonPath}");

        return Command::SUCCESS;
    }

    /**
     * Split CID codes by delimiter (space followed by dash, or dash)
     */
    private function splitCidCodes(string $codes): array
    {
        // Replace different separators with a consistent delimiter
        $codes = preg_replace('/\s*-\s*/', '|', $codes);

        // Split by the delimiter
        $splitCodes = array_filter(array_map('trim', explode('|', $codes)));

        // Remove empty entries
        return array_values(array_filter($splitCodes, fn ($code) => ! empty($code)));
    }

    /**
     * Generate embedding for a CID code and description
     */
    private function generateEmbedding(string $code, string $description, bool $bpcEligibility): ?array
    {
        try {
            // Combine code and description for better context
            $text = "CID-10 {$code}: {$description} - bpc_eligibility: {$bpcEligibility}";

            $response = Http::timeout(30)->post(self::EMBEDDING_API_URL, [
                'model' => self::EMBEDDING_MODEL,
                'prompt' => $text,
            ]);

            if ($response->successful()) {
                $embedding = $response->json('embedding');

                return $embedding ?: null;
            }

            $this->warn("\nFailed to generate embedding for {$code}. Using null.");

            return null;
        } catch (\Exception $e) {
            $this->warn("\nEmbedding generation error for {$code}: ".$e->getMessage());

            return null;
        }
    }
}
