"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// recharts solo se descarga cuando se muestra el dashboard.
export const LitrosPorDiaLazy = dynamic(() => import("./litros-por-dia").then((m) => m.LitrosPorDiaChart), {
  ssr: false,
  loading: () => <Skeleton className="h-60 w-full rounded-xl" />,
});
