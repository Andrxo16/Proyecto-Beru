"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Users,
  FileText,
  ShieldCheck,
  Settings,
  LogOut,
} from "lucide-react"
import { clearSession, getSession, UserPermissions } from "@/lib/auth"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, permission: "can_dashboard" as keyof UserPermissions },
  { name: "Inventario", href: "/inventario", icon: Package, permission: "can_inventory" as keyof UserPermissions },
  { name: "Bodega", href: "/bodega", icon: Warehouse, permission: "can_warehouse" as keyof UserPermissions },
  { name: "Clientes", href: "/clientes", icon: Users, permission: "can_clients" as keyof UserPermissions },
  { name: "Alquileres", href: "/alquileres", icon: FileText, permission: "can_rentals" as keyof UserPermissions },
  { name: "Permisos", href: "/permisos", icon: ShieldCheck, permission: "can_permissions" as keyof UserPermissions },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const session = getSession()
  const allowedNavigation = navigation.filter((item) => session?.user.permissions[item.permission])

  const handleLogout = () => {
    clearSession()
    router.replace("/login")
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white">
          <Image
            src="/logo-beru.png"
            alt="Beru Sistem"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-sidebar-foreground">Beru Sistem</h1>
          <p className="text-xs text-sidebar-foreground/60">Gestion empresarial</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
          Menu Principal
        </p>
        {allowedNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/configuracion"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Settings className="h-5 w-5" />
          Configuracion
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesion
        </button>
      </div>
    </aside>
  )
}
