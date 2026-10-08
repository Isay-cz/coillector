"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { siteUrl } from "@/lib/env";

const SIZE = 1024;
const FOREST = "#1F3D2B";
const AMBER = "#E8A33D";
const DROP = "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z";

/** QR de 1024 px con el logo al centro (corrección de errores H para tolerar el logo). */
async function renderQr(url: string): Promise<string> {
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, url, { width: SIZE, margin: 3, errorCorrectionLevel: "H", color: { dark: FOREST, light: "#FFFFFF" } });
  const ctx = canvas.getContext("2d")!;
  const badge = SIZE * 0.2;
  const x = (SIZE - badge) / 2;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(x - 12, x - 12, badge + 24, badge + 24, 36);
  ctx.fill();
  ctx.fillStyle = FOREST;
  ctx.beginPath();
  ctx.roundRect(x, x, badge, badge, 28);
  ctx.fill();
  const scale = (badge * 0.62) / 24;
  ctx.save();
  ctx.translate(SIZE / 2 - 12 * scale, SIZE / 2 - 12.25 * scale);
  ctx.scale(scale, scale);
  ctx.fillStyle = AMBER;
  ctx.fill(new Path2D(DROP));
  ctx.restore();
  return canvas.toDataURL("image/png");
}

export function QrPortada() {
  const [url, setUrl] = useState("");
  const [png, setPng] = useState<string | null>(null);

  useEffect(() => {
    const u = siteUrl();
    setUrl(u);
    renderQr(u).then(setPng).catch((e) => console.error("[Coillector] QR portada:", e));
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <Logo size="lg" />
      <div className="w-full max-w-[420px] rounded-3xl bg-white p-4 shadow-card ring-1 ring-border">
        {png ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={png} width={SIZE} height={SIZE} alt={`Código QR que abre ${url}`} className="aspect-square h-auto w-full" />
        ) : (
          <Skeleton className="aspect-square w-full" />
        )}
      </div>
      <div className="space-y-1">
        <p className="font-display text-xl font-semibold">Escanea para probar Coillector</p>
        <p className="break-all font-mono text-sm text-muted">{url}</p>
      </div>
      <Button asChild size="lg" variant="amber" aria-disabled={!png}>
        <a href={png ?? undefined} download="coillector-qr-1024.png">
          <Download aria-hidden /> Descargar PNG
        </a>
      </Button>
    </main>
  );
}
