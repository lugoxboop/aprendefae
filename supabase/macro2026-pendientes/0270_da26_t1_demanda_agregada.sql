-- ---------------------------------------------------------------------------
-- 0270 — MACROECONOMÍA 2026, TEMA 1: DEMANDA AGREGADA (las 6 Hacer nuevas)
--
-- ESPERA AQUÍ, FUERA DE supabase/migrations, HASTA QUE MATEO APRUEBE.
-- Al publicar se mueve tal cual a supabase/migrations/ en el MISMO cambio que
-- declara las seis actividades en src/data/subjects.js (catalogo.test.mjs y el
-- guardián exigen las dos cosas juntas). Ver
-- orquestador/conocimiento/macro-2026/construccion-t1.md, «Al publicar».
--
-- EL NÚMERO. El encargo pidió 0270 en adelante. El mapa de choques
-- (nocturno.md) da 0250-0299 a la Célula E, que va por la 0257; la 0270 está
-- libre y dentro de un rango, que es lo que el guardián exige (fuera de todo
-- rango la rechaza). Si al publicar la Célula E ya usó la 0270, se renombra a
-- la siguiente libre: el número no cambia nada del contenido.
--
-- Especificación de Gen (macro-2026/disenos/t1-demanda-agregada.md §1):
--   da26-h1-llena-carrito  Llena el carrito               Fácil   · evaluativa · 10
--   da26-h4-empresario     Lo que oyó el empresario       Difícil · evaluativa · 50
--   da26-h3-gira-o-sube    ¿Gira o sube?                  Medio   · evaluativa · 25
--   da26-h2-arma-formula   Arma la fórmula (3 etapas)     Medio   · evaluativa · 25 × 3
--   da26-h5-libreta        La libreta de la analista      Difícil · evaluativa · 50
--   da26-h6-meta           Lleva la economía a la meta    Medio   · evaluativa · 25 × 3
--
-- ADITIVA Y REPETIBLE: un insert con `on conflict do nothing`. No hace ALTER,
-- UPDATE ni DELETE, no toca ninguna tabla de estudiantes ni ninguna fila de
-- otra actividad. Los ids empiezan por `da26-` y no chocan con ningún id
-- retirado de Macroeconomía. El topic_id `demanda-agregada` se conserva.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y la 0014 (etapas).
--
-- CÓMO DESHACERLA, ANTES de que nadie la juegue (escrito, no se corre):
--   delete from public.actividad_catalogo where activity_id in ('da26-h1-llena-carrito', 'da26-h4-empresario', 'da26-h3-gira-o-sube', 'da26-h2-arma-formula', 'da26-h5-libreta', 'da26-h6-meta');
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('da26-h1-llena-carrito', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'facil', 10, 1),
  ('da26-h4-empresario', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'dificil', 50, 1),
  ('da26-h3-gira-o-sube', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'medio', 25, 1),
  ('da26-h2-arma-formula', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'medio', 25, 3),
  ('da26-h5-libreta', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'dificil', 50, 1),
  ('da26-h6-meta', 'macroeconomia', 'demanda-agregada', 'evaluativa', 'medio', 25, 3)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 6 filas, macroeconomia, demanda-agregada, evaluativa; FP base
-- 10, 50, 25, 25 (× 3 etapas), 50, 25 (× 3 etapas).
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id like 'da26-%'
order by activity_id;
