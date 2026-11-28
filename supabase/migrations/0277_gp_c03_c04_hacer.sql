-- ---------------------------------------------------------------------------
-- 0277 — GESTIÓN DE PROYECTOS, CAPS. 3 Y 4: LAS 17 HACER DIARIAS (lote 2)
--
-- Entra en el MISMO cambio que las anota en PIEZAS / PUBLICADAS de
-- src/gestion-proyectos/catalogo.js (de ahí sale su entrada en
-- src/data/subjects.js; catalogo.test.mjs, gp-textos-y-catalogo y el guardián
-- exigen las tres cosas juntas). Las catorce por etapas entran también en
-- supabase/tests/etapas_test.sql (chequeos 2 y 19).
--
-- EL NÚMERO: la siguiente a la 0276, en el rango 0250-0299 (nocturno.md).
--
-- Diseño de Gen (gestion-proyectos/disenos/c03-hacer.md y c04-hacer.md §1):
--   cap. 3 «El rol del director» (no es un proceso) → módulo gp-fundamentos
--   gp26-fun-c03-h01-orquesta       La orquesta de la inauguración  Fácil   · 10 × 2
--   gp26-fun-c03-h02-tranvia        Las cinco líneas de tu semana   Fácil   · 10
--   gp26-fun-c03-h03-taburete       El taburete de tres patas       Medio   · 25 × 2
--   gp26-fun-c03-h04-llavero        El llavero del poder            Medio   · 25
--   gp26-fun-c03-h05-moneda         Las dos caras de la moneda      Medio   · 25 × 2
--   gp26-fun-c03-h06-comandas       La comanda de la mañana         Medio   · 25 × 2
--   gp26-fun-c03-h07-mosaico        El mosaico de la integración    Difícil · 50 × 2
--   cap. 4 «Integración» → el módulo del grupo de procesos de cada pieza
--   gp26-ini-c04-h01-acta           El acta de Barranquilla         Difícil · 50 × 2  (4.1)
--   gp26-ini-c04-h02-expositor      El expositor de los casos       Medio   · 25 × 2  (4.1)
--   gp26-pla-c04-h03-portaplanos    El portaplanos y el revistero   Medio   · 25 × 2  (4.2)
--   gp26-eje-c04-h04-carretillas    Cuatro carretillas de cambio    Medio   · 25      (4.3)
--   gp26-eje-c04-h05-bitacora       La bitácora de obra             Medio   · 25 × 2  (4.3)
--   gp26-eje-c04-h06-recetario      El recetario y las manos        Medio   · 25 × 3  (4.4)
--   gp26-moc-c04-h07-camara         La cámara del viernes           Medio   · 25 × 2  (4.5)
--   gp26-moc-c04-h08-turnero        El turnero de los cambios       Difícil · 50 × 2  (4.6)
--   gp26-cie-c04-h09-breakers       Apaga el proyecto               Medio   · 25 × 2  (4.7)
--   gp26-cie-c04-h10-beneficiadero  Los canales del beneficiadero   Difícil · 50 × 3  (4.1-4.7)
--
-- ADITIVA Y REPETIBLE: un insert con `on conflict do nothing`. No hace ALTER,
-- UPDATE ni DELETE, no toca ninguna tabla de estudiantes ni ninguna fila de
-- otra actividad. Los ids llevan el prefijo `gp26-` (contrato de
-- estructura.js) más `-c03-` / `-c04-`, y no chocan con ningún id existente
-- ni retirado.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y la 0014 (etapas).
--
-- CÓMO DESHACERLA, ANTES de que nadie la juegue (escrito, no se corre; con
-- `like` y no con la lista de ids, igual que la 0276):
--   delete from public.actividad_catalogo where activity_id like 'gp26-%-c03-h%' or activity_id like 'gp26-%-c04-h%';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('gp26-fun-c03-h01-orquesta', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'facil', 10, 2),
  ('gp26-fun-c03-h02-tranvia', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'facil', 10, 1),
  ('gp26-fun-c03-h03-taburete', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'medio', 25, 2),
  ('gp26-fun-c03-h04-llavero', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'medio', 25, 1),
  ('gp26-fun-c03-h05-moneda', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'medio', 25, 2),
  ('gp26-fun-c03-h06-comandas', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'medio', 25, 2),
  ('gp26-fun-c03-h07-mosaico', 'gestion-proyectos', 'gp-fundamentos', 'evaluativa', 'dificil', 50, 2),
  ('gp26-ini-c04-h01-acta', 'gestion-proyectos', 'gp-inicio', 'evaluativa', 'dificil', 50, 2),
  ('gp26-ini-c04-h02-expositor', 'gestion-proyectos', 'gp-inicio', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c04-h03-portaplanos', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-eje-c04-h04-carretillas', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'medio', 25, 1),
  ('gp26-eje-c04-h05-bitacora', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'medio', 25, 2),
  ('gp26-eje-c04-h06-recetario', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'medio', 25, 3),
  ('gp26-moc-c04-h07-camara', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'medio', 25, 2),
  ('gp26-moc-c04-h08-turnero', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'dificil', 50, 2),
  ('gp26-cie-c04-h09-breakers', 'gestion-proyectos', 'gp-cierre', 'evaluativa', 'medio', 25, 2),
  ('gp26-cie-c04-h10-beneficiadero', 'gestion-proyectos', 'gp-cierre', 'evaluativa', 'dificil', 50, 3)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 17 filas de gestion-proyectos (7 del cap. 3 en gp-fundamentos,
-- 10 del cap. 4 en los cinco grupos de procesos); catorce con etapas > 1.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id like 'gp26-%-c03-h%' or activity_id like 'gp26-%-c04-h%'
order by activity_id;
