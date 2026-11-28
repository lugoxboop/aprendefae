-- ═══════════════════════════════════════════════════════════════════════════
-- 0178 — CAJAS SORPRESA DE COSMÉTICOS
--
-- GUARDIAN: cambio de esquema a proposito (añade una tabla y tres funciones;
-- no toca columnas ni filas existentes)
--
-- Mateo (28-nov): cajas en la tienda —Normal, Rara y Legendaria— que sueltan
-- un cosmético de rareza Normal, Raro, Épico, Legendario o Élite.
--
-- Cómo funciona:
--   · Se paga con los MISMOS Cristales de la tienda.
--   · El SERVIDOR sortea la rareza con las probabilidades de cada caja (por
--     mil, ver caja_probabilidad) y luego un cosmético de esa rareza, al azar
--     y parejo. El cliente solo anima lo que la base ya decidió.
--   · El cosmético se guarda en profiles.mascota_accesorios, igual que un
--     accesorio comprado: se pone y se quita con mascota_accesorio_equipar
--     (0165), que solo pide que sea suyo.
--   · Si sale uno que ya tenía, se le devuelven Cristales (caja_reembolso).
--   · El cobro, el premio y el reembolso van en UNA sentencia, con la
--     condición de saldo dentro: dos toques seguidos no cobran dos veces ni
--     dejan el saldo en negativo. Todo queda en cristal_movimiento y en
--     caja_apertura (el historial de cada quien).
--
-- NADA SE QUITA: los accesorios de la tienda, sus precios, lo que cada uno
-- compró o lleva puesto, sigue igual. Los cosméticos de caja NO tienen precio
-- en precio_accesorio: no se compran sueltos.
--
-- El catálogo y las probabilidades están también en el cliente
-- (src/mascota/cosmeticos-caja.js y src/cajas/cajas.js); cajas.test.mjs lee
-- este archivo y falla si los dos lados se separan.
--
-- Rango del coordinador (0150-0199). Aditivo e idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. El historial de aperturas ────────────────────────────────────────────
create table if not exists public.caja_apertura (
  id         bigint generated always as identity primary key,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  caja       text        not null,
  cosmetico  text        not null,
  rareza     text        not null,
  repetido   boolean     not null default false,
  reembolso  integer     not null default 0,
  precio     integer     not null,
  creado_en  timestamptz not null default now()
);
create index if not exists caja_apertura_user_idx on public.caja_apertura (user_id, creado_en desc);

alter table public.caja_apertura enable row level security;
drop policy if exists caja_apertura_propia on public.caja_apertura;
create policy caja_apertura_propia on public.caja_apertura
  for select to authenticated using (user_id = auth.uid());
revoke all on public.caja_apertura from anon;
grant select on public.caja_apertura to authenticated;

comment on table public.caja_apertura is
'Cada caja sorpresa abierta (0178): qué caja, qué salió, si era repetido y cuánto se devolvió. Solo la llena caja_abrir().';

-- ── 2. Precio de cada caja ──────────────────────────────────────────────────
create or replace function public.precio_caja(p_caja text)
returns integer
language sql
immutable
set search_path = public
as $$
  select case p_caja
    when 'normal'     then 40
    when 'rara'       then 90
    when 'legendaria' then 180
    else null
  end;
$$;

-- ── 3. Probabilidad de cada rareza en cada caja, por mil ────────────────────
create or replace function public.caja_probabilidad(p_caja text, p_rareza text)
returns integer
language sql
immutable
set search_path = public
as $$
  select case p_caja || ':' || p_rareza
    when 'normal:normal'         then 700
    when 'normal:raro'           then 220
    when 'normal:epico'          then 65
    when 'normal:legendario'     then 13
    when 'normal:elite'          then 2
    when 'rara:normal'           then 350
    when 'rara:raro'             then 400
    when 'rara:epico'            then 180
    when 'rara:legendario'       then 60
    when 'rara:elite'            then 10
    when 'legendaria:normal'     then 0
    when 'legendaria:raro'       then 350
    when 'legendaria:epico'      then 400
    when 'legendaria:legendario' then 200
    when 'legendaria:elite'      then 50
    else 0
  end;
$$;

-- ── 4. Lo que se devuelve por un repetido ───────────────────────────────────
create or replace function public.caja_reembolso(p_rareza text)
returns integer
language sql
immutable
set search_path = public
as $$
  select case p_rareza
    when 'normal'     then 8
    when 'raro'       then 18
    when 'epico'      then 40
    when 'legendario' then 90
    when 'elite'      then 150
    else 0
  end;
$$;

-- ── 5. Los cosméticos de cada rareza ────────────────────────────────────────
create or replace function public.caja_cosmeticos(p_rareza text)
returns text[]
language sql
immutable
set search_path = public
as $$
  select case p_rareza
    when 'normal' then array[
      'c_gorro_carmesi', 'c_gorro_menta', 'c_gorra_cielo', 'c_gorra_limon', 'c_mono_lavanda', 'c_mono_cielo',
      'c_bufanda_menta', 'c_bufanda_chicle', 'c_gafas_chicle', 'c_collar_lavanda', 'c_corbatin_carmesi',
      'c_corbata_bosque', 'c_mochila_naranja', 'c_gafas_sol_cielo']
    when 'raro' then array[
      'c_vaquero_carbon', 'c_pirata_carmesi', 'c_audifonos_chicle', 'c_audifonos_menta', 'c_antifaz_carbon',
      'c_gafas_sol_naranja', 'c_parche_lavanda', 'c_traje_cielo', 'c_capa_bosque', 'c_capa_lavanda',
      'c_mochila_carbon', 'aura_chispas']
    when 'epico' then array[
      'c_mago_galaxia', 'c_casco_hielo', 'c_birrete_plata', 'c_corona_plata', 'c_alas_hielo', 'c_capa_galaxia',
      'c_jetpack_plata', 'c_gafas_sol_galaxia', 'aura_burbujas', 'aura_copos']
    when 'legendario' then array[
      'c_corona_oro', 'c_alas_oro', 'c_capa_rubi', 'c_jetpack_lava', 'c_casco_esmeralda', 'c_vaquero_oro',
      'aura_fuego', 'aura_estrellas']
    when 'elite' then array[
      'c_corona_prisma', 'c_alas_prisma', 'c_capa_eclipse', 'c_mago_eclipse', 'aura_prisma']
    else array[]::text[]
  end;
$$;

-- ── 6. Abrir una caja ───────────────────────────────────────────────────────
create or replace function public.caja_abrir(p_caja text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid       uuid    := auth.uid();
  v_precio    integer := public.precio_caja(p_caja);
  v_tiro      integer;
  v_acum      integer := 0;
  v_rareza    text;
  v_lista     text[];
  v_cosmetico text;
  v_repetido  boolean;
  v_reembolso integer := 0;
  v_fila      public.profiles;
  v_id        bigint;
  r           text;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para abrir una caja' using errcode = '42501';
  end if;
  if v_precio is null then
    raise exception 'Esa caja no existe: %', p_caja using errcode = '22023';
  end if;

  -- La rareza: un número de 0 a 999 contra las probabilidades acumuladas.
  v_tiro := floor(random() * 1000)::integer;
  foreach r in array array['normal', 'raro', 'epico', 'legendario', 'elite'] loop
    v_acum := v_acum + public.caja_probabilidad(p_caja, r);
    if v_tiro < v_acum then
      v_rareza := r;
      exit;
    end if;
  end loop;
  if v_rareza is null then
    v_rareza := 'elite';
  end if;

  -- El cosmético: uno de esa rareza, parejo.
  v_lista := public.caja_cosmeticos(v_rareza);
  v_cosmetico := v_lista[1 + floor(random() * array_length(v_lista, 1))::integer];

  select (v_cosmetico = any (mascota_accesorios)) into v_repetido
    from public.profiles where user_id = v_uid;
  if v_repetido then
    v_reembolso := public.caja_reembolso(v_rareza);
  end if;

  -- Cobro, premio y reembolso en una sola sentencia, con la condición de saldo.
  update public.profiles
     set cristales_balance  = cristales_balance - v_precio + v_reembolso,
         mascota_accesorios = case when v_cosmetico = any (mascota_accesorios)
                                   then mascota_accesorios
                                   else mascota_accesorios || v_cosmetico end
   where user_id = v_uid
     and cristales_balance >= v_precio
  returning * into v_fila;

  if v_fila.user_id is null then
    raise exception 'No se pudo abrir la caja «%» (saldo insuficiente)', p_caja using errcode = '22023';
  end if;

  insert into public.caja_apertura (user_id, caja, cosmetico, rareza, repetido, reembolso, precio)
  values (v_uid, p_caja, v_cosmetico, v_rareza, coalesce(v_repetido, false), v_reembolso, v_precio)
  returning id into v_id;

  insert into public.cristal_movimiento (user_id, clave, cristales, motivo)
  values (v_uid, 'caja-' || v_id, -v_precio + v_reembolso,
          'Caja ' || p_caja || ': ' || v_cosmetico || case when v_repetido then ' (repetido, devuelve ' || v_reembolso || ')' else '' end)
  on conflict (user_id, clave) do nothing;

  return jsonb_build_object(
    'perfil', to_jsonb(v_fila),
    'cosmetico', v_cosmetico,
    'rareza', v_rareza,
    'repetido', coalesce(v_repetido, false),
    'reembolso', v_reembolso
  );
end;
$$;

-- ── 7. Permisos: solo usuarios con sesión ───────────────────────────────────
revoke all on function public.precio_caja(text)               from public, anon;
revoke all on function public.caja_probabilidad(text, text)   from public, anon;
revoke all on function public.caja_reembolso(text)            from public, anon;
revoke all on function public.caja_cosmeticos(text)           from public, anon;
revoke all on function public.caja_abrir(text)                from public, anon;
grant execute on function public.precio_caja(text)              to authenticated;
grant execute on function public.caja_probabilidad(text, text)  to authenticated;
grant execute on function public.caja_reembolso(text)           to authenticated;
grant execute on function public.caja_cosmeticos(text)          to authenticated;
grant execute on function public.caja_abrir(text)               to authenticated;
