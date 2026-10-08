// Variables públicas: Next.js las incrusta en el bundle al compilar.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
export const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

/** URL pública del sitio (sin "/" final). En el navegador cae a window.location.origin. */
export function siteUrl(): string {
  if (rawSiteUrl) return rawSiteUrl.replace(/\/+$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

export const DEMO_ACCOUNTS = {
  vendedor: "vendedor.demo@ejemplo.com",
  recolector: "recolector.demo@ejemplo.com",
} as const;
