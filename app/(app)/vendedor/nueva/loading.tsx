import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-xl" aria-busy="true">
      <Skeleton className="mb-2 h-5 w-16" />
      <Skeleton className="mb-2 h-8 w-52" />
      <Skeleton className="mb-5 h-5 w-72" />
      <Skeleton className="mb-5 h-44 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}
