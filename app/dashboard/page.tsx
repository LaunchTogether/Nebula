"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Globe,
  Satellite,
  Zap,
  Activity,
  Rocket,
  Star,
  AlertTriangle,
  Radio,
  Thermometer,
} from "lucide-react";
import { APODCard } from "@/components/dashboard/apod-card";
import { ISSTracker } from "@/components/dashboard/iss-tracker";
import { SpaceXCard } from "@/components/dashboard/spacex-card";
import { EarthquakeList } from "@/components/dashboard/earthquake-list";
import { AsteroidCard } from "@/components/dashboard/asteroid-card";
import { SolarCard } from "@/components/dashboard/solar-card";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { AIReport } from "@/components/dashboard/ai-report";
import { WeatherWidget } from "@/components/dashboard/weather-widget";

export default function DashboardPage() {
  const { data: earthquakeData } = useQuery({
    queryKey: ["earthquakes"],
    queryFn: () => fetch("/api/earthquakes").then((r) => r.json()),
    refetchInterval: 1000 * 60 * 10,
  });

  const totalQuakes = earthquakeData?.features?.length || 0;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="badge-live">Live Feed</div>
            <span className="text-white/20 text-xs">
              Auto-refreshing · Data from NASA, SpaceX, USGS, NOAA
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold text-white/90"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Planet{" "}
            <span className="gradient-text-nebula">Intelligence</span>
          </h1>
        </motion.div>

        {/* Stats Bar */}
        <StatsBar earthquakeCount={totalQuakes} />

        {/* AI Report */}
        <div className="mt-6">
          <AIReport earthquakeCount={totalQuakes} />
        </div>

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* APOD — large */}
          <div className="lg:col-span-2">
            <SectionHeader
              icon={Star}
              title="Astronomy Picture of the Day"
              subtitle="NASA · Daily"
              color="text-amber-400"
            />
            <APODCard />
          </div>

          {/* ISS & Weather */}
          <div className="flex flex-col gap-4">
            <div>
              <SectionHeader
                icon={Satellite}
                title="ISS Live Tracker"
                subtitle="Open Notify · Live"
                color="text-blue-400"
                live
              />
              <ISSTracker />
            </div>
            <div>
              <SectionHeader
                icon={Thermometer}
                title="Weather"
                subtitle="Open-Meteo · Cape Canaveral"
                color="text-sky-400"
              />
              <WeatherWidget />
            </div>
          </div>
        </div>

        {/* Second row */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <SectionHeader
              icon={Rocket}
              title="SpaceX Launches"
              subtitle="Latest & Upcoming"
              color="text-violet-400"
            />
            <SpaceXCard />
          </div>
          <div>
            <SectionHeader
              icon={AlertTriangle}
              title="Near-Earth Asteroids"
              subtitle="NASA NEO · Today"
              color="text-orange-400"
            />
            <AsteroidCard />
          </div>
        </div>

        {/* Third row */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SectionHeader
              icon={Activity}
              title="Earthquake Monitor"
              subtitle="USGS · M4.0+ Last 7 Days"
              color="text-emerald-400"
              live
            />
            <EarthquakeList />
          </div>
          <div>
            <SectionHeader
              icon={Zap}
              title="Solar Activity"
              subtitle="NOAA SWPC"
              color="text-yellow-400"
              live
            />
            <SolarCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  color,
  live = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  color: string;
  live?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-white/70 font-semibold text-sm">{title}</span>
      </div>
      <div className="flex items-center gap-1.5 text-white/25 text-xs">
        {live && (
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        )}
        {subtitle}
      </div>
    </div>
  );
}
