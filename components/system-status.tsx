"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, RefreshCw, Database, HardDrive, AlertTriangle } from "lucide-react"

export default function SystemStatus() {
  const [mongoStatus, setMongoStatus] = useState<any>(null)
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null)
  const [loading, setLoading] = useState({
    mongo: true,
    supabase: true,
  })
  const [error, setError] = useState({
    mongo: null as string | null,
    supabase: null as string | null,
  })
  const [initializingSystem, setInitializingSystem] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const checkMongoConnection = async () => {
    try {
      setLoading((prev) => ({ ...prev, mongo: true }))
      setError((prev) => ({ ...prev, mongo: null }))

      const response = await fetch("/api/test-db")
      const data = await response.json()

      setMongoStatus(data)
    } catch (err) {
      setError((prev) => ({ ...prev, mongo: "Failed to check MongoDB connection" }))
      console.error("Error checking MongoDB connection:", err)
    } finally {
      setLoading((prev) => ({ ...prev, mongo: false }))
    }
  }

  const checkSupabaseConnection = async () => {
    try {
      setLoading((prev) => ({ ...prev, supabase: true }))
      setError((prev) => ({ ...prev, supabase: null }))

      const response = await fetch("/api/test-supabase")
      const data = await response.json()
      console.log("Supabase status response:", data)

      setSupabaseStatus(data)
    } catch (err) {
      setError((prev) => ({ ...prev, supabase: "Failed to check Supabase connection" }))
      console.error("Error checking Supabase connection:", err)
    } finally {
      setLoading((prev) => ({ ...prev, supabase: false }))
    }
  }

  const debugSupabase = async () => {
    try {
      const response = await fetch("/api/debug-supabase")
      const data = await response.json()
      console.log("Supabase debug info:", data)
      setDebugInfo(data)
    } catch (error) {
      console.error("Error debugging Supabase:", error)
    }
  }

  const initializeSystem = async () => {
    try {
      setInitializingSystem(true)
      const response = await fetch("/api/init")

      if (!response.ok) {
        throw new Error("Failed to initialize system")
      }

      const data = await response.json()
      console.log("System initialization response:", data)

      // Refresh status after initialization
      await checkMongoConnection()
      await checkSupabaseConnection()

      return data
    } catch (error) {
      console.error("Error initializing system:", error)
      throw error
    } finally {
      setInitializingSystem(false)
    }
  }

  useEffect(() => {
    checkMongoConnection()
    checkSupabaseConnection()
  }, [])

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">System Status</CardTitle>
        <CardDescription>Check the connection status of your database and storage</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mongodb" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mongodb">
              <Database className="w-4 h-4 mr-2" />
              MongoDB
            </TabsTrigger>
            <TabsTrigger value="supabase">
              <HardDrive className="w-4 h-4 mr-2" />
              Supabase
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mongodb" className="py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">MongoDB Connection</h3>
              {mongoStatus?.connected ? (
                <Badge className="bg-green-500">Connected</Badge>
              ) : (
                <Badge variant="destructive">Disconnected</Badge>
              )}
            </div>

            {loading.mongo ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Checking connection...
              </div>
            ) : error.mongo ? (
              <div className="flex items-center text-red-500 py-2">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error.mongo}
              </div>
            ) : mongoStatus?.connected ? (
              <div className="space-y-4">
                <div className="flex items-center text-green-500">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Successfully connected to MongoDB
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Database: {mongoStatus.database}</p>

                  <div>
                    <p className="text-sm font-medium mb-1">Collection Stats:</p>
                    <ul className="text-sm space-y-1 pl-5 list-disc">
                      {Object.entries(mongoStatus.stats || {}).map(([collection, count]) => (
                        <li key={collection}>
                          {collection}: {count as number}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {mongoStatus.missingCollections?.length > 0 && (
                    <div className="mt-2 text-amber-500">
                      <p className="text-sm font-medium">Missing Collections:</p>
                      <ul className="text-sm space-y-1 pl-5 list-disc">
                        {mongoStatus.missingCollections.map((collection: string) => (
                          <li key={collection}>{collection}</li>
                        ))}
                      </ul>
                      <p className="text-xs mt-1">Click "Initialize System" below to create missing collections.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center text-red-500 py-2">
                <AlertCircle className="w-5 h-5 mr-2" />
                Failed to connect to MongoDB: {mongoStatus?.error || "Unknown error"}
              </div>
            )}

            <Button onClick={checkMongoConnection} disabled={loading.mongo} className="mt-4">
              {loading.mongo ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Connection
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="supabase" className="py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Supabase Connection</h3>
              {supabaseStatus?.connected ? (
                <Badge className="bg-green-500">Connected</Badge>
              ) : (
                <Badge variant="destructive">Disconnected</Badge>
              )}
            </div>

            {loading.supabase ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Checking connection...
              </div>
            ) : error.supabase ? (
              <div className="flex items-center text-red-500 py-2">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error.supabase}
              </div>
            ) : supabaseStatus?.connected ? (
              <div className="space-y-4">
                <div className="flex items-center text-green-500">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Successfully connected to Supabase
                </div>

                <div className="space-y-2">
                  {supabaseStatus.buckets && supabaseStatus.buckets.length > 0 ? (
                    <div>
                      <p className="text-sm font-medium mb-1">Storage Buckets:</p>
                      <ul className="text-sm space-y-1 pl-5 list-disc">
                        {supabaseStatus.buckets.map((bucket: string) => (
                          <li key={bucket} className="flex items-center">
                            <span>{bucket}</span>
                            {supabaseStatus.fileCounts && supabaseStatus.fileCounts[bucket] > 0 ? (
                              <Badge className="ml-2 bg-green-500 text-xs">
                                {supabaseStatus.fileCounts[bucket]} files
                              </Badge>
                            ) : (
                              <Badge className="ml-2 bg-gray-500 text-xs">Empty</Badge>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-500">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      No storage buckets found.
                    </div>
                  )}

                  {supabaseStatus.missingBuckets?.length > 0 && (
                    <div className="mt-2 text-amber-500">
                      <p className="text-sm font-medium">Missing Buckets:</p>
                      <ul className="text-sm space-y-1 pl-5 list-disc">
                        {supabaseStatus.missingBuckets.map((bucket: string) => (
                          <li key={bucket}>{bucket}</li>
                        ))}
                      </ul>
                      <p className="text-xs mt-1">Click "Initialize System" below to create missing buckets.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center text-red-500 py-2">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>Failed to connect to Supabase: {supabaseStatus?.error || "Unknown error"}</span>
                </div>

                {debugInfo && (
                  <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                    <p className="font-medium mb-1">Debug Information:</p>
                    <ul className="space-y-1 pl-5 list-disc">
                      <li>Has Supabase URL: {debugInfo.environment?.hasUrl ? "Yes" : "No"}</li>
                      <li>Has Supabase Anon Key: {debugInfo.environment?.hasAnonKey ? "Yes" : "No"}</li>
                      <li>Timestamp: {debugInfo.timestamp}</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button onClick={checkSupabaseConnection} disabled={loading.supabase}>
                {loading.supabase ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Check Connection
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={debugSupabase}>
                Debug Supabase
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={initializeSystem} disabled={initializingSystem} className="w-full">
          {initializingSystem ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Initializing...
            </>
          ) : (
            "Initialize System"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
