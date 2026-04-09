import { NextResponse } from "next/server";

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "query required" }, { status: 400 });
  }

  if (!ACCESS_KEY) {
    // Return fallback images if Unsplash not configured
    return NextResponse.json([
      {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
        thumb: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&q=80",
        credit: "Unsplash",
      },
      {
        url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80",
        thumb: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=300&q=80",
        credit: "Unsplash",
      },
      {
        url: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1200&q=80",
        thumb: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=300&q=80",
        credit: "Unsplash",
      },
    ]);
  }

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`,
    {
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
      },
    }
  );

  const data = await res.json();

  const images = data.results.map((photo: any) => ({
    url: `${photo.urls.raw}&w=1200&q=80&fit=crop`,
    thumb: photo.urls.small,
    credit: `${photo.user.name} on Unsplash`,
  }));

  return NextResponse.json(images);
}
