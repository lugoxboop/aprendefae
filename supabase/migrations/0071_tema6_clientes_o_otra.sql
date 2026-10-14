-- ---------------------------------------------------------------------------
-- 0071 — CONTABILIDAD, TEMA 6: ACT. 1 «¿CLIENTES O OTRA CUENTA POR COBRAR?»
-- (Célula B)
--
-- La primera actividad de Hacer del Tema 6, después de la pieza 1 de Aprender:
--
--   b5-t6-a1                       ¿Clientes o otra cuenta por cobrar?   Fácil  ·  10
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`, como la 0070:
-- correrla dos veces no cambia nada. No hace ALTER, UPDATE ni DELETE, y no
-- toca ninguna tabla de estudiantes.
--
-- EL TEMA: `cuentas-por-cobrar`, el id con el que Erwin fusionó el #57.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (le añade
-- la columna `etapas`). Nada más.
--
-- DE QUÉ NO DEPENDE: de ninguna otra. En particular, no de la 0070 (Tema 5,
-- act. 1): no lee ni toca su fila, y se pueden correr en cualquier orden. Un
-- número que falta en medio no rompe nada: las migraciones se aplican por
-- orden de nombre.
--
-- EL ORDEN: Mateo la corre en producción ANTES de fusionar el PR que la trae.
-- Un estudiante que termine la actividad antes de que exista su fila
-- recibiría 22023 en vez de sus FP.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 1 fila,
-- contabilidad, cuentas-por-cobrar, facil, 10, 1.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie la juegue:
--   delete from public.actividad_catalogo where activity_id = 'b5-t6-a1';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('b5-t6-a1',                     'contabilidad', 'cuentas-por-cobrar',        'evaluativa', 'facil',    10, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 1 fila, contabilidad, cuentas-por-cobrar, facil, 10 FP, 1 etapa.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id = 'b5-t6-a1';
