import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingStatus() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Skeleton className="w-full aspect-[4/5] rounded-lg" />

      <div className="space-y-4">
        <Skeleton className="w-3/4 h-8 rounded" />
        <Skeleton className="w-1/2 h-4 rounded" />
        <Skeleton className="w-full h-24 rounded" />
        <Skeleton className="w-full h-12 rounded" />
        <div className="flex gap-3">
          <Skeleton className="w-32 h-10 rounded" />
          <Skeleton className="w-32 h-10 rounded" />
        </div>
      </div>
    </div>
  )
}
