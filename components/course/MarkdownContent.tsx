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
    <div className="my-5 overflow-hidden rounded-2xl border-2 border-[#18181B] bg-[#12121A] shadow-[4px_4px_0_0_#111116] dark:border-[#3A3A52] dark:shadow-[4px_4px_0_0_#000000]">
      <div className="flex items-center justify-between border-b-2 border-[#2A2A3B] bg-[#1B1B27] px-4 py-2 text-xs text-[#B4B4C6]">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5A36]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFB800]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#00B87C]" />
          <span className="ml-1.5 rounded-md bg-[#12121A] px-2 py-0.5 font-mono text-[11px] font-bold text-[#FFB800] uppercase">
            {language || "code"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code block"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#3A3A52] bg-[#12121A] px-2.5 py-1 text-xs font-bold text-[#FAFAF5] transition-colors hover:border-[#FFB800] hover:text-[#FFB800]"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#00B87C]" aria-hidden="true" />
              Copied!
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
