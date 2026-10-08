import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { getProfile } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const perfil = await getProfile();
  if (!perfil) redirect("/login");
  return <AppShell perfil={perfil}>{children}</AppShell>;
}
