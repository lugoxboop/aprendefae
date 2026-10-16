-- ---------------------------------------------------------------------------
-- 0077 — TEMA 6: b5-t6-a5 «La cuenta de la provisión» SE FUNDE EN b5-t6-a2
-- (Célula B, lote 6b)
--
-- Por qué: sus casillas eran el mismo caso de El Torito que la mesa de a2.
-- La hoja de fusiones de Mai las junta en cinco pasos dentro de a2 (P1 →
-- Asiento 1 → P2 → Asiento 2 → P3), con los textos de Futaba y las
-- correcciones de Shoko. Mateo autorizó retirar y fusionar actividades de
-- Contabilidad mientras no haya estudiantes reales.
--
-- RETIRO BLANDO (el que acepta el guardián desde cualquier rango, #289),
-- como la 0076: la fila se queda como lápida con retirada = true. No se
-- borra: fp_history apunta a ella, y el panel docente muestra su nombre
-- (src/data/retiradas.js). Los FP de a5 pasan a a2 en la 0078.
--
-- REPETIBLE: correrla dos veces deja lo mismo.
-- CÓMO COMPROBAR: la consulta del final devuelve 1 fila con retirada = true.
-- REVERSIÓN (no se corre): update public.actividad_catalogo
--   set retirada = false where activity_id in ('b5-t6-a5');
-- ---------------------------------------------------------------------------

-- GUARDIAN: retiro blando de catalogo
update public.actividad_catalogo
   set retirada = true
 where activity_id in ('b5-t6-a5');

select activity_id, retirada
  from public.actividad_catalogo
 where activity_id = 'b5-t6-a5';
