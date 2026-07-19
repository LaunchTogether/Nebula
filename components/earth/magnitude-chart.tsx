"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  MAGNITUDE_BANDS,
  axisTick,
  axisLineProps,
  gridProps,
  cursorFill,
  ChartFrame,
  TooltipShell,
} from "@/lib/dataviz";

interface Quake {
  properties: { mag: number };
}

function TooltipBox({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { band: string } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <TooltipShell>
      <div className="font-mono text-xs text-[var(--text-dim)]">
        {label} · {payload[0].payload.band}
      </div>
      <div className="tabular font-mono text-lg text-[var(--text)]">
        {payload[0].value}
        <span className="text-[var(--text-faint)] text-xs ml-1">events</span>
      </div>
    </TooltipShell>
  );
}

export function MagnitudeChart({ earthquakes }: { earthquakes: Quake[] }) {
  const data = useMemo(
    () =>
      MAGNITUDE_BANDS.map((b) => ({
        key: b.key,
        band: b.label,
        color: b.color,
        count: earthquakes.filter(
          (q) => q.properties.mag >= b.min && q.properties.mag < b.max
        ).length,
      })),
    [earthquakes]
  );

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <ChartFrame
      eyebrow="Magnitude distribution"
      caption={`${total} events over the last 7 days`}
    >
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid {...gridProps} />
            <XAxis
              dataKey="key"
              tick={axisTick}
              axisLine={axisLineProps}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip cursor={cursorFill} content={<TooltipBox />} />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
              maxBarSize={64}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}
