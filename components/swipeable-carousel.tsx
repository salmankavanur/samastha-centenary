"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SwipeableCarouselProps {
  items: React.ReactNode[]
  showDots?: boolean
  showArrows?: boolean
  autoPlay?: boolean
  interval?: number
}

export default function SwipeableCarousel({
  items,
  showDots = true,
  showArrows = true,
  autoPlay = false,
  interval = 5000,
}: SwipeableCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const minSwipeDistance = 50

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swiped left, go to next slide
        nextSlide()
      } else {
        // Swiped right, go to previous slide
        prevSlide()
      }
    }
  }

  useEffect(() => {
    if (autoPlay) {
      const timer = setInterval(nextSlide, interval)
      return () => clearInterval(timer)
    }
  }, [autoPlay, interval])

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((item, index) => (
          <div key={index} className="w-full flex-shrink-0">
            {item}
          </div>
        ))}
      </div>

      {showArrows && (
        <>
          <Button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 p-0 bg-white/80 text-gray-800 hover:bg-white hover:text-primary md:flex hidden"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 p-0 bg-white/80 text-gray-800 hover:bg-white hover:text-primary md:flex hidden"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {showDots && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentIndex ? "bg-primary scale-125" : "bg-gray-300 dark:bg-gray-600"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
