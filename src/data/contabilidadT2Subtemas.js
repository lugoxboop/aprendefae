/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS SUBTEMAS DE «LAS CUENTAS, EL DEBE Y EL HABER» (T2, `cuentas-debe-haber`)
 *
 * Misma forma que src/repaso/subtemas.js, para que el Repaso Diario pueda
 * leer T2 igual que lee Macro:
 *
 *   [fijo]   toda la actividad (o toda una etapa, `actividad:etapa`) tiene un
 *            mismo subtema
 *   [regla]  el subtema de cada ítem ES un dato suyo, escrito como un mapeo
 *            del dato del banco al nombre del subtema
 *
 * ═══════════ DE DÓNDE SALE CADA NOMBRE ═══════════
 *
 * La lista cerrada de 12 de Near, letra por letra (paquete
 * orquestador/conocimiento/paquetes/c-t2-1-near-lote.md, §3), con los ids de
 * las tres Hacer nuevas que fijó L (c-t2-1-decisiones-l.md, §1 y §3): manda la
 * forma de Watari, así que `cu-las-que-vuelven-a-cero` es [regla] por `clase`
 * (real o nominal). La prueba compara la lista con el paquete.
 *
 * Ningún campo `subtema` existente se renombra: los de los bancos y los del
 * desafío quedan como están. Las cuatro etapas usan los mismos nombres que
 * `DESAFIO.pesos[].subtema` (la prueba lo exige), así que el progreso guardado
 * no queda huérfano. «Reglas de registro por familia» vive solo aquí (el banco
 * de cu-cuadro-dinamicas sigue diciendo «Reglas de registro»).
 *
 * Las tres Hacer nuevas aún no están en el catálogo: van en PROXIMAS, que solo
 * encoge (cuando una entra al catálogo, la prueba exige sacarla de ahí).
 * src/repaso/* lo conecta Erwin.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { DESAFIO } from "./contabilidadActividades.js";

/* La lista cerrada de Near (§3), en su orden. */
export const LISTA_CERRADA_T2 = [
  "Estructura de la cuenta T",
  "Clasificación de cuentas reales",
  "Clasificación de cuentas nominales",
  "Reglas de registro por familia",
  "Reglas de registro aplicadas",
  "Cálculo del saldo",
  "Partida doble: igualdad del debe y el haber",
  "Asiento contable simple",
  "Asiento compuesto",
  "Libro diario y asientos contables",
  "Libro mayor y mayorización",
  "Construcción del estado de situación financiera",
];
const [CUENTA_T, REALES, NOMINALES, POR_FAMILIA, APLICADAS, SALDO, PARTIDA_DOBLE, SIMPLE, COMPUESTO, DIARIO, MAYOR, ESF] = LISTA_CERRADA_T2;

/* La clave de una etapa del desafío, con el id que trae su peso (1 a 4). */
export const claveDeEtapa = (etapa) => `${DESAFIO.id}:${etapa}`;

/* [fijo] — por actividad, o por `actividad:etapa`. */
export const SUBTEMA_FIJO = {
  "cu-izquierda-o-derecha": CUENTA_T,
  "cu-de-que-familia": REALES,
  "cu-cuadro-dinamicas": POR_FAMILIA,
  "cu-debita-o-acredita": APLICADAS,
  "cu-saldo-de-la-cuenta": SALDO,
  "cu-arma-el-asiento": SIMPLE,
  "cu-asiento-compuesto": COMPUESTO,
  [claveDeEtapa(1)]: DIARIO,
  [claveDeEtapa(2)]: MAYOR,
  [claveDeEtapa(3)]: SALDO,
  [claveDeEtapa(4)]: ESF,
  /* Hacer nuevas (L, §1) */
  "cu-cuadra-por-valor": PARTIDA_DOBLE,
  "cu-del-diario-al-mayor": MAYOR,
};

/* [regla] — del dato del banco al subtema. Las que vuelven a cero: por `clase` del ítem. */
export const SUBTEMA_REGLA = {
  "cu-las-que-vuelven-a-cero": { real: REALES, nominal: NOMINALES },
};

/* Las Hacer nuevas que todavía no están en el catálogo (subjects.js). Solo encoge. */
export const PROXIMAS = [];

/* Lo que espera etiqueta de Near. Vacía: la lista cerrada cubre todo. */
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
