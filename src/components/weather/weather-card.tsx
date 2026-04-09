"use client";

import { getWeatherIconUrl } from "@/lib/utils";

interface WeatherCardProps {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  label?: string;
}

export function WeatherCard({
  temp,
  feelsLike,
  description,
  icon,
  humidity,
  windSpeed,
  label = "Current weather",
}: WeatherCardProps) {
  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl">
      <p className="text-xs text-neutral-500 font-medium mb-2">{label}</p>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-light text-neutral-900">
              {Math.round(temp)}
            </span>
            <span className="text-lg text-neutral-400">°C</span>
          </div>
          <p className="text-sm text-neutral-500 capitalize mt-1">{description}</p>
          <p className="text-xs text-neutral-400 mt-0.5">
            Feels like {Math.round(feelsLike)}°C
          </p>
        </div>
        <img
          src={getWeatherIconUrl(icon)}
          alt={description}
          className="w-16 h-16"
        />
      </div>
      <div className="flex gap-4 mt-3 pt-3 border-t border-blue-100">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636" />
          </svg>
          <span className="text-xs text-neutral-500">{humidity}% humidity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
          </svg>
          <span className="text-xs text-neutral-500">{Math.round(windSpeed)} km/h</span>
        </div>
      </div>
    </div>
  );
}
