"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export default function MongoDBStatus() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkConnection = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/test-db")
      const data = await response.json()

      setStatus(data)
    } catch (err) {
      setError("Failed to check MongoDB connection")
      console.error("Error checking MongoDB connection:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          MongoDB Connection Status
          {status?.connected ? (
            <Badge className="bg-green-500">Connected</Badge>
          ) : (
            <Badge variant="destructive">Disconnected</Badge>
          )}
        </CardTitle>
        <CardDescription>Check the connection status to your MongoDB database</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            Checking connection...
          </div>
        ) : error ? (
          <div className="flex items-center text-red-500 py-2">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        ) : status?.connected ? (
          <div className="space-y-4">
            <div className="flex items-center text-green-500">
              <CheckCircle className="w-5 h-5 mr-2" />
              Successfully connected to MongoDB
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Database: {status.database}</p>

              <div>
                <p className="text-sm font-medium mb-1">Collection Stats:</p>
                <ul className="text-sm space-y-1 pl-5 list-disc">
                  {Object.entries(status.stats).map(([collection, count]) => (
                    <li key={collection}>
                      {collection}: {count}
                    </li>
                  ))}
                </ul>
              </div>

              {status.missingCollections.length > 0 && (
                <div className="mt-2 text-amber-500">
                  <p className="text-sm font-medium">Missing Collections:</p>
                  <ul className="text-sm space-y-1 pl-5 list-disc">
                    {status.missingCollections.map((collection) => (
                      <li key={collection}>{collection}</li>
                    ))}
                  </ul>
                  <p className="text-xs mt-1">
                    Go to Settings page and click "Initialize System" to create missing collections.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center text-red-500 py-2">
            <AlertCircle className="w-5 h-5 mr-2" />
            Failed to connect to MongoDB: {status?.error || "Unknown error"}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkConnection} disabled={loading}>
          {loading ? (
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
      </CardFooter>
    </Card>
  )
}
