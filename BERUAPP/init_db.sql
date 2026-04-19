-- =========================================
-- 1. TABLA INVENTARIO (RETORNABLES)
-- =========================================
CREATE TABLE inventario (
    id SERIAL PRIMARY KEY,
    nombre_equipo VARCHAR(150) NOT NULL,
    ubicacion VARCHAR(150),
    historia_uso TEXT,
    valor_inicial NUMERIC(12,2),
    estado VARCHAR(20) CHECK (estado IN ('disponible', 'prestamo', 'mantenimiento')) DEFAULT 'disponible',
    marca VARCHAR(100),
    modelo VARCHAR(100),
    categoria VARCHAR(100),
    anio INT,
    tarifa_diaria NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 2. SUBINVENTARIO (ACCESORIOS / COMPONENTES)
-- =========================================
CREATE TABLE subinventario (
    id SERIAL PRIMARY KEY,
    inventario_id INT NOT NULL,
    nombre_item VARCHAR(150) NOT NULL,
    cantidad INT DEFAULT 1,
    descripcion TEXT,
    FOREIGN KEY (inventario_id) REFERENCES inventario(id) ON DELETE CASCADE
);

-- =========================================
-- 3. INVENTARIO NO RETORNABLE (MATERIALES)
-- =========================================
CREATE TABLE inventario_salida (
    id SERIAL PRIMARY KEY,
    nombre_material VARCHAR(150) NOT NULL,
    precio NUMERIC(10,2) NOT NULL,
    unidades_vendidas INT DEFAULT 0,
    fecha_venta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 4. RENTAS (PRÉSTAMOS DE EQUIPOS)
-- =========================================
CREATE TABLE rentas (
    id SERIAL PRIMARY KEY,
    inventario_id INT NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP,
    tarifa_diaria NUMERIC(10,2) NOT NULL,
    dias INT,
    total NUMERIC(12,2),
    FOREIGN KEY (inventario_id) REFERENCES inventario(id)
);