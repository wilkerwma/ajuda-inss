<?php

namespace App\Services;

use App\Models\Cid10Code;
use Illuminate\Support\Collection;

class RagService
{
    private EmbeddingService $embeddingService;

    public function __construct(EmbeddingService $embeddingService)
    {
        $this->embeddingService = $embeddingService;
    }

    /**
     * Search for relevant CID-10 codes based on user query
     * 
     * @param string $query The user's question or search term
     * @param int $topK Number of results to return
     * @param float $minSimilarity Minimum similarity threshold (0.0 to 1.0)
     * @return Collection Collection of relevant CID-10 codes with similarity scores
     */
    public function searchRelevantCodes(string $query, int $topK = 5, float $minSimilarity = 0.5): Collection
    {
        $results = collect();
        
        // First, check if query contains a specific CID code (e.g., "CID S38", "S38", "CID-10 S38")
        if (preg_match('/\b([A-Z]\d{2}(?:\.\d{1,2})?)\b/i', $query, $matches)) {
            $cidCode = strtoupper($matches[1]);
            $directMatch = Cid10Code::where('cid_code', $cidCode)->first();
            
            if ($directMatch && $directMatch->embedding) {
                // Add the direct match with perfect similarity
                $results->push([
                    'cid_code' => $directMatch->cid_code,
                    'description' => $directMatch->description,
                    'bpc_eligibility' => $directMatch->bpc_eligibility,
                    'legal_notes' => $directMatch->legal_notes,
                    'similarity' => 1.0, // Perfect match
                ]);
                
                // Reduce topK since we already have a direct match
                $topK = max(1, $topK - 1);
            }
        }
        
        // Generate embedding for semantic search
        $queryEmbedding = $this->embeddingService->generateEmbedding($query);

        if (!$queryEmbedding) {
            return $results;
        }

        // Get all CID codes with embeddings
        $cid10Codes = Cid10Code::whereNotNull('embedding')->get();

        // Calculate similarity scores
        $semanticResults = $cid10Codes->map(function ($code) use ($queryEmbedding) {
            $similarity = $this->embeddingService->cosineSimilarity(
                $queryEmbedding,
                $code->embedding
            );

            return [
                'cid_code' => $code->cid_code,
                'description' => $code->description,
                'bpc_eligibility' => $code->bpc_eligibility,
                'legal_notes' => $code->legal_notes,
                'similarity' => $similarity,
            ];
        })
        ->filter(fn($result) => $result['similarity'] >= $minSimilarity)
        ->sortByDesc('similarity')
        ->take($topK)
        ->values();
        
        // Merge results, avoiding duplicates
        $existingCodes = $results->pluck('cid_code')->toArray();
        foreach ($semanticResults as $result) {
            if (!in_array($result['cid_code'], $existingCodes)) {
                $results->push($result);
            }
        }
        
        return $results->sortByDesc('similarity')->values();
    }

    /**
     * Format retrieved context for LLM prompt
     * 
     * @param Collection $relevantCodes Collection of relevant codes from search
     * @return string Formatted context string
     */
    public function formatContextForPrompt(Collection $relevantCodes): string
    {
        if ($relevantCodes->isEmpty()) {
            return '';
        }

        $context = "\n\n## Informações Relevantes do CID-10:\n\n";

        foreach ($relevantCodes as $code) {
            $context .= "**{$code['cid_code']}**: {$code['description']}\n";
            
            if ($code['bpc_eligibility']) {
                $context .= "  - Elegível para BPC/LOAS\n";
            }
            
            if (!empty($code['legal_notes'])) {
                $context .= "  - Notas Legais: {$code['legal_notes']}\n";
            }
            
            $context .= "  - Similaridade: " . round($code['similarity'] * 100, 1) . "%\n\n";
        }

        return $context;
    }
}