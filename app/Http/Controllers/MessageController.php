<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Services\RagService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    private const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

    private const OLLAMA_MODEL = 'deepseek-r1:8b';

    private RagService $ragService;

    public function __construct(RagService $ragService)
    {
        $this->ragService = $ragService;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        // Always use the current Laravel session ID managed by the server.
        // We intentionally ignore any client-provided session_id to avoid
        // stale or spoofed session identifiers.
        $sessionId = $request->session()->getId();

        // Save user message
        $userMessage = Message::create([
            'content' => $validated['content'],
            'type' => 'user',
            'session_id' => $sessionId,
        ]);

        try {
            // Submit question to Ollama and get response
            $aiResponse = $this->getOllamaResponse($validated['content'], $sessionId);

            // Save AI response message
            $systemMessage = Message::create([
                'content' => $aiResponse,
                'type' => 'system',
                'session_id' => $sessionId,
            ]);

            return response()->json([
                'user_message' => [
                    'id' => $userMessage->_id,
                    'content' => $userMessage->content,
                    'type' => $userMessage->type,
                ],
                'system_message' => [
                    'id' => $systemMessage->_id,
                    'content' => $systemMessage->content,
                    'type' => $systemMessage->type,
                ],
                'session_id' => $sessionId,
            ]);
        } catch (\Exception $e) {
            Log::error('Ollama API error: '.$e->getMessage());

            // Save error message
            $errorMessage = Message::create([
                'content' => 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
                'type' => 'system',
                'session_id' => $sessionId,
            ]);

            return response()->json([
                'user_message' => [
                    'id' => $userMessage->_id,
                    'content' => $userMessage->content,
                    'type' => $userMessage->type,
                ],
                'system_message' => [
                    'id' => $errorMessage->_id,
                    'content' => $errorMessage->content,
                    'type' => $errorMessage->type,
                ],
                'session_id' => $sessionId,
                'error' => true,
            ], 500);
        }
    }

    /**
     * Get response from Ollama model
     */
    private function getOllamaResponse(string $userMessage, string $sessionId): string
    {
        // Get conversation history for context
        $conversationHistory = $this->getConversationHistory($sessionId);
        // Retrieve relevant CID-10 context using RAG
        $relevantCodes = $this->ragService->searchRelevantCodes($userMessage);
        $ragContext = $this->ragService->formatContextForPrompt($relevantCodes);
        // Build the prompt with conversation and RAG context
        $prompt = $this->buildPrompt($userMessage, $conversationHistory, $ragContext);
        // Call Ollama API
        $response = Http::timeout(100)->post(self::OLLAMA_API_URL, [
            'model' => self::OLLAMA_MODEL,
            'prompt' => $prompt,
            'stream' => false,
        ]);

        if (! $response->successful()) {
            throw new \Exception('Ollama API request failed: '.$response->status());
        }

        $responseData = $response->json();

        if (! isset($responseData['response'])) {
            throw new \Exception('Invalid response format from Ollama');
        }

        return trim($responseData['response']);
    }

    /**
     * Get conversation history from database
     */
    private function getConversationHistory(string $sessionId, int $limit = 10): array
    {
        return Message::where('session_id', $sessionId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->reverse()
            ->map(function ($message) {
                return [
                    'role' => $message->type === 'user' ? 'user' : 'assistant',
                    'content' => $message->content,
                ];
            })
            ->toArray();
    }

    /**
     * Build prompt with conversation context and retrieved CID-10 knowledge (RAG)
     */
    private function buildPrompt(string $userMessage, array $conversationHistory, ?string $ragContext = null): string
    {
        $systemPrompt = 'Você é um assistente especializado em questões relacionadas ao INSS (Instituto Nacional do Seguro Social) brasileiro. 
            Seu papel é ajudar os usuários com informações sobre benefícios, aposentadorias, CID-10, documentação necessária e processos relacionados ao INSS. Forneça respostas claras, precisas e em português do Brasil.
            Você nunca deve responder perguntas não relacionadas ao INSS, mas sempre retorne que sua especialidade é o INSS.
            Lembre-se de manter um tom profissional e empático ao lidar com as dúvidas dos usuários sobre o INSS.
            Você poderá recomendar que o usuário consulte um especialista humano quando necessário.
        ';

        $prompt = $systemPrompt."\n\n";

        // Add RAG context when available
        if (! empty($ragContext)) {
            $prompt .= $ragContext."\n\n";
        }

        // Add conversation history
        if (! empty($conversationHistory)) {
            foreach ($conversationHistory as $message) {
                $role = $message['role'] === 'user' ? 'Usuário' : 'Assistente';
                $prompt .= "{$role}: {$message['content']}\n\n";
            }
        }

        // Add current user message
        $prompt .= "Usuário: {$userMessage}\n\nAssistente:";

        return $prompt;
    }

    public function index(Request $request)
    {
        $sessionId = $request->get('session_id', $request->session()->getId());

        $messages = Message::where('session_id', $sessionId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->_id,
                    'content' => $message->content,
                    'type' => $message->type,
                ];
            });

        return response()->json([
            'messages' => $messages,
            'session_id' => $sessionId,
        ]);
    }
}
