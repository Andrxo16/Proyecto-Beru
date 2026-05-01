/**
 * Estado de alquiler tal como debe mostrarse en bodega / campana.
 * Corrige respuestas antiguas o BD inconsistente: "devuelto" con 0 dias y $0 no es devolucion real.
 */
export function effectiveEstadoBodegaForUi(r: {
  estado: string
  dias?: number | null
  total?: number | string | null
}): string {
  const dias = Number(r.dias ?? 0)
  const total = Number(r.total ?? 0)
  if (r.estado === "devuelto" && dias <= 0 && total <= 0) {
    return "pendiente-salida"
  }
  return r.estado
}
