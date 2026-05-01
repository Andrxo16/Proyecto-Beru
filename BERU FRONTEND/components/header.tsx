"use client"

import { useEffect, useState } from "react"
import { Bell, Search, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { clearSession, getSession } from "@/lib/auth"
import * as api from "@/lib/api"
import { effectiveEstadoBodegaForUi } from "@/lib/rental-estado"

const RENTALS_CHANGED = "beru-rentals-changed"

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter()
  const [username, setUsername] = useState("Usuario")
  const [pendingBodega, setPendingBodega] = useState(0)

  useEffect(() => {
    setUsername(getSession()?.user?.username ?? "Usuario")
    const onSession = () => setUsername(getSession()?.user?.username ?? "Usuario")
    window.addEventListener("beru-session-changed", onSession)
    return () => window.removeEventListener("beru-session-changed", onSession)
  }, [])

  useEffect(() => {
    const session = getSession()
    if (!session?.user?.permissions?.can_warehouse) {
      setPendingBodega(0)
      return
    }

    const load = async () => {
      try {
        const data = await api.getRentals()
        const list = Array.isArray(data) ? data : []
        const n = list.filter(
          (r: { estado?: string; dias?: number; total?: number }) =>
            effectiveEstadoBodegaForUi({
              estado: String(r.estado ?? ""),
              dias: r.dias,
              total: r.total,
            }) === "pendiente-salida"
        ).length
        setPendingBodega(n)
      } catch {
        setPendingBodega(0)
      }
    }

    void load()
    window.addEventListener(RENTALS_CHANGED, load)
    return () => window.removeEventListener(RENTALS_CHANGED, load)
  }, [])

  const handleLogout = () => {
    clearSession()
    router.replace("/login")
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="w-64 pl-9"
          />
        </div>

        {/* Notificacion bodega: punto rojo solo si hay alquileres pendientes por salir */}
        <Button variant="ghost" size="icon" className="relative" type="button" aria-label="Notificaciones">
          <Bell className="h-5 w-5" />
          {pendingBodega > 0 ? (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" />
          ) : null}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="hidden text-sm font-medium md:block">{username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configuracion</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Cerrar Sesion</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
