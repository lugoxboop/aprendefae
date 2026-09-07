-- ---------------------------------------------------------------------------
-- DIAGNÓSTICO — cuántos estudiantes califican HOY para cada señal de Destacados.
--
-- NO ES UNA PRUEBA. No afirma nada ni falla: solo cuenta. Existe porque los
-- umbrales de Destacados están calibrados para un curso en marcha y el piloto
-- lleva días, así que conviene saber de antemano qué va a mostrar la sección
-- en vez de descubrirlo pensando que está rota.
--
-- SOLO LEE. Ni una escritura, ni una transacción que revertir. Se puede correr
-- cuantas veces se quiera y con el sitio en uso.
--
-- LAS TRES SEÑALES, con los umbrales aprobados:
--   Cabeza de la semana ... top 3 por FP del ciclo semanal en curso, fp > 0
--   Precisión sostenida ... media de acierto >= 85 sobre >= 4 evaluativas, 14 días
--   Constancia ............ actividad en >= 3 días distintos, 14 días
--
-- Se listan también los que se quedan CERCA, porque si Precisión da cero pero
-- hay cuatro personas con tres evaluativas al 90%, eso dice algo distinto de
-- que no haya nadie bueno: dice que todavía no han jugado bastante.
--
-- CÓMO SE CORRE: pegar el archivo completo en el editor SQL de Supabase.
-- Cambiar 'macroeconomia' por la materia que se quiera mirar.
-- ---------------------------------------------------------------------------

with parametros as (
  select
    'macroeconomia'::text                                                    as materia,
    date_trunc('week', now() at time zone 'America/Bogota')
      at time zone 'America/Bogota'                                          as inicio_ciclo,
    (now() - interval '14 days')                                             as corte_14d
),
h as (
  select f.* from public.fp_history f, parametros p where f.subject_id = p.materia
),
por_alumno as (
  select
    h.user_id,
    sum(h.fp_awarded) filter (where h.created_at >= p.inicio_ciclo)          as fp_ciclo,
    avg(h.correct_pct) filter (
      where h.modality = 'evaluativa' and h.created_at >= p.corte_14d
    )                                                                        as pct_14d,
    count(*) filter (
      where h.modality = 'evaluativa' and h.created_at >= p.corte_14d
    )                                                                        as n_eval_14d,
    /* Los bonos de racha no son un día en el que el estudiante hiciera algo. */
    count(distinct (h.created_at at time zone 'America/Bogota')::date) filter (
      where h.created_at >= p.corte_14d and h.modality <> 'racha'
    )                                                                        as dias_14d
  from h, parametros p
  group by h.user_id
),
cabeza as (
  select user_id from por_alumno
   where coalesce(fp_ciclo, 0) > 0
   order by fp_ciclo desc, user_id
   limit 3
)
select 'Cabeza de la semana'      as senal,
       'top 3 por FP del ciclo'   as regla,
       (select count(*) from cabeza)::text                                   as califican,
       (select count(*) from por_alumno where coalesce(fp_ciclo, 0) > 0)::text
         || ' con algo de FP esta semana'                                    as contexto
union all
select 'Precisión sostenida',
       'media >= 85 sobre >= 4 evaluativas en 14 días',
       (select count(*) from por_alumno where n_eval_14d >= 4 and pct_14d >= 85)::text,
       (select count(*) from por_alumno where n_eval_14d >= 4)::text
         || ' llegan a 4 evaluativas · '
       || (select count(*) from por_alumno where n_eval_14d between 1 and 3 and pct_14d >= 85)::text
         || ' van >= 85% pero con 1-3'
union all
select 'Constancia',
       'actividad en >= 3 días distintos en 14 días',
       (select count(*) from por_alumno where dias_14d >= 3)::text,
       (select count(*) from por_alumno where dias_14d = 2)::text
         || ' van por 2 días · '
       || (select count(*) from por_alumno where dias_14d = 1)::text || ' por 1'
union all
select '── total ──',
       'estudiantes con historial en la materia',
       (select count(*) from por_alumno)::text,
       (select count(*) from por_alumno where dias_14d > 0)::text
         || ' con actividad en los últimos 14 días';
