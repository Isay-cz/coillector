"use client";

import { useState } from "react";
import { Check, ChevronDown, Copy, KeyRound } from "lucide-react";
import { DemoLoginButtons } from "@/components/auth/demo-login";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/env";

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-cream px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="truncate font-mono text-sm text-ink">{value}</p>
      </div>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            // Sin permiso de portapapeles: el texto sigue visible.
          }
        }}
        className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-ink/5 hover:text-ink"
        aria-label={`Copiar ${label.toLowerCase()}`}
      >
        {copied ? <Check className="size-4 text-success" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      </button>
    </div>
  );
}

/** Recuadro colapsable con las cuentas demo y acceso directo. */
export function DemoAccounts() {
  return (
    <details className="group rounded-2xl border border-border bg-card shadow-card [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-5 py-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-amber-soft text-warning">
          <KeyRound className="size-5" aria-hidden />
        </span>
        <span className="flex-1">
          <span className="block font-display text-lg font-semibold">Cuentas demo</span>
          <span className="block text-sm text-muted">Prueba la app sin registrarte</span>
        </span>
        <ChevronDown className="size-5 text-muted transition-transform duration-200 group-open:rotate-180" aria-hidden />
      </summary>
      <div className="grid gap-4 border-t border-border p-5 md:grid-cols-2">
        <div className="space-y-2">
          <CopyRow label="Vendedor" value={DEMO_ACCOUNTS.vendedor} />
          <CopyRow label="Recolector" value={DEMO_ACCOUNTS.recolector} />
          {DEMO_PASSWORD && <CopyRow label="Contraseña" value={DEMO_PASSWORD} />}
        </div>
        <div className="flex flex-col justify-center gap-2">
          <DemoLoginButtons />
          {!DEMO_PASSWORD && <p className="text-sm text-muted">Pide la contraseña al equipo para entrar.</p>}
        </div>
      </div>
    </details>
  );
}
