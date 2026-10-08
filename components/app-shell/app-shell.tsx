import type { Perfil, Rol } from "@/lib/types";
import { AppHeader } from "./app-header";
import { BottomNav } from "./bottom-nav";

/** Header + contenedor + navegación inferior para usuarios con sesión. */
export function AppShell({ perfil, children }: { perfil: Perfil; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader perfil={perfil} />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 pb-28 pt-5 md:px-6 md:pb-12 md:pt-8">{children}</main>
      <BottomNav rol={perfil.rol as Rol} />
    </div>
  );
}
