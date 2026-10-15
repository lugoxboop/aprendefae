-- ---------------------------------------------------------------------------
-- 0115 — CONTABILIDAD, T7: RETIRO BLANDO DE CUATRO HACER (Célula C)
--
-- Marca como retiradas cuatro actividades de Hacer de T7:
--
--   t7-2-debe-o-haber              ¿Debe o haber?            (alta en la 0098)
--   t7-2-periodico-o-permanente    ¿Periódico o permanente?  (alta en la 0101)
--   t7-3-comercial-o-condicionado  ¿Comercial o condicionado? (alta en la 0105)
--   t7-3-que-entra-al-costo        ¿Entra al costo?          (alta en la 0108)
--
-- POR QUÉ: la revisión de la Célula C las saca de la lista. Lo que preguntan
-- ya lo piden otras actividades de su mismo tema. Mientras no haya estudiantes
-- reales, la célula decide sola retirar o fusionar actividades de Contabilidad
-- (permiso de Mateo).
--
-- EL NÚMERO: 0115. La 0113 queda para N5 de T5 y la 0114 para N7.
--
-- RETIRO BLANDO, COMO LA 0015: no borra filas ni archivos. Solo pone
-- `retirada = true`. Se escribe con `in (...)` porque es la forma que lee
-- catalogo.test.mjs para saber qué actividades están retiradas y no marcarlas
-- como deriva.
--
-- REPETIBLE. Es UN update que deja el mismo resultado si se corre dos veces.
-- No hace ALTER, INSERT ni DELETE, y no toca ninguna tabla de estudiantes
-- (fp_history queda igual). Las reglas de etiquetasItem de las cuatro se
-- quedan en el cliente.
--
-- LO QUE ESTO NO HACE: registrar_fp no cambia. Una actividad retirada sigue
-- pagando si alguien la llama, igual que con la 0015. La protección es de
-- interfaz: el cliente ya no las ofrece.
--
-- DE QUÉ DEPENDE: de la 0015 (crea la columna `retirada`) y de la 0098, la
-- 0101, la 0105 y la 0108 (crean las cuatro filas). Si una fila no existe, el
-- update simplemente no la toca.
--
-- EL ORDEN: puede correr antes o después de fusionar el PR que la trae. Antes
-- de fusionar, el cliente todavía las ofrece y siguen pagando.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final tiene que devolver 4 filas,
-- todas con retirada = true.
--
-- CÓMO DESHACERLA:
--   update public.actividad_catalogo set retirada = false
--    where activity_id in ('t7-2-debe-o-haber', 't7-2-periodico-o-permanente',
--                          't7-3-comercial-o-condicionado', 't7-3-que-entra-al-costo');
--   y devolver las cuatro entradas a src/data/subjects.js.
-- ---------------------------------------------------------------------------

update public.actividad_catalogo
   set retirada = true
 where activity_id in ('t7-2-debe-o-haber', 't7-2-periodico-o-permanente', 't7-3-comercial-o-condicionado', 't7-3-que-entra-al-costo');

-- ---------------------------------------------------------------------------
-- Comprobación: 4 filas, todas con retirada = true.
-- ---------------------------------------------------------------------------
select activity_id, retirada
from public.actividad_catalogo
where activity_id in ('t7-2-debe-o-haber', 't7-2-periodico-o-permanente', 't7-3-comercial-o-condicionado', 't7-3-que-entra-al-costo')
order by activity_id;
