"use client"

import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function BackgroundSync() {
  const { toast } = useToast()

  useEffect(() => {
    // Check for updates every minute
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/check-updates", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })

        if (!response.ok) return

        const data = await response.json()

        if (data.hasUpdates) {
          toast({
            title: "New content available",
            description: "Pull to refresh or click to update",
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="hover:bg-primary hover:text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Update
              </Button>
            ),
            duration: 10000,
          })
        }
      } catch (error) {
        console.error("Failed to check for updates:", error)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [toast])

  return null
}
