"use client";

import { useEffect, useRef } from "react";

/** Ejecuta `fn` cada `intervalMs` mientras la pestaña esté visible. `null` lo desactiva. */
export function usePolling(fn: () => void, intervalMs: number | null, maxDurationMs?: number) {
  const cb = useRef(fn);
  cb.current = fn;

  useEffect(() => {
    if (!intervalMs) return;
    const started = Date.now();
    const t = setInterval(() => {
      if (maxDurationMs && Date.now() - started > maxDurationMs) {
        clearInterval(t);
        return;
      }
      if (document.visibilityState === "visible") cb.current();
    }, intervalMs);
    const onVisible = () => document.visibilityState === "visible" && cb.current();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs, maxDurationMs]);
}
