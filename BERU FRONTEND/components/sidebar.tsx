"use client"

import { useEffect, useState } from "react"
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

  const [mounted, setMounted] = useState(false)
  const [session, setSession] = useState<any>(null)

  // 🔥 SOLO CLIENTE
  useEffect(() => {
    setMounted(true)
    setSession(getSession())

    const handler = () => setSession(getSession())
    window.addEventListener("beru-session-changed", handler)

    return () => window.removeEventListener("beru-session-changed", handler)
  }, [])

  const allowedNavigation = navigation.filter(
    (item) => session?.user?.permissions?.[item.permission]
  )

  const handleLogout = () => {
    clearSession()
    router.replace("/login")
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <Image src="/logo-beru.png" alt="logo" width={36} height={36} />
        <h1 className="text-lg font-semibold">Beru Sistem</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" suppressHydrationWarning>
        {!mounted ? (
          <div className="space-y-2 px-3" aria-hidden>
            {navigation.map((item) => (
              <div
                key={item.name}
                className="h-10 rounded-lg bg-sidebar-foreground/5 animate-pulse"
              />
            ))}
          </div>
        ) : null}
        {mounted
          ? allowedNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })
          : null}
      </nav>

      <button onClick={handleLogout} className="p-3">
        <LogOut /> Cerrar sesión
      </button>
    </aside>
  )
}