"use client"

import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Plus, Search, FileText, Calendar, MoreHorizontal, Eye, Edit, XCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const alquileres = [
  {
    id: "ALQ-001",
    cliente: "Constructora ABC S.A.",
    equipo: "Excavadora CAT 320",
    fechaInicio: "2026-04-15",
    fechaFin: "2026-04-22",
    dias: 7,
    tarifaDiaria: 450,
    total: 3150,
    estado: "activo",
  },
  {
    id: "ALQ-002",
    cliente: "Obras del Norte S.A.",
    equipo: "Grua Torre 50T",
    fechaInicio: "2026-04-14",
    fechaFin: "2026-04-30",
    dias: 16,
    tarifaDiaria: 800,
    total: 12800,
    estado: "activo",
  },
  {
    id: "ALQ-003",
    cliente: "Minera Central",
    equipo: "Retroexcavadora JCB",
    fechaInicio: "2026-04-10",
    fechaFin: "2026-04-17",
    dias: 7,
    tarifaDiaria: 320,
    total: 2240,
    estado: "por-vencer",
  },
  {
    id: "ALQ-004",
    cliente: "Pavimentos Express",
    equipo: "Rodillo Compactador BOMAG",
    fechaInicio: "2026-04-08",
    fechaFin: "2026-04-15",
    dias: 7,
    tarifaDiaria: 280,
    total: 1960,
    estado: "vencido",
  },
  {
    id: "ALQ-005",
    cliente: "Ingenieria Civil Ltda",
    equipo: "Montacargas Toyota 5T",
    fechaInicio: "2026-04-12",
    fechaFin: "2026-04-19",
    dias: 7,
    tarifaDiaria: 180,
    total: 1260,
    estado: "activo",
  },
  {
    id: "ALQ-006",
    cliente: "Desarrollos Urbanos MX",
    equipo: "Grua Movil 30T",
    fechaInicio: "2026-04-01",
    fechaFin: "2026-04-10",
    dias: 9,
    tarifaDiaria: 650,
    total: 5850,
    estado: "finalizado",
  },
  {
    id: "ALQ-007",
    cliente: "Constructora ABC S.A.",
    equipo: "Minicargador Bobcat",
    fechaInicio: "2026-04-05",
    fechaFin: "2026-04-12",
    dias: 7,
    tarifaDiaria: 220,
    total: 1540,
    estado: "finalizado",
  },
  {
    id: "ALQ-008",
    cliente: "Minera Central",
    equipo: "Excavadora Komatsu PC200",
    fechaInicio: "2026-04-20",
    fechaFin: "2026-05-05",
    dias: 15,
    tarifaDiaria: 420,
    total: 6300,
    estado: "pendiente",
  },
]

const estadoStyles = {
  activo: "bg-green-100 text-green-800",
  "por-vencer": "bg-yellow-100 text-yellow-800",
  vencido: "bg-red-100 text-red-800",
  finalizado: "bg-gray-100 text-gray-800",
  pendiente: "bg-blue-100 text-blue-800",
}

const estadoLabels = {
  activo: "Activo",
  "por-vencer": "Por Vencer",
  vencido: "Vencido",
  finalizado: "Finalizado",
  pendiente: "Pendiente",
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
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export default function AlquileresPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")

  const filteredAlquileres = alquileres.filter((alquiler) => {
    const matchesSearch = 
      alquiler.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alquiler.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alquiler.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filterEstado === "todos" || alquiler.estado === filterEstado
    return matchesSearch && matchesEstado
  })

  // Summary stats
  const stats = {
    activos: alquileres.filter(a => a.estado === "activo").length,
    porVencer: alquileres.filter(a => a.estado === "por-vencer").length,
    totalMes: alquileres.reduce((sum, a) => sum + a.total, 0),
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
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="por-vencer">Por Vencer</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog>
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
                  Complete los datos del contrato de alquiler.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cli-001">Constructora ABC S.A.</SelectItem>
                      <SelectItem value="cli-002">Obras del Norte S.A.</SelectItem>
                      <SelectItem value="cli-003">Minera Central</SelectItem>
                      <SelectItem value="cli-004">Pavimentos Express</SelectItem>
                      <SelectItem value="cli-005">Ingenieria Civil Ltda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="equipo">Equipo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eq-002">Grua Torre 50T - $800/dia</SelectItem>
                      <SelectItem value="eq-003">Retroexcavadora JCB - $320/dia</SelectItem>
                      <SelectItem value="eq-006">Excavadora Komatsu PC200 - $420/dia</SelectItem>
                      <SelectItem value="eq-007">Minicargador Bobcat - $220/dia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                    <Input id="fechaInicio" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fechaFin">Fecha Fin</Label>
                    <Input id="fechaFin" type="date" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button className="bg-primary text-primary-foreground">Crear Alquiler</Button>
              </div>
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
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlquileres.map((alquiler) => (
                  <TableRow key={alquiler.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-card-foreground">{alquiler.id}</TableCell>
                    <TableCell className="text-card-foreground">{alquiler.cliente}</TableCell>
                    <TableCell className="text-muted-foreground">{alquiler.equipo}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(alquiler.fechaInicio)} - {formatDate(alquiler.fechaFin)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{alquiler.dias}</TableCell>
                    <TableCell className="font-semibold text-card-foreground">{formatCurrency(alquiler.total)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={estadoStyles[alquiler.estado as keyof typeof estadoStyles]}
                      >
                        {estadoLabels[alquiler.estado as keyof typeof estadoLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
