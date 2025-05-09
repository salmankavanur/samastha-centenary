"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Download, AlertCircle, CheckCircle, Database, FileImage, RefreshCw } from "lucide-react"

export default function BackupRestore() {
  const { toast } = useToast()
  const [backupLoading, setBackupLoading] = useState(false)
  const [supabaseBackupLoading, setSupabaseBackupLoading] = useState(false)
  const [fullBackupLoading, setFullBackupLoading] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null)
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null)
  const [restoreError, setRestoreError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [backupProgress, setBackupProgress] = useState<{ current: number; total: number } | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [debugLoading, setDebugLoading] = useState(false)

  const handleDatabaseBackup = async () => {
    try {
      setBackupLoading(true)
      setBackupSuccess(null)

      const response = await fetch("/api/admin/backup/mongodb")

      if (!response.ok) {
        throw new Error("Failed to create database backup")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `suhba-mongodb-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()

      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setBackupSuccess("Database backup created successfully!")

      toast({
        title: "Database backup created",
        description: "Your MongoDB database backup has been downloaded.",
      })
    } catch (error) {
      console.error("Error creating database backup:", error)
      toast({
        title: "Backup failed",
        description: error instanceof Error ? error.message : "An error occurred during backup.",
        variant: "destructive",
      })
    } finally {
      setBackupLoading(false)
    }
  }

  const handleSupabaseBackup = async () => {
    try {
      setSupabaseBackupLoading(true)
      setBackupSuccess(null)
      setBackupProgress(null)

      toast({
        title: "Creating Supabase backup",
        description: "This may take a while for large media libraries...",
      })

      const response = await fetch("/api/admin/backup/supabase")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create Supabase backup")
      }

      const backupData = await response.json()

      // Create a formatted JSON string with proper indentation
      const jsonString = JSON.stringify(backupData, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `suhba-supabase-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()

      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Calculate total files and size
      const totalFiles =
        backupData.metadata?.totalFiles ||
        Object.values(backupData)
          .filter(Array.isArray)
          .reduce((acc: number, files: any[]) => acc + files.length, 0)

      // Get total size
      const totalSize = backupData.metadata?.formattedSize || "unknown size"

      setBackupSuccess(`Supabase backup created successfully! (${totalFiles} files, ${totalSize} total)`)

      toast({
        title: "Supabase backup created",
        description: `Your Supabase storage backup with ${totalFiles} files (${totalSize}) has been downloaded.`,
      })
    } catch (error) {
      console.error("Error creating Supabase backup:", error)
      toast({
        title: "Backup failed",
        description: error instanceof Error ? error.message : "An error occurred during backup.",
        variant: "destructive",
      })
    } finally {
      setBackupProgress(null)
      setSupabaseBackupLoading(false)
    }
  }

  const handleFullBackup = async () => {
    try {
      setFullBackupLoading(true)
      setBackupSuccess(null)

      const response = await fetch("/api/admin/backup/full")

      if (!response.ok) {
        throw new Error("Failed to create full backup")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `suhba-full-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()

      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setBackupSuccess("Full backup created successfully!")

      toast({
        title: "Full backup created",
        description: "Your complete system backup has been downloaded.",
      })
    } catch (error) {
      console.error("Error creating full backup:", error)
      toast({
        title: "Backup failed",
        description: error instanceof Error ? error.message : "An error occurred during backup.",
        variant: "destructive",
      })
    } finally {
      setFullBackupLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setRestoreError(null)
      setRestoreSuccess(null)
    }
  }

  const handleRestore = async () => {
    if (!file) {
      setRestoreError("Please select a backup file")
      return
    }

    try {
      setRestoreLoading(true)
      setRestoreError(null)
      setRestoreSuccess(null)

      // Determine backup type from filename
      const fileName = file.name.toLowerCase()
      let endpoint = "/api/admin/restore"

      if (fileName.includes("mongodb")) {
        endpoint = "/api/admin/restore/mongodb"
      } else if (fileName.includes("supabase")) {
        endpoint = "/api/admin/restore/supabase"
      } else if (fileName.includes("full")) {
        endpoint = "/api/admin/restore/full"
      }

      // Read the file
      const fileContent = await file.text()
      let backupData

      try {
        backupData = JSON.parse(fileContent)
      } catch (e) {
        throw new Error("Invalid backup file format")
      }

      // Send to API
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backupData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to restore backup")
      }

      const responseData = await response.json()

      // Show more detailed success message for Supabase restores
      if (endpoint.includes("supabase") && responseData.results) {
        const results = responseData.results
        setRestoreSuccess(
          `Backup restored successfully! ${results.success} files restored, ${results.failed} failed, ${results.skipped} skipped.`,
        )
      } else {
        setRestoreSuccess("Backup restored successfully!")
      }

      setFile(null)

      // Reset file input
      const fileInput = document.getElementById("backupFile") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }

      toast({
        title: "Backup restored",
        description: "Your system has been restored from the backup file.",
      })
    } catch (error) {
      console.error("Error restoring backup:", error)
      setRestoreError(error instanceof Error ? error.message : "An error occurred during restore")

      toast({
        title: "Restore failed",
        description: error instanceof Error ? error.message : "An error occurred during restore.",
        variant: "destructive",
      })
    } finally {
      setRestoreLoading(false)
    }
  }

  const handleDebugSupabase = async () => {
    try {
      setDebugLoading(true)
      setDebugInfo(null)

      const response = await fetch("/api/debug-supabase")

      if (!response.ok) {
        throw new Error("Failed to debug Supabase storage")
      }

      const data = await response.json()
      setDebugInfo(data)

      toast({
        title: "Supabase storage debug complete",
        description: `Found ${data.buckets.length} buckets and ${Object.values(data.files).flat().length} files.`,
      })
    } catch (error) {
      console.error("Error debugging Supabase storage:", error)
      toast({
        title: "Debug failed",
        description: error instanceof Error ? error.message : "An error occurred during debug.",
        variant: "destructive",
      })
    } finally {
      setDebugLoading(false)
    }
  }

  function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Backup & Restore</CardTitle>
        <CardDescription>Create backups of your data or restore from a previous backup</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="backup">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="restore">Restore</TabsTrigger>
          </TabsList>

          <TabsContent value="backup" className="space-y-6">
            {backupSuccess && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription>{backupSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDebugSupabase}
                disabled={debugLoading}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                {debugLoading ? "Checking..." : "Check Storage"}
              </Button>
            </div>

            {debugInfo && (
              <Alert className="mb-4">
                <AlertTitle>Storage Status</AlertTitle>
                <AlertDescription>
                  <div className="text-xs mt-2 space-y-1">
                    <p>Buckets: {debugInfo.buckets.map((b: any) => b.name).join(", ") || "None"}</p>
                    <p>Files: {Object.values(debugInfo.files).flat().length}</p>
                    {debugInfo.missingBuckets.length > 0 && (
                      <p className="text-amber-600 dark:text-amber-400">
                        Missing buckets: {debugInfo.missingBuckets.join(", ")}
                      </p>
                    )}
                    {debugInfo.errors.length > 0 && (
                      <p className="text-red-600 dark:text-red-400">Errors: {debugInfo.errors.length}</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Database className="h-5 w-5 mr-2 text-blue-500" />
                    MongoDB Backup
                  </CardTitle>
                  <CardDescription>Backup all database collections</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    Includes users, posts, contributions, and all other MongoDB data.
                  </p>
                  <Button onClick={handleDatabaseBackup} disabled={backupLoading} className="w-full">
                    {backupLoading ? "Creating..." : "Download Backup"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <FileImage className="h-5 w-5 mr-2 text-purple-500" />
                    Supabase Backup
                  </CardTitle>
                  <CardDescription>Backup all storage files with content</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    Includes the actual content of images, profile pictures, and all other files stored in Supabase.
                  </p>
                  <Button
                    onClick={handleSupabaseBackup}
                    disabled={supabaseBackupLoading}
                    className="w-full"
                    variant="outline"
                  >
                    {supabaseBackupLoading ? "Creating..." : "Download Backup"}
                  </Button>
                  {backupProgress && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">
                        Backing up files: {backupProgress.current} of {backupProgress.total}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${(backupProgress.current / backupProgress.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Download className="h-5 w-5 mr-2 text-green-500" />
                    Full System Backup
                  </CardTitle>
                  <CardDescription>Complete system backup</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    Includes both MongoDB data and Supabase storage in a single backup file.
                  </p>
                  <Button
                    onClick={handleFullBackup}
                    disabled={fullBackupLoading}
                    className="w-full"
                    variant="secondary"
                  >
                    {fullBackupLoading ? "Creating..." : "Download Full Backup"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="restore">
            <div className="space-y-4">
              <Alert variant="warning" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Restoring from a backup will overwrite your current data. Make sure to create a backup of your current
                  data before proceeding.
                </AlertDescription>
              </Alert>

              {restoreError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{restoreError}</AlertDescription>
                </Alert>
              )}

              {restoreSuccess && (
                <Alert className="mb-4 bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription>{restoreSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="backupFile">Select Backup File</Label>
                <Input
                  id="backupFile"
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  disabled={restoreLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Select a MongoDB, Supabase, or full system backup file (.json)
                </p>
              </div>

              <Button onClick={handleRestore} disabled={!file || restoreLoading} className="w-full">
                {restoreLoading ? "Restoring..." : "Restore Backup"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-muted/50 border-t px-6 py-4">
        <div className="text-xs text-muted-foreground">
          <strong>Note:</strong> Regular backups are recommended to prevent data loss. Store your backup files in a
          secure location.
        </div>
      </CardFooter>
    </Card>
  )
}
