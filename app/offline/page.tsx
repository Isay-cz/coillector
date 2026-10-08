import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { Logo } from "@/components/logo";
import { RetryButton } from "./retry-button";

export const metadata: Metadata = { title: "Sin conexión" };
export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo size="lg" />
      <div className="flex size-20 items-center justify-center rounded-full bg-amber-soft">
        <WifiOff className="size-9 text-warning" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Sin conexión</h1>
        <p className="text-muted">
          No pudimos conectarnos. Revisa tu internet; tus solicitudes y pagos se actualizan en cuanto vuelvas a estar en
          línea.
        </p>
      </div>
      <RetryButton />
    </main>
  );
}
