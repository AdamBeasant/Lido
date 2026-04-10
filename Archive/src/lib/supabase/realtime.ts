import { SupabaseClient, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type TableName = "checklist_items" | "restaurants" | "holidays" | "holiday_members";

interface RealtimeCallbacks<T> {
  onInsert?: (item: T) => void;
  onUpdate?: (item: T) => void;
  onDelete?: (old: { id: string }) => void;
}

export function subscribeToTable<T extends { id: string }>(
  supabase: SupabaseClient,
  channelName: string,
  table: TableName,
  filter: string,
  callbacks: RealtimeCallbacks<T>
) {
  return supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
        filter,
      },
      (payload: RealtimePostgresChangesPayload<T>) => {
        switch (payload.eventType) {
          case "INSERT":
            callbacks.onInsert?.(payload.new as T);
            break;
          case "UPDATE":
            callbacks.onUpdate?.(payload.new as T);
            break;
          case "DELETE":
            callbacks.onDelete?.(payload.old as { id: string });
            break;
        }
      }
    )
    .subscribe();
}
