<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmbeddingService
{
    private const EMBEDDING_API_URL = 'http://localhost:11434/api/embeddings';
    private const EMBEDDING_MODEL = 'nomic-embed-text';

    /**
     * Generate embedding for a given text
     */
    public function generateEmbedding(string $text): ?array
    {
        try {
            $response = Http::timeout(30)->post(self::EMBEDDING_API_URL, [
                'model' => self::EMBEDDING_MODEL,
                'prompt' => $text,
            ]);

            if ($response->successful()) {
                return $response->json('embedding');
            }

            Log::warning('Failed to generate embedding', [
                'text' => $text,
                'status' => $response->status(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Embedding generation error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    public function cosineSimilarity(array $vectorA, array $vectorB): float
    {
        if (count($vectorA) !== count($vectorB)) {
            return 0.0;
        }

        $dotProduct = 0.0;
        $magnitudeA = 0.0;
        $magnitudeB = 0.0;

        for ($i = 0; $i < count($vectorA); $i++) {
            $dotProduct += $vectorA[$i] * $vectorB[$i];
            $magnitudeA += $vectorA[$i] * $vectorA[$i];
            $magnitudeB += $vectorB[$i] * $vectorB[$i];
        }

        $magnitudeA = sqrt($magnitudeA);
        $magnitudeB = sqrt($magnitudeB);

        if ($magnitudeA == 0.0 || $magnitudeB == 0.0) {
            return 0.0;
        }

        return $dotProduct / ($magnitudeA * $magnitudeB);
    }
}