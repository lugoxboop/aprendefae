-- ---------------------------------------------------------------------------
-- 0276 — GESTIÓN DE PROYECTOS, CAPS. 1 Y 2: LAS 18 HACER DIARIAS (lote 1)
--
-- Materia nueva `gestion-proyectos` (Guía del PMBOK 6.ª ed.). Entra en el
-- MISMO cambio que declara las 18 actividades en src/data/subjects.js y las
-- anota en PIEZAS / PUBLICADAS de src/gestion-proyectos/catalogo.js (de ahí
-- sale la entrada de subjects.js; catalogo.test.mjs, gp-textos-y-catalogo y
-- el guardián exigen las tres cosas juntas). Las seis
-- por etapas entran también en supabase/tests/etapas_test.sql (chequeo 2 y 18).
--
-- EL NÚMERO: la siguiente a la 0275, en el rango 0250-0299 (nocturno.md).
--
-- Diseño de Gen (gestion-proyectos/disenos/c1-c2-hacer.md §1):
--   módulo (tema) gp-fundamentos, cap. 1
--   gp26-fun-h01-bandeja       La bandeja de los lunes            Fácil   · 10
--   gp26-fun-h02-reloj         ¿Se acaba o sigue?                 Fácil   · 10
--   gp26-fun-h03-sellos        El sello del porqué                Medio   · 25
--   gp26-fun-h04-puente        El puente al estado futuro         Fácil   · 10 × 2
--   gp26-fun-h05-portafolio    Arma el mapa de Altamira           Medio   · 25 × 2
--   gp26-fun-h06-lineas        Cinco formas de hacer la app       Medio   · 25
--   gp26-fun-h07-puerta        La puerta de fase                  Medio   · 25
--   gp26-fun-h08-calendario    La trampa del calendario           Medio   · 25 × 2
--   gp26-fun-h09-central       La central de la obra              Medio   · 25
--   gp26-fun-h10-cafetera      Del grano a la taza                Fácil   · 10
--   gp26-fun-h11-caso-puente   El caso de negocio del puente      Difícil · 50 × 3
--   gp26-fun-h12-balanzas      ¿Éxito o fracaso?                  Medio   · 25 × 2
--   gp26-fun-h13-memorando     El memorando del practicante       Difícil · 50
--   gp26-fun-h14-sobre         El sobre del proveedor             Medio   · 25 (exploratoria)
--   módulo (tema) gp-fundamentos, cap. 2
--   gp26-fun-h15-control       ¿Lo controlas o te controla?       Medio   · 25 × 2
--   gp26-fun-h16-nudos         El organigrama con nudos           Medio   · 25
--   gp26-fun-h17-dial          El dial de la autoridad            Medio   · 25
--   gp26-fun-h18-pmo           Tres empresas, tres PMO            Medio   · 25
--
-- ADITIVA Y REPETIBLE: un insert con `on conflict do nothing`. No hace ALTER,
-- UPDATE ni DELETE, no toca ninguna tabla de estudiantes ni ninguna fila de
-- otra actividad. Los ids empiezan por `gp26-fun-h` (contrato de
-- estructura.js: prefijo gp26-) y no chocan con ningún id
-- existente ni retirado. La materia no necesita fila en otra tabla: el
-- servidor solo conoce materias por subject_id en actividad_catalogo.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y la 0014 (etapas).
--
-- CÓMO DESHACERLA, ANTES de que nadie la juegue (escrito, no se corre; con
-- `like` y no con la lista de ids, porque catalogo.test.mjs lee una lista de
-- ids tras un delete como un borrado real aunque esté en un comentario):
--   delete from public.actividad_catalogo where activity_id like 'gp26-fun-h%';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('gp26-fun-h01-bandeja', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'facil', 10, 1),
  ('gp26-fun-h02-reloj', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'facil', 10, 1),
  ('gp26-fun-h03-sellos', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'medio', 25, 1),
  ('gp26-fun-h04-puente', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'facil', 10, 2),
  ('gp26-fun-h05-portafolio', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'medio', 25, 2),
  ('gp26-fun-h06-lineas', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'medio', 25, 1),
  ('gp26-fun-h07-puerta', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'medio', 25, 1),
  ('gp26-fun-h08-calendario', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'medio', 25, 2),
  ('gp26-fun-h09-central', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'medio', 25, 1),
  ('gp26-fun-h10-cafetera', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'facil', 10, 1),
  ('gp26-fun-h11-caso-puente', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'dificil', 50, 3),
  ('gp26-fun-h12-balanzas', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'medio', 25, 2),
  ('gp26-fun-h13-memorando', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'dificil', 50, 1),
  ('gp26-fun-h14-sobre', 'gestion-proyectos', 'gp-fundamentos', 'exploratoria', 'medio', 25, 1),
  ('gp26-fun-h15-control', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'medio', 25, 2),
  ('gp26-fun-h16-nudos', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'medio', 25, 1),
  ('gp26-fun-h17-dial', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'medio', 25, 1),
  ('gp26-fun-h18-pmo', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'medio', 25, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 18 filas de gestion-proyectos, todas del módulo
-- gp-fundamentos (caps. 1 y 2); seis con etapas > 1 (h04, h05, h08, h11, h12, h15).
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id like 'gp26-fun-h%'
order by activity_id;
