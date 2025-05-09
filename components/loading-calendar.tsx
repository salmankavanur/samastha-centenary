import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingCalendar() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 24 }).map((_, i) => (
        <Skeleton key={i} className="w-full h-24 rounded-lg" />
      ))}
    </div>
  )
}
