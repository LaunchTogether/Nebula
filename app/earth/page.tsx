"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Activity, Waves, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { MagnitudeChart } from "@/components/earth/magnitude-chart";
import { DepthChart } from "@/components/earth/depth-chart";
import { MAGNITUDE_BANDS } from "@/lib/dataviz";

// Leaflet must be dynamically imported (no SSR)
const EarthquakeMap = dynamic(
  () => import("@/components/earth/earthquake-map"),
  { ssr: false, loading: () => <div className="glass-card h-96 skeleton" /> }
);

interface EarthquakeFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    tsunami: number;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

export default function EarthPage() {
  const { data, isLoading } = useQuery<{ features: EarthquakeFeature[] }>({
    queryKey: ["earthquakes"],
    queryFn: () => fetch("/api/earthquakes").then((r) => r.json()),
    refetchInterval: 1000 * 60 * 10,
  });

  const quakes = data?.features || [];
  const major = quakes.filter((q) => q.properties.mag >= 6);
  const moderate = quakes.filter(
    (q) => q.properties.mag >= 5 && q.properties.mag < 6
  );
  const minor = quakes.filter((q) => q.properties.mag < 5);
  const tsunamiAlerts = quakes.filter((q) => q.properties.tsunami === 1);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="badge-live">Live Monitor</div>
          </div>
          <h1
            className="font-serif text-4xl md:text-5xl text-[var(--text)]"
           
          >
            Earth{" "}
            <span className="italic text-[var(--accent)]">Intelligence</span>
          </h1>
          <p className="text-[var(--text-faint)] text-sm mt-1">
            USGS · Earthquakes M4.0+ · Last 7 days
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Total Events",
              value: quakes.length,
              color: "text-[var(--text-dim)]",
              bg: "bg-[var(--surface)]",
              border: "border-[var(--border)]",
            },
            {
              label: "Major (M6+)",
              value: major.length,
              color: "text-red-400",
              bg: "bg-red-500/5",
              border: "border-red-500/10",
            },
            {
              label: "Moderate (M5+)",
              value: moderate.length,
              color: "text-orange-400",
              bg: "bg-orange-500/5",
              border: "border-orange-500/10",
            },
            {
              label: "Tsunami Alerts",
              value: tsunamiAlerts.length,
              color: "text-blue-400",
              bg: "bg-blue-500/5",
              border: "border-blue-500/10",
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl ${stat.bg} border ${stat.border} p-4 text-center`}
            >
              <div className={`text-2xl font-bold font-mono ${stat.color} mb-1`}>
                {isLoading ? "—" : stat.value}
              </div>
              <div className="text-[var(--text-faint)] text-xs uppercase tracking-wide">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Distribution + relationship charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <MagnitudeChart earthquakes={quakes} />
          <DepthChart earthquakes={quakes} />
        </div>

        {/* Map */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-[var(--text-dim)] font-semibold text-sm">
              Interactive Seismic Map
            </span>
            <div className="ml-auto flex items-center gap-3 text-xs text-[var(--text-faint)]">
              {MAGNITUDE_BANDS.map((b) => (
                <span key={b.key} className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: b.color }}
                  />
                  {b.key}
                </span>
              ))}
            </div>
          </div>
          <EarthquakeMap earthquakes={quakes} />
        </div>

        {/* Recent major events */}
        {major.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-[var(--text-dim)] font-semibold text-sm">
                Major Events (M6+)
              </span>
            </div>
            <div className="space-y-2">
              {major.slice(0, 5).map((q) => (
                <div
                  key={q.id}
                  className="glass-card p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-400 font-bold font-mono text-sm">
                      {q.properties.mag.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[var(--text-dim)] font-medium text-sm">
                      {q.properties.place}
                    </p>
                    <p className="text-[var(--text-faint)] text-xs mt-0.5">
                      {formatDistanceToNow(q.properties.time, {
                        addSuffix: true,
                      })}{" "}
                      · Depth {q.geometry.coordinates[2].toFixed(0)}km
                    </p>
                  </div>
                  {q.properties.tsunami === 1 && (
                    <div className="flex items-center gap-1 text-blue-400 text-xs">
                      <Waves className="w-3.5 h-3.5" />
                      Tsunami
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
