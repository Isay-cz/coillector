"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const COLORS = { dark: "#1F3D2B", light: "#FFFFFF" };

/** QR generado localmente (sin APIs externas) con botón para descargar PNG. */
export function QrCode({
  value,
  fileName = "coillector-qr.png",
  className,
  downloadLabel = "Descargar QR",
  downloadWidth = 1024,
}: {
  value: string;
  fileName?: string;
  className?: string;
  downloadLabel?: string;
  downloadWidth?: number;
}) {
  const [svg, setSvg] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let active = true;
    QRCode.toString(value, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: COLORS })
      .then((s) => active && setSvg(s))
      .catch((err) => console.error("[Coillector] QR:", err));
    return () => {
      active = false;
    };
  }, [value]);

  async function download() {
    setDownloading(true);
    try {
      const url = await QRCode.toDataURL(value, { width: downloadWidth, margin: 2, errorCorrectionLevel: "M", color: COLORS });
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="w-full max-w-[260px] rounded-2xl bg-white p-3 shadow-card ring-1 ring-border">
        {svg ? (
          <div
            role="img"
            aria-label="Código QR de la solicitud"
            className="aspect-square w-full [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <Skeleton className="aspect-square w-full" />
        )}
      </div>
      <Button type="button" variant="outline" onClick={download} disabled={!svg || downloading}>
        {downloading ? <Loader2 className="animate-spin" aria-hidden /> : <Download aria-hidden />}
        {downloadLabel}
      </Button>
    </div>
  );
}
