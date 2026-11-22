-- ---------------------------------------------------------------------------
-- 0258 — MACROECONOMÍA: RETIRO BLANDO DE TODO SU CONTENIDO (orden de Mateo)
--
-- Marca como retiradas las 59 actividades de Macroeconomía que tienen fila en
-- el catálogo: las 58 de Hacer de sus cuatro temas (Demanda Agregada,
-- Política Económica, Política Fiscal y Política Monetaria, con el desafío
-- «El Comité de NOVA») y el Repaso Diario de Macro.
--
-- POR QUÉ: Mateo manda quitar del sitio todo el material actual de
-- Macroeconomía para rehacerlo desde cero con material nuevo. La materia sigue
-- en la portada, con su índice «en construcción».
--
-- LA TABLA COMPLETA —id, nombre visible, tema, tipo, modalidad y migración
-- donde nació cada fila— está en
-- orquestador/conocimiento/macro-2026/respaldo-retiro.md, junto con el commit
-- padre que guarda el código viejo entero.
--
-- EL NÚMERO: 0258, el siguiente libre de todo el repositorio, aunque cae en el
-- rango de la Célula E (0250-0299). Macro no tiene célula ni rango propio, y
-- el rango del coordinador (0150-0199) no sirve por una razón de orden, no de
-- reparto: las migraciones corren por número, y tres de las filas que esto
-- retira —la-tasa-que-muerde, el-freno-del-encaje y repo-o-definitiva— las
-- crea la 0255. Con un número menor, en una base limpia (CI) el update
-- correría antes de que existieran y las tres quedarían vivas. Tiene que ir
-- después de la 0255, y el guardián acepta un retiro blando desde cualquier
-- rango. Ninguna rama del repositorio usaba la 0258 al escribir esto.
--
-- RETIRO BLANDO, COMO LA 0015 Y LA 0115: no borra filas ni archivos. Solo pone
-- `retirada = true`. Se escribe con `in (...)` porque es la forma que leen
-- catalogo.test.mjs y el guardián para saber qué está retirado.
--
-- HAY ESTUDIANTES REALES EN MACRO Y ESTO NO TOCA SUS DATOS. Es UN update sobre
-- actividad_catalogo y nada más: no hace ALTER, INSERT ni DELETE, y no toca
-- fp_history, fp_detalle, rachas, ligas ni perfiles. El FP ya ganado se
-- conserva entero, y el panel docente sigue enseñando cada actividad con el
-- nombre que vio el estudiante (src/data/retiradas.js).
--
-- LO QUE ESTO NO HACE: registrar_fp no cambia. Una actividad retirada sigue
-- respondiendo si un cliente con caché vieja la llama, igual que con la 0015.
-- La protección es de interfaz: el cliente ya no las ofrece. La marca
-- `renovable_diario` del Repaso de Macro tampoco se toca: con la fila
-- retirada no la usa nadie, y dejarla igual hace que deshacer sea una línea.
--
-- REPETIBLE: correrla dos veces deja el mismo resultado.
--
-- DE QUÉ DEPENDE: de la 0015 (crea la columna `retirada`) y de las migraciones
-- que crean las filas (0015, 0016, 0022, 0029, 0030, 0031, 0033, 0041, 0052,
-- 0073, 0091 y 0255). Si una fila no existe, el update no la toca.
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final devuelve una fila,
-- macroeconomia, con filas = retiradas = 60 (las 59 de aquí y el dashboard de
-- la 0015): ninguna actividad viva de Macroeconomía.
--
-- CÓMO DESHACERLA (no se corre):
--   update public.actividad_catalogo set retirada = false
--    where subject_id = 'macroeconomia' and activity_id <> 'dashboard-economico';
--   y devolver el código desde el commit padre del respaldo.
-- ---------------------------------------------------------------------------

-- GUARDIAN: retiro blando de catalogo
update public.actividad_catalogo
   set retirada = true
 where activity_id in (
  'memorama-corazon', 'cual-componente', 'electrocardiograma',
  'termometro-reacciones', 'banco-transfusiones', 'biopsia-economica',
  'triage-emergencias', 'cirugia-reconstruccion', 'sala-monitores',
  'quien-beneficia-auge', 'explica-paciente', 'sala-espera-llena',
  'memorama-tesoro', 'que-rama-es', 'diagnostico-en-vivo',
  'arma-grupo-logico', 'quien-gana-quien-pierde', 'corriente-titulares',
  'explica-la-politica', 'tablero-decisiones', 'simulador-de-crisis',
  'se-acerca-o-se-aleja', 'expediente-gabinete', 'consejo-ministros',
  'memorama-tesoreria', 'cobra-gasta-o-pide', 'clasificador-tesoro',
  'directos-indirectos', 'flujo-de-caja', 'agujero-fiscal',
  'expansiva-contractiva', 'disena-presupuesto', 'deficit-vs-deuda',
  'quien-afecta-ajuste', 'explica-contribuyente', 'comite-presupuesto',
  'comite-nova', 'memorama-banco-central', 'quien-decide-esto',
  'en-que-talla-va', 'volante-de-la-tasa', 'la-tasa-que-muerde',
  'caja-de-herramientas', 'crea-o-cambia-de-manos', 'el-freno-del-encaje',
  'a-quien-le-pega-la-tasa', 'las-dos-entradas', 'que-toco-el-banco',
  'cadena-de-transmision', 'por-cual-arteria-entra',
  'explicaselo-a-un-deudor', 'corriente-de-decisiones', 'el-rezago',
  'la-escalera-del-encaje', 'repo-o-definitiva', 'dilema-banquero-central',
  'duelo-de-instrumentos', 'disena-respuesta-monetaria', 'repaso-diario'
 );

-- ---------------------------------------------------------------------------
-- Comprobación: 60 filas de macroeconomia (las 59 de aquí y el dashboard de la
-- 0015), todas con retirada = true.
-- ---------------------------------------------------------------------------
select subject_id, count(*) as filas, count(*) filter (where retirada) as retiradas
  from public.actividad_catalogo
 where subject_id = 'macroeconomia'
 group by subject_id;
