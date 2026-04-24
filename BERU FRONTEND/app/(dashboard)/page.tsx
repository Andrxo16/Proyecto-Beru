import { Header } from "@/components/header"
import { StatsCard } from "@/components/stats-card"
import { RecentRentals } from "@/components/recent-rentals"
import { EquipmentAvailability } from "@/components/equipment-availability"
import { Package, Users, FileText, DollarSign } from "lucide-react"

export default function DashboardPage() {
  const ingresosMesCOP = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(45230000)

  const metaMesCOP = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(50000000)

  return (
    <div className="flex flex-col">
      <Header 
        title="Dashboard" 
        subtitle="Resumen general del sistema"
      />
      
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Equipos Totales"
            value="51"
            description="28 en alquiler"
            icon={Package}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Clientes Activos"
            value="34"
            description="5 nuevos este mes"
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Alquileres Activos"
            value="23"
            description="3 por vencer esta semana"
            icon={FileText}
            trend={{ value: 15, isPositive: true }}
          />
          <StatsCard
            title="Ingresos del Mes"
            value={ingresosMesCOP}
            description={`Meta: ${metaMesCOP}`}
            icon={DollarSign}
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Main Content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentRentals />
          </div>
          <div>
            <EquipmentAvailability />
          </div>
        </div>
      </div>
    </div>
  )
}
