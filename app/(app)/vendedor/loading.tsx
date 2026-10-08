import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Cargando solicitudes">
      <Skeleton className="mb-2 h-4 w-24" />
      <Skeleton className="mb-5 h-8 w-48" />
      <div className="mb-6 grid grid-cols-3 gap-2.5 md:gap-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[92px] rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[116px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
