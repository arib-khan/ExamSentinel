import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard({ count = 1 }) {
  return (
    <div className="flex flex-wrap gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col space-y-3 w-[250px]">
          <Skeleton className="h-[125px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        </div>
      ))}
    </div>
  );
}
