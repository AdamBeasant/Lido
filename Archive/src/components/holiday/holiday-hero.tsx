"use client";

import { Holiday } from "@/types/database";
import { CountdownBadge } from "./countdown-badge";
import { formatDateRange, getTripDuration } from "@/lib/utils";

interface HolidayHeroProps {
  holiday: Holiday;
  onBack: () => void;
}

export function HolidayHero({ holiday, onBack }: HolidayHeroProps) {
  const fallbackImage = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80`;
  const duration = getTripDuration(holiday.start_date, holiday.end_date);

  return (
    <div className="relative h-64 w-full overflow-hidden">
      <img
        src={holiday.image_url || fallbackImage}
        alt={holiday.destination}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Countdown badge */}
      <div className="absolute top-4 right-4">
        <CountdownBadge startDate={holiday.start_date} endDate={holiday.end_date} />
      </div>

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h1 className="text-white font-bold text-2xl leading-tight">
          {holiday.name}
        </h1>
        <p className="text-white/80 text-sm mt-1">
          {holiday.destination}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-white/70 text-xs">
            {formatDateRange(holiday.start_date, holiday.end_date)}
          </span>
          <span className="text-white/40">·</span>
          <span className="text-white/70 text-xs">
            {duration} {duration === 1 ? "night" : "nights"}
          </span>
        </div>
      </div>
    </div>
  );
}
