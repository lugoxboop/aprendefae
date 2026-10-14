-- ---------------------------------------------------------------------------
-- 0090 — CONTABILIDAD, T7-1: H1 «¿QUÉ CUENTA SE MUEVE?» (Célula C)
--
-- La primera actividad de Hacer de T7-1 «Inventarios I: el sistema periódico»:
--
--   t7-1-que-cuenta-se-mueve        ¿Qué cuenta se mueve?    Fácil · exploratoria · 10
--
-- Es la primera migración del rango de la Célula C (0090-0109).
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`, como la 0070:
-- correrla dos veces no cambia nada. No hace ALTER, UPDATE ni DELETE, y no
-- toca ninguna tabla de estudiantes. Solo agrega la fila de su propio tema.
--
-- EL TEMA: `inventarios-periodico`, el id de T7-1 en subjects.js (sin el
-- prefijo de la célula, como decidió Erwin para el Tema 5).
--
-- LA MODALIDAD: exploratoria, como la pide la ficha de Near con PASA de Mello:
-- el motor paga los 10 FP al terminar, sin mirar los aciertos.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (le añade
-- la columna `etapas`). Nada más.
--
-- DE QUÉ NO DEPENDE: de ninguna otra. No lee ni toca filas de otras
-- migraciones. Que falten números en medio (0054 a 0089) no rompe nada: las
-- migraciones se aplican por orden de nombre.
--
-- EL ORDEN: Mateo la corre en producción ANTES de fusionar el PR que la trae.
-- Un estudiante que termine la actividad antes de que exista su fila
-- recibiría 22023 en vez de sus FP. La Célula C no la corre.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 1 fila,
-- contabilidad, inventarios-periodico, exploratoria, facil, 10, 1.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie la juegue:
--   delete from public.actividad_catalogo where activity_id = 't7-1-que-cuenta-se-mueve';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('t7-1-que-cuenta-se-mueve',     'contabilidad', 'inventarios-periodico',     'exploratoria', 'facil', 10, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 1 fila, contabilidad, inventarios-periodico, exploratoria, facil, 10 FP, 1 etapa.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id = 't7-1-que-cuenta-se-mueve';
