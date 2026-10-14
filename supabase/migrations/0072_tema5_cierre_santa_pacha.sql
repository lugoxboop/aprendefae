-- ---------------------------------------------------------------------------
-- 0072 — CONTABILIDAD, TEMA 5: ACT. 2 «EL CIERRE COMPLETO DE SANTA PACHA»
-- (Célula B)
--
-- El cierre de Hacer del Tema 5, después de «¿Qué renta da este título?»:
--
--   b5-t5-a2                       El cierre completo de Santa Pacha   Difícil ·  50
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`, como la 0070
-- y la 0071: correrla dos veces no cambia nada. No hace ALTER, UPDATE ni
-- DELETE, y no toca ninguna tabla de estudiantes.
--
-- EL TEMA: `activos-financieros`, el id con el que Erwin fusionó el #46.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (le añade
-- la columna `etapas`). Nada más.
--
-- DE QUÉ NO DEPENDE: de ninguna otra. En particular, no de la 0070 (b5-t5-a1)
-- ni de la 0071 (b5-t6-a1): no lee ni toca sus filas, y se pueden correr en
-- cualquier orden. Un número que falta en medio no rompe nada: las
-- migraciones se aplican por orden de nombre.
--
-- EL ORDEN: Mateo la corre en producción ANTES de fusionar el PR que la trae.
-- Un estudiante que termine la actividad antes de que exista su fila
-- recibiría 22023 en vez de sus FP.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 1 fila,
-- contabilidad, activos-financieros, dificil, 50, 1.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie la juegue:
--   delete from public.actividad_catalogo where activity_id = 'b5-t5-a2';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('b5-t5-a2',                     'contabilidad', 'activos-financieros',       'evaluativa', 'dificil',  50, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 1 fila, contabilidad, activos-financieros, dificil, 50 FP, 1 etapa.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id = 'b5-t5-a2';
