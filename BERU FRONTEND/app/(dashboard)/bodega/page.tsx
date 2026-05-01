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
import { AlertTriangle, PackageCheck, Search, Truck } from "lucide-react"
import * as api from "@/lib/api"
import { effectiveEstadoBodegaForUi } from "@/lib/rental-estado"

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
  "pendiente-salida":
    "border border-red-200 bg-red-50 text-red-800 font-medium shadow-sm",
  activo: "bg-green-100 text-green-800",
  "por-vencer": "bg-yellow-100 text-yellow-800",
  vencido: "bg-red-100 text-red-800",
  devuelto: "bg-purple-100 text-purple-800",
  facturado: "bg-blue-100 text-blue-800",
  "liquidacion-parcial": "bg-orange-100 text-orange-800",
}

const RENTALS_CHANGED = "beru-rentals-changed"

const estadoLabels = {
  "pendiente-salida": "Por salida",
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

function mapRentalForBodega(r: Rental): Rental {
  return { ...r, estado: effectiveEstadoBodegaForUi(r) as Rental["estado"] }
}

export default function BodegaPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const loadRentals = async () => {
    try {
      const data = await api.getRentals()
      const list = Array.isArray(data) ? data : []
      setRentals(list.map((row) => mapRentalForBodega(row as Rental)))
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(RENTALS_CHANGED))
      }
    } catch (error) {
      console.error("Error al cargar bodega:", error)
    }
  }

  useEffect(() => {
    loadRentals()
  }, [])

  const visible = rentals
    .filter((r) => effectiveEstadoBodegaForUi(r) !== "facturado")
    .filter((r) => {
      const displayId = `ERM-${String(r.id).padStart(3, "0")}`
      return (
        (r.cliente || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.equipo_nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        displayId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })

  const pendingDispatch = rentals.filter((r) => effectiveEstadoBodegaForUi(r) === "pendiente-salida").length
  const onRoute = rentals.filter((r) => {
    const e = effectiveEstadoBodegaForUi(r)
    return e === "activo" || e === "por-vencer" || e === "vencido"
  }).length

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
        subtitle="Salida de bodega inicia el cobro por dias; entrada (devolucion) lo detiene y libera el equipo"
      />

      <div className="p-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <Card className="border border-red-200 bg-red-50/90 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                {pendingDispatch > 0 ? (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                ) : (
                  <PackageCheck className="h-6 w-6 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">Pendientes por salida</p>
                <p className="text-2xl font-bold text-red-900">{pendingDispatch}</p>
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
                  const estadoUi = effectiveEstadoBodegaForUi(rental)
                  const canDispatch = estadoUi === "pendiente-salida"
                  const canReturn =
                    estadoUi === "activo" ||
                    estadoUi === "por-vencer" ||
                    estadoUi === "vencido" ||
                    estadoUi === "liquidacion-parcial"

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
                          className={estadoStyles[estadoUi as keyof typeof estadoStyles]}
                        >
                          {estadoLabels[estadoUi as keyof typeof estadoLabels]}
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
                            {loadingId === rental.id ? "Procesando..." : "Entrada a bodega"}
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
