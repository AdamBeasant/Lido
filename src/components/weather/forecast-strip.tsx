"use client";

import { format } from "date-fns";
import { getWeatherIconUrl } from "@/lib/utils";

interface ForecastDay {
  date: string;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
}

interface ForecastStripProps {
  forecast: ForecastDay[];
}

export function ForecastStrip({ forecast }: ForecastStripProps) {
  if (forecast.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-xs text-neutral-500 font-medium mb-2 px-4">5-day forecast</p>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-2">
        {forecast.map((day, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-20 p-2 bg-neutral-50 rounded-xl text-center"
          >
            <p className="text-xs text-neutral-500 font-medium">
              {format(new Date(day.date), "EEE")}
            </p>
            <img
              src={getWeatherIconUrl(day.icon)}
              alt={day.description}
              className="w-10 h-10 mx-auto"
            />
            <div className="flex justify-center gap-1 text-xs">
              <span className="font-medium text-neutral-700">{Math.round(day.temp_max)}°</span>
              <span className="text-neutral-400">{Math.round(day.temp_min)}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
