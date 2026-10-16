-- ---------------------------------------------------------------------------
-- 0208 — CONTABILIDAD, T4: EL CORTE DE CALIDAD DE LOS HACER, DE 8 A 5 (Célula D)
--        1 de 2: el retiro blando de H2, H5 y H6 (la 0209 sube H4)
--
-- GUARDIAN: retiro blando de catalogo
--
-- El corte de calidad de Yujiro (celula-d/corte-calidad.md, 15 oct 2026), con
-- la autorización de Mateo: mientras no haya estudiantes reales, la célula
-- retira o funde actividades de Contabilidad.
--
--   1. RETIRO BLANDO de las tres que salen (la puerta del #289: solo
--      `set retirada = true`, con la marca de arriba):
--        t4-el-control-que-se-saltaron  H2 (0201)  sale: era reconocer una lista
--        t4-al-empleado-o-al-gasto      H5 (0204)  fundida en H4
--        t4-quien-se-entero-primero     H6 (0205)  fundida en H7
--      La fila se queda, marcada (la lápida de la 0015): una llamada de un
--      cliente con caché vieja responde en vez de reventar. Sus filas de
--      prueba en fp_history y fp_detalle se quedan, retiradas: no estorban
--      (decisión de Yujiro). No se borra nada.
--   2. H4 «El arqueo de caja menor» sube a difícil · 50 en la 0209, aparte:
--      el guardián deja pasar un retiro blando solo si el archivo no trae nada
--      más con «update», y el upsert lo trae (`on conflict do update`).
--
-- NO TOCA las 0200-0207, que ya corrieron en producción.
--
-- IDEMPOTENTE: el retiro deja `true` donde ya había `true`. Sobre un Postgres
-- limpio (CI) corre después de la 0201, la 0204 y la 0205, que crearon las
-- tres filas.
--
-- DE QUÉ DEPENDE: de la 0011 (actividad_catalogo), la 0015 (la columna
-- `retirada`) y las 0201, 0204 y 0205 (las filas que toca).
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final da tres filas, las tres con
-- retirada = true. La prueba (de la 0208 y la 0209) está en
-- supabase/tests/t4_corte_hacer_test.sql.
--
-- CÓMO DESHACERLA, si hiciera falta (escrito, no se corre):
--   update public.actividad_catalogo set retirada = false where activity_id in (...las tres...);
-- ---------------------------------------------------------------------------

-- 1. El retiro blando de H2, H5 y H6.
update public.actividad_catalogo
   set retirada = true
 where activity_id in ('t4-el-control-que-se-saltaron', 't4-al-empleado-o-al-gasto', 't4-quien-se-entero-primero');

-- ---------------------------------------------------------------------------
-- Comprobación: tres filas, las tres retiradas.
-- ---------------------------------------------------------------------------
select activity_id, modalidad, dificultad, fp_base, retirada
  from public.actividad_catalogo
 where activity_id in ('t4-el-control-que-se-saltaron', 't4-al-empleado-o-al-gasto', 't4-quien-se-entero-primero')
 order by activity_id;
