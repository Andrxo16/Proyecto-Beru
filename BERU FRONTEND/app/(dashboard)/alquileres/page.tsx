"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, FileText, Calendar, CheckCircle2 } from "lucide-react"
import * as api from "@/lib/api"
import { effectiveEstadoBodegaForUi } from "@/lib/rental-estado"

type Rental = {
  id: number
  inventario_id: number
  cliente_id?: number | null
  fecha_inicio: string
  fecha_fin: string
  deposito?: number
  dias: number
  tarifa_diaria: number
  total: number
  estado: "activo" | "por-vencer" | "vencido" | "facturado" | "pendiente-salida" | "devuelto" | "liquidacion-parcial"
  facturado?: boolean
  cliente?: string | null
  equipo_nombre?: string | null
}

type Equipment = {
  id: number
  nombre_equipo: string
  tarifa_diaria: number
  estado: string
}

type Client = {
  id: number
  nombre: string
}

const estadoStyles = {
  activo: "bg-green-100 text-green-800",
  "por-vencer": "bg-yellow-100 text-yellow-800",
  vencido: "bg-red-100 text-red-800",
  facturado: "bg-blue-100 text-blue-800",
  "pendiente-salida": "border border-red-200 bg-red-50 text-red-900",
  devuelto: "bg-purple-100 text-purple-800",
  "liquidacion-parcial": "bg-orange-100 text-orange-800",
}

const estadoLabels = {
  activo: "Activo",
  "por-vencer": "Por Vencer",
  vencido: "Vencido",
  facturado: "Facturado",
  "pendiente-salida": "Por salida",
  devuelto: "Devuelto",
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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount)
}

function estadoAlquilerUi(a: Rental): Rental["estado"] {
  return effectiveEstadoBodegaForUi(a) as Rental["estado"]
}

export default function AlquileresPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clientSearch, setClientSearch] = useState("")
  const [aplicarIVA, setAplicarIVA] = useState(false)
  const [aplicarReteFuente, setAplicarReteFuente] = useState(false)
  const [porcentajeReteFuente, setPorcentajeReteFuente] = useState(2.5) 

  const [formData, setFormData] = useState({
    cliente_id: "",
    inventario_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    deposito: "",
    ubicacion: "",
  })

  const loadData = async () => {
    try {
      const [rentalsData, equipmentData, clientsData] = await Promise.all([
        api.getRentals(),
        api.getEquipment(),
        api.getClients(),
      ])
      setRentals(rentalsData)
      setEquipment(equipmentData)
      setClients(Array.isArray(clientsData) ? clientsData : [])
    } catch (error) {
      console.error("Error al cargar alquileres:", error)
    }
  }

  useEffect(() => {
    loadData()
    const onRentalsChanged = () => {
      void loadData()
    }
    const onVisible = () => {
      if (document.visibilityState === "visible") void loadData()
    }
    window.addEventListener("beru-rentals-changed", onRentalsChanged)
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      window.removeEventListener("beru-rentals-changed", onRentalsChanged)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  const equiposDisponibles = equipment.filter((item) => {
    const s = (item.estado ?? "").toString().trim().toLowerCase()
    return !s || s === "disponible"
  })

  const filteredAlquileres = rentals.filter((alquiler) => {
    const displayId = `ERM-${String(alquiler.id).padStart(3, "0")}`
    const matchesSearch = 
      (alquiler.cliente || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alquiler.equipo_nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      displayId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado =
      filterEstado === "todos" || estadoAlquilerUi(alquiler) === filterEstado
    return matchesSearch && matchesEstado
  })

  // Summary stats
  const stats = {
    activos: rentals.filter((a) => estadoAlquilerUi(a) === "activo").length,
    porVencer: rentals.filter((a) => estadoAlquilerUi(a) === "por-vencer").length,
    totalMes: rentals.reduce((sum, a) => sum + Number(a.total ?? 0), 0),
  }

  const handleCreateRental = async () => {
    if (!formData.cliente_id || !formData.inventario_id || !formData.fecha_inicio || !formData.fecha_fin || !formData.ubicacion.trim()) {
      alert("Debes completar cliente, equipo, fechas y ubicacion")
      return
    }

    const inventarioId = Number(formData.inventario_id)
    if (!Number.isFinite(inventarioId) || inventarioId <= 0) {
      alert("Selecciona un equipo valido de la lista")
      return
    }

    const equipoSel = equipment.find((e) => e.id === inventarioId)
    const est = (equipoSel?.estado ?? "").toString().trim().toLowerCase()
    if (equipoSel && est && est !== "disponible") {
      alert("Este equipo no esta disponible para un nuevo alquiler.")
      return
    }

    try {
      setLoading(true)
      await api.createRental({
        inventario_id: inventarioId,
        cliente_id: Number(formData.cliente_id),
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        deposito: Number(formData.deposito || 0),
        ubicacion: formData.ubicacion.trim(),
      })

      await loadData()
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("beru-rentals-changed"))
      }
      setFormData({
        cliente_id: "",
        inventario_id: "",
        fecha_inicio: "",
        fecha_fin: "",
        deposito: "",
        ubicacion: "",
      })
      setClientSearch("")
      setDialogOpen(false)
    } catch (error) {
      console.error("Error al crear alquiler:", error)
      const msg =
        error instanceof Error ? error.message : "No se pudo crear el alquiler."
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseInvoice = async (rentalId: number) => {
    try {
      await api.closeRentalInvoice(rentalId)
      await loadData()
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("beru-rentals-changed"))
      }
    } catch (error) {
      console.error("Error al facturar alquiler:", error)
      alert("No se pudo marcar como facturado")
    }
  }

  const handlePartialLiquidation = async (rentalId: number) => {
    try {
      await api.partialLiquidation(rentalId)
      await loadData()
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("beru-rentals-changed"))
      }
    } catch (error) {
      console.error("Error en liquidacion parcial:", error)
      alert("No se pudo aplicar la liquidacion parcial")
    }
  }

  return (
    <div className="flex flex-col">
      <Header 
        title="Alquileres" 
        subtitle="Gestion de contratos de alquiler"
      />
      
      <div className="p-6">
        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <FileText className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alquileres Activos</p>
                <p className="text-2xl font-bold text-card-foreground">{stats.activos}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <Calendar className="h-6 w-6 text-yellow-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Por Vencer</p>
                <p className="text-2xl font-bold text-card-foreground">{stats.porVencer}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-lg font-bold text-primary">$</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total del Mes</p>
                <p className="text-2xl font-bold text-card-foreground">{formatCurrency(stats.totalMes)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, equipo o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los Estados</SelectItem>
                <SelectItem value="pendiente-salida">Por salida</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="por-vencer">Por Vencer</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="devuelto">Devuelto</SelectItem>
                <SelectItem value="liquidacion-parcial">Liquidacion parcial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Alquiler
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Alquiler</DialogTitle>
                <DialogDescription>
                  Solo se listan equipos en estado Disponible. Si no aparece uno, revisa inventario o bodega.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Input
                    id="buscar-cliente"
                    placeholder="Buscar cliente..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                  />
                  <Select
                    value={formData.cliente_id}
                    onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
                  >
                    <SelectTrigger id="cliente">
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients
                        .filter((c) => c.nombre.toLowerCase().includes(clientSearch.toLowerCase()))
                        .map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="equipo">Equipo</Label>
                  <Select
                    value={formData.inventario_id}
                    onValueChange={(value) => setFormData({ ...formData, inventario_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {equiposDisponibles.length === 0 ? (
                        <SelectItem value="_sin_equipo_" disabled>
                          {equipment.length === 0
                            ? "No hay equipos en inventario"
                            : "Ningun equipo disponible (estados distintos de Disponible)"}
                        </SelectItem>
                      ) : (
                        equiposDisponibles.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.nombre_equipo} - ${Number(item.tarifa_diaria ?? 0).toLocaleString()}/dia
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ubicacion">Ubicacion del equipo</Label>
                  <Input
                    id="ubicacion"
                    placeholder="Ej: Obra Norte - Bodega 3"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deposito">Deposito (COP)</Label>
                  <Input
                    id="deposito"
                    type="number"
                    min={0}
                    placeholder="Ej: 300000"
                    value={formData.deposito}
                    onChange={(e) => setFormData({ ...formData, deposito: e.target.value })}
                  />
                </div>
                <div className="space-y-3 mt-4">

                {/* IVA */} 
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={aplicarIVA}
                    onChange={(e) => setAplicarIVA(e.target.checked)}
                  />
                  Aplicar IVA (19%)
                </label>

                {/* RETEFUENTE */}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={aplicarReteFuente}
                    onChange={(e) => setAplicarReteFuente(e.target.checked)}
                  />
                  Aplicar ReteFuente
                </label>

                {aplicarReteFuente && (
                  <div className="flex items-center gap-2 ml-6">
                    <span>%</span>
                    <input
                      type="number"
                      value={porcentajeReteFuente}
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        if (value >= 0 && value <= 100) {
                          setPorcentajeReteFuente(value)
                        }
                      }}
                      className="border px-2 py-1 rounded w-24"
                    />
                  </div>
                )}

              </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                    <Input
                      id="fechaInicio"
                      type="date"
                      value={formData.fecha_inicio}
                      onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fechaFin">Fecha Fin</Label>
                    <Input
                      id="fechaFin"
                      type="date"
                      value={formData.fecha_fin}
                      onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button
                  className="bg-primary text-primary-foreground"
                  onClick={handleCreateRental}
                  disabled={loading}
                >
                  {loading ? "Creando..." : "Crear Alquiler"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Creditos
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Crédito</DialogTitle>
                <DialogDescription>
                  Complete los datos del crédito.
                </DialogDescription>
              </DialogHeader>
              
            </DialogContent>
          </Dialog>
        </div>

        {/* Rentals Table */}
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
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">Total</TableHead>
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">Estado</TableHead>
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">Facturar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlquileres.map((alquiler) => (
                  <TableRow key={alquiler.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-card-foreground">
                      {`ERM-${String(alquiler.id).padStart(3, "0")}`}
                    </TableCell>
                    <TableCell className="text-card-foreground">{alquiler.cliente || "Sin cliente"}</TableCell>
                    <TableCell className="text-muted-foreground">{alquiler.equipo_nombre || "Equipo"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(alquiler.fecha_inicio)} - {formatDate(alquiler.fecha_fin)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{alquiler.dias}</TableCell>
                    <TableCell className="font-semibold text-card-foreground">{formatCurrency(alquiler.total)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={estadoStyles[estadoAlquilerUi(alquiler) as keyof typeof estadoStyles]}
                      >
                        {estadoLabels[estadoAlquilerUi(alquiler) as keyof typeof estadoLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={estadoAlquilerUi(alquiler) === "facturado" ? "outline" : "default"}
                          className={estadoAlquilerUi(alquiler) === "facturado" ? "" : "bg-green-600 text-white hover:bg-green-700"}
                          disabled={estadoAlquilerUi(alquiler) === "facturado"}
                          onClick={() => handleCloseInvoice(alquiler.id)}
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          {estadoAlquilerUi(alquiler) === "facturado" ? "Facturado" : "Liquidar remision"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            estadoAlquilerUi(alquiler) === "facturado" ||
                            estadoAlquilerUi(alquiler) === "pendiente-salida" ||
                            estadoAlquilerUi(alquiler) === "devuelto" ||
                            estadoAlquilerUi(alquiler) === "liquidacion-parcial"
                          }
                          onClick={() => handlePartialLiquidation(alquiler.id)}
                        >
                          {estadoAlquilerUi(alquiler) === "liquidacion-parcial" ? "Conteo detenido" : "Liquidacion parcial"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {filteredAlquileres.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No se encontraron alquileres</p>
            <p className="text-sm text-muted-foreground">Intenta con otros filtros de busqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
