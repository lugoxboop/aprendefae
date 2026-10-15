-- ---------------------------------------------------------------------------
-- 0250 — CONTABILIDAD, REPASO DEL CAPÍTULO 5: r5-1 «REPASO CRUZADO» (Célula E)
--
-- La primera actividad de Hacer del tema transversal `repaso-capitulo-5`, el
-- banco de ejercicios de las pp. 262-274:
--
--   r5-1   Repaso cruzado   Medio · evaluativa · 25
--
-- Del rango de la Célula E (0250-0299). Es la primera del rango.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`, como la
-- 0109: correrla dos veces no cambia nada. No hace ALTER, UPDATE ni DELETE, y
-- no toca ninguna tabla de estudiantes. Solo agrega la fila de su propio tema.
--
-- EL TEMA: `repaso-capitulo-5`, el id del tema en subjects.js, el último de
-- Contabilidad.
--
-- LA MODALIDAD: evaluativa, decisión de Kamogawa: el motor escala los 25 FP
-- con los aciertos (6 posibles).
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (le añade
-- la columna `etapas`). Nada más.
--
-- EL ORDEN: Mateo la corre en producción ANTES de fusionar el PR que la trae.
-- Un estudiante que termine la actividad antes de que exista su fila
-- recibiría 22023 en vez de sus FP. La Célula E no la corre.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 1 fila,
-- r5-1, contabilidad, repaso-capitulo-5, evaluativa, medio, 25, 1.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie la juegue (escrito,
-- no se corre):
--   delete from public.actividad_catalogo where activity_id = 'r5-1';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('r5-1', 'contabilidad', 'repaso-capitulo-5', 'evaluativa', 'medio', 25, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 1 fila, r5-1, contabilidad, repaso-capitulo-5, evaluativa, medio, 25 FP, 1 etapa.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id = 'r5-1';
