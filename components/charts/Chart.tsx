"use client";

import { useEffect, useRef, type ReactNode } from "react";
import * as echarts from "echarts/core";
import { BarChart, HeatmapChart, LineChart, PieChart } from "echarts/charts";
import {
  CalendarComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import { usePreference } from "@ui-sdk/react/preferences";
import { colorScheme } from "@/lib/color-scheme";

echarts.use([
  BarChart,
  HeatmapChart,
  LineChart,
  PieChart,
  CalendarComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
  SVGRenderer,
]);

/** The brand tokens a chart needs, read from the live CSS so charts follow light/dark. */
export interface ChartTokens {
  ink: string;
  mist: string;
  line: string;
  subtle: string;
  surface: string;
  accent: string;
  coral: string;
  font: string;
}

function readTokens(): ChartTokens {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    ink: v("--ink"),
    mist: v("--mist"),
    line: v("--line"),
    subtle: v("--subtle"),
    surface: v("--surface"),
    accent: v("--accent"),
    coral: v("--coral"),
    font: getComputedStyle(document.body).fontFamily,
  };
}

/** Tooltip styling shared by every chart: it looks like one of our cards. */
export function tooltipStyle(t: ChartTokens) {
  return {
    backgroundColor: t.surface,
    borderColor: t.line,
    borderWidth: 1,
    padding: [8, 12],
    textStyle: { color: t.ink, fontFamily: t.font, fontSize: 12 },
    extraCssText: "border-radius:10px;box-shadow:0 4px 16px rgb(0 0 0 / .08);",
  };
}

/**
 * One ECharts instance, themed from the brand tokens.
 * `option` is a function of the tokens so colours update when the theme changes.
 * `summary` is read by screen readers in place of the canvas.
 */
export function Chart({
  option,
  label,
  summary,
  className = "h-56",
}: {
  option: (t: ChartTokens) => echarts.EChartsCoreOption;
  label: string;
  summary: ReactNode;
  className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.ECharts | null>(null);
  const { resolved } = usePreference(colorScheme);

  useEffect(() => {
    if (!el.current) return;
    const instance = echarts.init(el.current, null, { renderer: "svg" });
    chart.current = instance;
    const ro = new ResizeObserver(() => instance.resize());
    ro.observe(el.current);
    return () => {
      ro.disconnect();
      instance.dispose();
      chart.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chart.current) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    chart.current.setOption(
      { animation: !reduce, animationDuration: 600, animationEasing: "cubicOut", ...option(readTokens()) },
      { notMerge: true },
    );
    // `resolved` re-runs this when the theme changes, so the colours follow it.
  }, [option, resolved]);

  return (
    <figure className="m-0">
      <div ref={el} className={`w-full ${className}`} role="img" aria-label={label} />
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}
