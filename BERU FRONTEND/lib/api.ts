/**
 * Base del API.
 * - Sin `NEXT_PUBLIC_API_URL`: en el navegador se usa `/api/proxy` (route handler → FastAPI) para evitar CORS y fallos con localhost/IPv6.
 * - Con `NEXT_PUBLIC_API_URL`: llamada directa (p. ej. producción); `localhost` se normaliza a 127.0.0.1.
 */
function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (raw) {
    try {
      const url = new URL(raw);
      if (url.hostname === "localhost") url.hostname = "127.0.0.1";
      const loopback =
        url.hostname === "127.0.0.1" || url.hostname === "[::1]";
      if (typeof globalThis !== "undefined" && "window" in globalThis && loopback) {
        return "/api/proxy";
      }
      const path = url.pathname.replace(/\/$/, "");
      return path && path !== "/" ? `${url.origin}${path}` : url.origin;
    } catch {
      return raw;
    }
  }
  if (typeof globalThis !== "undefined" && "window" in globalThis) {
    return "/api/proxy";
  }
  return "http://127.0.0.1:8000";
}

/** Resuelve la base en cada `fetch` (no en la carga del módulo): evita que el bundle quede con 127.0.0.1:8000 y el navegador falle con "Failed to fetch". */
function apiRoot(): string {
  return getApiBaseUrl();
}

/** Mensaje legible desde cuerpos de error de FastAPI (`detail` string o lista de validación). */
async function failResponse(res: Response, fallback: string): Promise<never> {
  let msg = fallback;
  try {
    const data = (await res.json()) as { detail?: unknown };
    const d = data?.detail;
    if (typeof d === "string") {
      msg = d;
    } else if (Array.isArray(d)) {
      const parts = d
        .map((e) =>
          typeof e === "object" && e !== null && "msg" in e
            ? String((e as { msg: string }).msg)
            : String(e)
        )
        .filter(Boolean);
      if (parts.length) msg = parts.join("; ");
    }
  } catch {
    /* cuerpo no JSON */
  }
  throw new Error(`${msg} (${res.status})`);
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
};

export async function getEquipment() {
  const res = await fetch(`${apiRoot()}/equipment/`, { cache: "no-store" });
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) await failResponse(res, "No se pudo crear el equipo");

  return res.json();
}

export async function getSubinventory(equipmentId: number) {
  const res = await fetch(`${apiRoot()}/equipment/${equipmentId}/subinventory`, {
    cache: "no-store",
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) await failResponse(res, "No se pudo crear el item del subinventario");
  return res.json();
}

export async function getRentals() {
  const res = await fetch(`${apiRoot()}/rentals/`, { cache: "no-store" });
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) await failResponse(res, "No se pudo crear el alquiler");
  return res.json();
}

export async function closeRentalInvoice(rentalId: number) {
  const res = await fetch(`${apiRoot()}/rentals/${rentalId}/invoice-close`, {
    method: "PATCH",
  });
  if (!res.ok) await failResponse(res, "No se pudo cerrar/facturar el alquiler");
  return res.json();
}

export async function getClients() {
  const res = await fetch(`${apiRoot()}/clients/`, { cache: "no-store" });
  if (!res.ok) await failResponse(res, "No se pudieron consultar los clientes");
  return res.json();
}

export async function createClient(data: ClientPayload) {
  const res = await fetch(`${apiRoot()}/clients/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) await failResponse(res, "No se pudo crear el cliente");

  return res.json();
}