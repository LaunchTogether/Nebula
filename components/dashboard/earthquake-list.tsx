"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Maximize2, X, MapPin, Clock, Waves, Bell } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { useNotifications } from "@/hooks/use-notifications";

interface EarthquakeFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    tsunami: number;
    status: string;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

function getMagColor(mag: number) {
  if (mag >= 7) return { text: "text-red-400", bg: "bg-red-500", ring: "ring-red-500/30" };
  if (mag >= 6) return { text: "text-[#a1a1aa]", bg: "bg-orange-500", ring: "ring-orange-500/30" };
  if (mag >= 5) return { text: "text-[#a1a1aa]", bg: "bg-yellow-500", ring: "ring-yellow-500/30" };
  return { text: "text-[#a1a1aa]", bg: "bg-emerald-500", ring: "ring-emerald-500/20" };
}

function MagBadge({ mag }: { mag: number }) {
  const colors = getMagColor(mag);
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ring-1 ${colors.ring} ${colors.bg}/10`}
    >
      <span className={`text-xs font-bold font-mono ${colors.text}`}>
        {mag.toFixed(1)}
      </span>
    </div>
  );
}

export function EarthquakeList() {
  const [selected, setSelected] = useState<EarthquakeFeature | null>(null);
  const { permission, requestPermission, sendNotification } = useNotifications();
  const notifiedIds = useRef<Set<string>>(new Set());

  const { data, isLoading } = useQuery<{ features: EarthquakeFeature[] }>({
    queryKey: ["earthquakes"],
    queryFn: () => fetch("/api/earthquakes").then((r) => r.json()),
    refetchInterval: 1000 * 60 * 10,
  });

  const quakes = data?.features?.slice(0, 15) || [];

  // Check for new major earthquakes
  useEffect(() => {
    if (!data?.features || permission !== 'granted') return;

    data.features.forEach(quake => {
      const isMajor = quake.properties.mag >= 6.5;
      const isNew = !notifiedIds.current.has(quake.id);

      if (isMajor && isNew) {
        sendNotification(`Major Earthquake Alert!`, {
          body: `M${quake.properties.mag.toFixed(1)} detected near ${quake.properties.place}`,
          icon: '/favicon.ico'
        });
        notifiedIds.current.add(quake.id);
      } else if (isNew) {
        // Just keep track of them so we don't notify if they get updated
        notifiedIds.current.add(quake.id);
      }
    });
  }, [data, permission, sendNotification]);

  if (isLoading) {
    return <div className="glass-panel h-64 skeleton" />;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel overflow-hidden"
      >
        <div className="flex items-center justify-between p-3 border-b border-white/[0.03]">
          <span className="text-white/60 text-xs font-semibold uppercase tracking-widest pl-2">Recent Quakes</span>
          {permission === 'default' && (
            <button
              onClick={requestPermission}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.03] hover:bg-white/[0.06] text-white/40 text-[10px] transition-colors border border-white/[0.06]"
              title="Enable notifications for major earthquakes (>6.5)"
            >
              <Bell className="w-3 h-3" />
              Enable Alerts
            </button>
          )}
        </div>
        <div className="divide-y divide-white/[0.03]">
          {quakes.map((quake, i) => {
            const colors = getMagColor(quake.properties.mag);
            return (
              <motion.button
                key={quake.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelected(quake)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors text-left group"
                aria-label={`Magnitude ${quake.properties.mag} earthquake near ${quake.properties.place}`}
              >
                <MagBadge mag={quake.properties.mag} />
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm font-medium truncate">
                    {quake.properties.place}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-white/25 text-xs">
                      {formatDistanceToNow(quake.properties.time, {
                        addSuffix: true,
                      })}
                    </span>
                    <span className="text-white/15 text-xs">·</span>
                    <span className="text-white/25 text-xs">
                      Depth: {quake.geometry.coordinates[2].toFixed(1)}km
                    </span>
                    {quake.properties.tsunami === 1 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-[#a1a1aa] font-medium">
                        <Waves className="w-2.5 h-2.5" />
                        Tsunami
                      </span>
                    )}
                  </div>
                </div>
                <Maximize2 className="w-3 h-3 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel p-6 max-w-md w-full border border-white/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MagBadge mag={selected.properties.mag} />
                  <div>
                    <div
                      className={`text-2xl font-bold font-mono ${getMagColor(selected.properties.mag).text}`}
                    >
                      M{selected.properties.mag.toFixed(1)}
                    </div>
                    <div className="text-white/30 text-xs">Magnitude</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/40 hover:text-white/70"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <FavoriteButton 
                  item={{
                    id: `earthquake-${selected.id}`,
                    type: 'earthquake',
                    title: `M${selected.properties.mag.toFixed(1)} Earthquake`,
                    subtitle: selected.properties.place,
                    date: new Date(selected.properties.time).toISOString(),
                    data: selected
                  }}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-white/30 mt-0.5" />
                  <span className="text-white/70 text-sm">
                    {selected.properties.place}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white/30" />
                  <span className="text-white/50 text-sm">
                    {new Date(selected.properties.time).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    {
                      label: "Depth",
                      value: `${selected.geometry.coordinates[2].toFixed(1)}km`,
                    },
                    {
                      label: "Lat",
                      value: `${selected.geometry.coordinates[1].toFixed(3)}°`,
                    },
                    {
                      label: "Lon",
                      value: `${selected.geometry.coordinates[0].toFixed(3)}°`,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white/[0.03] rounded-lg p-3 text-center"
                    >
                      <div className="text-white/25 text-[10px] uppercase tracking-wide mb-1">
                        {stat.label}
                      </div>
                      <div className="text-white/70 text-sm font-mono font-semibold">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>

                {selected.properties.tsunami === 1 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[#a1a1aa] text-sm">
                    <Waves className="w-4 h-4" />
                    Tsunami warning issued for this event
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
