-- ---------------------------------------------------------------------------
-- 0052 — POLÍTICA MONETARIA: DOS ACTIVIDADES NUEVAS
--
--   las-dos-entradas         Las Dos Entradas           Aplicación  ·  25
--   por-cual-arteria-entra   ¿Por Cuál Arteria Entra?   Análisis    ·  50
--
-- Las dos valen 75 FP (decisión de Erwin). El tema pasa de 565 a 640 FP.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do update`. Correrla dos
-- veces deja exactamente lo mismo. No toca ninguna fila de ningún estudiante
-- ni ninguna de las doce actividades que ya estaban.
--
-- QUÉ NECESITA PARA CORRER: actividad_catalogo con su columna `etapas` —la
-- 0011 y la 0014—.
--
-- EL ORDEN, COMO SIEMPRE: primero el despliegue, después la migración. Un
-- estudiante que termine la actividad antes de que exista su fila recibiría
-- 22023 en vez de sus FP. (Y antes de las dos: la aprobación escrita de Mateo.)
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 14 filas y
-- 640 FP.
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('las-dos-entradas',       'macroeconomia', 'politica-monetaria', 'evaluativa', 'medio',   25, 1),
  ('por-cual-arteria-entra', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'dificil', 50, 1)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base,
  etapas     = excluded.etapas;

-- ---------------------------------------------------------------------------
-- Resumen: catorce filas y 640 FP.
-- ---------------------------------------------------------------------------
select
  count(*) as filas,
  sum(fp_base) as fp_del_tema
from public.actividad_catalogo
where topic_id = 'politica-monetaria';
