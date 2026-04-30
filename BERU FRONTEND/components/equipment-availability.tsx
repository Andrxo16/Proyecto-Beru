"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type Equipment = {
  categoria?: string
  estado?: string
}

type Props = {
  equipment: Equipment[]
}

export function EquipmentAvailability({ equipment }: Props) {
  // Agrupa los equipos por categoría y cuenta total vs disponibles
  const categoryMap: Record<string, { total: number; disponibles: number }> = {}

  equipment.forEach((item) => {
    const cat = item.categoria || "Sin categoría"
    if (!categoryMap[cat]) categoryMap[cat] = { total: 0, disponibles: 0 }
    categoryMap[cat].total++
    if (item.estado === "disponible") categoryMap[cat].disponibles++
  })

  const categories = Object.entries(categoryMap).map(([name, data]) => ({
    name,
    ...data,
  }))

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-card-foreground">
          Disponibilidad por Categoría
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay equipos registrados</p>
        )}
        {categories.map((category) => {
          const percentage = category.total > 0
            ? Math.round((category.disponibles / category.total) * 100)
            : 0
          return (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-card-foreground">{category.name}</span>
                <span className="text-muted-foreground">
                  {category.disponibles}/{category.total} disponibles
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}