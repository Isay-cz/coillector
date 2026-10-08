"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { friendlyDbError } from "@/lib/errors";
import type { Perfil } from "@/lib/types";
import { normalizePhone, validatePhone } from "@/lib/validation";

type Campos = { nombre: string; telefono: string; nombre_comercio: string; direccion: string; empresa: string };

export function PerfilForm({ perfil }: { perfil: Perfil }) {
  const router = useRouter();
  const vendedor = perfil.rol === "vendedor";
  const [v, setV] = useState<Campos>({
    nombre: perfil.nombre ?? "",
    telefono: perfil.telefono ?? "",
    nombre_comercio: perfil.nombre_comercio ?? "",
    direccion: perfil.direccion ?? "",
    empresa: perfil.empresa ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Campos, string | null>>>({});
  const [loading, setLoading] = useState(false);
  const set = (k: keyof Campos) => (e: React.ChangeEvent<HTMLInputElement>) => setV((p) => ({ ...p, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = {
      nombre: v.nombre.trim() ? null : "Tu nombre es obligatorio.",
      telefono: validatePhone(v.telefono, { required: false }),
    };
    setErrors(found);
    if (found.nombre || found.telefono) return;

    setLoading(true);
    // Solo columnas editables: el rol y el correo no se pueden cambiar.
    const cambios = vendedor
      ? { nombre: v.nombre.trim(), telefono: normalizePhone(v.telefono) || null, nombre_comercio: v.nombre_comercio.trim() || null, direccion: v.direccion.trim() || null }
      : { nombre: v.nombre.trim(), telefono: normalizePhone(v.telefono) || null, empresa: v.empresa.trim() || null };
    const { error } = await createClient().from("users").update(cambios).eq("id", perfil.id);
    setLoading(false);
    if (error) {
      toast.error(friendlyDbError(error));
      return;
    }
    toast.success("Perfil actualizado");
    router.refresh();
  }

  return (
    <Card className="p-5">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <h2 className="font-display text-base font-semibold">Tus datos</h2>
        <Field id="nombre" label="Nombre" error={errors.nombre}>
          <Input id="nombre" value={v.nombre} onChange={set("nombre")} autoComplete="name" aria-invalid={Boolean(errors.nombre)} />
        </Field>
        <Field id="telefono" label="Teléfono" hint="10 dígitos." error={errors.telefono}>
          <Input id="telefono" type="tel" inputMode="tel" value={v.telefono} onChange={set("telefono")} placeholder="55 1234 5678" aria-invalid={Boolean(errors.telefono)} />
        </Field>
        {vendedor ? (
          <>
            <Field id="nombre_comercio" label="Nombre del comercio">
              <Input id="nombre_comercio" value={v.nombre_comercio} onChange={set("nombre_comercio")} />
            </Field>
            <Field id="direccion" label="Dirección del comercio" hint="Se usa para prellenar tus solicitudes.">
              <Input id="direccion" value={v.direccion} onChange={set("direccion")} autoComplete="street-address" />
            </Field>
          </>
        ) : (
          <Field id="empresa" label="Empresa recicladora">
            <Input id="empresa" value={v.empresa} onChange={set("empresa")} />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <ReadOnly label="Correo" value={perfil.email} />
          <ReadOnly label="Rol" value={perfil.rol} capitalize />
        </div>
        <Button type="submit" disabled={loading} className="mt-1">
          {loading ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />}
          Guardar cambios
        </Button>
      </form>
    </Card>
  );
}

function ReadOnly({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="min-w-0 rounded-xl bg-cream px-3 py-2.5">
      <p className="flex items-center gap-1 text-xs text-muted">
        <Lock className="size-3" aria-hidden /> {label}
      </p>
      <p className={`truncate text-sm font-medium ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}
