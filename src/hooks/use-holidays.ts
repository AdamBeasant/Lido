"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Holiday } from "@/types/database";

export function useHolidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchHolidays = useCallback(async () => {
    const { data, error } = await supabase
      .from("holidays")
      .select("*")
      .order("start_date", { ascending: true });

    if (!error && data) {
      setHolidays(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHolidays();

    const channel = supabase
      .channel("holidays-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "holidays" },
        () => {
          fetchHolidays();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "holiday_members" },
        () => {
          fetchHolidays();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchHolidays]);

  return { holidays, loading, refetch: fetchHolidays };
}
