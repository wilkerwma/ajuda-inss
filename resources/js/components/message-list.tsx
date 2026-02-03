import MarkdownContent from './markdown-content';

type Message = {
    id: number;
    content: string;
    type: 'system' | 'user';
};

type MessageListProps = {
    messages: Message[];
};

export default function MessageList({ messages }: MessageListProps) {
    return (
        <div className="relative mb-6 flex max-h-96 flex-col gap-4 overflow-y-auto pr-2">
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/40 shadow-[inset_0_8px_40px_rgba(34,92,200,0.3)] dark:border-white/5 dark:shadow-[inset_0_8px_40px_rgba(0,0,0,0.45)]" />
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg shadow-black/5 transition-all duration-300 ${
                            message.type === 'system'
                                ? 'bg-white/90 text-[#0b1d3a] backdrop-blur dark:bg-[#0b1426] dark:text-[#f6f8ff]'
                                : 'bg-gradient-to-r from-[#5b79ff] to-[#81a7ff] text-white drop-shadow-xl dark:from-[#4c8dff] dark:to-[#78a8ff]'
                        }`}
                    >
                        {message.type === 'system' ? (
                            <MarkdownContent content={message.content} />
                        ) : (
                            <p className="text-sm leading-relaxed">
                                {message.content}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export type { Message };
