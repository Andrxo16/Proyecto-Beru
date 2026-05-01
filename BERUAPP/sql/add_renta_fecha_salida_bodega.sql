-- Marca el momento del despacho desde bodega (inicio del cobro por dias).
ALTER TABLE rentas
  ADD COLUMN IF NOT EXISTS fecha_salida_bodega TIMESTAMP NULL;

-- Alquileres con equipo aun fuera: ya hubo despacho; fecha_inicio del alquiler es la del despacho.
UPDATE rentas r
SET fecha_salida_bodega = r.fecha_inicio
FROM inventario i
WHERE r.inventario_id = i.id
  AND i.estado IN ('prestamo', 'mantenimiento')
  AND r.fecha_salida_bodega IS NULL
  AND r.salida_bodega_registrada = TRUE;

-- Pendientes sin despacho: quitar dias/total del contrato guardados por versiones viejas del API.
UPDATE rentas r
SET dias = 0, total = 0
FROM inventario i
WHERE r.inventario_id = i.id
  AND i.estado IN ('reservado', 'disponible')
  AND r.facturado = FALSE
  AND r.fecha_facturacion IS NULL
  AND r.fecha_salida_bodega IS NULL;
