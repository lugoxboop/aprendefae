import { ITEMS_H1 } from "../data/contabilidadT7_3_h1.js";
import { pesos } from "../data/contabilidad.js";
import { bancoDeLinea, evaluarCifra } from "./armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H1 «Descuento en la factura» — la lógica, sin React.
 *
 *   prepararH1(barajar)    los cinco ítems en su orden; las opciones de cada
 *                          cálculo y las líneas de cada asiento, barajadas
 *   evaluarH1(ítem, v)     el veredicto de un cálculo y su texto
 *   idLineaH1(ítem, l)     el id de una línea en el detalle:
 *                          «asiento:clientes»
 *   unidadesH1()           las ocho unidades que puntúan
 *   puntuarH1(aciertos)    aciertos / 8 × 100 (evaluativa: el motor escala)
 *   unidadDeH1(id)         el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const opcionesDeH1 = (item) => [item.correcta, ...item.distractores.map((d) => d.valor)];

export const prepararH1 = (barajar) => ITEMS_H1.map((it) => {
  if (it.tipo === "eleccion") return { ...it, opciones: barajar(opcionesDeH1(it)).map((v) => ({ valor: v, texto: pesos(v) })) };
  if (it.tipo === "cifra") return it;
  /* «Arma la línea»: cada línea con su banco de cuentas, barajado. */
  return { ...it, orden: barajar(it.lineas.map((l) => l.id)), lineas: it.lineas.map((l) => ({ ...l, banco: bancoDeLinea(l, barajar) })) };
});

export function evaluarH1(item, valor) {
  if (item.tipo === "cifra") return evaluarCifra(item, valor);
  const ok = valor === item.correcta;
  const texto = ok ? item.acierto : item.distractores.find((d) => d.valor === valor)?.retro ?? null;
  return { ok, correcta: item.correcta, textos: [texto], textoCorrecta: pesos(item.correcta) };
}

export const idLineaH1 = (item, l) => `${item.id}:${l.id}`;

export const unidadesH1 = () => ITEMS_H1.flatMap((it) => (it.tipo === "asiento" ? it.lineas.map((l) => idLineaH1(it, l)) : [it.id]));

export const TOTAL_H1 = unidadesH1().length;
export const puntuarH1 = (aciertos, total = TOTAL_H1) => (total ? (aciertos / total) * 100 : 0);

/* Un cálculo, por su pregunta; una línea, por su cuenta y su valor. */
export function unidadDeH1(id) {
  const [itemId, lineaId] = String(id).split(":");
  const it = ITEMS_H1.find((x) => x.id === itemId);
  if (!it) return null;
  if (!lineaId) return it.tipo === "asiento" ? null : it.pregunta;
  const l = it.lineas?.find((x) => x.id === lineaId);
  return l ? `${l.cuenta} ${pesos(l.valor)}` : null;
}
