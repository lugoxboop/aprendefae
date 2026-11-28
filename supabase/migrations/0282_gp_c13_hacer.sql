-- ---------------------------------------------------------------------------
-- 0282 — GESTIÓN DE PROYECTOS, CAP. 13: LAS 11 HACER DIARIAS (lote 7, el último)
--
-- Entra en el MISMO cambio que las anota en PIEZAS / PUBLICADAS de
-- src/gestion-proyectos/catalogo.js (de ahí sale su entrada en
-- src/data/subjects.js; gp-textos-y-catalogo y el guardián exigen las tres
-- cosas juntas). Las 7 por etapas entran también en
-- supabase/tests/etapas_test.sql (chequeos 2 y 24).
--
-- EL NÚMERO: la siguiente a la 0281, en el rango 0250-0299 (nocturno.md).
-- Comprobado el 28-nov contra main y las ramas remotas: ninguna otra 0282.
--
-- Diseño de Gen (gestion-proyectos/disenos/c13-hacer.md §1), cada pieza en el
-- módulo del grupo de procesos de su proceso:
--   13.1 → gp-inicio · 13.2 → gp-planificacion · 13.3 → gp-ejecucion ·
--   13.4 → gp-monitoreo-control (el taller H11, que recorre los cuatro,
--   cierra el capítulo en 13.4)
--   gp26-ini-c13-h01-identificar         La vereda desde el aire              Fácil   · 10 × 2
--   gp26-ini-c13-h02-intereses           Las cinco tinajas                    Medio   · 25
--   gp26-ini-c13-h03-registro            La carpeta de tres argollas          Medio   · 25 × 2
--   gp26-ini-c13-h04-poder-interes       El patio de la escuela               Medio   · 25 × 2
--   gp26-ini-c13-h05-direccion           La casa de guadua                    Medio   · 25
--   gp26-ini-c13-h06-prominencia         Los tres reflectores                 Medio   · 25 × 2
--   gp26-pla-c13-h07-matriz-evaluacion   El ábaco del involucramiento         Difícil · 50 × 2
--   gp26-pla-c13-h08-plan                La campana de la capilla             Fácil   · 10
--   gp26-eje-c13-h09-gestionar           La asamblea del salón comunal        Medio   · 25
--   gp26-moc-c13-h10-monitorear          Las compuertas de la acequia         Medio   · 25 × 2
--   gp26-moc-c13-h11-taller              La planta en corte                   Difícil · 50 × 3
--
-- ADITIVA Y REPETIBLE: un insert con `on conflict do nothing`. No hace ALTER,
-- UPDATE ni DELETE, no toca ninguna tabla de estudiantes ni ninguna fila de
-- otra actividad. Los ids llevan el prefijo `gp26-` (contrato de
-- estructura.js) más `-c13-`, y no chocan con ningún id existente ni
-- retirado.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y la 0014 (etapas).
--
-- CÓMO DESHACERLA, ANTES de que nadie la juegue (escrito, no se corre; con
-- `like` y no con la lista de ids, igual que la 0281):
--   delete from public.actividad_catalogo where activity_id like 'gp26-%-c13-h%';
-- Después de que alguien la juegue, NO se deshace: hay fp_history que la
-- nombra. Se retira de PUBLICADAS y la fila se queda.
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas)
values
  ('gp26-ini-c13-h01-identificar', 'gestion-proyectos', 'gp-inicio', 'evaluativa', 'facil', 10, 2),
  ('gp26-ini-c13-h02-intereses', 'gestion-proyectos', 'gp-inicio', 'evaluativa', 'medio', 25, 1),
  ('gp26-ini-c13-h03-registro', 'gestion-proyectos', 'gp-inicio', 'evaluativa', 'medio', 25, 2),
  ('gp26-ini-c13-h04-poder-interes', 'gestion-proyectos', 'gp-inicio', 'evaluativa', 'medio', 25, 2),
  ('gp26-ini-c13-h05-direccion', 'gestion-proyectos', 'gp-inicio', 'evaluativa', 'medio', 25, 1),
  ('gp26-ini-c13-h06-prominencia', 'gestion-proyectos', 'gp-inicio', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c13-h07-matriz-evaluacion', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'dificil', 50, 2),
  ('gp26-pla-c13-h08-plan', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'facil', 10, 1),
  ('gp26-eje-c13-h09-gestionar', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'medio', 25, 1),
  ('gp26-moc-c13-h10-monitorear', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'medio', 25, 2),
  ('gp26-moc-c13-h11-taller', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'dificil', 50, 3)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 11 filas de gestion-proyectos (6 en gp-inicio, 2 en
-- gp-planificacion, 1 en gp-ejecucion, 2 en gp-monitoreo-control); 7 con
-- etapas > 1.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id like 'gp26-%-c13-h%'
order by activity_id;
