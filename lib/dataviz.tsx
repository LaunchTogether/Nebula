/**
 * Nebula's shared chart language.
 *
 * Every visualization in the app draws from this file so magnitude bars, the
 * seismic map, the Kp gauge and the depth scatter read as one instrument.
 * Recharts resolves CSS variables at render time, so axis/grid/tooltip config
 * references theme tokens directly and stays theme-aware with no extra JS.
 */
import type { ReactNode } from "react";

/* ---------------------------------------------------------------------------
   Severity ramp — an ORDINAL status scale (calm → critical), not a categorical
   palette. It is always paired with a written label (band name, Kp level), so
   colour is never the sole encoding. Shared by the seismic map, the magnitude
   distribution and the space-weather gauge so the three share one scale.
--------------------------------------------------------------------------- */
export const SEVERITY_RAMP = ["#10b981", "#f59e0b", "#f97316", "#ef4444"] as const;

/** Earthquake magnitude → severity colour (kept in sync with the map legend). */
export function magnitudeColor(mag: number): string {
  if (mag >= 7) return SEVERITY_RAMP[3];
  if (mag >= 6) return SEVERITY_RAMP[2];
  if (mag >= 5) return SEVERITY_RAMP[1];
  return SEVERITY_RAMP[0];
}

/** Planetary K-index (0–9) → severity colour. */
export function kpColor(kp: number): string {
  if (kp >= 6) return SEVERITY_RAMP[3];
  if (kp >= 4) return SEVERITY_RAMP[2];
  if (kp >= 3) return SEVERITY_RAMP[1];
  return SEVERITY_RAMP[0];
}

/** Ordinal magnitude bands used by the distribution chart + map legend. */
export const MAGNITUDE_BANDS = [
  { key: "M4–5", label: "Minor", min: 4, max: 5, color: SEVERITY_RAMP[0] },
  { key: "M5–6", label: "Moderate", min: 5, max: 6, color: SEVERITY_RAMP[1] },
  { key: "M6–7", label: "Strong", min: 6, max: 7, color: SEVERITY_RAMP[2] },
  { key: "M7+", label: "Major", min: 7, max: Infinity, color: SEVERITY_RAMP[3] },
] as const;

/* ---------------------------------------------------------------------------
   Neutral data hue — for non-severity measures (counts, cadence, trends).
--------------------------------------------------------------------------- */
export const CHART_ACCENT = "var(--accent)";
export const CHART_CYAN = "var(--accent-cyan)";

/* ---------------------------------------------------------------------------
   Recharts primitives — one axis/grid/cursor treatment everywhere.
--------------------------------------------------------------------------- */
export const axisTick = {
  fill: "var(--text-faint)",
  fontSize: 11,
  fontFamily: "var(--font-mono)",
} as const;

export const axisLineProps = { stroke: "var(--border)" } as const;

export const gridProps = {
  stroke: "var(--grid-line)",
  strokeDasharray: "2 5",
  vertical: false,
} as const;

export const cursorFill = { fill: "var(--surface-hover)" } as const;

/** Respects the user's reduced-motion preference for chart entrance tweens. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* ---------------------------------------------------------------------------
   Presentational shells — the shared tooltip box and the chart card frame.
--------------------------------------------------------------------------- */
export function TooltipShell({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-2 shadow-[var(--panel-shadow)]">
      {children}
    </div>
  );
}

export function ChartFrame({
  eyebrow,
  caption,
  action,
  children,
}: {
  eyebrow: string;
  caption?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-baseline justify-between mb-4 gap-3">
        <div>
          <div className="eyebrow mb-1">{eyebrow}</div>
          {caption && (
            <div className="text-[var(--text-dim)] text-sm">{caption}</div>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
