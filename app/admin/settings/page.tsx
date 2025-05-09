"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import SystemStatus from "@/components/system-status"
import BackupRestore from "@/components/backup-restore"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isInitializing, setIsInitializing] = useState(false)

  const handleInitializeSystem = async () => {
    try {
      setIsInitializing(true)

      // Call the init API to set up MongoDB collections and indexes
      const response = await fetch("/api/init")

      if (!response.ok) {
        throw new Error("Failed to initialize system")
      }

      toast({
        title: "System initialized",
        description: "Database and storage have been successfully initialized.",
      })
    } catch (error) {
      console.error("Error initializing system:", error)
      toast({
        title: "Initialization failed",
        description: error instanceof Error ? error.message : "An error occurred during initialization.",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="system">System Status</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date</Label>
                <Input id="eventDate" type="date" defaultValue="2026-02-04" />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableContributions">Enable Public Contributions</Label>
                <Switch id="enableContributions" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableNotifications">Enable Push Notifications</Label>
                <Switch id="enableNotifications" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <SystemStatus />
        </TabsContent>

        <TabsContent value="backup">
          <BackupRestore />
        </TabsContent>
      </Tabs>
    </div>
  )
}
