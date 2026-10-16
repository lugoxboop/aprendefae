-- ---------------------------------------------------------------------------
-- 0253 — CONTABILIDAD, REPASO DEL CAPÍTULO 5: r5-4 «SEPTIEMBRE EN BARRANQUILLA» (Célula E)
--
-- La cuarta actividad de Hacer del tema transversal `repaso-capitulo-5`, el
-- 6 del bloque D, pp. 273-274, en diez asientos (sin los fletes del 25 y del
-- 28: paquete e5-r5-4-v1, decisión 7):
--
--   r5-4   Septiembre en Barranquilla   Experto · evaluativa · 90
--
-- Del rango de la Célula E (0250-0299). Va después de la 0252 (r5-3).
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`, como la
-- 0252: correrla dos veces no cambia nada. No hace ALTER, UPDATE ni DELETE, y
-- no toca ninguna tabla de estudiantes. Solo agrega la fila de su propio tema.
--
-- LA MODALIDAD: evaluativa, decisión de Kamogawa: el motor escala los 90 FP
-- con los aciertos, con piso del 50 %. Con diez asientos, 9 FP por acierto:
-- nunca hay mitad que el navegador y el servidor redondeen distinto.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (le añade
-- la columna `etapas`). Nada más.
--
-- EL ORDEN: se aplica sola al fusionar el PR que la trae (el guardián de
-- #193). La Célula E no la corre a mano.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 1 fila,
-- r5-4, contabilidad, repaso-capitulo-5, evaluativa, experto, 90, 1.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie la juegue (escrito,
-- no se corre):
--   delete from public.actividad_catalogo where activity_id = 'r5-4';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('r5-4', 'contabilidad', 'repaso-capitulo-5', 'evaluativa', 'experto', 90, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 1 fila, r5-4, contabilidad, repaso-capitulo-5, evaluativa, experto, 90 FP, 1 etapa.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id = 'r5-4';
