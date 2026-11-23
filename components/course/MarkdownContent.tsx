"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { CodeBlock } from "./CodeBlock";
import { DesignPreview } from "./DesignPreview";

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  data?: { meta?: unknown };
  properties?: { className?: string | string[] };
  children?: HastNode[];
};

function codeElement(node: unknown): HastNode | undefined {
  if (!node || typeof node !== "object" || !("children" in node)) return;
  const children = (node as { children?: unknown }).children;
  if (!Array.isArray(children)) return;
  return children.find(
    (child): child is HastNode =>
      Boolean(child) &&
      typeof child === "object" &&
      "tagName" in child &&
      (child as { tagName?: string }).tagName === "code",
  );
}

function plainText(node: HastNode | undefined): string {
  if (!node) return "";
  if (node.type === "text" && typeof node.value === "string") return node.value;
  return (node.children ?? []).map(plainText).join("");
}

function fenceInfo(node: unknown): { language?: string; meta?: string; source: string } {
  const code = codeElement(node);
  const className = code?.properties?.className;
  const classes = Array.isArray(className)
    ? className
    : className
      ? [className]
      : [];
  const match = classes.join(" ").match(/language-([\w-]+)/);
  const meta = typeof code?.data?.meta === "string" ? code.data.meta : undefined;
  return {
    language: match?.[1],
    meta,
    source: plainText(code).replace(/\n$/, ""),
  };
}

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="lesson-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { plainText: ["preview"] }]]}
        components={{
          pre({ node, children }) {
            const fence = fenceInfo(node);
            if (fence.language === "preview") {
              return <DesignPreview source={fence.source} meta={fence.meta} />;
            }
            return <CodeBlock language={fence.language}>{children}</CodeBlock>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
