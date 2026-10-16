import { ITEMS_N7 } from "../data/contabilidadT5_n7.js";
import { pesos } from "../data/contabilidad.js";
import { bancoDeLinea, evaluarCifraConEscalera } from "./armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N7 «¿A qué cuenta va?» (v2) — la lógica, sin React. Como N5 (t5N5.js),
 * con la escalera de armaLaLinea.js.
 *
 *   prepararN7(barajar)        los cinco ítems en su orden; las líneas de cada
 *                              asiento y el banco de cuentas de cada línea,
 *                              barajados; la casilla, tal cual
 *   evaluarN7(ítem, v, fallos) el escalón de la casilla
 *                              (evaluarCifraConEscalera): la cifra de un
 *                              distractor se reconoce al primer error
 *   idLineaN7(ítem, l)         el id de una línea en el detalle: «la-compra:bancos»
 *   unidadesN7()               las diez unidades que puntúan
 *   puntuarN7(aciertos)        aciertos / 10 × 100 (evaluativa: el motor escala)
 *   unidadDeN7(id)             el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const prepararN7 = (barajar) => ITEMS_N7.map((it) => {
  if (it.tipo !== "asiento") return it;
  return { ...it, orden: barajar(it.lineas.map((l) => l.id)), lineas: it.lineas.map((l) => ({ ...l, banco: bancoDeLinea(l, barajar) })) };
});

export const evaluarN7 = (item, valor, fallos = 1) => evaluarCifraConEscalera(item, valor, fallos);

export const idLineaN7 = (item, l) => `${item.id}:${l.id}`;

export const unidadesN7 = () => ITEMS_N7.flatMap((it) => (it.tipo === "asiento" ? it.lineas.map((l) => idLineaN7(it, l)) : [it.id]));

export const TOTAL_N7 = unidadesN7().length;
export const puntuarN7 = (aciertos, total = TOTAL_N7) => (total ? (aciertos / total) * 100 : 0);

/* La casilla, por su pregunta; una línea, por su hecho, su cuenta y su valor (Caja va en dos hechos). */
export function unidadDeN7(id) {
  const [itemId, lineaId] = String(id).split(":");
  const it = ITEMS_N7.find((x) => x.id === itemId);
  if (!it) return null;
  if (!lineaId) return it.tipo === "asiento" ? null : it.pregunta;
  const l = it.lineas?.find((x) => x.id === lineaId);
  return l ? `Hecho ${it.hecho} · ${l.cuenta} ${pesos(l.valor)}` : null;
}
