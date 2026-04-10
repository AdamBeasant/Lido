"use client";

import { Chip } from "@heroui/react";
import { getCountdown, isTripActive, isTripPast } from "@/lib/utils";

interface CountdownBadgeProps {
  startDate: string;
  endDate: string;
}

export function CountdownBadge({ startDate, endDate }: CountdownBadgeProps) {
  if (isTripPast(endDate)) {
    return (
      <Chip size="sm" variant="soft" className="bg-neutral-100 text-neutral-500 text-xs font-medium">
        Past
      </Chip>
    );
  }

  if (isTripActive(startDate, endDate)) {
    return (
      <Chip size="sm" variant="soft" className="bg-emerald-50 text-emerald-600 text-xs font-medium">
        Now
      </Chip>
    );
  }

  const countdown = getCountdown(startDate);

  return (
    <Chip size="sm" variant="soft" className="bg-blue-50 text-blue-600 text-xs font-medium">
      {countdown}
    </Chip>
  );
}
