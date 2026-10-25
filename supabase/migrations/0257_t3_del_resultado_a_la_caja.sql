-- ---------------------------------------------------------------------------
-- 0257 — CONTABILIDAD, TEMA 3: «DEL RESULTADO A LA CAJA» (Célula E)
--
-- La actividad de Hacer que va detrás de «Cerrar el periodo» y antes de
-- «El cierre completo» (paquete e3-t3-del-resultado-a-la-caja-v4, §1; PASA
-- de diseño de Takamura con A1 a A7):
--
--   t3-del-resultado-a-la-caja   Del resultado a la caja   Difícil · evaluativa · 50
--
-- Del rango de la Célula E (0255-0299). La 0256 es «¿Gasto o pago?»; esta es
-- la siguiente libre.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`, como la
-- 0256: correrla dos veces no cambia nada. No hace ALTER, UPDATE ni DELETE, y
-- no toca ninguna tabla de estudiantes ni ninguna fila de otra actividad.
-- Solo agrega la fila de su propio tema.
--
-- LA MODALIDAD: evaluativa. El motor escala los 50 FP con las fichas bien
-- puestas de la partida (4 en la versión A, 6 en la B).
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (le añade
-- la columna `etapas`). Nada más.
--
-- EL ORDEN: se aplica sola al fusionar el PR que la trae (el guardián de
-- #193). La Célula E no la corre a mano.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 1 fila,
-- t3-del-resultado-a-la-caja, contabilidad, ingresos-gastos-y-caja,
-- evaluativa, dificil, 50, 1.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie la juegue (escrito,
-- no se corre):
--   delete from public.actividad_catalogo where activity_id = 't3-del-resultado-a-la-caja';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('t3-del-resultado-a-la-caja', 'contabilidad', 'ingresos-gastos-y-caja', 'evaluativa', 'dificil', 50, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 1 fila, t3-del-resultado-a-la-caja, contabilidad, ingresos-gastos-y-caja, evaluativa, dificil, 50 FP, 1 etapa.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id = 't3-del-resultado-a-la-caja';
