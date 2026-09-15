-- ═══════════════════════════════════════════════════════════════════════════
-- 0030 — QUINCE JUEGOS: LOS CUATRO BLOQUES LLENOS EN LOS TRES TEMAS
--
-- Política Económica, Demanda Agregada y Política Fiscal pasan de 7 a 12
-- juegos cada uno: 2 Fácil, 3 Medio, 4 Difícil y 3 Experto. Seis son los
-- primeros Fácil del catálogo (Cimientos).
--
-- Dos cosas: las filas del catálogo, y el piso de tiempo de Fácil (abajo).
-- Ni una columna nueva, ni una fila de fp_history. El check de dificultad
-- admite 'facil' y el de modalidad 'exploratoria' desde la 0011, y
-- registrar_fp ya sabía pagarlas.
--
-- ═══════════ FÁCIL PAGA 10 ═══════════
--
-- La base de Fácil es 10, la de motor.js. La ficha daba 18 a los Memoramas y
-- en una primera versión de esta migración se extendió a las seis —las
-- primeras clasificaciones no traían puntaje, y heredaron el 18 sin fuente—.
-- Se corrigió antes de aplicarla: con 18, una Fácil pagaba casi lo mismo que
-- una Media (25, o 21 con cinco de seis) y la escala de dificultad dejaba de
-- decirle nada al estudiante.
--
-- Se puede correr dos veces: el on conflict reescribe las mismas filas.
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base) values
  -- Política Económica
  ('memorama-tesoro', 'macroeconomia', 'politica-economica', 'exploratoria', 'facil', 10),
  ('que-rama-es', 'macroeconomia', 'politica-economica', 'evaluativa', 'facil', 10),
  ('se-acerca-o-se-aleja', 'macroeconomia', 'politica-economica', 'evaluativa', 'medio', 25),
  ('expediente-gabinete', 'macroeconomia', 'politica-economica', 'evaluativa', 'dificil', 50),
  ('consejo-ministros', 'macroeconomia', 'politica-economica', 'evaluativa', 'experto', 90),
  -- Demanda Agregada
  ('memorama-corazon', 'macroeconomia', 'demanda-agregada', 'exploratoria', 'facil', 10),
  ('cual-componente', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'facil', 10),
  ('quien-beneficia-auge', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'medio', 25),
  ('explica-paciente', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'dificil', 50),
  ('sala-espera-llena', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'experto', 90),
  -- Política Fiscal
  ('memorama-tesoreria', 'macroeconomia', 'politica-fiscal', 'exploratoria', 'facil', 10),
  ('cobra-gasta-o-pide', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'facil', 10),
  ('quien-afecta-ajuste', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'medio', 25),
  ('explica-contribuyente', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'dificil', 50),
  ('comite-presupuesto', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'experto', 90)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id, topic_id = excluded.topic_id, modalidad = excluded.modalidad,
  dificultad = excluded.dificultad, fp_base = excluded.fp_base;

-- ═══════════════════════════════════════════════════════════════════════════
-- EL PISO DE TIEMPO DE FÁCIL: DE 20 s A 5 s. NO ES RELAJAR LA DEFENSA.
--
-- Por debajo del mínimo, registrar_fp paga el 60 %. Con 20 s, ese recorte caía
-- sobre quien jugaba BIEN: en Fácil hay actividades legítimamente breves. Se
-- midió con los componentes reales (scripts/medir-faciles.mjs, 300 partidas
-- por juego) un jugador honesto y rápido —lee a 350 palabras por minuto,
-- decide en 300 ms, no se equivoca—:
--
--                          más rápida   p10     mediana
--   Memorama, 3 parejas       6,1 s     9,4 s   10,6 s
--   Memorama, 4 parejas       6,8 s    12,0 s   14,7 s
--   Memorama, 6 parejas      12,3 s    16,4 s   20,4 s
--   Primeras clasificaciones 10,3 s    10,6 s   11,1 s  (la más rápida de las tres)
--
-- Con 20 s, CASI TODAS esas partidas honestas cobraban el 60 % sin que el
-- estudiante supiera por qué. 5 s deja pasar la más rápida medida (6,1 s,
-- que ya es un Memorama con suerte y memoria perfecta) con un segundo de
-- margen.
--
-- LO QUE SIGUE ATRAPANDO: quien pasa por la actividad sin leer. Tocando sin
-- leer ni esperar nada que la actividad no obligue, las clasificaciones se
-- terminan en ~0 s y los Memoramas entre 0 y 2,7 s (lo que imponen los
-- volteos de 900 ms): todo por debajo de 5 s.
--
-- LO QUE NO ATRAPA, NI ATRAPABA CON 20 s: el tiempo lo informa el cliente.
-- Quien llame a registrar_fp a mano con p_duration_ms inventado pasa cualquier
-- umbral, de cualquier dificultad. Contra eso protege que repetir paga 0: una
-- Fácil da como mucho 10 FP una sola vez.
--
-- Medio, Difícil y Experto quedan como estaban. Si en el piloto aparecen
-- Fácil más largas, el piso se revisa con fp_history.duration_ms reales,
-- que es la medida buena; la del script es un modelo.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.fp_tiempo_minimo_ms(p_dificultad text)
returns integer
language sql
immutable
as $$
  select case p_dificultad
    when 'facil'   then 5000
    when 'medio'   then 45000
    when 'dificil' then 90000
    when 'experto' then 150000
    else 0
  end;
$$;
