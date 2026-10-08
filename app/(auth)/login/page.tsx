import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { homeForRole, safeNext } from "@/lib/types";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string; next?: string; confirmado?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const perfil = await getProfile();
  if (perfil) redirect(next ?? homeForRole(perfil.rol));

  const rol = params.rol === "vendedor" || params.rol === "recolector" ? params.rol : null;
  return <LoginForm rol={rol} next={next} confirmado={params.confirmado === "1"} linkError={params.error === "enlace"} />;
}
