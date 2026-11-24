"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Play } from "lucide-react";
import { Slider, SliderControl, SliderThumb, SliderTrack } from "@ui-sdk/react/slider";
import { GridBeams } from "./GridBeams";

// Rendered in both the before and after layers with the same timing, so a streak crosses the seam unbroken.
const PANEL_ROWS: [number, number, number][] = [[3, 6, 0.6], [7, 7, 4.1], [11, 6.5, 2.0], [15, 7.5, 3.4]];
const PANEL_COLS: [number, number, number][] = [[2, 6.5, 3.0], [5, 7, 2.2], [10, 6, 0.3], [14, 6.5, 4.8], [17, 7.5, 1.4]];

/** A redline: the measured gap between two blocks, labelled like a design spec. */
function Gap({ size, label = true }: { size: 8 | 16 | 24; label?: boolean }) {
  return (
    <div className="relative" style={{ height: size }} aria-hidden="true">
      {label && (
        <span className="absolute inset-y-0 -left-4 flex items-center gap-1">
          <span className="h-full w-px bg-coral/70" />
          <span className="font-mono text-[9px] leading-none text-coral">{size}</span>
        </span>
      )}
    </div>
  );
}

function Thumb({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`relative grid aspect-video place-items-center overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

/** The same lesson card, built without a system: mixed spacing, weak contrast, competing weights. */
function BeforeCard() {
  return (
    <div className="flex h-full flex-col rounded-sm border-2 border-neutral-300 bg-neutral-100 p-3 text-center dark:border-neutral-600 dark:bg-neutral-800">
      <Thumb className="bg-neutral-300 dark:bg-neutral-700">
        <span className="rounded-sm bg-red-500 px-2 py-1 text-[10px] font-black text-white">PLAY ▶</span>
      </Thumb>
      <p className="mt-1 text-left text-[9px] tracking-[0.2em] text-neutral-400 uppercase">Lesson 3 of 8</p>
      <p className="mt-4 text-base font-black text-neutral-500">Spacing That Feels Intentional!!</p>
      <p className="text-[11px] leading-tight text-neutral-400">
        use one scale for every gap so the layout reads as one system and not a pile of guesses
      </p>
      <div className="mt-2 h-3 bg-red-200">
        <div className="h-full w-3/5 bg-green-500" />
      </div>
      <div className="mt-auto flex items-end justify-between pt-3">
        <span className="text-xs font-bold text-red-500">12 MIN</span>
        <span className="rounded-sm bg-violet-500 px-2 py-0.5 text-[11px] font-bold text-white underline">
          CONTINUE &gt;&gt;
        </span>
      </div>
    </div>
  );
}

/** The refined card: one spacing scale, clear hierarchy, one accent. Redlines show the system. */
function AfterCard() {
  return (
    <div className="card relative w-full p-6">
      <span className="absolute top-1/2 left-0 flex -translate-y-1/2 flex-col items-center gap-0.5" aria-hidden="true">
        <span className="font-mono text-[9px] leading-none text-coral">24</span>
        <span className="h-px w-6 bg-coral/70" />
      </span>
      <Thumb className="rounded-[10px] bg-subtle">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-surface shadow-card">
          <Play className="ml-0.5 h-4 w-4 fill-ink text-ink" />
        </span>
      </Thumb>
      <Gap size={16} />
      <p className="text-xs text-mist">Lesson 3 of 8</p>
      <Gap size={8} label={false} />
      <p className="text-lg leading-snug font-semibold text-ink">Spacing that feels intentional</p>
      <Gap size={8} />
      <p className="text-sm leading-relaxed text-mist">
        Use one scale for every gap, so the layout reads as a single system.
      </p>
      <Gap size={24} />
      <div className="h-1.5 rounded-full bg-subtle">
        <div className="h-full w-3/5 rounded-full bg-accent" />
      </div>
      <Gap size={16} />
      <div className="flex items-center justify-between">
        <span className="text-sm text-mist">12 min left</span>
        <span className="btn btn-primary btn-sm">Continue</span>
      </div>
    </div>
  );
}

/**
 * Before/after critique: drag (or use the arrow keys) to compare the same card with and without design decisions.
 * The handle sweeps once on load to show it can move; after that it only moves for the user.
 */
export function CritiqueSlider() {
  const [split, setSplit] = useState(50);
  const touched = useRef(false);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const from = 82;
    const to = 50;
    const duration = 900;
    // Same curve as --ease-in-out.
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (touched.current) return;
      start ||= now;
      const t = Math.min(1, (now - start) / duration);
      setSplit(from + (to - from) * ease(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    const delay = setTimeout(() => (raf = requestAnimationFrame(tick)), 350);
    return () => {
      clearTimeout(delay);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <figure className="w-full">
      <div className="bg-grid relative aspect-[5/6] overflow-hidden rounded-[20px] border border-line bg-subtle select-none sm:aspect-square">
        <GridBeams rows={PANEL_ROWS} cols={PANEL_COLS} />
        <div className="absolute inset-0 grid place-items-center">
          {/* An invisible copy of the refined card sizes the rough one, so both line up at the seam. */}
          <div className="grid w-[min(340px,84%)]">
            <div className="invisible [grid-area:1/1]" aria-hidden="true">
              <AfterCard />
            </div>
            <div className="[grid-area:1/1]">
              <BeforeCard />
            </div>
          </div>
        </div>
        <div
          className="absolute inset-0 grid place-items-center bg-subtle"
          style={{ clipPath: `inset(0 0 0 ${split}%)` }}
        >
          <div className="bg-grid absolute inset-0" aria-hidden="true" />
          <GridBeams rows={PANEL_ROWS} cols={PANEL_COLS} />
          <div className="relative w-[min(340px,84%)]">
            <AfterCard />
          </div>
        </div>

        <span className="chip absolute top-3 left-3 bg-surface">Before</span>
        <span className="chip absolute top-3 right-3 bg-surface text-ink">After</span>

        <Slider
          value={split}
          onValueChange={(v) => {
            touched.current = true;
            setSplit(v as number);
          }}
          min={0}
          max={100}
          step={1}
          className="absolute inset-0"
        >
          <SliderControl className="absolute inset-0 cursor-ew-resize touch-pan-y">
            <SliderTrack className="h-full w-full">
              <SliderThumb
                aria-label="Compare before and after"
                className="group absolute top-0 h-full w-10 -translate-x-1/2 cursor-ew-resize outline-none"
              >
                <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-ink" />
                <span className="absolute top-1/2 left-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-ink shadow-card transition-transform duration-150 ease-(--ease-out) group-active:scale-95 group-has-[:focus-visible]:outline-2 group-has-[:focus-visible]:outline-offset-2 group-has-[:focus-visible]:outline-accent">
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M6 4 2 8l4 4M10 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </SliderThumb>
            </SliderTrack>
          </SliderControl>
        </Slider>
      </div>
      <figcaption className="mt-3 text-sm text-mist">
        Drag to compare. Same content, different decisions.
      </figcaption>
    </figure>
  );
}
