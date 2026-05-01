-- Si ejecutaste un backfill que marco salida en alquileres aun sin despacho, corrigelo.
UPDATE rentas r
SET salida_bodega_registrada = FALSE
FROM inventario i
WHERE r.inventario_id = i.id
  AND i.estado IN ('disponible', 'reservado')
  AND r.facturado = FALSE
  AND r.fecha_facturacion IS NULL
  AND COALESCE(r.dias, 0) = 0;
