#!/usr/bin/env python3
"""
Script para pruebas rápidas de la API de RentaEquip
Ejecutar: python test_api.py
"""

import requests
import json
from decimal import Decimal

BASE_URL = "http://localhost:8000"

# Colores para terminal
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
END = '\033[0m'

def print_test(name: str, success: bool, message: str = ""):
    status = f"{GREEN}✓ PASS{END}" if success else f"{RED}✗ FAIL{END}"
    print(f"{BLUE}[TEST]{END} {name}: {status}")
    if message:
        print(f"       {message}")

def test_health_check():
    """Verifica que el backend está corriendo"""
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        success = response.status_code == 200
        print_test("Health Check", success, f"Status: {response.status_code}")
        if success:
            print(f"       Response: {response.json()}")
        return success
    except Exception as e:
        print_test("Health Check", False, f"Error: {str(e)}")
        return False

def test_get_equipment():
    """Obtiene lista de equipos"""
    try:
        response = requests.get(f"{BASE_URL}/equipment", timeout=5)
        success = response.status_code == 200
        print_test("GET /equipment", success, f"Status: {response.status_code}")
        if success:
            data = response.json()
            print(f"       Total equipos: {len(data) if isinstance(data, list) else 'N/A'}")
        return success
    except Exception as e:
        print_test("GET /equipment", False, f"Error: {str(e)}")
        return False

def test_create_equipment():
    """Crea un nuevo equipo de prueba"""
    test_data = {
        "nombre_equipo": "Excavadora Prueba",
        "marca": "Caterpillar",
        "modelo": "320 GC",
        "categoria": "Maquinaria",
        "anio": 2024,
        "tarifa_diaria": 450.00,
        "valor_inicial": 50000.00,
        "estado": "disponible",
        "ubicacion": "Bodega A"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/equipment",
            json=test_data,
            timeout=5,
            headers={"Content-Type": "application/json"}
        )
        success = response.status_code == 200
        print_test("POST /equipment", success, f"Status: {response.status_code}")
        if success:
            data = response.json()
            print(f"       ID: {data.get('id')}")
            print(f"       Nombre: {data.get('nombre_equipo')}")
            return data.get('id')
        else:
            print(f"       Error: {response.json()}")
            return None
    except Exception as e:
        print_test("POST /equipment", False, f"Error: {str(e)}")
        return None

def test_get_equipment_by_id(equipment_id: int):
    """Obtiene un equipo específico"""
    try:
        response = requests.get(f"{BASE_URL}/equipment/{equipment_id}", timeout=5)
        success = response.status_code == 200
        print_test(f"GET /equipment/{equipment_id}", success, f"Status: {response.status_code}")
        if success:
            data = response.json()
            print(f"       Nombre: {data.get('nombre_equipo')}")
        return success
    except Exception as e:
        print_test(f"GET /equipment/{equipment_id}", False, f"Error: {str(e)}")
        return False

def main():
    print(f"\n{YELLOW}=== Pruebas de API RentaEquip ==={END}\n")
    print(f"Base URL: {BASE_URL}\n")
    
    results = []
    
    # Test 1: Health Check
    results.append(test_health_check())
    print()
    
    # Test 2: Get Equipment
    results.append(test_get_equipment())
    print()
    
    # Test 3: Create Equipment
    equipment_id = test_create_equipment()
    results.append(equipment_id is not None)
    print()
    
    # Test 4: Get Equipment by ID
    if equipment_id:
        results.append(test_get_equipment_by_id(equipment_id))
        print()
    
    # Resumen
    passed = sum(results)
    total = len(results)
    print(f"{YELLOW}=== Resumen ==={END}")
    print(f"Pruebas pasadas: {GREEN}{passed}/{total}{END}")
    
    if passed == total:
        print(f"\n{GREEN}✓ Todos los tests pasaron{END}\n")
    else:
        print(f"\n{RED}✗ Algunos tests fallaron{END}\n")

if __name__ == "__main__":
    main()
