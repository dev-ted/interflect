"use client";

import { useState } from "react";
import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import { api } from "@/convex/_generated/api";
import { Chart, tooltipStyle, type ChartTokens } from "@/components/charts/Chart";
import { EmptyState, useClock, WidgetBoundary, WidgetSkeleton } from "@/components/app/states";
import { Delta, KpiCard, Widget } from "@/components/dashboard/widgets";

type Range = "7d" | "30d" | "90d";
const DAYS: Record<Range, number> = { "7d": 7, "30d": 30, "90d": 90 };

const fmtDay = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });

function OverviewSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-12" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <WidgetSkeleton key={i} lines={1} className="h-36 lg:col-span-3" />
      ))}
      <WidgetSkeleton className="h-80 lg:col-span-8" />
      <WidgetSkeleton className="h-80 lg:col-span-4" />
      <WidgetSkeleton className="h-64 lg:col-span-12" />
    </div>
  );
}

export function AdminOverview() {
  const [range, setRange] = useState<Range>("30d");
  const clock = useClock();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-mist">How learners are moving through your courses.</p>
        <SegmentedControl
          aria-label="Time range"
          value={range}
          onValueChange={(v) => setRange(v as Range)}
          className="relative inline-flex h-9 items-center rounded-full border border-line bg-subtle p-0.5"
        >
          <SegmentedControlIndicator className="absolute top-(--segmented-control-indicator-top) left-(--segmented-control-indicator-left) h-(--segmented-control-indicator-height) w-(--segmented-control-indicator-width) rounded-full bg-surface shadow-card transition-[left,width] duration-200 ease-(--ease-out) data-[activation-direction=none]:transition-none motion-reduce:transition-none" />
          {(["7d", "30d", "90d"] as Range[]).map((r) => (
            <SegmentedControlItem
              key={r}
              value={r}
              aria-label={`Last ${DAYS[r]} days`}
              className="relative z-10 inline-flex h-8 cursor-pointer items-center rounded-full px-3.5 text-sm font-medium text-mist transition-colors duration-150 data-checked:text-ink"
            >
              {r}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>
      <WidgetBoundary what="the admin overview">
        <OverviewBody clock={clock} days={DAYS[range]} />
      </WidgetBoundary>
    </div>
  );
}

function OverviewBody({ clock, days }: { clock: { now: number; tz: number } | null; days: number }) {
  // Wait for Convex to have the sign-in token, or the admin check rejects the request.
  const { isAuthenticated } = useConvexAuth();
  const data = useQuery(
    api.insights.getAdminInsights,
    clock && isAuthenticated ? { now: clock.now, tzOffsetMinutes: clock.tz, days } : "skip",
  );
  if (data === undefined) return <OverviewSkeleton />;

  const { kpis, series, coursePerformance, hardestLessons } = data;
  const hasActivity = series.some((d) => d.enrollments + d.completions > 0);

  const option = (t: ChartTokens) => ({
    grid: { left: 28, right: 8, top: 32, bottom: 24 },
    legend: { top: 0, right: 0, itemWidth: 12, itemHeight: 3, textStyle: { color: t.mist, fontFamily: t.font, fontSize: 12 } },
    tooltip: { trigger: "axis", ...tooltipStyle(t) },
    xAxis: {
      type: "category",
      boundaryGap: false,
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
      {
        name: "Lessons completed",
        type: "line",
        data: series.map((d) => d.completions),
        showSymbol: false,
        lineStyle: { color: t.accent, width: 2 },
        itemStyle: { color: t.accent },
        areaStyle: {
          color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${t.accent}33` }, { offset: 1, color: `${t.accent}00` }] },
        },
      },
      {
        name: "Enrollments",
        type: "line",
        data: series.map((d) => d.enrollments),
        showSymbol: false,
        lineStyle: { color: t.mist, width: 2, type: "dashed" },
        itemStyle: { color: t.mist },
      },
    ],
  });

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-4">
        <KpiCard
          label="Learners"
          value={kpis.learners.value}
          footer={<Delta value={kpis.learners.inRange} previous={kpis.learners.previous} suffix=" new" />}
        />
        <KpiCard
          label="Enrollments"
          value={kpis.enrollments.value}
          trend={series.map((d) => d.enrollments)}
          footer={<Delta value={kpis.enrollments.value} previous={kpis.enrollments.previous} />}
        />
        <KpiCard
          label="Lessons completed"
          value={kpis.completions.value}
          trend={series.map((d) => d.completions)}
          footer={<Delta value={kpis.completions.value} previous={kpis.completions.previous} />}
        />
        <KpiCard
          label="Quiz average"
          value={kpis.avgScore.value ?? 0}
          display={(n) => (kpis.avgScore.value === null ? "–" : `${n}%`)}
          footer={<Delta value={kpis.avgScore.value} previous={kpis.avgScore.previous} suffix="%" />}
        />
      </div>

      <Widget title="Enrollments and completions" className="lg:col-span-8">
        {hasActivity ? (
          <Chart
            option={option}
            label="Enrollments and lessons completed per day"
            className="h-64"
            summary={`${kpis.enrollments.value} enrollments and ${kpis.completions.value} lessons completed in this period.`}
          />
        ) : (
          <EmptyState title="No learner activity in this period" body="Try a longer range, or check back once learners enroll." />
        )}
      </Widget>

      <Widget title="Hardest lessons" className="lg:col-span-4">
        {hardestLessons.length === 0 ? (
          <EmptyState title="No quiz results yet" body="Lessons with the lowest quiz scores show up here." />
        ) : (
          <ol className="space-y-3">
            {hardestLessons.map((l) => (
              <li key={l.lessonId} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{l.title}</p>
                  <p className="truncate text-xs text-mist">
                    {l.courseTitle}, {l.attempts} attempt{l.attempts === 1 ? "" : "s"}
                  </p>
                </div>
                <span className={`chip h-6 shrink-0 tabular-nums ${l.avgScore < 60 ? "bg-coral/15 text-coral" : ""}`}>
                  {l.avgScore}%
                </span>
              </li>
            ))}
          </ol>
        )}
      </Widget>

      <Widget title="Course performance" className="lg:col-span-12">
        {coursePerformance.length === 0 ? (
          <EmptyState title="No courses yet" body="Create a course in the Courses tab to see how it performs." />
        ) : (
          <div className="-mx-5 overflow-x-auto sm:-mx-6">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-mist">
                  <th scope="col" className="px-5 pb-3 font-medium sm:px-6">Course</th>
                  <th scope="col" className="px-3 pb-3 text-right font-medium">Lessons</th>
                  <th scope="col" className="px-3 pb-3 text-right font-medium">Enrollments</th>
                  <th scope="col" className="px-3 pb-3 font-medium">Completion</th>
                  <th scope="col" className="px-5 pb-3 text-right font-medium sm:px-6">Quiz average</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {coursePerformance.map((c) => (
                  <tr key={c.courseId}>
                    <td className="px-5 py-3.5 sm:px-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${c.published ? "bg-success" : "bg-mist"}`}
                          aria-label={c.published ? "Published" : "Draft"}
                        />
                        <Link href={`/courses/${c.slug}`} className="truncate font-medium text-ink hover:underline">
                          {c.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-right text-mist tabular-nums">{c.lessons}</td>
                    <td className="px-3 py-3.5 text-right text-ink tabular-nums">{c.enrollments}</td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-subtle">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${c.completionRate}%` }} />
                        </div>
                        <span className="text-xs text-mist tabular-nums">{c.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums sm:px-6">
                      {c.avgScore === null ? <span className="text-mist">–</span> : `${c.avgScore}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Widget>
    </div>
  );
}
