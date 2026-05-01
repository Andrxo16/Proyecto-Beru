"""Aplica sql/fix_inventario_estado_check.sql (una vez). Ejecutar desde la carpeta BERUAPP: python scripts/apply_inventario_estado_fix.py"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from sqlalchemy import text

from app.db.database import engine

STEPS = [
    "ALTER TABLE inventario DROP CONSTRAINT IF EXISTS inventario_estado_check",
    (
        "ALTER TABLE inventario ADD CONSTRAINT inventario_estado_check CHECK ("
        "estado IS NULL OR estado IN ('disponible', 'prestamo', 'mantenimiento', 'reservado')"
        ")"
    ),
]


def main() -> None:
    with engine.begin() as conn:
        for stmt in STEPS:
            conn.execute(text(stmt))
    print("OK: inventario_estado_check actualizado.")


if __name__ == "__main__":
    main()
