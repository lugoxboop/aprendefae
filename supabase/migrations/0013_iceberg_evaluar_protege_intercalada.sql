-- ---------------------------------------------------------------------------
-- 0013 — Tres actividades nuevas del Modelo del Iceberg entran al catálogo.
--
-- ADITIVA Y REPETIBLE. Solo mete tres filas en actividad_catalogo. No toca
-- funciones, ni políticas, ni datos de nadie: correrla dos veces deja lo mismo
-- que correrla una.
--
-- POR QUÉ NO SE EDITA LA 0011. Esa ya está aplicada en producción, y editar un
-- archivo de migración ya corrido no cambia nada en la base: solo hace que el
-- archivo mienta sobre lo que hay. Las filas nuevas entran por su propia
-- migración.
--
-- QUÉ SON LAS TRES. Completan el recorrido del tema: el peldaño Evaluar de
-- Bloom, que faltaba, y dos formas de practicar lo ya visto que no son más de
-- lo mismo.
--
--   tribunal-profundidad     Evaluar. Ordenar tres explicaciones que funcionan
--                            por cuánto explican. Experto: no hay opción que se
--                            vea mal a simple vista.
--   transmision-superficie   Efecto protégé. Explicárselo a quien baja por
--                            primera vez, con jerga y falsedades en el banco.
--   corriente-cruzada        Práctica intercalada. Los cuatro casos del tema
--                            mezclados y nunca dos seguidos del mismo.
--
-- LA DIFICULTAD LA PONE EL SERVIDOR, y estas tres filas son esa decisión. El
-- cliente declara lo mismo en src/data/subjects.js porque necesita dibujar la
-- interfaz, y catalogo.test.mjs compara los dos y falla si se separan.
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base) values
  ('tribunal-profundidad', 'pensamiento-estrategico', 'modelo-iceberg', 'evaluativa', 'experto', 90),
  ('transmision-superficie', 'pensamiento-estrategico', 'modelo-iceberg', 'evaluativa', 'dificil', 50),
  ('corriente-cruzada', 'pensamiento-estrategico', 'modelo-iceberg', 'evaluativa', 'dificil', 50)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base;
