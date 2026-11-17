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
import { parseIdentificador, validatePassword } from "@/lib/validation";

type Values = { identificador: string; password: string };
type Errors = Partial<Record<keyof Values | "form", string | null>>;

const COPY = {
  vendedor: {
    title: "Crea tu cuenta de vendedor",
    subtitle: "Solo tu celular o correo. Los datos de tu negocio los pedimos al hacer tu primera solicitud.",
  },
  recolector: {
    title: "Crea tu cuenta de recolector",
    subtitle: "Solo tu celular o correo. Podrás completar tu perfil después.",
  },
};

function validate(v: Values): Errors {
  return { identificador: parseIdentificador(v.identificador).error, password: validatePassword(v.password) };
}

export function RegistroForm({ rol }: { rol: Rol }) {
  const router = useRouter();
  const [values, setValues] = useState<Values>({ identificador: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const copy = COPY[rol];

  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [key]: e.target.value };
    setValues(next);
    if (touched[key]) setErrors((prev) => ({ ...prev, [key]: validate(next)[key] }));
  };
  const blur = (key: keyof Values) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: validate(values)[key] }));
  };
  const a11y = (key: keyof Values) => ({
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `${key}-error` : `${key}-hint`,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({ identificador: true, password: true });
    const firstError = (Object.keys(found) as (keyof Values)[]).find((k) => found[k]);
    if (firstError) {
      document.getElementById(firstError)?.focus();
      return;
    }

    const id = parseIdentificador(values.identificador);
    if (!id.email) return;
    setLoading(true);
    const supabase = createClient();
    const home = homeForRole(rol);
    const { data, error } = await supabase.auth.signUp({
      email: id.email,
      password: values.password,
      options: {
        data: { rol, ...(id.telefono ? { telefono: id.telefono } : {}) },
        emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(home)}`,
      },
    });

    if (error) {
      const message =
        error.code === "user_already_exists" || /already registered/i.test(error.message)
          ? `Ya existe una cuenta con ${id.tipo === "telefono" ? "este celular" : "este correo"}. Inicia sesión.`
          : friendlyAuthError(error);
      setErrors({ form: message });
      toast.error(message);
      setLoading(false);
      return;
    }

    // Con confirmación de correo activa, Supabase devuelve un usuario sin identidades si el correo ya existía.
    if (!data.session && data.user && data.user.identities?.length === 0) {
      const message = "Ya existe una cuenta con este correo. Inicia sesión.";
      setErrors({ identificador: message });
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

    setSentTo(id.email);
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
        <Field
          id="identificador"
          label="Celular o correo"
          hint="Tu celular a 10 dígitos o tu correo. Con él vas a entrar."
          error={errors.identificador}
        >
          <Input
            id="identificador"
            type="text"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="55 1234 5678 o tu@correo.com"
            value={values.identificador}
            onChange={set("identificador")}
            onBlur={blur("identificador")}
            {...a11y("identificador")}
          />
        </Field>
        <Field id="password" label="Contraseña" hint="Mínimo 8 caracteres." error={errors.password}>
          <PasswordInput id="password" autoComplete="new-password" placeholder="Crea una contraseña" value={values.password} onChange={set("password")} onBlur={blur("password")} {...a11y("password")} />
        </Field>

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
