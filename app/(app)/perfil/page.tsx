import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Mail, Store, Truck } from "lucide-react";
import { InstallButton } from "@/components/install-button";
import { SignOutButton } from "@/components/sign-out-button";
import { Card } from "@/components/ui/card";
import { getProfile } from "@/lib/auth";
import { initials } from "@/lib/format";
import { PerfilForm } from "./perfil-form";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function PerfilPage() {
  const perfil = await getProfile();
  if (!perfil) redirect("/login?next=/perfil");
  const vendedor = perfil.rol === "vendedor";
  const RolIcon = vendedor ? Store : Truck;

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <div className="mb-6 flex items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-amber font-display text-xl font-bold text-[#1c1c1a]">
          {initials(perfil.nombre ?? perfil.email)}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold">{perfil.nombre ?? "Mi perfil"}</h1>
          <p className="flex items-center gap-1.5 truncate text-sm text-muted">
            <Mail className="size-4 shrink-0" aria-hidden /> {perfil.email}
          </p>
          <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-amber-soft px-2.5 py-1 text-xs font-semibold capitalize text-warning">
            <RolIcon className="size-3.5" aria-hidden /> {perfil.rol}
          </span>
        </div>
      </div>

      <PerfilForm perfil={perfil} />

      <Card className="mt-5 flex flex-col gap-3 p-5">
        <h2 className="font-display text-base font-semibold">App</h2>
        <InstallButton />
        <SignOutButton />
      </Card>
    </div>
  );
}
