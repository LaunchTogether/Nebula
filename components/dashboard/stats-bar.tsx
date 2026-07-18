"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  Satellite,
  Rocket,
  AlertTriangle,
  Zap,
  Globe,
} from "lucide-react";

interface StatsBarProps {
  earthquakeCount: number;
}

export function StatsBar({ earthquakeCount }: StatsBarProps) {
  const { data: spacex } = useQuery({
    queryKey: ["spacex"],
    queryFn: () => fetch("/api/spacex").then((r) => r.json()),
    staleTime: 1000 * 60 * 30,
  });

  const { data: spaceData } = useQuery({
    queryKey: ["space"],
    queryFn: () => fetch("/api/space").then((r) => r.json()),
    staleTime: 1000 * 60 * 60,
  });

  const upcomingLaunches = spacex?.upcoming?.length || 0;
  const hazardousAsteroids = (spaceData?.asteroids || []).filter(
    (a: { is_potentially_hazardous_asteroid: boolean }) =>
      a.is_potentially_hazardous_asteroid
  ).length;

  const stats = [
    {
      icon: Activity,
      label: "Earthquakes (7d)",
      value: earthquakeCount || "—",
      color: "text-[#a1a1aa]",
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/10",
    },
    {
      icon: Satellite,
      label: "ISS Speed",
      value: "27,600 km/h",
      color: "text-[#a1a1aa]",
      bg: "bg-blue-500/5",
      border: "border-blue-500/10",
    },
    {
      icon: Rocket,
      label: "Upcoming Launches",
      value: upcomingLaunches || "—",
      color: "text-[#a1a1aa]",
      bg: "bg-violet-500/5",
      border: "border-violet-500/10",
    },
    {
      icon: AlertTriangle,
      label: "Hazardous Asteroids",
      value: hazardousAsteroids !== undefined ? hazardousAsteroids : "—",
      color: "text-[#a1a1aa]",
      bg: "bg-orange-500/5",
      border: "border-orange-500/10",
    },
    {
      icon: Zap,
      label: "Solar Activity",
      value: "KP 2",
      color: "text-[#a1a1aa]",
      bg: "bg-yellow-500/5",
      border: "border-yellow-500/10",
    },
    {
      icon: Globe,
      label: "ISS Orbit",
      value: "#5,421",
      color: "text-cyan-400",
      bg: "bg-cyan-500/5",
      border: "border-cyan-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl ${stat.bg} border ${stat.border} p-3`}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Icon className={`w-3 h-3 ${stat.color}`} />
              <span className="text-[10px] text-white/25 uppercase tracking-wide truncate">
                {stat.label}
              </span>
            </div>
            <div
              className={`text-lg font-bold font-mono ${stat.color}`}
            >
              {stat.value}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
