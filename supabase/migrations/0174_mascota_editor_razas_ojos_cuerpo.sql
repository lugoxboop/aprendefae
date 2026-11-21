-- ═══════════════════════════════════════════════════════════════════════════
-- 0174 — EL EDITOR DE LA MASCOTA: RAZAS, OJOS Y CUERPO A MEDIDA
--
-- GUARDIAN: cambio de esquema a proposito (amplía dos checks, añade dos columnas con su check y una función; no toca filas)
--
-- Mateo, 21-nov: «los colores son demasiado generales, más razas; que se le
-- pueda cambiar la tonalidad de los ojos; que lo puedan hacer más gordito o
-- más flaquito». Tres cosas, todas ADITIVAS:
--
--   1. mascota_paleta acepta los pelajes de razas reales (Rottweiler, Husky,
--      Azul ruso, Qinling…). Las seis de la 0162 siguen valiendo: nadie
--      pierde su color.
--   2. mascota_ojos acepta más colores reales (avellana, dorado, cobre, azul
--      hielo, esmeralda, rubí) y la heterocromía («bicolor»). Los de la 0163
--      siguen valiendo.
--   3. Dos columnas nuevas, mascota_complexion y mascota_cabeza, de -2 a 2
--      (0 = como viene; NULL se lee como 0). Las escribe mascota_ajustar().
--
-- Rango del coordinador (0150-0199). Idempotente. Ninguna fila se modifica.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.profiles drop constraint if exists profiles_mascota_paleta_valida;
alter table public.profiles add constraint profiles_mascota_paleta_valida
  check (mascota_paleta is null or mascota_paleta in ('arena', 'canela', 'chocolate', 'gris', 'negro', 'jengibre', 'crema', 'blanco', 'setter', 'rojizo', 'negro_fuego', 'husky', 'plata', 'azul', 'lila', 'bengali', 'champan', 'plateado', 'aguti', 'qinling'));

comment on column public.profiles.mascota_paleta is
'Pelaje de la mascota (0162, ampliado en 0174 con razas reales). NULL = «natural», el arte de la especie. La escribe mascota_personalizar().';

create or replace function public.mascota_personalizar(p_paleta text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_paleta text := nullif(p_paleta, 'natural');
  v_fila   public.profiles;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para personalizar tu mascota' using errcode = '42501';
  end if;

  if v_paleta is not null and v_paleta not in ('arena', 'canela', 'chocolate', 'gris', 'negro', 'jengibre', 'crema', 'blanco', 'setter', 'rojizo', 'negro_fuego', 'husky', 'plata', 'azul', 'lila', 'bengali', 'champan', 'plateado', 'aguti', 'qinling') then
    raise exception 'Paleta de mascota desconocida: %', p_paleta using errcode = '22023';
  end if;

  update public.profiles
     set mascota_paleta = v_paleta
   where user_id = v_uid
     and mascota_especie is not null
  returning * into v_fila;

  if v_fila.user_id is null then
    raise exception 'No hay mascota a la que cambiarle el color' using errcode = '22023';
  end if;

  return v_fila;
end;
$$;

revoke all on function public.mascota_personalizar(text) from public, anon;
grant execute on function public.mascota_personalizar(text) to authenticated;

alter table public.profiles drop constraint if exists profiles_mascota_ojos_valida;
alter table public.profiles add constraint profiles_mascota_ojos_valida
  check (mascota_ojos is null or mascota_ojos in ('ambar', 'miel', 'azul', 'verde', 'gris', 'avellana', 'dorado', 'cobre', 'hielo', 'esmeralda', 'rubi', 'bicolor'));

comment on column public.profiles.mascota_ojos is
'Color de los ojos de la mascota (0163, ampliado en 0174). NULL = «natural», los de la ilustración. La escribe mascota_ojos_elegir().';

create or replace function public.mascota_ojos_elegir(p_ojos text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_ojos text := nullif(p_ojos, 'natural');
  v_fila public.profiles;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para cambiar los ojos de tu mascota' using errcode = '42501';
  end if;

  if v_ojos is not null and v_ojos not in ('ambar', 'miel', 'azul', 'verde', 'gris', 'avellana', 'dorado', 'cobre', 'hielo', 'esmeralda', 'rubi', 'bicolor') then
    raise exception 'Color de ojos desconocido: %', p_ojos using errcode = '22023';
  end if;

  update public.profiles
     set mascota_ojos = v_ojos
   where user_id = v_uid
     and mascota_especie is not null
  returning * into v_fila;

  if v_fila.user_id is null then
    raise exception 'No hay mascota a la que cambiarle los ojos' using errcode = '22023';
  end if;

  return v_fila;
end;
$$;

revoke all on function public.mascota_ojos_elegir(text) from public, anon;
grant execute on function public.mascota_ojos_elegir(text) to authenticated;

-- El cuerpo a medida: complexión (flaquito … gordito) y tamaño de cabeza.
alter table public.profiles add column if not exists mascota_complexion smallint;
alter table public.profiles add column if not exists mascota_cabeza smallint;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_mascota_complexion_valida') then
    alter table public.profiles add constraint profiles_mascota_complexion_valida
      check (mascota_complexion is null or mascota_complexion between -2 and 2);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_mascota_cabeza_valida') then
    alter table public.profiles add constraint profiles_mascota_cabeza_valida
      check (mascota_cabeza is null or mascota_cabeza between -2 and 2);
  end if;
end;
$$;

comment on column public.profiles.mascota_complexion is
'Complexión de la mascota (0174): -2 flaquito … 2 gordito. NULL = 0, como viene. La escribe mascota_ajustar().';
comment on column public.profiles.mascota_cabeza is
'Tamaño de cabeza de la mascota (0174): -2 pequeña … 2 cabezón. NULL = 0. La escribe mascota_ajustar().';

/*
 * Como mascota_personalizar, para el cuerpo. Solo con una mascota ya creada.
 * Los dos valores van juntos; 0 guarda NULL (como viene).
 */
create or replace function public.mascota_ajustar(p_complexion integer, p_cabeza integer)
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
    raise exception 'Se requiere sesión para ajustar tu mascota' using errcode = '42501';
  end if;

  if coalesce(p_complexion, 0) not between -2 and 2 or coalesce(p_cabeza, 0) not between -2 and 2 then
    raise exception 'Ajuste fuera de rango (de -2 a 2)' using errcode = '22023';
  end if;

  update public.profiles
     set mascota_complexion = nullif(coalesce(p_complexion, 0), 0),
         mascota_cabeza     = nullif(coalesce(p_cabeza, 0), 0)
   where user_id = v_uid
     and mascota_especie is not null
  returning * into v_fila;

  if v_fila.user_id is null then
    raise exception 'No hay mascota que ajustar' using errcode = '22023';
  end if;

  return v_fila;
end;
$$;

revoke all on function public.mascota_ajustar(integer, integer) from public, anon;
grant execute on function public.mascota_ajustar(integer, integer) to authenticated;
