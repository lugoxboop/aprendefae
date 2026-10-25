-- ---------------------------------------------------------------------------
-- 0256 — CONTABILIDAD, TEMA 3: «¿GASTO O PAGO?» (Célula E)
--
-- La actividad de Hacer que va justo detrás de «¿Ingreso o cobro?»
-- (paquete e3-t3-gasto-o-pago-v3, §1; PASA de diseño de Takamura):
--
--   t3-gasto-o-pago   ¿Gasto o pago?   Medio · evaluativa · 25
--
-- Del rango de la Célula E (0250-0299). La 0255 ya la ocupa Política
-- Monetaria; esta es la siguiente libre.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`, como la
-- 0254: correrla dos veces no cambia nada. No hace ALTER, UPDATE ni DELETE, y
-- no toca ninguna tabla de estudiantes ni ninguna fila de otra actividad.
-- Solo agrega la fila de su propio tema.
--
-- LA MODALIDAD: evaluativa. El motor escala los 25 FP con los aciertos de
-- los seis hechos de la partida.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (le añade
-- la columna `etapas`). Nada más.
--
-- EL ORDEN: se aplica sola al fusionar el PR que la trae (el guardián de
-- #193). La Célula E no la corre a mano.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 1 fila,
-- t3-gasto-o-pago, contabilidad, ingresos-gastos-y-caja, evaluativa, medio, 25, 1.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie la juegue (escrito,
-- no se corre):
--   delete from public.actividad_catalogo where activity_id = 't3-gasto-o-pago';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('t3-gasto-o-pago', 'contabilidad', 'ingresos-gastos-y-caja', 'evaluativa', 'medio', 25, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 1 fila, t3-gasto-o-pago, contabilidad, ingresos-gastos-y-caja, evaluativa, medio, 25 FP, 1 etapa.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id = 't3-gasto-o-pago';
