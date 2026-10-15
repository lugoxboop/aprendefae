import { DEBE, HABER } from "../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA MESA DE ASIENTOS DE LA CÉLULA B — la evaluación, generalizada desde el
 * cierre de Santa Pacha (T5 · Hacer 2) para servir también a los Hacer del
 * Tema 6 (b5-t6-a2, b5-t6-a3).
 *
 * La regla de t3-cierre-completo: un intento por parte, sin puntos parciales,
 * y cuando se cumple más de un error manda el más estructural: una cuenta que
 * no va (D), una cuenta al revés (C), una cuenta que falta (A) y, con todas
 * las cuentas en su lado, un valor mal escrito (B).
 *
 * Las B específicas (`errores.especificas`, en orden) explican una confusión
 * nombrada de valor: se muestran si alguna cuenta lleva un valor equivocado
 * que cumple su condición: de esa `cuenta` (cualquier valor equivocado: la
 * C7 de T5) o ese `valor` (la C12, C14 y C15 del Tema 6), o los dos. Si
 * ninguna se cumple, va la B general.
 *
 * La D nombra la cuenta (Sakuta, calidad 1): «No va {X}: en su lugar va
 * {Y}.» si sobra una y falta otra; si no, «Sobra {X}.» o «Sobran {X} y
 * {Y}.». Le sigue el texto D de los datos sin su primera frase, «Sobra una
 * cuenta.». Los nombres van como en el estante.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SOBRA_UNA = "Sobra una cuenta. ";
const enLista = (xs) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} y ${xs.at(-1)}`);

/* La devolución D: qué cuenta no va (y, si es una por una, cuál va en su lugar), y después el texto D de los datos. */
export function textoD(parte, puestas) {
  const real = new Set(parte.asiento.map((e) => e.cuenta));
  const sobran = puestas.map((p) => p.cuenta).filter((c) => !real.has(c));
  const faltan = parte.asiento.map((e) => e.cuenta).filter((c) => !puestas.some((p) => p.cuenta === c));
  const cuales = sobran.length === 1 && faltan.length === 1
    ? `No va ${sobran[0]}: en su lugar va ${faltan[0]}.`
    : `${sobran.length > 1 ? "Sobran" : "Sobra"} ${enLista(sobran)}.`;
  const resto = parte.errores.D.startsWith(SOBRA_UNA) ? parte.errores.D.slice(SOBRA_UNA.length) : parte.errores.D;
  return `${cuales} ${resto}`;
}

/* Una parte armada: `puestas` es [{ cuenta, lado, valor }]. */
export function evaluarParte(parte, puestas) {
  const esperado = parte.asiento;
  const real = new Map(esperado.map((e) => [e.cuenta, e]));
  let error = null;
  let texto = null;
  if (puestas.some((p) => !real.has(p.cuenta))) error = "D";
  else if (puestas.some((p) => real.get(p.cuenta).lado !== p.lado)) error = "C";
  else if (esperado.some((e) => !puestas.some((p) => p.cuenta === e.cuenta))) error = "A";
  else {
    const malas = puestas.filter((p) => p.valor !== real.get(p.cuenta).valor);
    if (malas.length) {
      const cumple = (x) => malas.some((p) => (x.cuenta === undefined || p.cuenta === x.cuenta) && (x.valor === undefined || p.valor === x.valor));
      const especifica = (parte.errores.especificas ?? []).find(cumple);
      error = especifica ? especifica.clave : "B";
      texto = especifica ? especifica.texto : parte.errores.B;
    }
  }
  if (error === "D") texto = textoD(parte, puestas);
  if (error && texto === null) texto = parte.errores[error];
  return { ok: error === null, error, deValor: Boolean(error) && !["D", "C", "A"].includes(error), texto, esperado };
}

/* Los totales de una mesa (los colectores). */
export const totalesDe = (puestas) => ({
  debe: puestas.filter((p) => p.lado === DEBE).reduce((s, p) => s + (p.valor ?? 0), 0),
  haber: puestas.filter((p) => p.lado === HABER).reduce((s, p) => s + (p.valor ?? 0), 0),
});

/* Bien a la primera, sobre las partes de la tanda. */
export const puntuar = (resultados, total) => (total ? (resultados.filter((r) => r.ok).length / total) * 100 : 0);

/* Para el panel docente: la parte se lee por su rótulo y su instrucción. */
export const parteDeItem = (partes) => (id) => {
  const p = partes.find((x) => x.id === id);
  return p ? `${p.rotulo} · ${p.instruccion}` : null;
};
