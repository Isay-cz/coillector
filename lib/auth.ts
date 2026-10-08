import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { homeForRole, type Perfil, type Rol } from "@/lib/types";

/** Perfil del usuario actual (o null si no hay sesión). Deduplicado por request. */
export const getProfile = cache(async (): Promise<Perfil | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const uid = data?.claims?.sub;
  if (!uid) return null;
  const { data: perfil, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", uid)
    .maybeSingle();
  if (error) console.error("[Coillector] No se pudo leer el perfil:", error);
  return perfil ?? null;
});

/** Exige sesión y un rol. Si el rol no coincide, manda a la home del rol real. */
export async function requireRole(rol: Rol): Promise<Perfil> {
  const perfil = await getProfile();
  if (!perfil) redirect(`/login?rol=${rol}`);
  if (perfil.rol !== rol) redirect(homeForRole(perfil.rol));
  return perfil;
}
