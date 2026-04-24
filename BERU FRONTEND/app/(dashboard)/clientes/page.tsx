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
import { Label } from "@/components/ui/label"
import { Plus, Search, Users, Phone, Mail } from "lucide-react"
import * as api from "@/lib/api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"

type Client = {
  id: number
  nombre: string
  correo?: string | null
  telefono?: string | null
  numero_alquileres: number
  estado: "activo" | "inactivo"
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
  })

  const loadClients = async () => {
    try {
      const data = await api.getClients()
      setClientes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error al cargar clientes:", error)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const filteredClientes = clientes.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cliente.correo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(cliente.id).includes(searchTerm)
  )

  const handleCreateClient = async () => {
    if (!formData.nombre.trim()) {
      alert("El nombre es requerido")
      return
    }
    try {
      setLoading(true)
      await api.createClient({
        nombre: formData.nombre.trim(),
        correo: formData.correo.trim() || undefined,
        telefono: formData.telefono.trim() || undefined,
      })
      await loadClients()
      setFormData({ nombre: "", correo: "", telefono: "" })
      setDialogOpen(false)
    } catch (error) {
      console.error("Error al crear cliente:", error)
      alert("No se pudo crear el cliente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      <Header 
        title="Clientes" 
        subtitle="Gestion de clientes y empresas"
      />
      
      <div className="p-6">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                <DialogDescription>
                  Complete los datos del cliente para registrarlo en el sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="empresa">Nombre de Empresa</Label>
                  <Input
                    id="empresa"
                    placeholder="Ej: Constructora ABC S.A."
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@empresa.com"
                      value={formData.correo}
                      onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="telefono">Telefono</Label>
                    <Input
                      id="telefono"
                      placeholder="+52 55 1234 5678"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button
                  className="bg-primary text-primary-foreground"
                  onClick={handleCreateClient}
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar Cliente"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Alquileres</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{`CLI-${String(cliente.id).padStart(3, "0")}`}</TableCell>
                    <TableCell>{cliente.nombre}</TableCell>
                    <TableCell>{cliente.correo || "Sin correo"}</TableCell>
                    <TableCell>{cliente.telefono || "Sin telefono"}</TableCell>
                    <TableCell>{cliente.numero_alquileres}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cliente.estado === "activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {cliente.estado === "activo" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {filteredClientes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No se encontraron clientes</p>
            <p className="text-sm text-muted-foreground">Intenta con otro termino de busqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
