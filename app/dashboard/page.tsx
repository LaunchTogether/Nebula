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
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-6 lg:px-8 selection:bg-white/10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                <div className="live-dot" />
                <span className="text-[10px] font-medium tracking-widest text-[#a1a1aa] uppercase">
                  Live Feed
                </span>
              </div>
              <span className="text-[#71717a] text-xs font-medium tracking-wide">
                NASA · USGS · NOAA
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-[#fafafa] tracking-tight">
              Planet <span className="italic text-[#a1a1aa]">Intelligence</span>
            </h1>
          </div>
          <StatsBar earthquakeCount={totalQuakes} />
        </motion.div>

        {/* AI Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <AIReport earthquakeCount={totalQuakes} />
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* APOD — large */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 space-y-4"
          >
            <SectionHeader
              icon={Star}
              title="Astronomy Picture of the Day"
              subtitle="NASA"
            />
            <APODCard />
          </motion.div>

          {/* ISS & Weather */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="space-y-4">
              <SectionHeader
                icon={Satellite}
                title="ISS Tracker"
                subtitle="Live"
                live
              />
              <ISSTracker />
            </div>
            <div className="space-y-4">
              <SectionHeader
                icon={Thermometer}
                title="Weather"
                subtitle="Local"
              />
              <WeatherWidget />
            </div>
          </motion.div>
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <SectionHeader
              icon={Rocket}
              title="SpaceX Launches"
              subtitle="Latest"
            />
            <SpaceXCard />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <SectionHeader
              icon={AlertTriangle}
              title="Near-Earth Objects"
              subtitle="NASA NEO"
            />
            <AsteroidCard />
          </motion.div>
        </div>

        {/* Third row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 space-y-4"
          >
            <SectionHeader
              icon={Activity}
              title="Earthquake Monitor"
              subtitle="USGS"
              live
            />
            <EarthquakeList />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <SectionHeader
              icon={Zap}
              title="Solar Activity"
              subtitle="NOAA SWPC"
              live
            />
            <SolarCard />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  live = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  subtitle: string;
  live?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-2.5">
        <Icon className="w-4 h-4 text-[#d97757]" strokeWidth={1.5} />
        <span className="text-[#fafafa] font-medium tracking-wide">{title}</span>
      </div>
      <div className="flex items-center gap-2 text-[#71717a] text-xs font-medium tracking-wider uppercase">
        {live && <div className="live-dot" />}
        {subtitle}
      </div>
    </div>
  );
}
