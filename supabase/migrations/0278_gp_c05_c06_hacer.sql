-- ---------------------------------------------------------------------------
-- 0278 — GESTIÓN DE PROYECTOS, CAPS. 5 Y 6: LAS 24 HACER DIARIAS (lote 3)
--
-- Entra en el MISMO cambio que las anota en PIEZAS / PUBLICADAS de
-- src/gestion-proyectos/catalogo.js (de ahí sale su entrada en
-- src/data/subjects.js; gp-textos-y-catalogo y el guardián exigen las tres
-- cosas juntas). Las 15 por etapas entran también en
-- supabase/tests/etapas_test.sql (chequeos 2 y 20).
--
-- EL NÚMERO: la siguiente a la 0277, en el rango 0250-0299 (nocturno.md).
--
-- Diseño de Gen (gestion-proyectos/disenos/c05-hacer.md y c06-hacer.md §1),
-- cada pieza en el módulo del grupo de procesos de su proceso:
--   5.1–5.4 y 6.1–6.5 → gp-planificacion · 5.5, 5.6 y 6.6 → gp-monitoreo-control
--   gp26-pla-c05-h01-teatro          Escenario o bambalinas         Fácil   · 10
--   gp26-pla-c05-h02-noria           La carretera y la noria        Medio   · 25
--   gp26-pla-c05-h03-libretas        Las dos libretas               Medio   · 25
--   gp26-pla-c05-h04-mochila         La mochila de campo            Medio   · 25
--   gp26-pla-c05-h05-urna            La urna de las funciones       Medio   · 25 × 2
--   gp26-pla-c05-h06-alacena         La alacena de requisitos       Medio   · 25 × 2
--   gp26-pla-c05-h07-telar           El telar de la trazabilidad    Difícil · 50
--   gp26-pla-c05-h08-mapa            El mapa de dos escalas         Medio   · 25 × 2
--   gp26-pla-c05-h09-movil           El móvil de la EDT             Difícil · 50 × 3
--   gp26-pla-c05-h10-caja-fuerte     La caja fuerte                 Medio   · 25 × 2
--   gp26-moc-c05-h11-embarque        Escáner y puerta de embarque   Medio   · 25 × 2
--   gp26-moc-c05-h12-globo           El globo que se infla          Difícil · 50
--   gp26-pla-c06-h01-semaforo        El semáforo del plan           Medio   · 25 × 2
--   gp26-pla-c06-h02-linterna        La linterna del túnel          Fácil   · 10 × 2
--   gp26-pla-c06-h03-rompecabezas    Las piezas que encajan         Medio   · 25 × 2
--   gp26-pla-c06-h04-cinta           La cinta métrica               Medio   · 25
--   gp26-pla-c06-h05-sumadora        La sumadora de duraciones      Difícil · 50 × 2
--   gp26-pla-c06-h06-alcancias       Pintores y alcancías           Medio   · 25 × 2
--   gp26-pla-c06-h07-metro           El metro de la ruta crítica    Difícil · 50 × 3
--   gp26-pla-c06-h08-domino          Fichas de dominó               Difícil · 50
--   gp26-pla-c06-h09-relevos         La pista de relevos            Difícil · 50 × 2
--   gp26-pla-c06-h10-bloques         La torre de bloques            Medio   · 25 × 2
--   gp26-moc-c06-h11-rotafolio       El rotafolio del lunes         Medio   · 25 × 2
--   gp26-pla-c06-h12-plotter         El rollo del practicante       Difícil · 50
--
-- ADITIVA Y REPETIBLE: un insert con `on conflict do nothing`. No hace ALTER,
-- UPDATE ni DELETE, no toca ninguna tabla de estudiantes ni ninguna fila de
-- otra actividad. Los ids llevan el prefijo `gp26-` (contrato de
-- estructura.js) más `-c05-` / `-c06-`, y no chocan con ningún id existente
-- ni retirado.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y la 0014 (etapas).
--
-- CÓMO DESHACERLA, ANTES de que nadie la juegue (escrito, no se corre; con
-- `like` y no con la lista de ids, igual que la 0277):
--   delete from public.actividad_catalogo where activity_id like 'gp26-%-c05-h%' or activity_id like 'gp26-%-c06-h%';
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('gp26-pla-c05-h01-teatro', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'facil', 10, 1),
  ('gp26-pla-c05-h02-noria', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 1),
  ('gp26-pla-c05-h03-libretas', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 1),
  ('gp26-pla-c05-h04-mochila', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 1),
  ('gp26-pla-c05-h05-urna', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c05-h06-alacena', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c05-h07-telar', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'dificil', 50, 1),
  ('gp26-pla-c05-h08-mapa', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c05-h09-movil', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'dificil', 50, 3),
  ('gp26-pla-c05-h10-caja-fuerte', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-moc-c05-h11-embarque', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'medio', 25, 2),
  ('gp26-moc-c05-h12-globo', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'dificil', 50, 1),
  ('gp26-pla-c06-h01-semaforo', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c06-h02-linterna', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'facil', 10, 2),
  ('gp26-pla-c06-h03-rompecabezas', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c06-h04-cinta', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 1),
  ('gp26-pla-c06-h05-sumadora', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'dificil', 50, 2),
  ('gp26-pla-c06-h06-alcancias', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c06-h07-metro', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'dificil', 50, 3),
  ('gp26-pla-c06-h08-domino', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'dificil', 50, 1),
  ('gp26-pla-c06-h09-relevos', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'dificil', 50, 2),
  ('gp26-pla-c06-h10-bloques', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-moc-c06-h11-rotafolio', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c06-h12-plotter', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'dificil', 50, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 24 filas de gestion-proyectos (21 en gp-planificacion, 3 en
-- gp-monitoreo-control); 15 con etapas > 1.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id like 'gp26-%-c05-h%' or activity_id like 'gp26-%-c06-h%'
order by activity_id;
