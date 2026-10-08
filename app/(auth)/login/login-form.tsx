"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Info, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { RoleHero } from "@/components/auth/role-hero";
import { DemoLoginButtons } from "@/components/auth/demo-login";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/errors";
import { homeForRole, type Rol } from "@/lib/types";
import { validateEmail } from "@/lib/validation";

const COPY = {
  vendedor: { title: "Entra a tu cuenta", subtitle: "Solicita recolecciones y sigue tus pagos." },
  recolector: { title: "Entra como recolector", subtitle: "Consulta pendientes y confirma entregas." },
  neutral: { title: "Bienvenido de vuelta", subtitle: "Entra para continuar con tus recolecciones." },
};

export function LoginForm({
  rol,
  next,
  confirmado,
  linkError,
}: {
  rol: Rol | null;
  next: string | null;
  confirmado: boolean;
  linkError: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null; form?: string | null }>({});
  const [loading, setLoading] = useState(false);
  const copy = COPY[rol ?? "neutral"];
  const fromQr = next?.startsWith("/recolector/solicitud/");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailError = validateEmail(email);
    const passwordError = password ? null : "Ingresa tu contraseña.";
    setErrors({ email: emailError, password: passwordError });
    if (emailError || passwordError) return;

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) {
      const message = friendlyAuthError(error);
      setErrors({ form: message });
      toast.error(message);
      setLoading(false);
      return;
    }

    const { data: perfil } = await supabase.from("users").select("rol, nombre").eq("id", data.user.id).maybeSingle();
    if (!perfil) {
      await supabase.auth.signOut();
      const message = "Tu cuenta no tiene perfil en Coillector. Regístrate de nuevo o usa una cuenta demo.";
      setErrors({ form: message });
      toast.error(message);
      setLoading(false);
      return;
    }

    toast.success(perfil.nombre ? `¡Hola, ${perfil.nombre.split(" ")[0]}!` : "¡Bienvenido!");
    router.replace(next ?? homeForRole(perfil.rol));
    router.refresh();
  }

  return (
    <div className="animate-fade-in">
      <RoleHero variant={rol ?? "neutral"} title={copy.title} subtitle={copy.subtitle} />

      {confirmado && (
        <p className="mb-4 flex items-start gap-2 rounded-xl bg-success-soft p-3 text-sm text-success">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden /> Tu correo quedó confirmado. Inicia sesión.
        </p>
      )}
      {linkError && (
        <p className="mb-4 flex items-start gap-2 rounded-xl bg-warning-soft p-3 text-sm text-warning">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden /> El enlace expiró o ya se usó. Inicia sesión con tu
          correo y contraseña.
        </p>
      )}
      {fromQr && (
        <p className="mb-4 flex items-start gap-2 rounded-xl bg-amber-soft p-3 text-sm text-ink">
          <Info className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden /> Entra con tu cuenta de recolector para
          confirmar esta recolección. Volverás a la solicitud automáticamente.
        </p>
      )}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field id="email" label="Correo electrónico" error={errors.email}>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
        </Field>
        <Field id="password" label="Contraseña" error={errors.password}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
        </Field>

        {errors.form && (
          <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">
            {errors.form}
          </p>
        )}

        <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
          {loading ? <Loader2 className="animate-spin" aria-hidden /> : <LogIn aria-hidden />}
          {loading ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      <div className="mt-6 space-y-1 text-center text-sm text-muted">
        <p>¿Aún no tienes cuenta?</p>
        <p className="flex flex-wrap items-center justify-center gap-x-1">
          <Link href="/registro/vendedor" className="font-medium text-primary underline-offset-4 hover:underline dark:text-amber">
            Regístrate como vendedor
          </Link>
          <span aria-hidden>·</span>
          <Link href="/registro/recolector" className="font-medium text-primary underline-offset-4 hover:underline dark:text-amber">
            como recolector
          </Link>
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-border p-4">
        <p className="mb-3 text-sm font-medium text-muted">¿Solo quieres probar la app?</p>
        <DemoLoginButtons next={next} order={rol === "recolector" ? ["recolector", "vendedor"] : ["vendedor", "recolector"]} />
      </div>
    </div>
  );
}
