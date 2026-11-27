-- ---------------------------------------------------------------------------
-- 0276 — GESTIÓN DE PROYECTOS, CAPS. 1 Y 2: LAS 18 HACER DIARIAS (lote 1)
--
-- Materia nueva `gestion-proyectos` (Guía del PMBOK 6.ª ed.). Entra en el
-- MISMO cambio que declara las 18 actividades en src/data/subjects.js y las
-- anota en PUBLICADAS_INTRO / PUBLICADAS_ENTORNO (catalogo.test.mjs,
-- gp-catalogo.test.mjs y el guardián exigen las tres cosas juntas). Las seis
-- por etapas entran también en supabase/tests/etapas_test.sql (chequeo 2 y 18).
--
-- EL NÚMERO: la siguiente a la 0275, en el rango 0250-0299 (nocturno.md).
--
-- Diseño de Gen (gestion-proyectos/disenos/c1-c2-hacer.md §1):
--   tema gp-introduccion (cap. 1)
--   gp-h01-bandeja       La bandeja de los lunes            Fácil   · 10
--   gp-h02-reloj         ¿Se acaba o sigue?                 Fácil   · 10
--   gp-h03-sellos        El sello del porqué                Medio   · 25
--   gp-h04-puente        El puente al estado futuro         Fácil   · 10 × 2
--   gp-h05-portafolio    Arma el mapa de Altamira           Medio   · 25 × 2
--   gp-h06-lineas        Cinco formas de hacer la app       Medio   · 25
--   gp-h07-puerta        La puerta de fase                  Medio   · 25
--   gp-h08-calendario    La trampa del calendario           Medio   · 25 × 2
--   gp-h09-central       La central de la obra              Medio   · 25
--   gp-h10-cafetera      Del grano a la taza                Fácil   · 10
--   gp-h11-caso-puente   El caso de negocio del puente      Difícil · 50 × 3
--   gp-h12-balanzas      ¿Éxito o fracaso?                  Medio   · 25 × 2
--   gp-h13-memorando     El memorando del practicante       Difícil · 50
--   gp-h14-sobre         El sobre del proveedor             Medio   · 25 (exploratoria)
--   tema gp-entorno (cap. 2)
--   gp-h15-control       ¿Lo controlas o te controla?       Medio   · 25 × 2
--   gp-h16-nudos         El organigrama con nudos           Medio   · 25
--   gp-h17-dial          El dial de la autoridad            Medio   · 25
--   gp-h18-pmo           Tres empresas, tres PMO            Medio   · 25
--
-- ADITIVA Y REPETIBLE: un insert con `on conflict do nothing`. No hace ALTER,
-- UPDATE ni DELETE, no toca ninguna tabla de estudiantes ni ninguna fila de
-- otra actividad. Los ids empiezan por `gp-h` y no chocan con ningún id
-- existente ni retirado. La materia no necesita fila en otra tabla: el
-- servidor solo conoce materias por subject_id en actividad_catalogo.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y la 0014 (etapas).
--
-- CÓMO DESHACERLA, ANTES de que nadie la juegue (escrito, no se corre; con
-- `like` y no con la lista de ids, porque catalogo.test.mjs lee una lista de
-- ids tras un delete como un borrado real aunque esté en un comentario):
--   delete from public.actividad_catalogo where activity_id like 'gp-h%';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('gp-h01-bandeja', 'gestion-proyectos', 'gp-introduccion', 'evaluativa', 'facil', 10, 1),
  ('gp-h02-reloj', 'gestion-proyectos', 'gp-introduccion', 'evaluativa', 'facil', 10, 1),
  ('gp-h03-sellos', 'gestion-proyectos', 'gp-introduccion', 'evaluativa', 'medio', 25, 1),
  ('gp-h04-puente', 'gestion-proyectos', 'gp-introduccion', 'evaluativa', 'facil', 10, 2),
  ('gp-h05-portafolio', 'gestion-proyectos', 'gp-introduccion', 'evaluativa', 'medio', 25, 2),
  ('gp-h06-lineas', 'gestion-proyectos', 'gp-introduccion', 'evaluativa', 'medio', 25, 1),
  ('gp-h07-puerta', 'gestion-proyectos', 'gp-introduccion', 'evaluativa', 'medio', 25, 1),
  ('gp-h08-calendario', 'gestion-proyectos', 'gp-introduccion', 'evaluativa', 'medio', 25, 2),
  ('gp-h09-central', 'gestion-proyectos', 'gp-introduccion', 'evaluativa', 'medio', 25, 1),
  ('gp-h10-cafetera', 'gestion-proyectos', 'gp-introduccion', 'evaluativa', 'facil', 10, 1),
  ('gp-h11-caso-puente', 'gestion-proyectos', 'gp-introduccion', 'evaluativa', 'dificil', 50, 3),
  ('gp-h12-balanzas', 'gestion-proyectos', 'gp-introduccion', 'evaluativa', 'medio', 25, 2),
  ('gp-h13-memorando', 'gestion-proyectos', 'gp-introduccion', 'evaluativa', 'dificil', 50, 1),
  ('gp-h14-sobre', 'gestion-proyectos', 'gp-introduccion', 'exploratoria', 'medio', 25, 1),
  ('gp-h15-control', 'gestion-proyectos', 'gp-entorno', 'evaluativa', 'medio', 25, 2),
  ('gp-h16-nudos', 'gestion-proyectos', 'gp-entorno', 'evaluativa', 'medio', 25, 1),
  ('gp-h17-dial', 'gestion-proyectos', 'gp-entorno', 'evaluativa', 'medio', 25, 1),
  ('gp-h18-pmo', 'gestion-proyectos', 'gp-entorno', 'evaluativa', 'medio', 25, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 18 filas de gestion-proyectos (14 de gp-introduccion y 4 de
-- gp-entorno); seis con etapas > 1 (h04, h05, h08, h11, h12, h15).
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id like 'gp-h%'
order by activity_id;
