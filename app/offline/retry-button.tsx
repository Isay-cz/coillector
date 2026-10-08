"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RetryButton() {
  // El SW sirve esta página en la URL que falló: recargar reintenta esa misma URL.
  return (
    <Button type="button" onClick={() => window.location.reload()}>
      <RefreshCw aria-hidden /> Reintentar
    </Button>
  );
}
