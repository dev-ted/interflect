"use client";

import { useState, type ReactNode } from "react";
import hljs from "highlight.js/lib/core";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import { Check, Copy } from "lucide-react";

type LanguageFn = Parameters<typeof hljs.registerLanguage>[1];

if (!hljs.getLanguage("css")) hljs.registerLanguage("css", css as LanguageFn);
if (!hljs.getLanguage("xml")) hljs.registerLanguage("xml", xml as LanguageFn);

const HIGHLIGHT_AS: Record<string, string> = {
  html: "xml",
  css: "css",
};

export function highlightSource(language: string, source: string): string {
  const name = HIGHLIGHT_AS[language] ?? language;
  if (!source.trim() || !hljs.getLanguage(name)) return "";
  return hljs.highlight(source, { language: name }).value;
}

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return extractText(props?.children);
  }
  return "";
}

export function CodeBlock({
  children,
  language,
  source,
  highlighted,
  embedded = false,
}: {
  children?: ReactNode;
  language?: string;
  source?: string;
  highlighted?: string;
  embedded?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const text = (source ?? extractText(children)).replace(/\n$/, "");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable in an insecure context.
    }
  }

  return (
    <div
      className={`night overflow-hidden rounded-xl border border-line ${embedded ? "" : "my-5"}`}
    >
      <div className="flex items-center justify-between border-b border-line py-1 pr-1 pl-4">
        <span className="text-xs text-mist">{language || "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="btn btn-ghost btn-sm text-mist"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-sage" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="!my-0 !rounded-none !border-0">
        {highlighted ? (
          <code
            className={`hljs${language ? ` language-${language}` : ""}`}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        ) : (
          children
        )}
      </pre>
    </div>
  );
}
