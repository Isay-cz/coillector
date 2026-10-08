import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true">
      <Skeleton className="mb-2 h-5 w-16" />
      <Skeleton className="mb-2 h-8 w-56" />
      <Skeleton className="mb-5 h-5 w-32" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[260px] rounded-2xl" />
        <Skeleton className="h-[420px] rounded-2xl" />
      </div>
    </div>
  );
}
