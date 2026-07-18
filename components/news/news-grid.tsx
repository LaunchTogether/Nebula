"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { NewsCard, SpaceflightArticle } from "./news-card";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface NewsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SpaceflightArticle[];
}

export function NewsGrid() {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["space-news"],
    queryFn: async ({ pageParam = "https://api.spaceflightnewsapi.net/v4/articles/?limit=12" }) => {
      const res = await fetch(pageParam);
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json() as Promise<NewsResponse>;
    },
    initialPageParam: "https://api.spaceflightnewsapi.net/v4/articles/?limit=12",
    getNextPageParam: (lastPage) => lastPage.next,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (status === "pending") {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#71717a] animate-spin" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="w-full text-center py-20 text-[#a1a1aa]">
        Failed to load news. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.pages.map((page, i) => (
          page.results.map((article, j) => (
            <NewsCard 
              key={article.id} 
              article={article} 
              index={j % 12} 
            />
          ))
        ))}
      </div>

      <div 
        ref={ref} 
        className="flex items-center justify-center py-8"
      >
        {isFetchingNextPage ? (
          <Loader2 className="w-5 h-5 text-[#71717a] animate-spin" />
        ) : hasNextPage ? (
          <span className="text-sm text-[#71717a]">Scroll for more</span>
        ) : (
          <span className="text-sm text-[#71717a]">You have reached the end</span>
        )}
      </div>
    </div>
  );
}
