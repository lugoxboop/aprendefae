-- ---------------------------------------------------------------------------
-- 0272 — MACROECONOMÍA 2026, TEMA 3: POLÍTICA FISCAL (las 6 Hacer)
--
-- PENDIENTE: espera en supabase/macro2026-pendientes/ hasta que Mateo apruebe
-- las piezas. Entra a supabase/migrations/, tal cual, en el MISMO cambio que
-- declara las seis actividades en src/data/subjects.js y las anota en
-- PUBLICADAS_T3 (catalogo.test.mjs y el guardián exigen las dos cosas juntas).
-- pf26-h3-factura, la única por etapas, entra ese día en
-- supabase/tests/etapas_test.sql (excluida del chequeo 2 y con un chequeo que
-- exija 3 etapas y base 25).
--
-- EL NÚMERO: la siguiente a la 0271, en el rango 0250-0299 (nocturno.md).
--
-- Especificación de Gen (macro-2026/disenos/t3-politica-fiscal.md §1):
--   pf26-h1-moneda      Echa la moneda              Fácil   · evaluativa · 10
--   pf26-h2-cajero      ¿Qué cajero te cobra?       Fácil   · evaluativa · 10
--   pf26-h3-factura     La factura con lupa (3)     Medio   · evaluativa · 25 × 3
--   pf26-h5-montanas    Las dos montañas            Medio   · evaluativa · 25
--   pf26-h4-expande     ¿Expande o contrae?         Medio   · evaluativa · 25
--   pf26-h6-memo        El memo de la gerencia      Difícil · evaluativa · 50
--
-- ADITIVA Y REPETIBLE: un insert con `on conflict do nothing`. No hace ALTER,
-- UPDATE ni DELETE, no toca ninguna tabla de estudiantes ni ninguna fila de
-- otra actividad. Los ids empiezan por `pf26-` y no chocan con ningún id
-- retirado de Macroeconomía. El topic_id es `politica-fiscal`.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y la 0014 (etapas).
--
-- CÓMO DESHACERLA, ANTES de que nadie la juegue (escrito, no se corre; con
-- `like` y no con la lista de ids, porque catalogo.test.mjs lee una lista de
-- ids tras un delete como un borrado real aunque esté en un comentario):
--   delete from public.actividad_catalogo where activity_id like 'pf26-h%';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('pf26-h1-moneda', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'facil', 10, 1),
  ('pf26-h2-cajero', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'facil', 10, 1),
  ('pf26-h3-factura', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'medio', 25, 3),
  ('pf26-h5-montanas', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'medio', 25, 1),
  ('pf26-h4-expande', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'medio', 25, 1),
  ('pf26-h6-memo', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'dificil', 50, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 6 filas, macroeconomia, politica-fiscal; FP base 10, 10,
-- 25 (× 3 etapas), 25, 25, 50.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id like 'pf26-%'
order by activity_id;
