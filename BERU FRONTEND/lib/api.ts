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