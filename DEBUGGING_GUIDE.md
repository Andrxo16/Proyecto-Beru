# 🚀 Guía de Ejecución y Debugging - Proyecto Beru

## Requisitos Previos
- Python 3.9+ (Backend)
- Node.js 18+ (Frontend)
- PostgreSQL o SQLite (Base de datos)

---

## 📋 Setup Inicial

### Backend (BERUAPP)

#### 1. Instalar dependencias
```bash
cd BERUAPP
pip install -r requirements.txt
```

#### 2. Configurar base de datos
Crear archivo `.env`:
```env
# Para SQLite (desarrollo)
DATABASE_URL=sqlite:///./beru_db.db

# Para PostgreSQL
# DATABASE_URL=postgresql://user:password@localhost:5432/beru_db
```

#### 3. Ejecutar servidor
```bash
cd app
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El servidor debe estar disponible en: `http://localhost:8000`

### Frontend (BERU FRONTEND)

#### 1. Instalar dependencias
```bash
cd "BERU FRONTEND"
npm install
```

#### 2. Configurar API
Crear archivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 3. Ejecutar servidor de desarrollo
```bash
npm run dev
```

La aplicación debe estar disponible en: `http://localhost:3000`

---

## 🧪 Pruebas de Conectividad

### Opción 1: Script de pruebas (Python)
```bash
cd BERUAPP
python test_api.py
```

### Opción 2: curl
```bash
# Health check
curl http://localhost:8000/

# Obtener equipos
curl http://localhost:8000/equipment

# Crear equipo
curl -X POST http://localhost:8000/equipment \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_equipo": "Excavadora CAT 320",
    "marca": "Caterpillar",
    "modelo": "320 GC",
    "categoria": "Maquinaria",
    "anio": 2024,
    "tarifa_diaria": 450.00,
    "valor_inicial": 50000.00,
    "estado": "disponible"
  }'
```

---

## 🐛 Debugging

### Errores Comunes

#### Error 404: `/equipment not found`
- ✅ Verificar que el servidor backend está corriendo
- ✅ Verificar que la URL es correcta: `http://localhost:8000`
- ✅ Revisar logs en la terminal del backend

#### Error 422: `Unprocessable Content`
- ✅ Validar que los tipos de datos son correctos
- ✅ El campo `nombre_equipo` es obligatorio
- ✅ Los campos numéricos (tarifa_diaria, anio) deben ser números
- ✅ Ver detalles del error en la consola del navegador

#### Error 500: `Internal Server Error`
- ✅ Revisar logs del backend (terminal donde corre uvicorn)
- ✅ Verificar conexión a la base de datos
- ✅ Usar script `test_api.py` para más detalles

#### CORS Error: `No 'Access-Control-Allow-Origin' header`
- ✅ Verificar que el middleware CORS está habilitado
- ✅ Confirmar que el backend corre en `localhost:8000`
- ✅ Revisar que `NEXT_PUBLIC_API_URL` en frontend es correcto

### Ver Logs del Backend
Los logs aparecen en la terminal donde ejecutas el comando `uvicorn`:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Tablas de base de datos creadas exitosamente
INFO:     Application startup complete
```

### Ver Logs del Frontend
Abre la consola del navegador (F12) en la pestaña "Console":
- Mensajes de fetch de API
- Errores de validación
- Detalles de respuestas

---

## 📊 Estructura de Base de Datos

### Tabla: inventario
```
id (PK)              - Identificador único
nombre_equipo        - Nombre del equipo
ubicacion            - Ubicación
historia_uso         - Historial de uso
valor_inicial        - Valor inicial
estado               - Estado (disponible, prestamo, mantenimiento)
marca                - Marca del equipo
modelo               - Modelo
categoria            - Categoría
anio                 - Año de fabricación
tarifa_diaria        - Tarifa de alquiler diario
created_at           - Fecha de creación
```

---

## 🔧 Cambios Realizados

### Backend
1. ✅ Mejorado middleware CORS
2. ✅ Agregar logging completo
3. ✅ Corregir tipos de datos (Decimal)
4. ✅ Mejor manejo de errores
5. ✅ Validación mejorada en schemas

### Frontend  
1. ✅ Mejorado cliente API
2. ✅ Mejor manejo de errores
3. ✅ Console logging para debugging
4. ✅ Soporte para NEXT_PUBLIC_API_URL

---

## 📝 Notas Importantes

- El backend automáticamente crea las tablas al iniciar
- Use `test_api.py` para verificar connectividad
- Revise los logs en ambas terminales para debugging
- Asegúrese que ambos servicios están corriendo en puertos diferentes (3000 y 8000)

---

## 🆘 Necesita Ayuda?

1. Revisar logs del backend
2. Ejecutar `test_api.py`
3. Verificar consola del navegador (F12)
4. Confirmar que base de datos existe y es accesible
