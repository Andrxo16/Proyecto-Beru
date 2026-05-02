"use client"

import { useEffect, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { StatsCard } from "@/components/stats-card"
import { RecentRentals } from "@/components/recent-rentals"
import { EquipmentAvailability } from "@/components/equipment-availability"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Users, FileText, DollarSign, Search } from "lucide-react"
import * as api from "@/lib/api"
import { effectiveEstadoBodegaForUi } from "@/lib/rental-estado"

type DetailKind = "equipos" | "clientes" | "alquileres" | "ingresos" | null

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function normEst(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
}

function rentalEstadoUi(r: { estado: string; dias?: number | null; total?: number | string | null }) {
  return effectiveEstadoBodegaForUi(r)
}

function normQ(s: string) {
  return s.trim().toLowerCase()
}

function parsePeriod(key: string): { y: number; m: number } {
  const [ys, ms] = key.split("-")
  const y = Number(ys)
  const m = Number(ms)
  const n = new Date()
  return {
    y: Number.isFinite(y) ? y : n.getFullYear(),
    m: Number.isFinite(m) ? m : n.getMonth(),
  }
}

function prevYm(y: number, m: number): { y: number; m: number } {
  return m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }
}

/** Porcentaje de variación (1 decimal). */
function pctDelta(curr: number, prev: number): number {
  if (prev === 0 && curr === 0) return 0
  if (prev === 0) return curr > 0 ? 100 : 0
  return Math.round(((curr - prev) / prev) * 1000) / 10
}

function fechaEnMes(iso: unknown, y: number, m: number): boolean {
  if (!iso) return false
  const d = new Date(String(iso))
  if (Number.isNaN(d.getTime())) return false
  return d.getFullYear() === y && d.getMonth() === m
}

function createdEnMes(row: { created_at?: unknown }, y: number, m: number): boolean {
  return fechaEnMes(row.created_at, y, m)
}

function monthSelectOptions(): { key: string; label: string }[] {
  const n = new Date()
  const out: { key: string; label: string }[] = []
  for (let i = 0; i < 24; i++) {
    const d = new Date(n.getFullYear(), n.getMonth() - i, 1)
    const y = d.getFullYear()
    const mo = d.getMonth()
    out.push({
      key: `${y}-${mo}`,
      label: d.toLocaleDateString("es-MX", { month: "long", year: "numeric" }),
    })
  }
  return out
}

export default function DashboardPage() {
  const [rentals, setRentals] = useState<any[]>([])
  const [equipment, setEquipment] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [detailKind, setDetailKind] = useState<DetailKind>(null)
  const [popupSearch, setPopupSearch] = useState("")
  const [popupFilterBy, setPopupFilterBy] = useState("todo")
  const [periodKey, setPeriodKey] = useState(() => {
    const n = new Date()
    return `${n.getFullYear()}-${n.getMonth()}`
  })

  const openDetail = (kind: Exclude<DetailKind, null>) => {
    setPopupSearch("")
    setPopupFilterBy("todo")
    setDetailKind(kind)
  }

  const closeDetail = () => {
    setDetailKind(null)
    setPopupSearch("")
    setPopupFilterBy("todo")
  }

  useEffect(() => {
    const loadData = async () => {
      try {
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

  const { y: selY, m: selM } = parsePeriod(periodKey)
  const { y: prevY, m: prevM } = prevYm(selY, selM)
  const ahora = new Date()
  const esMesActual = selY === ahora.getFullYear() && selM === ahora.getMonth()
  const etiquetaMesSel = new Date(selY, selM, 1).toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  })

  const totalEquipos = equipment.length
  const equiposEnAlquiler = equipment.filter((e) =>
    ["prestamo", "mantenimiento"].includes(normEst(e.estado))
  ).length
  const clientesActivos = clients.filter((c) => normEst(c.estado) === "activo").length
  const alquileresEnRuta = rentals.filter((r) => rentalEstadoUi(r) === "activo").length
  const porVencer = rentals.filter((r) => rentalEstadoUi(r) === "por-vencer").length
  const contratosInicioEnMes = rentals.filter((r) => fechaEnMes(r.fecha_inicio, selY, selM)).length
  const contratosInicioMesPrev = rentals.filter((r) => fechaEnMes(r.fecha_inicio, prevY, prevM)).length

  const alquileresActivosValor = esMesActual ? alquileresEnRuta : contratosInicioEnMes
  const alquileresActivosDescripcion = esMesActual
    ? `${porVencer} por vencer esta semana`
    : `Contratos con inicio en ${etiquetaMesSel}`

  const equiposAltaMes = equipment.filter((e) => createdEnMes(e, selY, selM)).length
  const clientesAltaMes = clients.filter((c) => createdEnMes(c, selY, selM)).length

  const rentalsIngresosMes = useMemo(() => {
    return rentals.filter((r) => r.fecha_fin && fechaEnMes(r.fecha_fin, selY, selM))
  }, [rentals, selY, selM])

  const rentalsIngresosMesPrev = useMemo(() => {
    return rentals.filter((r) => r.fecha_fin && fechaEnMes(r.fecha_fin, prevY, prevM))
  }, [rentals, prevY, prevM])

  const ingresosMes = rentalsIngresosMes.reduce((acc, r) => acc + Number(r.total ?? 0), 0)
  const ingresosMesPrev = rentalsIngresosMesPrev.reduce((acc, r) => acc + Number(r.total ?? 0), 0)

  const trendAlquileres = { value: pctDelta(contratosInicioEnMes, contratosInicioMesPrev) }
  const trendIngresos = { value: pctDelta(ingresosMes, ingresosMesPrev) }

  const alquileresActivosLista = useMemo(() => {
    if (esMesActual) return rentals.filter((r) => rentalEstadoUi(r) === "activo")
    return rentals.filter((r) => fechaEnMes(r.fecha_inicio, selY, selM))
  }, [rentals, esMesActual, selY, selM])

  const clientesActivosLista = useMemo(
    () => clients.filter((c) => normEst(c.estado) === "activo"),
    [clients]
  )

  const filteredEquipment = useMemo(() => {
    const q = normQ(popupSearch)
    const f = popupFilterBy
    return equipment.filter((e) => {
      if (!q) return true
      const nombre = String(e.nombre_equipo ?? "").toLowerCase()
      const estado = String(e.estado ?? "").toLowerCase()
      const tarifaRaw = String(e.tarifa_diaria ?? "").toLowerCase()
      const tarifaFmt = formatCOP(Number(e.tarifa_diaria ?? 0)).toLowerCase().replace(/\s/g, "")
      const qCompact = q.replace(/\s/g, "")
      if (f === "todo") {
        return (
          nombre.includes(q) ||
          estado.includes(q) ||
          tarifaRaw.includes(q) ||
          tarifaFmt.includes(qCompact)
        )
      }
      if (f === "nombre") return nombre.includes(q)
      if (f === "estado") return estado.includes(q)
      if (f === "tarifa") return tarifaRaw.includes(q) || tarifaFmt.includes(qCompact)
      return true
    })
  }, [equipment, popupSearch, popupFilterBy])

  const filteredClientesActivos = useMemo(() => {
    const q = normQ(popupSearch)
    const f = popupFilterBy
    return clientesActivosLista.filter((c) => {
      if (!q) return true
      const nombre = String(c.nombre ?? "").toLowerCase()
      const ciudad = String(c.ciudad ?? "").toLowerCase()
      const estado = String(c.estado ?? "").toLowerCase()
      if (f === "todo") return nombre.includes(q) || ciudad.includes(q) || estado.includes(q)
      if (f === "nombre") return nombre.includes(q)
      if (f === "ciudad") return ciudad.includes(q)
      if (f === "estado") return estado.includes(q)
      return true
    })
  }, [clientesActivosLista, popupSearch, popupFilterBy])

  const filteredAlquileresActivos = useMemo(() => {
    const q = normQ(popupSearch)
    const f = popupFilterBy
    return alquileresActivosLista.filter((r) => {
      if (!q) return true
      const idStr = `erm-${String(r.id).padStart(3, "0")}`
      const cliente = String(r.cliente ?? "").toLowerCase()
      const equipo = String(r.equipo_nombre ?? "").toLowerCase()
      const periodo = `${formatDate(r.fecha_inicio)} ${r.fecha_fin ? formatDate(r.fecha_fin) : ""}`.toLowerCase()
      if (f === "todo") {
        return idStr.includes(q) || cliente.includes(q) || equipo.includes(q) || periodo.includes(q)
      }
      if (f === "id") return idStr.includes(q) || String(r.id).includes(q)
      if (f === "cliente") return cliente.includes(q)
      if (f === "equipo") return equipo.includes(q)
      if (f === "periodo") return periodo.includes(q)
      return true
    })
  }, [alquileresActivosLista, popupSearch, popupFilterBy])

  const filteredIngresosMes = useMemo(() => {
    const q = normQ(popupSearch)
    const f = popupFilterBy
    return rentalsIngresosMes.filter((r) => {
      if (!q) return true
      const idStr = `erm-${String(r.id).padStart(3, "0")}`
      const cliente = String(r.cliente ?? "").toLowerCase()
      const equipo = String(r.equipo_nombre ?? "").toLowerCase()
      const fin = r.fecha_fin ? formatDate(r.fecha_fin).toLowerCase() : ""
      const dias = String(r.dias ?? "")
      const totalStr = formatCOP(Number(r.total ?? 0)).toLowerCase().replace(/\s/g, "")
      const totalRaw = String(r.total ?? "").toLowerCase()
      const qC = q.replace(/\s/g, "")
      if (f === "todo") {
        return (
          idStr.includes(q) ||
          cliente.includes(q) ||
          equipo.includes(q) ||
          fin.includes(q) ||
          dias.includes(q) ||
          totalStr.includes(qC) ||
          totalRaw.includes(q)
        )
      }
      if (f === "id") return idStr.includes(q) || String(r.id).includes(q)
      if (f === "cliente") return cliente.includes(q)
      if (f === "equipo") return equipo.includes(q)
      if (f === "fin") return fin.includes(q)
      if (f === "dias") return dias.includes(q)
      if (f === "total") return totalStr.includes(qC) || totalRaw.includes(q)
      return true
    })
  }, [rentalsIngresosMes, popupSearch, popupFilterBy])

  const recentRentals = useMemo(() => {
    return [...rentals]
      .filter(
        (r) =>
          fechaEnMes(r.fecha_inicio, selY, selM) ||
          (r.fecha_fin && fechaEnMes(r.fecha_fin, selY, selM))
      )
      .sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime())
      .slice(0, 5)
  }, [rentals, selY, selM])

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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Mes de referencia</p>
            <p className="text-xs text-muted-foreground">
              Ingresos y alquileres recientes por mes. En alquileres e ingresos, la tendencia compara con el mes
              anterior (contratos iniciados e ingresos por cierres).
            </p>
          </div>
          <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:min-w-[240px]">
            <Label htmlFor="dash-periodo-mes">Mes</Label>
            <Select value={periodKey} onValueChange={setPeriodKey}>
              <SelectTrigger id="dash-periodo-mes">
                <SelectValue placeholder="Elegir mes" />
              </SelectTrigger>
              <SelectContent>
                {monthSelectOptions().map((opt) => (
                  <SelectItem key={opt.key} value={opt.key}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Equipos Totales"
            value={String(totalEquipos)}
            description={`${equiposEnAlquiler} en préstamo o mantenimiento · Altas en ${etiquetaMesSel}: ${equiposAltaMes}`}
            icon={Package}
            onDetailsClick={() => openDetail("equipos")}
          />
          <StatsCard
            title="Clientes Activos"
            value={String(clientesActivos)}
            description={`${clients.length} en total · Nuevos en ${etiquetaMesSel}: ${clientesAltaMes}`}
            icon={Users}
            onDetailsClick={() => openDetail("clientes")}
          />
          <StatsCard
            title="Alquileres Activos"
            value={String(alquileresActivosValor)}
            description={alquileresActivosDescripcion}
            icon={FileText}
            trend={trendAlquileres}
            onDetailsClick={() => openDetail("alquileres")}
          />
          <StatsCard
            title="Ingresos del Mes"
            value={formatCOP(ingresosMes)}
            description={`Suma por fecha de fin en ${etiquetaMesSel}`}
            icon={DollarSign}
            trend={trendIngresos}
            onDetailsClick={() => openDetail("ingresos")}
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

      <Dialog open={detailKind === "equipos"} onOpenChange={(o) => !o && closeDetail()}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Equipos en inventario</DialogTitle>
            <DialogDescription>
              {totalEquipos} equipo{totalEquipos !== 1 ? "s" : ""} registrado{totalEquipos !== 1 ? "s" : ""}.{" "}
              {equiposEnAlquiler} en préstamo o mantenimiento.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-1.5">
              <Label htmlFor="dash-buscar-equipos">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="dash-buscar-equipos"
                  className="pl-9"
                  placeholder="Texto a buscar..."
                  value={popupSearch}
                  onChange={(e) => setPopupSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full shrink-0 space-y-1.5 sm:w-[200px]">
              <Label>Filtrar por</Label>
              <Select value={popupFilterBy} onValueChange={setPopupFilterBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Campo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todo (cualquier columna)</SelectItem>
                  <SelectItem value="nombre">Equipo (nombre)</SelectItem>
                  <SelectItem value="estado">Estado</SelectItem>
                  <SelectItem value="tarifa">Tarifa / día</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Mostrando {filteredEquipment.length} de {equipment.length}
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Tarifa / día</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No hay equipos registrados.
                  </TableCell>
                </TableRow>
              ) : filteredEquipment.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    Ningún resultado con el filtro actual.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEquipment.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.nombre_equipo ?? "—"}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {e.estado ? String(e.estado) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCOP(Number(e.tarifa_diaria ?? 0))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      <Dialog open={detailKind === "clientes"} onOpenChange={(o) => !o && closeDetail()}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Clientes activos</DialogTitle>
            <DialogDescription>
              {clientesActivosLista.length} activo{clientesActivosLista.length !== 1 ? "s" : ""} de{" "}
              {clients.length} en total.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-1.5">
              <Label htmlFor="dash-buscar-clientes">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="dash-buscar-clientes"
                  className="pl-9"
                  placeholder="Texto a buscar..."
                  value={popupSearch}
                  onChange={(e) => setPopupSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full shrink-0 space-y-1.5 sm:w-[200px]">
              <Label>Filtrar por</Label>
              <Select value={popupFilterBy} onValueChange={setPopupFilterBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Campo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todo (cualquier columna)</SelectItem>
                  <SelectItem value="nombre">Nombre</SelectItem>
                  <SelectItem value="ciudad">Ciudad</SelectItem>
                  <SelectItem value="estado">Estado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Mostrando {filteredClientesActivos.length} de {clientesActivosLista.length}
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesActivosLista.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No hay clientes activos.
                  </TableCell>
                </TableRow>
              ) : filteredClientesActivos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    Ningún resultado con el filtro actual.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientesActivos.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nombre ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{c.ciudad ?? "—"}</TableCell>
                    <TableCell className="capitalize">{c.estado ?? "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      <Dialog open={detailKind === "alquileres"} onOpenChange={(o) => !o && closeDetail()}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {esMesActual ? "Alquileres activos (en ruta)" : `Contratos iniciados en ${etiquetaMesSel}`}
            </DialogTitle>
            <DialogDescription>
              {esMesActual
                ? "Contratos en estado activo (equipo en ruta según reglas del sistema)."
                : `Contratos cuya fecha de inicio cae en ${etiquetaMesSel}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-1.5">
              <Label htmlFor="dash-buscar-alquileres">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="dash-buscar-alquileres"
                  className="pl-9"
                  placeholder="ERM-001, cliente, equipo..."
                  value={popupSearch}
                  onChange={(e) => setPopupSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full shrink-0 space-y-1.5 sm:w-[220px]">
              <Label>Filtrar por</Label>
              <Select value={popupFilterBy} onValueChange={setPopupFilterBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Campo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todo (cualquier columna)</SelectItem>
                  <SelectItem value="id">ID remisión</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="equipo">Equipo</SelectItem>
                  <SelectItem value="periodo">Periodo (fechas)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Mostrando {filteredAlquileresActivos.length} de {alquileresActivosLista.length}
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead className="text-right">Días</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alquileresActivosLista.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    {esMesActual
                      ? "No hay alquileres en estado activo."
                      : "Ningún contrato con inicio en este mes."}
                  </TableCell>
                </TableRow>
              ) : filteredAlquileresActivos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    Ningún resultado con el filtro actual.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlquileresActivos.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{`ERM-${String(r.id).padStart(3, "0")}`}</TableCell>
                    <TableCell>{r.cliente ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{r.equipo_nombre ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(r.fecha_inicio)} — {r.fecha_fin ? formatDate(r.fecha_fin) : "—"}
                    </TableCell>
                    <TableCell className="text-right">{r.dias ?? 0}</TableCell>
                    <TableCell className="text-right">{formatCOP(Number(r.total ?? 0))}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      <Dialog open={detailKind === "ingresos"} onOpenChange={(o) => !o && closeDetail()}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ingresos del mes (por fecha de fin)</DialogTitle>
            <DialogDescription>
              Alquileres con fecha de fin en {etiquetaMesSel}. Total:{" "}
              <span className="font-semibold text-foreground">{formatCOP(ingresosMes)}</span>
              {rentalsIngresosMesPrev.length > 0 || ingresosMesPrev > 0 ? (
                <>
                  {" "}
                  (mes anterior: {formatCOP(ingresosMesPrev)}).
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-1.5">
              <Label htmlFor="dash-buscar-ingresos">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="dash-buscar-ingresos"
                  className="pl-9"
                  placeholder="ID, cliente, monto..."
                  value={popupSearch}
                  onChange={(e) => setPopupSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full shrink-0 space-y-1.5 sm:w-[220px]">
              <Label>Filtrar por</Label>
              <Select value={popupFilterBy} onValueChange={setPopupFilterBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Campo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todo (cualquier columna)</SelectItem>
                  <SelectItem value="id">ID remisión</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="equipo">Equipo</SelectItem>
                  <SelectItem value="fin">Fecha fin</SelectItem>
                  <SelectItem value="dias">Días</SelectItem>
                  <SelectItem value="total">Total</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Mostrando {filteredIngresosMes.length} de {rentalsIngresosMes.length}
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead className="text-right">Días</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentalsIngresosMes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    Ningún alquiler con fecha de fin en {etiquetaMesSel}.
                  </TableCell>
                </TableRow>
              ) : filteredIngresosMes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    Ningún resultado con el filtro actual.
                  </TableCell>
                </TableRow>
              ) : (
                filteredIngresosMes.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{`ERM-${String(r.id).padStart(3, "0")}`}</TableCell>
                    <TableCell>{r.cliente ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{r.equipo_nombre ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.fecha_fin ? formatDate(r.fecha_fin) : "—"}
                    </TableCell>
                    <TableCell className="text-right">{r.dias ?? 0}</TableCell>
                    <TableCell className="text-right">{formatCOP(Number(r.total ?? 0))}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  )
}
