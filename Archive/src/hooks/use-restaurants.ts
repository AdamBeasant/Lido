"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Restaurant } from "@/types/database";
import { useUser } from "./use-user";

export function useRestaurants(holidayId: string) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { user } = useUser();

  const fetchRestaurants = useCallback(async () => {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("holiday_id", holidayId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setRestaurants(data);
    }
    setLoading(false);
  }, [holidayId]);

  useEffect(() => {
    fetchRestaurants();

    const channel = supabase
      .channel(`restaurants-${holidayId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "restaurants",
          filter: `holiday_id=eq.${holidayId}`,
        },
        () => fetchRestaurants()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [holidayId, fetchRestaurants]);

  const addRestaurant = async (restaurant: {
    name: string;
    cuisine?: string;
    notes?: string;
    url?: string;
  }) => {
    const { data, error } = await supabase
      .from("restaurants")
      .insert({
        holiday_id: holidayId,
        name: restaurant.name,
        cuisine: restaurant.cuisine || null,
        notes: restaurant.notes || null,
        url: restaurant.url || null,
        created_by: user?.id,
      })
      .select()
      .single();

    if (!error && data) {
      setRestaurants((prev) => [...prev, data]);
    }
    return { data, error };
  };

  const updateRestaurant = async (id: string, updates: Partial<Restaurant>) => {
    const { error } = await supabase
      .from("restaurants")
      .update(updates)
      .eq("id", id);

    if (!error) {
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
    }
    return { error };
  };

  const deleteRestaurant = async (id: string) => {
    const restaurant = restaurants.find((r) => r.id === id);
    setRestaurants((prev) => prev.filter((r) => r.id !== id));

    const { error } = await supabase.from("restaurants").delete().eq("id", id);

    if (error && restaurant) {
      setRestaurants((prev) => [...prev, restaurant]);
    }
  };

  const toggleBooked = async (id: string) => {
    const restaurant = restaurants.find((r) => r.id === id);
    if (!restaurant) return;

    const newBooked = !restaurant.booked;
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, booked: newBooked } : r))
    );

    const { error } = await supabase
      .from("restaurants")
      .update({ booked: newBooked })
      .eq("id", id);

    if (error) {
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? restaurant : r))
      );
    }
  };

  return {
    restaurants,
    loading,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant,
    toggleBooked,
    refetch: fetchRestaurants,
  };
}
