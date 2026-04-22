"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Package } from "lucide-react"
import * as api from "@/lib/api"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

type Equipment = {
  id: number;
  nombre_equipo: string;
  marca: string;
  modelo: string;
  categoria: string;
  anio: number;
  estado: string;
  tarifa_diaria: number;
  valor_inicial?: number;
  created_at?: string | null;
}

const estadoStyles = {
  disponible: "bg-green-100 text-green-800",
  prestamo: "bg-blue-100 text-blue-800",
  mantenimiento: "bg-orange-100 text-orange-800",
}

const estadoLabels = {
  disponible: "Disponible",
  prestamo: "En Préstamo",
  mantenimiento: "En Mantenimiento",
}

export default function InventarioPage() {
  const [data, setData] = useState<Equipment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    nombre_equipo: "",
    marca: "",
    modelo: "",
    categoria: "Excavadoras",
    anio: new Date().getFullYear(),
    tarifa_diaria: "",
    valor_inicial: "",
  });

  useEffect(() => {
    api
      .getEquipment()
      .then(setData)
      .catch((error) => {
        console.error("Error al cargar inventario:", error);
      });
  }, []);

  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategoria, setFilterCategoria] = useState("todos")
  const [filterEstado, setFilterEstado] = useState("todos")

  const filteredEquipos = data.filter((equipo) => {
    const matchesSearch =
      equipo.nombre_equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(equipo.id).includes(searchTerm);

    const matchesCategoria =
      filterCategoria === "todos" || equipo.categoria === filterCategoria

    const matchesEstado =
      filterEstado === "todos" || equipo.estado === filterEstado

    return matchesSearch && matchesCategoria && matchesEstado;
  });

  const handleCreateEquipo = async () => {
    if (!formData.nombre_equipo || !formData.marca || !formData.modelo || !formData.tarifa_diaria || !formData.valor_inicial) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      await api.createEquipment({
        nombre_equipo: formData.nombre_equipo,
        marca: formData.marca,
        modelo: formData.modelo,
        categoria: formData.categoria,
        anio: formData.anio,
        tarifa_diaria: parseFloat(formData.tarifa_diaria.toString()),
        valor_inicial: parseFloat(formData.valor_inicial.toString()),
        estado: "disponible", // Siempre disponible al crear
      });

      // Actualizar lista
      const updated = await api.getEquipment();
      setData(updated);

      // Limpiar formulario y cerrar diálogo
      setFormData({
        nombre_equipo: "",
        marca: "",
        modelo: "",
        categoria: "Excavadoras",
        anio: new Date().getFullYear(),
        tarifa_diaria: "",
        valor_inicial: "",
      });
      setDialogOpen(false);
    } catch (error) {
      console.error("Error al crear equipo:", error);
      alert("Error al crear el equipo");
    }
  };

  return (
    <div className="flex flex-col">
      <Header title="Inventario" subtitle="Gestión de equipos" />

      <div className="p-6">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Buscar equipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoría" />
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
                <SelectItem value="prestamo">En Préstamo</SelectItem>
                <SelectItem value="mantenimiento">En Mantenimiento</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                  Complete los datos del nuevo equipo para agregarlo al inventario. El estado será "Disponible" automáticamente.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre del Equipo *</Label>
                  <Input 
                    id="nombre" 
                    placeholder="Ej: Excavadora CAT 320"
                    value={formData.nombre_equipo}
                    onChange={(e) => setFormData({...formData, nombre_equipo: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="marca">Marca *</Label>
                    <Input 
                      id="marca" 
                      placeholder="Ej: Caterpillar"
                      value={formData.marca}
                      onChange={(e) => setFormData({...formData, marca: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="modelo">Modelo *</Label>
                    <Input 
                      id="modelo" 
                      placeholder="Ej: 320 GC"
                      value={formData.modelo}
                      onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excavadoras">Excavadoras</SelectItem>
                        <SelectItem value="Grúas">Grúas</SelectItem>
                        <SelectItem value="Retroexcavadoras">Retroexcavadoras</SelectItem>
                        <SelectItem value="Montacargas">Montacargas</SelectItem>
                        <SelectItem value="Compactadores">Compactadores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="año">Año *</Label>
                    <Input 
                      id="año" 
                      type="number" 
                      placeholder="2024"
                      value={formData.anio}
                      onChange={(e) => setFormData({...formData, anio: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tarifa">Tarifa Diaria ($) *</Label>
                  <Input 
                    id="tarifa" 
                    type="number" 
                    placeholder="450000"
                    value={formData.tarifa_diaria}
                    onChange={(e) => setFormData({...formData, tarifa_diaria: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="valor_inicial">Valor Inicial ($) *</Label>
                  <Input 
                    id="valor_inicial" 
                    type="number" 
                    placeholder="1000000"
                    value={formData.valor_inicial}
                    onChange={(e) => setFormData({...formData, valor_inicial: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleCreateEquipo}>
                  Crear equipo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
                    className={estadoStyles[equipo.estado as keyof typeof estadoStyles]}
                  >
                    {estadoLabels[equipo.estado as keyof typeof estadoLabels]}
                  </Badge>
                </div>
                <h3 className="font-semibold text-card-foreground mb-1">{equipo.nombre_equipo}</h3>
                <p className="text-sm text-muted-foreground mb-3">ID: {equipo.id}</p>
                <div className="space-y-1 text-xs mb-3">
                  <p><span className="font-medium text-muted-foreground">Marca:</span> {equipo.marca}</p>
                  <p><span className="font-medium text-muted-foreground">Modelo:</span> {equipo.modelo}</p>
                  <p><span className="font-medium text-muted-foreground">Categoría:</span> {equipo.categoria}</p>
                  <p><span className="font-medium text-muted-foreground">Año:</span> {equipo.anio}</p>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tarifa/día</span>
                    <span className="text-lg font-bold text-primary">
                      ${Number(equipo.tarifa_diaria ?? 0).toLocaleString()}
                    </span>
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