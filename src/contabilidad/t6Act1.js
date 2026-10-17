import { segundoFalloDe } from "./b5SegundoFallo.js";
import { repartirTanda } from "./b5Reparto.js";
import {
  T6_ACT1, FICHAS_T6_ACT1, CLIENTES, CAJONES_T6_ACT1, FICHAS_V2_T6_ACT1, DEBITA, PISTA_CUENTA_T6_ACT1, DEVOLUCIONES_SEGUNDA_T6_ACT1,
  EN_CUAL_POR_FICHA, DEUDOR_POR_FICHA,
} from "../data/contabilidadT6Act1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · HACER 1 — «¿Clientes o otra cuenta por cobrar?»: sorteo,
 * evaluación y puntaje. El patrón es el de b5-t5-a1 (contabilidad/t5Act1.js).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * Nueve fichas, entre 2 y 4 por cajón (R10, hoja de fusiones de Mai). Antes era el banco entero (10:
 * 4 · 3 · 3), y la cuenta del estante delataba la última. El banco da 4 · 3 · 3, así que el reparto se
 * sortea con ese tope: 4 · 3 · 2, 4 · 2 · 3 o 3 · 3 · 3.
 */
export const GRUPOS_T6_ACT1 = CAJONES_T6_ACT1.map(({ cuenta, lado }) => ({ cuenta, lado }));
const delGrupo = (g) => FICHAS_T6_ACT1.filter((f) => f.cuenta === g.cuenta && f.lado === g.lado);
export function sortearT6Act1(barajar, total = T6_ACT1.porPartida) {
  return repartirTanda(GRUPOS_T6_ACT1.map(delGrupo), total, barajar);
}

/**
 * `marcado` es { cuenta, lado }. El lado va a null con «Otra cuenta por
 * cobrar». `intento` es 1 o 2. Al primer fallo, la PISTA de la ficha (la
 * escalera de ayuda de la célula, tema6/escaleraB5.js): la misma con cualquier
 * cajón, sin emoji. En el segundo fallo manda la regla única de la célula: el
 * acierto de la ficha, tal cual, en TODAS las fichas.
 */
export function evaluarT6Act1(ficha, marcado, intento = 1) {
  const cuentaOk = marcado.cuenta === ficha.cuenta;
  const pideLado = ficha.cuenta === CLIENTES;
  const ladoOk = pideLado ? marcado.lado === ficha.lado : true;
  const ok = cuentaOk && ladoOk;

  if (ok) return { ok, texto: ficha.acierto, patron: null, cuentaOk, ladoOk };

  /* Regla única del segundo fallo (b5SegundoFallo.js). */
  if (intento === 2) return { ok, texto: segundoFalloDe(ficha.acierto), patron: "segundo", cuentaOk, ladoOk };

  return { ok, texto: ficha.pista, patron: "pista", cuentaOk, ladoOk };
}

/* Cada ficha vale entera al acertar (lote 6a). En el segundo intento, la mitad (el componente). */
export const valorDeItemT6Act1 = (ficha, r) => (r.ok ? 1 : 0);

/* Para el panel docente: el ítem es la ficha, y se lee por su texto. */
export const fichaDeItemT6Act1 = (id) => [...FICHAS_T6_ACT1, ...FICHAS_V2_T6_ACT1].find((f) => f.id === String(id).replace(/\/2$/, ""))?.texto ?? null;

/* ═══ D4 (lote 19): la decisión 1 es la cuenta; la 2, el lado de la T (solo las de Clientes) ═══ */

/* `marcado` es { cuenta }. Las de Clientes pasan a la 2 sin devolución; las otras, la de siempre. */
export function evaluarCuentaT6Act1(ficha, marcado, intento = 1) {
  const ok = marcado.cuenta === ficha.cuenta;
  if (ok) return { ok, texto: ficha.cuenta === CLIENTES ? null : ficha.acierto, patron: null };
  if (intento === 2) return { ok, texto: segundoFalloDe(ficha.acierto), patron: "segundo" };
  return { ok, texto: ficha.cuenta === CLIENTES ? PISTA_CUENTA_T6_ACT1 : ficha.pista, patron: "pista" };
}

export const aplicaSegundaT6Act1 = (ficha) => (ficha.cuenta === CLIENTES ? "despues" : null);
export const ladoDeT6Act1 = (ficha) => (ficha.lado === DEBITA ? "debe" : "haber");

/* Acierto: el de la ficha. Primer error: la pista de Futaba; segundo: su porqué (C2). */
export function evaluarSegundaT6Act1(ficha, elegida, intento) {
  if (elegida === ladoDeT6Act1(ficha)) return { ok: true, texto: ficha.acierto };
  const d = DEVOLUCIONES_SEGUNDA_T6_ACT1[ficha.id];
  return { ok: false, texto: intento === 1 ? d.pista : d.porque };
}

/*
 * Lote 23 (D4, Shoko): las de otra cuenta siguen con «¿En cuál?», si su cuenta ya está en los datos. La
 * decisión 2 de cada ficha: el lado de la T (Clientes) o la cuenta (otra). Acierto, el de la ficha; primer
 * error, la pista; segundo, el porqué (C2).
 */
export const enCualDeT6Act1 = (ficha) => EN_CUAL_POR_FICHA[ficha.id]?.cuenta ?? null;
export const aplicaSegunda2T6Act1 = (ficha) => (ficha.cuenta === CLIENTES || enCualDeT6Act1(ficha) ? "despues" : null);
export const correctaSegundaT6Act1 = (ficha) => (ficha.cuenta === CLIENTES ? ladoDeT6Act1(ficha) : enCualDeT6Act1(ficha));
export function evaluarSegunda2T6Act1(ficha, elegida, intento) {
  if (ficha.cuenta === CLIENTES) return evaluarSegundaT6Act1(ficha, elegida, intento);
  if (elegida === enCualDeT6Act1(ficha)) return { ok: true, texto: ficha.acierto };
  /* Lote 25: la pista y el porqué de Futaba, ficha por ficha. */
  const d = EN_CUAL_POR_FICHA[ficha.id];
  return { ok: false, texto: intento === 1 ? d.pista : d.porque };
}

/* Lote 24 (D9): quién debe la ficha. La etiqueta de Futaba manda; sin ella, Clientes, o la cuenta de «¿En cuál?», o «otro». */
const DEUDORES = ["socios", "trabajadores", "particulares"];
export function deudorDeT6Act1(ficha) {
  if (DEUDOR_POR_FICHA[ficha.id]) return DEUDOR_POR_FICHA[ficha.id];
  if (ficha.cuenta === CLIENTES) return "clientes";
  const cuenta = enCualDeT6Act1(ficha);
  return DEUDORES.includes(cuenta) ? cuenta : "otro";
}

export function puntuarT6Act1(respuestas, cuantas) {
  if (!cuantas) return 0;
  return (respuestas.reduce((s, x) => s + x.valor, 0) / cuantas) * 100;
}
