-- ---------------------------------------------------------------------------
-- 0009 — Hechos para las medallas.
--
-- Devuelve DATOS, no medallas. El catálogo de las 24 vive en el cliente
-- (src/data/medallas.js), que es donde se decide qué marco y qué icono lleva
-- cada una; aquí solo salen los hechos que hacen falta para saber cuáles están
-- ganadas. Así, añadir una medalla que se apoye en los mismos hechos no obliga
-- a tocar la base.
--
-- Todo se reconstruye de lo ya guardado: no hay tabla de logros otorgados. Si
-- un criterio cambia, cambia esta función y todos quedan recalculados, en vez
-- de arrastrar filas concedidas con una regla vieja.
-- ---------------------------------------------------------------------------

create or replace function public.logros()
returns table (
  hizo_algo           boolean,
  hizo_evaluativa     boolean,
  quiz_perfecto       boolean,
  entro_a_liga        boolean,
  mejor_posicion      integer,   -- la mejor posición lograda en un ciclo cerrado
  primero_de_liga     boolean,
  primero_semestre    boolean,
  mejor_racha         integer
)
language plpgsql
security definer
set search_path = public
stable
as $$
#variable_conflict use_column
declare
  v_uid    uuid := auth.uid();
  v_ciclo  date := public.ciclo_actual();
  v_inicio date := public.ajuste_fecha('semestre_inicio', '2026-08-01');
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para ver tus logros' using errcode = '42501';
  end if;

  return query
  with
  /* Ciclos ya cerrados. El que está en curso todavía no cuenta para nada. */
  ciclos as (
    select distinct m.subject_id, m.ciclo
      from public.liga_membresia m
     where m.ciclo < v_ciclo
  ),
  mios as (
    select c.subject_id, c.ciclo, r.posicion
      from ciclos c
      cross join lateral public.liga_resultados(c.subject_id, c.ciclo) r
     where r.user_id = v_uid
  ),
  actividad as (
    select
      count(*) > 0 as hubo,
      count(*) filter (where h.modality = 'evaluativa') > 0 as hubo_eval,
      /*
       * Quiz perfecto: 100% de aciertos en CUALQUIER evaluativa. Es más ancho
       * que la maestría, que además exige dificultad alta.
       */
      count(*) filter (where h.modality = 'evaluativa' and h.correct_pct >= 100) > 0 as perfecto
    from public.fp_history h
    where h.user_id = v_uid
  )
  select
    a.hubo,
    a.hubo_eval,
    a.perfecto,
    exists (select 1 from public.liga_membresia m where m.user_id = v_uid),
    (select min(m.posicion)::integer from mios m),
    exists (select 1 from mios m where m.posicion = 1),
    /* Por materia, nunca combinado: basta con haber sido primero en alguna. */
    exists (select 1 from mios m where m.posicion = 1 and m.ciclo >= v_inicio),
    coalesce((select p.best_streak from public.profiles p where p.user_id = v_uid), 0)
  from actividad a;
end;
$$;

revoke all on function public.logros() from public, anon;
grant execute on function public.logros() to authenticated;

-- ---------------------------------------------------------------------------
-- La prueba de punta a punta de la racha vive en supabase/tests/racha_test.sql.
-- Se corre aparte, en el editor SQL, y termina en ROLLBACK sin dejar rastro.
-- ---------------------------------------------------------------------------
