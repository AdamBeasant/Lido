"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Holiday, HolidayMember, Profile } from "@/types/database";

interface HolidayDetail extends Holiday {
  members: (HolidayMember & { profile: Profile })[];
}

export function useHoliday(id: string) {
  const [holiday, setHoliday] = useState<HolidayDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchHoliday = useCallback(async () => {
    const { data, error } = await supabase
      .from("holidays")
      .select(`
        *,
        members:holiday_members(
          *,
          profile:profiles(*)
        )
      `)
      .eq("id", id)
      .single();

    if (!error && data) {
      setHoliday(data as unknown as HolidayDetail);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchHoliday();

    const channel = supabase
      .channel(`holiday-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "holidays", filter: `id=eq.${id}` },
        () => fetchHoliday()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "holiday_members", filter: `holiday_id=eq.${id}` },
        () => fetchHoliday()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, fetchHoliday]);

  const updateHoliday = async (updates: Partial<Holiday>) => {
    const { error } = await supabase
      .from("holidays")
      .update(updates)
      .eq("id", id);
    return { error };
  };

  const deleteHoliday = async () => {
    const { error } = await supabase.from("holidays").delete().eq("id", id);
    return { error };
  };

  return { holiday, loading, updateHoliday, deleteHoliday, refetch: fetchHoliday };
}
