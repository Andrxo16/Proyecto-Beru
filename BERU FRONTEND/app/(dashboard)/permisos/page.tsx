"use client"

import { useEffect, useState } from "react"

import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserPermissions } from "@/lib/auth"
import * as api from "@/lib/api"

type UserRecord = {
  id: number
  username: string
  activo: boolean
  permissions: UserPermissions
}

const EMPTY_PERMISSIONS: UserPermissions = {
  can_dashboard: false,
  can_inventory: false,
  can_warehouse: false,
  can_clients: false,
  can_rentals: false,
  can_permissions: false,
  can_inventory_show_id: true,
  can_inventory_show_tarifa: true,
}

type ModulePermissionKey = Exclude<
  keyof UserPermissions,
  "can_inventory_show_id" | "can_inventory_show_tarifa"
>

const PERMISSION_LABELS: Array<{ key: ModulePermissionKey; label: string }> = [
  { key: "can_dashboard", label: "Dashboard" },
  { key: "can_inventory", label: "Inventario" },
  { key: "can_warehouse", label: "Bodega" },
  { key: "can_clients", label: "Clientes" },
  { key: "can_rentals", label: "Alquileres" },
  { key: "can_permissions", label: "Permisos" },
]

const INVENTORY_FIELD_LABELS: Array<{
  key: "can_inventory_show_id" | "can_inventory_show_tarifa"
  label: string
}> = [
  { key: "can_inventory_show_id", label: "Inventario: ver ID en tarjetas" },
  { key: "can_inventory_show_tarifa", label: "Inventario: ver tarifa/día" },
]

function normalizeUserPermissions(raw: Partial<UserPermissions>): UserPermissions {
  return {
    can_dashboard: !!raw.can_dashboard,
    can_inventory: !!raw.can_inventory,
    can_warehouse: !!raw.can_warehouse,
    can_clients: !!raw.can_clients,
    can_rentals: !!raw.can_rentals,
    can_permissions: !!raw.can_permissions,
    can_inventory_show_id: raw.can_inventory_show_id !== false,
    can_inventory_show_tarifa: raw.can_inventory_show_tarifa !== false,
  }
}

export default function PermisosPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [savingId, setSavingId] = useState<number | null>(null)
  const [form, setForm] = useState({
    username: "",
    password: "",
    activo: true,
    permissions: EMPTY_PERMISSIONS,
  })

  const loadUsers = async () => {
    try {
      const data = await api.getUsers()
      const list = Array.isArray(data) ? data : []
      setUsers(
        list.map((u: UserRecord) => ({
          ...u,
          permissions: normalizeUserPermissions(u.permissions ?? {}),
        }))
      )
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
      alert(error instanceof Error ? error.message : "No se pudieron consultar usuarios")
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const togglePermission = <K extends keyof UserPermissions>(
    permissions: UserPermissions,
    key: K
  ): UserPermissions => ({
    ...permissions,
    [key]: !permissions[key],
  })

  const handleCreateUser = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      alert("Debes ingresar usuario y contrasena")
      return
    }
    try {
      await api.createUser({
        username: form.username.trim().toLowerCase(),
        password: form.password,
        activo: form.activo,
        permissions: form.permissions,
      })
      setForm({
        username: "",
        password: "",
        activo: true,
        permissions: EMPTY_PERMISSIONS,
      })
      await loadUsers()
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo crear el usuario")
    }
  }

  const handleSaveUser = async (user: UserRecord) => {
    setSavingId(user.id)
    try {
      await api.updateUserPermissions(user.id, {
        activo: user.activo,
        permissions: user.permissions,
      })
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo guardar")
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="flex flex-col">
      <Header title="Permisos" subtitle="Usuarios, modulos y campos visibles en inventario" />

      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="text-lg font-semibold">Crear usuario</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Usuario</Label>
                <Input
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="Ej: operario1"
                />
              </div>
              <div className="grid gap-2">
                <Label>Contrasena</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {PERMISSION_LABELS.map((perm) => (
                <Label key={perm.key} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.permissions[perm.key]}
                    onCheckedChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        permissions: togglePermission(prev.permissions, perm.key),
                      }))
                    }
                  />
                  {perm.label}
                </Label>
              ))}
              <Label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.activo}
                  onCheckedChange={() => setForm((prev) => ({ ...prev, activo: !prev.activo }))}
                />
                Activo
              </Label>
            </div>
            <div className="rounded-md border border-dashed p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Campos en listado de inventario (solo afecta tarjetas; requiere volver a entrar si cambias tu propio usuario)
              </p>
              <div className="flex flex-wrap gap-3">
                {INVENTORY_FIELD_LABELS.map((perm) => (
                  <Label key={perm.key} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.permissions[perm.key]}
                      onCheckedChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          permissions: togglePermission(prev.permissions, perm.key),
                        }))
                      }
                    />
                    {perm.label}
                  </Label>
                ))}
              </div>
            </div>
            <Button onClick={handleCreateUser}>Crear usuario</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Accion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <Badge variant={user.activo ? "default" : "secondary"}>
                        {user.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-3">
                        {PERMISSION_LABELS.map((perm) => (
                          <Label key={`${user.id}-${perm.key}`} className="flex items-center gap-2 text-xs">
                            <Checkbox
                              checked={user.permissions[perm.key]}
                              onCheckedChange={() =>
                                setUsers((prev) =>
                                  prev.map((item) =>
                                    item.id === user.id
                                      ? {
                                          ...item,
                                          permissions: togglePermission(item.permissions, perm.key),
                                        }
                                      : item
                                  )
                                )
                              }
                            />
                            {perm.label}
                          </Label>
                        ))}
                        <Label className="flex items-center gap-2 text-xs">
                          <Checkbox
                            checked={user.activo}
                            onCheckedChange={() =>
                              setUsers((prev) =>
                                prev.map((item) =>
                                  item.id === user.id ? { ...item, activo: !item.activo } : item
                                )
                              )
                            }
                          />
                          Activo
                        </Label>
                        {INVENTORY_FIELD_LABELS.map((perm) => (
                          <Label key={`${user.id}-inv-${perm.key}`} className="flex items-center gap-2 text-xs">
                            <Checkbox
                              checked={user.permissions[perm.key]}
                              onCheckedChange={() =>
                                setUsers((prev) =>
                                  prev.map((item) =>
                                    item.id === user.id
                                      ? {
                                          ...item,
                                          permissions: togglePermission(item.permissions, perm.key),
                                        }
                                      : item
                                  )
                                )
                              }
                            />
                            {perm.label}
                          </Label>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleSaveUser(user)}
                        disabled={savingId === user.id}
                      >
                        {savingId === user.id ? "Guardando..." : "Guardar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
