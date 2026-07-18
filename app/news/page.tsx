"use client";

import { motion } from "framer-motion";
import { NewsGrid } from "@/components/news/news-grid";

export default function NewsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-6 lg:px-8 selection:bg-white/10">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[#71717a] text-xs font-medium tracking-widest uppercase">
                Global Aerospace Coverage
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl text-[#fafafa] tracking-tight mb-4">
              Space <span className="italic text-[#a1a1aa]">News</span>
            </h1>
            <p className="text-[#a1a1aa] text-lg max-w-xl font-light leading-relaxed">
              Real-time updates from international space agencies, commercial spaceflight
              companies, and scientific research publications.
            </p>
          </div>
          
          <div className="text-right hidden md:block">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md text-[#71717a] text-xs tracking-wider">
              Powered by Spaceflight News API
            </div>
          </div>
        </motion.div>

        {/* Separator */}
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" 
        />

        {/* News Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <NewsGrid />
        </motion.div>
      </div>
    </div>
  );
}
