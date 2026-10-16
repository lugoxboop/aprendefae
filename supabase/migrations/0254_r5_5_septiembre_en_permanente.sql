-- ---------------------------------------------------------------------------
-- 0254 — CONTABILIDAD, REPASO DEL CAPÍTULO 5: r5-5 «SEPTIEMBRE EN PERMANENTE» (Célula E)
--
-- La quinta actividad de Hacer del tema transversal `repaso-capitulo-5`: el
-- mismo septiembre de r5-4 (Barranquilla), ahora en permanente, con su
-- kárdex en promedio ponderado móvil (paquete e5-r5-5-v1, v1.3):
--
--   r5-5   Septiembre en permanente   Difícil · evaluativa · 50
--
-- Del rango de la Célula E (0250-0299). Va después de la 0253 (r5-4).
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`, como la
-- 0253: correrla dos veces no cambia nada. No hace ALTER, UPDATE ni DELETE, y
-- no toca ninguna tabla de estudiantes. Solo agrega la fila de su propio tema.
--
-- LA MODALIDAD: evaluativa, decisión de Kamogawa: el motor escala los 50 FP
-- con los aciertos, con piso del 50 %. Con cinco pantallas, 10 FP por
-- acierto: nunca hay mitad que el navegador y el servidor redondeen distinto.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (le añade
-- la columna `etapas`). Nada más.
--
-- EL ORDEN: se aplica sola al fusionar el PR que la trae (el guardián de
-- #193). La Célula E no la corre a mano.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 1 fila,
-- r5-5, contabilidad, repaso-capitulo-5, evaluativa, dificil, 50, 1.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie la juegue (escrito,
-- no se corre):
--   delete from public.actividad_catalogo where activity_id = 'r5-5';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('r5-5', 'contabilidad', 'repaso-capitulo-5', 'evaluativa', 'dificil', 50, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 1 fila, r5-5, contabilidad, repaso-capitulo-5, evaluativa, dificil, 50 FP, 1 etapa.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id = 'r5-5';
