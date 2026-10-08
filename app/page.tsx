import Link from "next/link";
import { ArrowRight, ClipboardList, Coins, Droplet, ShieldCheck, Store, Truck } from "lucide-react";
import { DemoAccounts } from "@/components/demo-accounts";
import { InstallButton } from "@/components/install-button";
import { LiveDot, LiveMetrics } from "@/components/live-metrics";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/lib/auth";
import { getResumenPublico } from "@/lib/metrics";
import { homeForRole } from "@/lib/types";

const PASOS = [
  { icon: ClipboardList, title: "Solicita", text: "Indica cuántos litros de aceite usado tienes. Toma menos de un minuto." },
  { icon: ShieldCheck, title: "Recolectamos y validamos", text: "Un recolector pasa, mide el aceite y confirma que cumple la calidad mínima." },
  { icon: Coins, title: "Recibes tu pago", text: "El pago se procesa al instante y lo ves en tu celular, con su referencia." },
];

export default async function LandingPage() {
  const [perfil, resumen] = await Promise.all([getProfile(), getResumenPublico()]);

  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader perfil={perfil} />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-[1100px] px-4 pt-4 md:px-6 md:pt-10">
          <div className="relative overflow-hidden rounded-[28px] bg-forest px-6 py-10 text-white shadow-float md:px-12 md:py-16">
            <div
              className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-amber/25 blur-3xl md:size-[28rem]"
              aria-hidden
            />
            <Droplet
              className="pointer-events-none absolute -bottom-10 -right-6 size-56 rotate-12 fill-amber/15 text-amber/20 md:right-10 md:size-80"
              strokeWidth={1}
              aria-hidden
            />
            <div className="relative max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber">
                <Droplet className="size-3.5 fill-amber" aria-hidden /> Piloto CDMX · Del aceite al combustible
              </span>
              <h1 className="mt-5 text-[2.6rem] font-bold leading-[1.02] tracking-tight md:text-6xl">
                Tu aceite usado vale. <span className="text-amber">Recíclalo en segundos.</span>
              </h1>
              <p className="mt-4 max-w-xl text-lg text-white/80">
                Pide la recolección desde tu celular y recibe tu pago; el aceite se convierte en biocombustible.
              </p>

              {perfil ? (
                <Button asChild variant="amber" size="lg" className="mt-8 w-full sm:w-auto">
                  <Link href={homeForRole(perfil.rol)}>
                    Ir a mi cuenta <ArrowRight aria-hidden />
                  </Link>
                </Button>
              ) : (
                <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-3">
                  <div className="flex flex-col gap-2">
                    <Button asChild variant="amber" size="lg" className="w-full">
                      <Link href="/registro/vendedor">
                        <Store aria-hidden /> Soy vendedor
                      </Link>
                    </Button>
                    <Link href="/login?rol=vendedor" className="text-center text-sm text-white/75 underline-offset-4 hover:text-white hover:underline">
                      Ya tengo cuenta
                    </Link>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button asChild size="lg" className="w-full bg-white text-forest hover:bg-cream">
                      <Link href="/registro/recolector">
                        <Truck aria-hidden /> Soy recolector
                      </Link>
                    </Button>
                    <Link href="/login?rol=recolector" className="text-center text-sm text-white/75 underline-offset-4 hover:text-white hover:underline">
                      Ya tengo cuenta
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Métricas en vivo */}
        <section className="mx-auto max-w-[1100px] px-4 pt-10 md:px-6 md:pt-14" aria-labelledby="impacto">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <LiveDot />
              <h2 id="impacto" className="mt-2 text-2xl font-bold md:text-3xl">
                Impacto del piloto
              </h2>
            </div>
            <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline dark:text-amber">
              Ver dashboard <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <LiveMetrics initial={resumen} />
        </section>

        {/* Cómo funciona */}
        <section className="mx-auto max-w-[1100px] px-4 pt-12 md:px-6 md:pt-16" aria-labelledby="como">
          <h2 id="como" className="mb-4 text-2xl font-bold md:text-3xl">
            Cómo funciona
          </h2>
          <ol className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            {PASOS.map((p, i) => (
              <li key={p.title} className="relative rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-soft text-warning">
                    <p.icon className="size-6" aria-hidden />
                  </span>
                  <span className="font-display text-sm font-bold text-muted">Paso {i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{p.title}</h3>
                <p className="mt-1 text-muted">{p.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Demo + instalación */}
        <section className="mx-auto grid max-w-[1100px] grid-cols-1 gap-4 px-4 py-12 md:grid-cols-[1.4fr_1fr] md:items-start md:px-6 md:py-16">
          <DemoAccounts />
          <div className="flex flex-col justify-center gap-3 rounded-2xl border border-dashed border-border p-5">
            <p className="font-display text-lg font-semibold">Llévala en tu celular</p>
            <p className="text-sm text-muted">Instala Coillector como app: abre al instante y funciona aunque la señal falle.</p>
            <InstallButton variant="default" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
