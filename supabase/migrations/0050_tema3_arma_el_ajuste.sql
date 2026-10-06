-- ---------------------------------------------------------------------------
-- 0050 — CONTABILIDAD, TEMA 3: ACTS. 4 Y 5 «ARMA EL AJUSTE»
--
-- Dos actividades de Hacer del Tema 3:
--
--   t3-ajuste-acumulado            Arma el ajuste acumulado      Aplicación ·  25
--   t3-ajuste-diferido             Arma el ajuste diferido       Análisis   ·  50
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do update`. Correrla dos
-- veces deja exactamente lo mismo. No toca ninguna fila de ningún estudiante.
--
-- QUÉ NECESITA PARA CORRER: actividad_catalogo con su columna `etapas` —la
-- 0011 y la 0014—.
--
-- EL ORDEN, COMO SIEMPRE: primero el despliegue, después la migración. Un
-- estudiante que termine la actividad antes de que exista su fila recibiría
-- 22023 en vez de sus FP.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 5 filas y
-- 145 FP.
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('t3-ajuste-acumulado',          'contabilidad', 'ingresos-gastos-y-caja',    'evaluativa', 'medio',   25, 1),
  ('t3-ajuste-diferido',           'contabilidad', 'ingresos-gastos-y-caja',    'evaluativa', 'dificil', 50, 1)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base,
  etapas     = excluded.etapas;

-- ---------------------------------------------------------------------------
-- Resumen: cinco filas y 145 FP.
-- ---------------------------------------------------------------------------
select
  count(*) as filas,
  sum(fp_base) as fp_del_tema
from public.actividad_catalogo
where topic_id = 'ingresos-gastos-y-caja';
