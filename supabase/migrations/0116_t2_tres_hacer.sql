-- ---------------------------------------------------------------------------
-- 0116 — CONTABILIDAD T2 «LAS CUENTAS, EL DEBE Y EL HABER»: TRES HACER NUEVAS
-- (Célula C, lote T2-2, issue #471; forma de Watari, decisiones de L §1)
--
--   cu-cuadra-por-valor        Cuadra por valor        medio  · 25
--   cu-del-diario-al-mayor     Del diario al mayor     medio  · 25
--   cu-las-que-vuelven-a-cero  Las que vuelven a cero  facil  · 10
--
-- Las tres valen 60 FP. El tema pasa de 7 filas vivas y 260 FP a 10 filas
-- vivas y 320 FP (el desafío ciclo-completo va aparte, con sus 360). Ningún id
-- reusa los cinco retirados en la 0043 (cu-simple-o-compuesto,
-- cu-cuadra-o-no, cu-corriente-de-cuentas, cu-mayorizacion,
-- cu-error-escondido).
--
-- ADITIVA Y REPETIBLE. Es UN insert con `on conflict do nothing`: correrla dos
-- veces no cambia nada. No hace ALTER, UPDATE ni DELETE; no toca ninguna tabla
-- de estudiantes, ni ninguna de las siete filas vivas de T2, ni ninguna fila de
-- otro tema.
--
-- DE QUÉ DEPENDE: de la 0011 (crea actividad_catalogo) y de la 0014 (columna
-- `etapas`). Para que la comprobación dé 10 y 320, de las filas de T2 que ya
-- están (0011, 0043).
--
-- EL ORDEN: esta migración se corre en producción ANTES de quitarles
-- `pendiente: true` en src/data/subjects.js. Un estudiante que termine una sin
-- su fila recibiría 22023 en vez de sus FP. Correrla lo deciden Erwin y Mateo
-- (issue `miku`), no la célula.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver UNA fila:
-- filas = 10, fp_del_tema = 320.
--
-- CÓMO DESHACERLA, si hiciera falta y ANTES de que nadie juegue las tres
-- (escrita, NO corrida):
--   delete from public.actividad_catalogo
--   where activity_id in ('cu-cuadra-por-valor', 'cu-del-diario-al-mayor', 'cu-las-que-vuelven-a-cero');
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('cu-cuadra-por-valor',       'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'medio', 25, 1),
  ('cu-del-diario-al-mayor',    'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'medio', 25, 1),
  ('cu-las-que-vuelven-a-cero', 'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'facil', 10, 1)
on conflict (activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: una fila, filas = 10 y fp_del_tema = 320 (sin el desafío y
-- sin las cinco retiradas).
-- ---------------------------------------------------------------------------
select
  count(*) as filas,
  sum(fp_base) as fp_del_tema
from public.actividad_catalogo
where topic_id = 'cuentas-debe-haber'
  and activity_id <> 'ciclo-completo'
  and not retirada;
