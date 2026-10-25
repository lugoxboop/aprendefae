import {
  ACT_GASTO_O_PAGO, TIPOS, GS, G, S, NN, VERSIONES_GASTO_O_PAGO, ERRORES_GASTO_O_PAGO, BANCO_A, BANCO_B,
} from "../data/contabilidadTema3GastoOPago.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · «¿GASTO O PAGO?» — el sorteo, la evaluación, los contadores y el
 * puntaje (paquete e3-t3-gasto-o-pago-v3).
 *
 * ═══════════ EL SORTEO (§1) ═══════════
 *
 * Seis hechos de los ocho de la versión. Siempre entra el «ni gasto ni
 * salida», y al menos uno de cada tipo G+S, G y S. Los dos que faltan salen
 * al azar del resto, y el orden final se baraja.
 *
 * ═══════════ QUÉ ERROR TOCA (§4, C4) ═══════════
 *
 * Lo decide cada pregunta por separado, comparando lo que era con lo tocado:
 *   gasto   A · había gasto y no lo marcó   B · marcó gasto donde no hubo
 *   plata   C · marcó salida sin plata      D · había salida y no la marcó
 * Se devuelven a lo sumo dos textos: primero el de gasto y después el de plata.
 *
 * ═══════════ LOS CONTADORES (§6) ═══════════
 *
 * «Gastos» suma el monto de los hechos con gasto; «Salió», el de los hechos
 * con salida. La barra completa vale la suma de todos los montos de la
 * versión, la misma escala para los dos y fija por versión.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const bancoDe = (version) => VERSIONES_GASTO_O_PAGO[version] ?? VERSIONES_GASTO_O_PAGO.A;

export function sortearGastoOPago(barajar, version = "A", n = ACT_GASTO_O_PAGO.porPartida) {
  const banco = bancoDe(version).banco;
  const fijos = [NN, GS, G, S].map((tipo) => {
    const lista = banco.filter((h) => h.tipo === tipo);
    if (!lista.length) throw new Error(`la versión ${version} no tiene hechos de tipo «${tipo}»`);
    return barajar(lista)[0];
  });
  const resto = barajar(banco.filter((h) => !fijos.includes(h))).slice(0, n - fijos.length);
  return barajar([...fijos, ...resto]);
}

export function evaluarGastoOPago(hecho, casilla) {
  const real = TIPOS[hecho.tipo];
  const toco = TIPOS[casilla];
  if (!real || !toco) throw new Error(`casilla «${casilla}» o tipo «${hecho.tipo}» desconocidos`);
  const ok = casilla === hecho.tipo;
  if (ok) return { ok, correcta: hecho.tipo, errores: [], textos: [hecho.acierto] };
  const errores = [];
  const textos = [];
  if (real.gasto && !toco.gasto) { errores.push("A"); textos.push(ERRORES_GASTO_O_PAGO.A[hecho.tipo]); }
  if (!real.gasto && toco.gasto) { errores.push("B"); textos.push(ERRORES_GASTO_O_PAGO.B[hecho.porQue]); }
  if (!real.salida && toco.salida) { errores.push("C"); textos.push(ERRORES_GASTO_O_PAGO.C[hecho.tipo]); }
  if (real.salida && !toco.salida) { errores.push("D"); textos.push(ERRORES_GASTO_O_PAGO.D); }
  return { ok, correcta: hecho.tipo, errores, textos };
}

/* Lo que suma un hecho a cada contador si cae en una casilla. */
export function aporteDe(hecho, casilla) {
  const c = TIPOS[casilla];
  return { gastos: c.gasto ? hecho.monto : 0, salio: c.salida ? hecho.monto : 0 };
}

/* Los contadores tras una lista de hechos, cada uno en su casilla correcta. */
export function contadores(hechos) {
  return hechos.reduce((t, h) => {
    const a = aporteDe(h, h.tipo);
    return { gastos: t.gastos + a.gastos, salio: t.salio + a.salio };
  }, { gastos: 0, salio: 0 });
}

/* §3: la escala de la barra, la suma de todos los montos de la versión. */
export const escalaDe = (version) => bancoDe(version).banco.reduce((s, h) => s + h.monto, 0);

/* Un hecho es acierto si la casilla es la correcta. Sin reintento. */
export function puntuarGastoOPago(respuestas, cuantas) {
  if (!cuantas) return 0;
  return (respuestas.filter((r) => r.ok).length / cuantas) * 100;
}

/* La cifra de los contadores: «$1.140.000», con el punto de miles del libro. */
export const pesos = (n) => `$${Math.round(n).toLocaleString("es-CO").replace(/,/g, ".")}`;

/* Para el panel docente: el hecho de un id, sin la marca «Escenario simulado.», que todos llevan. */
export const hechoDeItem = (id) => {
  const h = [...BANCO_A, ...BANCO_B].find((x) => x.id === id);
  return h ? h.texto.replace(/^Escenario simulado\.\s*/, "") : null;
};

export { GS, G, S, NN };
