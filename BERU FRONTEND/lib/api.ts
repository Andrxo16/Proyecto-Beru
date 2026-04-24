const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  const res = await fetch(`${API_URL}/equipment/`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("No se pudo consultar el inventario");
  }

  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((item) => ({
    ...item,
    tarifa_diaria: Number(item.tarifa_diaria ?? 0),
    valor_inicial: Number(item.valor_inicial ?? 0),
  }));
}

export async function createEquipment(data: EquipmentPayload) {
  const res = await fetch(`${API_URL}/equipment/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("No se pudo crear el equipo");
  }

  return res.json();
}

export async function getSubinventory(equipmentId: number) {
  const res = await fetch(`${API_URL}/equipment/${equipmentId}/subinventory`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("No se pudo consultar el subinventario");
  }
  return res.json();
}

export async function createSubinventoryItem(
  equipmentId: number,
  data: SubinventoryPayload
) {
  const res = await fetch(`${API_URL}/equipment/${equipmentId}/subinventory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("No se pudo crear el item del subinventario");
  }
  return res.json();
}

export async function getRentals() {
  const res = await fetch(`${API_URL}/rentals/`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("No se pudieron consultar los alquileres");
  }
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
  const res = await fetch(`${API_URL}/rentals/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("No se pudo crear el alquiler");
  }
  return res.json();
}

export async function closeRentalInvoice(rentalId: number) {
  const res = await fetch(`${API_URL}/rentals/${rentalId}/invoice-close`, {
    method: "PATCH",
  });
  if (!res.ok) {
    throw new Error("No se pudo cerrar/facturar el alquiler");
  }
  return res.json();
}

export async function getClients() {
  const res = await fetch(`${API_URL}/clients/`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("No se pudieron consultar los clientes");
  }
  return res.json();
}

export async function createClient(data: ClientPayload) {
  const res = await fetch(`${API_URL}/clients/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("No se pudo crear el cliente");
  }

  return res.json();
}