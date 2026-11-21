-- ═══════════════════════════════════════════════════════════════════════════
-- 0173 — EL PANDA, SÉPTIMA MASCOTA
--
-- GUARDIAN: cambio de esquema a proposito (amplía un check y redefine una función; no toca filas)
--
-- Mateo, 20-nov: «pídele a Gemini diseños para hacer un panda e integrarlo».
-- Dos cosas, como aprendimos con el zorro y el conejo (0168 + 0171): el check
-- de profiles.mascota_especie y la lista propia de mascota_elegir. Las dos
-- solo AÑADEN 'panda': nadie pierde su mascota ni se toca ninguna fila.
--
-- Rango del coordinador (0150-0199). Aditivo e idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.profiles drop constraint if exists profiles_mascota_especie_valida;
alter table public.profiles add constraint profiles_mascota_especie_valida
  check (mascota_especie is null or mascota_especie in ('perro', 'gato', 'hamster', 'huron', 'zorro', 'conejo', 'panda'));

create or replace function public.mascota_elegir(
  p_especie text,
  p_nombre  text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_nombre text := nullif(btrim(coalesce(p_nombre, '')), '');
  v_fila   public.profiles;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para elegir tu mascota' using errcode = '42501';
  end if;

  if p_especie is null or p_especie not in ('perro', 'gato', 'hamster', 'huron', 'zorro', 'conejo', 'panda') then
    raise exception 'Especie de mascota desconocida: %', p_especie using errcode = '22023';
  end if;

  if v_nombre is null or char_length(v_nombre) > 16 then
    raise exception 'El nombre de la mascota tiene que tener entre 1 y 16 caracteres' using errcode = '22023';
  end if;

  update public.profiles
     set mascota_especie = p_especie,
         mascota_nombre  = v_nombre
   where user_id = v_uid
  returning * into v_fila;

  if v_fila.user_id is null then
    raise exception 'No hay perfil al que ponerle mascota' using errcode = '22023';
  end if;

  return v_fila;
end;
$$;

revoke all on function public.mascota_elegir(text, text) from public, anon;
grant execute on function public.mascota_elegir(text, text) to authenticated;
