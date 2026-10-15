-- ---------------------------------------------------------------------------
-- 0103 — CONTABILIDAD, T7-3: H1 «DESCUENTO EN LA FACTURA» (Célula C)
--
-- La primera actividad de Hacer de T7-3 «Inventarios III: descuentos, inventario
-- físico y NIC 2»:
--
--   t7-3-descuento-en-factura   Descuento en la factura   Medio · evaluativa · 25
--
-- Del rango de la Célula C (0090-0109). L la asignó: 0103 a 0109 para H1 a H7
-- de T7-3, en ese orden. Es lo último del rango.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`, como la 0090:
-- correrla dos veces no cambia nada. No hace ALTER, UPDATE ni DELETE, y no
-- toca ninguna tabla de estudiantes. Solo agrega la fila de su propio tema.
--
-- EL TEMA: `inventarios-descuentos-nic2`, el id de T7-3 en subjects.js (sin el
-- prefijo de la célula, como los de T7-1 y T7-2).
--
-- LA MODALIDAD: evaluativa, como la pide la ficha de Near con PASA de Mello:
-- el motor escala los 25 FP con los aciertos (8 posibles), con piso del 50 %.
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
-- contabilidad, inventarios-descuentos-nic2, evaluativa, medio, 25, 1.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie la juegue:
--   delete from public.actividad_catalogo where activity_id = 't7-3-descuento-en-factura';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('t7-3-descuento-en-factura', 'contabilidad', 'inventarios-descuentos-nic2', 'evaluativa', 'medio', 25, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 1 fila, contabilidad, inventarios-descuentos-nic2, evaluativa, medio, 25 FP, 1 etapa.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id = 't7-3-descuento-en-factura';
