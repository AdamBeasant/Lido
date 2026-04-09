"use client";

import { useRouter } from "next/navigation";
import { HolidayForm } from "@/components/holiday/holiday-form";

export default function NewHolidayPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-neutral-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 text-neutral-500 hover:text-neutral-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-neutral-900">New holiday</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <HolidayForm />
      </main>
    </div>
  );
}
