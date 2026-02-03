import { useEffect, useState } from 'react';
import MessageList, { type Message } from './message-list';
import { Button } from './ui/button';
import { Input } from './ui/input';

type FormWrapProps = {
    className?: string;
};

export default function FormWrap({ className = '' }: FormWrapProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            content:
                'Como podemos te ajudar? Pode começar descrevendo sua condição ou nos provendo o código CID.',
            type: 'system',
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Load existing messages on mount
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const response = await fetch('/messages');
                const { messages: loadedMessages } = await response.json();

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

            // Optimistically add the user message to the list before calling the backend
            setMessages((prev) => [
                ...prev,
                {
                    id: prev.length + 1,
                    content: userMessageContent,
                    type: 'user',
                },
            ]);

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
                    }),
                });

                const data = await response.json();
                const { system_message } = data;

                // Add only the system message since the user message was already added optimistically
                setMessages((prev) => [...prev, system_message]);
            } catch (error) {
                console.error('Error sending message:', error);
                // Add error message
                setMessages((prev) => [
                    ...prev,
                    {
                        id: prev.length + 1,
                        content:
                            'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
                        type: 'system',
                    },
                ]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div
            className={`mx-auto w-full max-w-4xl px-6 pb-12 ${className}`}
        >
            <div className="rounded-3xl border border-[#96b8ff]/50 bg-white/90 p-8 shadow-[0_20px_45px_rgba(8,49,102,0.08)] backdrop-blur dark:border-[#1b2b4f] dark:bg-[#050914] dark:shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
                <MessageList messages={messages} />

                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 rounded-full border border-[#96b8ff]/60 bg-white/80 px-5 text-[#04152f] shadow-inner shadow-white/20 placeholder:text-[#6c85b5] focus:border-[#4d79ff] focus:ring-[#4d79ff]/30 dark:border-[#223764] dark:bg-[#030712] dark:text-white dark:placeholder:text-[#8ea8db]"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        className="rounded-full bg-[#1f6aff] px-6 py-2 text-white shadow-lg shadow-[#1f6aff]/30 transition hover:bg-[#1551c8] dark:bg-[#4c8dff] dark:hover:bg-[#3a78e0]"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Enviando...' : 'Enviar'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
