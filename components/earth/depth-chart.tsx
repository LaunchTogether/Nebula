"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import {
  magnitudeColor,
  axisTick,
  axisLineProps,
  gridProps,
  ChartFrame,
  TooltipShell,
} from "@/lib/dataviz";

interface Quake {
  properties: { mag: number; place: string };
  geometry: { coordinates: [number, number, number] };
}

interface Point {
  depth: number;
  mag: number;
  place: string;
  color: string;
}

function TooltipBox({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: Point }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <TooltipShell>
      <div className="text-xs text-[var(--text-dim)] max-w-[200px] truncate">
        {p.place}
      </div>
      <div className="tabular font-mono text-sm text-[var(--text)] mt-0.5">
        M{p.mag.toFixed(1)}
        <span className="text-[var(--text-faint)] mx-1.5">·</span>
        {p.depth.toFixed(0)} km deep
      </div>
    </TooltipShell>
  );
}

/**
 * Depth × magnitude scatter — every recorded M4.0+ event this week, showing
 * how deep it struck against how strong it was. Points carry the shared
 * severity colour so they map onto the same scale as the bars and the seismic
 * map. This plots the events we have, not a rate, so it is unaffected by the
 * feed's strongest-first cap.
 */
export function DepthChart({ earthquakes }: { earthquakes: Quake[] }) {
  const data = useMemo<Point[]>(
    () =>
      earthquakes
        .filter((q) => Number.isFinite(q.geometry?.coordinates?.[2]))
        .map((q) => ({
          depth: q.geometry.coordinates[2],
          mag: q.properties.mag,
          place: q.properties.place,
          color: magnitudeColor(q.properties.mag),
        })),
    [earthquakes]
  );

  return (
    <ChartFrame
      eyebrow="Depth vs magnitude"
      caption={`${data.length} events — deeper quakes sit to the right`}
    >
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
            <CartesianGrid {...gridProps} vertical />
            <XAxis
              type="number"
              dataKey="depth"
              name="Depth"
              unit="km"
              tick={axisTick}
              axisLine={axisLineProps}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="mag"
              name="Magnitude"
              domain={[4, "dataMax"]}
              allowDecimals={false}
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <ZAxis range={[36, 36]} />
            <Tooltip
              cursor={{ stroke: "var(--border-strong)", strokeDasharray: "3 3" }}
              content={<TooltipBox />}
            />
            <Scatter
              data={data}
              isAnimationActive={false}
              fillOpacity={0.85}
            >
              {data.map((p, i) => (
                <Cell key={i} fill={p.color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}
