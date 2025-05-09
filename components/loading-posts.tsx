import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingPosts() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="w-full h-64 rounded-lg" />
          <Skeleton className="w-3/4 h-5 rounded" />
          <Skeleton className="w-1/2 h-4 rounded" />
        </div>
      ))}
    </div>
  )
}
