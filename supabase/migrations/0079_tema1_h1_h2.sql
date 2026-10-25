-- ---------------------------------------------------------------------------
-- 0079 — CONTABILIDAD, TEMA 1: LOS DOS HACER NUEVOS (Célula B, lote 5)
--
--   t1-quien-pregunta-esto   ¿Quién pregunta esto?          Medio · 25
--   t1-un-dia-o-un-ano       ¿Un día, un año o dos fotos?   Medio · 25
--
-- Ids nuevos: solo se agregan dos filas. La dificultad y los FP son decisión
-- de Kaede (reversible; la confirma Sakuta en el PR). Si cambian, se corre
-- otra vez con el valor nuevo: el `on conflict do update` lo deja igual al
-- cliente.
--
-- ADITIVA Y REPETIBLE. Un insert con `on conflict do update`. Correrla dos
-- veces deja exactamente lo mismo. No toca ninguna fila de ningún estudiante.
--
-- EL ORDEN, COMO SIEMPRE: primero el despliegue, después la migración. Al
-- revés no rompe nada —las filas son nuevas—, pero quien termine una de las
-- dos antes de que exista su fila recibiría 22023 en vez de sus FP.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final devuelve 2 filas y 50 FP.
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('t1-quien-pregunta-esto', 'contabilidad', 'introduccion-contabilidad', 'evaluativa', 'medio', 25, 1),
  ('t1-un-dia-o-un-ano',     'contabilidad', 'introduccion-contabilidad', 'evaluativa', 'medio', 25, 1)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base,
  etapas     = excluded.etapas;

select count(*) as filas, sum(fp_base) as fp
from public.actividad_catalogo
where activity_id in ('t1-quien-pregunta-esto', 't1-un-dia-o-un-ano');
