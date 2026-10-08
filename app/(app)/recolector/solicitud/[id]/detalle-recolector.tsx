"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ClipboardList, Loader2, MapPin, MessageSquareText, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { LitrosInput } from "@/components/litros-input";
import { PageHeader } from "@/components/page-header";
import { FechaAbs, RelativeTime } from "@/components/relative-time";
import { Comprobante } from "@/components/solicitud/comprobante";
import { ContactActions } from "@/components/solicitud/contact-actions";
import { SolicitudChips } from "@/components/status-chip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { useSolicitudLive } from "@/hooks/use-solicitud-live";
import { friendlyDbError } from "@/lib/errors";
import { formatLitros, formatMXN, shortId } from "@/lib/format";
import { pagoKind } from "@/lib/solicitud";
import { createClient } from "@/lib/supabase/client";
import type { SolicitudEstado } from "@/lib/types";
import { cn } from "@/lib/utils";
import { parseLitros } from "@/lib/validation";

export function DetalleRecolector({ initial }: { initial: SolicitudEstado }) {
  const { s, refetch } = useSolicitudLive(initial, { toasts: false });
  const recolectada = Boolean(s.confirmacion_id);

  return (
    <div className="animate-fade-in">
      <PageHeader backHref="/recolector" title={s.nombre_comercio} description={`Solicitud #${shortId(s.id)}`} />
      <SolicitudChips s={s} className="-mt-2 mb-5" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start md:gap-6">
        <Card className="p-5">
          <ul className="space-y-3 text-sm">
            <Info icon={MapPin} label="Dirección">
              {s.direccion}
            </Info>
            <Info icon={ClipboardList} label="Litros estimados">
              <span className="font-display text-base font-semibold">{formatLitros(s.litros_estimados)}</span> · solicitada{" "}
              <RelativeTime date={s.created_at} />
            </Info>
            {s.telefono_contacto && (
              <Info icon={Phone} label="Teléfono">
                {s.telefono_contacto}
              </Info>
            )}
            {s.notas && (
              <Info icon={MessageSquareText} label="Notas del vendedor">
                {s.notas}
              </Info>
            )}
          </ul>
          <ContactActions direccion={s.direccion} telefono={s.telefono_contacto} className="mt-5" />
        </Card>

        <div className="flex flex-col gap-4">
          {recolectada ? (
            <>
              <Comprobante s={s} />
              {pagoKind(s) !== "pendiente" && (
                <Button asChild variant="outline">
                  <Link href="/recolector">Volver a pendientes</Link>
                </Button>
              )}
            </>
          ) : (
            <ConfirmarForm s={s} onConfirmed={refetch} />
          )}
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-muted">Creada el <FechaAbs date={s.created_at} /></p>
    </div>
  );
}

function ConfirmarForm({ s, onConfirmed }: { s: SolicitudEstado; onConfirmed: () => Promise<unknown> }) {
  const [litros, setLitros] = useState(s.litros_estimados != null ? String(s.litros_estimados) : "");
  const [calidad, setCalidad] = useState(false);
  const [errors, setErrors] = useState<{ litros?: string | null; calidad?: string | null; form?: string | null }>({});
  const [loading, setLoading] = useState(false);
  const parsed = parseLitros(litros);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = {
      litros: parsed.error,
      calidad: calidad ? null : "Debes confirmar que el aceite cumple la calidad mínima.",
    };
    setErrors(found);
    if (found.litros) return document.getElementById("litros_reales")?.focus();
    if (found.calidad) return document.getElementById("calidad")?.focus();

    setLoading(true);
    const { error } = await createClient()
      .from("confirmaciones")
      .insert({ solicitud_id: s.id as string, litros_reales: parsed.value!, calidad_apta: true });

    if (error) {
      const message = friendlyDbError(error);
      setErrors({
        form: message,
        litros: /litros/i.test(message) ? message : null,
        calidad: /calidad/i.test(message) ? message : null,
      });
      toast.error(message);
      setLoading(false);
      // Si ya estaba confirmada, mostramos el comprobante existente.
      if (error.code === "23505") await onConfirmed();
      return;
    }

    toast.success("Recolección confirmada. Procesando pago…");
    await onConfirmed();
    setLoading(false);
  }

  return (
    <Card className="p-5">
      <h2 className="font-display text-lg font-semibold">Confirmar recolección</h2>
      <p className="mb-5 mt-1 text-sm text-muted">Mide el aceite entregado. El pago se calcula a {formatMXN(2)} por litro.</p>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <Field id="litros_reales" label="Litros reales" error={errors.litros}>
          <LitrosInput
            id="litros_reales"
            value={litros}
            onChange={(v) => {
              setLitros(v);
              if (errors.litros) setErrors((p) => ({ ...p, litros: parseLitros(v).error }));
            }}
            invalid={Boolean(errors.litros)}
            describedBy={errors.litros ? "litros_reales-error" : "pago-estimado"}
            presets={[]}
          />
        </Field>
        <p id="pago-estimado" className="-mt-3 text-sm text-muted">
          Pago estimado:{" "}
          <span className="font-display font-semibold tabular-nums text-ink">
            {parsed.value ? formatMXN(Math.round(parsed.value * 2 * 100) / 100) : "—"}
          </span>
        </p>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="calidad"
            className={cn(
              "flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors duration-150",
              calidad ? "border-success bg-success-soft" : errors.calidad ? "border-danger" : "border-border",
            )}
          >
            <input
              id="calidad"
              type="checkbox"
              checked={calidad}
              onChange={(e) => {
                setCalidad(e.target.checked);
                if (e.target.checked) setErrors((p) => ({ ...p, calidad: null }));
              }}
              required
              aria-invalid={Boolean(errors.calidad)}
              aria-describedby={errors.calidad ? "calidad-error" : undefined}
              className="mt-0.5 size-5 shrink-0 accent-[var(--success)]"
            />
            <span className="text-sm">
              <span className="block font-medium">Confirmo que el aceite cumple la calidad mínima</span>
              <span className="mt-0.5 flex items-center gap-1.5 text-muted">
                <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden /> Sin agua, sin restos sólidos y en recipiente cerrado.
              </span>
            </span>
          </label>
          {errors.calidad && (
            <p id="calidad-error" role="alert" className="text-sm text-danger">
              {errors.calidad}
            </p>
          )}
        </div>

        {errors.form && !errors.litros && !errors.calidad && (
          <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">
            {errors.form}
          </p>
        )}

        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? <Loader2 className="animate-spin" aria-hidden /> : <CheckCircle2 aria-hidden />}
          {loading ? "Confirmando…" : "Confirmar y procesar pago"}
        </Button>
      </form>
    </Card>
  );
}

function Info({ icon: Icon, label, children }: { icon: typeof MapPin; label: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-soft text-warning">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="break-words text-ink">{children}</p>
      </div>
    </li>
  );
}
