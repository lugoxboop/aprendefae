-- ---------------------------------------------------------------------------
-- 0091 — POLÍTICA MONETARIA: LOS DOS JUEGOS DE «LAS TALLAS DEL DINERO»
--
--   en-que-talla-va      ¿En qué talla va?      Cimientos   ·  10
--   que-toco-el-banco    ¿Qué tocó el Banco?    Aplicación  ·  25
--
-- Encargo de Erwin; clasificación decidida por L. Las dos valen 35 FP. El tema
-- pasa de 14 filas y 640 FP (la 0031 y la 0052) a 16 filas y 675 FP.
--
-- Del rango de la Célula C (0090-0109). La escribe Misa y NO la corre: la
-- corre Mateo a mano.
--
-- ADITIVA Y REPETIBLE, con el patrón de la 0052. Es UN insert con `on conflict
-- do update`. Correrla dos veces deja exactamente lo mismo. No toca ninguna
-- fila de ningún estudiante ni ninguna de las catorce actividades del tema que
-- ya estaban.
--
-- QUÉ NECESITA PARA CORRER: actividad_catalogo con su columna `etapas` —la
-- 0011 y la 0014—.
--
-- EL ORDEN, COMO SIEMPRE: primero la migración, después el despliegue que
-- ofrece los juegos. Un estudiante que termine un juego antes de que exista su
-- fila recibiría 22023 en vez de sus FP.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 16 filas y
-- 675 FP. Si la Célula B agrega juegos al mismo tema antes, la cifra sube en
-- lo que ellos sumen.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie juegue:
--   delete from public.actividad_catalogo where activity_id in ('en-que-talla-va', 'que-toco-el-banco');
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('en-que-talla-va',   'macroeconomia', 'politica-monetaria', 'evaluativa', 'facil', 10, 1),
  ('que-toco-el-banco', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'medio', 25, 1)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base,
  etapas     = excluded.etapas;

-- ---------------------------------------------------------------------------
-- Resumen: dieciséis filas y 675 FP.
-- ---------------------------------------------------------------------------
select
  count(*) as filas,
  sum(fp_base) as fp_del_tema
from public.actividad_catalogo
where topic_id = 'politica-monetaria';
