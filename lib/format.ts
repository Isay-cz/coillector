const TZ = "America/Mexico_City";

const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const num = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 });
const intFmt = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("es-MX", { notation: "compact", maximumFractionDigits: 1 });
const rtf = new Intl.RelativeTimeFormat("es-MX", { numeric: "auto", style: "short" });
const fechaHora = new Intl.DateTimeFormat("es-MX", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const fechaCorta = new Intl.DateTimeFormat("es-MX", { timeZone: TZ, day: "numeric", month: "short" });

export function formatMXN(value: number | string | null | undefined): string {
  return mxn.format(Number(value ?? 0));
}

export function formatNumber(value: number | string | null | undefined): string {
  return num.format(Number(value ?? 0));
}

export function formatInt(value: number | string | null | undefined): string {
  return intFmt.format(Number(value ?? 0));
}

export function formatCompact(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return n >= 10000 ? compact.format(n) : intFmt.format(n);
}

export function formatLitros(value: number | string | null | undefined): string {
  return `${num.format(Number(value ?? 0))} L`;
}

export function formatFecha(value: string | Date | null | undefined): string {
  if (!value) return "";
  return fechaHora.format(new Date(value));
}

/** "8 oct" para ejes de gráficas. `dia` llega como YYYY-MM-DD (ya en hora de CDMX). */
export function formatDia(dia: string | null | undefined): string {
  if (!dia) return "";
  // Mediodía UTC evita que el cambio de zona mueva el día.
  return fechaCorta.format(new Date(`${dia}T12:00:00Z`));
}

export function formatRelative(value: string | Date | null | undefined, now = Date.now()): string {
  if (!value) return "";
  const diffSec = Math.round((new Date(value).getTime() - now) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 45) return "justo ahora";
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 7) return rtf.format(Math.round(diffSec / 86400), "day");
  return fechaHora.format(new Date(value));
}

export function initials(name: string | null | undefined, fallback = "C"): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function shortId(id: string | null | undefined): string {
  return (id ?? "").replace(/-/g, "").slice(0, 8).toUpperCase();
}
