-- El flujo de alquileres usa estado 'reservado' (pendiente de salida de bodega).
-- Si la tabla fue creada con un CHECK antiguo, el UPDATE falla con 500.

ALTER TABLE inventario DROP CONSTRAINT IF EXISTS inventario_estado_check;

ALTER TABLE inventario ADD CONSTRAINT inventario_estado_check CHECK (
  estado IS NULL
  OR estado IN (
    'disponible',
    'prestamo',
    'mantenimiento',
    'reservado'
  )
);
