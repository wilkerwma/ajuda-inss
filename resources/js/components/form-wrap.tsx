import { useEffect, useState } from 'react';
import MessageList, { type Message } from './message-list';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function FormWrap() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            content:
                'Como podemos te ajudar? Pode começar descrevendo sua condição ou nos provendo o código CID.',
            type: 'system',
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [sessionId, setSessionId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Load existing messages on mount
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const response = await fetch('/messages');
                const { messages: loadedMessages, session_id } =
                    await response.json();

                setSessionId(session_id);

                if (loadedMessages.length > 0) {
                    setMessages(loadedMessages);
                }
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        };

        loadMessages();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (inputValue.trim() && !isLoading) {
            setIsLoading(true);
            const userMessageContent = inputValue;
            setInputValue('');

            try {
                const response = await fetch('/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        content: userMessageContent,
                        session_id: sessionId,
                    }),
                });

                const data = await response.json();
                const {
                    user_message,
                    system_message,
                    session_id: newSessionId,
                } = data;

                // Update session ID if it changed
                if (newSessionId !== sessionId) {
                    setSessionId(newSessionId);
                }

                // Add both user and system messages to the list
                setMessages((prev) => [...prev, user_message, system_message]);
            } catch (error) {
                console.error('Error sending message:', error);
                // Add error message
                const errorMessage: Message = {
                    id: messages.length + 2,
                    content:
                        'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
                    type: 'system',
                };
                setMessages((prev) => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="mx-auto w-full max-w-4xl px-6 pb-12">
            <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                <MessageList messages={messages} />

                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 bg-white dark:bg-[#161615] dark:text-white"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        className="bg-[#f53003] text-white hover:bg-[#d42a02] dark:bg-[#FF4433] dark:hover:bg-[#e63d2e]"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Enviando...' : 'Enviar'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
