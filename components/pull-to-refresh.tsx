"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ArrowDown } from "lucide-react"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullProgress, setPullProgress] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull-to-refresh when at the top of the page
      if (window.scrollY <= 0) {
        startY.current = e.touches[0].clientY
        setIsPulling(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return

      currentY.current = e.touches[0].clientY
      const pullDistance = Math.max(0, currentY.current - startY.current)
      const maxPullDistance = 100

      // Calculate progress (0 to 1)
      const progress = Math.min(pullDistance / maxPullDistance, 1)
      setPullProgress(progress)

      // Prevent default scrolling when pulling
      if (pullDistance > 10 && window.scrollY <= 0) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = async () => {
      if (!isPulling) return

      const pullDistance = Math.max(0, currentY.current - startY.current)

      if (pullDistance > 70) {
        // Trigger refresh
        setIsRefreshing(true)
        try {
          await onRefresh()
        } catch (error) {
          console.error("Refresh failed:", error)
        } finally {
          setIsRefreshing(false)
        }
      }

      setIsPulling(false)
      setPullProgress(0)
    }

    container.addEventListener("touchstart", handleTouchStart, { passive: false })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isPulling, onRefresh])

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Pull indicator */}
      {isPulling && pullProgress > 0 && (
        <div
          className="fixed top-0 left-0 right-0 flex justify-center items-center bg-gradient-premium z-50 transition-all"
          style={{
            height: `${pullProgress * 60}px`,
            opacity: pullProgress,
          }}
        >
          <ArrowDown
            className="text-white animate-bounce"
            style={{
              transform: `rotate(${180 * pullProgress}deg)`,
              opacity: pullProgress,
            }}
          />
          <span className="ml-2 text-white font-medium">
            {pullProgress >= 0.7 ? "Release to refresh" : "Pull to refresh"}
          </span>
        </div>
      )}

      {/* Refreshing indicator */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 flex justify-center items-center bg-gradient-premium z-50 h-12">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span className="ml-2 text-white font-medium">Refreshing...</span>
        </div>
      )}

      {children}
    </div>
  )
}
