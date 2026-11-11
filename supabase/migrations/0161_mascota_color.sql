-- ═══════════════════════════════════════════════════════════════════════════
-- 0161 — EL COLOR DE LA MASCOTA
--
-- GUARDIAN: cambio de esquema a proposito
--
-- Etapa 1b: cada estudiante le cambia el color a su mascota, para que sea suya.
-- Va en el rango del coordinador (0150-0199) porque toca el esquema del perfil,
-- y lleva la marca de arriba por lo mismo.
--
-- Una columna más (mascota_paleta) y una función para cambiarla. Como el color
-- del avatar: se LEE desde el cliente, se ESCRIBE solo por mascota_personalizar().
-- NULL = «natural», el color propio de cada especie. Aditivo y reversible: no
-- toca nada de lo que ya hay. Solo depende de la 0160 (la mascota). Idempotente.
--
-- Las paletas válidas son las mismas de PALETAS_MASCOTA en src/mascota/mascotas.js,
-- y mascota.test.mjs lee este archivo para que no se separen.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. La columna ───────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists mascota_paleta text;

comment on column public.profiles.mascota_paleta is
'Paleta de color de la mascota (0161): azul, rosa, menta, lila, durazno o carbon. NULL = «natural», el color propio de la especie. La escribe mascota_personalizar().';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_mascota_paleta_valida') then
    alter table public.profiles add constraint profiles_mascota_paleta_valida
      check (mascota_paleta is null or mascota_paleta in ('azul', 'rosa', 'menta', 'lila', 'durazno', 'carbon'));
  end if;
end;
$$;

-- ── 2. Cambiar el color ─────────────────────────────────────────────────────
/*
 * Como avatar_elegir con la paleta: pinta primero en pantalla, guarda después.
 * Solo tiene sentido con una mascota ya creada —no se le pone color a lo que no
 * existe—, así que se exige. 'natural' (o NULL) devuelve el color de la especie.
 */
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

  if v_paleta is not null and v_paleta not in ('azul', 'rosa', 'menta', 'lila', 'durazno', 'carbon') then
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

-- ── 3. Permisos ─────────────────────────────────────────────────────────────
revoke all on function public.mascota_personalizar(text) from public, anon;
grant execute on function public.mascota_personalizar(text) to authenticated;
