import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const recentRentals = [
  {
    id: "ALQ-001",
    cliente: "Constructora ABC",
    equipo: "Excavadora CAT 320",
    fechaInicio: "15 Abr 2026",
    fechaFin: "22 Abr 2026",
    estado: "activo",
  },
  {
    id: "ALQ-002",
    cliente: "Obras del Norte S.A.",
    equipo: "Grua Torre 50T",
    fechaInicio: "14 Abr 2026",
    fechaFin: "30 Abr 2026",
    estado: "activo",
  },
  {
    id: "ALQ-003",
    cliente: "Minera Central",
    equipo: "Retroexcavadora JCB",
    fechaInicio: "10 Abr 2026",
    fechaFin: "17 Abr 2026",
    estado: "por-vencer",
  },
  {
    id: "ALQ-004",
    cliente: "Pavimentos Express",
    equipo: "Rodillo Compactador",
    fechaInicio: "08 Abr 2026",
    fechaFin: "15 Abr 2026",
    estado: "vencido",
  },
  {
    id: "ALQ-005",
    cliente: "Ingenieria Civil Ltda",
    equipo: "Montacargas 5T",
    fechaInicio: "12 Abr 2026",
    fechaFin: "19 Abr 2026",
    estado: "activo",
  },
]

const estadoStyles = {
  activo: "bg-green-100 text-green-800",
  "por-vencer": "bg-yellow-100 text-yellow-800",
  vencido: "bg-red-100 text-red-800",
  finalizado: "bg-gray-100 text-gray-800",
}

const estadoLabels = {
  activo: "Activo",
  "por-vencer": "Por Vencer",
  vencido: "Vencido",
  finalizado: "Finalizado",
}

export function RecentRentals() {
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
              {recentRentals.map((rental) => (
                <tr key={rental.id} className="hover:bg-muted/50">
                  <td className="py-3 text-sm font-medium text-card-foreground">{rental.id}</td>
                  <td className="py-3 text-sm text-card-foreground">{rental.cliente}</td>
                  <td className="py-3 text-sm text-muted-foreground">{rental.equipo}</td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {rental.fechaInicio} - {rental.fechaFin}
                  </td>
                  <td className="py-3">
                    <Badge 
                      variant="secondary" 
                      className={estadoStyles[rental.estado as keyof typeof estadoStyles]}
                    >
                      {estadoLabels[rental.estado as keyof typeof estadoLabels]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
