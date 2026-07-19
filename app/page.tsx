"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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

// The 3D globe is a client-only, lazily-loaded island so it never blocks the
// hero's first paint and stays out of every other route's bundle.
const Globe3D = dynamic(() => import("@/components/earth/globe-3d"), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

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
            className="w-[300px] h-[300px] md:w-[440px] md:h-[440px] mb-6"
          >
            <Globe3D />
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
