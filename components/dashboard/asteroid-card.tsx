"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertTriangle, Shield } from "lucide-react";
import { FavoriteButton } from "@/components/ui/favorite-button";

interface Asteroid {
  id: string;
  name: string;
  is_potentially_hazardous_asteroid: boolean;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  close_approach_data: {
    relative_velocity: { kilometers_per_hour: string };
    miss_distance: { kilometers: string };
    close_approach_date: string;
  }[];
}

interface SpaceData {
  asteroids: Asteroid[];
  solarFlares: unknown[];
}

export function AsteroidCard() {
  const { data, isLoading } = useQuery<SpaceData>({
    queryKey: ["space"],
    queryFn: () => fetch("/api/space").then((r) => r.json()),
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) {
    return <div className="glass-panel h-64 skeleton" />;
  }

  const asteroids = data?.asteroids || [];
  const hazardous = asteroids.filter((a) => a.is_potentially_hazardous_asteroid);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4"
    >
      {/* Summary */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-xl bg-orange-500/5 border border-orange-500/10 p-3 text-center">
          <div className="text-2xl font-bold font-mono text-[#a1a1aa] mb-0.5">
            {hazardous.length}
          </div>
          <div className="text-white/30 text-[10px] uppercase tracking-wide">
            Hazardous
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 text-center">
          <div className="text-2xl font-bold font-mono text-white/60 mb-0.5">
            {asteroids.length}
          </div>
          <div className="text-white/30 text-[10px] uppercase tracking-wide">
            Total Today
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {asteroids.slice(0, 5).map((asteroid) => {
          const approach = asteroid.close_approach_data?.[0];
          const isHazardous = asteroid.is_potentially_hazardous_asteroid;
          const diameterAvg =
            (asteroid.estimated_diameter.kilometers.estimated_diameter_min +
              asteroid.estimated_diameter.kilometers.estimated_diameter_max) /
            2;

          return (
            <div
              key={asteroid.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isHazardous
                  ? "bg-orange-500/5 border-orange-500/15"
                  : "bg-white/[0.02] border-white/[0.04]"
              }`}
            >
              <div className="flex-shrink-0">
                {isHazardous ? (
                  <AlertTriangle className="w-4 h-4 text-[#a1a1aa]" />
                ) : (
                  <Shield className="w-4 h-4 text-white/20" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-xs font-medium truncate">
                  {asteroid.name.replace(/[()]/g, "")}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-white/25 text-[10px]">
                    ⌀ {(diameterAvg * 1000).toFixed(0)}m
                  </span>
                  {approach && (
                    <>
                      <span className="text-white/15 text-[10px]">·</span>
                      <span className="text-white/25 text-[10px]">
                        {(
                          parseFloat(approach.miss_distance.kilometers) /
                          1_000_000
                        ).toFixed(2)}
                        M km away
                      </span>
                    </>
                  )}
                </div>
              </div>
              {approach && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-[10px] text-white/25 font-mono">
                    {parseFloat(
                      approach.relative_velocity.kilometers_per_hour
                    ).toFixed(0)}{" "}
                    km/h
                  </div>
                  <FavoriteButton 
                    item={{
                      id: `asteroid-${asteroid.id}`,
                      type: 'asteroid',
                      title: asteroid.name.replace(/[()]/g, ""),
                      subtitle: `⌀ ${(diameterAvg * 1000).toFixed(0)}m - ${(parseFloat(approach.miss_distance.kilometers) / 1_000_000).toFixed(2)}M km away`,
                      date: approach.close_approach_date,
                      data: asteroid
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {asteroids.length === 0 && (
        <div className="text-center py-8 text-white/25 text-sm">
          No asteroid data available today
        </div>
      )}
    </motion.div>
  );
}
