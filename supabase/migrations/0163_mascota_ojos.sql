-- ═══════════════════════════════════════════════════════════════════════════
-- 0163 — EL COLOR DE LOS OJOS DE LA MASCOTA
--
-- GUARDIAN: cambio de esquema a proposito
--
-- Otra dimensión de personalización, aparte del pelaje: el color de los ojos.
-- Así un gato negro puede tener ojos azules, o un hurón jengibre ojos verdes.
-- Los válidos son los de IDS_OJOS en src/mascota/mascotas.js (ambar, miel, azul,
-- verde, gris), y mascota.test.mjs lee este archivo para que no se separen.
--
-- Como el color del pelaje (0161/0162): una columna que se LEE desde el cliente
-- y se ESCRIBE solo por su función. NULL = «natural», los ojos oscuros de
-- siempre. Va en el rango del coordinador (0150-0199) porque toca el esquema.
-- Aditivo y reversible: no toca nada de lo que ya hay. Idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. La columna ───────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists mascota_ojos text;

comment on column public.profiles.mascota_ojos is
'Color de los ojos de la mascota (0163): ambar, miel, azul, verde o gris. NULL = «natural», ojos oscuros. La escribe mascota_ojos_elegir().';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_mascota_ojos_valida') then
    alter table public.profiles add constraint profiles_mascota_ojos_valida
      check (mascota_ojos is null or mascota_ojos in ('ambar', 'miel', 'azul', 'verde', 'gris'));
  end if;
end;
$$;

-- ── 2. Cambiar el color de ojos ─────────────────────────────────────────────
/*
 * Como mascota_personalizar, pero para los ojos. Solo con una mascota ya creada.
 * 'natural' (o NULL) devuelve los ojos oscuros de siempre.
 */
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

  if v_ojos is not null and v_ojos not in ('ambar', 'miel', 'azul', 'verde', 'gris') then
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

-- ── 3. Permisos ─────────────────────────────────────────────────────────────
revoke all on function public.mascota_ojos_elegir(text) from public, anon;
grant execute on function public.mascota_ojos_elegir(text) to authenticated;
