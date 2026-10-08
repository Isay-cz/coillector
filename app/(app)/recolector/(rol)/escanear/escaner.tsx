"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CameraOff, Keyboard, Loader2, ScanLine, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import { shortId } from "@/lib/format";
import { parseCodigoSolicitud } from "@/lib/qr";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Estado = "idle" | "starting" | "scanning" | "error";

function cameraErrorMessage(err: unknown): string {
  const name = (err as { name?: string })?.name ?? "";
  const text = String((err as { message?: string })?.message ?? err);
  if (!window.isSecureContext) return "La cámara solo funciona en una conexión segura (HTTPS).";
  if (name === "NotAllowedError" || /Permission|denied|NotAllowed/i.test(text)) {
    return "No diste permiso para usar la cámara. Actívalo en la configuración del navegador o escribe el código abajo.";
  }
  if (name === "NotFoundError" || /NotFound|no camera|Requested device not found/i.test(text)) {
    return "No encontramos una cámara en este dispositivo. Escribe el código abajo.";
  }
  if (name === "NotReadableError") return "La cámara está ocupada por otra app. Ciérrala e intenta de nuevo.";
  return "No pudimos abrir la cámara. Escribe el código abajo.";
}

export function Escaner() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [codigo, setCodigo] = useState("");
  const [codigoError, setCodigoError] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);
  const handled = useRef(false);
  const lastBadToast = useRef(0);
  const irRef = useRef<(texto: string) => Promise<boolean>>(async () => false);

  const { videoRef, start: startCamera, stop } = useQrScanner(async (text) => {
    if (handled.current) return;
    handled.current = true;
    const ok = await irRef.current(text);
    if (!ok) {
      handled.current = false;
      if (Date.now() - lastBadToast.current > 3000) {
        lastBadToast.current = Date.now();
        toast.error("Este código no es de una solicitud de Coillector.");
      }
    }
  });

  const irASolicitud = useCallback(
    async (texto: string): Promise<boolean> => {
      const parsed = parseCodigoSolicitud(texto);
      if (!parsed) return false;
      if ("id" in parsed) {
        handled.current = true;
        stop();
        router.push(`/recolector/solicitud/${parsed.id}`);
        return true;
      }
      // Código corto: lo buscamos entre las solicitudes visibles para el recolector.
      const { data, error } = await createClient().from("solicitudes_estado").select("id").order("created_at", { ascending: false });
      if (error) {
        console.error("[Coillector] búsqueda por código:", error);
        return false;
      }
      const match = (data ?? []).find((r) => shortId(r.id) === parsed.short);
      if (!match?.id) return false;
      handled.current = true;
      stop();
      router.push(`/recolector/solicitud/${match.id}`);
      return true;
    },
    [router, stop],
  );
  irRef.current = irASolicitud;

  async function start() {
    setCameraError(null);
    setEstado("starting");
    handled.current = false;
    try {
      await startCamera();
      setEstado("scanning");
    } catch (err) {
      console.error("[Coillector] cámara:", err);
      stop();
      setCameraError(cameraErrorMessage(err));
      setEstado("error");
    }
  }

  async function onManual(e: React.FormEvent) {
    e.preventDefault();
    if (!codigo.trim()) {
      setCodigoError("Escribe el código de 8 caracteres o pega el enlace.");
      return;
    }
    if (!parseCodigoSolicitud(codigo)) {
      setCodigoError("Ese código no es válido. Son 8 caracteres, por ejemplo 11D0DF86.");
      return;
    }
    setBuscando(true);
    setCodigoError(null);
    const ok = await irASolicitud(codigo);
    if (!ok) {
      setCodigoError("No encontramos una solicitud con ese código.");
      setBuscando(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="overflow-hidden p-0">
        <div className="relative aspect-square w-full bg-[#0f1a13]">
          <video
            ref={videoRef}
            muted
            playsInline
            aria-label="Vista de la cámara"
            className={cn("absolute inset-0 h-full w-full object-cover", estado !== "scanning" && "opacity-0")}
          />

          {estado === "scanning" && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
              <div className="relative size-[68%]">
                {["left-0 top-0 border-l-4 border-t-4 rounded-tl-2xl", "right-0 top-0 border-r-4 border-t-4 rounded-tr-2xl", "left-0 bottom-0 border-l-4 border-b-4 rounded-bl-2xl", "right-0 bottom-0 border-r-4 border-b-4 rounded-br-2xl"].map((c) => (
                  <span key={c} className={`absolute size-10 border-amber ${c}`} />
                ))}
              </div>
            </div>
          )}

          {estado !== "scanning" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-white">
              {estado === "error" ? (
                <>
                  <CameraOff className="size-12 text-amber" aria-hidden />
                  <p className="max-w-xs text-sm text-white/85">{cameraError}</p>
                  <Button type="button" variant="amber" onClick={start}>
                    <Camera aria-hidden /> Intentar de nuevo
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex size-20 items-center justify-center rounded-3xl bg-white/10">
                    <ScanLine className="size-10 text-amber" aria-hidden />
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-display text-lg font-semibold">Usaremos tu cámara</p>
                    <p className="flex max-w-xs items-start gap-1.5 text-sm text-white/75">
                      <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                      Solo para leer el código QR del vendedor. No tomamos ni guardamos fotos.
                    </p>
                  </div>
                  <Button type="button" variant="amber" size="lg" onClick={start} disabled={estado === "starting"}>
                    {estado === "starting" ? <Loader2 className="animate-spin" aria-hidden /> : <Camera aria-hidden />}
                    {estado === "starting" ? "Abriendo cámara…" : "Activar cámara"}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
        {estado === "scanning" && (
          <div className="flex items-center justify-between gap-3 p-4">
            <p className="text-sm text-muted">Centra el código dentro del recuadro.</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                stop();
                setEstado("idle");
              }}
            >
              Detener
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <form onSubmit={onManual} noValidate className="flex flex-col gap-3">
          <Field
            id="codigo"
            label={
              <span className="flex items-center gap-2">
                <Keyboard className="size-4 text-muted" aria-hidden /> ¿No funciona la cámara? Escribe el código
              </span>
            }
            hint="Son 8 caracteres y aparecen debajo del QR del vendedor."
            error={codigoError}
          >
            <Input
              id="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej. 11D0DF86"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className="font-mono uppercase tracking-wider"
              aria-invalid={Boolean(codigoError)}
              aria-describedby={codigoError ? "codigo-error" : "codigo-hint"}
            />
          </Field>
          <Button type="submit" variant="outline" disabled={buscando}>
            {buscando ? <Loader2 className="animate-spin" aria-hidden /> : null}
            Buscar solicitud
          </Button>
        </form>
      </Card>
    </div>
  );
}
