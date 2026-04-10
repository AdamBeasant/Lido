"use client";

import { useMemo } from "react";
import { useChecklistItems } from "@/hooks/use-checklist-items";
import { ChecklistCategory } from "./checklist-category";
import { ProgressBar } from "./progress-bar";
import { QuickAdd } from "./quick-add";
import { ChecklistItem } from "@/types/database";
import { Spinner } from "@heroui/react";

interface ChecklistProps {
  holidayId: string;
  listType: "packing" | "todo";
}

export function Checklist({ holidayId, listType }: ChecklistProps) {
  const {
    items,
    loading,
    addItem,
    toggleItem,
    deleteItem,
    reorderItems,
    checkedCount,
    totalCount,
  } = useChecklistItems(holidayId, listType);

  const categorizedItems = useMemo(() => {
    const groups: Record<string, ChecklistItem[]> = {};
    items.forEach((item) => {
      const cat = item.category || "General";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [items]);

  const categories = Object.keys(categorizedItems);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="sm" color="current" />
      </div>
    );
  }

  return (
    <div className="pb-4">
      {/* Progress */}
      <div className="px-4 py-3">
        <ProgressBar
          checked={checkedCount}
          total={totalCount}
          label={listType === "packing" ? "packed" : "done"}
        />
      </div>

      {/* Categories */}
      {categories.length > 0 ? (
        categories.map((category) => (
          <ChecklistCategory
            key={category}
            category={category}
            items={categorizedItems[category]}
            onToggle={toggleItem}
            onDelete={deleteItem}
            onAdd={addItem}
            onReorder={(reordered) => {
              const allItems = items.map((item) => {
                const reorderedItem = reordered.find((r) => r.id === item.id);
                return reorderedItem || item;
              });
              reorderItems(allItems);
            }}
          />
        ))
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-neutral-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              {listType === "packing" ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
          </div>
          <p className="text-sm text-neutral-400">
            {listType === "packing" ? "No items packed yet" : "No tasks yet"}
          </p>
          <p className="text-xs text-neutral-300 mt-1">
            Add your first item below
          </p>
        </div>
      )}

      {/* Quick add without category */}
      {categories.length === 0 && (
        <QuickAdd
          onAdd={(text) => addItem(text, "General")}
          placeholder={listType === "packing" ? "Add packing item..." : "Add task..."}
        />
      )}
    </div>
  );
}
