-- ---------------------------------------------------------------------------
-- 0078 — TEMA 6: b5-t6-a2 «La provisión de El Torito» PASA A DIFÍCIL · 50 FP
-- (Célula B, lote 6b)
--
-- Con la 0077, b5-t6-a5 se fundió en a2: ahora son cinco pasos, dos asientos
-- y tres preguntas de cifra escrita. Futaba y Shoko sugirieron difícil, 50 FP;
-- lo decide KAEDE con la regla nueva de Mateo y Erwin. Son los 25 de a2 más
-- los 25 de a5: el tema no gana ni pierde FP.
--
-- Va aparte de la 0077 porque el guardián exige que un retiro blando venga
-- solo en su archivo.
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do update`, como la 0046:
-- la fila de la 0074 ya existe, así que la reescribe con la dificultad y los
-- FP nuevos. Correrla dos veces deja exactamente lo mismo. No toca ninguna
-- tabla de estudiantes: lo ya ganado en fp_history queda como estaba.
--
-- EL ORDEN: primero el despliegue, después la migración, como siempre. Al
-- revés, un estudiante cobraría 50 por la a2 vieja de dos asientos.
--
-- CÓMO COMPROBAR: la consulta del final devuelve 1 fila:
--   b5-t6-a2, contabilidad, cuentas-por-cobrar, evaluativa, dificil, 50, 1
-- REVERSIÓN (no se corre): volver a insertar la fila de la 0074 con el mismo
-- `on conflict do update`, con 'medio' y 25.
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('b5-t6-a2',                     'contabilidad', 'cuentas-por-cobrar',        'evaluativa', 'dificil',  50, 1)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base,
  etapas     = excluded.etapas;

select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas
  from public.actividad_catalogo
 where activity_id = 'b5-t6-a2';
