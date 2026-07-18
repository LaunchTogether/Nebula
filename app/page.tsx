"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Globe,
  Satellite,
  Zap,
  Activity,
  ChevronDown,
  Rocket,
  Radio,
  Newspaper,
} from "lucide-react";

function ElegantEarth() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rotation = 0;
    let animId: number;
    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.42;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // Soft glow
      const outerGlow = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.5);
      outerGlow.addColorStop(0, "rgba(217, 119, 87, 0.08)"); // Amber glow
      outerGlow.addColorStop(1, "rgba(217, 119, 87, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = outerGlow;
      ctx.fill();

      // Save and clip to sphere
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      // Base elegant dark sphere
      const baseGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
      baseGrad.addColorStop(0, "#2a2a2a");
      baseGrad.addColorStop(0.5, "#141414");
      baseGrad.addColorStop(1, "#050505");
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, size, size);

      // Continents
      const continentColor = "rgba(230, 223, 217, 0.15)"; // Sand color

      type Continent = { baseX: number; y: number; w: number; h: number; };
      const continents: Continent[] = [
        { baseX: 0.1, y: 0.25, w: 0.22, h: 0.28 },
        { baseX: 0.35, y: 0.22, w: 0.18, h: 0.32 },
        { baseX: 0.58, y: 0.28, w: 0.14, h: 0.22 },
        { baseX: 0.72, y: 0.18, w: 0.25, h: 0.40 },
        { baseX: 0.15, y: 0.62, w: 0.16, h: 0.20 },
        { baseX: 0.5, y: 0.55, w: 0.12, h: 0.18 },
      ];

      continents.forEach((c) => {
        let x = ((c.baseX + rotation / (Math.PI * 2)) % 1) * size * 2.2 - size * 0.1;
        x = x < -r * 1.5 ? x + size * 2.2 : x;
        const y = c.y * size;
        const w = c.w * size;
        const h = c.h * size;

        ctx.beginPath();
        ctx.ellipse(x, y, w * 0.5, h * 0.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = continentColor;
        ctx.fill();
      });

      // Latitude lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 0.5;
      for (let lat = -4; lat <= 4; lat++) {
        const y = cy + (lat / 5) * r;
        const rLat = Math.sqrt(Math.max(0, r * r - (y - cy) * (y - cy)));
        ctx.beginPath();
        ctx.ellipse(cx, y, rLat, rLat * 0.15, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Longitude lines
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI + rotation;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(Math.sin(angle) * r), r, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.02 + Math.abs(Math.cos(angle)) * 0.04})`;
        ctx.stroke();
      }

      // Specular highlight
      const shine = ctx.createRadialGradient(
        cx - r * 0.4, cy - r * 0.4, 0,
        cx - r * 0.4, cy - r * 0.4, r * 0.8
      );
      shine.addColorStop(0, "rgba(255, 255, 255, 0.1)");
      shine.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = shine;
      ctx.fillRect(0, 0, size, size);

      // Night shadow
      const shadow = ctx.createRadialGradient(
        cx + r * 0.3, cy, 0,
        cx + r * 0.3, cy, r * 1.4
      );
      shadow.addColorStop(0, "rgba(0, 0, 0, 0)");
      shadow.addColorStop(1, "rgba(0, 0, 0, 0.9)");
      ctx.fillStyle = shadow;
      ctx.fillRect(0, 0, size, size);

      ctx.restore();

      // Elegant Orbit Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.3);
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.25, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // ISS dot
      const issAngle = rotation * 2;
      const issX = cx + Math.cos(issAngle) * r * 1.25;
      const issY = cy + Math.sin(issAngle) * r * 0.375;
      
      ctx.beginPath();
      ctx.arc(issX, issY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#e6dfd9";
      ctx.fill();

      rotation += 0.002;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={500}
      className="w-full h-full object-contain"
      aria-label="Elegant Rotating Earth visualization"
    />
  );
}

function ElegantClock() {
  const [datetime, setDatetime] = useState({ time: "", date: "" });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setDatetime({
        time: now.toLocaleTimeString("en-US", {
          timeZone: "UTC",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        date: now.toLocaleDateString("en-US", {
          timeZone: "UTC",
          weekday: "long",
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="font-mono text-3xl md:text-5xl font-light text-[#fafafa] tracking-[0.2em] mb-2 opacity-90">
        {datetime.time || "00:00:00"}
      </div>
      <div className="text-xs text-[#a1a1aa] tracking-[0.3em] uppercase font-medium">
        UTC · {datetime.date || "Loading..."}
      </div>
    </div>
  );
}

const features = [
  {
    icon: Newspaper,
    title: "Space News",
    description: "Curated aerospace news from global agencies, powered by the Spaceflight News API.",
  },
  {
    icon: Satellite,
    title: "Live ISS Tracking",
    description: "Real-time orbital position of the International Space Station updated continuously.",
  },
  {
    icon: Activity,
    title: "Earth Events",
    description: "Live earthquake reports, severity mapping, and geological activity from USGS.",
  },
  {
    icon: Rocket,
    title: "SpaceX Launches",
    description: "Upcoming manifests, mission profiles, and historical launch details.",
  },
  {
    icon: Globe,
    title: "NASA Imagery",
    description: "The Astronomy Picture of the Day with AI-enhanced scientific descriptions.",
  },
  {
    icon: Zap,
    title: "Solar Intelligence",
    description: "KP Indices, solar flares, and real-time geomagnetic storm probability alerts.",
  },
];

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -50]);

  return (
    <div className="relative selection:bg-white/10">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 overflow-hidden">
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto w-full"
        >
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
          >
            <div className="live-dot" />
            <span className="text-xs font-medium tracking-wider text-[#a1a1aa] uppercase">
              Planet Intelligence Platform
            </span>
          </motion.div>

          {/* Earth Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="w-64 h-64 md:w-80 md:h-80 mb-12 relative flex items-center justify-center"
          >
            <ElegantEarth />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight text-[#fafafa] mb-6 leading-[1.1]"
          >
            The Universe, <br />
            <span className="text-[#a1a1aa] italic">Distilled.</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="text-lg md:text-xl text-[#71717a] max-w-2xl leading-relaxed mb-12 font-sans font-light"
          >
            A premium interface for scientific data. Live telemetry from NASA, SpaceX, USGS,
            and NOAA—brought together in one elegant dashboard.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-16"
          >
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium transition-all hover:bg-[#e6dfd9] hover:scale-[1.02] active:scale-[0.98]"
            >
              Open Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/news"
              className="flex items-center gap-2 px-8 py-4 bg-transparent text-[#fafafa] border border-white/10 rounded-full font-medium transition-all hover:bg-white/5"
            >
              Read Space News
            </Link>
          </motion.div>

          {/* Time */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <ElegantClock />
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Bento Grid */}
      <section className="relative py-32 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-[#fafafa] mb-6">
            Comprehensive <span className="italic text-[#a1a1aa]">Insights</span>
          </h2>
          <p className="text-[#71717a] text-lg max-w-2xl mx-auto font-light">
            An operating system designed for curiosity. Explore data modules spanning
            from the Earth's core to deep space.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="glass-panel p-8 group"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
                  <Icon className="w-5 h-5 text-[#d97757]" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-medium text-[#fafafa] mb-3">{feature.title}</h3>
                <p className="text-[#a1a1aa] leading-relaxed font-light">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Elegant Footer */}
      <footer className="relative border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#71717a]" strokeWidth={1.5} />
            <span className="font-serif text-lg tracking-tight text-[#fafafa]">
              Nebula.
            </span>
          </div>
          <p className="text-[#71717a] text-sm text-center">
            Designed for discovery. Data provided by NASA, USGS, NOAA, and Open-Meteo.
          </p>
          <div className="text-[#71717a] text-sm">
            © {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
}
