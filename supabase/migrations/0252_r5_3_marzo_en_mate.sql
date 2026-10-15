-- ---------------------------------------------------------------------------
-- 0252 — CONTABILIDAD, REPASO DEL CAPÍTULO 5: r5-3 «MARZO EN COMERCIALIZADORA MATE» (Célula E)
--
-- La tercera actividad de Hacer del tema transversal `repaso-capitulo-5`, el
-- 4 del bloque D, pp. 269-271 (sin el 2, 5, 7 y 28 de marzo):
--
--   r5-3   Marzo en Comercializadora Mate   Experto · evaluativa · 90
--
-- Del rango de la Célula E (0250-0299). Va después de la 0251 (r5-2).
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`, como la
-- 0251: correrla dos veces no cambia nada. No hace ALTER, UPDATE ni DELETE, y
-- no toca ninguna tabla de estudiantes. Solo agrega la fila de su propio tema.
--
-- LA MODALIDAD: evaluativa, decisión de Kamogawa: el motor escala los 90 FP
-- con los aciertos, con piso del 50 %.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (le añade
-- la columna `etapas`). Nada más; no lee las filas de la 0250 ni de la 0251.
--
-- EL ORDEN: Mateo la corre en producción ANTES de fusionar el PR que la trae.
-- Un estudiante que termine la actividad antes de que exista su fila
-- recibiría 22023 en vez de sus FP. La Célula E no la corre.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 1 fila,
-- r5-3, contabilidad, repaso-capitulo-5, evaluativa, experto, 90, 1.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie la juegue (escrito,
-- no se corre):
--   delete from public.actividad_catalogo where activity_id = 'r5-3';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('r5-3', 'contabilidad', 'repaso-capitulo-5', 'evaluativa', 'experto', 90, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 1 fila, r5-3, contabilidad, repaso-capitulo-5, evaluativa, experto, 90 FP, 1 etapa.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id = 'r5-3';
