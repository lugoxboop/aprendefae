-- ═══════════════════════════════════════════════════════════════════════════
-- 0165 — ACCESORIOS DE LA MASCOTA (la tienda, reconvertida)
--
-- GUARDIAN: cambio de esquema a proposito
--
-- Al pasar todo a mascota, las figuras geométricas se retiran de la vista. La
-- tienda deja de vender formas y pasa a vender ACCESORIOS para la mascota
-- (gorro, gafas, bufanda, moño, bigote), con los MISMOS cristales que ya se
-- ganan. Los accesorios ya están dibujados en src/mascota/mascotas.js.
--
-- NADA SE QUITA: los colores de pelaje y ojos que hoy existen siguen gratis
-- (eran gratis; cobrar por algo que ya era de alguien es quitárselo). Los
-- cristales, los niveles y las piezas de figura que cada quien ya compró
-- quedan intactos. Esto solo AÑADE: dos columnas y tres funciones.
--
-- Mismo trato que las piezas de avatar (0153): el saldo se descuenta en la
-- misma sentencia que comprueba que alcanza y que no está repetido, así que dos
-- toques seguidos no cobran dos veces ni dejan el saldo en negativo. La compra
-- queda en el libro cristal_movimiento, con signo negativo.
--
-- Rango del coordinador (0150-0199). Aditivo e idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Lo que tiene y lo que lleva puesto ───────────────────────────────────
alter table public.profiles add column if not exists mascota_accesorios text[] not null default '{}';
alter table public.profiles add column if not exists mascota_puestos    text[] not null default '{}';

comment on column public.profiles.mascota_accesorios is
'Accesorios de la mascota que el estudiante COMPRÓ (0165). Se llena solo por mascota_accesorio_comprar().';
comment on column public.profiles.mascota_puestos is
'Accesorios que la mascota lleva PUESTOS ahora (0165). Subconjunto de los comprados. Lo cambia mascota_accesorio_equipar().';

-- ── 2. El precio de cada accesorio ──────────────────────────────────────────
-- En cristales. Están también en src/cristales/cristales.js (PRECIO_ACCESORIO),
-- y cristales.test.mjs lee este archivo para que los dos lados no se separen.
create or replace function public.precio_accesorio(p_clave text)
returns integer
language sql
immutable
set search_path = public
as $$
  select case p_clave
    when 'gorro'   then 60
    when 'gafas'   then 40
    when 'bufanda' then 45
    when 'mono'    then 50
    when 'bigote'  then 35
    else null
  end;
$$;

-- ── 3. Comprar un accesorio ─────────────────────────────────────────────────
create or replace function public.mascota_accesorio_comprar(p_clave text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid    := auth.uid();
  v_precio integer := public.precio_accesorio(p_clave);
  v_fila   public.profiles;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para comprar' using errcode = '42501';
  end if;
  if v_precio is null then
    raise exception 'Ese accesorio no existe: %', p_clave using errcode = '22023';
  end if;

  update public.profiles
     set cristales_balance  = cristales_balance - v_precio,
         mascota_accesorios = mascota_accesorios || p_clave
   where user_id = v_uid
     and cristales_balance >= v_precio
     and not (p_clave = any (mascota_accesorios))
  returning * into v_fila;

  if v_fila.user_id is null then
    -- No alcanza, ya lo tenía, o no hay perfil: el cliente ya sabe saldo y lo
    -- que tiene, así que si llegó con el botón encendido es que su copia estaba
    -- vieja. Un solo mensaje, como en las piezas de avatar.
    raise exception 'No se pudo comprar «%» (saldo insuficiente o ya comprado)', p_clave
      using errcode = '22023';
  end if;

  insert into public.cristal_movimiento (user_id, clave, cristales, motivo)
  values (v_uid, 'accesorio-' || p_clave, -v_precio, 'Accesorio ' || p_clave || ' de la mascota')
  on conflict (user_id, clave) do nothing;

  return v_fila;
end;
$$;

-- ── 4. Poner o quitar un accesorio (solo si es suyo) ────────────────────────
create or replace function public.mascota_accesorio_equipar(p_clave text, p_poner boolean)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_fila public.profiles;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión' using errcode = '42501';
  end if;

  if p_poner then
    -- Ponerlo: solo si lo compró. Sin duplicarlo si ya estaba puesto.
    update public.profiles
       set mascota_puestos = (select array(select distinct unnest(mascota_puestos || p_clave)))
     where user_id = v_uid
       and p_clave = any (mascota_accesorios)
    returning * into v_fila;
    if v_fila.user_id is null then
      raise exception 'No tienes ese accesorio todavía' using errcode = '22023';
    end if;
  else
    -- Quitarlo: siempre se puede, aunque ya no estuviera.
    update public.profiles
       set mascota_puestos = array_remove(mascota_puestos, p_clave)
     where user_id = v_uid
    returning * into v_fila;
  end if;

  return v_fila;
end;
$$;

-- ── 5. Permisos: solo usuarios con sesión ───────────────────────────────────
revoke all on function public.precio_accesorio(text)                    from public, anon;
revoke all on function public.mascota_accesorio_comprar(text)           from public, anon;
revoke all on function public.mascota_accesorio_equipar(text, boolean)  from public, anon;
grant execute on function public.precio_accesorio(text)                   to authenticated;
grant execute on function public.mascota_accesorio_comprar(text)          to authenticated;
grant execute on function public.mascota_accesorio_equipar(text, boolean) to authenticated;
