-- ---------------------------------------------------------------------------
-- 0279 — GESTIÓN DE PROYECTOS, CAPS. 7 Y 8: LAS 24 HACER DIARIAS (lote 4)
--
-- Entra en el MISMO cambio que las anota en PIEZAS / PUBLICADAS de
-- src/gestion-proyectos/catalogo.js (de ahí sale su entrada en
-- src/data/subjects.js; gp-textos-y-catalogo y el guardián exigen las tres
-- cosas juntas). Las 18 por etapas entran también en
-- supabase/tests/etapas_test.sql (chequeos 2 y 21).
--
-- EL NÚMERO: la siguiente a la 0278, en el rango 0250-0299 (nocturno.md).
-- Comprobado el 27-nov contra main y las ramas remotas: ninguna otra 0279.
--
-- Diseño de Gen (gestion-proyectos/disenos/c07-hacer.md y c08-hacer.md §1),
-- cada pieza en el módulo del grupo de procesos de su proceso:
--   7.1–7.3 y 8.1 → gp-planificacion · 8.2 → gp-ejecucion ·
--   7.4 y 8.3 → gp-monitoreo-control (las que mezclan, con el principal)
--   gp26-pla-c07-h01-plan-costos       Los cajones del plan                Medio   · 25 × 2
--   gp26-pla-c07-h02-metodos           Cuatro maneras de estimar           Fácil   · 10
--   gp26-pla-c07-h03-tres-valores      La calculadora de tres valores      Medio   · 25 × 2
--   gp26-pla-c07-h04-embudo            El embudo de la exactitud           Fácil   · 10 × 2
--   gp26-pla-c07-h05-reservas          Dos barriles                        Medio   · 25 × 2
--   gp26-pla-c07-h06-polea             La polea del presupuesto            Difícil · 50 × 2
--   gp26-pla-c07-h07-curva-s           La curva S y los escalones          Difícil · 50 × 2
--   gp26-moc-c07-h08-lona              Tres líneas en la lona              Medio   · 25
--   gp26-moc-c07-h09-termometros       Dos termómetros                     Difícil · 50 × 2
--   gp26-moc-c07-h10-telescopio        El telescopio del final             Difícil · 50 × 3
--   gp26-moc-c07-h11-rampa             La rampa del montacargas            Difícil · 50
--   gp26-moc-c07-h12-libro             El libro de costos del practicante  Difícil · 50
--   gp26-pla-c08-h01-gondola           La góndola de las cápsulas          Fácil   · 10 × 2
--   gp26-pla-c08-h02-cubetas           Las cuatro cubetas                  Medio   · 25 × 2
--   gp26-pla-c08-h03-ascensor          El ascensor de cinco pisos          Fácil   · 10 × 2
--   gp26-pla-c08-h04-plano             El plano de la cápsula              Medio   · 25 × 2
--   gp26-eje-c08-h05-casilleros        Tres casilleros                     Medio   · 25 × 2
--   gp26-eje-c08-h06-espina            La espina de pescado                Medio   · 25 × 2
--   gp26-moc-c08-h07-hoja              La hoja de anotaciones              Medio   · 25 × 2
--   gp26-moc-c08-h08-monitor           La pantalla de la selladora         Difícil · 50 × 2
--   gp26-eje-c08-h09-tablero           El tablero de herramientas          Medio   · 25
--   gp26-eje-c08-h10-auditoria         La credencial del auditor           Medio   · 25
--   gp26-eje-c08-h11-cadena            La cadena de la solución            Medio   · 25 × 3
--   gp26-moc-c08-h12-despacho          Las seis cortinas de despacho       Difícil · 50 × 3
--
-- ADITIVA Y REPETIBLE: un insert con `on conflict do nothing`. No hace ALTER,
-- UPDATE ni DELETE, no toca ninguna tabla de estudiantes ni ninguna fila de
-- otra actividad. Los ids llevan el prefijo `gp26-` (contrato de
-- estructura.js) más `-c07-` / `-c08-`, y no chocan con ningún id existente
-- ni retirado.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y la 0014 (etapas).
--
-- CÓMO DESHACERLA, ANTES de que nadie la juegue (escrito, no se corre; con
-- `like` y no con la lista de ids, igual que la 0278):
--   delete from public.actividad_catalogo where activity_id like 'gp26-%-c07-h%' or activity_id like 'gp26-%-c08-h%';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('gp26-pla-c07-h01-plan-costos', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c07-h02-metodos', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'facil', 10, 1),
  ('gp26-pla-c07-h03-tres-valores', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c07-h04-embudo', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'facil', 10, 2),
  ('gp26-pla-c07-h05-reservas', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c07-h06-polea', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'dificil', 50, 2),
  ('gp26-pla-c07-h07-curva-s', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'dificil', 50, 2),
  ('gp26-moc-c07-h08-lona', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'medio', 25, 1),
  ('gp26-moc-c07-h09-termometros', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'dificil', 50, 2),
  ('gp26-moc-c07-h10-telescopio', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'dificil', 50, 3),
  ('gp26-moc-c07-h11-rampa', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'dificil', 50, 1),
  ('gp26-moc-c07-h12-libro', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'dificil', 50, 1),
  ('gp26-pla-c08-h01-gondola', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'facil', 10, 2),
  ('gp26-pla-c08-h02-cubetas', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c08-h03-ascensor', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'facil', 10, 2),
  ('gp26-pla-c08-h04-plano', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-eje-c08-h05-casilleros', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'medio', 25, 2),
  ('gp26-eje-c08-h06-espina', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'medio', 25, 2),
  ('gp26-moc-c08-h07-hoja', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'medio', 25, 2),
  ('gp26-moc-c08-h08-monitor', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'dificil', 50, 2),
  ('gp26-eje-c08-h09-tablero', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'medio', 25, 1),
  ('gp26-eje-c08-h10-auditoria', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'medio', 25, 1),
  ('gp26-eje-c08-h11-cadena', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'medio', 25, 3),
  ('gp26-moc-c08-h12-despacho', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'dificil', 50, 3)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 24 filas de gestion-proyectos (11 en gp-planificacion,
-- 5 en gp-ejecucion, 8 en gp-monitoreo-control); 18 con etapas > 1.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id like 'gp26-%-c07-h%' or activity_id like 'gp26-%-c08-h%'
order by activity_id;
