-- ---------------------------------------------------------------------------
-- 0043 — CONTABILIDAD: EL TEMA PASA DE DOCE ACTIVIDADES A SIETE
--
-- Decisión de Mateo, ya confirmada: «Las cuentas, el debe y el haber» se
-- rediseña con siete juegos en vez de doce, y el tema pasa de 565 FP a 260
-- (2 Fácil ×10 + 2 Medio ×25 + 2 Difícil ×50 + 1 Experto ×90). El desafío «El
-- Ciclo Completo» no se toca: sigue valiendo 360.
--
-- DOS COSAS HACE ESTA MIGRACIÓN, Y NADA MÁS:
--
--   1. Sube «El Saldo de la Cuenta» de Medio/25 a Difícil/50.
--   2. Borra del catálogo las cinco que salen del tema:
--        cu-simple-o-compuesto   (50)
--        cu-cuadra-o-no          (50)
--        cu-corriente-de-cuentas (50)
--        cu-mayorizacion         (90)
--        cu-error-escondido      (90)      → 330 FP retirados
--
-- ═══════════ NO BORRA NI UNA RESPUESTA DE NINGÚN ESTUDIANTE ═══════════
--
-- Comprobado antes de escribirla, no supuesto:
--
--   · `fp_history` NO tiene clave foránea contra `actividad_catalogo`. Borrar
--     una fila del catálogo no arrastra ninguna fila de historia.
--   · Las migraciones del panel docente (0005, 0019, 0021, 0023, 0024) no
--     mencionan `actividad_catalogo` ni una vez: el panel lee `fp_detalle` y
--     `fp_history`, así que las respuestas viejas se siguen viendo.
--   · La 0042 no usa `guarda_progreso`, así que no hay nada que se caiga en
--     cascada por `partida_en_curso`.
--
-- Y el front las sigue traduciendo: los ids de ítem de las actividades
-- retiradas conservan su etiqueta en el panel docente.
--
-- ═══════════ EL ORDEN IMPORTA: PRIMERO SE DESPLIEGA, DESPUÉS SE CORRE ═══════════
--
-- `registrar_fp` levanta 22023 «Actividad desconocida» para un activity_id que
-- no esté en el catálogo. Si esta migración corre ANTES de que el navegador
-- del estudiante tenga el bundle nuevo, alguien con la página vieja abierta
-- podría terminar una de las cinco y recibir ese error en vez de sus FP.
--
-- Correr esta migración DESPUÉS de que el despliegue esté en producción. No es
-- opcional.
--
-- ADITIVA Y REPETIBLE en lo que actualiza, y el borrado es idempotente por
-- construcción: correrla dos veces deja exactamente lo mismo.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 8 filas
-- —siete juegos y el desafío—, con 260 FP en el camino y 360 en el desafío.
-- ---------------------------------------------------------------------------

-- 1. El Saldo de la Cuenta sube de Medio a Difícil.
--
-- Va como insert con `on conflict do update` y no como un update suelto, por
-- dos razones: es la forma que usa el resto del repo para tocar el catálogo, y
-- es la única que la prueba que compara cliente y servidor sabe leer. Un
-- update a secas le pasa desapercibido, y entonces el cliente diría 50 y el
-- servidor seguiría pagando 25 sin que nada fallara.
insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('cu-saldo-de-la-cuenta', 'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'dificil', 50, 1)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base,
  etapas     = excluded.etapas;

-- 2. Las cinco que salen del tema.
delete from public.actividad_catalogo
 where activity_id in (
   'cu-simple-o-compuesto',
   'cu-cuadra-o-no',
   'cu-corriente-de-cuentas',
   'cu-mayorizacion',
   'cu-error-escondido'
 );

-- ---------------------------------------------------------------------------
-- Resumen: ocho filas, y los FP calculados como los calcula el servidor.
-- El camino tiene que sumar 260 y el desafío 360.
-- ---------------------------------------------------------------------------
select
  count(*) as filas,
  sum(case when etapas = 1 then fp_base else 0 end) as fp_del_camino,
  sum(case when etapas > 1 then fp_base * least(etapas, 4) else 0 end) as fp_del_desafio
from public.actividad_catalogo
where topic_id = 'cuentas-debe-haber';
