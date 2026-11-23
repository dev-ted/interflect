"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated, useMutation, useQuery } from "convex/react";
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItemIndicator,
  MenuTrigger,
} from "@ui-sdk/react/menu";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import { toast } from "@ui-sdk/react/toast";
import { Check, Play, SlidersHorizontal } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { EmptyState, Skeleton, useClock, WidgetBoundary, WidgetSkeleton } from "@/components/app/states";
import {
  ActivityChart,
  Delta,
  fmtMinutes,
  GoalRing,
  KpiCard,
  LearningCalendar,
  QuizScoresChart,
  StreakCard,
  TrackedCourses,
  Widget,
} from "./widgets";
import { TrackButton } from "./TrackButton";

type Range = "7d" | "30d" | "90d";
const DAYS: Record<Range, number> = { "7d": 7, "30d": 30, "90d": 90 };

const WIDGETS = [
  { id: "kpis", label: "Summary numbers" },
  { id: "goal", label: "Weekly goal" },
  { id: "activity", label: "Activity chart" },
  { id: "quizzes", label: "Quiz scores" },
  { id: "calendar", label: "Learning calendar" },
  { id: "tracked", label: "Tracked courses" },
] as const;

/** The grid's footprint while data loads, so nothing jumps when it arrives. */
function BodySkeleton() {
  return (
    <div aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <WidgetSkeleton key={i} lines={1} className="h-36" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <WidgetSkeleton className="h-56 lg:col-span-8" />
        <WidgetSkeleton className="h-56 lg:col-span-4" />
        <WidgetSkeleton className="h-80 lg:col-span-8" />
        <WidgetSkeleton className="h-80 lg:col-span-4" />
      </div>
    </div>
  );
}

/** Whole-page skeleton, used by the route's loading.tsx and while auth resolves. */
export function DashboardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-48 rounded-full" />
      </div>
      <div className="mt-8">
        <BodySkeleton />
      </div>
    </div>
  );
}

export function DashboardClient() {
  return (
    <>
      <AuthLoading>
        <DashboardSkeleton />
      </AuthLoading>
      <Unauthenticated>
        <div className="card mx-auto max-w-md p-8 text-center">
          <h1 className="text-2xl font-semibold tracking-[-0.03em]">Sign in to see your learning</h1>
          <p className="mt-2 text-sm text-mist">Your courses, progress, streak and quiz scores live here.</p>
          <SignInButton mode="modal">
            <button type="button" className="btn btn-primary mt-6">Sign in</button>
          </SignInButton>
        </div>
      </Unauthenticated>
      <Authenticated>
        <Dashboard />
      </Authenticated>
    </>
  );
}

function Dashboard() {
  const { user } = useUser();
  const settings = useQuery(api.insights.getMySettings, {});
  const updateSettings = useMutation(api.insights.updateMySettings);

  // Optimistic copies so the range and widget toggles respond instantly.
  const [range, setRange] = useState<Range | null>(null);
  const [hidden, setHidden] = useState<string[] | null>(null);
  const activeRange: Range = range ?? settings?.range ?? "30d";
  const hiddenWidgets = hidden ?? settings?.hiddenWidgets ?? [];
  const show = (id: string) => !hiddenWidgets.includes(id);

  // Queries can't read the clock, so pass it in (rounded to the minute) with the timezone.
  const clock = useClock();

  const save = (patch: { range?: Range; hiddenWidgets?: string[] }) =>
    updateSettings(patch).catch(() => toast.error("Couldn’t save your dashboard settings. Try again."));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[2rem] leading-tight font-semibold tracking-[-0.035em] text-ink">
            {user?.firstName ? `Welcome back, ${user.firstName}` : "Welcome back"}
          </h1>
          <p className="mt-1 text-mist">Here’s how your learning is going.</p>
        </div>
        <div className="flex items-center gap-2">
          <SegmentedControl
            aria-label="Time range"
            value={activeRange}
            onValueChange={(v) => {
              const next = v as Range;
              setRange(next);
              void save({ range: next });
            }}
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

          <Menu
            onCheckedChange={(checked, details) => {
              const id = String(details.value);
              const next = checked ? hiddenWidgets.filter((w) => w !== id) : [...hiddenWidgets, id];
              setHidden(next);
              void save({ hiddenWidgets: next });
            }}
          >
            <MenuTrigger className="btn btn-secondary btn-sm h-9" aria-label="Customise dashboard">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Customise</span>
            </MenuTrigger>
            <MenuContent
              side="bottom"
              align="end"
              sideOffset={8}
              className="card z-50 w-56 origin-(--transform-origin) p-1.5 transition-[opacity,scale] duration-150 ease-(--ease-out) data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:data-starting-style:scale-100"
            >
              <MenuGroup>
                <MenuGroupLabel className="px-2.5 py-1.5 text-xs text-mist">Show on dashboard</MenuGroupLabel>
                {WIDGETS.map((w) => (
                  <MenuCheckboxItem
                    key={w.id}
                    value={w.id}
                    checked={show(w.id)}
                    className="group flex cursor-pointer items-center gap-2 rounded-[8px] px-2.5 py-2 text-sm text-ink outline-none data-highlighted:bg-subtle"
                  >
                    <span className="grid h-4 w-4 place-items-center rounded-[4px] border border-line transition-colors duration-100 group-data-checked:border-ink group-data-checked:bg-ink">
                      <MenuItemIndicator keepMounted>
                        <Check className="h-3 w-3 text-bg" aria-hidden="true" />
                      </MenuItemIndicator>
                    </span>
                    {w.label}
                  </MenuCheckboxItem>
                ))}
              </MenuGroup>
            </MenuContent>
          </Menu>
        </div>
      </div>

      <WidgetBoundary what="your learning insights" className="mt-8">
        <Insights clock={clock} days={DAYS[activeRange]} show={show} />
      </WidgetBoundary>
    </>
  );
}

function Insights({
  clock,
  days,
  show,
}: {
  clock: { now: number; tz: number } | null;
  days: number;
  show: (id: string) => boolean;
}) {
  const insights = useQuery(
    api.insights.getMyInsights,
    clock ? { now: clock.now, tzOffsetMinutes: clock.tz, days } : "skip",
  );
  const dashboard = useQuery(api.enrollments.getMyLearningDashboard, {});

  if (insights === undefined || dashboard === undefined) {
    return <BodySkeleton />;
  }
  if (insights === null || dashboard === null) return null;

  const courses = dashboard.enrolledCourses;
  const resume = courses.find((c) => c.nextLessonSlug && c.completedLessons < c.totalLessons);
  const { totals, previous, series } = insights;

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      {show("kpis") && (
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-4">
          <KpiCard
            label="Lessons completed"
            value={totals.lessons}
            trend={series.map((d) => d.lessons)}
            footer={<Delta value={totals.lessons} previous={previous.lessons} />}
          />
          <KpiCard
            label="Time learned"
            value={totals.minutes}
            display={fmtMinutes}
            trend={series.map((d) => d.minutes)}
            footer={<Delta value={totals.minutes} previous={previous.minutes} suffix="m" />}
          />
          <KpiCard
            label="Quiz average"
            value={totals.avgScore ?? 0}
            display={(n) => (totals.avgScore === null ? "–" : `${n}%`)}
            trend={insights.quizScores.map((q) => q.score)}
            footer={<Delta value={totals.avgScore} previous={previous.avgScore} suffix="%" />}
          />
          <StreakCard {...insights.streak} />
        </div>
      )}

      <section aria-label="Continue learning" className={`card flex flex-col justify-between gap-6 p-6 ${show("goal") ? "lg:col-span-8" : "lg:col-span-12"}`}>
        {resume ? (
          <>
            <div className="flex gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resume.thumbnailUrl} alt="" className="hidden h-24 w-40 shrink-0 rounded-[10px] border border-line object-cover sm:block" />
              <div className="min-w-0">
                <p className="text-sm text-mist">Continue where you left off</p>
                <p className="mt-1 text-xl font-semibold tracking-[-0.02em] text-ink">{resume.title}</p>
                <p className="mt-1 truncate text-sm text-mist">Next: {resume.nextLessonTitle}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-48 flex-1">
                <div className="flex justify-between text-xs text-mist">
                  <span>
                    {resume.completedLessons} of {resume.totalLessons} lessons
                  </span>
                  <span className="tabular-nums">{resume.progressPercent}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-subtle">
                  <div className="h-full rounded-full bg-accent transition-[width] duration-500 ease-(--ease-out)" style={{ width: `${resume.progressPercent}%` }} />
                </div>
              </div>
              <Link href={`/courses/${resume.slug}/lessons/${resume.nextLessonSlug}`} className="btn btn-primary">
                <Play className="h-4 w-4" aria-hidden="true" />
                Continue
              </Link>
            </div>
          </>
        ) : (
          <EmptyState
            title={courses.length ? "You’ve finished everything you started" : "Start your first course"}
            body={courses.length ? "Pick a new course to keep your streak going." : "Enroll in a course and it shows up here, ready to continue."}
            action={{ label: "Browse courses", href: "/courses" }}
          />
        )}
      </section>

      {show("goal") && (
        <WidgetBoundary what="your weekly goal" className="lg:col-span-4">
          <GoalRing done={insights.week.done} goal={insights.week.goal} />
        </WidgetBoundary>
      )}

      {show("activity") && (
        <Widget title="Activity" className={show("quizzes") ? "lg:col-span-8" : "lg:col-span-12"}>
          <WidgetBoundary what="your activity">
            <ActivityChart series={series} />
          </WidgetBoundary>
        </Widget>
      )}

      {show("quizzes") && (
        <Widget title="Quiz scores" className={show("activity") ? "lg:col-span-4" : "lg:col-span-12"}>
          <WidgetBoundary what="your quiz scores">
            <QuizScoresChart scores={insights.quizScores} />
          </WidgetBoundary>
        </Widget>
      )}

      {show("calendar") && (
        <Widget
          title="Learning calendar"
          className="lg:col-span-12"
          action={<span className="text-xs text-mist">Last 26 weeks</span>}
        >
          <WidgetBoundary what="your learning calendar">
            {insights.hasAnyActivity ? (
              <div className="-mx-1 overflow-x-auto">
                <div className="min-w-[640px]">
                  <LearningCalendar heatmap={insights.heatmap} />
                </div>
              </div>
            ) : (
              <EmptyState title="Your calendar fills in as you learn" body="Every lesson and quiz lights up a day." />
            )}
          </WidgetBoundary>
        </Widget>
      )}

      {show("tracked") && (
        <Widget title="Tracked courses" className="lg:col-span-7">
          <TrackedCourses tracked={insights.tracked} />
        </Widget>
      )}

      <Widget
        title="Your courses"
        className={show("tracked") ? "lg:col-span-5" : "lg:col-span-12"}
        action={
          <Link href="/courses" className="btn btn-ghost btn-sm">
            Browse
          </Link>
        }
      >
        {courses.length === 0 ? (
          <EmptyState title="No courses yet" body="Enroll in a course to see it here." action={{ label: "Browse courses", href: "/courses" }} />
        ) : (
          <ul className="divide-y divide-line">
            {courses.map((course) => {
              const done = course.totalLessons > 0 && course.completedLessons === course.totalLessons;
              return (
                <li key={course._id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/courses/${course.slug}`} className="truncate text-sm font-medium text-ink hover:underline">
                      {course.title}
                    </Link>
                    <span className={`shrink-0 text-xs tabular-nums ${done ? "text-success" : "text-mist"}`}>
                      {done ? "Completed" : `${course.progressPercent}%`}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-subtle">
                      <div className={`h-full rounded-full ${done ? "bg-success" : "bg-ink"}`} style={{ width: `${course.progressPercent}%` }} />
                    </div>
                    <TrackButton courseId={course._id} className="btn btn-ghost btn-sm h-7 px-2 text-xs" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Widget>
    </div>
  );
}
