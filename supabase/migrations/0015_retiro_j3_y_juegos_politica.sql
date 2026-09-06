-- ---------------------------------------------------------------------------
-- 0015 — Retiro blando del dashboard económico y alta de dos juegos nuevos
--        en Política Económica.
--
-- ADITIVA Y REPETIBLE. Añade una columna con valor por defecto, marca una fila
-- y mete dos. No toca funciones, ni políticas, ni una sola fila de fp_history.
-- Correrla dos veces deja lo mismo que correrla una.
--
-- ═══════════ POR QUÉ RETIRO BLANDO Y NO UN DELETE ═══════════
--
-- La consulta de impacto dio CERO filas en fp_history para dashboard-economico,
-- así que hoy un delete no rompería nada: ninguna FK apunta a esta tabla —las
-- únicas del esquema van a auth.users— y borrar aquí no cascadea ni falla,
-- solo dejaría huérfanas unas filas que no existen.
--
-- Aun así se conserva la fila, marcada. Cuesta nada y hace dos cosas:
--
--   · Es la lápida. Documenta a qué se refiere el id por si algún día aparecen
--     filas históricas con él.
--   · Evita el "Actividad desconocida" si un cliente con caché vieja todavía
--     llama a la actividad después del despliegue.
--
-- LO QUE ESTO NO HACE, Y CONVIENE SABERLO: registrar_fp no cambia, así que una
-- actividad retirada SIGUE PAGANDO si alguien la llama. Es deliberado —el
-- objetivo de la lápida era justamente que esas llamadas no revienten— pero
-- significa que la protección es de interfaz, no de servidor. Con cero filas y
-- la actividad fuera del cliente, la exposición real es nula; si algún día se
-- retira una actividad que sí tiene historial, habría que decidir si la función
-- debe pagar 0 por las retiradas.
--
-- ═══════════ LOS DOS JUEGOS NUEVOS ═══════════
--
--   diagnostico-en-vivo   Clasificar ocho titulares reales antes de que crucen
--                         la línea de archivo. Medio, 25 FP.
--   arma-grupo-logico     Seis casillas del grupo lógico y doce enunciados,
--                         seis de ellos de otras cadenas. Difícil, 50 FP.
--
-- La dificultad la fija el servidor, y estas dos filas SON esa decisión. El
-- cliente declara lo mismo en src/data/subjects.js porque necesita dibujar la
-- interfaz, y catalogo.test.mjs compara los dos y falla si se separan.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 1. La columna. Por defecto false, que es lo que son todas las de hoy.
-- ---------------------------------------------------------------------------
alter table public.actividad_catalogo
  add column if not exists retirada boolean not null default false;

-- ---------------------------------------------------------------------------
-- 2. Los dos juegos nuevos.
-- ---------------------------------------------------------------------------
insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base) values
  ('diagnostico-en-vivo', 'macroeconomia', 'politica-economica', 'evaluativa', 'medio', 25),
  ('arma-grupo-logico', 'macroeconomia', 'politica-economica', 'evaluativa', 'dificil', 50)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base;

-- ---------------------------------------------------------------------------
-- 3. La lápida del dashboard económico.
--
-- Se escribe con `in (...)` a propósito, aunque hoy sea un solo id: es la forma
-- que lee catalogo.test.mjs para saber qué actividades están retiradas y no
-- marcarlas como deriva. Retirar otra en el futuro es añadirla a esta lista.
-- ---------------------------------------------------------------------------
update public.actividad_catalogo
   set retirada = true
 where activity_id in ('dashboard-economico');
