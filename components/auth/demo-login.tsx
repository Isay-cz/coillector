"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Store, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/env";
import { friendlyAuthError } from "@/lib/errors";
import { homeForRole, safeNext, type Rol } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Inicia sesión con una cuenta demo y lleva a la home de su rol (o a `next`). */
export function useDemoLogin(next?: string | null) {
  const router = useRouter();
  const [loading, setLoading] = useState<Rol | null>(null);

  async function login(rol: Rol) {
    if (!DEMO_PASSWORD) return;
    setLoading(rol);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: DEMO_ACCOUNTS[rol],
      password: DEMO_PASSWORD,
    });
    if (error) {
      toast.error(friendlyAuthError(error));
      setLoading(null);
      return;
    }
    toast.success(rol === "vendedor" ? "Entraste como vendedor demo" : "Entraste como recolector demo");
    router.replace(safeNext(next) ?? homeForRole(rol));
    router.refresh();
  }

  return { login, loading, enabled: Boolean(DEMO_PASSWORD) };
}

export function DemoLoginButtons({
  next,
  order = ["vendedor", "recolector"],
  className,
}: {
  next?: string | null;
  order?: Rol[];
  className?: string;
}) {
  const { login, loading, enabled } = useDemoLogin(next);
  if (!enabled) return null;
  return (
    <div className={cn("grid gap-2", className)}>
      {order.map((rol) => {
        const Icon = rol === "vendedor" ? Store : Truck;
        return (
          <Button
            key={rol}
            type="button"
            variant="outline"
            disabled={loading !== null}
            onClick={() => login(rol)}
            className="justify-start"
          >
            {loading === rol ? <Loader2 className="animate-spin" aria-hidden /> : <Icon aria-hidden />}
            Entrar como {rol} demo
          </Button>
        );
      })}
    </div>
  );
}
