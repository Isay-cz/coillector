"use client";

import { useMemo } from "react";
import { QrCode as QrIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { QrCode } from "@/components/qr-code";
import { Comprobante } from "@/components/solicitud/comprobante";
import { DetallesSolicitud } from "@/components/solicitud/detalles";
import { Timeline } from "@/components/solicitud/timeline";
import { SolicitudChips } from "@/components/status-chip";
import { Card } from "@/components/ui/card";
import { useSolicitudLive } from "@/hooks/use-solicitud-live";
import { siteUrl } from "@/lib/env";
import { shortId } from "@/lib/format";
import type { SolicitudEstado } from "@/lib/types";

export function DetalleVendedor({ initial }: { initial: SolicitudEstado }) {
  const { s } = useSolicitudLive(initial);
  const pendiente = !s.confirmacion_id;
  const qrValue = useMemo(() => `${siteUrl()}/recolector/solicitud/${s.id}`, [s.id]);

  return (
    <div className="animate-fade-in">
      <PageHeader backHref="/vendedor" title={s.nombre_comercio} description={`Solicitud #${shortId(s.id)}`} />
      <SolicitudChips s={s} className="-mt-2 mb-5" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start md:gap-6">
        <div className="flex flex-col gap-4">
          {pendiente ? (
            <Card className="flex flex-col items-center gap-4 p-5 text-center">
              <div className="flex items-center gap-2 text-sm font-semibold text-warning">
                <QrIcon className="size-4" aria-hidden /> Código de recolección
              </div>
              <h2 className="text-xl font-bold leading-snug">Muéstrale este código al recolector</h2>
              <QrCode value={qrValue} fileName={`coillector-${shortId(s.id)}.png`} />
              <p className="text-sm text-muted">
                O dile este código: <span className="font-mono text-base font-semibold tracking-wider text-ink">{shortId(s.id)}</span>
              </p>
            </Card>
          ) : (
            <Comprobante s={s} />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h2 className="mb-4 font-display text-base font-semibold">Seguimiento</h2>
            <Timeline s={s} />
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 font-display text-base font-semibold">Detalles</h2>
            <DetallesSolicitud s={s} />
          </Card>
        </div>
      </div>
    </div>
  );
}
