import type { CSSProperties } from "react";

/** [gridline index, seconds per pass, start delay in seconds] */
type Beam = [line: number, duration: number, delay: number];

/**
 * Teal streaks that travel along the 24px `.bg-grid` lines. Pure CSS (see `.grid-beam` in globals.css),
 * snapped to the grid, and hidden for reduced motion. Drop it inside any relative, overflow-hidden grid.
 */
export function GridBeams({ rows, cols }: { rows: Beam[]; cols: Beam[] }) {
  const style = ([line, dur, delay]: Beam) =>
    ({ "--at": line, "--dur": `${dur}s`, "--delay": `${delay}s` }) as CSSProperties;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {rows.map((b) => (
        <span key={`r${b[0]}`} className="grid-beam grid-beam-x" style={style(b)} />
      ))}
      {cols.map((b) => (
        <span key={`c${b[0]}`} className="grid-beam grid-beam-y" style={style(b)} />
      ))}
    </div>
  );
}
