import {
  Atom,
  Book,
  BookOpen,
  Briefcase,
  Cpu,
  Heart,
  Rocket,
  Smile,
} from "lucide-react"

// Centralized mapping from normalized category slug to icon component
export const iconMap: Record<string, React.ElementType> = {
  business: Briefcase,
  businessfinance: Briefcase,
  children: Smile,
  kids: Smile,
  fantasy: Rocket,
  fiction: BookOpen,
  mystery: BookOpen,
  nonfiction: Book,
  romance: Heart,
  science: Atom,
  sciencefiction: Atom,
  selfdevelopment: BookOpen,
  selfhelp: BookOpen,
  technology: Cpu,
  tech: Cpu,
}

export function getCategoryIcon(slug?: string | null): React.ElementType {
  if (!slug) {
    return BookOpen
  }

  const normalized = slug.toLowerCase().replace(/[^a-z0-9]/g, "")
  return iconMap[normalized] ?? BookOpen
}

