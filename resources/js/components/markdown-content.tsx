import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
    content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
    return (
        <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
            <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2">{children}</h3>,
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc ml-5 mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-5 mb-3 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="mb-0">{children}</li>,
                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children }) => (
                    <code className="bg-neutral-200 dark:bg-neutral-700 px-1 py-0.5 rounded text-xs">
                        {children}
                    </code>
                ),
                pre: ({ children }) => (
                    <pre className="bg-neutral-200 dark:bg-neutral-800 p-3 rounded-md overflow-x-auto mb-2">
                        {children}
                    </pre>
                ),
                }}
            >
                {content}
            </Markdown>
        </div>
    );
}
