import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { homeForRole, safeNext } from "@/lib/types";

/** Intercambia el código del correo de confirmación por una sesión y redirige. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"));
  const toUrl = (path: string) => new URL(path, request.url);

  if (searchParams.get("error")) {
    return NextResponse.redirect(toUrl("/login?error=enlace"));
  }

  const supabase = await createClient();
  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
    if (error) console.error("[Coillector] exchangeCodeForSession:", error.message);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
    if (error) console.error("[Coillector] verifyOtp:", error.message);
  }

  if (!ok) {
    // Con PKCE, si el enlace se abre en otro navegador el correo igual queda confirmado.
    return NextResponse.redirect(toUrl(code ? "/login?confirmado=1" : "/login?error=enlace"));
  }

  const { data } = await supabase.auth.getUser();
  let destino = next;
  if (!destino && data.user) {
    const { data: perfil } = await supabase.from("users").select("rol").eq("id", data.user.id).maybeSingle();
    destino = homeForRole(perfil?.rol);
  }
  return NextResponse.redirect(toUrl(destino ?? "/"));
}
