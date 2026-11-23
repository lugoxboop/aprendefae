-- ---------------------------------------------------------------------------
-- 0274 — MACROECONOMÍA 2026, TEMA 5: POLÍTICA CAMBIARIA (las 6 Hacer)
--
-- Publicada en el lote 6 (23-nov-2026): Mateo pidió publicar a medida que se
-- termina, así que entra directo, en el MISMO cambio que declara las seis
-- actividades en src/data/subjects.js y las anota en PUBLICADAS_T5
-- (catalogo.test.mjs y el guardián exigen las dos cosas juntas).
-- Ninguna va por etapas: supabase/tests/etapas_test.sql no cambia (su
-- chequeo 2 exige etapas = 1 a todas las que no excluye, y estas lo cumplen).
--
-- EL NÚMERO: la siguiente a la 0273, en el rango 0250-0299 (nocturno.md).
--
-- Especificación de Gen (macro-2026/disenos/t5-politica-cambiaria.md §1):
--   pc26-h1-quien-aprecia  ¿Quién se apreció?        Fácil   · evaluativa · 10
--   pc26-h2-empuja-curva   Empuja la curva           Medio   · evaluativa · 25
--   pc26-h3-aguja          La aguja del real         Difícil · evaluativa · 50
--   pc26-h4-a-quien-sirve  ¿A quién le sirve?        Medio   · evaluativa · 25
--   pc26-h5-donde-ahorro   ¿Aquí o afuera?           Difícil · evaluativa · 50
--   pc26-h6-correa         Cada hecho a su correa    Medio   · evaluativa · 25
--
-- ADITIVA Y REPETIBLE: un insert con `on conflict do nothing`. No hace ALTER,
-- UPDATE ni DELETE, no toca ninguna tabla de estudiantes ni ninguna fila de
-- otra actividad. Los ids empiezan por `pc26-` y no chocan con ningún id
-- retirado de Macroeconomía. El topic_id es `politica-cambiaria`, nuevo.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y la 0014 (etapas).
--
-- CÓMO DESHACERLA, ANTES de que nadie la juegue (escrito, no se corre; con
-- `like` y no con la lista de ids, porque catalogo.test.mjs lee una lista de
-- ids tras un delete como un borrado real aunque esté en un comentario):
--   delete from public.actividad_catalogo where activity_id like 'pc26-h%';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('pc26-h1-quien-aprecia', 'macroeconomia', 'politica-cambiaria', 'evaluativa', 'facil', 10, 1),
  ('pc26-h2-empuja-curva', 'macroeconomia', 'politica-cambiaria', 'evaluativa', 'medio', 25, 1),
  ('pc26-h3-aguja', 'macroeconomia', 'politica-cambiaria', 'evaluativa', 'dificil', 50, 1),
  ('pc26-h4-a-quien-sirve', 'macroeconomia', 'politica-cambiaria', 'evaluativa', 'medio', 25, 1),
  ('pc26-h5-donde-ahorro', 'macroeconomia', 'politica-cambiaria', 'evaluativa', 'dificil', 50, 1),
  ('pc26-h6-correa', 'macroeconomia', 'politica-cambiaria', 'evaluativa', 'medio', 25, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 6 filas, macroeconomia, politica-cambiaria; FP base 10, 25,
-- 50, 25, 50, 25; etapas 1.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id like 'pc26-%'
order by activity_id;
