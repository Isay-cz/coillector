import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Lo llama el cron diario de Vercel (vercel.json): una consulta ligera para que
 * Supabase no pause el proyecto gratuito por inactividad.
 */
export async function GET() {
  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false },
  });
  const { error } = await supabase.from("resumen_publico").select("solicitudes_totales").limit(1);
  return Response.json({ ok: !error }, { status: error ? 503 : 200 });
}
