"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Rocket, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useState, useEffect } from "react";
import { FavoriteButton } from "@/components/ui/favorite-button";

interface Launch {
  id: string;
  name: string;
  date_utc: string;
  success: boolean | null;
  details: string | null;
  links: { patch: { small: string | null } };
  rocket: string;
  launchpad: string;
}

interface SpaceXData {
  latest: Launch;
  upcoming: Launch[];
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Launched!");
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${d}d ${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div
      className="text-[#a1a1aa] font-mono text-sm font-semibold"
      aria-live="polite"
    >
      {timeLeft}
    </div>
  );
}

export function SpaceXCard() {
  const { data, isLoading } = useQuery<SpaceXData>({
    queryKey: ["spacex"],
    queryFn: () => fetch("/api/spacex").then((r) => r.json()),
    staleTime: 1000 * 60 * 30,
  });

  if (isLoading) {
    return <div className="glass-panel h-72 skeleton" />;
  }

  const latest = data?.latest;
  const nextLaunch = data?.upcoming?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-5 space-y-4"
    >
      {/* Latest Launch */}
      {latest && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-400" />
              <span className="text-xs text-white/30 uppercase tracking-widest">Latest Launch</span>
            </div>
            <FavoriteButton 
              item={{
                id: `spacex-${latest.id}`,
                type: 'spacex',
                title: latest.name,
                subtitle: format(new Date(latest.date_utc), "MMM d, yyyy"),
                imageUrl: latest.links?.patch?.small || undefined,
                date: latest.date_utc,
                data: latest
              }}
            />
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
              {latest.links?.patch?.small ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={latest.links.patch.small}
                  alt={latest.name}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <Rocket className="w-4 h-4 text-[#a1a1aa]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-white/80 font-semibold text-sm truncate">
                  {latest.name}
                </h4>
                {latest.success === true && (
                  <CheckCircle className="w-3.5 h-3.5 text-[#a1a1aa] flex-shrink-0" />
                )}
                {latest.success === false && (
                  <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 text-white/30 text-xs">
                <Calendar className="w-3 h-3" />
                {format(new Date(latest.date_utc), "MMM d, yyyy")}
              </div>
              {latest.details && (
                <p className="text-white/30 text-xs mt-1 line-clamp-2">
                  {latest.details}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="section-divider" />

      {/* Next Launch */}
      {nextLaunch && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/30 uppercase tracking-widest">Next Launch</span>
            </div>
            <FavoriteButton 
              item={{
                id: `spacex-${nextLaunch.id}`,
                type: 'spacex',
                title: nextLaunch.name,
                subtitle: format(new Date(nextLaunch.date_utc), "MMM d, yyyy"),
                imageUrl: nextLaunch.links?.patch?.small || undefined,
                date: nextLaunch.date_utc,
                data: nextLaunch
              }}
            />
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
              {nextLaunch.links?.patch?.small ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={nextLaunch.links.patch.small}
                  alt={nextLaunch.name}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <Rocket className="w-4 h-4 text-[#a1a1aa]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white/80 font-semibold text-sm mb-1">
                {nextLaunch.name}
              </h4>
              <div className="flex items-center gap-1 text-white/30 text-xs mb-2">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(nextLaunch.date_utc), {
                  addSuffix: true,
                })}
              </div>
              <CountdownTimer targetDate={nextLaunch.date_utc} />
            </div>
          </div>
        </div>
      )}

      {/* Upcoming list */}
      {data?.upcoming && data.upcoming.length > 1 && (
        <>
          <div className="section-divider" />
          <div className="space-y-1">
            {data.upcoming.slice(1, 4).map((launch) => (
              <div
                key={launch.id}
                className="flex items-center justify-between py-1.5 text-xs"
              >
                <span className="text-white/40 truncate flex-1">
                  {launch.name}
                </span>
                <span className="text-white/25 ml-2 flex-shrink-0">
                  {format(new Date(launch.date_utc), "MMM d")}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
