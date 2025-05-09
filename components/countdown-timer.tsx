"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface CountdownProps {
  targetDate: string
}

export default function CountdownTimer({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const target = new Date(targetDate).getTime()

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const difference = target - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Countdown to Event</h2>

      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        <CountdownUnit value={timeLeft.days} label="Days" />
        <CountdownUnit value={timeLeft.hours} label="Hours" />
        <CountdownUnit value={timeLeft.minutes} label="Minutes" />
        <CountdownUnit value={timeLeft.seconds} label="Seconds" />
      </div>
    </div>
  )
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col items-center justify-center p-2 text-center sm:p-4">
          <span className="text-2xl font-bold sm:text-4xl">{value}</span>
          <span className="text-xs text-gray-500 sm:text-sm">{label}</span>
        </div>
      </CardContent>
    </Card>
  )
}
