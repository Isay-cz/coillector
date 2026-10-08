"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { LitrosInput } from "@/components/litros-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { friendlyDbError } from "@/lib/errors";
import { NOTAS_MAX, normalizePhone, parseLitros, validatePhone, validateRequired } from "@/lib/validation";

type Errors = Partial<Record<"nombre_comercio" | "direccion" | "telefono" | "litros" | "notas" | "form", string | null>>;

export function NuevaSolicitudForm({
  defaults,
}: {
  defaults: { nombre_comercio: string; direccion: string; telefono: string };
}) {
  const router = useRouter();
  const [nombreComercio, setNombreComercio] = useState(defaults.nombre_comercio);
  const [direccion, setDireccion] = useState(defaults.direccion);
  const [telefono, setTelefono] = useState(defaults.telefono);
  const [litros, setLitros] = useState("");
  const [notas, setNotas] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  function validate(): Errors {
    return {
      nombre_comercio: validateRequired(nombreComercio, "El nombre del comercio"),
      direccion: validateRequired(direccion, "La dirección"),
      telefono: validatePhone(telefono, { required: false }),
      litros: parseLitros(litros).error,
      notas: notas.length > NOTAS_MAX ? `Máximo ${NOTAS_MAX} caracteres.` : null,
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    const first = (["litros", "nombre_comercio", "direccion", "telefono", "notas"] as const).find((k) => found[k]);
    if (first) {
      document.getElementById(first)?.focus();
      return;
    }

    setLoading(true);
    const { data, error } = await createClient()
      .from("solicitudes")
      .insert({
        nombre_comercio: nombreComercio.trim(),
        direccion: direccion.trim(),
        litros_estimados: parseLitros(litros).value!,
        telefono_contacto: normalizePhone(telefono) || null,
        notas: notas.trim() || null,
      })
      .select("id")
      .single();

    if (error || !data) {
      const message = friendlyDbError(error);
      setErrors({ form: message, ...(/litros/i.test(message) ? { litros: message } : {}) });
      toast.error(message);
      setLoading(false);
      return;
    }

    toast.success("Solicitud creada");
    router.push(`/vendedor/solicitud/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Card className="p-5">
        <Field
          id="litros"
          label={<span className="text-base font-semibold">¿Cuántos litros de aceite tienes?</span>}
          hint="Un aproximado está bien. Entre 0.01 y 1000 litros."
          error={errors.litros}
        >
          <LitrosInput
            id="litros"
            value={litros}
            onChange={(v) => {
              setLitros(v);
              if (errors.litros) setErrors((p) => ({ ...p, litros: parseLitros(v).error }));
            }}
            invalid={Boolean(errors.litros)}
            describedBy={errors.litros ? "litros-error" : "litros-hint"}
          />
        </Field>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <h2 className="font-display text-base font-semibold">¿Dónde recogemos?</h2>
        <Field id="nombre_comercio" label="Nombre del comercio" error={errors.nombre_comercio}>
          <Input
            id="nombre_comercio"
            value={nombreComercio}
            onChange={(e) => setNombreComercio(e.target.value)}
            placeholder="Ej. Tacos Don Pepe"
            aria-invalid={Boolean(errors.nombre_comercio)}
            aria-describedby={errors.nombre_comercio ? "nombre_comercio-error" : undefined}
          />
        </Field>
        <Field id="direccion" label="Dirección" error={errors.direccion}>
          <Input
            id="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Calle, número y colonia"
            autoComplete="street-address"
            aria-invalid={Boolean(errors.direccion)}
            aria-describedby={errors.direccion ? "direccion-error" : undefined}
          />
        </Field>
        <Field id="telefono" label="Teléfono de contacto (opcional)" hint="Para que el recolector te llame al llegar." error={errors.telefono}>
          <Input
            id="telefono"
            type="tel"
            inputMode="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="55 1234 5678"
            aria-invalid={Boolean(errors.telefono)}
            aria-describedby={errors.telefono ? "telefono-error" : "telefono-hint"}
          />
        </Field>
        <Field
          id="notas"
          label="Notas (opcional)"
          hint={`${notas.length}/${NOTAS_MAX}`}
          error={errors.notas}
        >
          <Textarea
            id="notas"
            value={notas}
            maxLength={NOTAS_MAX}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Ej. pasar por la puerta trasera"
            rows={3}
            aria-describedby={errors.notas ? "notas-error" : "notas-hint"}
          />
        </Field>
      </Card>

      {errors.form && (
        <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">
          {errors.form}
        </p>
      )}

      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {loading ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
        {loading ? "Creando solicitud…" : "Solicitar recolección"}
      </Button>
    </form>
  );
}
