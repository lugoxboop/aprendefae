-- ---------------------------------------------------------------------------
-- 0076 — CONTABILIDAD, TEMA 6: SE RETIRA b5-t6-a7 «¿Qué método y cuándo?» (Célula B)
--
-- Shoko (C6): las decisiones de esta actividad ya están en b5-t6-a4 y en la
-- capa 3 de T6 · A2. Sale del camino, de la vista, de «Así se juega», del panel
-- docente y del código en el mismo PR que trae esta migración. Su fila entró en
-- la 0075.
--
-- ═══════════ POR QUÉ ES UN DELETE Y NO UNA LÁPIDA ═══════════
--
-- El proyecto retira en blando (`retirada = true`, la 0015). Esta vez se borra,
-- como en la 0022 con simulador-da, y por las mismas dos razones:
--
--   · Contabilidad todavía no tiene estudiantes reales: lo que haya de
--     b5-t6-a7 son intentos de prueba. Mateo autorizó retirar actividades de
--     Contabilidad mientras sea así, y borrar sus intentos de prueba.
--   · No queda cliente que pueda llamarla: el componente, sus datos y su
--     lógica se borran del repositorio. Con la lápida, registrar_fp seguiría
--     pagando por una actividad que nadie puede jugar; sin la fila, una
--     llamada con ese id levanta «Actividad desconocida», que es lo correcto.
--
-- ═══════════ LO QUE APUNTA A LA FILA (revisado en el esquema) ═══════════
--
--   · public.partida_en_curso.activity_id → actividad_catalogo (0028), con
--     `on delete cascade`. Es la ÚNICA llave foránea hacia el catálogo. Sus
--     filas de b5-t6-a7 (partidas a medias de prueba) se borran PRIMERO y a la
--     vista, en vez de dejarlas caer por la cascada.
--   · fp_history y fp_detalle NO apuntan al catálogo (fp_detalle cuelga de
--     fp_history). No se tocan, igual que en la 0022: quedan huérfanas e
--     inofensivas, y profiles.points no se recalcula.
--
-- NO ADITIVA, Y REPETIBLE: dos `delete` con `in (...)` (la forma que lee
-- catalogo.test.mjs). Correrla dos veces deja lo mismo que correrla una. No
-- toca el esquema, ni funciones, ni políticas.
--
-- EL GUARDIÁN DE MIGRACIONES la rechaza por destructiva (un DELETE en el rango
-- de una célula). Es esperado: la aplica Erwin, por encargo de Sakuta.
--
-- EL ORDEN: después de fusionar el PR, o a la vez. Si la fila se borrara antes,
-- un cliente viejo que aún mostrara la actividad recibiría «Actividad
-- desconocida» al terminarla, y en Contabilidad no hay estudiantes reales.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver una fila:
--   catalogo = 0, partidas = 0
--
-- CÓMO DESHACERLA: volver a meter la fila tal como la metió la 0075. Las
-- partidas a medias de prueba no se recuperan. ESCRITA, NO CORRIDA:
--   insert into public.actividad_catalogo
--     (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
--     ('b5-t6-a7', 'contabilidad', 'cuentas-por-cobrar', 'evaluativa', 'facil', 10, 1)
--   on conflict (activity_id) do nothing;
-- ---------------------------------------------------------------------------

-- 1. Las partidas a medias de prueba, que apuntan a la fila con llave foránea.
delete from public.partida_en_curso
 where activity_id in ('b5-t6-a7');

-- 2. La fila del catálogo.
delete from public.actividad_catalogo
 where activity_id in ('b5-t6-a7');

-- ---------------------------------------------------------------------------
-- Comprobación: catalogo = 0, partidas = 0.
-- ---------------------------------------------------------------------------
select
  (select count(*) from public.actividad_catalogo where activity_id = 'b5-t6-a7') as catalogo,
  (select count(*) from public.partida_en_curso   where activity_id = 'b5-t6-a7') as partidas;
