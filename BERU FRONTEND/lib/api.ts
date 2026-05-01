import { clearSession, getAuthToken, SessionPayload, UserPermissions } from "@/lib/auth";
/**
 * Base del API.
 * - `next dev` en el navegador: URL directa al FastAPI (mismo host que la página, puerto 8000 o 127.0.0.1). CORS en el backend; evita que el proxy de Next falle al hacer fetch a localhost.
 * - `next start` / producción en el navegador sin `NEXT_PUBLIC_API_URL`: `/api/proxy` → FastAPI según `BERU_API_PROXY_TARGET`.
 * - Con `NEXT_PUBLIC_API_URL`: llamada directa; `localhost` se normaliza a 127.0.0.1.
 */
function isDevBrowser(): boolean {
  return (
    typeof globalThis !== "undefined" &&
    "window" in globalThis &&
    process.env.NODE_ENV === "development"
  );
}

/** Origen del API en desarrollo desde el cliente (misma máquina o misma IP que el front). */
function browserDevApiOrigin(): string {
  const host = globalThis.window?.location?.hostname;
  if (!host || host === "localhost" || host === "127.0.0.1") {
    return "http://127.0.0.1:8000";
  }
  return `http://${host}:8000`;
}

function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (raw) {
    try {
      const url = new URL(raw);
      if (url.hostname === "localhost") url.hostname = "127.0.0.1";
      const loopback =
        url.hostname === "127.0.0.1" || url.hostname === "[::1]";
      if (typeof globalThis !== "undefined" && "window" in globalThis && loopback) {
        if (isDevBrowser()) return browserDevApiOrigin();
        return "/api/proxy";
      }
      const path = url.pathname.replace(/\/$/, "");
      return path && path !== "/" ? `${url.origin}${path}` : url.origin;
    } catch {
      return raw;
    }
  }
  if (typeof globalThis !== "undefined" && "window" in globalThis) {
    if (isDevBrowser()) return browserDevApiOrigin();
    return "/api/proxy";
  }
  return "http://127.0.0.1:8000";
}

/** Resuelve la base en cada `fetch` (no en la carga del módulo): evita que el bundle quede con 127.0.0.1:8000 y el navegador falle con "Failed to fetch". */
function apiRoot(): string {
  return getApiBaseUrl();
}

type FailResponseOptions = {
  /** 401 al intentar login (credenciales incorrectas): no borrar la sesión ya guardada. */
  isLoginAttempt?: boolean
}

/** Mensaje legible desde cuerpos de error de FastAPI (`detail` string o lista de validación). */
async function failResponse(
  res: Response,
  fallback: string,
  opts?: FailResponseOptions
): Promise<never> {
  let msg = fallback

  try {
    const data = (await res.json()) as { detail?: unknown }
    const d = data?.detail

    if (typeof d === "string") {
      msg = d
    } else if (Array.isArray(d)) {
      const parts = d
        .map((e) =>
          typeof e === "object" && e !== null && "msg" in e
            ? String((e as { msg: string }).msg)
            : String(e)
        )
        .filter(Boolean)

      if (parts.length) msg = parts.join("; ")
    }
  } catch {
    // ignore
  }

  if (res.status === 401) {
    if (typeof window !== "undefined" && !opts?.isLoginAttempt) {
      clearSession()
    }
    throw new Error(`${msg} (401)`)
  }

  throw new Error(`${msg} (${res.status})`)
}

type EquipmentPayload = {
  nombre_equipo: string;
  marca?: string;
  modelo?: string;
  categoria?: string;
  anio?: number;
  tarifa_diaria?: number;
  valor_inicial?: number;
  estado?: string;
};

type SubinventoryPayload = {
  nombre_item: string;
  cantidad?: number;
  descripcion?: string;
};

type RentalPayload = {
  inventario_id: number;
  cliente_id?: number;
  fecha_inicio: string;
  fecha_fin: string;
  deposito?: number;
  cliente?: string;
  ubicacion?: string;
};

type ClientPayload = {
  nombre: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  nit_documento?: string;
  celular?: string;
  ciudad?: string;
};

type UserPayload = {
  username: string;
  password: string;
  activo: boolean;
  permissions: UserPermissions;
};

type UserPermissionUpdatePayload = {
  activo: boolean;
  permissions: UserPermissions;
};

function authHeaders(extra?: Record<string, string>): HeadersInit {
  const token = getAuthToken();
  return {
    ...(extra || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getEquipment() {
  const res = await fetch(`${apiRoot()}/equipment/`, { cache: "no-store", headers: authHeaders() });
  if (!res.ok) await failResponse(res, "No se pudo consultar el inventario");

  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((item) => ({
    ...item,
    tarifa_diaria: Number(item.tarifa_diaria ?? 0),
    valor_inicial: Number(item.valor_inicial ?? 0),
  }));
}

export async function createEquipment(data: EquipmentPayload) {
  const res = await fetch(`${apiRoot()}/equipment/`, {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  });

  if (!res.ok) await failResponse(res, "No se pudo crear el equipo");

  return res.json();
}

export async function getSubinventory(equipmentId: number) {
  const res = await fetch(`${apiRoot()}/equipment/${equipmentId}/subinventory`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  if (!res.ok) await failResponse(res, "No se pudo consultar el subinventario");
  return res.json();
}

export async function createSubinventoryItem(
  equipmentId: number,
  data: SubinventoryPayload
) {
  const res = await fetch(`${apiRoot()}/equipment/${equipmentId}/subinventory`, {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  });
  if (!res.ok) await failResponse(res, "No se pudo crear el item del subinventario");
  return res.json();
}

export async function getRentals() {
  const res = await fetch(`${apiRoot()}/rentals/`, { cache: "no-store", headers: authHeaders() });
  if (!res.ok) await failResponse(res, "No se pudieron consultar los alquileres");
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((item) => ({
    ...item,
    tarifa_diaria: Number(item.tarifa_diaria ?? 0),
    deposito: Number(item.deposito ?? 0),
    total: Number(item.total ?? 0),
    dias: Number(item.dias ?? 0),
  }));
}

export async function createRental(data: RentalPayload) {
  const res = await fetch(`${apiRoot()}/rentals/`, {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  });
  if (!res.ok) await failResponse(res, "No se pudo crear el alquiler");
  return res.json();
}

export async function closeRentalInvoice(rentalId: number) {
  const res = await fetch(`${apiRoot()}/rentals/${rentalId}/invoice-close`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) await failResponse(res, "No se pudo cerrar/facturar el alquiler");
  return res.json();
}

export async function dispatchRental(rentalId: number) {
  const res = await fetch(`${apiRoot()}/rentals/${rentalId}/dispatch`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) await failResponse(res, "No se pudo registrar la salida de bodega");
  return res.json();
}

export async function returnRental(rentalId: number) {
  const res = await fetch(`${apiRoot()}/rentals/${rentalId}/return`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) await failResponse(res, "No se pudo registrar la devolucion a bodega");
  return res.json();
}

export async function partialLiquidation(rentalId: number) {
  const res = await fetch(`${apiRoot()}/rentals/${rentalId}/partial-liquidation`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) await failResponse(res, "No se pudo aplicar la liquidacion parcial");
  return res.json();
}

export async function getClients() {
  const res = await fetch(`${apiRoot()}/clients/`, { cache: "no-store", headers: authHeaders() });
  if (!res.ok) await failResponse(res, "No se pudieron consultar los clientes");
  return res.json();
}

export async function createClient(data: ClientPayload) {
  const res = await fetch(`${apiRoot()}/clients/`, {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  });

  if (!res.ok) await failResponse(res, "No se pudo crear el cliente");

  return res.json();
}

export async function login(username: string, password: string): Promise<SessionPayload> {
  const res = await fetch(`${apiRoot()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) await failResponse(res, "No se pudo iniciar sesion", { isLoginAttempt: true });
  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch(`${apiRoot()}/auth/me`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  if (!res.ok) await failResponse(res, "No se pudo validar la sesion");
  return res.json();
}

export async function getUsers() {
  const res = await fetch(`${apiRoot()}/users/`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  if (!res.ok) await failResponse(res, "No se pudieron consultar usuarios");
  return res.json();
}

export async function createUser(data: UserPayload) {
  const token = getAuthToken()

  const res = await fetch(`${apiRoot()}/users/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      username: data.username,
      password: data.password,
      activo: data.activo,
      permissions: data.permissions,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(error)
  }

  return res.json()
}

export async function updateUserPermissions(userId: number, payload: UserPermissionUpdatePayload) {
  const res = await fetch(`${apiRoot()}/users/${userId}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await failResponse(res, "No se pudo actualizar el usuario");
  return res.json();
}