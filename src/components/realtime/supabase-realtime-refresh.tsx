"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

const DEFAULT_REALTIME_TABLES: string[] = ["startups"];

/** Refetches server components when matching rows change (requires publication + replica identity FULL). */
export function SupabaseRealtimeRefresh({
  tables = DEFAULT_REALTIME_TABLES,
}: {
  tables?: string[];
}) {
  const router = useRouter();
  const watchedTables = [...tables].sort().join(",");

  useEffect(() => {
    if (!getSupabaseUrl() || !getSupabaseAnonKey()) return;

    const supabase = createClient();
    const tableKey = watchedTables;
    const channelName = `public-sync:${tableKey}`;
    const channel = supabase.channel(channelName);

    for (const table of tables) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          router.refresh();
        },
      );
    }

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router, watchedTables, tables]);

  return null;
}
