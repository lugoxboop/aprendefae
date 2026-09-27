-- ---------------------------------------------------------------------------
-- 0044 — CONTABILIDAD, TEMA 1: LAS DOS PRIMERAS ACTIVIDADES
--
-- «Introducción a la contabilidad» es el capítulo 1 y hasta ahora solo tenía
-- material de Aprender —la pieza «El recorrido de un hecho», que no da FP y no
-- entra al catálogo—. Con estas dos el tema estrena su mitad de Hacer.
--
--   t1-desde-donde-preguntan   ¿Desde Dónde Preguntan?    Fácil · 10
--   t1-que-entro-y-que-salio   ¿Qué Entró y Qué Salió?    Fácil · 10
--
-- SON LAS DOS QUE SE PUEDEN PUBLICAR YA. Dependen solo de la pieza 1 de
-- Aprender, que existe. Las otras cuatro del tema (T1-4 a T1-7) están
-- construidas en el repo pero NO entran al catálogo ni al camino hasta que
-- existan las piezas 2, 3 y 4 del Aprender: sin ellas, preguntarían por cosas
-- que nadie le explicó al estudiante.
--
-- Por eso esta migración mete DOS filas y no seis. Cuando las otras cuatro se
-- publiquen, entrarán con su propia migración.
--
-- FP DEL TEMA: el destino son 260. Esta migración aporta 20. El resto llega
-- con las cuatro que faltan (215) y con la T1-3 (25), que está pendiente de la
-- corrección de Gen y no se construyó.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do update`. Correrla dos
-- veces deja exactamente lo mismo. No toca ninguna fila de ningún estudiante.
--
-- QUÉ NECESITA PARA CORRER: actividad_catalogo con su columna `etapas` —la
-- 0011 y la 0014, aplicadas hace tiempo—. No depende de la 0043.
--
-- EL ORDEN, COMO SIEMPRE: primero el despliegue, después la migración. Al
-- revés no rompe nada aquí —estas filas son nuevas, no retiradas— pero un
-- estudiante que termine la actividad antes de que exista su fila recibiría
-- 22023 en vez de sus FP.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 2 filas y
-- 20 FP.
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('t1-desde-donde-preguntan', 'contabilidad', 'introduccion-contabilidad', 'evaluativa', 'facil', 10, 1),
  ('t1-que-entro-y-que-salio', 'contabilidad', 'introduccion-contabilidad', 'evaluativa', 'facil', 10, 1)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base,
  etapas     = excluded.etapas;

-- ---------------------------------------------------------------------------
-- Resumen: dos filas, 20 FP. El tema llegará a 260 cuando entren las demás.
-- ---------------------------------------------------------------------------
select
  count(*) as filas,
  sum(fp_base) as fp_del_tema
from public.actividad_catalogo
where topic_id = 'introduccion-contabilidad';
