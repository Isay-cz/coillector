"use client";

import { useEffect, useState } from "react";
import { formatFecha, formatRelative } from "@/lib/format";

/** "hace 5 min", con la fecha absoluta (CDMX) en el tooltip. Se actualiza cada 30 s. */
export function RelativeTime({ date, className }: { date: string | null | undefined; className?: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  if (!date) return null;
  return (
    <time dateTime={date} title={formatFecha(date)} className={className} suppressHydrationWarning>
      {formatRelative(date, now)}
    </time>
  );
}
