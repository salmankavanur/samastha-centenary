"use client"

import { useState, useEffect } from "react"
import { Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Update UI to notify the user they can install the PWA
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }
      // Clear the saved prompt since it can't be used again
      setDeferredPrompt(null)
      setIsInstallable(false)
    })
  }

  if (!isInstallable) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Install App</CardTitle>
        <CardDescription>Get daily reminders and offline access</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-start">
        <p className="mb-4">
          Install this app on your device to receive daily status updates and access content even when offline.
        </p>
        <Button onClick={handleInstallClick}>
          <Download className="w-4 h-4 mr-2" />
          Install App
        </Button>
      </CardContent>
    </Card>
  )
}
