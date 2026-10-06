-- ---------------------------------------------------------------------------
-- 0048 — CONTABILIDAD, TEMA 3: ACT. 2 «¿CUÁNDO SE CAUSA?»
--
-- La segunda actividad de Hacer del Tema 3, después de la pieza 3 del
-- Aprender («Lo que ya pasó y no se ha pagado»):
--
--   t3-cuando-se-causa             ¿Cuándo se causa?            Fácil   ·  10
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
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 2 filas y
-- 20 FP.
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('t3-cuando-se-causa',           'contabilidad', 'ingresos-gastos-y-caja',    'evaluativa', 'facil',   10, 1)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base,
  etapas     = excluded.etapas;

-- ---------------------------------------------------------------------------
-- Resumen: dos filas y 20 FP.
-- ---------------------------------------------------------------------------
select
  count(*) as filas,
  sum(fp_base) as fp_del_tema
from public.actividad_catalogo
where topic_id = 'ingresos-gastos-y-caja';
