'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface BannerItem {
  id: string;
  type: 'survey' | 'post';
  label: string;
  text: string;
}

interface RollingBannerProps {
  items: BannerItem[];
  /** 롤링 간격 (ms), 기본 3000 */
  interval?: number;
  onItemClick?: (item: BannerItem) => void;
}

export default function RollingBanner({
  items,
  interval = 3000,
  onItemClick,
}: RollingBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleItems = items.length > 0 ? items : [];
  const lineCount = 2;

  const advance = useCallback(() => {
    setCurrentIndex((prev) => (prev + lineCount) % Math.max(visibleItems.length, 1));
  }, [visibleItems.length]);

  useEffect(() => {
    if (visibleItems.length <= lineCount) return;
    const timer = setInterval(advance, interval);
    return () => clearInterval(timer);
  }, [advance, interval, visibleItems.length]);

  if (visibleItems.length === 0) return null;

  const lines: BannerItem[] = [];
  for (let i = 0; i < lineCount; i++) {
    const idx = (currentIndex + i) % visibleItems.length;
    lines.push(visibleItems[idx]);
  }

  const labelColors: Record<string, string> = {
    survey: 'bg-purple-100 text-purple-700',
    post: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-gray-100 bg-white/80 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-1.5">
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
          NEW
        </span>
        <div className="flex flex-1 flex-col gap-0.5">
          {lines.map((item, i) => (
            <button
              key={`${item.id}-${i}`}
              className="flex items-center gap-2 text-left text-sm transition hover:text-accent"
              onClick={() => onItemClick?.(item)}
            >
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${labelColors[item.type] || 'bg-gray-100 text-gray-700'}`}
              >
                {item.label}
              </span>
              <span className="truncate text-navy-700">{item.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
