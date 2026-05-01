from datetime import datetime, time
from decimal import Decimal
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.equipment import Cliente, Inventario, Renta
from app.schemas.equipment import RentalCreate, RentalResponse
from auth.security import require_any_permission, require_permission

router = APIRouter(prefix="/rentals", tags=["Rentals"])

def _compute_days(start: datetime, end: datetime) -> int:
    days = (end.date() - start.date()).days
    return max(days, 1)

def _compute_effective_end() -> datetime:
    """
    Ongoing rentals are billed by elapsed days only (up to today).
    """
    return datetime.combine(datetime.now().date(), time.min)


def _compute_billing_end_for_closure(start: datetime) -> datetime:
    """
    Closing an invoice bills only elapsed days (discounting future planned days).
    """
    return datetime.combine(datetime.now().date(), time.min)


def _compute_rental_status(fecha_fin: datetime) -> str:
    today = datetime.now().date()
    end_day = fecha_fin.date()
    if today > end_day:
        return "vencido"

    days_left = (end_day - today).days
    if days_left <= 3:
        return "por-vencer"
    return "activo"


def _norm_estado_inventario(raw) -> str:
    if raw is None or (isinstance(raw, str) and not str(raw).strip()):
        return ""
    return str(raw).strip().lower()


def _normalizar_antes_despacho_bodega(rental: Renta, equipment: Inventario) -> None:
    """Alinea flags e inventario al mismo criterio que GET /rentals antes de registrar salida."""
    rental.salida_bodega_registrada = False
    rental.fecha_salida_bodega = None
    equipment.estado = "reservado"


def _append_history(equipment: Inventario, message: str) -> None:
    current = (equipment.historia_uso or "").strip()
    equipment.historia_uso = f"{current}\n{message}".strip() if current else message


@router.post("/", response_model=RentalResponse)
def create_rental(
    rental: RentalCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("can_rentals")),
):
    equipment = db.query(Inventario).filter(Inventario.id == rental.inventario_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    raw_estado = equipment.estado
    if raw_estado is None or (isinstance(raw_estado, str) and not raw_estado.strip()):
        estado_eq = "disponible"
    else:
        estado_eq = str(raw_estado).strip().lower()
    if estado_eq != "disponible":
        raise HTTPException(
            status_code=400,
            detail=(
                "El equipo no esta disponible para un nuevo alquiler "
                f"(estado actual: {equipment.estado or 'sin estado'}). "
                "Solo equipos en estado Disponible pueden reservarse."
            ),
        )

    client = None
    if rental.cliente_id:
        client = db.query(Cliente).filter(Cliente.id == rental.cliente_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")

    start_dt = datetime.combine(rental.fecha_inicio, time.min)
    # Mismo dia calendario: fin a ultima hora para que end > start (contrato de un dia).
    if rental.fecha_fin < rental.fecha_inicio:
        raise HTTPException(status_code=400, detail="La fecha fin no puede ser anterior a la fecha inicio")
    end_dt = (
        datetime.combine(rental.fecha_fin, time.max)
        if rental.fecha_fin == rental.fecha_inicio
        else datetime.combine(rental.fecha_fin, time.min)
    )
    if end_dt <= start_dt:
        raise HTTPException(status_code=400, detail="La fecha fin debe ser mayor o igual a la fecha inicio")

    if equipment.tarifa_diaria is None:
        raise HTTPException(status_code=400, detail="El equipo no tiene tarifa diaria configurada")

    days = _compute_days(start_dt, end_dt)
    deposito = Decimal(rental.deposito or 0)
    # Cobro por dias arranca al despachar desde bodega; el contrato queda en fechas.
    new_rental = Renta(
        inventario_id=equipment.id,
        cliente_id=client.id if client else None,
        fecha_inicio=start_dt,
        fecha_fin=end_dt,
        tarifa_diaria=equipment.tarifa_diaria,
        deposito=deposito,
        dias=0,
        total=Decimal(0),
        facturado=False,
        salida_bodega_registrada=False,
        fecha_salida_bodega=None,
    )
    db.add(new_rental)

    # El alquiler se crea en espera de despacho desde bodega.
    equipment.estado = "reservado"
    if rental.ubicacion:
        equipment.ubicacion = rental.ubicacion.strip()
    history_note = (
        f"{datetime.now().strftime('%Y-%m-%d')}: Alquiler creado (contrato {days} dias) "
        f"del {rental.fecha_inicio.isoformat()} al {rental.fecha_fin.isoformat()}"
    )
    if client:
        history_note += f" | Cliente: {client.nombre}"
    elif rental.cliente:
        history_note += f" | Cliente: {rental.cliente.strip()}"
    if rental.ubicacion:
        history_note += f" | Ubicacion: {rental.ubicacion.strip()}"
    _append_history(equipment, history_note)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        err_blob = f"{getattr(exc, 'orig', '')!s} {exc!s}".lower()
        if "inventario_estado_check" in err_blob:
            raise HTTPException(
                status_code=400,
                detail=(
                    "La base de datos no acepta el estado 'reservado' en inventario. "
                    "Ejecuta en PostgreSQL el script sql/fix_inventario_estado_check.sql del proyecto BERUAPP."
                ),
            ) from exc
        raise HTTPException(status_code=500, detail="No se pudo guardar el alquiler") from exc

    db.refresh(new_rental)
    db.refresh(equipment)

    status = _compute_rental_status(new_rental.fecha_fin) if new_rental.fecha_fin else "activo"
    if status == "vencido" and equipment.estado != "mantenimiento":
        equipment.estado = "mantenimiento"
        _append_history(equipment, f"{datetime.now().strftime('%Y-%m-%d')}: Alquiler vencido")
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail="Alquiler creado pero no se pudo actualizar el estado del equipo",
            ) from exc

    return RentalResponse(
        id=new_rental.id,
        inventario_id=new_rental.inventario_id,
        cliente_id=new_rental.cliente_id,
        fecha_inicio=new_rental.fecha_inicio,
        fecha_fin=new_rental.fecha_fin,
        tarifa_diaria=new_rental.tarifa_diaria,
        deposito=new_rental.deposito,
        dias=new_rental.dias,
        total=new_rental.total,
        estado="pendiente-salida",
        facturado=bool(new_rental.facturado),
        cliente=client.nombre if client else rental.cliente,
        equipo_nombre=equipment.nombre_equipo,
    )


@router.get("/", response_model=list[RentalResponse])
def get_rentals(
    db: Session = Depends(get_db),
    _=Depends(require_any_permission("can_rentals", "can_warehouse")),
):
    items = db.query(Renta).order_by(Renta.id.desc()).all()
    results: list[RentalResponse] = []
    for rental in items:
        equipment = db.query(Inventario).filter(Inventario.id == rental.inventario_id).first()
        if not equipment:
            continue
        client = db.query(Cliente).filter(Cliente.id == rental.cliente_id).first() if rental.cliente_id else None

        estado_eq = _norm_estado_inventario(equipment.estado)
        fecha_salida = getattr(rental, "fecha_salida_bodega", None)
        salida_ok = bool(rental.salida_bodega_registrada) and fecha_salida is not None

        if rental.facturado:
            status = "facturado"
            recalculated_days = rental.dias or 0
            recalculated_total = rental.total or Decimal(0)
            equipment.estado = "disponible"
        elif rental.fecha_facturacion:
            # Liquidacion parcial: se congela el conteo aunque no exista devolucion fisica.
            cutoff = datetime.combine(rental.fecha_facturacion.date(), time.min)
            recalculated_days = _compute_days(rental.fecha_inicio, cutoff)
            recalculated_total = Decimal(rental.tarifa_diaria) * Decimal(recalculated_days)
            status = "liquidacion-parcial"
        elif not salida_ok:
            # Sin despacho de bodega: siempre "pendiente por salida" (no inferir devuelto por inventario disponible).
            status = "pendiente-salida"
            recalculated_days = 0
            recalculated_total = Decimal(0)
            rental.salida_bodega_registrada = False
            rental.fecha_salida_bodega = None
            equipment.estado = "reservado"
        elif estado_eq == "disponible":
            # Devolucion real: hubo despacho (cobro) y cierre con dias/total > 0.
            # Si inventario esta disponible pero dias y total siguen en 0, es dato sucio (no marcar devuelto).
            dias_row = int(rental.dias or 0)
            total_row = Decimal(rental.total or 0)
            if dias_row > 0 or total_row > 0:
                status = "devuelto"
                recalculated_days = dias_row
                recalculated_total = total_row
            else:
                status = "pendiente-salida"
                recalculated_days = 0
                recalculated_total = Decimal(0)
                rental.salida_bodega_registrada = False
                rental.fecha_salida_bodega = None
                equipment.estado = "reservado"
        elif estado_eq in ("prestamo", "mantenimiento"):
            effective_end = _compute_effective_end()
            recalculated_days = _compute_days(rental.fecha_inicio, effective_end)
            recalculated_total = Decimal(rental.tarifa_diaria) * Decimal(recalculated_days)
            status = _compute_rental_status(rental.fecha_fin) if rental.fecha_fin else "activo"
            if status == "vencido":
                equipment.estado = "mantenimiento"
            elif status in ("activo", "por-vencer"):
                equipment.estado = "prestamo"
        else:
            # Despacho ya registrado pero inventario aun "reservado" u otro valor: alinear a prestamo/mantenimiento.
            effective_end = _compute_effective_end()
            recalculated_days = _compute_days(rental.fecha_inicio, effective_end)
            recalculated_total = Decimal(rental.tarifa_diaria) * Decimal(recalculated_days)
            status = _compute_rental_status(rental.fecha_fin) if rental.fecha_fin else "activo"
            if status == "vencido":
                equipment.estado = "mantenimiento"
            elif status in ("activo", "por-vencer"):
                equipment.estado = "prestamo"

        if rental.dias != recalculated_days:
            rental.dias = recalculated_days
        if rental.total != recalculated_total:
            rental.total = recalculated_total

        results.append(
            RentalResponse(
                id=rental.id,
                inventario_id=rental.inventario_id,
                cliente_id=rental.cliente_id,
                fecha_inicio=rental.fecha_inicio,
                fecha_fin=rental.fecha_fin,
                tarifa_diaria=rental.tarifa_diaria,
                deposito=rental.deposito,
                dias=rental.dias,
                total=rental.total,
                estado=status,
                facturado=bool(rental.facturado),
                cliente=client.nombre if client else None,
                equipo_nombre=equipment.nombre_equipo,
            )
        )

    db.commit()
    return results


def _dispatch_response(
    db: Session,
    rental: Renta,
    equipment: Inventario,
    estado_override: Optional[str] = None,
) -> RentalResponse:
    client = db.query(Cliente).filter(Cliente.id == rental.cliente_id).first() if rental.cliente_id else None
    if estado_override is not None:
        status = estado_override
    elif rental.fecha_facturacion:
        status = "liquidacion-parcial"
    else:
        status = _compute_rental_status(rental.fecha_fin) if rental.fecha_fin else "activo"
    return RentalResponse(
        id=rental.id,
        inventario_id=rental.inventario_id,
        cliente_id=rental.cliente_id,
        fecha_inicio=rental.fecha_inicio,
        fecha_fin=rental.fecha_fin,
        tarifa_diaria=rental.tarifa_diaria,
        deposito=rental.deposito,
        dias=rental.dias,
        total=rental.total,
        estado=status,
        facturado=bool(rental.facturado),
        cliente=client.nombre if client else None,
        equipo_nombre=equipment.nombre_equipo,
    )


@router.patch("/{rental_id}/dispatch", response_model=RentalResponse)
def dispatch_rental(
    rental_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_permission("can_warehouse")),
):
    rental = db.query(Renta).filter(Renta.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Alquiler no encontrado")

    equipment = db.query(Inventario).filter(Inventario.id == rental.inventario_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    if rental.facturado:
        raise HTTPException(status_code=400, detail="El alquiler ya fue facturado")

    if rental.tarifa_diaria is None:
        raise HTTPException(status_code=400, detail="El alquiler no tiene tarifa diaria; no se puede despachar")

    eq = _norm_estado_inventario(equipment.estado)
    fs = getattr(rental, "fecha_salida_bodega", None)
    salida_ok = bool(rental.salida_bodega_registrada) and fs is not None
    dias_row = int(rental.dias or 0) if rental.dias is not None else 0
    total_row = Decimal(rental.total or 0)

    # Idempotente: ya hubo salida y ya corre el cobro (doble clic o reintento).
    if salida_ok and eq in ("prestamo", "mantenimiento") and dias_row >= 1:
        return _dispatch_response(db, rental, equipment)

    # Idempotente: devolucion ya hecha con cobro.
    if salida_ok and eq == "disponible" and (dias_row >= 1 or total_row > 0):
        return _dispatch_response(db, rental, equipment, estado_override="devuelto")

    _normalizar_antes_despacho_bodega(rental, equipment)

    start_dt = datetime.combine(datetime.now().date(), time.min)
    rental.fecha_inicio = start_dt
    if rental.fecha_fin and rental.fecha_fin <= start_dt:
        rental.fecha_fin = datetime.combine(datetime.now().date(), time.max)
    rental.dias = 1
    rental.total = Decimal(rental.tarifa_diaria) * Decimal(rental.dias)
    rental.salida_bodega_registrada = True
    rental.fecha_salida_bodega = start_dt
    equipment.estado = "prestamo"

    _append_history(
        equipment,
        f"{datetime.now().strftime('%Y-%m-%d')}: Salida de bodega en alquiler #{rental.id}",
    )

    db.commit()
    db.refresh(rental)
    db.refresh(equipment)
    return _dispatch_response(db, rental, equipment)


@router.patch("/{rental_id}/return", response_model=RentalResponse)
def return_rental(
    rental_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_permission("can_warehouse")),
):
    rental = db.query(Renta).filter(Renta.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Alquiler no encontrado")

    equipment = db.query(Inventario).filter(Inventario.id == rental.inventario_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    if rental.facturado:
        raise HTTPException(status_code=400, detail="El alquiler ya fue facturado")

    estado_inv = _norm_estado_inventario(equipment.estado)
    if estado_inv not in ("prestamo", "mantenimiento"):
        raise HTTPException(
            status_code=400,
            detail="Solo entrada a bodega con equipo despachado (en prestamo o mantenimiento)",
        )

    return_dt = datetime.combine(datetime.now().date(), time.min)
    rental.fecha_fin = return_dt
    rental.dias = _compute_days(rental.fecha_inicio, return_dt)
    rental.total = Decimal(rental.tarifa_diaria) * Decimal(rental.dias)
    equipment.estado = "disponible"

    _append_history(
        equipment,
        f"{datetime.now().strftime('%Y-%m-%d')}: Devolucion a bodega en alquiler #{rental.id} "
        f"({rental.dias} dias, total {rental.total})",
    )

    db.commit()
    db.refresh(rental)
    db.refresh(equipment)
    client = db.query(Cliente).filter(Cliente.id == rental.cliente_id).first() if rental.cliente_id else None
    return RentalResponse(
        id=rental.id,
        inventario_id=rental.inventario_id,
        cliente_id=rental.cliente_id,
        fecha_inicio=rental.fecha_inicio,
        fecha_fin=rental.fecha_fin,
        tarifa_diaria=rental.tarifa_diaria,
        deposito=rental.deposito,
        dias=rental.dias,
        total=rental.total,
        estado="devuelto",
        facturado=False,
        cliente=client.nombre if client else None,
        equipo_nombre=equipment.nombre_equipo,
    )


@router.patch("/{rental_id}/partial-liquidation", response_model=RentalResponse)
def partial_liquidation(
    rental_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_permission("can_rentals")),
):
    rental = db.query(Renta).filter(Renta.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Alquiler no encontrado")

    equipment = db.query(Inventario).filter(Inventario.id == rental.inventario_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    if rental.facturado:
        raise HTTPException(status_code=400, detail="El alquiler ya fue facturado")
    if equipment.estado not in ("prestamo", "mantenimiento"):
        raise HTTPException(status_code=400, detail="La liquidacion parcial aplica solo a equipos fuera de bodega")
    if rental.fecha_facturacion:
        raise HTTPException(status_code=400, detail="La liquidacion parcial ya fue registrada")

    cutoff = datetime.combine(datetime.now().date(), time.min)
    rental.fecha_facturacion = datetime.now()
    rental.dias = _compute_days(rental.fecha_inicio, cutoff)
    rental.total = Decimal(rental.tarifa_diaria) * Decimal(rental.dias)

    _append_history(
        equipment,
        f"{datetime.now().strftime('%Y-%m-%d')}: Liquidacion parcial en alquiler #{rental.id} "
        f"({rental.dias} dias, total {rental.total})",
    )

    db.commit()
    db.refresh(rental)
    db.refresh(equipment)
    client = db.query(Cliente).filter(Cliente.id == rental.cliente_id).first() if rental.cliente_id else None

    return RentalResponse(
        id=rental.id,
        inventario_id=rental.inventario_id,
        cliente_id=rental.cliente_id,
        fecha_inicio=rental.fecha_inicio,
        fecha_fin=rental.fecha_fin,
        tarifa_diaria=rental.tarifa_diaria,
        deposito=rental.deposito,
        dias=rental.dias,
        total=rental.total,
        estado="liquidacion-parcial",
        facturado=False,
        cliente=client.nombre if client else None,
        equipo_nombre=equipment.nombre_equipo,
    )


@router.patch("/{rental_id}/invoice-close", response_model=RentalResponse)
def close_rental_invoice(
    rental_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_permission("can_rentals")),
):
    rental = db.query(Renta).filter(Renta.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Alquiler no encontrado")

    equipment = db.query(Inventario).filter(Inventario.id == rental.inventario_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    client = db.query(Cliente).filter(Cliente.id == rental.cliente_id).first() if rental.cliente_id else None
    if rental.facturado:
        return RentalResponse(
            id=rental.id,
            inventario_id=rental.inventario_id,
            cliente_id=rental.cliente_id,
            fecha_inicio=rental.fecha_inicio,
            fecha_fin=rental.fecha_fin,
            tarifa_diaria=rental.tarifa_diaria,
            deposito=rental.deposito,
            dias=rental.dias,
            total=rental.total,
            estado="facturado",
            facturado=True,
            cliente=client.nombre if client else None,
            equipo_nombre=equipment.nombre_equipo,
        )

    if equipment.estado == "disponible" or rental.fecha_facturacion:
        # Si ya hay devolucion en bodega o liquidacion parcial, se conserva el total congelado.
        rental.dias = rental.dias or 0
        rental.total = rental.total or Decimal(0)
    else:
        effective_end = _compute_billing_end_for_closure(rental.fecha_inicio)
        rental.dias = _compute_days(rental.fecha_inicio, effective_end)
        rental.total = Decimal(rental.tarifa_diaria) * Decimal(rental.dias)
    rental.facturado = True
    rental.fecha_facturacion = datetime.now()

    equipment.estado = "disponible"
    _append_history(
        equipment,
        f"{datetime.now().strftime('%Y-%m-%d')}: Factura cerrada en alquiler #{rental.id} "
        f"({rental.dias} dias, total {rental.total})",
    )

    db.commit()
    db.refresh(rental)
    db.refresh(equipment)

    return RentalResponse(
        id=rental.id,
        inventario_id=rental.inventario_id,
        cliente_id=rental.cliente_id,
        fecha_inicio=rental.fecha_inicio,
        fecha_fin=rental.fecha_fin,
        tarifa_diaria=rental.tarifa_diaria,
        deposito=rental.deposito,
        dias=rental.dias,
        total=rental.total,
        estado="facturado",
        facturado=True,
        cliente=client.nombre if client else None,
        equipo_nombre=equipment.nombre_equipo,
    )