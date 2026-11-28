-- ---------------------------------------------------------------------------
-- 0280 — GESTIÓN DE PROYECTOS, CAPS. 9 Y 10: LAS 23 HACER DIARIAS (lote 5)
--
-- Entra en el MISMO cambio que las anota en PIEZAS / PUBLICADAS de
-- src/gestion-proyectos/catalogo.js (de ahí sale su entrada en
-- src/data/subjects.js; gp-textos-y-catalogo y el guardián exigen las tres
-- cosas juntas). Las 16 por etapas entran también en
-- supabase/tests/etapas_test.sql (chequeos 2 y 22).
--
-- EL NÚMERO: la siguiente a la 0279, en el rango 0250-0299 (nocturno.md).
-- Comprobado el 28-nov contra main y las ramas remotas: ninguna otra 0280.
--
-- Diseño de Gen (gestion-proyectos/disenos/c09-hacer.md y c10-hacer.md §1),
-- cada pieza en el módulo del grupo de procesos de su proceso:
--   9.1, 9.2 y 10.1 → gp-planificacion · 9.3–9.5 y 10.2 → gp-ejecucion ·
--   9.6 y 10.3 → gp-monitoreo-control (las que mezclan, con el principal)
--   gp26-pla-c09-h01-puertas             ¿Persona o cosa?                     Fácil   · 10 × 2
--   gp26-pla-c09-h02-gafete              El gafete de la ingeniera            Medio   · 25 × 2
--   gp26-pla-c09-h03-raci                La matriz RACI de la tarima          Difícil · 50 × 2
--   gp26-pla-c09-h04-pendon              Las reglas de la carpa               Medio   · 25 × 2
--   gp26-pla-c09-h05-sumadora            ¿Cuántas manos hacen falta?          Difícil · 50 × 2
--   gp26-pla-c09-h06-rama                La rama de los recursos              Medio   · 25 × 2
--   gp26-eje-c09-h07-catacion            La hoja de catación de candidatos    Difícil · 50 × 2
--   gp26-eje-c09-h08-torre               La torre de luces                    Medio   · 25 × 2
--   gp26-eje-c09-h09-consola             La consola del equipo                Medio   · 25 × 2
--   gp26-eje-c09-h10-microfonos          Cinco micrófonos para un choque      Difícil · 50 × 3
--   gp26-moc-c09-h11-estibas             Las estibas del sábado               Difícil · 50 × 3
--   gp26-eje-c09-h12-rotafolio           El rotafolio del practicante         Difícil · 50
--   gp26-eje-c10-h01-casillero           El casillero de la semana            Fácil   · 10 × 3
--   gp26-eje-c10-h02-maquina             La máquina de las 5C                 Medio   · 25
--   gp26-eje-c10-h03-radios              Dos radios, un precio torcido        Medio   · 25 × 2
--   gp26-pla-c10-h04-playa               Faro, quiosco o carpa                Medio   · 25 × 2
--   gp26-pla-c10-h05-malecon             El malecón de los cinco escenarios   Fácil   · 10
--   gp26-pla-c10-h06-banderas            Las banderas de señales              Medio   · 25
--   gp26-pla-c10-h07-amarres             Los amarres del muelle               Medio   · 25
--   gp26-pla-c10-h08-tablero             El tablero de salidas                Difícil · 50 × 2
--   gp26-eje-c10-h09-reunion             La reunión que se desbordó           Medio   · 25
--   gp26-moc-c10-h10-ecosonda            La ecosonda del lanzamiento          Difícil · 50 × 2
--   gp26-moc-c10-h11-diapositiva         La diapositiva del practicante       Difícil · 50
--
-- ADITIVA Y REPETIBLE: un insert con `on conflict do nothing`. No hace ALTER,
-- UPDATE ni DELETE, no toca ninguna tabla de estudiantes ni ninguna fila de
-- otra actividad. Los ids llevan el prefijo `gp26-` (contrato de
-- estructura.js) más `-c09-` / `-c10-`, y no chocan con ningún id existente
-- ni retirado.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y la 0014 (etapas).
--
-- CÓMO DESHACERLA, ANTES de que nadie la juegue (escrito, no se corre; con
-- `like` y no con la lista de ids, igual que la 0279):
--   delete from public.actividad_catalogo where activity_id like 'gp26-%-c09-h%' or activity_id like 'gp26-%-c10-h%';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('gp26-pla-c09-h01-puertas', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'facil', 10, 2),
  ('gp26-pla-c09-h02-gafete', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c09-h03-raci', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'dificil', 50, 2),
  ('gp26-pla-c09-h04-pendon', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c09-h05-sumadora', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'dificil', 50, 2),
  ('gp26-pla-c09-h06-rama', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-eje-c09-h07-catacion', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'dificil', 50, 2),
  ('gp26-eje-c09-h08-torre', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'medio', 25, 2),
  ('gp26-eje-c09-h09-consola', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'medio', 25, 2),
  ('gp26-eje-c09-h10-microfonos', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'dificil', 50, 3),
  ('gp26-moc-c09-h11-estibas', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'dificil', 50, 3),
  ('gp26-eje-c09-h12-rotafolio', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'dificil', 50, 1),
  ('gp26-eje-c10-h01-casillero', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'facil', 10, 3),
  ('gp26-eje-c10-h02-maquina', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'medio', 25, 1),
  ('gp26-eje-c10-h03-radios', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c10-h04-playa', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c10-h05-malecon', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'facil', 10, 1),
  ('gp26-pla-c10-h06-banderas', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 1),
  ('gp26-pla-c10-h07-amarres', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 1),
  ('gp26-pla-c10-h08-tablero', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'dificil', 50, 2),
  ('gp26-eje-c10-h09-reunion', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'medio', 25, 1),
  ('gp26-moc-c10-h10-ecosonda', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'dificil', 50, 2),
  ('gp26-moc-c10-h11-diapositiva', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'dificil', 50, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 23 filas de gestion-proyectos (11 en gp-planificacion,
-- 9 en gp-ejecucion, 3 en gp-monitoreo-control); 16 con etapas > 1.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id like 'gp26-%-c09-h%' or activity_id like 'gp26-%-c10-h%'
order by activity_id;
