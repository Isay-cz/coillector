import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegistroForm } from "@/components/auth/registro-form";
import { getProfile } from "@/lib/auth";
import { homeForRole } from "@/lib/types";

export const metadata: Metadata = { title: "Registro de vendedor" };

export default async function RegistroVendedorPage() {
  const perfil = await getProfile();
  if (perfil) redirect(homeForRole(perfil.rol));
  return <RegistroForm rol="vendedor" />;
}
