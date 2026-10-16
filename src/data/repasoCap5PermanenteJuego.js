import { contra } from "./repasoCap5MateJuego.js";
import { PANTALLAS, COMUNES_PERMANENTE, R5_5, pantalla } from "./repasoCap5PermanenteTextos.js";
import { TOLERANCIA_P4 } from "./repasoCap5Permanente.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-5 «Septiembre en permanente» — la lógica, sin React (Célula E).
 *
 *   evaluarP1 … evaluarP5        una calificación por pantalla (bien o mal)
 *   faltaLaComa(unitario)        la red de la coma (v1.3, decisión 3)
 *   puntuarR5_5(aciertos)        aciertos / 5 × 100: 10 FP por acierto
 *   unidadDeR5_5(id)             el texto de cada pantalla para el panel docente
 *   respuestaDe(id, respuesta)   lo que se guarda cuando falla (≤ 120)
 *
 * LA REGLA COMÚN (paquete): con varios campos, sale el texto del primero con
 * error en el orden de la pantalla; si hay más, «Y hay más por revisar.». El
 * asiento (pantallas 2 y 3) se califica por renglón con el evaluador de r5-3
 * (`contra`); de sus problemas sale primero el lado cruzado, luego la cuenta
 * que no va, luego lo que sobra, falta o tiene otro valor.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TOTAL_R5_5 = PANTALLAS.length;
const centavos = (x) => Math.round(Number(x) * 100);
export const mismoUnitario = (a, b) => centavos(a) === centavos(b);

/* v1.3, decisión 3: un costo unitario menor que 100 no se califica todavía. */
export const faltaLaComa = (unitario) => unitario !== null && Number(unitario) > 0 && Number(unitario) < 100;

/* El texto de un campo equivocado: el previsto para ese valor o la genérica. */
function textoDeValor(previstos, valor, generica, igual = (a, b) => a === b) {
  const p = previstos.find((x) => x.valores.some((v) => igual(v, valor)));
  return p ? p.texto : generica;
}

const ORDEN_DEL_ASIENTO = { cruzado: 0, cuenta: 1, sobra: 2, falta: 2, valor: 2 };

/* El asiento del costo: estados por renglón (como r5-3) y sus textos, ya en orden. */
export function evaluarAsientoDe(p, renglones) {
  const a = { ...p.asiento, falta: {}, generica: p.generica };
  const r = contra(a, a.correctos[0], renglones, { comunes: COMUNES_PERMANENTE });
  /* Una cuenta puesta en lugar de otra es un error, no dos: lo que «falta» en ese lado lo explica la cuenta que no va. */
  const sustituidas = new Set(r.problemas.filter((x) => x.clase === "cuenta").map((x) => x.lado));
  const textos = r.problemas
    .filter((x) => !(x.clase === "falta" && sustituidas.has(x.lado)))
    .map((x, k) => ({ ...x, k }))
    .sort((x, y) => ORDEN_DEL_ASIENTO[x.clase] - ORDEN_DEL_ASIENTO[y.clase] || x.k - y.k)
    .map((x) => x.texto);
  return { ok: r.ok, estados: r.estados, piezas: r.piezas, textos, correcto: a.correctos[0] };
}

/* Junta los textos de los errores, en orden: el primero y, si hay más, «Y hay más por revisar.». */
function veredicto(p, errores, extra = {}) {
  const distintos = [...new Set(errores)];
  if (!distintos.length) return { ok: true, textos: [p.acierto], ...extra };
  return { ok: false, textos: distintos.length > 1 ? [distintos[0], COMUNES_PERMANENTE.hayMas] : [distintos[0]], ...extra };
}

export function evaluarP1({ destino, unitario }) {
  const p = pantalla("p1");
  const destinoOk = destino === p.clave.destino;
  const unitarioOk = mismoUnitario(unitario, p.clave.unitario);
  const errores = [];
  if (!destinoOk) errores.push(p.devoluciones.alGasto);
  if (!unitarioOk) errores.push(textoDeValor(p.devoluciones.unitario, unitario, p.generica, mismoUnitario));
  return veredicto(p, errores, { estados: { destino: destinoOk ? "ok" : "mal", unitario: unitarioOk ? "ok" : "mal" } });
}

export function evaluarP2({ promedio, costo, renglones }) {
  const p = pantalla("p2");
  const promedioOk = mismoUnitario(promedio, p.clave.promedio);
  const costoOk = Number(costo) === p.clave.costo;
  const asiento = evaluarAsientoDe(p, renglones);
  const errores = [];
  if (!promedioOk) errores.push(textoDeValor(p.devoluciones.promedio, promedio, p.generica, mismoUnitario));
  if (!costoOk) errores.push(textoDeValor(p.devoluciones.costo, Number(costo), p.generica));
  errores.push(...asiento.textos);
  return veredicto(p, errores, { estados: { promedio: promedioOk ? "ok" : "mal", costo: costoOk ? "ok" : "mal" }, asiento });
}

/* Solo los valores (paso A de la pantalla 2): sus estados, sin calificar todavía la pantalla. */
export function estadosDeValoresP2({ promedio, costo }) {
  const p = pantalla("p2");
  return { promedio: mismoUnitario(promedio, p.clave.promedio) ? "ok" : "mal", costo: Number(costo) === p.clave.costo ? "ok" : "mal" };
}

export function evaluarP3({ unitario, renglones }) {
  const p = pantalla("p3");
  const valorOk = mismoUnitario(unitario, p.clave.unitario);
  const asiento = evaluarAsientoDe(p, renglones);
  const errores = [];
  if (!valorOk) errores.push(p.devoluciones.valor[unitario] ?? p.generica);
  errores.push(...asiento.textos);
  return veredicto(p, errores, { estados: { valor: valorOk ? "ok" : "mal" }, asiento });
}

export const costoAceptadoP4 = (costo) => Number(costo) >= TOLERANCIA_P4.desde && Number(costo) <= TOLERANCIA_P4.hasta;

export function evaluarP4({ promedio, costo }) {
  const p = pantalla("p4");
  const promedioOk = mismoUnitario(promedio, p.clave.promedio);
  const costoOk = costoAceptadoP4(costo);
  const errores = [];
  if (!promedioOk) errores.push(textoDeValor(p.devoluciones.promedio, promedio, p.generica, mismoUnitario));
  if (!costoOk) errores.push(textoDeValor(p.devoluciones.costo, Number(costo), p.generica));
  return veredicto(p, errores, { estados: { promedio: promedioOk ? "ok" : "mal", costo: costoOk ? "ok" : "mal" } });
}

export function evaluarP5(elegida) {
  const p = pantalla("p5");
  const o = p.opciones.find((x) => x.id === elegida);
  if (o?.correcta) return { ok: true, textos: [p.acierto], elegida };
  /*
   * Cada opción equivocada trae su devolución; la genérica del paquete va
   * después, como segundo párrafo (decisión mía: si no, nunca saldría en
   * pantalla, y E1 la pide).
   */
  return { ok: false, textos: o?.retro ? [o.retro, p.generica] : [p.generica], elegida, correcta: p.opciones.find((x) => x.correcta).id };
}

export const EVALUAR = { p1: evaluarP1, p2: evaluarP2, p3: evaluarP3, p4: evaluarP4, p5: evaluarP5 };

export const puntuarR5_5 = (aciertos, total = TOTAL_R5_5) => (total ? (aciertos / total) * 100 : 0);

/* El panel docente: cada pantalla por su número y su título del paquete. */
const TITULOS = {
  p1: "La compra trae su flete",
  p2: "Vende 6.000",
  p3: "Vuelven 200",
  p4: "Llega el lote barato y sale la del 28",
  p5: "¿Por qué no da lo mismo?",
};
export function unidadDeR5_5(id) {
  const k = PANTALLAS.findIndex((p) => p.id === String(id));
  return k < 0 ? null : `Pantalla ${k + 1} · ${TITULOS[id]}`;
}
export { TITULOS as TITULOS_R5_5 };

/* Lo que se guarda cuando falla: las piezas del estudiante, cortadas a 120 (registrar_fp guarda left(…,120)). */
export const LARGO_RESPUESTA = 120;
const asientoCorto = (renglones = []) => renglones.map((x) => `${x.lado === "debe" ? "D" : "H"} ${x.cuenta} ${x.valor}`).join(" | ");
export function respuestaDe(id, x) {
  const partes = {
    p1: () => `${x.destino} · ${x.unitario}`,
    p2: () => `${x.promedio} · ${x.costo} · ${asientoCorto(x.renglones)}`,
    p3: () => `${x.unitario} · ${asientoCorto(x.renglones)}`,
    p4: () => `${x.promedio} · ${x.costo}`,
    p5: () => String(x.elegida),
  }[id]();
  return partes.length > LARGO_RESPUESTA ? `${partes.slice(0, LARGO_RESPUESTA - 2)} …` : partes;
}

export { R5_5 };
