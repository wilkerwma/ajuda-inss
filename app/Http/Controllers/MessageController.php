<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:5000',
            'session_id' => 'nullable|string',
        ]);

        // Generate session ID if not provided
        $sessionId = $validated['session_id'] ?? $request->session()->getId();

        // Save user message
        $userMessage = Message::create([
            'content' => $validated['content'],
            'type' => 'user',
            'session_id' => $sessionId,
        ]);

        // Create a system response (mock for now)
        $systemMessage = Message::create([
            'content' => 'Obrigado pela sua mensagem. Estou processando sua solicitação...',
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
