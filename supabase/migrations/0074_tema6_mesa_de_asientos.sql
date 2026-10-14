-- ---------------------------------------------------------------------------
-- 0074 — CONTABILIDAD, TEMA 6: ACTS. 2 Y 3 DE HACER, LA MESA DE ASIENTOS
-- (Célula B)
--
-- Las dos mesas de asientos del Tema 6, después de «¿Clientes o otra cuenta
-- por cobrar?» (b5-t6-a1, la 0071):
--
--   b5-t6-a2   La provisión de El Torito          Media   ·  25
--   b5-t6-a3   Cuando la deuda castigada vuelve   Difícil ·  50
--
-- La dificultad y los FP los decidió Sakuta.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`, como la 0070,
-- la 0071 y la 0072: correrla dos veces no cambia nada. No hace ALTER, UPDATE
-- ni DELETE, y no toca ninguna tabla de estudiantes.
--
-- EL TEMA: `cuentas-por-cobrar`, el de la 0071.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (le añade
-- la columna `etapas`). Nada más.
--
-- DE QUÉ NO DEPENDE: de ninguna otra. En particular, no de la 0071
-- (b5-t6-a1): no lee ni toca su fila, y se pueden correr en cualquier orden.
-- Un número que falta en medio no rompe nada: las migraciones se aplican por
-- orden de nombre.
--
-- EL ORDEN: Mateo la corre en producción ANTES de fusionar el PR que la trae.
-- Un estudiante que termine una de las dos actividades antes de que exista su
-- fila recibiría 22023 en vez de sus FP.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 2 filas:
--   b5-t6-a2, contabilidad, cuentas-por-cobrar, medio,   25, 1
--   b5-t6-a3, contabilidad, cuentas-por-cobrar, dificil, 50, 1
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie las juegue (con `=`,
-- como la 0070 y la 0072: la forma `in (...)` es la de los borrados que la
-- prueba del catálogo da por corridos):
--   delete from public.actividad_catalogo where activity_id = 'b5-t6-a2';
--   delete from public.actividad_catalogo where activity_id = 'b5-t6-a3';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('b5-t6-a2',                     'contabilidad', 'cuentas-por-cobrar',        'evaluativa', 'medio',    25, 1),
  ('b5-t6-a3',                     'contabilidad', 'cuentas-por-cobrar',        'evaluativa', 'dificil',  50, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 2 filas, contabilidad, cuentas-por-cobrar, con su dificultad, sus FP y 1 etapa.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id in ('b5-t6-a2', 'b5-t6-a3')
order by activity_id;
