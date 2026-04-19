"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Users, Phone, Mail, Building2, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const clientes = [
  {
    id: "CLI-001",
    nombre: "Constructora ABC S.A.",
    contacto: "Juan Perez",
    email: "jperez@constructoraabc.com",
    telefono: "+52 55 1234 5678",
    direccion: "Av. Reforma 123, CDMX",
    alquileres: 5,
    estado: "activo",
  },
  {
    id: "CLI-002",
    nombre: "Obras del Norte S.A.",
    contacto: "Maria Garcia",
    email: "mgarcia@obrasnorte.com",
    telefono: "+52 81 9876 5432",
    direccion: "Blvd. Industrial 456, Monterrey",
    alquileres: 3,
    estado: "activo",
  },
  {
    id: "CLI-003",
    nombre: "Minera Central",
    contacto: "Carlos Rodriguez",
    email: "crodriguez@mineracentral.com",
    telefono: "+52 33 5555 1234",
    direccion: "Carr. Panamericana Km 45, Guadalajara",
    alquileres: 8,
    estado: "activo",
  },
  {
    id: "CLI-004",
    nombre: "Pavimentos Express",
    contacto: "Ana Martinez",
    email: "amartinez@pavimentosexp.com",
    telefono: "+52 222 8888 9999",
    direccion: "Calle 5 de Mayo 789, Puebla",
    alquileres: 2,
    estado: "inactivo",
  },
  {
    id: "CLI-005",
    nombre: "Ingenieria Civil Ltda",
    contacto: "Roberto Sanchez",
    email: "rsanchez@ingcivil.com",
    telefono: "+52 664 1111 2222",
    direccion: "Zona Rio, Tijuana",
    alquileres: 4,
    estado: "activo",
  },
  {
    id: "CLI-006",
    nombre: "Desarrollos Urbanos MX",
    contacto: "Laura Torres",
    email: "ltorres@desarrollosmx.com",
    telefono: "+52 998 3333 4444",
    direccion: "Av. Tulum 234, Cancun",
    alquileres: 6,
    estado: "activo",
  },
]

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredClientes = clientes.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <Dialog>
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
                  <Input id="empresa" placeholder="Ej: Constructora ABC S.A." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contacto">Persona de Contacto</Label>
                  <Input id="contacto" placeholder="Ej: Juan Perez" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="email@empresa.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="telefono">Telefono</Label>
                    <Input id="telefono" placeholder="+52 55 1234 5678" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="direccion">Direccion</Label>
                  <Textarea id="direccion" placeholder="Direccion completa" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button className="bg-primary text-primary-foreground">Guardar Cliente</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Clients Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClientes.map((cliente) => (
            <Card key={cliente.id} className="border-border bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">{cliente.nombre}</h3>
                      <p className="text-sm text-muted-foreground">{cliente.id}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Ver Alquileres</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-card-foreground">{cliente.contacto}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{cliente.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{cliente.telefono}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Alquileres:</span>
                    <span className="text-sm font-semibold text-card-foreground">{cliente.alquileres}</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={cliente.estado === "activo" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                    }
                  >
                    {cliente.estado === "activo" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
