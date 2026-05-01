-- Permisos por campo en inventario (tabla usuarios; no hace falta tabla nueva).
-- Ejecutar en pgAdmin con el usuario que tenga permisos DDL.

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS can_inventory_show_id BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS can_inventory_show_tarifa BOOLEAN NOT NULL DEFAULT TRUE;
