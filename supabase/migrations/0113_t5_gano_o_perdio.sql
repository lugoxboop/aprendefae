-- ---------------------------------------------------------------------------
-- 0113 — CONTABILIDAD, T5: N5 «¿GANÓ O PERDIÓ?» (Célula C)
--
-- Una actividad de Hacer nueva de T5 «Activos financieros temporales» (§5.3):
--
--   t5-gano-o-perdio   ¿Ganó o perdió?   Medio · evaluativa · 25
--
-- Va justo después de N4; la sostiene b5-t5-a2-los-tres-momentos-de-una-inversion (decisión de corte de T5, punto 6).
--
-- EL NÚMERO: la decisión de corte de T5 (punto 10) da a la Célula C 0110 a
-- 0114, una por Hacer: 0110 N1, 0111 N3, 0112 N4, 0113 N5 y 0114 N7.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`, como la 0106:
-- correrla dos veces no cambia nada. No hace ALTER, UPDATE ni DELETE, y no
-- toca ninguna tabla de estudiantes. Solo agrega la fila de su propio tema.
--
-- EL TEMA: `activos-financieros`, el id de T5 en subjects.js, el mismo de las
-- dos actividades de la Célula B (0070 y 0072).
--
-- LA MODALIDAD: evaluativa, como la pide la ficha de Near: el motor escala los
-- 25 FP con los aciertos (10 posibles desde la v2), con piso del 50 %.
--
-- LA DIFICULTAD: «medio», sin tilde, como la escribe el catálogo del cliente.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (le añade
-- la columna `etapas`). Nada más.
--
-- DE QUÉ NO DEPENDE: de ninguna otra. No lee ni toca filas de otras
-- migraciones. Que falten números en medio no rompe nada: las migraciones se
-- aplican por orden de nombre.
--
-- EL ORDEN: Erwin la corre en producción ANTES de fusionar el PR que la trae.
-- Un estudiante que termine la actividad antes de que exista su fila
-- recibiría 22023 en vez de sus FP. La Célula C no la corre.
--
-- LOS FP DEL TEMA: suben, pero no se toca ningún dato guardado. El progreso va
-- por id de actividad (src/hacer/completadas.js); lo que sube es el total que
-- se puede ganar en T5.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 1 fila,
-- contabilidad, activos-financieros, evaluativa, medio, 25, 1.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie la juegue:
--   delete from public.actividad_catalogo where activity_id = 't5-gano-o-perdio';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('t5-gano-o-perdio', 'contabilidad', 'activos-financieros', 'evaluativa', 'medio', 25, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 1 fila, contabilidad, activos-financieros, evaluativa, medio, 25 FP, 1 etapa.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id = 't5-gano-o-perdio';
