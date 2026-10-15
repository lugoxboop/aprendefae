-- ---------------------------------------------------------------------------
-- 0101 — CONTABILIDAD, T7-2: H4 «¿PERIÓDICO O PERMANENTE?» (Célula C)
--
-- La cuarta actividad de Hacer de T7-2 «Inventarios II: el sistema permanente»:
--
--   t7-2-periodico-o-permanente   ¿Periódico o permanente?   Medio · evaluativa · 25
--
-- Del rango de la Célula C (0090-0109). L la asignó: 0098 para H1 y 0099 para
-- H2 de T7-2; 0100 a 0102 para H3 a H5; 0103 a 0109 para T7-3.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`, como la 0090:
-- correrla dos veces no cambia nada. No hace ALTER, UPDATE ni DELETE, y no
-- toca ninguna tabla de estudiantes. Solo agrega la fila de su propio tema.
--
-- EL TEMA: `inventarios-permanente`, el id de T7-2 en subjects.js (sin el
-- prefijo de la célula, como el de T7-1).
--
-- LA MODALIDAD: evaluativa, como la pide la ficha de Near con PASA de Mello:
-- el motor escala los 25 FP con los aciertos (5 posibles), con piso del 50 %.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (le añade
-- la columna `etapas`). Nada más.
--
-- DE QUÉ NO DEPENDE: de ninguna otra. No lee ni toca filas de otras
-- migraciones. Que falten números en medio no rompe nada: las migraciones se
-- aplican por orden de nombre.
--
-- EL ORDEN: Mateo la corre en producción ANTES de fusionar el PR que la trae.
-- Un estudiante que termine la actividad antes de que exista su fila
-- recibiría 22023 en vez de sus FP. La Célula C no la corre.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 1 fila,
-- contabilidad, inventarios-permanente, evaluativa, medio, 25, 1.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie la juegue:
--   delete from public.actividad_catalogo where activity_id = 't7-2-periodico-o-permanente';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('t7-2-periodico-o-permanente', 'contabilidad', 'inventarios-permanente', 'evaluativa', 'medio', 25, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 1 fila, contabilidad, inventarios-permanente, evaluativa, medio, 25 FP, 1 etapa.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id = 't7-2-periodico-o-permanente';
