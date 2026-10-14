-- ---------------------------------------------------------------------------
-- 0070 — CONTABILIDAD, TEMA 5: ACT. 1 «¿QUÉ RENTA DA ESTE TÍTULO?» (Célula B)
--
-- La primera actividad de Hacer del Tema 5, después de la pieza 1 de Aprender:
--
--   b5-t5-a1                       ¿Qué renta da este título?    Fácil      ·  10
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`, como la 0053:
-- correrla dos veces no cambia nada. No hace ALTER, UPDATE ni DELETE, y no
-- toca ninguna tabla de estudiantes.
--
-- EL TEMA: `activos-financieros`, el id que decidió Erwin al fusionar el #46
-- (sin el prefijo de la célula).
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (le añade
-- la columna `etapas`). Nada más.
--
-- DE QUÉ NO DEPENDE: de ninguna otra. En particular, no de la 0052
-- (Política Monetaria) ni de la 0053 (Tema 3, act. 3): no lee ni toca sus
-- filas. Un número que falta en medio (0054 a 0069) no rompe nada: las
-- migraciones se aplican por orden de nombre.
--
-- EL ORDEN: Mateo la corre en producción ANTES de fusionar el PR que la trae.
-- Un estudiante que termine la actividad antes de que exista su fila
-- recibiría 22023 en vez de sus FP.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 1 fila,
-- contabilidad, activos-financieros, facil, 10, 1.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie la juegue:
--   delete from public.actividad_catalogo where activity_id = 'b5-t5-a1';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('b5-t5-a1',                     'contabilidad', 'activos-financieros',       'evaluativa', 'facil',    10, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 1 fila, contabilidad, activos-financieros, facil, 10 FP, 1 etapa.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id = 'b5-t5-a1';
