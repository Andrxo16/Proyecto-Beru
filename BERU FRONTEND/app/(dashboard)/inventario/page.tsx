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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Search, Filter, Package } from "lucide-react"

import { useEffect} from "react";
import { api } from "@/lib/api";

type Equipment = {
  id: number;
  name: string;
  status: string;
  daily_price: number;
};

const estadoStyles = {
  disponible: "bg-green-100 text-green-800",
  alquilado: "bg-blue-100 text-blue-800",
  mantenimiento: "bg-orange-100 text-orange-800",
}

const estadoLabels = {
  disponible: "Disponible",
  alquilado: "Alquilado",
  mantenimiento: "En Mantenimiento",
}

export default function InventarioPage() {
  const [data, setData] = useState<Equipment[]>([]);

  useEffect(() => {
    api.getEquipment().then(setData);
  }, []);


  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategoria, setFilterCategoria] = useState("todos")
  const [filterEstado, setFilterEstado] = useState("todos")

const filteredEquipos = data.filter((equipo) => {
  const matchesSearch =
    equipo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(equipo.id).includes(searchTerm);

  return matchesSearch;
});

  return (
    <div className="flex flex-col">
      <Header 
        title="Inventario" 
        subtitle="Gestion de equipos y maquinaria"
      />
      
      <div className="p-6">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las Categorias</SelectItem>
                <SelectItem value="Excavadoras">Excavadoras</SelectItem>
                <SelectItem value="Gruas">Gruas</SelectItem>
                <SelectItem value="Retroexcavadoras">Retroexcavadoras</SelectItem>
                <SelectItem value="Montacargas">Montacargas</SelectItem>
                <SelectItem value="Compactadores">Compactadores</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los Estados</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="alquilado">Alquilado</SelectItem>
                <SelectItem value="mantenimiento">En Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Equipo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Equipo</DialogTitle>
                <DialogDescription>
                  Complete los datos del nuevo equipo para agregarlo al inventario.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre del Equipo</Label>
                  <Input id="nombre" placeholder="Ej: Excavadora CAT 320" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="marca">Marca</Label>
                    <Input id="marca" placeholder="Ej: Caterpillar" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="modelo">Modelo</Label>
                    <Input id="modelo" placeholder="Ej: 320 GC" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excavadoras">Excavadoras</SelectItem>
                        <SelectItem value="Gruas">Gruas</SelectItem>
                        <SelectItem value="Retroexcavadoras">Retroexcavadoras</SelectItem>
                        <SelectItem value="Montacargas">Montacargas</SelectItem>
                        <SelectItem value="Compactadores">Compactadores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="año">Año</Label>
                    <Input id="año" type="number" placeholder="2024" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tarifa">Tarifa Diaria ($)</Label>
                  <Input id="tarifa" type="number" placeholder="450" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancelar</Button>
               <button
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={async () => {
          await api.createEquipment({
            name: "Excavadora",
            status: "available",
            daily_price: 200000,
          });

          const updated = await api.getEquipment();
          setData(updated);
        }}
      >
        Crear equipo
      </button>
      
      
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Equipment Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEquipos.map((equipo) => (
            <Card key={equipo.id} className="border-border bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={estadoStyles[equipo.status as keyof typeof estadoStyles]}
                  >
                    {estadoLabels[equipo.status as keyof typeof estadoLabels]}
                  </Badge>
                </div>
                <h3 className="font-semibold text-card-foreground mb-1">{equipo.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{equipo.id}</p>
                <div className="space-y-1 text-sm">
                </div>
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tarifa/dia</span>
                    <span className="text-lg font-bold text-primary">${equipo.daily_price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEquipos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No se encontraron equipos</p>
            <p className="text-sm text-muted-foreground">Intenta con otros filtros de busqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
