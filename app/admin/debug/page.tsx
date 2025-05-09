"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function DateDebugPage() {
  const [testDate, setTestDate] = useState("")
  const [testResult, setTestResult] = useState<any>(null)
  const [currentDateInfo, setCurrentDateInfo] = useState<any>(null)

  const fetchCurrentDateInfo = async () => {
    try {
      const response = await fetch("/api/debug-dates")
      const data = await response.json()
      setCurrentDateInfo(data)
    } catch (error) {
      console.error("Error fetching date info:", error)
    }
  }

  const testCustomDate = async () => {
    if (!testDate) return

    try {
      const response = await fetch(`/api/debug-dates?date=${testDate}`)
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      console.error("Error testing date:", error)
    }
  }

  // Fetch current date info on component mount
  useState(() => {
    fetchCurrentDateInfo()
  })

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Date Debugging Tools</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Date Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentDateInfo ? (
              <>
                <div>
                  <h3 className="font-semibold">Server Date:</h3>
                  <p>{currentDateInfo.currentDate}</p>
                  <p className="text-xs text-gray-500">{currentDateInfo.currentDateISO}</p>
                </div>

                <div>
                  <h3 className="font-semibold">Countdown Start Date:</h3>
                  <p>{currentDateInfo.countdownStartDate}</p>
                  <p className="text-xs text-gray-500">{currentDateInfo.countdownStartDateISO}</p>
                </div>

                <div>
                  <h3 className="font-semibold">Event Date:</h3>
                  <p>{currentDateInfo.eventDate}</p>
                  <p className="text-xs text-gray-500">{currentDateInfo.eventDateISO}</p>
                </div>

                <div>
                  <h3 className="font-semibold">Current Day Calculation:</h3>
                  <p>
                    Day {currentDateInfo.currentDayNumber} of {currentDateInfo.totalDays}
                  </p>
                  <p>{currentDateInfo.daysRemaining} days remaining</p>
                  <p>Date for current day: {currentDateInfo.dateForCurrentDay}</p>
                </div>

                <div>
                  <h3 className="font-semibold">{currentDateInfo.currentDate} Test:</h3>
                  <p>
                    Day {currentDateInfo.currentDayNumber} of {currentDateInfo.totalDays}
                  </p>
                  <p>{currentDateInfo.daysRemaining} days remaining</p>
                </div>

                <Button onClick={fetchCurrentDateInfo}>Refresh Data</Button>
              </>
            ) : (
              <p>Loading date information...</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Custom Date</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p>Enter a date to test (YYYY-MM-DD):</p>
              <div className="flex gap-2 mt-2">
                <Input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
                <Button onClick={testCustomDate}>Test Date</Button>
              </div>
            </div>

            {testResult && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                <h3 className="font-semibold">Date: {testResult.testDate}</h3>
                <p>Day Number: {testResult.dayNumber}</p>
                <p>Days Remaining: {testResult.daysRemaining}</p>
                <p>Days Since Start: {testResult.daysSinceStart}</p>
                <p>Days Until Event: {testResult.daysUntilEvent}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
