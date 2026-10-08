"use client";

import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// El evento puede dispararse antes de que el componente monte: lo guardamos a nivel módulo.
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    listeners.forEach((l) => l());
  });
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
}

export function InstallButton({ className, variant = "outline" }: { className?: string; variant?: "outline" | "amber" | "default" }) {
  const [mounted, setMounted] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    setMounted(true);
    setInstalled(isStandalone());
    setIos(isIOS());
    const sync = () => {
      setCanPrompt(Boolean(deferredPrompt));
      if (!deferredPrompt && isStandalone()) setInstalled(true);
    };
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);

  if (!mounted) return null;

  if (installed) {
    return (
      <p className={cn("inline-flex items-center gap-2 text-sm text-muted", className)}>
        <Check className="size-4 text-success" aria-hidden /> Estás usando la app instalada
      </p>
    );
  }

  if (ios) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <Button type="button" variant={variant} onClick={() => setShowIosHelp((v) => !v)} aria-expanded={showIosHelp}>
          <Download aria-hidden /> Instalar app
        </Button>
        {showIosHelp && (
          <ol className="animate-fade-in space-y-2 rounded-xl border border-border bg-card p-4 text-sm text-ink">
            <li className="flex items-center gap-2">
              <span className="font-semibold">1.</span> Toca <Share className="size-4 text-primary dark:text-amber" aria-label="Compartir" />
              <span className="font-medium">Compartir</span> en Safari.
            </li>
            <li className="flex items-center gap-2">
              <span className="font-semibold">2.</span> Elige <SquarePlus className="size-4 text-primary dark:text-amber" aria-hidden />
              <span className="font-medium">Agregar a inicio</span>.
            </li>
          </ol>
        )}
      </div>
    );
  }

  if (!canPrompt) return null;

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={async () => {
        const evt = deferredPrompt;
        if (!evt) return;
        await evt.prompt();
        const choice = await evt.userChoice;
        if (choice.outcome === "accepted") setInstalled(true);
        deferredPrompt = null;
        setCanPrompt(false);
      }}
    >
      <Download aria-hidden /> Instalar app
    </Button>
  );
}
