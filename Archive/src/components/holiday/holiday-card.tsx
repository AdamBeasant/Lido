"use client";

import { Card, CardContent } from "@heroui/react";
import { useRouter } from "next/navigation";
import { Holiday } from "@/types/database";
import { CountdownBadge } from "./countdown-badge";
import { formatDateRange } from "@/lib/utils";

interface HolidayCardProps {
  holiday: Holiday;
}

export function HolidayCard({ holiday }: HolidayCardProps) {
  const router = useRouter();

  const fallbackImage = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80`;

  return (
    <button
      onClick={() => router.push(`/holiday/${holiday.id}`)}
      className="w-full text-left"
    >
      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={holiday.image_url || fallbackImage}
            alt={holiday.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold text-lg leading-tight">
              {holiday.name}
            </h3>
            <p className="text-white/80 text-sm mt-0.5">
              {holiday.destination}
            </p>
          </div>
          <div className="absolute top-3 right-3">
            <CountdownBadge startDate={holiday.start_date} endDate={holiday.end_date} />
          </div>
        </div>
        <CardContent className="px-4 py-3">
          <p className="text-neutral-500 text-sm">
            {formatDateRange(holiday.start_date, holiday.end_date)}
          </p>
        </CardContent>
      </Card>
    </button>
  );
}
