"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDia, formatLitros, formatMXN, formatNumber } from "@/lib/format";
import type { RecoleccionDia } from "@/lib/types";

// Ámbar "aceite" validado (≥ 3:1 sobre la tarjeta en modo claro y oscuro).
const BAR = "#C9821B";
const DAYS = 14;

type Punto = { dia: string; litros: number; importe: number; recolecciones: number };

function hoyCDMX(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date());
}

/** Rellena los últimos 14 días (CDMX) con ceros para que el eje sea continuo. */
function serie(rows: RecoleccionDia[]): Punto[] {
  const byDay = new Map(rows.filter((r) => r.dia).map((r) => [r.dia as string, r]));
  const end = new Date(`${hoyCDMX()}T12:00:00Z`);
  const out: Punto[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(end.getTime() - i * 86400000).toISOString().slice(0, 10);
    const r = byDay.get(d);
    out.push({ dia: d, litros: Number(r?.litros ?? 0), importe: Number(r?.importe_mxn ?? 0), recolecciones: Number(r?.recolecciones ?? 0) });
  }
  return out;
}

function TooltipCard({ active, payload }: { active?: boolean; payload?: { payload: Punto }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-card">
      <p className="font-medium text-ink">{formatDia(p.dia)}</p>
      <p className="font-display text-base font-bold tabular-nums text-ink">{formatLitros(p.litros)}</p>
      <p className="text-muted">
        {formatNumber(p.recolecciones)} {p.recolecciones === 1 ? "recolección" : "recolecciones"} · {formatMXN(p.importe)}
      </p>
    </div>
  );
}

export function LitrosPorDiaChart({ rows }: { rows: RecoleccionDia[] }) {
  const data = useMemo(() => serie(rows), [rows]);
  const maxIdx = data.reduce((best, p, i) => (p.litros > data[best].litros ? i : best), 0);
  const total = data.reduce((a, p) => a + p.litros, 0);

  return (
    <figure>
      <div className="h-60 w-full" role="img" aria-label={`Litros recolectados por día en los últimos ${DAYS} días. Total ${formatLitros(total)}.`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 22, right: 4, bottom: 0, left: -12 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="var(--border)" strokeWidth={1} />
            <XAxis
              dataKey="dia"
              tickFormatter={formatDia}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              interval="preserveStartEnd"
              minTickGap={18}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              width={44}
              tickFormatter={(v: number) => formatNumber(v)}
            />
            <Tooltip content={<TooltipCard />} cursor={{ fill: "var(--amber-soft)", opacity: 0.5 }} />
            <Bar dataKey="litros" fill={BAR} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}>
              <LabelList
                dataKey="litros"
                position="top"
                content={(props) => {
                  const { x, y, width, index, value } = props as { x: number; y: number; width: number; index: number; value: number };
                  if (index !== maxIdx || !value) return null;
                  return (
                    <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--ink)">
                      {formatNumber(value)} L
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-muted hover:text-ink">Ver datos en tabla</summary>
        <table className="mt-2 w-full text-left tabular-nums">
          <thead className="text-muted">
            <tr>
              <th className="py-1 font-medium">Día</th>
              <th className="py-1 text-right font-medium">Litros</th>
              <th className="py-1 text-right font-medium">Recolecciones</th>
              <th className="py-1 text-right font-medium">Pagado</th>
            </tr>
          </thead>
          <tbody>
            {data
              .filter((p) => p.recolecciones > 0)
              .map((p) => (
                <tr key={p.dia} className="border-t border-border">
                  <td className="py-1.5">{formatDia(p.dia)}</td>
                  <td className="py-1.5 text-right">{formatLitros(p.litros)}</td>
                  <td className="py-1.5 text-right">{formatNumber(p.recolecciones)}</td>
                  <td className="py-1.5 text-right">{formatMXN(p.importe)}</td>
                </tr>
              ))}
            {data.every((p) => p.recolecciones === 0) && (
              <tr>
                <td colSpan={4} className="py-2 text-muted">
                  Sin recolecciones en los últimos {DAYS} días.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
