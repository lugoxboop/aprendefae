-- ═══════════════════════════════════════════════════════════════════════════
-- 0258 — LA MASCOTA
--
-- La Etapa 1 del sistema de mascotas: cada estudiante elige una criatura
-- (perro, gato, hámster o hurón) y le pone nombre. Es la evolución del avatar
-- de la 0035 y sigue su mismo molde, por las mismas razones:
--
--   · Dos columnas nuevas en el perfil, NULL hasta que el estudiante elija.
--     NULL es la señal de «todavía no tiene mascota» que usa la compuerta del
--     registro para pedírsela —a los nuevos al entrar, a los ya activos la
--     próxima vez—.
--   · Se LEEN desde el cliente (RLS ya limita a la fila propia; van en
--     COLUMNAS_PERFIL) y se ESCRIBEN solo por mascota_elegir(), que valida.
--     No hay grant de escritura por columna: igual que el avatar.
--
-- Esto NO toca los FP, ni los Cristales, ni el avatar: solo añade. Nada se
-- borra, así que es reversible. Va después de la 0257. Idempotente.
--
-- Las especies válidas son las mismas que ESPECIES de src/mascota/mascotas.js,
-- y mascota.test.mjs LEE este archivo para que los dos lados no se separen —el
-- mismo trato que avatar.test.mjs le da a las formas y paletas del avatar—.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Las columnas del perfil ──────────────────────────────────────────────
alter table public.profiles
  add column if not exists mascota_especie text,
  add column if not exists mascota_nombre  text;

comment on column public.profiles.mascota_especie is
'Especie de la mascota (0258): perro, gato, hamster o huron. NULL = el estudiante todavía no la ha elegido; la compuerta del registro lo detecta y se la pide. La escribe mascota_elegir(); el cliente no tiene grant sobre esta columna.';
comment on column public.profiles.mascota_nombre is
'Nombre que el estudiante le puso a su mascota (0258). De 1 a 16 caracteres. NULL hasta que la elige.';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_mascota_especie_valida') then
    alter table public.profiles add constraint profiles_mascota_especie_valida
      check (mascota_especie is null or mascota_especie in ('perro', 'gato', 'hamster', 'huron'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_mascota_nombre_len') then
    alter table public.profiles add constraint profiles_mascota_nombre_len
      check (mascota_nombre is null or char_length(mascota_nombre) between 1 and 16);
  end if;
end;
$$;

-- ── 2. Elegir y nombrar ─────────────────────────────────────────────────────
/*
 * El guardado del paso de registro. A diferencia de avatar_elegir —que manda
 * solo lo que cambió—, aquí las dos cosas llegan juntas y son obligatorias: no
 * tiene sentido una mascota sin especie o sin nombre. El nombre se recorta y se
 * comprueba su largo acá, igual que el apodo se comprueba en la base.
 *
 * Es definer y la comprobación de la sesión va dentro, como las de la 0035.
 */
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

  if p_especie is null or p_especie not in ('perro', 'gato', 'hamster', 'huron') then
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

-- ── 3. Permisos ─────────────────────────────────────────────────────────────
/*
 * La del estudiante, como avatar_elegir: fuera de anon, dentro de authenticated.
 * Y ningún grant de escritura sobre las columnas nuevas de profiles.
 */
revoke all on function public.mascota_elegir(text, text) from public, anon;
grant execute on function public.mascota_elegir(text, text) to authenticated;
