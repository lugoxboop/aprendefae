-- ═══════════════════════════════════════════════════════════════════════════
-- 0030 — QUINCE JUEGOS: LOS CUATRO BLOQUES LLENOS EN LOS TRES TEMAS
--
-- Política Económica, Demanda Agregada y Política Fiscal pasan de 7 a 12
-- juegos cada uno: 2 Fácil, 3 Medio, 4 Difícil y 3 Experto. Seis son los
-- primeros Fácil del catálogo (Cimientos).
--
-- SOLO FILAS DEL CATÁLOGO. Ni una columna, ni una función, ni una fila de
-- fp_history. El check de dificultad admite 'facil' y el de modalidad
-- 'exploratoria' desde la 0011, y registrar_fp ya sabía pagarlas: no hubo
-- que enseñarle nada al servidor.
--
-- 18 FP EN FÁCIL, Y NO 10. motor.js (la referencia legible, que ya no
-- calcula en producción) dice facil = 10. La ficha de los Memoramas dice 18,
-- y la primera clasificación va a 18 también: una base por dificultad, como
-- 25 / 50 / 90 en las otras tres. En el servidor lo que manda es fp_base de
-- esta tabla, así que la diferencia con motor.js no cambia ningún pago; está
-- señalada para que se decida si motor.js sube a 18 o la ficha baja a 10.
--
-- OJO CON LA DEFENSA DE TIEMPO. fp_tiempo_minimo_ms('facil') es 20 s, y por
-- debajo registrar_fp paga el 60 %. El Memorama de la Tesorería tiene 3
-- parejas (6 cartas) y se puede terminar en menos: 18 × 0,6 = 11 FP. No se
-- toca aquí —el umbral es de todas las Fácil y está marcado como provisional
-- desde la 0011—, pero se dice.
--
-- Se puede correr dos veces: el on conflict reescribe las mismas filas.
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base) values
  -- Política Económica
  ('memorama-tesoro', 'macroeconomia', 'politica-economica', 'exploratoria', 'facil', 18),
  ('que-rama-es', 'macroeconomia', 'politica-economica', 'evaluativa', 'facil', 18),
  ('se-acerca-o-se-aleja', 'macroeconomia', 'politica-economica', 'evaluativa', 'medio', 25),
  ('expediente-gabinete', 'macroeconomia', 'politica-economica', 'evaluativa', 'dificil', 50),
  ('consejo-ministros', 'macroeconomia', 'politica-economica', 'evaluativa', 'experto', 90),
  -- Demanda Agregada
  ('memorama-corazon', 'macroeconomia', 'demanda-agregada', 'exploratoria', 'facil', 18),
  ('cual-componente', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'facil', 18),
  ('quien-beneficia-auge', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'medio', 25),
  ('explica-paciente', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'dificil', 50),
  ('sala-espera-llena', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'experto', 90),
  -- Política Fiscal
  ('memorama-tesoreria', 'macroeconomia', 'politica-fiscal', 'exploratoria', 'facil', 18),
  ('cobra-gasta-o-pide', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'facil', 18),
  ('quien-afecta-ajuste', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'medio', 25),
  ('explica-contribuyente', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'dificil', 50),
  ('comite-presupuesto', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'experto', 90)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id, topic_id = excluded.topic_id, modalidad = excluded.modalidad,
  dificultad = excluded.dificultad, fp_base = excluded.fp_base;
