import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-3 px-4 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-6">
        <Logo size="sm" />
        <p>
          Proyecto académico · Universidad La Salle México · <span className="font-medium text-ink">Pagos simulados</span>
        </p>
        <nav className="flex gap-4">
          <Link href="/dashboard" className="hover:text-ink">
            Impacto
          </Link>
          <Link href="/login" className="hover:text-ink">
            Entrar
          </Link>
        </nav>
      </div>
    </footer>
  );
}
