-- ---------------------------------------------------------------------------
-- 0281 — GESTIÓN DE PROYECTOS, CAPS. 11 Y 12: LAS 24 HACER DIARIAS (lote 6)
--
-- Entra en el MISMO cambio que las anota en PIEZAS / PUBLICADAS de
-- src/gestion-proyectos/catalogo.js (de ahí sale su entrada en
-- src/data/subjects.js; gp-textos-y-catalogo y el guardián exigen las tres
-- cosas juntas). Las 17 por etapas entran también en
-- supabase/tests/etapas_test.sql (chequeos 2 y 23).
--
-- EL NÚMERO: la siguiente a la 0280, en el rango 0250-0299 (nocturno.md).
-- Comprobado el 28-nov contra main y las ramas remotas: ninguna otra 0281.
--
-- Diseño de Gen (gestion-proyectos/disenos/c11-hacer.md y c12-hacer.md §1),
-- cada pieza en el módulo del grupo de procesos de su proceso:
--   11.1–11.5 y 12.1 → gp-planificacion · 12.2 → gp-ejecucion ·
--   11.7 y 12.3 → gp-monitoreo-control (las que mezclan, con el principal:
--   c11 H08 con 11.4, c11 H12 con 11.7, c12 H12 con 12.1)
--   gp26-pla-c11-h01-fichero             El fichero del plan                  Medio   · 25 × 2
--   gp26-pla-c11-h02-movil               El móvil de las fuentes              Fácil   · 10 × 2
--   gp26-pla-c11-h03-cable               El cable aéreo del riesgo            Medio   · 25
--   gp26-pla-c11-h04-muro                El muro del taller                   Medio   · 25 × 2
--   gp26-pla-c11-h05-cata                La bandeja de cata                   Medio   · 25 × 2
--   gp26-pla-c11-h06-burbujas            Las burbujas del tanque              Medio   · 25 × 2
--   gp26-pla-c11-h07-montana             Los caminos de la montaña            Difícil · 50 × 3
--   gp26-pla-c11-h08-galton              El tablero de los mil granos         Difícil · 50 × 2
--   gp26-pla-c11-h09-ladera              La roca de la ladera                 Medio   · 25
--   gp26-pla-c11-h10-espejo              El espejo de las estrategias         Medio   · 25 × 2
--   gp26-pla-c11-h11-libro               La fila del registro                 Difícil · 50 × 2
--   gp26-moc-c11-h12-silo                El silo de la reserva                Difícil · 50
--   gp26-pla-c12-h01-hacer-comprar       El banco o el catálogo               Medio   · 25 × 2
--   gp26-pla-c12-h02-contratos           El planero de los contratos          Medio   · 25 × 2
--   gp26-pla-c12-h03-sobrecosto          ¿Dónde cae el sobrecosto?            Difícil · 50 × 2
--   gp26-pla-c12-h04-rfi-rfq-rfp         El correo neumático                  Medio   · 25
--   gp26-pla-c12-h05-sow                 Las placas de la tostadora           Medio   · 25 × 2
--   gp26-pla-c12-h06-metodo-seleccion    El cambiavías                        Medio   · 25
--   gp26-eje-c12-h07-puntajes            El marcador de las propuestas        Difícil · 50 × 2
--   gp26-eje-c12-h08-conferencia         La conferencia de oferentes          Medio   · 25
--   gp26-moc-c12-h09-reclamacion         El pasillo de la reclamación         Medio   · 25
--   gp26-moc-c12-h10-controlar           El cinturón del supervisor           Medio   · 25 × 2
--   gp26-moc-c12-h11-cierre              La cerradura del cierre              Medio   · 25 × 2
--   gp26-pla-c12-h12-taller              La ruta del contenedor               Difícil · 50 × 3
--
-- ADITIVA Y REPETIBLE: un insert con `on conflict do nothing`. No hace ALTER,
-- UPDATE ni DELETE, no toca ninguna tabla de estudiantes ni ninguna fila de
-- otra actividad. Los ids llevan el prefijo `gp26-` (contrato de
-- estructura.js) más `-c11-` / `-c12-`, y no chocan con ningún id existente
-- ni retirado.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y la 0014 (etapas).
--
-- CÓMO DESHACERLA, ANTES de que nadie la juegue (escrito, no se corre; con
-- `like` y no con la lista de ids, igual que la 0280):
--   delete from public.actividad_catalogo
--    where activity_id like 'gp26-%-c11-h%' or activity_id like 'gp26-%-c12-h%';
-- Después de que alguien la juegue, NO se deshace: hay fp_history que la
-- nombra. Se retira de PUBLICADAS y la fila se queda.
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas)
values
  ('gp26-pla-c11-h01-fichero', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c11-h02-movil', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'facil', 10, 2),
  ('gp26-pla-c11-h03-cable', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 1),
  ('gp26-pla-c11-h04-muro', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c11-h05-cata', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c11-h06-burbujas', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c11-h07-montana', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'dificil', 50, 3),
  ('gp26-pla-c11-h08-galton', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'dificil', 50, 2),
  ('gp26-pla-c11-h09-ladera', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 1),
  ('gp26-pla-c11-h10-espejo', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c11-h11-libro', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'dificil', 50, 2),
  ('gp26-moc-c11-h12-silo', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'dificil', 50, 1),
  ('gp26-pla-c12-h01-hacer-comprar', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c12-h02-contratos', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c12-h03-sobrecosto', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'dificil', 50, 2),
  ('gp26-pla-c12-h04-rfi-rfq-rfp', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 1),
  ('gp26-pla-c12-h05-sow', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c12-h06-metodo-seleccion', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'medio', 25, 1),
  ('gp26-eje-c12-h07-puntajes', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'dificil', 50, 2),
  ('gp26-eje-c12-h08-conferencia', 'gestion-proyectos', 'gp-ejecucion', 'evaluativa', 'medio', 25, 1),
  ('gp26-moc-c12-h09-reclamacion', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'medio', 25, 1),
  ('gp26-moc-c12-h10-controlar', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'medio', 25, 2),
  ('gp26-moc-c12-h11-cierre', 'gestion-proyectos', 'gp-monitoreo-control', 'evaluativa', 'medio', 25, 2),
  ('gp26-pla-c12-h12-taller', 'gestion-proyectos', 'gp-planificacion', 'evaluativa', 'dificil', 50, 3)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: 24 filas de gestion-proyectos (18 en gp-planificacion,
-- 2 en gp-ejecucion, 4 en gp-monitoreo-control); 17 con etapas > 1.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
from public.actividad_catalogo
where activity_id like 'gp26-%-c11-h%' or activity_id like 'gp26-%-c12-h%'
order by activity_id;
