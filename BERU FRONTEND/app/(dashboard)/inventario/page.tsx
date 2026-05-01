"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Package } from "lucide-react"
import * as api from "@/lib/api"
import { getSession } from "@/lib/auth"
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

type SubinventoryItem = {
  id: number;
  inventario_id: number;
  nombre_item: string;
  cantidad: number;
  descripcion?: string | null;
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
  const [subinventoryDialogOpen, setSubinventoryDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [subinventoryItems, setSubinventoryItems] = useState<SubinventoryItem[]>([]);
  const [loadingSubinventory, setLoadingSubinventory] = useState(false);
  
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
  const [subFormData, setSubFormData] = useState({
    nombre_item: "",
    cantidad: 1,
    descripcion: "",
  })

  const [showInventoryId, setShowInventoryId] = useState(true)
  const [showInventoryTarifa, setShowInventoryTarifa] = useState(true)

  useEffect(() => {
    const syncInventoryFieldVisibility = () => {
      const p = getSession()?.user.permissions
      setShowInventoryId(p?.can_inventory_show_id !== false)
      setShowInventoryTarifa(p?.can_inventory_show_tarifa !== false)
    }
    syncInventoryFieldVisibility()
    window.addEventListener("beru-session-changed", syncInventoryFieldVisibility)
    return () => window.removeEventListener("beru-session-changed", syncInventoryFieldVisibility)
  }, [])

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
      (showInventoryId && String(equipo.id).includes(searchTerm))

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

  const openSubinventoryModal = async (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setSubinventoryDialogOpen(true);
    setLoadingSubinventory(true);

    try {
      const items = await api.getSubinventory(equipment.id);
      setSubinventoryItems(items);
    } catch (error) {
      console.error("Error al cargar subinventario:", error);
      setSubinventoryItems([]);
      alert("No se pudo cargar el subinventario");
    } finally {
      setLoadingSubinventory(false);
    }
  };

  const handleCreateSubinventoryItem = async () => {
    if (!selectedEquipment) return;
    if (!subFormData.nombre_item.trim()) {
      alert("El nombre del item es requerido");
      return;
    }
    if (subFormData.cantidad < 1) {
      alert("La cantidad debe ser mayor o igual a 1");
      return;
    }

    try {
      await api.createSubinventoryItem(selectedEquipment.id, {
        nombre_item: subFormData.nombre_item.trim(),
        cantidad: Number(subFormData.cantidad),
        descripcion: subFormData.descripcion.trim() || undefined,
      });

      const updated = await api.getSubinventory(selectedEquipment.id);
      setSubinventoryItems(updated);
      setSubFormData({
        nombre_item: "",
        cantidad: 1,
        descripcion: "",
      });
    } catch (error) {
      console.error("Error al crear item de subinventario:", error);
      alert("No se pudo crear el item de subinventario");
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
            <Card
              key={equipo.id}
              className="border-border bg-card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openSubinventoryModal(equipo)}
            >
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
                {showInventoryId ? (
                  <p className="text-sm text-muted-foreground mb-3">ID: {equipo.id}</p>
                ) : null}
                <div className="space-y-1 text-xs mb-3">
                  <p><span className="font-medium text-muted-foreground">Marca:</span> {equipo.marca}</p>
                  <p><span className="font-medium text-muted-foreground">Modelo:</span> {equipo.modelo}</p>
                  <p><span className="font-medium text-muted-foreground">Categoría:</span> {equipo.categoria}</p>
                  <p><span className="font-medium text-muted-foreground">Año:</span> {equipo.anio}</p>
                </div>
                {showInventoryTarifa ? (
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tarifa/día</span>
                      <span className="text-lg font-bold text-primary">
                        ${Number(equipo.tarifa_diaria ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : null}
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

      <Dialog
        open={subinventoryDialogOpen}
        onOpenChange={(open) => {
          setSubinventoryDialogOpen(open);
          if (!open) {
            setSelectedEquipment(null);
            setSubinventoryItems([]);
            setSubFormData({ nombre_item: "", cantidad: 1, descripcion: "" });
          }
        }}
      >
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle>Subinventario del equipo</DialogTitle>
            <DialogDescription>
              {selectedEquipment
                ? showInventoryId
                  ? `${selectedEquipment.nombre_equipo} (ID: ${selectedEquipment.id})`
                  : selectedEquipment.nombre_equipo
                : "Selecciona un equipo"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label htmlFor="sub-nombre">Nombre del item *</Label>
              <Input
                id="sub-nombre"
                placeholder="Ej: Tablones laterales"
                value={subFormData.nombre_item}
                onChange={(e) => setSubFormData({ ...subFormData, nombre_item: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2 col-span-1">
                <Label htmlFor="sub-cantidad">Cantidad *</Label>
                <Input
                  id="sub-cantidad"
                  type="number"
                  min={1}
                  value={subFormData.cantidad}
                  onChange={(e) =>
                    setSubFormData({
                      ...subFormData,
                      cantidad: Number(e.target.value || 1),
                    })
                  }
                />
              </div>
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="sub-descripcion">Descripción</Label>
                <Input
                  id="sub-descripcion"
                  placeholder="Ej: Estructura galvanizada"
                  value={subFormData.descripcion}
                  onChange={(e) => setSubFormData({ ...subFormData, descripcion: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCreateSubinventoryItem}>Agregar item</Button>
            </div>
          </div>

          <div className="border rounded-md p-3 max-h-[260px] overflow-auto">
            {loadingSubinventory ? (
              <p className="text-sm text-muted-foreground">Cargando subinventario...</p>
            ) : subinventoryItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">Este equipo aun no tiene items en subinventario.</p>
            ) : (
              <div className="space-y-2">
                {subinventoryItems.map((item) => (
                  <div key={item.id} className="flex items-start justify-between border rounded-md p-2">
                    <div>
                      <p className="font-medium text-sm">{item.nombre_item}</p>
                      {item.descripcion ? (
                        <p className="text-xs text-muted-foreground">{item.descripcion}</p>
                      ) : null}
                    </div>
                    <Badge variant="secondary">x{item.cantidad}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}