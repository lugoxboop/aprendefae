import { barajar } from "../utils/barajar.js";
import {
  R5_2, VALORES, ETAPAS, PREGUNTAS_R5_2, CONCEPTOS, HOJA_DE_CUENTAS, GRUPOS_A0,
} from "./repasoCap5ToroNegroTextos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-2 «El Toro Negro» — la lógica, sin React (Célula E).
 *
 *   prepararR5_2(barajador)   la hoja de cuentas barajada una vez por intento
 *   evaluarAsiento(p, r)      piezas, veredicto y textos con la regla de
 *                             prioridad de Kamogawa (decisión 1)
 *   evaluarSaldo(p, r)        lo mismo para la pantalla de saldo (decisión 2)
 *   puedeRevisarAsiento/Saldo cuándo se activa el botón
 *   libroAntesDe / libroTras  la T de la provisión al empezar y al cerrar una
 *                             etapa (la regla del libro, §0 de Itagaki)
 *   porEtapa(resultados)      las filas de «EL CASO EN TRES TIEMPOS»
 *   puntuarR5_2(aciertos)     aciertos / 6 × 100 (evaluativa: el motor escala)
 *   unidadDeR5_2(id)          el texto de cada ítem para el panel docente
 *   pasosDe(preguntas)        el recorrido: entrada, y por etapa sus preguntas
 *                             y su corte
 *   resolver(x, respuestas)   un dato fijo, o una función de las respuestas
 *
 * EL SITIO PARA LA ETAPA a0 «Calcula la provisión» (Kamogawa, delta pendiente
 * del paquete): una pregunta más de tipo «calculo» en la etapa 31 DIC, antes
 * del asiento del ajuste. Nada de aquí cuenta seis a mano: el total, el
 * recorrido, la línea de tiempo y las filas del final salen de la lista. Y el
 * hecho y el valor correcto del ajuste se pueden escribir como funciones de
 * las respuestas anteriores, para que tome el total calculado en vez de
 * darlo como dato.
 *
 * Los FP no se calculan aquí: la vista entrega el porcentaje y el motor
 * compartido (src/fp) hace el resto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TOTAL_R5_2 = PREGUNTAS_R5_2.length;

/* Un dato fijo, o uno que sale de lo que el estudiante ya respondió. */
export const resolver = (x, respuestas = {}) => (typeof x === "function" ? x(respuestas) : x);
export const correctoDe = (p, respuestas = {}) => ({ ...p.correcto, valor: resolver(p.correcto.valor, respuestas) });

/* El recorrido: la entrada y, por cada etapa, sus preguntas en orden y su corte. */
export function pasosDe(preguntas) {
  const pasos = [{ tipo: "entrada" }];
  for (const e of ETAPAS) {
    preguntas.forEach((p, i) => { if (p.etapa === e.id) pasos.push({ tipo: "pregunta", i }); });
    pasos.push({ tipo: "corte", etapa: e.id });
  }
  return pasos;
}
export const PASOS_R5_2 = pasosDe(PREGUNTAS_R5_2);

export const prepararR5_2 = (barajador = barajar) => ({ hoja: barajador(HOJA_DE_CUENTAS) });

/* ═══════════ LOS ASIENTOS ═══════════ */

export const puedeRevisarAsiento = ({ debe, haber, valor }) => Boolean(debe) && Boolean(haber) && Number(valor) > 0;

export function evaluarAsiento(p, { debe, haber, valor }, respuestas = {}) {
  const c = correctoDe(p, respuestas);
  const piezas = { debe: debe === c.debe, haber: haber === c.haber, valor: valor === c.valor };
  const ok = piezas.debe && piezas.haber && piezas.valor;
  let camino;
  let textos;
  if (ok) {
    camino = "acierto";
    textos = [p.acierto];
  } else if (debe === c.haber && haber === c.debe) {
    camino = "al-reves";
    textos = [p.alReves];
  } else if (!piezas.debe && !piezas.haber) {
    camino = "los-dos";
    textos = [p.debeMal[debe], p.haberMal[haber]];
  } else if (!piezas.debe) {
    camino = "debe";
    textos = [p.debeMal[debe]];
  } else if (!piezas.haber) {
    camino = "haber";
    textos = [p.haberMal[haber]];
  } else {
    const previsto = p.valorMal.find((v) => v.valor === valor);
    camino = previsto ? "valor-previsto" : "valor-generica";
    textos = [previsto ? previsto.texto : p.valorGenerica];
  }
  return { ok, piezas, camino, textos };
}

/* ═══════════ (a0) EL CÁLCULO DE LA PROVISIÓN ═══════════ */

/* Se activa cuando el total es mayor que 0; las filas son opcionales (Itagaki). */
export const puedeRevisarCalculo = ({ total }) => Number(total) > 0;

/* Una fila «vale diez veces o la décima parte» de lo correcto (decisión 5). */
const comaCorrida = (v, c) => c !== 0 && v !== null && (v === c * 10 || v * 10 === c);

/*
 * Se califica el total; las filas solo informan. Cada fila llena queda «ok»
 * o «mal»; una vacía no se marca («vacia»). Prioridad de los textos:
 * total bien con alguna fila mal → «compensado» (decisión 6); total bien →
 * acierto; total previsto → su texto; total con la coma corrida → coma;
 * alguna fila con la coma corrida → coma (decisión 5); si no, la genérica.
 */
export function evaluarCalculo(p, { filas = {}, total }, respuestas = {}) {
  const c = correctoDe(p, respuestas);
  const estadoFilas = Object.fromEntries(GRUPOS_A0.map((g) => {
    const v = filas[g.id] ?? null;
    return [g.id, v === null ? "vacia" : v === g.provision ? "ok" : "mal"];
  }));
  const ok = total === c.valor;
  const algunaMal = Object.values(estadoFilas).includes("mal");
  let camino;
  let texto;
  if (ok && algunaMal) { camino = "compensado"; texto = p.compensado; }
  else if (ok) { camino = "acierto"; texto = p.acierto; }
  else {
    const previsto = p.valorMal.find((v) => v.valor === total);
    if (previsto) { camino = "valor-previsto"; texto = previsto.texto; }
    else if (p.valoresComa.includes(total)) { camino = "coma-total"; texto = p.coma; }
    else if (GRUPOS_A0.some((g) => comaCorrida(filas[g.id] ?? null, g.provision))) { camino = "coma-fila"; texto = p.coma; }
    else { camino = "generica"; texto = p.generica; }
  }
  return { ok, piezas: { total: ok }, filas: estadoFilas, camino, textos: [texto] };
}

/* ═══════════ EL SALDO ═══════════ */

/* Con un valor escrito, aunque sea 0; con 0 no se exige lado (decisión 2). */
export const puedeRevisarSaldo = ({ valor, lado }) => valor !== null && valor !== undefined && (valor === 0 || Boolean(lado));

export function evaluarSaldo(p, { valor, lado }, respuestas = {}) {
  const c = correctoDe(p, respuestas);
  const piezas = { valor: valor === c.valor, lado: lado === c.lado };
  const ok = piezas.valor && piezas.lado;
  let camino;
  let textos;
  if (ok) {
    camino = "acierto";
    textos = [p.acierto];
  } else if (valor === c.valor && lado && lado !== c.lado) {
    camino = "lado";
    textos = [p.ladoMal];
  } else {
    const previsto = p.valorMal.find((v) => v.valor === valor);
    camino = previsto ? "valor-previsto" : "generica";
    textos = [previsto ? previsto.texto : p.generica];
  }
  return { ok, piezas, camino, textos };
}

/* ═══════════ EL LIBRO: LA T DE LA PROVISIÓN ═══════════ */

/*
 * Solo los renglones que tocan la provisión, con el asiento correcto (nunca
 * el que armó el estudiante). El pago de mayo no entra.
 */
export const movimientosDe = (V) => ({
  dic: [{ id: "ajuste", lado: "haber", concepto: CONCEPTOS.ajuste, valor: V.provision }],
  marzo: [
    { id: "castigo-roja", lado: "debe", concepto: CONCEPTOS.castigoRoja, valor: V.roja },
    { id: "castigo-negra", lado: "debe", concepto: CONCEPTOS.castigoNegra, valor: V.negra },
  ],
  mayo: [{ id: "revive", lado: "haber", concepto: CONCEPTOS.revive, valor: V.recuperacion }],
});
/* La versión A (la del libro); la B sale de movimientosDe(VERSION_B_R5_2.VALORES). */
export const MOVIMIENTOS = movimientosDe(VALORES);

/* El saldo con signo: crédito positivo (la naturaleza de la provisión), débito negativo. */
export const saldoDe = (movimientos) => movimientos.reduce((s, m) => s + (m.lado === "haber" ? m.valor : -m.valor), 0);
export const naturaleza = (saldo) => (saldo > 0 ? "credito" : saldo < 0 ? "debito" : "cero");

const ORDEN = ETAPAS.map((e) => e.id);
const hasta = (n, movs) => ORDEN.slice(0, n).flatMap((e) => movs[e]);

/* Como estaba el libro al empezar la etapa: lo que ven sus preguntas. */
export const libroAntesDe = (etapa, movs = MOVIMIENTOS) => hasta(ORDEN.indexOf(etapa), movs);
/* Como queda al cerrar la etapa: lo que muestra su corte al terminar. */
export const libroTras = (etapa, movs = MOVIMIENTOS) => hasta(ORDEN.indexOf(etapa) + 1, movs);

/* Los renglones de la columna más larga (R de §4). */
export const renglonesDe = (movimientos) => Math.max(1, ...["debe", "haber"].map((l) => movimientos.filter((m) => m.lado === l).length));

/* La barra del medidor: 2.283.400 es medio ancho (§4). Fracción del medio ancho. */
export const ESCALA_MEDIDOR = VALORES.provision;
export const fraccionDeBarra = (saldo) => Math.abs(saldo) / ESCALA_MEDIDOR;

/* ═══════════ EL FINAL Y LOS PUNTOS ═══════════ */

export const puntuarR5_2 = (aciertos, total = TOTAL_R5_2) => (total ? (aciertos / total) * 100 : 0);

export function porEtapa(resultados, preguntas = PREGUNTAS_R5_2, movs = MOVIMIENTOS) {
  return ETAPAS.map((e) => {
    const puntos = preguntas.filter((p) => p.etapa === e.id).map((p) => ({ id: p.id, ok: Boolean(resultados[p.id]) }));
    const saldo = saldoDe(libroTras(e.id, movs));
    return { ...e, puntos, bien: puntos.filter((x) => x.ok).length, total: puntos.length, saldo };
  });
}

/* El panel docente: cada ítem por su etapa y su enunciado. */
export function unidadDeR5_2(id) {
  const p = PREGUNTAS_R5_2.find((x) => x.id === String(id));
  return p ? `${ETAPAS.find((e) => e.id === p.etapa).marca} · ${p.enunciado}` : null;
}

export { R5_2 };
