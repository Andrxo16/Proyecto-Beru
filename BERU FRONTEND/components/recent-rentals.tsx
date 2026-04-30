import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Tipo que viene de la API
type Rental = {
  id: number
  cliente?: string
  nombre_equipo?: string
  fecha_inicio: string
  fecha_fin: string
  estado: string
}

// Ahora recibe los datos como props en lugar de tenerlos estáticos
type Props = {
  rentals: Rental[]
}

const estadoStyles: Record<string, string> = {
  activo: "bg-green-100 text-green-800",
  "por-vencer": "bg-yellow-100 text-yellow-800",
  vencido: "bg-red-100 text-red-800",
  finalizado: "bg-gray-100 text-gray-800",
}

const estadoLabels: Record<string, string> = {
  activo: "Activo",
  "por-vencer": "Por Vencer",
  vencido: "Vencido",
  finalizado: "Finalizado",
}

// Formatea "2026-04-15" → "15 Abr 2026"
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function RecentRentals({ rentals }: Props) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-card-foreground">
          Alquileres Recientes
        </CardTitle>
        <a href="/alquileres" className="text-sm font-medium text-primary hover:underline">
          Ver todos
        </a>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">ID</th>
                <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Cliente</th>
                <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Equipo</th>
                <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Periodo</th>
                <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rentals.map((rental) => (
                <tr key={rental.id} className="hover:bg-muted/50">
                  <td className="py-3 text-sm font-medium text-card-foreground">
                    {`ERM-${String(rental.id).padStart(3, "0")}`}
                  </td>
                  <td className="py-3 text-sm text-card-foreground">{rental.cliente || "Sin cliente"}</td>
                  <td className="py-3 text-sm text-muted-foreground">{rental.nombre_equipo || "Sin equipo"}</td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {formatDate(rental.fecha_inicio)} - {formatDate(rental.fecha_fin)}
                  </td>
                  <td className="py-3">
                    <Badge
                      variant="secondary"
                      className={estadoStyles[rental.estado] ?? "bg-gray-100 text-gray-800"}
                    >
                      {estadoLabels[rental.estado] ?? rental.estado}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rentals.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No hay alquileres recientes</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}