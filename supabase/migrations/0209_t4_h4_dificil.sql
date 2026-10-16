-- ---------------------------------------------------------------------------
-- 0209 — CONTABILIDAD, T4: H4 «EL ARQUEO DE CAJA MENOR», CON H5 DENTRO, SUBE A
--        DIFÍCIL · 50 (Célula D). 2 de 2 del corte de calidad de los Hacer
--
-- El corte de Yujiro (celula-d/corte-calidad.md, 15 oct 2026) funde H5 «¿Al
-- empleado o al gasto?» (difícil · 50) en H4 «El arqueo de Rosa» (medio · 25,
-- de la 0203): la pieza fundida conserva el id de H4, se llama «El arqueo de
-- caja menor» (solo en subjects.js: el catálogo no guarda nombres) y sube a
-- difícil · 50 FP, como las demás difíciles del catálogo (H7 es difícil con
-- 50). La 0208 retira H5.
--
-- Va aparte de la 0208 porque el guardián deja pasar un retiro blando solo si
-- el archivo no trae nada más con «update», y este upsert lo trae.
--
-- ADITIVA E IDEMPOTENTE: un upsert, la forma que lee catalogo.test.mjs (gana
-- la última). No toca la 0203, que ya corrió en producción. No toca filas de
-- estudiantes: lo que ya pagó H4 queda como estaba.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final da una fila,
-- t4-el-arqueo-de-rosa · evaluativa · dificil · 50 · 1 etapa.
-- ---------------------------------------------------------------------------

-- H4 «El arqueo de caja menor», con H5 dentro: difícil · 50.
insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('t4-el-arqueo-de-rosa', 'contabilidad', 'efectivo-caja-menor-bancos', 'evaluativa', 'dificil', 50, 1)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base,
  etapas     = excluded.etapas;

-- ---------------------------------------------------------------------------
-- Comprobación: una fila, evaluativa, difícil, 50 FP, 1 etapa.
-- ---------------------------------------------------------------------------
select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
  from public.actividad_catalogo
 where activity_id = 't4-el-arqueo-de-rosa';
