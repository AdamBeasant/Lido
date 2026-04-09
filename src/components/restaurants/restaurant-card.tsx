"use client";

import { Chip } from "@heroui/react";
import { Restaurant } from "@/types/database";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onToggleBooked: (id: string) => void;
  onDelete: (id: string) => void;
}

export function RestaurantCard({ restaurant, onToggleBooked, onDelete }: RestaurantCardProps) {
  return (
    <div className="flex items-start gap-3 p-4 border-b border-neutral-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-neutral-800 truncate">
            {restaurant.name}
          </h4>
          {restaurant.booked && (
            <Chip size="sm" variant="soft" className="bg-emerald-50 text-emerald-600 text-[10px]">
              Booked
            </Chip>
          )}
        </div>
        {restaurant.cuisine && (
          <p className="text-xs text-neutral-400 mt-0.5">{restaurant.cuisine}</p>
        )}
        {restaurant.notes && (
          <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{restaurant.notes}</p>
        )}
        {restaurant.url && (
          <a
            href={restaurant.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:text-blue-600 mt-1 inline-block"
          >
            View on map
          </a>
        )}

        {/* Star rating */}
        {restaurant.rating && (
          <div className="flex gap-0.5 mt-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= restaurant.rating! ? "text-amber-400" : "text-neutral-200"
                }`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onToggleBooked(restaurant.id)}
          className={`p-1.5 rounded-lg transition-colors ${
            restaurant.booked
              ? "text-emerald-500 bg-emerald-50"
              : "text-neutral-300 hover:text-neutral-400 hover:bg-neutral-50"
          }`}
          title={restaurant.booked ? "Mark as not booked" : "Mark as booked"}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(restaurant.id)}
          className="p-1.5 rounded-lg text-neutral-300 hover:text-red-400 hover:bg-red-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
