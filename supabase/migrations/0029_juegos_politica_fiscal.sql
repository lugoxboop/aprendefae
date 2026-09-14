-- ---------------------------------------------------------------------------
-- 0029 — Los siete juegos de Política Fiscal entran al catálogo.
--
-- ADITIVA Y REPETIBLE. Mete siete filas en actividad_catalogo. No toca
-- funciones, ni políticas, ni columnas, NI UNA SOLA FILA DE fp_history.
-- Correrla dos veces deja lo mismo que correrla una.
--
-- NO DEPENDE DE LA 0028. Solo usa la tabla y las columnas de la 0011 y la
-- 0014, así que se puede aplicar antes o después de ella: el número es el
-- orden del repositorio, no una dependencia.
--
-- ═══════════ QUÉ ENTRA ═══════════
--
--   clasificador-tesoro      Recordar. Las tarjetas del profesor: doce de
--                            dieciocho, a tres ranuras. Medio, 25 FP.
--   directos-indirectos      Comprender. Ocho impuestos, cuatro sellos.
--                            Medio, 25 FP.
--   flujo-de-caja            Aplicar. Por qué canal llega cada medida a la
--                            Demanda Agregada, y el multiplicador. Difícil, 50 FP.
--   agujero-fiscal           Analizar. Un caso de prensa, una decisión, todo
--                            o nada. Difícil, 50 FP.
--   expansiva-contractiva    Evaluar. Duelos por parejas. Experto, 90 FP.
--   disena-presupuesto       Crear. Dos casillas y ocho señuelos.
--                            Experto, 90 FP.
--   deficit-vs-deuda         Aplicar, intercalado. Diez papeles de catorce.
--                            Difícil, 50 FP.
--
-- Las siete son evaluativas: se contesta una vez por ítem y el porcentaje mide
-- desempeño. La dificultad la fija el servidor y estas filas SON esa decisión;
-- el cliente declara lo mismo en src/data/subjects.js porque necesita dibujar
-- la interfaz, y catalogo.test.mjs compara los dos y falla si se separan.
--
-- ═══════════ LO QUE ESTO MUEVE SIN TOCARLO ═══════════
--
-- Nada del servidor. Fuera de registrar_fp y partida_guardar, ninguna función
-- lee actividad_catalogo, así que ni las ligas ni las medallas del servidor
-- cambian con estas filas.
--
-- En el CLIENTE sí: la medalla "Macroeconomía al día" se calcula al vuelo con
-- todos los juegos Hacer de la materia, así que pasa de 14 a 21. Está anotado
-- en subjects.js.
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base) values
  ('clasificador-tesoro', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'medio', 25),
  ('directos-indirectos', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'medio', 25),
  ('flujo-de-caja', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'dificil', 50),
  ('agujero-fiscal', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'dificil', 50),
  ('expansiva-contractiva', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'experto', 90),
  ('disena-presupuesto', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'experto', 90),
  ('deficit-vs-deuda', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'dificil', 50)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base;
