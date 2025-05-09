import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface SkeletonCardProps {
  hasImage?: boolean
  imageHeight?: string
  hasHeader?: boolean
  hasFooter?: boolean
  lines?: number
}

export function SkeletonCard({
  hasImage = true,
  imageHeight = "h-48",
  hasHeader = true,
  hasFooter = true,
  lines = 3,
}: SkeletonCardProps) {
  return (
    <Card className="overflow-hidden">
      {hasImage && <div className={`${imageHeight} bg-gray-200 dark:bg-gray-700 animate-pulse`}></div>}

      {hasHeader && (
        <CardHeader className="pb-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
        </CardHeader>
      )}

      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${i === lines - 1 ? "w-2/3" : "w-full"}`}
          ></div>
        ))}
      </CardContent>

      {hasFooter && (
        <CardFooter className="flex justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
        </CardFooter>
      )}
    </Card>
  )
}
