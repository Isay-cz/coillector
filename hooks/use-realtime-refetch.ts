"use client";

import { useEffect, useRef, useState } from "react";
import type { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type Table = "solicitudes" | "confirmaciones";
export type RealtimeSource = { table: Table; event?: "INSERT" | "UPDATE" | "*"; filter?: string };
type Status = `${REALTIME_SUBSCRIBE_STATES}` | "CONNECTING";

/**
 * Escucha postgres_changes (respetan RLS) y llama a `onChange` (con debounce) para volver a
 * consultar la vista. Las vistas no emiten eventos, por eso escuchamos las tablas base.
 */
export function useRealtimeRefetch(name: string, sources: RealtimeSource[], onChange: () => void, enabled = true) {
  const [status, setStatus] = useState<Status>("CONNECTING");
  const cb = useRef(onChange);
  cb.current = onChange;
  const key = JSON.stringify(sources);

  useEffect(() => {
    if (!enabled) return;
    const supabase = createClient();
    const list: RealtimeSource[] = JSON.parse(key);
    let timer: ReturnType<typeof setTimeout> | undefined;
    let channel: ReturnType<typeof supabase.channel> | undefined;
    let cancelled = false;

    const fire = () => {
      clearTimeout(timer);
      timer = setTimeout(() => cb.current(), 150);
    };

    (async () => {
      // Asegura que el socket use el JWT del usuario (si no, RLS filtraría todos los eventos).
      const { data } = await supabase.auth.getSession();
      if (data.session) await supabase.realtime.setAuth(data.session.access_token);
      if (cancelled) return;
      channel = supabase.channel(`${name}-${Math.random().toString(36).slice(2, 8)}`);
      for (const s of list) {
        channel.on(
          "postgres_changes",
          { event: s.event ?? "*", schema: "public", table: s.table, ...(s.filter ? { filter: s.filter } : {}) },
          fire,
        );
      }
      channel.subscribe((st, err) => {
        setStatus(st);
        if (err) console.error("[Coillector] Realtime:", st, err.message);
      });
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (channel) supabase.removeChannel(channel);
    };
  }, [name, key, enabled]);

  return status;
}
