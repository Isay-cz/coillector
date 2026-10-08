"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const { error } = await createClient().auth.signOut();
        if (error) {
          toast.error("No pudimos cerrar tu sesión. Intenta de nuevo.");
          setLoading(false);
          return;
        }
        toast.success("Sesión cerrada");
        router.replace("/");
        router.refresh();
      }}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : <LogOut aria-hidden />}
      Cerrar sesión
    </Button>
  );
}
