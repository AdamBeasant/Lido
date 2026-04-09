"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChecklistItem } from "@/types/database";
import { useUser } from "./use-user";

export function useChecklistItems(holidayId: string, listType: "packing" | "todo") {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { user } = useUser();
  const optimisticIds = useRef<Set<string>>(new Set());

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from("checklist_items")
      .select("*")
      .eq("holiday_id", holidayId)
      .eq("list_type", listType)
      .order("category", { ascending: true, nullsFirst: false })
      .order("position", { ascending: true });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  }, [holidayId, listType]);

  useEffect(() => {
    fetchItems();

    const channel = supabase
      .channel(`checklist-${holidayId}-${listType}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "checklist_items",
          filter: `holiday_id=eq.${holidayId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newItem = payload.new as ChecklistItem;
            if (newItem.list_type !== listType) return;
            if (optimisticIds.current.has(newItem.id)) {
              optimisticIds.current.delete(newItem.id);
              return;
            }
            setItems((prev) => [...prev, newItem]);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as ChecklistItem;
            if (updated.list_type !== listType) return;
            setItems((prev) =>
              prev.map((item) => (item.id === updated.id ? updated : item))
            );
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as { id: string };
            setItems((prev) => prev.filter((item) => item.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [holidayId, listType, fetchItems]);

  const addItem = async (text: string, category?: string) => {
    const maxPosition = items
      .filter((i) => i.category === (category || null))
      .reduce((max, i) => Math.max(max, i.position), -1);

    const tempId = crypto.randomUUID();
    const newItem: ChecklistItem = {
      id: tempId,
      holiday_id: holidayId,
      list_type: listType,
      category: category || null,
      text,
      checked: false,
      checked_by: null,
      checked_at: null,
      position: maxPosition + 1,
      created_by: user?.id || null,
      created_at: new Date().toISOString(),
    };

    setItems((prev) => [...prev, newItem]);

    const { data, error } = await supabase
      .from("checklist_items")
      .insert({
        holiday_id: holidayId,
        list_type: listType,
        category: category || null,
        text,
        position: maxPosition + 1,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      setItems((prev) => prev.filter((i) => i.id !== tempId));
    } else if (data) {
      optimisticIds.current.add(data.id);
      setItems((prev) =>
        prev.map((i) => (i.id === tempId ? data : i))
      );
    }
  };

  const toggleItem = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const newChecked = !item.checked;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              checked: newChecked,
              checked_by: newChecked ? user?.id || null : null,
              checked_at: newChecked ? new Date().toISOString() : null,
            }
          : i
      )
    );

    const { error } = await supabase
      .from("checklist_items")
      .update({
        checked: newChecked,
        checked_by: newChecked ? user?.id : null,
        checked_at: newChecked ? new Date().toISOString() : null,
      })
      .eq("id", itemId);

    if (error) {
      // Rollback
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? item : i))
      );
    }
  };

  const deleteItem = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));

    const { error } = await supabase
      .from("checklist_items")
      .delete()
      .eq("id", itemId);

    if (error && item) {
      setItems((prev) => [...prev, item]);
    }
  };

  const reorderItems = async (reorderedItems: ChecklistItem[]) => {
    setItems(reorderedItems);

    const updates = reorderedItems.map((item, index) => ({
      id: item.id,
      position: index,
    }));

    for (const update of updates) {
      await supabase
        .from("checklist_items")
        .update({ position: update.position })
        .eq("id", update.id);
    }
  };

  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;

  return {
    items,
    loading,
    addItem,
    toggleItem,
    deleteItem,
    reorderItems,
    checkedCount,
    totalCount,
    refetch: fetchItems,
  };
}
