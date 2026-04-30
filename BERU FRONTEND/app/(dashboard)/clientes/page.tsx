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
import { Plus, Search, Users } from "lucide-react"
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
  direccion?: string | null
  nit_documento?: string | null
  celular?: string | null
  ciudad?: string | null
  numero_alquileres: number
  estado: "activo" | "inactivo"
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
    nit_documento: "",
    celular: "",
    ciudad: "",
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
        direccion: formData.direccion.trim() || undefined,
        nit_documento: formData.nit_documento.trim() || undefined,
        celular: formData.celular.trim() || undefined,
        ciudad: formData.ciudad.trim() || undefined,
      })
      await loadClients()
      setFormData({
        nombre: "",
        correo: "",
        telefono: "",
        direccion: "",
        nit_documento: "",
        celular: "",
        ciudad: "",
      })
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
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Juan Perez"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nit_documento">NIT o Numero de Documento</Label>
                    <Input
                      id="nit_documento"
                      placeholder="Ej: 900123456-7"
                      value={formData.nit_documento}
                      onChange={(e) => setFormData({ ...formData, nit_documento: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input
                      id="ciudad"
                      placeholder="Ej: Bogota"
                      value={formData.ciudad}
                      onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="direccion">Direccion</Label>
                  <Input
                    id="direccion"
                    placeholder="Ej: Calle 10 # 20 - 30"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
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
                <div className="grid gap-2">
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    placeholder="Ej: 3001234567"
                    value={formData.celular}
                    onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                  />
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
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Alquileres</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow
                    key={cliente.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedClient(cliente)}
                  >
                    <TableCell className="font-medium">{`CLI-${String(cliente.id).padStart(3, "0")}`}</TableCell>
                    <TableCell>{cliente.nombre}</TableCell>
                    <TableCell>{cliente.ciudad || "Sin ciudad"}</TableCell>
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

        <Dialog open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Detalle del cliente</DialogTitle>
              <DialogDescription>
                Informacion completa del cliente seleccionado.
              </DialogDescription>
            </DialogHeader>
            {selectedClient && (
              <div className="grid grid-cols-2 gap-4 py-2 text-sm">
                <div>
                  <p className="text-muted-foreground">ID</p>
                  <p>{`CLI-${String(selectedClient.id).padStart(3, "0")}`}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Nombre</p>
                  <p>{selectedClient.nombre}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Correo</p>
                  <p>{selectedClient.correo || "Sin correo"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Telefono</p>
                  <p>{selectedClient.telefono || "Sin telefono"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Celular</p>
                  <p>{selectedClient.celular || "Sin celular"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">NIT / Documento</p>
                  <p>{selectedClient.nit_documento || "Sin documento"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ciudad</p>
                  <p>{selectedClient.ciudad || "Sin ciudad"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Direccion</p>
                  <p>{selectedClient.direccion || "Sin direccion"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Alquileres</p>
                  <p>{selectedClient.numero_alquileres}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estado</p>
                  <p>{selectedClient.estado === "activo" ? "Activo" : "Inactivo"}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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
