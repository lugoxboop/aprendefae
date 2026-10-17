import { segundoFalloDe } from "./b5SegundoFallo.js";
import { repartirTanda } from "./b5Reparto.js";
import {
  T6_ACT1, FICHAS_T6_ACT1, CLIENTES, CAJONES_T6_ACT1, FICHAS_V2_T6_ACT1,
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
export const fichaDeItemT6Act1 = (id) => [...FICHAS_T6_ACT1, ...FICHAS_V2_T6_ACT1].find((f) => f.id === id)?.texto ?? null;

export function puntuarT6Act1(respuestas, cuantas) {
  if (!cuantas) return 0;
  return (respuestas.reduce((s, x) => s + x.valor, 0) / cuantas) * 100;
}
