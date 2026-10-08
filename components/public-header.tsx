import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { homeForRole, type Perfil } from "@/lib/types";

export function PublicHeader({ perfil }: { perfil?: Perfil | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-cream/90 pt-safe backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between gap-3 px-4 md:px-6">
        <Link href="/" aria-label="Coillector, inicio" className="rounded-lg">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/dashboard">Impacto</Link>
          </Button>
          {perfil ? (
            <Button asChild size="sm">
              <Link href={homeForRole(perfil.rol)}>Mi cuenta</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
