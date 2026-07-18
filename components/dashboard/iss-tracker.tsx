"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, Gauge, ArrowUp } from "lucide-react";

interface ISSPosition {
  iss_position: { latitude: string; longitude: string };
  timestamp: number;
  message: string;
}

function ISSGlobe({
  lat,
  lon,
}: {
  lat: number;
  lon: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.4;

    ctx.clearRect(0, 0, size, size);

    // Glow
    const glow = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.3);
    glow.addColorStop(0, "rgba(14, 165, 233, 0.1)");
    glow.addColorStop(1, "rgba(14, 165, 233, 0)");
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // Globe
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    const bg = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
    bg.addColorStop(0, "#1a3a6a");
    bg.addColorStop(0.5, "#0d2040");
    bg.addColorStop(1, "#050f20");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    // Grid lines
    ctx.strokeStyle = "rgba(14, 165, 233, 0.1)";
    ctx.lineWidth = 0.5;
    for (let lat = -75; lat <= 75; lat += 30) {
      const y = cy - (lat / 90) * r;
      const rLat = Math.sqrt(Math.max(0, r * r - (y - cy) * (y - cy)));
      ctx.beginPath();
      ctx.ellipse(cx, y, rLat, rLat * 0.12, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let lng = 0; lng < 360; lng += 30) {
      const angle = (lng * Math.PI) / 180;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.abs(Math.cos(angle)) * r, r, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    // ISS position dot
    const issLng = ((lon + 180) / 360) * Math.PI * 2 - Math.PI / 2;
    const issLat = (lat / 90) * (Math.PI / 2);
    const issX = cx + Math.cos(issLat) * Math.sin(issLng) * r;
    const issY = cy - Math.sin(issLat) * r;

    // Orbit ring (simplified)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.25);
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(14, 165, 233, 0.2)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.restore();

    // ISS dot
    const issGlow = ctx.createRadialGradient(issX, issY, 0, issX, issY, 12);
    issGlow.addColorStop(0, "rgba(14, 165, 233, 0.8)");
    issGlow.addColorStop(0.4, "rgba(14, 165, 233, 0.3)");
    issGlow.addColorStop(1, "rgba(14, 165, 233, 0)");
    ctx.beginPath();
    ctx.arc(issX, issY, 12, 0, Math.PI * 2);
    ctx.fillStyle = issGlow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(issX, issY, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#0ea5e9";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(issX, issY, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Label
    ctx.fillStyle = "rgba(14, 165, 233, 0.9)";
    ctx.font = "bold 8px 'JetBrains Mono', monospace";
    ctx.fillText("ISS", issX + 8, issY - 5);
  }, [lat, lon]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="w-full max-w-[180px] mx-auto"
      aria-label="ISS position on globe"
    />
  );
}

export function ISSTracker() {
  const { data, isLoading } = useQuery<ISSPosition>({
    queryKey: ["iss"],
    queryFn: () => fetch("/api/iss").then((r) => r.json()),
    refetchInterval: 5000,
  });

  const lat = parseFloat(data?.iss_position?.latitude || "0");
  const lon = parseFloat(data?.iss_position?.longitude || "0");

  if (isLoading) {
    return <div className="glass-panel h-64 skeleton" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4"
    >
      <ISSGlobe lat={lat} lon={lon} />

      <div className="grid grid-cols-2 gap-2 mt-4">
        <StatItem
          icon={MapPin}
          label="Latitude"
          value={`${lat.toFixed(4)}°`}
          color="text-[#a1a1aa]"
        />
        <StatItem
          icon={MapPin}
          label="Longitude"
          value={`${lon.toFixed(4)}°`}
          color="text-[#a1a1aa]"
        />
        <StatItem
          icon={ArrowUp}
          label="Altitude"
          value="408 km"
          color="text-cyan-400"
        />
        <StatItem
          icon={Gauge}
          label="Speed"
          value="27,600 km/h"
          color="text-[#a1a1aa]"
        />
      </div>

      <div className="mt-3 pt-3 border-t border-white/[0.04] text-xs text-white/25 text-center font-mono">
        Updated {data?.timestamp ? new Date(data.timestamp * 1000).toLocaleTimeString() : "—"}
      </div>
    </motion.div>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      <div className="flex items-center gap-1 text-white/30 text-[10px] uppercase tracking-wide">
        <Icon className={`w-3 h-3 ${color}`} />
        {label}
      </div>
      <div className={`text-sm font-semibold font-mono ${color}`}>{value}</div>
    </div>
  );
}
