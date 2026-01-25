import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
    content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
            <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="mt-0 mb-2 text-lg font-bold">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="mt-3 mb-2 text-base font-bold">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="mt-2 mb-1 text-sm font-bold">
                            {children}
                        </h3>
                    ),
                    p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                        <ul className="mb-3 ml-5 list-disc space-y-1">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="mb-3 ml-5 list-decimal space-y-1">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => <li className="mb-0">{children}</li>,
                    strong: ({ children }) => (
                        <strong className="font-bold">{children}</strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic">{children}</em>
                    ),
                    code: ({ children }) => (
                        <code className="rounded bg-neutral-200 px-1 py-0.5 text-xs dark:bg-neutral-700">
                            {children}
                        </code>
                    ),
                    pre: ({ children }) => (
                        <pre className="mb-2 overflow-x-auto rounded-md bg-neutral-200 p-3 dark:bg-neutral-800">
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
