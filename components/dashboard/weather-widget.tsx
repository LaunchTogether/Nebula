"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Cloud, Sun, Sunrise, Sunset, Droplets, Wind, Moon } from "lucide-react";
import { format } from "date-fns";

interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    is_day: number;
    precipitation: number;
    wind_speed_10m: number;
  };
  daily: {
    sunrise: string[];
    sunset: string[];
  };
}

export function WeatherWidget() {
  const { data, isLoading } = useQuery<WeatherData>({
    queryKey: ["weather"],
    queryFn: () => fetch("/api/weather").then((r) => r.json()),
    refetchInterval: 1000 * 60 * 30, // 30 mins
  });

  if (isLoading) {
    return <div className="glass-card h-48 skeleton" />;
  }

  if (!data) return null;

  const { current, daily } = data;
  const isDay = current.is_day === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 opacity-10">
        {isDay ? <Sun className="w-32 h-32" /> : <Moon className="w-32 h-32" />}
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Cloud className="w-4 h-4 text-sky-400" />
          <span className="text-white/60 font-semibold text-sm">Space Coast Weather</span>
          <span className="text-white/30 text-xs ml-auto">Cape Canaveral</span>
        </div>

        <div className="flex items-end gap-3 mb-6">
          <div className="text-5xl font-light tracking-tighter text-white">
            {Math.round(current.temperature_2m)}°
          </div>
          <div className="pb-1 text-white/50">C</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sunrise className="w-4 h-4 text-orange-400" />
              <div>
                <div className="text-white/30 text-[10px] uppercase tracking-wider">Sunrise</div>
                <div className="text-white/80 text-sm font-mono">{format(new Date(daily.sunrise[0]), "HH:mm")}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sunset className="w-4 h-4 text-rose-400" />
              <div>
                <div className="text-white/30 text-[10px] uppercase tracking-wider">Sunset</div>
                <div className="text-white/80 text-sm font-mono">{format(new Date(daily.sunset[0]), "HH:mm")}</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-teal-400" />
              <div>
                <div className="text-white/30 text-[10px] uppercase tracking-wider">Wind</div>
                <div className="text-white/80 text-sm font-mono">{current.wind_speed_10m} km/h</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-white/30 text-[10px] uppercase tracking-wider">Humidity</div>
                <div className="text-white/80 text-sm font-mono">{current.relative_humidity_2m}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
