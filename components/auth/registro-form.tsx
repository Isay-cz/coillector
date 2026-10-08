"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MailCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { DemoLoginButtons } from "@/components/auth/demo-login";
import { RoleHero } from "@/components/auth/role-hero";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { createClient } from "@/lib/supabase/client";
import { siteUrl } from "@/lib/env";
import { friendlyAuthError } from "@/lib/errors";
import { homeForRole, type Rol } from "@/lib/types";
import { normalizePhone, validateEmail, validatePassword, validatePhone, validateRequired } from "@/lib/validation";

type Values = {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  nombre_comercio: string;
  direccion: string;
  empresa: string;
};
type Errors = Partial<Record<keyof Values | "form", string | null>>;

const COPY = {
  vendedor: {
    title: "Crea tu cuenta de vendedor",
    subtitle: "Solicita la recolección de tu aceite usado y recibe tu pago en minutos.",
  },
  recolector: {
    title: "Crea tu cuenta de recolector",
    subtitle: "Recibe solicitudes de la zona piloto, valida la calidad y confirma entregas.",
  },
};

function validate(rol: Rol, v: Values): Errors {
  const e: Errors = {
    nombre: validateRequired(v.nombre, "Tu nombre"),
    email: validateEmail(v.email),
    password: validatePassword(v.password),
    telefono: validatePhone(v.telefono),
  };
  if (rol === "vendedor") {
    e.nombre_comercio = validateRequired(v.nombre_comercio, "El nombre del comercio");
    e.direccion = validateRequired(v.direccion, "La dirección");
  } else {
    e.empresa = validateRequired(v.empresa, "La empresa recicladora");
  }
  return e;
}

export function RegistroForm({ rol }: { rol: Rol }) {
  const router = useRouter();
  const [values, setValues] = useState<Values>({
    nombre: "",
    email: "",
    password: "",
    telefono: "",
    nombre_comercio: "",
    direccion: "",
    empresa: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const copy = COPY[rol];

  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [key]: e.target.value };
    setValues(next);
    if (touched[key]) setErrors((prev) => ({ ...prev, [key]: validate(rol, next)[key] }));
  };
  const blur = (key: keyof Values) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: validate(rol, values)[key] }));
  };
  const a11y = (key: keyof Values) => ({
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(rol, values);
    setErrors(found);
    setTouched({ nombre: true, email: true, password: true, telefono: true, nombre_comercio: true, direccion: true, empresa: true });
    const firstError = (Object.keys(found) as (keyof Values)[]).find((k) => found[k]);
    if (firstError) {
      document.getElementById(firstError)?.focus();
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const home = homeForRole(rol);
    const metadata =
      rol === "vendedor"
        ? {
            rol,
            nombre: values.nombre.trim(),
            telefono: normalizePhone(values.telefono),
            nombre_comercio: values.nombre_comercio.trim(),
            direccion: values.direccion.trim(),
          }
        : { rol, nombre: values.nombre.trim(), telefono: normalizePhone(values.telefono), empresa: values.empresa.trim() };

    const { data, error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: { data: metadata, emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(home)}` },
    });

    if (error) {
      const message = friendlyAuthError(error);
      setErrors({ form: message });
      toast.error(message);
      setLoading(false);
      return;
    }

    // Con confirmación de correo activa, Supabase devuelve un usuario sin identidades si el correo ya existía.
    if (!data.session && data.user && data.user.identities?.length === 0) {
      const message = "Ya existe una cuenta con este correo. Inicia sesión.";
      setErrors({ email: message });
      toast.error(message);
      setLoading(false);
      return;
    }

    if (data.session) {
      toast.success("¡Cuenta creada! Bienvenido a Coillector.");
      router.replace(home);
      router.refresh();
      return;
    }

    setSentTo(values.email.trim());
    setLoading(false);
  }

  if (sentTo) {
    return (
      <div className="animate-fade-in flex flex-col items-center gap-5 pt-10 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-success-soft">
          <MailCheck className="size-9 text-success" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Revisa tu correo</h1>
          <p className="text-muted">
            Enviamos un enlace de confirmación a <span className="font-medium text-ink">{sentTo}</span>. Ábrelo desde
            este teléfono para entrar a Coillector.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/login?rol=${rol}`}>Ya lo confirmé, iniciar sesión</Link>
        </Button>
        <p className="text-sm text-muted">¿No llegó? Revisa spam o espera un minuto.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <RoleHero variant={rol} title={copy.title} subtitle={copy.subtitle} />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field id="nombre" label="Tu nombre" error={errors.nombre}>
          <Input id="nombre" autoComplete="name" placeholder="Ej. María López" value={values.nombre} onChange={set("nombre")} onBlur={blur("nombre")} {...a11y("nombre")} />
        </Field>
        <Field id="email" label="Correo electrónico" error={errors.email}>
          <Input id="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="tu@correo.com" value={values.email} onChange={set("email")} onBlur={blur("email")} {...a11y("email")} />
        </Field>
        <Field id="password" label="Contraseña" hint="Mínimo 8 caracteres." error={errors.password}>
          <PasswordInput id="password" autoComplete="new-password" placeholder="Crea una contraseña" value={values.password} onChange={set("password")} onBlur={blur("password")} {...a11y("password")} />
        </Field>
        <Field id="telefono" label="Teléfono" hint="10 dígitos, sin lada internacional." error={errors.telefono}>
          <Input id="telefono" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="55 1234 5678" value={values.telefono} onChange={set("telefono")} onBlur={blur("telefono")} {...a11y("telefono")} />
        </Field>

        {rol === "vendedor" ? (
          <>
            <Field id="nombre_comercio" label="Nombre del comercio" error={errors.nombre_comercio}>
              <Input id="nombre_comercio" autoComplete="organization" placeholder="Ej. Tacos Don Pepe" value={values.nombre_comercio} onChange={set("nombre_comercio")} onBlur={blur("nombre_comercio")} {...a11y("nombre_comercio")} />
            </Field>
            <Field id="direccion" label="Dirección del comercio" hint="Calle, número y colonia." error={errors.direccion}>
              <Input id="direccion" autoComplete="street-address" placeholder="Ej. Av. Insurgentes Sur 1000, Del Valle" value={values.direccion} onChange={set("direccion")} onBlur={blur("direccion")} {...a11y("direccion")} />
            </Field>
          </>
        ) : (
          <Field id="empresa" label="Empresa recicladora" error={errors.empresa}>
            <Input id="empresa" autoComplete="organization" placeholder="Ej. BioAceites CDMX" value={values.empresa} onChange={set("empresa")} onBlur={blur("empresa")} {...a11y("empresa")} />
          </Field>
        )}

        {errors.form && (
          <div role="alert" className="flex flex-col gap-3 rounded-xl bg-danger-soft p-3 text-sm text-danger">
            <p>{errors.form}</p>
            {/cuenta demo/.test(errors.form) && <DemoLoginButtons order={rol === "recolector" ? ["recolector", "vendedor"] : ["vendedor", "recolector"]} />}
          </div>
        )}

        <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
          {loading ? <Loader2 className="animate-spin" aria-hidden /> : <UserPlus aria-hidden />}
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href={`/login?rol=${rol}`} className="font-medium text-primary underline-offset-4 hover:underline dark:text-amber">
          Inicia sesión
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-muted">
        {rol === "vendedor" ? "¿Recolectas aceite? " : "¿Tienes un negocio de comida? "}
        <Link
          href={rol === "vendedor" ? "/registro/recolector" : "/registro/vendedor"}
          className="font-medium text-primary underline-offset-4 hover:underline dark:text-amber"
        >
          {rol === "vendedor" ? "Regístrate como recolector" : "Regístrate como vendedor"}
        </Link>
      </p>
    </div>
  );
}
