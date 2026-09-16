-- ═══════════════════════════════════════════════════════════════════════════
-- 0031 — POLÍTICA MONETARIA: "LA SALA DE MÁQUINAS"
--
-- Los doce juegos del tema nuevo, con la misma distribución que Política
-- Económica, Demanda Agregada y Política Fiscal: 2 Fácil, 3 Medio, 4 Difícil y
-- 3 Experto. Las bases son las de la plataforma, 10 / 25 / 50 / 90 —la ficha
-- decía 18 / 36 / 54 / 90 y se corrigió en su addendum—, así que el tema da
-- 565 FP como máximo, igual que los otros tres.
--
-- Las tres piezas de Aprender no entran: material teórico, cero FP.
--
-- Solo filas del catálogo. Ni una columna —el subtema de cada actividad es un
-- metadato del banco en el cliente, sin migración—, ni una función, ni una
-- fila de fp_history. PM-1 es exploratoria; las otras once, evaluativas.
--
-- Va DESPUÉS de la 0030 y no depende de la 0028: se puede correr dos veces, el
-- on conflict reescribe las mismas filas.
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base) values
  -- Cimientos
  ('memorama-banco-central', 'macroeconomia', 'politica-monetaria', 'exploratoria', 'facil', 10),
  ('quien-decide-esto', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'facil', 10),
  -- Aplicación
  ('volante-de-la-tasa', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'medio', 25),
  ('caja-de-herramientas', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'medio', 25),
  ('a-quien-le-pega-la-tasa', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'medio', 25),
  -- Análisis
  ('cadena-de-transmision', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'dificil', 50),
  ('explicaselo-a-un-deudor', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'dificil', 50),
  ('corriente-de-decisiones', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'dificil', 50),
  ('el-rezago', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'dificil', 50),
  -- Maestría
  ('dilema-banquero-central', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'experto', 90),
  ('duelo-de-instrumentos', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'experto', 90),
  ('disena-respuesta-monetaria', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'experto', 90)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id, topic_id = excluded.topic_id, modalidad = excluded.modalidad,
  dificultad = excluded.dificultad, fp_base = excluded.fp_base;
