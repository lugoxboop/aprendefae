-- ---------------------------------------------------------------------------
-- 0255 — POLÍTICA MONETARIA: LOS TRES JUEGOS DE LOS INSTRUMENTOS
-- (Célula A; autorizada por el coordinador en el PR #464)
--
--   la-tasa-que-muerde    La Tasa que Muerde    Aplicación · medio   ·  25
--   el-freno-del-encaje   El Freno del Encaje   Aplicación · medio   ·  25
--   repo-o-definitiva     ¿Repo o Definitiva?   Análisis   · difícil ·  50
--
-- Los tres valen 100 FP. El tema pasa de 18 filas y 750 FP a 21 filas y 850.
-- Ninguna pieza de Aprender entra: Aprender no paga.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`: correrla dos
-- veces no cambia nada. No hace ALTER, UPDATE ni DELETE; no toca ninguna tabla
-- de estudiantes, ni ninguna de las dieciocho filas de Política Monetaria que
-- ya estaban, ni ninguna fila de ningún otro tema. Si una de las tres ya
-- existiera por lo que fuera, la deja como está en vez de reescribirla —y por
-- eso `do nothing` y no `do update`, que es lo que usó la 0031.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (le añade
-- la columna `etapas`); y, solo para que la comprobación dé 21 y 850, de las
-- filas de Política Monetaria que ya están: la 0031, la 0052, la 0073 y la
-- 0091. Nada más.
--
-- EL ORDEN: esta migración se corre en producción ANTES de fusionar el PR que
-- cablea los tres juegos. Un estudiante que termine uno antes de que exista su
-- fila recibiría 22023 en vez de sus FP.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver UNA fila:
-- filas = 21, fp_del_tema = 850.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie juegue los tres
-- juegos (escrita, NO corrida):
--   delete from public.actividad_catalogo
--   where activity_id in ('la-tasa-que-muerde', 'el-freno-del-encaje', 'repo-o-definitiva');
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('la-tasa-que-muerde',  'macroeconomia', 'politica-monetaria', 'evaluativa', 'medio',   25, 1),
  ('el-freno-del-encaje', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'medio',   25, 1),
  ('repo-o-definitiva',   'macroeconomia', 'politica-monetaria', 'evaluativa', 'dificil', 50, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: una fila, filas = 21 y fp_del_tema = 850.
-- ---------------------------------------------------------------------------
select
  count(*) as filas,
  sum(fp_base) as fp_del_tema
from public.actividad_catalogo
where topic_id = 'politica-monetaria';
