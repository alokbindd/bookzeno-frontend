"use client"

import { Star } from "lucide-react"
import { useState, useCallback } from "react"

export function InteractiveStarRating({
  value,
  onChange,
  size = "default",
  disabled = false,
}: {
  value: number
  onChange: (rating: number) => void
  size?: "sm" | "default" | "lg"
  disabled?: boolean
}) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const displayValue = hoverValue ?? value

  const sizeClass = {
    sm: "h-5 w-5",
    default: "h-7 w-7",
    lg: "h-9 w-9",
  }[size]

  const getStarState = useCallback(
    (starIndex: number) => {
      const threshold = starIndex + 1
      if (displayValue >= threshold) return "full"
      if (displayValue >= threshold - 0.5) return "half"
      return "empty"
    },
    [displayValue]
  )

  const handleClick = (rating: number) => {
    if (!disabled) onChange(rating)
  }

  const handleMouseLeave = () => setHoverValue(null)

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={handleMouseLeave}
      role="slider"
      aria-valuemin={0.5}
      aria-valuemax={5}
      aria-valuenow={value}
      aria-label={`Rating: ${value} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const leftHalfValue = i + 0.5
        const rightHalfValue = i + 1
        const state = getStarState(i)

        return (
          <div
            key={i}
            className="relative flex cursor-pointer"
            style={{ width: size === "sm" ? 20 : size === "lg" ? 36 : 28 }}
          >
            {/* Invisible hover/click zones - left and right half */}
            <div className="absolute inset-0 z-10 flex">
              <div
                className="h-full w-1/2"
                onMouseEnter={() => !disabled && setHoverValue(leftHalfValue)}
                onClick={() => handleClick(leftHalfValue)}
              />
              <div
                className="h-full w-1/2"
                onMouseEnter={() => !disabled && setHoverValue(rightHalfValue)}
                onClick={() => handleClick(rightHalfValue)}
              />
            </div>

            {/* Visual star */}
            <div className="pointer-events-none relative flex">
              {/* Empty star (outline) */}
              <Star
                className={`${sizeClass} text-muted-foreground/40`}
                strokeWidth={1.5}
              />
              {/* Filled portion */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  width: state === "full" ? "100%" : state === "half" ? "50%" : "0%",
                }}
              >
                <Star
                  className={`${sizeClass} fill-amber-400 text-amber-400`}
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
