"use client";

import { useEffect, useState, type RefObject } from "react";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible";
import { Check, ChevronDown, Copy } from "lucide-react";

interface TranscriptParagraph {
  start: number;
  text: string;
}

function clock(seconds: number) {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Read, search, copy and jump through what's said in the lesson video. */
export function LessonTranscript({
  paragraphs,
  videoRef,
}: {
  paragraphs: TranscriptParagraph[];
  videoRef: RefObject<HTMLVideoElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  const [current, setCurrent] = useState(-1);

  // Mark the paragraph being spoken while the video plays.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const update = () => {
      const t = video.currentTime;
      let index = -1;
      for (let i = 0; i < paragraphs.length; i++) if (paragraphs[i].start <= t) index = i;
      setCurrent(video.paused && t === 0 ? -1 : index);
    };
    video.addEventListener("timeupdate", update);
    video.addEventListener("seeked", update);
    return () => {
      video.removeEventListener("timeupdate", update);
      video.removeEventListener("seeked", update);
    };
  }, [paragraphs, videoRef]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(paragraphs.map((p) => p.text).join("\n\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable in an insecure context.
    }
  }

  function playFrom(seconds: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = seconds;
    void video.play().catch(() => {});
    video.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  return (
    <Collapsible className="card mt-6 max-w-[70ch] overflow-hidden">
      <CollapsibleTrigger className="group flex w-full items-center gap-3 px-5 py-4 text-left transition-colors duration-150 hover:bg-subtle">
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">Transcript</span>
          <span className="block text-sm text-mist">Read or copy what&apos;s said in the video</span>
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-mist transition-transform duration-200 ease-(--ease-out) group-data-open:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsiblePanel
        hiddenUntilFound
        className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-(--ease-out) data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none"
      >
        <div className="border-t border-line">
          <div className="flex items-center justify-between gap-3 py-1.5 pr-2 pl-5">
            <span className="text-xs text-mist">Select a time to play from there</span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? "Transcript copied" : "Copy transcript"}
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
          <ol className="max-h-[28rem] space-y-1 overflow-y-auto overscroll-contain px-3 pb-4">
            {paragraphs.map((p, i) => (
              <li
                key={p.start}
                aria-current={i === current ? "true" : undefined}
                className="flex gap-3 rounded-lg border-l-2 border-transparent px-2 py-2 transition-colors duration-150 aria-[current]:border-primary aria-[current]:bg-subtle"
              >
                <button
                  type="button"
                  onClick={() => playFrom(p.start)}
                  aria-label={`Play from ${clock(p.start)}`}
                  className="mt-0.5 h-fit shrink-0 rounded-md px-1.5 py-0.5 font-mono text-xs text-mist tabular-nums transition-colors duration-150 hover:bg-line hover:text-ink"
                >
                  {clock(p.start)}
                </button>
                <p className="m-0 leading-relaxed text-ink">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </CollapsiblePanel>
    </Collapsible>
  );
}
