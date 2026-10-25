-- ---------------------------------------------------------------------------
-- 0153 — UNA PIEZA DE APRENDER QUEDA COMO HECHA
--
-- #576 (Célula E): el Repaso solo enseña ítems de actividades hechas, y «hecha»
-- era tener una fila en fp_history. Aprender no da FP, así que una pieza de
-- Aprender nunca quedaba hecha y las cuatro «En una frase» de T3 —que salen de
-- piezas de Aprender— no le salían a nadie.
--
-- ADITIVA. NO TOCA NADA DE LO QUE YA HAY:
--   1. Una tabla NUEVA, aprender_hecho: una fila por estudiante y pieza, la
--      primera vez que llega a su cierre. Sin FP, sin puntaje.
--   2. registrar_aprender(materia, pieza): la escribe el propio estudiante
--      (auth.uid()), una vez; repetir no hace nada.
--   3. aprender_hechas(): lo que el estudiante ha visto, para que el cliente
--      del Repaso lo junte con actividades_hechas().
--   actividades_hechas() NO se toca: la medalla de «Materia completa» y todo
--   lo que la lee siguen contando solo lo que dio FP.
--
-- La pieza no se valida contra actividad_catalogo porque el catálogo es de lo
-- que paga FP y las piezas de Aprender no están. Se valida la forma del id y
-- la materia. Lo peor que puede hacer un id inventado es añadirse una fila a
-- sí mismo que no corresponde a ningún ítem: no cambia nada a nadie más.
--
-- CÓMO SE DESHACE: supabase/reversiones/0153_aprender_hecho_deshacer.sql,
-- que copia las filas antes de quitar las dos funciones y la tabla, y trae su
-- consulta de comprobación.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final devuelve true, true, true y
-- el número de piezas vistas (0 al aplicarla).
--
-- GUARDIAN: cambio de esquema a proposito
-- ---------------------------------------------------------------------------

create table if not exists public.aprender_hecho (
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject_id  text not null,
  activity_id text not null,
  hecho_en    timestamptz not null default now(),
  primary key (user_id, activity_id)
);

alter table public.aprender_hecho enable row level security;
alter table public.aprender_hecho force row level security;
-- Sin políticas: solo la escriben y leen las dos funciones de abajo.

create or replace function public.registrar_aprender(p_subject_id text, p_activity_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para registrar Aprender' using errcode = '42501';
  end if;
  if p_subject_id is null or p_subject_id not in ('macroeconomia', 'contabilidad', 'pensamiento-estrategico') then
    raise exception 'Materia desconocida: %', p_subject_id using errcode = '22023';
  end if;
  if p_activity_id is null or p_activity_id !~ '^[a-z0-9][a-z0-9-]{2,79}$' then
    raise exception 'Id de pieza con forma inválida' using errcode = '22023';
  end if;
  insert into public.aprender_hecho (user_id, subject_id, activity_id)
  values (v_uid, p_subject_id, p_activity_id)
  on conflict (user_id, activity_id) do nothing;
end;
$$;

create or replace function public.aprender_hechas()
returns table (subject_id text, activity_id text)
language sql
security definer
set search_path = public
stable
as $$
  select a.subject_id, a.activity_id
    from public.aprender_hecho a
   where a.user_id = auth.uid();
$$;

revoke all on function public.registrar_aprender(text, text) from public, anon;
revoke all on function public.aprender_hechas() from public, anon;
grant execute on function public.registrar_aprender(text, text) to authenticated;
grant execute on function public.aprender_hechas() to authenticated;

-- ---------------------------------------------------------------------------
-- Comprobación: tabla con RLS forzada, las dos funciones, y cuántas filas hay.
-- ---------------------------------------------------------------------------
select (select relrowsecurity and relforcerowsecurity from pg_class where oid = 'public.aprender_hecho'::regclass) as rls_forzada,
       exists (select 1 from pg_proc where proname = 'registrar_aprender')                                   as hay_registrar,
       exists (select 1 from pg_proc where proname = 'aprender_hechas')                                      as hay_lectura,
       (select count(*) from public.aprender_hecho)                                                          as piezas_vistas;
