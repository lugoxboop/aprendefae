-- ---------------------------------------------------------------------------
-- 0273 — MACROECONOMÍA 2026, TEMA 4: POLÍTICA MONETARIA (las 6 Hacer)
--
-- Publicada en el lote 5 (23-nov-2026): Mateo pidió publicar a medida que se
-- termina, así que entra directo, en el MISMO cambio que declara las seis
-- actividades en src/data/subjects.js y las anota en PUBLICADAS_T4
-- (catalogo.test.mjs y el guardián exigen las dos cosas juntas).
-- pm26-h2-cascada-meta, la única por etapas, entra en
-- supabase/tests/etapas_test.sql (chequeos 2 y 17).
--
-- EL NÚMERO: la siguiente a la 0272, en el rango 0250-0299 (nocturno.md).
--
-- Especificación de Gen (macro-2026/disenos/t4-politica-monetaria.md §1):
--   pm26-h1-entra-sale    ¿Entra o sale dinero?          Medio   · evaluativa · 25
--   pm26-h2-cascada-meta  Ajusta la cascada (3)          Fácil   · evaluativa · 10 × 3
--   pm26-h3-cajas         Cada depósito a su caja        Medio   · evaluativa · 25
--   pm26-h4-mueve-tasa    Mueve la curva, mira la tasa   Medio   · evaluativa · 25
--   pm26-h6-domino        El dominó de la tasa           Medio   · evaluativa · 25
--   pm26-h5-junta         La Junta decide                Difícil · evaluativa · 50
--
-- ADITIVA Y REPETIBLE: un insert con `on conflict do nothing`. No hace ALTER,
-- UPDATE ni DELETE, no toca ninguna tabla de estudiantes ni ninguna fila de
-- otra actividad. Los ids empiezan por `pm26-` y no chocan con ningún id
-- retirado de Macroeconomía. El topic_id es `politica-monetaria`.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y la 0014 (etapas).
--
-- CÓMO DESHACERLA, ANTES de que nadie la juegue (escrito, no se corre; con
-- `like` y no con la lista de ids, porque catalogo.test.mjs lee una lista de
-- ids tras un delete como un borrado real aunque esté en un comentario):
--   delete from public.actividad_catalogo where activity_id like 'pm26-h%';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('pm26-h1-entra-sale', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'medio', 25, 1),
  ('pm26-h2-cascada-meta', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'facil', 10, 3),
  ('pm26-h3-cajas', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'medio', 25, 1),
  ('pm26-h4-mueve-tasa', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'medio', 25, 1),
  ('pm26-h6-domino', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'medio', 25, 1),
  ('pm26-h5-junta', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'dificil', 50, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 6 filas, macroeconomia, politica-monetaria; FP base 25,
-- 10 (× 3 etapas), 25, 25, 25, 50.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id like 'pm26-%'
order by activity_id;
