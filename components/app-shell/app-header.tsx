import Link from "next/link";
import { Logo } from "@/components/logo";
import { initials } from "@/lib/format";
import { homeForRole, type Perfil, type Rol } from "@/lib/types";
import { HeaderNav } from "./header-nav";

export function AppHeader({ perfil }: { perfil: Perfil }) {
  const rol = perfil.rol as Rol;
  return (
    <header className="sticky top-0 z-40 bg-header pt-safe text-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between gap-4 px-4 md:px-6">
        <Link href={homeForRole(rol)} aria-label="Ir al inicio" className="rounded-lg">
          <Logo tone="light" />
        </Link>
        <HeaderNav rol={rol} />
        <Link
          href="/perfil"
          aria-label="Mi perfil"
          className="flex items-center gap-2 rounded-full transition-opacity duration-150 hover:opacity-90"
        >
          <span className="hidden text-right text-xs leading-tight sm:block">
            <span className="block font-medium text-white">{perfil.nombre ?? perfil.email}</span>
            <span className="block capitalize text-white/70">{rol}</span>
          </span>
          <span className="flex size-10 items-center justify-center rounded-full bg-amber font-display text-sm font-bold text-[#1c1c1a] ring-2 ring-white/20">
            {initials(perfil.nombre ?? perfil.email)}
          </span>
        </Link>
      </div>
    </header>
  );
}
