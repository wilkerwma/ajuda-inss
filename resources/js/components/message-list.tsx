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
        <div className="mb-4 flex max-h-96 flex-col gap-4 overflow-y-auto">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-[80%] rounded-lg px-4 py-3 ${
                            message.type === 'system'
                                ? 'bg-[#f5f5f5] text-[#1b1b18] dark:bg-[#2a2a2a] dark:text-[#EDEDEC]'
                                : 'bg-[#f53003] text-white dark:bg-[#FF4433]'
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
