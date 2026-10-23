import { ACTIVIDADES, DESAFIO } from "./contabilidadActividades.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS SUBTEMAS DE «LAS CUENTAS, EL DEBE Y EL HABER» (T2, `cuentas-debe-haber`)
 *
 * Misma forma que src/repaso/subtemas.js, para que el Repaso Diario pueda
 * leer T2 igual que lee Macro:
 *
 *   [fijo]   toda la actividad (o toda una etapa, `actividad:etapa`) tiene un
 *            mismo subtema
 *   [regla]  el subtema de cada ítem ES su respuesta —o su dato—, escrito
 *            como un mapeo del dato del banco al nombre del subtema
 *
 * ═══════════ DE DÓNDE SALE CADA NOMBRE ═══════════
 *
 * De ningún sitio nuevo: aquí no hay ni una etiqueta escrita a mano. Las siete
 * de Hacer son el `subtema` de la ficha de cada una (ACTIVIDADES, en
 * contabilidadActividades.js) y las cuatro etapas de «El Ciclo Completo», el
 * `subtema` de cada peso del desafío (DESAFIO.pesos, mismo archivo). Se leen,
 * no se copian: si la ficha cambia un nombre, este archivo cambia con ella.
 *
 * Hoy los datos no traen subtemas por respuesta, así que no hay ninguna
 * [regla]: inventarlas sería escribir etiquetas que la ficha no tiene.
 *
 * ═══════════ ESTADO: BORRADOR HASTA NEAR ═══════════
 *
 * Las etiquetas definitivas las decide Near y todavía no llegan. Lo que falte
 * —una actividad o etapa sin `subtema` en los datos— va en PENDIENTE_NEAR, y
 * la prueba (src/contabilidad/__tests__/t2-subtemas.test.mjs) solo la deja
 * pasar sin etiqueta mientras esté ahí. La lista solo puede encoger: si una
 * deja de faltar, la prueba exige sacarla.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* La clave de una etapa del desafío, con el id que trae su peso (1 a 4). */
export const claveDeEtapa = (etapa) => `${DESAFIO.id}:${etapa}`;

/* [fijo] — por actividad, o por `actividad:etapa`. Solo lo que los datos ya nombran. */
export const SUBTEMA_FIJO = Object.fromEntries([
  ...ACTIVIDADES.filter((a) => a.subtema).map((a) => [a.id, a.subtema]),
  ...DESAFIO.pesos.filter((p) => p.subtema).map((p) => [claveDeEtapa(p.id), p.subtema]),
]);

/* [regla] — del dato del banco al subtema. Vacío: los datos de T2 no traen ninguna. */
export const SUBTEMA_REGLA = {};

/*
 * Las actividades y etapas que los datos todavía no etiquetan y esperan a
 * Near. Vacía: hoy las siete de Hacer y las cuatro etapas traen la suya.
 */
export const PENDIENTE_NEAR = [];

/** El subtema de una regla, o lanza si el dato no tiene nombre: un subtema vacío no puede pasar en silencio. */
export function subtemaPorRegla(actividad, clave) {
  const regla = SUBTEMA_REGLA[actividad];
  const nombre = regla?.[clave];
  if (!nombre) throw new Error(`Sin subtema: ${actividad} · ${clave}`);
  return nombre;
}

export function subtemaFijo(clave) {
  const nombre = SUBTEMA_FIJO[clave];
  if (!nombre) throw new Error(`Sin subtema fijo: ${clave}`);
  return nombre;
}
