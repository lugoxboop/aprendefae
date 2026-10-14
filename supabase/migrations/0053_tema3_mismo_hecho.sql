-- ---------------------------------------------------------------------------
-- 0053 — CONTABILIDAD, TEMA 3: ACT. 3 «EL MISMO HECHO, DOS EMPRESAS»
--
-- La actividad de Hacer que va en el nodo 5 del camino del Tema 3, entre
-- «Arma el ajuste diferido» y «¿Qué le toca a este periodo?»:
--
--   t3-mismo-hecho                 El mismo hecho, dos empresas  Análisis   ·  50
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing` (Levi):
-- correrla dos veces no cambia nada. No hace ALTER, UPDATE ni DELETE, y no
-- toca ninguna tabla de estudiantes.
--
-- NO DEPENDE DE LA 0052. La 0052 es de Política Monetaria (otra rama, sin
-- fusionar); esta no la necesita. Las migraciones se aplican por orden de
-- nombre, y un número que falta en medio no rompe nada.
--
-- QUÉ NECESITA PARA CORRER: actividad_catalogo con su columna `etapas` —la
-- 0011 y la 0014—.
--
-- EL ORDEN: Mateo la corre en producción ANTES de fusionar. Un estudiante que
-- termine la actividad antes de que exista su fila recibiría 22023 en vez de
-- sus FP.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 1 fila,
-- contabilidad, dificil, 50.
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('t3-mismo-hecho',               'contabilidad', 'ingresos-gastos-y-caja',    'evaluativa', 'dificil', 50, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 1 fila, contabilidad, dificil (Análisis), 50 FP.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id = 't3-mismo-hecho';
