import { pesos } from "../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 3 · «ARMA LA LÍNEA» Y LA CASILLA DE CIFRA — la lógica, sin React
 * (Célula C). La mecánica está en components/mecanicas/libros/t7/armaLaLinea.jsx.
 *
 *   bancoDeLinea(l, barajar)   la cuenta correcta y sus distractores, barajados
 *   retroDeLinea(l, cuenta)    por qué una línea quedó mal: la del distractor o la del lado
 *   evaluarCifra(ítem, v)      el veredicto de una casilla de cifra
 *   sinUnSoloIntento(texto)    la consigna sin «Tienes un solo intento…»
 *
 * LA ESCALERA (C2), para los Hacer que la piden (T5 N5 y los que vengan):
 *   escalonDeCifra(ítem, r, fallos)   los textos de una casilla según el intento
 *   evaluarCifraConEscalera(ítem, v, fallos)
 *   lineaConPista(l, fallos)          ¿el error de una línea va con su pista?
 * Sin `pista` en los datos, la escalera se comporta como un solo intento.
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

/* Un distractor de cuenta es { cuenta, retro } (Near, lote 3): la cuenta que se ofrece y por qué no es esa. */
const cuentaDe = (d) => (typeof d === "string" ? d : d.cuenta);
export const bancoDeLinea = (l, barajar) => barajar([l.cuenta, ...(l.distractores ?? []).map(cuentaDe)]);

/**
 * Por qué una línea quedó mal. Si la cuenta elegida es un distractor, su
 * retroalimentación (Near); si la cuenta es la buena y falló el lado, la de
 * la línea, que explica el lado.
 */
export function retroDeLinea(l, cuentaElegida) {
  if (cuentaElegida === l.cuenta) return l.retro;
  const d = (l.distractores ?? []).find((x) => typeof x !== "string" && x.cuenta === cuentaElegida);
  return d?.retro ?? l.retro;
}

/* El porqué de un acierto, sin su «Así es.»: lo que queda abre su frase («Así es: el 16 %…» → «El 16 %…»). */
const porqueDe = (acierto) => {
  const sin = String(acierto ?? "").replace(/^(Así es|Exacto)[.:]\s*/, "");
  return sin.charAt(0).toUpperCase() + sin.slice(1);
};

/**
 * Bien si la cifra es la correcta. Si la cifra es la de un distractor de
 * Near, su retroalimentación y la respuesta; si no, la respuesta con el
 * porqué del acierto (sin su «Así es.»).
 */
export function evaluarCifra(item, valor) {
  const ok = valor === item.correcta;
  if (ok) return { ok, correcta: item.correcta, textos: [item.acierto], textoCorrecta: pesos(item.correcta) };
  const d = (item.distractores ?? []).find((x) => x.valor === valor);
  const porque = porqueDe(item.acierto);
  const textos = d ? [d.retro, TEXTOS_ARMA.respuesta(item.correcta)] : [TEXTOS_ARMA.respuesta(item.correcta), porque];
  return { ok, correcta: item.correcta, textos: textos.filter(Boolean), textoCorrecta: pesos(item.correcta) };
}

/*
 * ═══════════ LA ESCALERA (C2) ═══════════
 *
 * Para los Hacer con «Vale el primer intento». En una casilla de cifra:
 *
 *   · primer error   el texto del error reconocido, si la respuesta es uno
 *                    (la cifra de un distractor, o lo que la pieza reconozca),
 *                    o la PISTA del ítem; se puede volver a intentar
 *   · segundo error  la respuesta con su porqué: «La respuesta es $…» y el
 *                    acierto sin su «Así es.»; el ítem se cierra
 *
 * `r` es { ok, reconocida }: la pieza decide si está bien y qué error
 * reconoce (así sirve también para una casilla con algo más al lado, como
 * Ganó o Perdió). `fallos` cuenta los errores, este incluido (1, 2, …). Sin
 * pista ni error reconocido, el primer error ya da la respuesta y cierra:
 * un solo intento, como antes. Quién puntúa es la pieza: solo el primer
 * intento suma.
 */
export function escalonDeCifra(item, { ok, reconocida = null }, fallos) {
  const base = { ok, correcta: item.correcta, textoCorrecta: pesos(item.correcta) };
  if (ok) return { ...base, cerrado: true, textos: [item.acierto] };
  const primero = reconocida ?? item.pista ?? null;
  if (fallos <= 1 && primero) return { ...base, cerrado: false, textos: [primero] };
  return { ...base, cerrado: true, textos: [TEXTOS_ARMA.respuesta(item.correcta), porqueDe(item.acierto)].filter(Boolean) };
}

/* Una casilla sola: el error reconocido es la cifra de un distractor. */
export function evaluarCifraConEscalera(item, valor, fallos) {
  const reconocida = (item.distractores ?? []).find((x) => x.valor === valor)?.retro ?? null;
  return escalonDeCifra(item, { ok: valor === item.correcta, reconocida }, fallos);
}

/*
 * Una línea de «Arma la línea» con escalera: al primer error, su pista
 * (`l.pista`), que no nombra ni la cuenta ni el lado; al segundo, «Era: …» y
 * su porqué (`l.retro`), como hoy. Sin pista, la respuesta desde el primero.
 */
export const lineaConPista = (l, fallos) => Boolean(l.pista) && fallos <= 1;

/* «Calcula … Tienes un solo intento por pregunta.» → «Calcula …». Solo esa frase sale; lo demás queda igual. */
export const sinUnSoloIntento = (texto) => String(texto ?? "").replace(/\s*Tienes un solo intento[^.]*\.\s*/g, " ").trim();
