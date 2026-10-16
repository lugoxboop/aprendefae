-- ---------------------------------------------------------------------------
-- 0204 — CONTABILIDAD, T4: H5 «¿AL EMPLEADO O AL GASTO?» (Célula D)
--
-- La quinta actividad de Hacer de T4 «Efectivo, caja menor y bancos»:
--
--   t4-al-empleado-o-al-gasto   ¿Al empleado o al gasto?   Difícil · evaluativa · 50
--
-- Del rango de la Célula D (0200-0249). Es la quinta del rango; la 0200-0203 son de H1-H4.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`, como la
-- 0098 y la 0250: correrla dos veces no cambia nada. No hace ALTER, UPDATE ni
-- DELETE, y no toca ninguna tabla de estudiantes. Solo agrega la fila de su
-- propio tema.
--
-- EL TEMA: `efectivo-caja-menor-bancos`, el id de T4 en subjects.js (cuarto
-- en el índice, entre el Tema 3 y el Tema 5).
--
-- LA MODALIDAD: evaluativa, como la fija el plan de Hacer de Yujiro: el
-- motor escala los 50 FP con los aciertos (los dos casos que se sortean de
-- cuatro en cada intento; el id de la actividad es uno solo).
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (le añade
-- la columna `etapas`). Nada más: no necesita que ninguna de la 0200 a la 0203 haya corrido.
--
-- DE QUÉ NO DEPENDE: de ninguna otra. No lee ni toca filas de otras
-- migraciones. Que falten números en medio no rompe nada: las migraciones se
-- aplican por orden de nombre.
--
-- EL ORDEN: Erwin la corre en producción ANTES de fusionar el PR que la trae.
-- Un estudiante que termine la actividad antes de que exista su fila
-- recibiría 22023 en vez de sus FP. La Célula D no la corre.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 1 fila,
-- t4-al-empleado-o-al-gasto, contabilidad, efectivo-caja-menor-bancos,
-- evaluativa, dificil, 50, 1.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie la juegue (escrito,
-- no se corre):
--   delete from public.actividad_catalogo where activity_id = 't4-al-empleado-o-al-gasto';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('t4-al-empleado-o-al-gasto', 'contabilidad', 'efectivo-caja-menor-bancos', 'evaluativa', 'dificil', 50, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 1 fila, contabilidad, efectivo-caja-menor-bancos, evaluativa, dificil, 50 FP, 1 etapa.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id = 't4-al-empleado-o-al-gasto';
