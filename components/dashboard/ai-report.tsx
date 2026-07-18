"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";

interface AIReportProps {
  earthquakeCount: number;
}

export function AIReport({ earthquakeCount }: AIReportProps) {
  const { data, isLoading, isError } = useQuery<{ report: string }>({
    queryKey: ["ai-report", earthquakeCount],
    queryFn: async () => {
      const res = await fetch("/api/ai-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ earthquakeCount }),
      });
      if (!res.ok) throw new Error("Failed to fetch report");
      return res.json();
    },
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4 border border-violet-500/10 bg-gradient-to-r from-violet-500/[0.04] to-blue-500/[0.03]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#a1a1aa]" />
          </div>
          <span className="text-white/60 font-semibold text-sm">
            Daily Planet Report
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-white/20 text-xs">
          <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Generating..." : "Auto-generated"}
        </div>
      </div>

      <p className="text-white/45 text-sm leading-relaxed">
        {isLoading
          ? "Connecting to NEBULA Core. Analyzing orbital data, seismic activity, and solar parameters..."
          : isError
          ? "Unable to generate AI report at this time. Please check your connection."
          : data?.report}
      </p>
    </motion.div>
  );
}
