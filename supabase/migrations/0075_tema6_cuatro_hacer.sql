-- ---------------------------------------------------------------------------
-- 0075 — CONTABILIDAD, TEMA 6: ACTS. 4 A 7 DE HACER (Célula B)
--
-- Los cuatro Hacer nuevos del Tema 6, después de «Cuando la deuda castigada
-- vuelve» (b5-t6-a3, la 0074):
--
--   b5-t6-a4   ¿Qué se debita?              Media   ·  25
--   b5-t6-a5   La cuenta de la provisión    Media   ·  25
--   b5-t6-a6   Provisión por edades         Difícil ·  50
--   b5-t6-a7   ¿Qué método y cuándo?        Fácil   ·  10
--
-- La dificultad y los FP los decidió Sakuta.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`, como la 0070
-- a la 0074: correrla dos veces no cambia nada. No hace ALTER, UPDATE ni
-- DELETE, y no toca ninguna tabla de estudiantes.
--
-- EL TEMA: `cuentas-por-cobrar`, el de la 0071 y la 0074.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (le añade
-- la columna `etapas`). Nada más.
--
-- DE QUÉ NO DEPENDE: de ninguna otra. No lee ni toca las filas de la 0071 ni
-- de la 0074, y se pueden correr en cualquier orden.
--
-- EL ORDEN: Erwin la corre en producción ANTES de fusionar el PR que la trae.
-- Un estudiante que termine una de las cuatro actividades antes de que exista
-- su fila recibiría 22023 en vez de sus FP.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 4 filas:
--   b5-t6-a4, contabilidad, cuentas-por-cobrar, medio,   25, 1
--   b5-t6-a5, contabilidad, cuentas-por-cobrar, medio,   25, 1
--   b5-t6-a6, contabilidad, cuentas-por-cobrar, dificil, 50, 1
--   b5-t6-a7, contabilidad, cuentas-por-cobrar, facil,   10, 1
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie las juegue (con `=`,
-- como la 0070, la 0072 y la 0074: la forma `in (...)` es la de los borrados
-- que la prueba del catálogo da por corridos). ESCRITA, NO CORRIDA:
--   delete from public.actividad_catalogo where activity_id = 'b5-t6-a4';
--   delete from public.actividad_catalogo where activity_id = 'b5-t6-a5';
--   delete from public.actividad_catalogo where activity_id = 'b5-t6-a6';
--   delete from public.actividad_catalogo where activity_id = 'b5-t6-a7';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('b5-t6-a4',                     'contabilidad', 'cuentas-por-cobrar',        'evaluativa', 'medio',    25, 1),
  ('b5-t6-a5',                     'contabilidad', 'cuentas-por-cobrar',        'evaluativa', 'medio',    25, 1),
  ('b5-t6-a6',                     'contabilidad', 'cuentas-por-cobrar',        'evaluativa', 'dificil',  50, 1),
  ('b5-t6-a7',                     'contabilidad', 'cuentas-por-cobrar',        'evaluativa', 'facil',    10, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 4 filas, contabilidad, cuentas-por-cobrar, con su dificultad, sus FP y 1 etapa.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id in ('b5-t6-a4', 'b5-t6-a5', 'b5-t6-a6', 'b5-t6-a7')
order by activity_id;
