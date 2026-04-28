"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { StatsCard } from "@/components/stats-card"
import { RecentRentals } from "@/components/recent-rentals"
import { EquipmentAvailability } from "@/components/equipment-availability"
import { Package, Users, FileText, DollarSign } from "lucide-react"
import * as api from "@/lib/api"

export default function DashboardPage() {
  const [rentals, setRentals] = useState<any[]>([])
  const [equipment, setEquipment] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Llama los 3 endpoints en paralelo para mayor velocidad
        const [rentalsData, equipmentData, clientsData] = await Promise.all([
          api.getRentals(),
          api.getEquipment(),
          api.getClients(),
        ])
        setRentals(rentalsData)
        setEquipment(equipmentData)
        setClients(clientsData)
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Cálculos de las stats cards
  const totalEquipos = equipment.length
  const equiposEnAlquiler = equipment.filter((e) => e.estado === "en_alquiler").length
  const clientesActivos = clients.filter((c) => c.estado === "activo").length
  const alquileresActivos = rentals.filter((r) => r.estado === "activo").length
  const porVencer = rentals.filter((r) => r.estado === "por-vencer").length

  // Suma ingresos del mes actual (alquileres finalizados este mes)
  const ahora = new Date()
  const ingresosMes = rentals
    .filter((r) => {
      const fin = new Date(r.fecha_fin)
      return fin.getMonth() === ahora.getMonth() && fin.getFullYear() === ahora.getFullYear()
    })
    .reduce((acc, r) => acc + (r.total ?? 0), 0)

  const formatCOP = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value)

  // Los 5 alquileres más recientes para la tabla
  const recentRentals = [...rentals]
    .sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="Dashboard" subtitle="Resumen general del sistema" />
        <div className="flex items-center justify-center p-24 text-muted-foreground">
          Cargando datos...
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header title="Dashboard" subtitle="Resumen general del sistema" />

      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Equipos Totales"
            value={String(totalEquipos)}
            description={`${equiposEnAlquiler} en alquiler`}
            icon={Package}
            trend={{ value: 0, isPositive: true }}
          />
          <StatsCard
            title="Clientes Activos"
            value={String(clientesActivos)}
            description={`${clients.length} en total`}
            icon={Users}
            trend={{ value: 0, isPositive: true }}
          />
          <StatsCard
            title="Alquileres Activos"
            value={String(alquileresActivos)}
            description={`${porVencer} por vencer esta semana`}
            icon={FileText}
            trend={{ value: 0, isPositive: true }}
          />
          <StatsCard
            title="Ingresos del Mes"
            value={formatCOP(ingresosMes)}
            description="Alquileres cerrados este mes"
            icon={DollarSign}
            trend={{ value: 0, isPositive: true }}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentRentals rentals={recentRentals} />
          </div>
          <div>
            <EquipmentAvailability equipment={equipment} />
          </div>
        </div>
      </div>
    </div>
  )
}