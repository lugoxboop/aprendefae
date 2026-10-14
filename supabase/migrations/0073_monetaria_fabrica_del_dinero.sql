-- ---------------------------------------------------------------------------
-- 0073 — POLÍTICA MONETARIA: LOS DOS JUEGOS DE «LA FÁBRICA DEL DINERO»
-- (Célula B; encargo de Erwin)
--
--   crea-o-cambia-de-manos   ¿Crea o Cambia de Manos?   Aplicación · medio   ·  25
--   la-escalera-del-encaje   La Escalera del Encaje     Análisis   · difícil ·  50
--
-- Las dos valen 75 FP. El tema pasa de 14 filas y 640 FP a 16 filas y 715 FP.
-- La pieza de Aprender (la-fabrica-del-dinero) NO tiene fila: Aprender no paga.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`: correrla dos
-- veces no cambia nada. No hace ALTER, UPDATE ni DELETE, y no toca ninguna
-- tabla de estudiantes ni ninguna de las catorce actividades que ya estaban.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (le añade
-- la columna `etapas`); y, solo para que la comprobación dé 16 y 715, de las
-- filas de Política Monetaria que ya están: la 0031 y la 0052. Nada más.
--
-- DE QUÉ NO DEPENDE: de la 0070, la 0071 ni la 0072 (Contabilidad; la 0072
-- queda reservada para el cierre del Tema 5). Un número que falta en medio no
-- rompe nada: las migraciones se aplican por orden de nombre.
--
-- EL ORDEN: Mateo la corre en producción ANTES de fusionar el PR que cablea
-- los dos juegos. Un estudiante que termine uno antes de que exista su fila
-- recibiría 22023 en vez de sus FP.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver UNA fila:
-- filas = 16, fp_del_tema = 715.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie juegue los dos juegos
-- (escrita, NO corrida):
--   delete from public.actividad_catalogo
--   where activity_id in ('crea-o-cambia-de-manos', 'la-escalera-del-encaje');
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('crea-o-cambia-de-manos', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'medio',   25, 1),
  ('la-escalera-del-encaje', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'dificil', 50, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: una fila, filas = 16 y fp_del_tema = 715.
-- ---------------------------------------------------------------------------
select
  count(*) as filas,
  sum(fp_base) as fp_del_tema
from public.actividad_catalogo
where topic_id = 'politica-monetaria';
