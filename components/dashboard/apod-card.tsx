"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Share2, Maximize2, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { FavoriteButton } from "@/components/ui/favorite-button";

interface APODData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  date: string;
  copyright?: string;
}

export function APODCard() {
  const [fullscreen, setFullscreen] = useState(false);

  const { data, isLoading } = useQuery<APODData>({
    queryKey: ["apod"],
    queryFn: () => fetch("/api/apod").then((r) => r.json()),
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) {
    return (
      <div className="glass-panel h-80 skeleton" aria-busy="true" />
    );
  }

  if (!data || data.media_type === "video") {
    return (
      <div className="glass-panel p-6 flex items-center justify-center h-80 text-white/30">
        <p>Today&apos;s APOD is a video. <a href={data?.url} target="_blank" rel="noopener noreferrer" className="text-[#a1a1aa] hover:underline">Watch it here</a></p>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: data.title, url: data.url });
    } else {
      await navigator.clipboard.writeText(data.url);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel overflow-hidden"
      >
        {/* Image */}
        <div className="relative h-56 md:h-72 overflow-hidden">
          <Image
            src={data.url}
            alt={data.title}
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

          {/* Overlay actions */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={() => setFullscreen(true)}
              className="w-8 h-8 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60 transition-all"
              aria-label="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-bold text-lg leading-tight mb-1">
              {data.title}
            </h3>
            <p className="text-white/50 text-xs">
              {data.date}
              {data.copyright && ` · © ${data.copyright}`}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-white/50 text-sm leading-relaxed line-clamp-3">
            {data.explanation}
          </p>

          <div className="flex items-center gap-2 mt-4">
            {data?.date && (
              <FavoriteButton 
                item={{
                  id: `apod-${data.date}`,
                  type: 'apod',
                  title: data.title || 'APOD',
                  subtitle: data.date,
                  imageUrl: data.url,
                  date: data.date,
                  data
                }} 
              />
            )}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/40 text-xs font-medium hover:text-white/70 transition-all"
              aria-label="Share"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <a
              href={data.hdurl || data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/40 text-xs font-medium hover:text-white/70 transition-all ml-auto"
            >
              HD <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setFullscreen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={data.hdurl || data.url}
              alt={data.title}
              width={1920}
              height={1080}
              className="rounded-xl object-contain max-h-[80vh] w-auto mx-auto"
              unoptimized
            />
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/60 text-white/60 hover:text-white flex items-center justify-center"
              aria-label="Close fullscreen"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
