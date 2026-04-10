"use client";

import { useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { useRestaurants } from "@/hooks/use-restaurants";
import { RestaurantCard } from "./restaurant-card";
import { RestaurantForm } from "./restaurant-form";

interface RestaurantListProps {
  holidayId: string;
}

export function RestaurantList({ holidayId }: RestaurantListProps) {
  const { restaurants, loading, addRestaurant, deleteRestaurant, toggleBooked } =
    useRestaurants(holidayId);
  const [showForm, setShowForm] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="sm" color="current" />
      </div>
    );
  }

  return (
    <div className="pb-4">
      {restaurants.length > 0 ? (
        <div>
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onToggleBooked={toggleBooked}
              onDelete={deleteRestaurant}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-neutral-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.126-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M16.5 3.75V16.5" />
            </svg>
          </div>
          <p className="text-sm text-neutral-400">No restaurants yet</p>
          <p className="text-xs text-neutral-300 mt-1">
            Add places you want to try
          </p>
        </div>
      )}

      <div className="px-4 mt-4">
        <Button
          variant="outline"
          className="w-full border-dashed border-neutral-200 text-neutral-500"
          onPress={() => setShowForm(true)}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add restaurant
        </Button>
      </div>

      <RestaurantForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={addRestaurant}
      />
    </div>
  );
}
