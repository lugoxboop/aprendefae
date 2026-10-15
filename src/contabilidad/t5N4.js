import { ITEMS_N4 } from "../data/contabilidadT5_n4.js";
import { pesos } from "../data/contabilidad.js";
import { bancoDeLinea, evaluarCifra } from "./armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N4 «El interés del periodo» — la lógica, sin React.
 *
 *   prepararN4(barajar)    los cinco ítems en su orden; las opciones de cada
 *                          elección, las dos líneas del asiento y el banco de
 *                          cuentas de cada línea, barajados; las casillas de
 *                          cifra, tal cual
 *   evaluarN4(ítem, v)     el veredicto de una elección o de una casilla de
 *                          cifra (evaluarCifra) y su texto
 *   idLineaN4(ítem, l)     el id de una línea en el detalle:
 *                          «asiento-del-cobro:caja»
 *   unidadesN4()           las seis unidades que puntúan
 *   puntuarN4(aciertos)    aciertos / 6 × 100 (evaluativa: el motor escala)
 *   unidadDeN4(id)         el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

const textoDe = (it, v) => (it.pesos ? pesos(v) : v);
export const opcionesDeN4 = (item) => [item.correcta, ...item.distractores.map((d) => d.valor)];

export const prepararN4 = (barajar) => ITEMS_N4.map((it) => {
  if (it.tipo === "cifra") return it;
  /* «Arma la línea»: cada línea con su banco de cuentas, barajado. */
  if (it.tipo === "asiento") return { ...it, orden: barajar(it.lineas.map((l) => l.id)), lineas: it.lineas.map((l) => ({ ...l, banco: bancoDeLinea(l, barajar) })) };
  return { ...it, opciones: barajar(opcionesDeN4(it)).map((v) => ({ valor: v, texto: textoDe(it, v) })) };
});

export function evaluarN4(item, valor) {
  if (item.tipo === "cifra") return evaluarCifra(item, valor);
  const ok = valor === item.correcta;
  const texto = ok ? item.acierto : item.distractores.find((d) => d.valor === valor)?.retro ?? null;
  return { ok, correcta: item.correcta, textos: [texto], textoCorrecta: textoDe(item, item.correcta) };
}

export const idLineaN4 = (item, l) => `${item.id}:${l.id}`;

export const unidadesN4 = () => ITEMS_N4.flatMap((it) => (it.tipo === "asiento" ? it.lineas.map((l) => idLineaN4(it, l)) : [it.id]));

export const TOTAL_N4 = unidadesN4().length;
export const puntuarN4 = (aciertos, total = TOTAL_N4) => (total ? (aciertos / total) * 100 : 0);

/* Una elección, por su pregunta; una línea, por su cuenta y su valor. */
export function unidadDeN4(id) {
  const [itemId, lineaId] = String(id).split(":");
  const it = ITEMS_N4.find((x) => x.id === itemId);
  if (!it) return null;
  if (!lineaId) return it.tipo === "asiento" ? null : it.pregunta;
  const l = it.lineas?.find((x) => x.id === lineaId);
  return l ? `${l.cuenta} ${pesos(l.valor)}` : null;
}
