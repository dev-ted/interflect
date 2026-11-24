"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@ui-sdk/react/popover";
import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from "@ui-sdk/react/number-input";
import {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  DatePicker,
  DatePickerContent,
  DatePickerInput,
  DatePickerTrigger,
} from "@ui-sdk/react/date-picker";
import { toast } from "@ui-sdk/react/toast";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flame,
  Minus,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Chart, tooltipStyle, type ChartTokens } from "@/components/charts/Chart";
import { EmptyState } from "@/components/app/states";

/* ── Shared bits ──────────────────────────────────────────────────────── */

export function Widget({
  title,
  action,
  className = "",
  children,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className={`card flex min-w-0 flex-col p-5 sm:p-6 ${className}`}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {action}
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}

/** Counts up once when a value first arrives. Skipped under reduced motion. */
function useCountUp(target: number) {
  const [shown, setShown] = useState(target);
  const done = useRef(false);
  useEffect(() => {
    if (done.current || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(target);
      return;
    }
    done.current = true;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 400);
      setShown(Math.round(target * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return shown;
}

const fmtDay = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export const fmtMinutes = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);

/** A tiny trend line. Plain SVG: four of these per page don't need a chart engine. */
function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  const w = 96;
  const h = 28;
  const pts = values
    .map((v, i) => `${(i / Math.max(1, values.length - 1)) * w},${h - 2 - (v / max) * (h - 4)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-24" aria-hidden="true" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Delta({ value, previous, suffix = "" }: { value: number | null; previous: number | null; suffix?: string }) {
  if (value === null || previous === null) return <span className="text-xs text-mist">No earlier data</span>;
  const diff = value - previous;
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-mist">
        <Minus className="h-3 w-3" aria-hidden="true" />
        Same as before
      </span>
    );
  }
  const up = diff > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${up ? "text-accent-ink" : "text-coral"}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {up ? "+" : ""}
      {diff}
      {suffix} vs previous period
    </span>
  );
}

/* ── KPI cards ────────────────────────────────────────────────────────── */

export function KpiCard({
  label,
  value,
  display,
  trend,
  footer,
}: {
  label: string;
  value: number;
  display?: (n: number) => string;
  trend?: number[];
  footer: ReactNode;
}) {
  const n = useCountUp(value);
  return (
    <div className="card flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-mist">{label}</p>
        {trend && <Sparkline values={trend} />}
      </div>
      <p className="text-[2rem] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums">
        {display ? display(n) : n}
      </p>
      {footer}
    </div>
  );
}

export { Delta };

/* ── Weekly goal ─────────────────────────────────────────────────────── */

export function GoalRing({ done, goal }: { done: number; goal: number }) {
  const update = useMutation(api.insights.updateMySettings);
  const [draft, setDraft] = useState(goal);
  const [open, setOpen] = useState(false);
  const r = 52;
  const c = 2 * Math.PI * r;
  const share = Math.min(1, done / goal);
  const met = done >= goal;
  // Celebrate reaching the goal while the page is open, never on load: compare with the last render.
  const [prevMet, setPrevMet] = useState(met);
  const [celebrations, setCelebrations] = useState(0);
  if (met !== prevMet) {
    setPrevMet(met);
    if (met) setCelebrations((n) => n + 1);
  }

  const save = async () => {
    try {
      await update({ weeklyGoal: draft });
      setOpen(false);
      toast.success(`Weekly goal set to ${draft} lesson${draft === 1 ? "" : "s"}.`);
    } catch {
      toast.error("Couldn’t save your goal. Try again.");
    }
  };

  return (
    <Widget
      title="This week"
      action={
        <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(goal); }}>
          <PopoverTrigger className="btn btn-ghost btn-sm" aria-label="Edit weekly goal">
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Goal
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="end"
            sideOffset={8}
            className="card z-50 w-64 origin-(--transform-origin) p-4 transition-[opacity,scale] duration-150 ease-(--ease-out) data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:data-starting-style:scale-100"
          >
            <PopoverTitle className="text-sm font-semibold text-ink">Weekly goal</PopoverTitle>
            <p className="mt-1 text-xs text-mist">How many lessons do you want to finish each week?</p>
            <NumberInput value={draft} onValueChange={(v) => setDraft(Number(v) || 1)} min={1} max={14} className="mt-3">
              <NumberInputGroup className="flex items-center gap-2">
                <NumberInputDecrement aria-label="Fewer lessons" className="btn btn-secondary btn-icon btn-sm w-8">
                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                </NumberInputDecrement>
                <NumberInputControl aria-label="Lessons per week" className="field h-8 w-16 text-center tabular-nums" />
                <NumberInputIncrement aria-label="More lessons" className="btn btn-secondary btn-icon btn-sm w-8">
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                </NumberInputIncrement>
              </NumberInputGroup>
            </NumberInput>
            <button type="button" onClick={save} className="btn btn-primary btn-sm mt-4 w-full">
              Save goal
            </button>
          </PopoverContent>
        </Popover>
      }
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="60" cy="60" r={r} fill="none" stroke="var(--subtle)" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - share)}
              className="transition-[stroke-dashoffset] duration-700 ease-(--ease-out) motion-reduce:transition-none"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p
                key={celebrations}
                className={`text-3xl font-semibold tracking-[-0.03em] text-ink tabular-nums ${celebrations ? "goal-pop" : ""}`}
              >
                {done}
                <span className="text-lg text-mist">/{goal}</span>
              </p>
              <p className="text-xs text-mist">lessons</p>
            </div>
          </div>
        </div>
        <p className={`text-sm transition-colors duration-200 ${met ? "font-medium text-accent-ink" : "text-mist"}`} aria-live="polite">
          {met ? "Goal met. Nice work." : `${goal - done} more to reach your goal.`}
        </p>
      </div>
    </Widget>
  );
}

export function StreakCard({ current, longest, activeToday }: { current: number; longest: number; activeToday: boolean }) {
  const n = useCountUp(current);
  return (
    <div className="card flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-mist">Streak</p>
        <Flame className={`h-5 w-5 ${current > 0 ? "text-coral" : "text-mist"}`} aria-hidden="true" />
      </div>
      <p className="text-[2rem] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums">
        {n}
        <span className="ml-1 text-base font-normal text-mist">day{current === 1 ? "" : "s"}</span>
      </p>
      <p className="text-xs text-mist">
        {current > 0 && !activeToday ? "Learn today to keep it going. " : ""}Longest: {longest} days
      </p>
    </div>
  );
}

/* ── Charts ───────────────────────────────────────────────────────────── */

type Day = { date: string; lessons: number; quizzes: number; minutes: number };

export function ActivityChart({ series }: { series: Day[] }) {
  const total = series.reduce((n, d) => n + d.lessons + d.quizzes, 0);
  if (total === 0) {
    return <EmptyState title="No activity in this period" body="Finish a lesson or take a quiz and it shows up here." action={{ label: "Browse courses", href: "/courses" }} />;
  }
  const option = (t: ChartTokens) => ({
    grid: { left: 28, right: 8, top: 28, bottom: 24 },
    legend: { top: 0, right: 0, itemWidth: 10, itemHeight: 10, icon: "roundRect", textStyle: { color: t.mist, fontFamily: t.font, fontSize: 12 } },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow", shadowStyle: { color: t.subtle } }, ...tooltipStyle(t) },
    xAxis: {
      type: "category",
      data: series.map((d) => fmtDay(d.date)),
      axisLine: { lineStyle: { color: t.line } },
      axisTick: { show: false },
      axisLabel: { color: t.mist, fontFamily: t.font, fontSize: 11, hideOverlap: true },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      splitLine: { lineStyle: { color: t.line, type: "dashed" } },
      axisLabel: { color: t.mist, fontFamily: t.font, fontSize: 11 },
    },
    series: [
      { name: "Lessons", type: "bar", stack: "a", data: series.map((d) => d.lessons), itemStyle: { color: t.accent, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 18 },
      { name: "Quizzes", type: "bar", stack: "a", data: series.map((d) => d.quizzes), itemStyle: { color: t.mist, opacity: 0.45, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 18 },
    ],
  });
  return (
    <Chart
      option={option}
      label="Lessons and quizzes per day"
      className="h-60"
      summary={`${series.reduce((n, d) => n + d.lessons, 0)} lessons and ${series.reduce((n, d) => n + d.quizzes, 0)} quizzes in this period.`}
    />
  );
}

export function QuizScoresChart({ scores }: { scores: { at: number; score: number; lesson: string }[] }) {
  if (scores.length === 0) {
    return <EmptyState title="No quizzes yet" body="Each lesson ends with a short quiz. Your scores appear here." />;
  }
  const option = (t: ChartTokens) => ({
    grid: { left: 32, right: 8, top: 12, bottom: 24 },
    tooltip: {
      trigger: "axis",
      ...tooltipStyle(t),
      formatter: (p: { dataIndex: number }[]) => {
        const s = scores[p[0].dataIndex];
        return `<b>${s.score}%</b><br/><span style="color:${t.mist}">${s.lesson}</span>`;
      },
    },
    xAxis: {
      type: "category",
      data: scores.map((s) => new Date(s.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })),
      axisLine: { lineStyle: { color: t.line } },
      axisTick: { show: false },
      axisLabel: { color: t.mist, fontFamily: t.font, fontSize: 11, hideOverlap: true },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      interval: 50,
      splitLine: { lineStyle: { color: t.line, type: "dashed" } },
      axisLabel: { color: t.mist, fontFamily: t.font, fontSize: 11, formatter: "{value}%" },
    },
    series: [
      {
        type: "line",
        smooth: false,
        data: scores.map((s) => s.score),
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: t.accent, width: 2 },
        itemStyle: { color: t.accent, borderColor: t.surface, borderWidth: 2 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: `${t.accent}40` },
              { offset: 1, color: `${t.accent}00` },
            ],
          },
        },
      },
    ],
  });
  const average = Math.round(scores.reduce((n, s) => n + s.score, 0) / scores.length);
  return <Chart option={option} label="Quiz scores over time" className="h-60" summary={`${scores.length} quizzes, average ${average}%.`} />;
}

export function LearningCalendar({ heatmap }: { heatmap: [string, number][] }) {
  const active = heatmap.filter(([, n]) => n > 0).length;
  const option = (t: ChartTokens) => ({
    tooltip: {
      ...tooltipStyle(t),
      formatter: (p: { value: [string, number] }) =>
        `${fmtDay(p.value[0])}<br/><b>${p.value[1]}</b> ${p.value[1] === 1 ? "activity" : "activities"}`,
    },
    visualMap: {
      show: false,
      type: "piecewise",
      pieces: [
        { value: 0, color: t.subtle },
        { min: 1, max: 1, color: `${t.accent}59` },
        { min: 2, max: 2, color: `${t.accent}99` },
        { min: 3, color: t.accent },
      ],
    },
    calendar: {
      range: [heatmap[0][0], heatmap[heatmap.length - 1][0]],
      top: 22,
      left: 30,
      right: 4,
      bottom: 4,
      cellSize: ["auto", 14],
      splitLine: { show: false },
      itemStyle: { borderWidth: 3, borderColor: t.surface, borderRadius: 3 },
      yearLabel: { show: false },
      dayLabel: { firstDay: 1, nameMap: ["S", "M", "T", "W", "T", "F", "S"], color: t.mist, fontFamily: t.font, fontSize: 10 },
      monthLabel: { color: t.mist, fontFamily: t.font, fontSize: 11 },
    },
    series: [{ type: "heatmap", coordinateSystem: "calendar", data: heatmap }],
  });
  return (
    <Chart
      option={option}
      label="Learning calendar for the last 26 weeks"
      className="h-[150px]"
      summary={`Active on ${active} of the last ${heatmap.length} days.`}
    />
  );
}

/* ── Tracked courses ─────────────────────────────────────────────────── */

type Tracked = {
  courseId: Id<"courses">;
  slug: string;
  title: string;
  thumbnailUrl: string;
  completedLessons: number;
  totalLessons: number;
  percent: number;
  targetDate: number | null;
  pace: "ahead" | "on-track" | "behind" | null;
};

const PACE = {
  ahead: { label: "Ahead", cls: "bg-accent/15 text-accent-ink" },
  "on-track": { label: "On track", cls: "bg-accent/15 text-accent-ink" },
  behind: { label: "Behind", cls: "bg-coral/15 text-coral" },
} as const;

const toIso = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function TargetDate({ courseId, value }: { courseId: Id<"courses">; value: number | null }) {
  const track = useMutation(api.insights.trackCourse);
  const set = async (iso: string | null) => {
    try {
      await track({ courseId, targetDate: iso ? new Date(`${iso}T23:59:59`).getTime() : null });
      toast.success(iso ? `Target set for ${fmtDay(iso)}.` : "Target date cleared.");
    } catch {
      toast.error("Couldn’t save the target date. Try again.");
    }
  };
  return (
    <DatePicker
      value={value ? toIso(value) : null}
      onValueChange={(v) => set(typeof v === "string" ? v : null)}
    >
      <div className="flex items-center gap-1">
        <DatePickerInput aria-label="Target date" className="sr-only" />
        <DatePickerTrigger className="btn btn-ghost btn-sm" aria-label={value ? "Change target date" : "Set target date"}>
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          {value ? `Due ${fmtDay(toIso(value))}` : "Set target"}
        </DatePickerTrigger>
      </div>
      <DatePickerContent className="card z-50 origin-(--transform-origin) p-3 transition-[opacity,scale] duration-150 ease-(--ease-out) data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:data-starting-style:scale-100">
        <div className="mb-2 flex items-center justify-between">
          <CalendarPrevious className="btn btn-ghost btn-icon btn-sm w-8" aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </CalendarPrevious>
          <CalendarHeading className="text-sm font-semibold text-ink" />
          <CalendarNext className="btn btn-ghost btn-icon btn-sm w-8" aria-label="Next month">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </CalendarNext>
        </div>
        <CalendarGrid className="text-sm">
          <CalendarWeekdays>{(i) => <CalendarWeekday index={i} className="h-8 w-9 text-xs font-medium text-mist" />}</CalendarWeekdays>
          <CalendarWeeks>
            {(cell) => (
              <CalendarDay
                value={cell.date}
                className="h-9 w-9 cursor-pointer rounded-full text-ink transition-colors duration-100 hover:bg-subtle data-disabled:cursor-not-allowed data-disabled:text-mist/40 data-outside-month:text-mist/50 data-selected:bg-primary data-selected:text-on-primary data-today:font-semibold"
              />
            )}
          </CalendarWeeks>
        </CalendarGrid>
      </DatePickerContent>
    </DatePicker>
  );
}

export function TrackedCourses({ tracked }: { tracked: Tracked[] }) {
  const untrack = useMutation(api.insights.untrackCourse);
  if (tracked.length === 0) {
    return (
      <EmptyState
        title="Nothing tracked yet"
        body="Track a course to pin it here, set a finish date and see whether you’re on pace."
        action={{ label: "Find a course", href: "/courses" }}
      />
    );
  }
  return (
    <ul className="divide-y divide-line">
      {tracked.map((t) => (
        <li key={t.courseId} className="flex gap-4 py-4 first:pt-0 last:pb-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.thumbnailUrl} alt="" className="hidden h-16 w-24 shrink-0 rounded-[8px] border border-line object-cover sm:block" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/courses/${t.slug}`} className="truncate font-medium text-ink hover:underline">
                {t.title}
              </Link>
              {t.pace && <span className={`chip h-5 ${PACE[t.pace].cls}`}>{PACE[t.pace].label}</span>}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-subtle">
                <div className="h-full rounded-full bg-accent transition-[width] duration-500 ease-(--ease-out)" style={{ width: `${t.percent}%` }} />
              </div>
              <span className="text-xs text-mist tabular-nums">
                {t.completedLessons}/{t.totalLessons}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <TargetDate courseId={t.courseId} value={t.targetDate} />
              <button
                type="button"
                onClick={() => untrack({ courseId: t.courseId }).catch(() => toast.error("Couldn’t untrack. Try again."))}
                className="btn btn-ghost btn-sm text-mist"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Untrack
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
