"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Newspaper } from "lucide-react";

export interface SpaceflightArticle {
  id: number;
  title: string;
  url: string;
  image_url: string;
  news_site: string;
  summary: string;
  published_at: string;
  updated_at: string;
  featured: boolean;
}

interface NewsCardProps {
  article: SpaceflightArticle;
  index: number;
}

export function NewsCard({ article, index }: NewsCardProps) {
  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel group overflow-hidden flex flex-col h-full"
    >
      <div className="relative h-48 md:h-56 w-full overflow-hidden bg-white/5">
        {article.image_url ? (
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#71717a]">
            <Newspaper className="w-8 h-8 opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
        
        {/* News Site Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-2.5 py-1 text-[10px] font-medium tracking-wider text-white uppercase bg-black/60 backdrop-blur-md rounded-full border border-white/10">
            {article.news_site}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-serif text-lg md:text-xl font-medium text-[#fafafa] leading-snug mb-3 group-hover:text-[#d97757] transition-colors line-clamp-3">
          {article.title}
        </h3>
        <p className="text-[#a1a1aa] text-sm leading-relaxed mb-4 line-clamp-3 flex-1 font-light">
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <span className="text-xs text-[#71717a] font-mono tracking-wide">
            {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#71717a] group-hover:text-[#fafafa] transition-colors">
            Read Article
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.a>
  );
}
