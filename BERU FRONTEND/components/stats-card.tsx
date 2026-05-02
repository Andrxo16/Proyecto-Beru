import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  description?: string
  icon: LucideIcon
  /** Variación % vs mes anterior (valor con signo: positivo subida, negativo bajada). */
  trend?: {
    value: number
  }
  /** Si se define, la tarjeta es clicable y abre el detalle (p. ej. dialog en el padre). */
  onDetailsClick?: () => void
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  onDetailsClick,
}: StatsCardProps) {
  const interactive = Boolean(onDetailsClick)

  return (
    <Card
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onDetailsClick : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onDetailsClick?.()
              }
            }
          : undefined
      }
      className={cn(
        "border-border bg-card",
        interactive &&
          "cursor-pointer outline-none transition-colors hover:border-primary/30 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
      aria-label={interactive ? `${title}: ver detalle` : undefined}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-card-foreground">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  trend.value > 0 && "text-green-600",
                  trend.value < 0 && "text-red-600",
                  trend.value === 0 && "text-muted-foreground"
                )}
              >
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
                <span className="text-muted-foreground">vs mes anterior</span>
              </p>
            )}
            {interactive && (
              <p className="text-xs font-medium text-primary">Clic para ver detalle</p>
            )}
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
