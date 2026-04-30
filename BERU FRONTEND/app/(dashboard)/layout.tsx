"use client"

import { useEffect, useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"

import { Sidebar } from "@/components/sidebar"
import { getSession, UserPermissions } from "@/lib/auth"

const PATH_PERMISSION_MAP: Record<string, keyof UserPermissions> = {
  "/": "can_dashboard",
  "/inventario": "can_inventory",
  "/bodega": "can_warehouse",
  "/clientes": "can_clients",
  "/alquileres": "can_rentals",
  "/permisos": "can_permissions",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const requiredPermission = useMemo(() => {
    return PATH_PERMISSION_MAP[pathname] ?? null
  }, [pathname])

  useEffect(() => {
    const session = getSession()
    if (!session) {
      router.replace("/login")
      return
    }
    if (requiredPermission && !session.user.permissions[requiredPermission]) {
      const allowedRoute =
        Object.entries(PATH_PERMISSION_MAP).find(([, perm]) => session.user.permissions[perm])?.[0] || "/login"
      router.replace(allowedRoute)
    }
  }, [requiredPermission, router])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64">
        {children}
      </main>
    </div>
  )
}
