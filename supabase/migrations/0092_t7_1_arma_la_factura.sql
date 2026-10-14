-- ---------------------------------------------------------------------------
-- 0092 — CONTABILIDAD, T7-1: H2 «ARMA LA FACTURA» (Célula C)
--
-- La segunda actividad de Hacer de T7-1 «Inventarios I: el sistema periódico»:
--
--   t7-1-arma-la-factura        Arma la factura    Medio · evaluativa · 25
--
-- Del rango de la Célula C (0090-0109). La 0090 es la de H1 (#64) y la 0091 va
-- en el parche de cableado de «Las tallas del dinero» (#75): esta no depende
-- de ninguna de las dos.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`, como la 0090:
-- correrla dos veces no cambia nada. No hace ALTER, UPDATE ni DELETE, y no
-- toca ninguna tabla de estudiantes. Solo agrega la fila de su propio tema.
--
-- EL TEMA: `inventarios-periodico`, el id de T7-1 en subjects.js.
--
-- LA MODALIDAD: evaluativa, Medio, 25 FP, como la pide la ficha de Near con
-- PASA de Mello: el motor escala los FP con los aciertos (12 posibles), con
-- piso del 50 %.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (le añade
-- la columna `etapas`). Nada más.
--
-- EL ORDEN: Mateo la corre en producción ANTES de fusionar el PR que la trae.
-- Un estudiante que termine la actividad antes de que exista su fila
-- recibiría 22023 en vez de sus FP. La Célula C no la corre.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 1 fila,
-- contabilidad, inventarios-periodico, evaluativa, medio, 25, 1.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie la juegue:
--   delete from public.actividad_catalogo where activity_id = 't7-1-arma-la-factura';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('t7-1-arma-la-factura',     'contabilidad', 'inventarios-periodico',     'evaluativa', 'medio', 25, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 1 fila, contabilidad, inventarios-periodico, evaluativa, medio, 25 FP, 1 etapa.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id = 't7-1-arma-la-factura';
