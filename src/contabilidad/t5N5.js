import { ITEMS_N5 } from "../data/contabilidadT5_n5.js";
import { pesos } from "../data/contabilidad.js";
import { bancoDeLinea, escalonDeCifra } from "./armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N5 «¿Ganó o perdió?» (v2) — la lógica, sin React.
 *
 *   prepararN5(barajar)        los seis ítems en su orden; las líneas de cada
 *                              asiento y el banco de cuentas de cada línea,
 *                              barajados; las casillas, tal cual
 *   evaluarN5(ítem, r, fallos) el escalón de la escalera (escalonDeCifra):
 *                              `r` es la cifra o, con Ganó o Perdió,
 *                              { resultado, valor }; las dos partes deben
 *                              estar bien
 *   respuestaN5(ítem, r)       lo que se guarda en el detalle
 *   idLineaN5(ítem, l)         el id de una línea en el detalle:
 *                              «asiento-con-ganancia:caja»
 *   unidadesN5()               las diez unidades que puntúan
 *   puntuarN5(aciertos)        aciertos / 10 × 100 (evaluativa: el motor escala)
 *   unidadDeN5(id)             el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const prepararN5 = (barajar) => ITEMS_N5.map((it) => {
  if (it.tipo !== "asiento") return it;
  return { ...it, orden: barajar(it.lineas.map((l) => l.id)), lineas: it.lineas.map((l) => ({ ...l, banco: bancoDeLinea(l, barajar) })) };
});

const partes = (item, r) => (item.resultado ? { resultado: r?.resultado ?? null, valor: r?.valor ?? null } : { resultado: null, valor: r });

/*
 * El error que se reconoce: el primero de la lista cuyas condiciones se
 * cumplen. Un distractor sin `resultado` se reconoce por la cifra sola
 * («si escribe 2.970.000», con Ganó o con Perdió).
 */
export function errorReconocidoN5(item, r) {
  const { resultado, valor } = partes(item, r);
  return (item.distractores ?? []).find((d) => d.valor === valor && (!d.resultado || d.resultado === resultado)) ?? null;
}

export const okN5 = (item, r) => {
  const { resultado, valor } = partes(item, r);
  return valor === item.correcta && (!item.resultado || resultado === item.resultado);
};

export const evaluarN5 = (item, r, fallos = 1) => escalonDeCifra(item, { ok: okN5(item, r), reconocida: errorReconocidoN5(item, r)?.retro ?? null }, fallos);

/* En el detalle: la cifra, o «perdio|165000». */
export const respuestaN5 = (item, r) => (item.resultado ? `${r.resultado}|${r.valor}` : r);

export const idLineaN5 = (item, l) => `${item.id}:${l.id}`;

export const unidadesN5 = () => ITEMS_N5.flatMap((it) => (it.tipo === "asiento" ? it.lineas.map((l) => idLineaN5(it, l)) : [it.id]));

export const TOTAL_N5 = unidadesN5().length;
export const puntuarN5 = (aciertos, total = TOTAL_N5) => (total ? (aciertos / total) * 100 : 0);

/* Una casilla, por su pregunta; una línea, por su cuenta y su valor. */
export function unidadDeN5(id) {
  const [itemId, lineaId] = String(id).split(":");
  const it = ITEMS_N5.find((x) => x.id === itemId);
  if (!it) return null;
  if (!lineaId) return it.tipo === "asiento" ? null : it.pregunta;
  const l = it.lineas?.find((x) => x.id === lineaId);
  return l ? `${l.cuenta} ${pesos(l.valor)}` : null;
}
