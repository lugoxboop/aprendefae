-- ═══════════════════════════════════════════════════════════════════════════
-- 0162 — COLORES DE PELAJE REAL PARA LA MASCOTA
--
-- GUARDIAN: cambio de esquema a proposito
--
-- Las paletas de la 0161 (azul, rosa, menta, lila, durazno, carbon) eran colores
-- de fantasía: un gato morado se veía mal. Se reemplazan por colores de PELAJE
-- REAL —arena, canela, chocolate, gris, negro, jengibre—, los mismos que hay en
-- PALETAS_MASCOTA de src/mascota/mascotas.js, y que mascota.test.mjs lee de este
-- archivo para que no se separen.
--
-- Va en el rango del coordinador (0150-0199) porque cambia el check del perfil.
-- Aditivo en lo que importa: no borra ninguna fila. Lo que hace con los datos es
-- REMAPEAR el color viejo de cada quien al nuevo más cercano, antes de cambiar el
-- check, para que ninguna fila quede fuera. Idempotente. Depende de la 0161.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Quitar el check viejo PRIMERO ─────────────────────────────────────────
-- El check viejo solo admite los colores viejos (azul, rosa, …). Si remapeáramos
-- con él aún puesto, rechazaría cada valor nuevo (negro, gris, …) en pleno
-- camino: con la tabla vacía (CI) no se nota, pero con filas reales revienta.
-- Por eso el check se quita antes de tocar los datos.
alter table public.profiles drop constraint if exists profiles_mascota_paleta_valida;

-- ── 2. Remapear los colores viejos al pelaje real más cercano ────────────────
-- Biyección: cada viejo cae en uno nuevo. Ya sin check que estorbe.
update public.profiles set mascota_paleta = case mascota_paleta
    when 'azul'    then 'gris'
    when 'rosa'    then 'arena'
    when 'menta'   then 'jengibre'
    when 'lila'    then 'chocolate'
    when 'durazno' then 'canela'
    when 'carbon'  then 'negro'
    else mascota_paleta
  end
  where mascota_paleta in ('azul', 'rosa', 'menta', 'lila', 'durazno', 'carbon');

-- ── 3. Poner el check nuevo, ya con los datos remapeados ─────────────────────
alter table public.profiles add constraint profiles_mascota_paleta_valida
  check (mascota_paleta is null or mascota_paleta in ('arena', 'canela', 'chocolate', 'gris', 'negro', 'jengibre'));

comment on column public.profiles.mascota_paleta is
'Paleta de color de la mascota (0162): arena, canela, chocolate, gris, negro o jengibre (pelaje real). NULL = «natural», el color propio de la especie. La escribe mascota_personalizar().';

-- ── 3. El RPC valida contra la lista nueva ───────────────────────────────────
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

  if v_paleta is not null and v_paleta not in ('arena', 'canela', 'chocolate', 'gris', 'negro', 'jengibre') then
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
