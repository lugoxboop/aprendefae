import { ITEMS_H4 } from "../data/contabilidadT7_3_h4.js";
import { pesos } from "../data/contabilidad.js";
import { bancoDeLinea, evaluarCifra } from "./armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H4 «Pagó a tiempo» — la lógica, sin React.
 *
 *   prepararH4(barajar)    los siete ítems en su orden; las opciones de cada
 *                          elección (salvo «Debe» y «Haber» del cierre, en
 *                          ese orden), las líneas de cada asiento y el banco
 *                          de cuentas de cada línea, barajados; las casillas
 *                          de cifra, tal cual
 *   evaluarH4(ítem, v)     el veredicto de una elección o de una casilla de
 *                          cifra (evaluarCifra) y su texto
 *   idLineaH4(ítem, l)     el id de una línea en el detalle:
 *                          «libro-de-totumo:caja»
 *   unidadesH4()           las once unidades que puntúan
 *   puntuarH4(aciertos)    aciertos / 11 × 100 (evaluativa: el motor escala)
 *   unidadDeH4(id)         el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

const textoDe = (it, v) => (it.pesos ? pesos(v) : v);
export const opcionesDeH4 = (item) => [item.correcta, ...item.distractores.map((d) => d.valor)];

export const prepararH4 = (barajar) => ITEMS_H4.map((it) => {
  if (it.tipo === "cifra") return it;
  /* «Arma la línea»: cada línea con su banco de cuentas, barajado. */
  if (it.tipo === "asiento") return { ...it, orden: barajar(it.lineas.map((l) => l.id)), lineas: it.lineas.map((l) => ({ ...l, banco: bancoDeLinea(l, barajar) })) };
  const valores = it.fijas ? opcionesDeH4(it) : barajar(opcionesDeH4(it));
  return { ...it, opciones: valores.map((v) => ({ valor: v, texto: textoDe(it, v) })) };
});

export function evaluarH4(item, valor) {
  if (item.tipo === "cifra") return evaluarCifra(item, valor);
  const ok = valor === item.correcta;
  const texto = ok ? item.acierto : item.distractores.find((d) => d.valor === valor)?.retro ?? null;
  return { ok, correcta: item.correcta, textos: [texto], textoCorrecta: textoDe(item, item.correcta) };
}

export const idLineaH4 = (item, l) => `${item.id}:${l.id}`;

export const unidadesH4 = () => ITEMS_H4.flatMap((it) => (it.tipo === "asiento" ? it.lineas.map((l) => idLineaH4(it, l)) : [it.id]));

export const TOTAL_H4 = unidadesH4().length;
export const puntuarH4 = (aciertos, total = TOTAL_H4) => (total ? (aciertos / total) * 100 : 0);

/* Una elección, por su pregunta; una línea, por su libro, su cuenta y su valor (las dos libretas usan cuentas iguales). */
export function unidadDeH4(id) {
  const [itemId, lineaId] = String(id).split(":");
  const it = ITEMS_H4.find((x) => x.id === itemId);
  if (!it) return null;
  if (!lineaId) return it.tipo === "asiento" ? null : it.pregunta;
  const l = it.lineas?.find((x) => x.id === lineaId);
  const libro = it.id === "libro-de-totumo" ? "Totumo" : "Bambú";
  return l ? `${libro} · ${l.cuenta} ${pesos(l.valor)}` : null;
}
