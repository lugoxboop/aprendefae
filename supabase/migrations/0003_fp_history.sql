-- Historial de FP: un registro por cada vez que se otorgan puntos.
--
-- El total vive en profiles.points, pero un contador no permite responder
-- "cuánto ganó hoy" ni "cuánto esta semana". Guardar cada otorgamiento con su
-- marca de tiempo evita tener que reconstruir el pasado cuando lleguen las
-- pantallas de ranking.

create table if not exists public.fp_history (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users (id) on delete cascade,
  activity_id  text not null,
  -- La materia se guarda desde el principio: sin ella no se puede calcular un
  -- ranking por materia, y añadirla después obligaría a rellenar el histórico.
  subject_id   text not null,
  fp_awarded   integer not null check (fp_awarded >= 0),
  -- Entradas del cálculo, para poder auditar por qué salió ese número.
  difficulty   text not null,
  modality     text not null,
  duration_ms  integer,
  correct_pct  numeric,
  repeat_index integer not null default 0 check (repeat_index >= 0),
  created_at   timestamptz not null default now()
);

-- Consultas por periodo (diario/semanal/semestre) y conteo de repeticiones.
create index if not exists fp_history_user_fecha_idx
  on public.fp_history (user_id, created_at desc);
create index if not exists fp_history_user_actividad_idx
  on public.fp_history (user_id, activity_id);

-- ---------------------------------------------------------------------------
-- Row Level Security, igual que en profiles.
--
-- Solo SELECT e INSERT sobre las filas propias. No hay políticas de UPDATE ni
-- DELETE a propósito: el historial es de solo añadir. Sin ellas, RLS bloquea
-- esas operaciones para cualquiera.
-- ---------------------------------------------------------------------------
alter table public.fp_history enable row level security;
alter table public.fp_history force row level security;

drop policy if exists "historial propio: leer" on public.fp_history;
create policy "historial propio: leer"
  on public.fp_history for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "historial propio: registrar" on public.fp_history;
create policy "historial propio: registrar"
  on public.fp_history for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Escritura atómica: historial + total del perfil en una sola transacción.
--
-- NO es security definer: corre con los permisos de quien llama, así que RLS
-- sigue aplicando y nadie puede tocar filas ajenas. El user_id no se recibe
-- por parámetro, se toma de auth.uid(), para que no se pueda suplantar.
--
-- Estar en una sola función evita el estado a medias (historial sin sumar al
-- total, o al revés) y la condición de carrera de leer-sumar-escribir points.
-- ---------------------------------------------------------------------------
create or replace function public.registrar_fp(
  p_activity_id  text,
  p_subject_id   text,
  p_fp           integer,
  p_difficulty   text,
  p_modality     text,
  p_duration_ms  integer,
  p_correct_pct  numeric,
  p_repeat_index integer
)
returns public.fp_history
language plpgsql
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_fila public.fp_history;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para registrar FP' using errcode = '42501';
  end if;

  insert into public.fp_history (
    user_id, activity_id, subject_id, fp_awarded,
    difficulty, modality, duration_ms, correct_pct, repeat_index
  )
  values (
    v_uid, p_activity_id, p_subject_id, greatest(p_fp, 0),
    p_difficulty, p_modality, p_duration_ms, p_correct_pct, greatest(p_repeat_index, 0)
  )
  returning * into v_fila;

  update public.profiles
     set points = points + greatest(p_fp, 0)
   where user_id = v_uid;

  return v_fila;
end;
$$;

-- Supabase concede EXECUTE a anon por privilegios por defecto: hay que
-- revocarlo explícitamente (revocar a PUBLIC no basta). Ver migración 0002.
revoke all on function public.registrar_fp(text, text, integer, text, text, integer, numeric, integer) from public;
revoke all on function public.registrar_fp(text, text, integer, text, text, integer, numeric, integer) from anon;
grant execute on function public.registrar_fp(text, text, integer, text, text, integer, numeric, integer) to authenticated;
