"use client";

import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return extractText(props?.children);
  }
  return "";
}

function CodeBlock({
  children,
  language,
}: {
  children: ReactNode;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = extractText(children).replace(/\n$/, "");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable in insecure context
    }
  }

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-zinc-800 bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-zinc-800/90 bg-zinc-900/90 px-4 py-2 text-xs text-zinc-400">
        <span className="font-mono uppercase">{language || "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code block"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="!my-0 !rounded-none !border-0">{children}</pre>
    </div>
  );
}

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="lesson-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre({ children }) {
            let language: string | undefined;
            if (
              children &&
              typeof children === "object" &&
              "props" in children
            ) {
              const className = (
                children as { props?: { className?: string } }
              ).props?.className;
              const match = className?.match(/language-([\w-]+)/);
              if (match) language = match[1];
            }
            return <CodeBlock language={language}>{children}</CodeBlock>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
