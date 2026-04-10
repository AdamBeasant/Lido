import { differenceInDays, differenceInHours, format, isPast, isToday } from "date-fns";

export function getCountdown(startDate: string): string {
  const start = new Date(startDate);
  const now = new Date();

  if (isPast(start)) {
    return "Now";
  }

  const days = differenceInDays(start, now);

  if (days === 0) {
    const hours = differenceInHours(start, now);
    if (hours <= 0) return "Today";
    return `${hours}h`;
  }

  if (days === 1) return "Tomorrow";
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks}w ${days % 7}d`;
  }

  const months = Math.floor(days / 30);
  return `${months}mo`;
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${format(start, "d")} - ${format(end, "d MMM yyyy")}`;
  }

  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, "d MMM")} - ${format(end, "d MMM yyyy")}`;
  }

  return `${format(start, "d MMM yyyy")} - ${format(end, "d MMM yyyy")}`;
}

export function getTripDuration(startDate: string, endDate: string): number {
  return differenceInDays(new Date(endDate), new Date(startDate));
}

export function isTripActive(startDate: string, endDate: string): boolean {
  const now = new Date();
  return now >= new Date(startDate) && now <= new Date(endDate);
}

export function isTripPast(endDate: string): boolean {
  return isPast(new Date(endDate));
}

export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
