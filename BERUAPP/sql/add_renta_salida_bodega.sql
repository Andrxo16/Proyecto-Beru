-- Marca si ya hubo salida de bodega (ahi empieza el conteo de dias de cobro).
ALTER TABLE rentas
  ADD COLUMN IF NOT EXISTS salida_bodega_registrada BOOLEAN NOT NULL DEFAULT FALSE;

-- Equipo aun fuera o en mantenimiento: ya se despacho.
UPDATE rentas r
SET salida_bodega_registrada = TRUE
FROM inventario i
WHERE r.inventario_id = i.id
  AND i.estado IN ('prestamo', 'mantenimiento');

-- Ya facturado o liquidacion parcial registrada.
UPDATE rentas
SET salida_bodega_registrada = TRUE
WHERE facturado = TRUE OR fecha_facturacion IS NOT NULL;

-- NO marcar salida solo por "disponible + dias > 0": confunde alquileres recien creados
-- (dias del contrato antes del despacho) con devoluciones reales.
