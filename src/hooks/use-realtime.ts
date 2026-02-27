/**
 * useRealtimeTable - Supabase real-time subscription hook.
 * Automatically adds/updates/removes rows when changes happen in the DB.
 */

"use client";

import { useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";

type ChangeHandler<T> = {
    onInsert?: (row: T) => void;
    onUpdate?: (row: T) => void;
    onDelete?: (old: T) => void;
};

export function useRealtimeTable<T extends { id: string }>(
    table: string,
    handlers: ChangeHandler<T>
) {
    const handlersRef = useRef(handlers);
    useEffect(() => {
        handlersRef.current = handlers;
    });

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const channel = supabase
            .channel(`realtime-${table}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table },
                (payload) => handlersRef.current.onInsert?.(payload.new as T)
            )
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table },
                (payload) => handlersRef.current.onUpdate?.(payload.new as T)
            )
            .on(
                "postgres_changes",
                { event: "DELETE", schema: "public", table },
                (payload) => handlersRef.current.onDelete?.(payload.old as T)
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [table]);
}
