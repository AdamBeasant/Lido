"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabList, Tab, TabPanel, Spinner, Button } from "@heroui/react";
import { useHoliday } from "@/hooks/use-holiday";
import { useWeather } from "@/hooks/use-weather";
import { HolidayHero } from "@/components/holiday/holiday-hero";
import { WeatherCard } from "@/components/weather/weather-card";
import { ForecastStrip } from "@/components/weather/forecast-strip";
import { Checklist } from "@/components/checklist/checklist";
import { RestaurantList } from "@/components/restaurants/restaurant-list";
import { ShareModal } from "@/components/holiday/share-modal";

export default function HolidayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { holiday, loading } = useHoliday(id);
  const weather = useWeather(holiday?.latitude ?? null, holiday?.longitude ?? null);
  const [showShare, setShowShare] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="sm" color="current" />
      </div>
    );
  }

  if (!holiday) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-neutral-500">Holiday not found</p>
          <Button
            variant="ghost"
            className="mt-2"
            onPress={() => router.push("/")}
          >
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <HolidayHero holiday={holiday} onBack={() => router.push("/")} />

      {/* Share button */}
      <div className="max-w-lg mx-auto px-4 py-3 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="border-neutral-200 text-neutral-600"
          onPress={() => setShowShare(true)}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          Share
        </Button>
      </div>

      {/* Members indicator */}
      {holiday.members && holiday.members.length > 1 && (
        <div className="max-w-lg mx-auto px-4 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {holiday.members.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className="w-6 h-6 rounded-full bg-neutral-200 border-2 border-white flex items-center justify-center"
                  title={m.profile?.display_name || ""}
                >
                  <span className="text-[10px] font-medium text-neutral-600">
                    {(m.profile?.display_name || "?")[0].toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
            <span className="text-xs text-neutral-400">
              {holiday.members.length} people sharing
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-lg mx-auto">
        <Tabs aria-label="Holiday sections" className="w-full">
          <TabList className="border-b border-neutral-100 px-4">
            <Tab id="overview" className="text-sm font-medium py-2.5 px-3">Overview</Tab>
            <Tab id="packing" className="text-sm font-medium py-2.5 px-3">Packing</Tab>
            <Tab id="todo" className="text-sm font-medium py-2.5 px-3">To-Do</Tab>
            <Tab id="restaurants" className="text-sm font-medium py-2.5 px-3">Food</Tab>
          </TabList>
          <TabPanel id="overview">
            <div className="px-4 py-4 space-y-4">
              {weather.current && (
                <WeatherCard
                  temp={weather.current.temp}
                  feelsLike={weather.current.feels_like}
                  description={weather.current.description}
                  icon={weather.current.icon}
                  humidity={weather.current.humidity}
                  windSpeed={weather.current.wind_speed}
                  label={`Weather in ${holiday.destination}`}
                />
              )}
              {weather.forecast.length > 0 && (
                <ForecastStrip forecast={weather.forecast} />
              )}
              {!weather.current && !weather.loading && (
                <div className="p-4 bg-neutral-50 rounded-2xl text-center">
                  <p className="text-sm text-neutral-400">
                    Weather data unavailable
                  </p>
                  <p className="text-xs text-neutral-300 mt-1">
                    Add coordinates to see the forecast
                  </p>
                </div>
              )}
            </div>
          </TabPanel>
          <TabPanel id="packing">
            <Checklist holidayId={id} listType="packing" />
          </TabPanel>
          <TabPanel id="todo">
            <Checklist holidayId={id} listType="todo" />
          </TabPanel>
          <TabPanel id="restaurants">
            <RestaurantList holidayId={id} />
          </TabPanel>
        </Tabs>
      </div>

      <ShareModal
        holidayId={id}
        isOpen={showShare}
        onClose={() => setShowShare(false)}
      />
    </div>
  );
}
