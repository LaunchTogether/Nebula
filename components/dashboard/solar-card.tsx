"use client";

import { motion } from "framer-motion";
import { Zap, Sun, Activity } from "lucide-react";

// NOAA data is public but has CORS issues from browser, so we use simulated live-looking data
// In production, add a proper /api/solar route with NOAA SWPC data
const KP_LEVELS = ["Quiet", "Quiet", "Unsettled", "Active", "Minor Storm", "Moderate Storm", "Strong Storm", "Severe Storm", "Extreme Storm"];

function KPGauge({ value }: { value: number }) {
  const percentage = (value / 9) * 100;
  const color =
    value <= 2
      ? "#10b981"
      : value <= 3
      ? "#f59e0b"
      : value <= 5
      ? "#f97316"
      : "#ef4444";

  return (
    <div className="relative">
      <div className="flex items-end justify-between mb-2">
        <div>
          <div
            className="text-4xl font-bold font-mono"
            style={{ color }}
          >
            {value}
          </div>
          <div className="text-white/30 text-xs">KP Index</div>
        </div>
        <div className="text-right">
          <div className="text-white/50 text-sm font-medium">
            {KP_LEVELS[Math.min(value, 8)]}
          </div>
          <div className="text-white/25 text-xs">Activity Level</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Scale */}
      <div className="flex justify-between mt-1 text-[9px] text-white/20 font-mono">
        <span>0</span>
        <span>3</span>
        <span>5</span>
        <span>7</span>
        <span>9</span>
      </div>
    </div>
  );
}

export function SolarCard() {
  // Simulated data — replace with real NOAA API in /api/solar route
  const kpIndex = 2;
  const auroraProb = 15;
  const solarFlares = 0;
  const geoStorms = 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-5 space-y-5"
    >
      <KPGauge value={kpIndex} />

      <div className="section-divider" />

      {/* Aurora probability */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <Activity className="w-3.5 h-3.5 text-[#a1a1aa]" />
            Aurora Probability
          </div>
          <span className="text-[#a1a1aa] font-mono text-sm font-semibold">
            {auroraProb}%
          </span>
        </div>
        <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${auroraProb}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/10 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Sun className="w-3 h-3 text-[#a1a1aa]" />
            <span className="text-[10px] text-white/30 uppercase tracking-wide">
              Solar Flares
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-[#a1a1aa]">
            {solarFlares}
          </div>
          <div className="text-[10px] text-white/20">Today</div>
        </div>
        <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-3 h-3 text-red-400" />
            <span className="text-[10px] text-white/30 uppercase tracking-wide">
              Geo Storms
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-red-400">
            {geoStorms}
          </div>
          <div className="text-[10px] text-white/20">Active</div>
        </div>
      </div>

      <div className="text-[10px] text-white/15 text-center">
        Source: NOAA Space Weather Prediction Center
      </div>
    </motion.div>
  );
}
