"use client"

export type UserPermissions = {
  can_dashboard: boolean
  can_inventory: boolean
  can_warehouse: boolean
  can_clients: boolean
  can_rentals: boolean
  can_permissions: boolean
  /** Ver ID del equipo en tarjetas y modales de inventario */
  can_inventory_show_id: boolean
  /** Ver tarifa diaria en tarjetas de inventario */
  can_inventory_show_tarifa: boolean
}

export type SessionUser = {
  id: number
  username: string
  activo: boolean
  permissions: UserPermissions
}

export type SessionPayload = {
  access_token: string
  token_type: "bearer"
  user: SessionUser
}

const STORAGE_KEY = "beru_session"

export function getSession(): SessionPayload | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SessionPayload
  } catch {
    return null
  }
}

export function getAuthToken(): string | null {
  return getSession()?.access_token ?? null
}

export function saveSession(session: SessionPayload) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event("beru-session-changed"))
}

export function clearSession() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event("beru-session-changed"))
}
