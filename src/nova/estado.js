/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ESTADO DE RESULTADOS DE NOVA — el hilo que cruza las cuatro etapas.
 *
 * Es al Comité lo que el nivel del agua es al Arca: algo que está siempre a la
 * vista y que se mueve con lo que pasa. Aquí vive su aritmética, sin React,
 * para poder comprobarla sin montar la pantalla.
 *
 * ═══════════ DOS LÍNEAS NO SE TOCAN NUNCA ═══════════
 *
 * La utilidad operacional y la utilidad neta son RESTAS, no datos:
 *
 *   operacional = ventas − costos − gastos administrativos
 *   neta        = operacional − gastos financieros − impuestos
 *
 * Nada las fija a mano. Ese es justamente el contenido de la Etapa 2 —quien
 * toca la utilidad neta está tocando el resultado, no la causa—, así que si el
 * modelo permitiera fijarlas, el modelo contradiría la lección.
 *
 * ═══════════ LO QUE LA FICHA NO TRAE: CUÁNTO SE MUEVE CADA LÍNEA ═══════════
 *
 * La ficha dice QUÉ línea mueve cada medida, y eso es lo que la Etapa 2
 * evalúa. No dice CUÁNTO, y las retroalimentaciones de Gen tampoco citan
 * ninguna cifra nueva: hablan de dirección («golpea arriba del todo», «la
 * utilidad neta cae después»).
 *
 * Así que aquí cada medida declara su DIRECCIÓN, que sí está escrita, y solo
 * lleva `valor` cuando la cifra se puede deducir del propio contenido de Gen.
 * Hoy eso pasa una vez: la tarifa del impuesto sobre utilidades, que el
 * escenario A de la Etapa 4 fija en 30 % → 35 %. Sobre la misma utilidad
 * operacional de $2.200, eso son $770 exactos.
 *
 * Inventar las otras once sería meter cifras falsas en un caso que los
 * estudiantes estudian para un parcial. Están pendientes de Gen y la pantalla
 * ya sabe contar hacia un valor en cuanto lleguen.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { LINEAS } from "../data/nova.js";

export const VALORES_INICIALES = Object.fromEntries(LINEAS.map((l) => [l.id, l.inicial]));

/** De quién depende cada línea derivada: para encender la cascada en orden. */
export const DEPENDE_DE = {
  operacional: ["ventas", "costos", "admin"],
  neta: ["operacional", "financieros", "impuestos"],
};

/** Las líneas que se recalculan cuando se mueve `id`, de la más cercana a la más lejana. */
export function cascadaDe(id) {
  if (id === "neta") return [];
  if (id === "operacional") return ["neta"];
  if (DEPENDE_DE.operacional.includes(id)) return ["operacional", "neta"];
  return ["neta"];
}

/**
 * El estado completo a partir de los valores base.
 *
 * @param {Object<string,number>} [base] valores de las líneas que no son restas
 */
export function calcularEstado(base = {}) {
  const v = { ...VALORES_INICIALES, ...base };
  const operacional = v.ventas - v.costos - v.admin;
  const neta = operacional - v.financieros - v.impuestos;
  return { ...v, operacional, neta };
}

/*
 * El efecto de cada medida de la Etapa 2 sobre el estado.
 *
 *   linea      cuál se mueve primero (la respuesta de la etapa)
 *   direccion  "sube" | "baja", que es lo que la ficha sí afirma
 *   valor      la cifra nueva, SOLO cuando se deduce del contenido de Gen
 */
export const EFECTOS = {
  l01: { linea: "impuestos", direccion: "sube", valor: 770 },
  l02: { linea: "ventas", direccion: "baja" },
  l03: { linea: "costos", direccion: "sube" },
  l04: { linea: "costos", direccion: "sube" },
  l05: { linea: "ventas", direccion: "sube" },
  l06: { linea: "ventas", direccion: "sube" },
  l07: { linea: "impuestos", direccion: "baja" },
  l08: { linea: "financieros", direccion: "sube" },
  l09: { linea: "costos", direccion: "baja" },
  l10: { linea: "costos", direccion: "baja" },
  l11: { linea: "costos", direccion: "baja" },
  l12: { linea: "impuestos", direccion: "baja" },
};

/*
 * La tarifa del impuesto sobre utilidades, de donde sale el único valor
 * deducible del banco. La inicial la confirma el propio estado: 660 sobre
 * 2.200 es exactamente el 30 %.
 */
export const TARIFA_INICIAL = 0.3;
export const TARIFA_SUBIDA = 0.35;

/** Aplica el efecto de una medida y devuelve el estado nuevo, con la cascada ya resuelta. */
export function aplicarEfecto(estado, medidaId) {
  const efecto = EFECTOS[medidaId];
  if (!efecto || typeof efecto.valor !== "number") return estado;
  const { operacional, neta, ...base } = estado;
  return calcularEstado({ ...base, [efecto.linea]: efecto.valor });
}

/* ────────────────────────────── cómo se escribe ────────────────────────────── */

/*
 * Los millones se escriben con punto de miles, que es como los escribe el caso
 * del profesor: $10.000 millones. Sin decimales: el estado no los tiene.
 */
export function enMillones(valor) {
  const n = Math.round(Number(valor) || 0);
  return `$${n.toLocaleString("es-CO")}`;
}

export function enEntero(valor) {
  return String(Math.round(Number(valor) || 0));
}
