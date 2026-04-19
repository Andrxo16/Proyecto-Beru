"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const categories = [
  { name: "Excavadoras", total: 12, disponibles: 5 },
  { name: "Gruas", total: 8, disponibles: 3 },
  { name: "Retroexcavadoras", total: 15, disponibles: 9 },
  { name: "Montacargas", total: 10, disponibles: 7 },
  { name: "Compactadores", total: 6, disponibles: 4 },
]

export function EquipmentAvailability() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-card-foreground">
          Disponibilidad por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category) => {
          const percentage = Math.round((category.disponibles / category.total) * 100)
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
