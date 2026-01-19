import { useState, useEffect } from 'react';
import MessageList, { type Message } from './message-list';
import { Button } from './ui/button';
import { Input } from './ui/input';
import axios from 'axios';

export default function FormWrap() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            content: 'Como podemos te ajudar? Pode começar descrevendo sua condição ou nos provendo o código CID.',
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
                const response = await axios.get('/messages');
                const { messages: loadedMessages, session_id } = response.data;
                
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
                const response = await axios.post('/messages', {
                    content: userMessageContent,
                    session_id: sessionId,
                });

                const { user_message, system_message, session_id: newSessionId } = response.data;
                
                // Update session ID if it changed
                if (newSessionId !== sessionId) {
                    setSessionId(newSessionId);
                }

                // Add both user and system messages to the list
                setMessages(prev => [
                    ...prev,
                    user_message,
                    system_message,
                ]);
            } catch (error) {
                console.error('Error sending message:', error);
                // Add message locally on error
                const newMessage: Message = {
                    id: messages.length + 1,
                    content: userMessageContent,
                    type: 'user',
                };
                setMessages(prev => [...prev, newMessage]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-6 pb-12">
            <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                <MessageList messages={messages} />
                
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button 
                        type="submit" 
                        className="bg-[#f53003] hover:bg-[#d42a02] dark:bg-[#FF4433] dark:hover:bg-[#e63d2e]"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Enviando...' : 'Enviar'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
