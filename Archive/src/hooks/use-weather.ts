"use client";

import { useEffect, useState, useCallback } from "react";

interface WeatherData {
  temp: number;
  feels_like: number;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
}

interface ForecastDay {
  date: string;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
}

interface WeatherState {
  current: WeatherData | null;
  forecast: ForecastDay[];
  loading: boolean;
  error: string | null;
}

export function useWeather(lat: number | null, lon: number | null) {
  const [state, setState] = useState<WeatherState>({
    current: null,
    forecast: [],
    loading: true,
    error: null,
  });

  const fetchWeather = useCallback(async () => {
    if (!lat || !lon) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`/api/weather?lat=${lat}&lon=${lon}&type=current`),
        fetch(`/api/weather?lat=${lat}&lon=${lon}&type=forecast`),
      ]);

      if (currentRes.ok) {
        const currentData = await currentRes.json();
        setState((s) => ({ ...s, current: currentData }));
      }

      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        setState((s) => ({ ...s, forecast: forecastData }));
      }
    } catch {
      setState((s) => ({ ...s, error: "Failed to load weather" }));
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [lat, lon]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return state;
}
