-- ---------------------------------------------------------------------------
-- 0042 — CONTABILIDAD: «LAS CUENTAS, EL DEBE Y EL HABER»
--
-- El primer tema de la tercera materia. Doce juegos con la misma distribución
-- que los cuatro temas de Macroeconomía —2 Fácil, 3 Medio, 4 Difícil y 3
-- Experto, con las bases de la plataforma 10 / 25 / 50 / 90—, así que el tema
-- da 565 FP como máximo, igual que los otros. Y un desafío de cuatro etapas,
-- el tercero del sitio, que vale 90 × 4 = 360 y va al lado del camino.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do update`. Correrla dos
-- veces deja exactamente lo mismo que correrla una. No toca ninguna función,
-- ninguna tabla, ninguna columna y ninguna fila de ningún estudiante.
--
-- QUÉ NECESITA PARA CORRER: que exista actividad_catalogo con su columna
-- `etapas`, o sea la 0011 y la 0014, aplicadas hace tiempo. No depende de la
-- 0040 (asistente_uso), que sigue en pausa, ni de la 0041.
--
-- ES LA PRIMERA FILA DE ESTA MATERIA. `subject_id` no está restringido a una
-- lista en ninguna migración —el catálogo guarda actividades, no materias—,
-- así que 'contabilidad' entra sin más trámite.
--
-- LAS DOCE ENTRAN AUNQUE HOY SOLO CINCO SE PUEDAN JUGAR. El catálogo es la
-- ficha del tema, no el inventario de lo construido, y el servidor no otorga
-- FP por una fila que exista: otorga por una actividad que alguien termine.
-- Las siete que faltan no las puede terminar nadie todavía.
--
-- LAS CUATRO PIEZAS DE APRENDER NO ENTRAN: material teórico, cero FP, como las
-- de Política Monetaria en la 0031.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 13 filas
-- —doce juegos y el desafío—, con 565 FP sumados en el camino y 360 en el
-- desafío.
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  -- Cimientos
  ('cu-izquierda-o-derecha', 'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'facil', 10, 1),
  ('cu-de-que-familia', 'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'facil', 10, 1),
  -- Aplicación
  ('cu-cuadro-dinamicas', 'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'medio', 25, 1),
  ('cu-debita-o-acredita', 'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'medio', 25, 1),
  ('cu-saldo-de-la-cuenta', 'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'medio', 25, 1),
  -- Análisis
  ('cu-arma-el-asiento', 'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'dificil', 50, 1),
  ('cu-simple-o-compuesto', 'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'dificil', 50, 1),
  ('cu-cuadra-o-no', 'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'dificil', 50, 1),
  ('cu-corriente-de-cuentas', 'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'dificil', 50, 1),
  -- Maestría
  ('cu-asiento-compuesto', 'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'experto', 90, 1),
  ('cu-mayorizacion', 'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'experto', 90, 1),
  ('cu-error-escondido', 'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'experto', 90, 1),
  -- El desafío, al lado del camino: cuatro etapas, 90 × 4 = 360 FP
  ('ciclo-completo', 'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'experto', 90, 4)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base,
  etapas     = excluded.etapas;

-- ---------------------------------------------------------------------------
-- Resumen: trece filas, y los FP calculados como los calcula el servidor.
-- El camino tiene que sumar 565 y el desafío 360.
-- ---------------------------------------------------------------------------
select
  count(*) as filas,
  sum(case when etapas = 1 then fp_base else 0 end) as fp_del_camino,
  sum(case when etapas > 1 then fp_base * least(etapas, 4) else 0 end) as fp_del_desafio
from public.actividad_catalogo
where topic_id = 'cuentas-debe-haber';
