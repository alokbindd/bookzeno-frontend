import { Star } from "lucide-react"

export function StarRating({
  rating,
  size = "default",
}: {
  rating: number
  size?: "sm" | "default" | "lg"
}) {
  const sizeClass = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    lg: "h-5 w-5",
  }[size]

  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const isFull = i < Math.floor(rating)
        const isHalf = i < rating && !isFull

        return (
          <div key={i} className="relative">
            <Star className={`${sizeClass} text-muted-foreground/40`} strokeWidth={1.5} />
            {isFull && (
              <Star
                className={`${sizeClass} absolute inset-0 fill-amber-400 text-amber-400`}
                strokeWidth={1.5}
              />
            )}
            {isHalf && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                <Star
                  className={`${sizeClass} fill-amber-400 text-amber-400`}
                  strokeWidth={1.5}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
