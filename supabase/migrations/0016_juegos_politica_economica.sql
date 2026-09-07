-- ---------------------------------------------------------------------------
-- 0016 — Cinco juegos nuevos de Política Económica entran al catálogo.
--
-- ADITIVA Y REPETIBLE. Cinco filas, nada más. No toca funciones, ni políticas,
-- ni columnas, ni una sola fila de fp_history. Correrla dos veces deja lo mismo
-- que correrla una.
--
-- QUÉ ENTRA:
--
--   quien-gana-quien-pierde  Rol de actor. Cuatro medidas reales y cuatro
--                            personajes cada una: quién gana y quién pierde.
--                            Medio, 25 FP.
--   corriente-titulares      Práctica intercalada. Dieciocho enunciados en una
--                            cinta que acelera. Difícil, 50 FP.
--   explica-la-politica      Efecto protégé. Explicarle una medida a alguien
--                            sin formación, con jerga y falsedades en el banco.
--                            Difícil, 50 FP.
--   tablero-decisiones       Tres palancas, tres indicadores y dos metas que
--                            jalan para lados distintos. Experto, 90 FP.
--   simulador-de-crisis      Se da el problema y hay que construir la cadena
--                            entera. Experto, 90 FP.
--
-- SOBRE tablero-decisiones. Sustituye al dashboard-economico que la 0015 dejó
-- retirado: hereda su modelo verificado —los coeficientes que pasaron el
-- barrido de las 41.943 combinaciones— y ninguna línea de su interfaz. Son dos
-- filas distintas a propósito: la vieja se queda como lápida y la nueva nace
-- limpia, sin heredar el historial de la otra.
--
-- SOBRE explica-la-politica. La ficha pedía dificultad "media-alta", que no
-- existe en este sistema: las gradas son facil, medio, dificil y experto. Se
-- clasifica como dificil, y el cliente declara lo mismo.
--
-- La dificultad la fija el servidor, y estas filas SON esa decisión. El cliente
-- declara lo mismo en src/data/subjects.js porque necesita dibujar la interfaz,
-- y catalogo.test.mjs compara los dos y falla si se separan.
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base) values
  ('quien-gana-quien-pierde', 'macroeconomia', 'politica-economica', 'evaluativa', 'medio', 25),
  ('corriente-titulares', 'macroeconomia', 'politica-economica', 'evaluativa', 'dificil', 50),
  ('explica-la-politica', 'macroeconomia', 'politica-economica', 'evaluativa', 'dificil', 50),
  ('tablero-decisiones', 'macroeconomia', 'politica-economica', 'evaluativa', 'experto', 90),
  ('simulador-de-crisis', 'macroeconomia', 'politica-economica', 'evaluativa', 'experto', 90)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base;
