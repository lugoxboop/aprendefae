-- ---------------------------------------------------------------------------
-- 0076 — TEMA 6: SE RETIRA b5-t6-a7 «¿Qué método y cuándo?» (Célula B)
--
-- Por qué: sus decisiones ya están en a4 (qd-05 a qd-08) y en la capa 3 de
-- T6 · Aprender 2 (Shoko, C6). Mateo autorizó retirar actividades de
-- Contabilidad mientras no haya estudiantes reales (15-oct, 17:44).
--
-- RETIRO BLANDO (el que acepta el guardián desde cualquier rango, #289): la
-- fila se queda como lápida con retirada = true. No se borra: fp_history
-- apunta a ella, y el panel docente muestra su nombre (src/data/retiradas.js).
--
-- REPETIBLE: correrla dos veces deja lo mismo.
-- CÓMO COMPROBAR: la consulta del final devuelve 1 fila con retirada = true.
-- REVERSIÓN (no se corre): update public.actividad_catalogo
--   set retirada = false where activity_id in ('b5-t6-a7');
-- ---------------------------------------------------------------------------

-- GUARDIAN: retiro blando de catalogo
update public.actividad_catalogo
   set retirada = true
 where activity_id in ('b5-t6-a7');

select activity_id, retirada
  from public.actividad_catalogo
 where activity_id = 'b5-t6-a7';
