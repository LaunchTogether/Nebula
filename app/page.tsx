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
  Rocket,
  Radio,
  Newspaper,
} from "lucide-react";

/* ---------- color helpers (read theme tokens from CSS vars) ---------- */

function readVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// #rrggbb -> rgba(r,g,b,a)
function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

type Vec3 = { x: number; y: number; z: number };

// project a lat/lon (radians) point on a unit sphere, rotated by `spin` around Y
function project(lat: number, lon: number, spin: number): Vec3 {
  const l = lon + spin;
  return {
    x: Math.cos(lat) * Math.sin(l),
    y: Math.sin(lat),
    z: Math.cos(lat) * Math.cos(l),
  };
}

/* ---------- Signature: dotted-sphere Earth (calm, premium) ---------- */

type Dot = { x: number; y: number; z: number; land: boolean };

// Evenly distribute N points on a unit sphere (Fibonacci lattice), then flag
// the ones that fall inside coarse continent regions as "land" (brighter).
function buildSphere(count: number): Dot[] {
  const D2R = Math.PI / 180;
  // Continent centres: [lat, lon, angularRadius°] — a point within radius = land.
  const land: Array<[number, number, number]> = [
    [54, -108, 26], // N. America
    [39, -98, 15], // N. America (mid)
    [-12, -58, 24], // S. America
    [52, 12, 17], // Europe
    [8, 20, 30], // Africa
    [-4, 24, 22], // Central/S. Africa
    [58, 90, 34], // Asia (north)
    [28, 78, 18], // India
    [40, 116, 16], // E. Asia
    [-25, 133, 15], // Australia
  ];
  const golden = Math.PI * (3 - Math.sqrt(5));
  const dots: Dot[] = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // 1 -> -1
    const rad = Math.sqrt(1 - y * y);
    const theta = i * golden;
    const x = Math.cos(theta) * rad;
    const z = Math.sin(theta) * rad;
    // lat/lon of this point to test against continent centres
    const lat = Math.asin(y);
    const lon = Math.atan2(z, x);
    let isLand = false;
    for (const [clat, clon, cr] of land) {
      const dlat = lat - clat * D2R;
      let dlon = lon - clon * D2R;
      if (dlon > Math.PI) dlon -= 2 * Math.PI;
      if (dlon < -Math.PI) dlon += 2 * Math.PI;
      // rough angular distance (flat-ish, good enough for a stylised map)
      const d = Math.sqrt(dlat * dlat + dlon * dlon * Math.cos(lat) * Math.cos(lat));
      if (d < cr * D2R) {
        isLand = true;
        break;
      }
    }
    dots.push({ x, y, z, land: isLand });
  }
  return dots;
}

function WireframeGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = 460;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const r = SIZE * 0.34;

    // Theme colors, refreshed whenever data-theme changes
    let colAccent = "#5e8bff";
    let colCyan = "#37e0e8";
    let colLine = "#93a0c0";
    const refreshColors = () => {
      colAccent = readVar("--accent") || colAccent;
      colCyan = readVar("--accent-cyan") || colCyan;
      colLine = readVar("--text-dim") || colLine;
    };
    refreshColors();
    const observer = new MutationObserver(refreshColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const dots = buildSphere(2200);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let spin = -0.4;
    let t = 0;
    let animId = 0;

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      const cosS = Math.cos(spin);
      const sinS = Math.sin(spin);

      // soft atmosphere glow behind the sphere
      const halo = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.25);
      halo.addColorStop(0, hexA(colAccent, 0.14));
      halo.addColorStop(1, hexA(colAccent, 0));
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      // inner sphere body — subtle lit gradient, offset toward top-left
      const body = ctx.createRadialGradient(
        cx - r * 0.35,
        cy - r * 0.35,
        0,
        cx,
        cy,
        r
      );
      body.addColorStop(0, hexA(colAccent, 0.1));
      body.addColorStop(0.7, hexA(colAccent, 0.03));
      body.addColorStop(1, hexA(colAccent, 0));
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = body;
      ctx.fill();

      // dotted surface — front hemisphere only, depth-shaded
      for (const d of dots) {
        // rotate around Y
        const x = d.x * cosS + d.z * sinS;
        const z = -d.x * sinS + d.z * cosS;
        if (z <= 0.02) continue; // back face
        const sx = cx + x * r;
        const sy = cy - d.y * r;
        const depth = 0.25 + z * 0.75; // 0..1 front-lit
        if (d.land) {
          ctx.beginPath();
          ctx.arc(sx, sy, 1.1 * depth + 0.35, 0, Math.PI * 2);
          ctx.fillStyle = hexA(colAccent, 0.85 * depth);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(sx, sy, 0.75 * depth + 0.2, 0, Math.PI * 2);
          ctx.fillStyle = hexA(colLine, 0.28 * depth);
          ctx.fill();
        }
      }

      // crisp limb to define the edge
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = hexA(colLine, 0.18);
      ctx.lineWidth = 1;
      ctx.stroke();

      // one elegant orbital ring, tilted
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.42);
      ctx.scale(1, 0.3);
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.28, 0, Math.PI * 2);
      ctx.strokeStyle = hexA(colCyan, 0.32);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // ISS travelling along the ring, with a soft glow
      const oa = t * 0.01;
      const ox = Math.cos(oa) * r * 1.28;
      const oy = Math.sin(oa) * r * 1.28;
      const rot = -0.42;
      const isx = cx + (ox * Math.cos(rot) - oy * 0.3 * Math.sin(rot));
      const isy = cy + (ox * Math.sin(rot) + oy * 0.3 * Math.cos(rot));
      const glow = ctx.createRadialGradient(isx, isy, 0, isx, isy, 9);
      glow.addColorStop(0, hexA(colCyan, 0.85));
      glow.addColorStop(1, hexA(colCyan, 0));
      ctx.beginPath();
      ctx.arc(isx, isy, 9, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(isx, isy, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = colCyan;
      ctx.fill();

      spin += 0.0014;
      t += 1;
      if (!reduceMotion) animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 460, height: 460 }}
      className="max-w-full h-auto"
      aria-label="Rotating dotted globe of Earth with a live orbital track"
    />
  );
}

/* ---------- Live UTC clock (mono telemetry) ---------- */

function useUTC() {
  const [dt, setDt] = useState({ time: "--:--:--", date: "" });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setDt({
        time: now.toLocaleTimeString("en-US", {
          timeZone: "UTC",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        date: now.toLocaleDateString("en-US", {
          timeZone: "UTC",
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return dt;
}

const modules = [
  {
    icon: Newspaper,
    title: "Space news",
    description: "Curated aerospace reporting from agencies worldwide, via the Spaceflight News API.",
  },
  {
    icon: Satellite,
    title: "Live ISS tracking",
    description: "The station's orbital position, streamed and updated as it circles the planet.",
  },
  {
    icon: Activity,
    title: "Earth events",
    description: "Earthquakes as they happen — magnitude, depth and location, mapped from USGS feeds.",
  },
  {
    icon: Rocket,
    title: "Launches",
    description: "Upcoming SpaceX manifests, mission profiles and the record of flights already flown.",
  },
  {
    icon: Globe,
    title: "NASA imagery",
    description: "The Astronomy Picture of the Day, paired with a plain-language scientific read.",
  },
  {
    icon: Zap,
    title: "Solar weather",
    description: "Kp index, solar flares and geomagnetic storm probability, before the aurora arrives.",
  },
];

const sources = ["NASA", "SpaceX", "USGS", "NOAA", "ISS"];

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.28], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.28], [0, -40]);
  const utc = useUTC();

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <div className="relative w-full">
      {/* ---------- Hero ---------- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-28 pb-16 overflow-hidden">
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="mb-10 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] backdrop-blur-md"
          >
            <span className="live-dot" />
            <span className="eyebrow !text-[var(--text-dim)]">Planet intelligence platform</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease, delay: 0.1 }}
            className="w-[260px] h-[260px] md:w-[360px] md:h-[360px] mb-8 flex items-center justify-center animate-float"
          >
            <WireframeGlobe />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.2 }}
            className="font-serif text-5xl md:text-6xl tracking-tight text-[var(--text)] mb-5 leading-[1.05]"
          >
            Mission control<br />
            <span className="italic text-[var(--text-dim)]">for the curious.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.3 }}
            className="text-base md:text-lg text-[var(--text-dim)] max-w-2xl leading-relaxed mb-8 font-light"
          >
            Live telemetry from NASA, SpaceX, USGS and NOAA — astronomy, launches,
            earthquakes and solar weather, unified in one calm interface.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-3 mb-10"
          >
            <Link href="/dashboard" className="btn-primary group">
              Open dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/news" className="btn-ghost">
              Read space news
            </Link>
          </motion.div>

          {/* Telemetry strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-xs text-[var(--text-faint)]"
          >
            <span className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
              <span className="tabular text-[var(--text-dim)] tracking-widest">{utc.time}</span>
              <span className="tracking-[0.2em] uppercase">UTC · {utc.date}</span>
            </span>
            <span className="hidden sm:block w-px h-3 bg-[var(--border-strong)]" />
            <span className="tracking-[0.2em] uppercase">Feeds: {sources.join(" · ")}</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ---------- Modules ---------- */}
      <section className="relative py-28 px-4 md:px-8 w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease }}
          className="max-w-2xl mb-16"
        >
          <div className="eyebrow mb-4">Modules</div>
          <h2 className="font-serif text-4xl md:text-5xl text-[var(--text)] mb-5 leading-[1.1]">
            Six live feeds, one interface.
          </h2>
          <p className="text-[var(--text-dim)] text-lg font-light leading-relaxed">
            Each module reads a real scientific source and renders it the same way — quiet,
            legible, and current. Nothing to configure; open it and it is already live.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease }}
                className="glass-panel p-7 group"
              >
                <div className="icon-tile w-11 h-11 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mb-6">
                  <Icon className="w-5 h-5 text-[var(--accent)]" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium text-[var(--text)] mb-2.5">{m.title}</h3>
                <p className="text-[var(--text-dim)] leading-relaxed font-light text-[15px]">
                  {m.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ---------- Closing CTA ---------- */}
      <section className="relative py-28 px-4 w-full max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease }}
          className="surface-card relative overflow-hidden px-8 py-16 md:px-16 md:py-20 text-center"
        >
          <div className="glow-blob glow-blue w-[500px] h-[400px] -top-40 left-1/2 -translate-x-1/2" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="eyebrow mb-5">Ready when you are</div>
            <h2 className="font-serif text-3xl md:text-5xl text-[var(--text)] mb-6 leading-[1.1] max-w-2xl">
              The whole planet, on one screen.
            </h2>
            <p className="text-[var(--text-dim)] text-lg font-light max-w-xl mb-10">
              No account, no setup. Open the dashboard and watch Earth and space report in.
            </p>
            <Link href="/dashboard" className="btn-primary group">
              Open dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
