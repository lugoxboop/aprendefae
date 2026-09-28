-- ---------------------------------------------------------------------------
-- 0045 — CONTABILIDAD, TEMA 1: LAS OTRAS CUATRO ACTIVIDADES
--
-- Las cuatro estaban construidas y probadas en el repo desde hace varios
-- commits, pero fuera de las dos puertas —el catálogo del cliente y el
-- registro de la vista— porque preguntaban por cosas que nadie le había
-- explicado al estudiante: les faltaban las piezas 2, 3 y 4 del Aprender.
--
-- Esas tres piezas ya existen, así que las cuatro entran:
--
--   t1-que-le-pasa-a-cada-uno      ¿Qué Le Pasa a Cada Uno?     Medio   ·  25
--   t1-la-ecuacion-en-movimiento   La Ecuación en Movimiento    Difícil ·  50
--   t1-en-cual-estado-aparece      ¿En Cuál Estado Aparece?     Difícil ·  50
--   t1-la-articulacion             La Articulación              Experto ·  90
--
-- LAS TRES PIEZAS DE APRENDER NO ENTRAN AQUÍ. Son material teórico: cero FP,
-- sin dificultad y sin modalidad, y no van al catálogo. Igual que la pieza 1,
-- que nunca tuvo fila.
--
-- FP DEL TEMA: la 0044 dejó 20. Esta aporta 215, y el tema queda en 235. El
-- destino eran 260; los 25 que faltan son la T1-3, que sigue retenida por
-- revisión del profesor y no se construyó.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do update`. Correrla dos
-- veces deja exactamente lo mismo. No toca ninguna fila de ningún estudiante.
--
-- QUÉ NECESITA PARA CORRER: actividad_catalogo con su columna `etapas` —la
-- 0011 y la 0014—. No depende de la 0043 ni de la 0044, aunque el resumen del
-- final cuenta las dos filas que metió la 0044.
--
-- EL ORDEN, COMO SIEMPRE: primero el despliegue, después la migración. Al
-- revés no rompe nada —estas filas son nuevas, no retiradas— pero un
-- estudiante que termine una de las cuatro antes de que exista su fila
-- recibiría 22023 en vez de sus FP.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 6 filas y
-- 235 FP.
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('t1-que-le-pasa-a-cada-uno',    'contabilidad', 'introduccion-contabilidad', 'evaluativa', 'medio',   25, 1),
  ('t1-la-ecuacion-en-movimiento', 'contabilidad', 'introduccion-contabilidad', 'evaluativa', 'dificil', 50, 1),
  ('t1-en-cual-estado-aparece',    'contabilidad', 'introduccion-contabilidad', 'evaluativa', 'dificil', 50, 1),
  ('t1-la-articulacion',           'contabilidad', 'introduccion-contabilidad', 'evaluativa', 'experto', 90, 1)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base,
  etapas     = excluded.etapas;

-- ---------------------------------------------------------------------------
-- Resumen: seis filas y 235 FP. Las 25 que faltan para 260 son la T1-3.
-- ---------------------------------------------------------------------------
select
  count(*) as filas,
  sum(fp_base) as fp_del_tema
from public.actividad_catalogo
where topic_id = 'introduccion-contabilidad';
