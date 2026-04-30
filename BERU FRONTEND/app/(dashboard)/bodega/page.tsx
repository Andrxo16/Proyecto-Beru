"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { PackageCheck, Search, Truck, Undo2 } from "lucide-react"
import * as api from "@/lib/api"

type Rental = {
  id: number
  cliente?: string | null
  equipo_nombre?: string | null
  fecha_inicio: string
  fecha_fin: string
  dias: number
  total: number
  estado: "activo" | "por-vencer" | "vencido" | "facturado" | "pendiente-salida" | "devuelto" | "liquidacion-parcial"
}

const estadoStyles = {
  "pendiente-salida": "bg-slate-100 text-slate-800",
  activo: "bg-green-100 text-green-800",
  "por-vencer": "bg-yellow-100 text-yellow-800",
  vencido: "bg-red-100 text-red-800",
  devuelto: "bg-purple-100 text-purple-800",
  facturado: "bg-blue-100 text-blue-800",
  "liquidacion-parcial": "bg-orange-100 text-orange-800",
}

const estadoLabels = {
  "pendiente-salida": "Pendiente de salida",
  activo: "En alquiler",
  "por-vencer": "Por vencer",
  vencido: "Vencido",
  devuelto: "Devuelto a bodega",
  facturado: "Facturado",
  "liquidacion-parcial": "Liquidacion parcial",
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function BodegaPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const loadRentals = async () => {
    try {
      const data = await api.getRentals()
      setRentals(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error al cargar bodega:", error)
    }
  }

  useEffect(() => {
    loadRentals()
  }, [])

  const visible = rentals
    .filter((r) => r.estado !== "facturado")
    .filter((r) => {
      const displayId = `ERM-${String(r.id).padStart(3, "0")}`
      return (
        (r.cliente || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.equipo_nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        displayId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })

  const pendingDispatch = rentals.filter((r) => r.estado === "pendiente-salida").length
  const onRoute = rentals.filter((r) => r.estado === "activo" || r.estado === "por-vencer" || r.estado === "vencido").length
  const returned = rentals.filter((r) => r.estado === "devuelto").length

  const handleDispatch = async (rentalId: number) => {
    try {
      setLoadingId(rentalId)
      await api.dispatchRental(rentalId)
      await loadRentals()
    } catch (error) {
      console.error("Error al despachar:", error)
      alert("No se pudo registrar la salida")
    } finally {
      setLoadingId(null)
    }
  }

  const handleReturn = async (rentalId: number) => {
    try {
      setLoadingId(rentalId)
      await api.returnRental(rentalId)
      await loadRentals()
    } catch (error) {
      console.error("Error al devolver:", error)
      alert("No se pudo registrar la devolucion")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Bodega"
        subtitle="Control de salida y devolucion de equipos de alquiler"
      />

      <div className="p-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                <PackageCheck className="h-6 w-6 text-slate-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes por salida</p>
                <p className="text-2xl font-bold text-card-foreground">{pendingDispatch}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Truck className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Equipos en alquiler</p>
                <p className="text-2xl font-bold text-card-foreground">{onRoute}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Undo2 className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Devueltos</p>
                <p className="text-2xl font-bold text-card-foreground">{returned}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, equipo o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">ID</TableHead>
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">Equipo</TableHead>
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">Periodo</TableHead>
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">Dias</TableHead>
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">Estado bodega</TableHead>
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">Accion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((rental) => {
                  const canDispatch = rental.estado === "pendiente-salida"
                  const canReturn =
                    rental.estado === "activo" ||
                    rental.estado === "por-vencer" ||
                    rental.estado === "vencido" ||
                    rental.estado === "liquidacion-parcial"

                  return (
                    <TableRow key={rental.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-card-foreground">
                        {`ERM-${String(rental.id).padStart(3, "0")}`}
                      </TableCell>
                      <TableCell className="text-card-foreground">{rental.cliente || "Sin cliente"}</TableCell>
                      <TableCell className="text-muted-foreground">{rental.equipo_nombre || "Equipo"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(rental.fecha_inicio)} - {formatDate(rental.fecha_fin)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{rental.dias}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={estadoStyles[rental.estado as keyof typeof estadoStyles]}
                        >
                          {estadoLabels[rental.estado as keyof typeof estadoLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {canDispatch ? (
                          <Button
                            size="sm"
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={loadingId === rental.id}
                            onClick={() => handleDispatch(rental.id)}
                          >
                            {loadingId === rental.id ? "Procesando..." : "Dar salida"}
                          </Button>
                        ) : canReturn ? (
                          <Button
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-700"
                            disabled={loadingId === rental.id}
                            onClick={() => handleReturn(rental.id)}
                          >
                            {loadingId === rental.id ? "Procesando..." : "Registrar devolucion"}
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">Sin accion</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
