import Link from "next/link";
import { SearchX } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo size="lg" />
      <div className="flex size-20 items-center justify-center rounded-full bg-amber-soft">
        <SearchX className="size-9 text-warning" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">No encontramos esta página</h1>
        <p className="text-muted">Puede que la solicitud no exista o que tu cuenta no tenga acceso a ella.</p>
      </div>
      <Button asChild>
        <Link href="/">Ir al inicio</Link>
      </Button>
    </main>
  );
}
