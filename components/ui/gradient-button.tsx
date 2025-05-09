"use client"

import { forwardRef } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GradientButtonProps extends ButtonProps {
  gradientFrom?: string
  gradientTo?: string
  hoverEffect?: "scale" | "glow" | "both" | "none"
}

const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  (
    {
      className,
      gradientFrom = "from-premium-purple",
      gradientTo = "to-premium-blue",
      hoverEffect = "both",
      children,
      ...props
    },
    ref,
  ) => {
    const hoverClasses = {
      scale: "hover:scale-105",
      glow: "hover:shadow-lg hover:shadow-primary/30",
      both: "hover:scale-105 hover:shadow-lg hover:shadow-primary/30",
      none: "",
    }

    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden bg-gradient-to-r text-white transition-all duration-300",
          gradientFrom,
          gradientTo,
          hoverClasses[hoverEffect],
          className,
        )}
        {...props}
      >
        {children}
      </Button>
    )
  },
)

GradientButton.displayName = "GradientButton"

export { GradientButton }
