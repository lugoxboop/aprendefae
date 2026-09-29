-- ---------------------------------------------------------------------------
-- 0046 — CONTABILIDAD, TEMA 1: T1-8 «¿DÓNDE SE ROMPIÓ?»
--
-- Una actividad nueva, tercera en el camino —entre T1-2 y T1-3— aunque se
-- construyó la última. Practica la pieza 1 del Aprender, que ya está
-- publicada, así que no depende de las piezas 2, 3 y 4 y sale ya:
--
--   t1-donde-se-rompio             ¿Dónde se Rompió?            Medio   ·  25
--
-- FP DEL TEMA: la 0045 dejó 235. Esta aporta 25, y el tema queda en 260. Con
-- la T1-3 —que sigue retenida por revisión del profesor y no se construyó—
-- serán 285.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do update`. Correrla dos
-- veces deja exactamente lo mismo. No toca ninguna fila de ningún estudiante.
--
-- QUÉ NECESITA PARA CORRER: actividad_catalogo con su columna `etapas` —la
-- 0011 y la 0014—. No depende de la 0044 ni de la 0045, aunque el resumen del
-- final cuenta las filas que metieron.
--
-- EL ORDEN, COMO SIEMPRE: primero el despliegue, después la migración. Al
-- revés no rompe nada —la fila es nueva, no retirada— pero un estudiante que
-- termine la actividad antes de que exista su fila recibiría 22023 en vez de
-- sus FP.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 7 filas y
-- 260 FP.
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('t1-donde-se-rompio',           'contabilidad', 'introduccion-contabilidad', 'evaluativa', 'medio',   25, 1)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base,
  etapas     = excluded.etapas;

-- ---------------------------------------------------------------------------
-- Resumen: siete filas y 260 FP. Las 25 que faltan para 285 son la T1-3.
-- ---------------------------------------------------------------------------
select
  count(*) as filas,
  sum(fp_base) as fp_del_tema
from public.actividad_catalogo
where topic_id = 'introduccion-contabilidad';
