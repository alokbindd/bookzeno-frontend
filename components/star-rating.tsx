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
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < Math.floor(rating)
              ? "fill-accent text-accent"
              : i < rating
                ? "fill-accent/50 text-accent"
                : "text-border"
          }`}
        />
      ))}
    </div>
  )
}
