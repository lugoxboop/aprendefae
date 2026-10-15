import { pesos } from "../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 3 · «ARMA LA LÍNEA» Y LA CASILLA DE CIFRA — la lógica, sin React
 * (Célula C). La mecánica está en components/mecanicas/libros/t7/armaLaLinea.jsx.
 *
 *   bancoDeLinea(l, barajar)   la cuenta correcta y sus distractores, barajados
 *   evaluarCifra(ítem, v)      el veredicto de una casilla de cifra
 *   sinUnSoloIntento(texto)    la consigna sin «Tienes un solo intento…»
 *
 * Textos de interfaz que son convención de la célula (no de Near): «Un
 * intento», «Elige la cuenta», «Era: …» y «La respuesta es $…».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TEXTOS_ARMA = {
  unIntento: "Un intento",
  eligeCuenta: "Elige la cuenta",
  era: (cuenta, lado) => `Era: ${cuenta}, al ${lado.toLowerCase()}.`,
  respuesta: (cifra) => `La respuesta es ${pesos(cifra)}.`,
  campo: "Tu respuesta, en pesos",
};

export const bancoDeLinea = (l, barajar) => barajar([l.cuenta, ...(l.distractores ?? [])]);

/**
 * Bien si la cifra es la correcta. Si la cifra es la de un distractor de
 * Near, su retroalimentación y la respuesta; si no, la respuesta con el
 * porqué del acierto (sin su «Así es.»).
 */
export function evaluarCifra(item, valor) {
  const ok = valor === item.correcta;
  if (ok) return { ok, correcta: item.correcta, textos: [item.acierto], textoCorrecta: pesos(item.correcta) };
  const d = (item.distractores ?? []).find((x) => x.valor === valor);
  const porque = String(item.acierto ?? "").replace(/^Así es[.:]\s*/, "");
  const textos = d ? [d.retro, TEXTOS_ARMA.respuesta(item.correcta)] : [TEXTOS_ARMA.respuesta(item.correcta), porque];
  return { ok, correcta: item.correcta, textos: textos.filter(Boolean), textoCorrecta: pesos(item.correcta) };
}

/* «Calcula … Tienes un solo intento por pregunta.» → «Calcula …». Solo esa frase sale; lo demás queda igual. */
export const sinUnSoloIntento = (texto) => String(texto ?? "").replace(/\s*Tienes un solo intento[^.]*\.\s*/g, " ").trim();
