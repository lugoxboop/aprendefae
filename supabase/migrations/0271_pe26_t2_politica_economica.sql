-- ---------------------------------------------------------------------------
-- 0271 — MACROECONOMÍA 2026, TEMA 2: POLÍTICA ECONÓMICA (las 5 Hacer)
--
-- Publicada en el lote 3 (23-nov-2026): esperó en supabase/macro2026-pendientes/
-- y entra aquí, tal cual, en el MISMO cambio que declara las cinco actividades
-- en src/data/subjects.js y las anota en PUBLICADAS_T2 (catalogo.test.mjs y el
-- guardián exigen las dos cosas juntas). pe26-h2-grupo-logico, la única por
-- etapas, entra en supabase/tests/etapas_test.sql (chequeos 2 y 15).
--
-- EL NÚMERO: la siguiente a la 0270, en el rango 0250-0299 (nocturno.md).
--
-- Especificación de Gen (macro-2026/disenos/t2-politica-economica.md §2):
--   pe26-h3-cables         Conecta los cables          Medio   · evaluativa   · 25
--   pe26-h1-seis-cajones   Seis peldaños               Medio   · evaluativa   · 25
--   pe26-h2-grupo-logico   Arma el grupo lógico (3)    Difícil · evaluativa   · 50 × 3
--   pe26-h4-expediente     El peldaño que no encaja    Difícil · evaluativa   · 50
--   pe26-h5-dos-fiebres    Un paciente, dos fiebres    Medio   · exploratoria · 25
--
-- ADITIVA Y REPETIBLE: un insert con `on conflict do nothing`. No hace ALTER,
-- UPDATE ni DELETE, no toca ninguna tabla de estudiantes ni ninguna fila de
-- otra actividad. Los ids empiezan por `pe26-` y no chocan con ningún id
-- retirado de Macroeconomía. El topic_id `politica-economica` se reutiliza.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y la 0014 (etapas).
--
-- CÓMO DESHACERLA, ANTES de que nadie la juegue (escrito, no se corre; con
-- `like` y no con la lista de ids, porque catalogo.test.mjs lee una lista de
-- ids tras un delete como un borrado real aunque esté en un comentario):
--   delete from public.actividad_catalogo where activity_id like 'pe26-h%';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('pe26-h3-cables', 'macroeconomia', 'politica-economica', 'evaluativa', 'medio', 25, 1),
  ('pe26-h1-seis-cajones', 'macroeconomia', 'politica-economica', 'evaluativa', 'medio', 25, 1),
  ('pe26-h2-grupo-logico', 'macroeconomia', 'politica-economica', 'evaluativa', 'dificil', 50, 3),
  ('pe26-h4-expediente', 'macroeconomia', 'politica-economica', 'evaluativa', 'dificil', 50, 1),
  ('pe26-h5-dos-fiebres', 'macroeconomia', 'politica-economica', 'exploratoria', 'medio', 25, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 5 filas, macroeconomia, politica-economica; FP base 25, 25,
-- 50 (× 3 etapas), 50, 25 (exploratoria).
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id like 'pe26-%'
order by activity_id;
