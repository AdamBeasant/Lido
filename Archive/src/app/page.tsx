"use client";

import { Button, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useHolidays } from "@/hooks/use-holidays";
import { HolidayCard } from "@/components/holiday/holiday-card";
import { UserMenu } from "@/components/auth/user-menu";

export default function HomePage() {
  const { holidays, loading } = useHolidays();
  const router = useRouter();

  const upcoming = holidays.filter(
    (h) => new Date(h.end_date) >= new Date()
  );
  const past = holidays.filter(
    (h) => new Date(h.end_date) < new Date()
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-neutral-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-neutral-900">Lido</h1>
          <UserMenu />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="sm" color="current" />
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                  Upcoming
                </h2>
                <div className="space-y-4">
                  {upcoming.map((holiday) => (
                    <HolidayCard key={holiday.id} holiday={holiday} />
                  ))}
                </div>
              </section>
            )}

            {/* Past */}
            {past.length > 0 && (
              <section className={upcoming.length > 0 ? "mt-8" : ""}>
                <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                  Past
                </h2>
                <div className="space-y-4 opacity-60">
                  {past.map((holiday) => (
                    <HolidayCard key={holiday.id} holiday={holiday} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {holidays.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-neutral-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-700">No holidays yet</h3>
                <p className="text-sm text-neutral-400 mt-1 mb-6">
                  Start planning your next adventure
                </p>
              </div>
            )}

            {/* Add button */}
            <div className="mt-6">
              <Button
                className="w-full h-12 bg-neutral-900 text-white font-medium"
                onPress={() => router.push("/holiday/new")}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Plan a holiday
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
