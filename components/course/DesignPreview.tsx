"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildSrcDoc,
  parsePreviewMeta,
  presentHtml,
  showsKeyboardFocus,
  splitPreview,
} from "@/lib/design-preview";
import { CodeBlock, highlightSource } from "./CodeBlock";

export function DesignPreview({
  source,
  meta,
}: {
  source: string;
  meta?: string;
}) {
  const { label, wide } = parsePreviewMeta(meta);
  const { html, css } = splitPreview(source);
  const displayedHtml = presentHtml(html);
  const focused = showsKeyboardFocus(html);
  const srcDoc = buildSrcDoc(html, css);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(120);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const doc = frame.contentDocument;
      if (!doc) return;
      const next = Math.max(
        doc.documentElement?.scrollHeight ?? 0,
        doc.body?.scrollHeight ?? 0,
      );
      if (next > 0) setHeight(next);
    };

    frame.addEventListener("load", measure);
    measure();
    return () => frame.removeEventListener("load", measure);
  }, [srcDoc]);

  return (
    <figure
      className="design-preview my-6"
      data-wide={wide ? "true" : undefined}
    >
      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-2">
          <figcaption className="text-sm font-semibold text-ink">
            {label}
          </figcaption>
          <span className="text-xs text-mist">
            {focused ? "Keyboard focus" : "Preview"}
          </span>
        </div>
        <iframe
          ref={frameRef}
          title={`${label} preview`}
          // Same origin so the stage can be measured. Scripts and top navigation stay off.
          sandbox="allow-same-origin"
          referrerPolicy="no-referrer"
          srcDoc={srcDoc}
          tabIndex={-1}
          style={{ height }}
          className="block w-full border-0 bg-white"
        />
      </div>
      <div className="mt-3 space-y-3">
        {displayedHtml ? (
          <CodeBlock
            embedded
            language="html"
            source={displayedHtml}
            highlighted={highlightSource("html", displayedHtml)}
          />
        ) : null}
        {css ? (
          <CodeBlock
            embedded
            language="css"
            source={css}
            highlighted={highlightSource("css", css)}
          />
        ) : null}
      </div>
    </figure>
  );
}
