import { DEBE, HABER, CRECE_POR } from "../data/contabilidad.js";
import { ITEMS_ACT4, TIPOS_ACT4, ERRORES_ACT4, POR_PAGAR } from "../data/contabilidadTema3Act4.js";
import { ITEMS_ACT5, TIPOS_ACT5, ERRORES_ACT5, PAGO } from "../data/contabilidadTema3Act5.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACTS. 4 Y 5 · ARMA EL AJUSTE — la lógica.
 *
 * El patrón de A6 del Tema 2, con sus tres señales, que se encienden SIEMPRE
 * al confirmar (acierte o falle):
 *
 *   el arco        que el asiento cuadra
 *   el ▲ y flecha  por dónde crece la cuenta, y hacia dónde la mueve esto
 *   el anclaje     que esa cuenta se mueve en este hecho
 *
 * En la act. 4 el valor viene puesto en las fichas. En la act. 5 el
 * estudiante lo escribe en cada cuenta (el campo de A7), y el arco queda
 * abierto si los dos montos no coinciden.
 *
 * Un solo intento por ítem, como en las demás actividades del Tema 3.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las dos cuentas del ítem, con su lado, por dónde crecen y si esto las sube. */
export function cuentasDe(item, tipos) {
  return [[item.debe, DEBE], [item.haber, HABER]].map(([cuenta, lado]) => {
    const tipo = tipos[cuenta];
    if (!tipo) throw new Error(`${item.id}: «${cuenta}» no tiene tipo`);
    const creceP = CRECE_POR[tipo];
    return { cuenta, lado, creceP, sube: creceP === lado };
  });
}

/* Las cuentas que se mueven en algún ítem del banco: de ahí salen los señuelos. */
export const universoDe = (items) => [...new Set(items.flatMap((x) => [x.debe, x.haber]))];
export const CUANTAS_EN_BANCO = 6;

/*
 * El banco de nombres: las dos del ítem y cuatro señuelos, siempre cuentas de
 * OTROS ítems de la misma actividad (nunca inventadas).
 */
export function bancoDe(item, universo, mezclar = (x) => x) {
  const banco = [item.debe, item.haber];
  for (const c of mezclar(universo)) {
    if (banco.length >= CUANTAS_EN_BANCO) break;
    if (!banco.includes(c)) banco.push(c);
  }
  return mezclar(banco);
}

/* Las frases del hecho que se resaltan: las de las cuentas puestas que se mueven. */
const frasesDe = (item, puestas) => puestas
  .map((p) => item.anclajes[p.cuenta] ?? null)
  .filter(Boolean);

const comun = (item, puestas) => {
  const real = new Map([[item.debe, DEBE], [item.haber, HABER]]);
  const ajena = puestas.find((p) => !real.has(p.cuenta)) ?? null;
  const mismoLado = puestas.length === 2 && puestas[0].lado === puestas[1].lado;
  const invertidas = !ajena && !mismoLado && puestas.some((p) => real.get(p.cuenta) !== p.lado);
  return { real, ajena, mismoLado, invertidas };
};

/*
 * ═══════════ ACT. 4 ═══════════
 *
 * `puestas` es [{ cuenta, lado }, { cuenta, lado }]. Cuando se cumple más de
 * un error manda el más estructural, como en A6: las dos fichas del mismo
 * lado (D), una cuenta que no se mueve (B en un gasto, C en un ingreso), los
 * lados invertidos (A). Con error, primero el caso y después el acierto.
 */
export function evaluarAct4(item, puestas) {
  const { real, ajena, mismoLado, invertidas } = comun(item, puestas);
  let caso = null;
  if (mismoLado) caso = "D";
  else if (ajena) caso = item.clase === POR_PAGAR ? "B" : "C";
  else if (invertidas) caso = "A";
  const totalDe = (lado) => puestas.filter((p) => p.lado === lado).length * item.valor;
  const totalDebe = totalDe(DEBE);
  const totalHaber = totalDe(HABER);
  const ok = caso === null;
  return {
    ok, caso, real, ajena: ajena?.cuenta ?? null,
    cuadra: totalDebe > 0 && totalDebe === totalHaber,
    totalDebe, totalHaber,
    frases: frasesDe(item, puestas),
    textos: ok ? [item.acierto] : [ERRORES_ACT4[caso], item.acierto],
  };
}

/*
 * ═══════════ ACT. 5 ═══════════
 *
 * `puestas` es [{ cuenta, lado, valor }, …]: el valor lo escribió el
 * estudiante. Manda la cuenta que no se mueve (C en un pago, D en un cobro),
 * después los lados invertidos (A) y después el valor (B, con el texto de
 * dividir si se calcula o el de «ya está en el hecho» si el libro lo da).
 * El valor se compara exacto. El arco cierra solo si los dos montos
 * coinciden y van en lados distintos.
 */
export const textoB = (item) => (item.dado ? ERRORES_ACT5.B_DADO : ERRORES_ACT5.B_CALCULA);

export function evaluarAct5(item, puestas) {
  const { real, ajena, mismoLado, invertidas } = comun(item, puestas);
  const valoresOk = puestas.map((p) => p.valor === item.valor);
  let caso = null;
  if (ajena) caso = item.clase === PAGO ? "C" : "D";
  else if (invertidas || mismoLado) caso = "A";
  else if (valoresOk.some((v) => !v)) caso = "B";
  const totalDe = (lado) => puestas.filter((p) => p.lado === lado).reduce((s, p) => s + (p.valor ?? 0), 0);
  const totalDebe = totalDe(DEBE);
  const totalHaber = totalDe(HABER);
  const ok = caso === null;
  const texto = caso === "B" ? textoB(item) : caso ? ERRORES_ACT5[caso] : null;
  const acierto = item.acierto ? [item.acierto] : [];
  return {
    ok, caso, real, ajena: ajena?.cuenta ?? null, valoresOk,
    cuadra: !mismoLado && totalDebe > 0 && totalDebe === totalHaber,
    totalDebe, totalHaber,
    frases: frasesDe(item, puestas),
    textos: ok ? acierto : [texto, ...acierto],
  };
}

export const puntuar = (respuestas, cuantos) => (cuantos ? (respuestas.filter((r) => r.ok).length / cuantos) * 100 : 0);

/* Para el panel docente: el hecho de un id, con su empresa delante. */
const hechoEn = (items) => (id) => {
  const it = items.find((x) => x.id === id);
  return it ? `${it.empresa} · ${it.hecho}` : null;
};
export const hechoDeItemAct4 = hechoEn(ITEMS_ACT4);
export const hechoDeItemAct5 = hechoEn(ITEMS_ACT5);

export { TIPOS_ACT4, TIPOS_ACT5 };
