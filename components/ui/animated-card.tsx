"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, type CardProps } from "@/components/ui/card"

interface AnimatedCardProps extends CardProps {
  children: React.ReactNode
  hoverEffect?: "lift" | "scale" | "glow" | "none"
  clickEffect?: boolean
}

export function AnimatedCard({
  children,
  hoverEffect = "lift",
  clickEffect = true,
  className,
  ...props
}: AnimatedCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getHoverStyles = () => {
    switch (hoverEffect) {
      case "lift":
        return { y: -8, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }
      case "scale":
        return { scale: 1.02 }
      case "glow":
        return { boxShadow: "0 0 15px 2px rgba(109, 40, 217, 0.3)" }
      case "none":
      default:
        return {}
    }
  }

  return (
    <motion.div
      whileHover={hoverEffect !== "none" ? getHoverStyles() : {}}
      whileTap={clickEffect ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={className} {...props}>
        {children}
      </Card>
    </motion.div>
  )
}
