import os
from pathlib import Path
from app.db.session import engine


def create_tables() -> None:
    project_root = Path(__file__).resolve().parent.parent.parent
    sql_file = project_root / "init_db.sql"

    if not sql_file.exists():
        raise FileNotFoundError(f"SQL file not found: {sql_file}")

    with open(sql_file, "r", encoding="utf-8") as f:
        sql_script = f.read()

    with engine.connect() as conn:
        conn.exec_driver_sql(sql_script)
        conn.commit()


if __name__ == "__main__":
    create_tables()
    print("Tablas creadas en PostgreSQL usando init_db.sql.")
