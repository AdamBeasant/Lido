import { NextResponse } from "next/server";

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const BASE_URL = "https://api.openweathermap.org";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (!API_KEY) {
    return NextResponse.json({ error: "Weather API not configured" }, { status: 503 });
  }

  // Geocoding
  if (type === "geo") {
    const query = searchParams.get("query");
    if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

    const res = await fetch(
      `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${API_KEY}`
    );
    const data = await res.json();
    if (data.length > 0) {
      return NextResponse.json({ lat: data[0].lat, lon: data[0].lon });
    }
    return NextResponse.json({ lat: null, lon: null });
  }

  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  // Current weather
  if (type === "current") {
    const res = await fetch(
      `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    const data = await res.json();

    return NextResponse.json({
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed * 3.6, // Convert m/s to km/h
    });
  }

  // 5-day forecast
  if (type === "forecast") {
    const res = await fetch(
      `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    const data = await res.json();

    // Group by day and get min/max
    const days: Record<string, { temps: number[]; icons: string[]; descriptions: string[] }> = {};

    for (const item of data.list) {
      const date = item.dt_txt.split(" ")[0];
      if (!days[date]) {
        days[date] = { temps: [], icons: [], descriptions: [] };
      }
      days[date].temps.push(item.main.temp);
      days[date].icons.push(item.weather[0].icon);
      days[date].descriptions.push(item.weather[0].description);
    }

    const forecast = Object.entries(days).slice(0, 5).map(([date, d]) => ({
      date,
      temp_min: Math.min(...d.temps),
      temp_max: Math.max(...d.temps),
      icon: d.icons[Math.floor(d.icons.length / 2)], // Midday icon
      description: d.descriptions[Math.floor(d.descriptions.length / 2)],
    }));

    return NextResponse.json(forecast);
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
