import { ITEMS_H3, KARDEX_H3, METODOS_H3, nombreDeMetodo } from "../data/contabilidadT7_2_h3.js";
import { pesos } from "../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · H3 «Llena el kárdex» — la lógica, sin React.
 *
 *   prepararH3(barajar)   los diez ítems en su orden; las opciones, barajadas
 *   evaluarH3(ítem, v)    el veredicto y su texto
 *   vistaKardex(metodo, k, respondido)
 *        lo que se ve del kárdex de un método cuando el ítem en curso es el
 *        k (0 a 9) y ya se respondió o no. La regla de la v1: las celdas que
 *        no se preguntan aparecen al comprobar el ítem anterior. Así:
 *          · las fechas antes de la casilla pendiente, completas
 *          · en la fecha de la casilla, los bloques de antes completos, y el
 *            de la casilla con su punto:
 *              total → una sola fila «Total» con el punto
 *              costo unitario → la capa con el punto y el total vacío
 *          · lo que viene después, oculto
 *        Así, en Promedio, la salida y el saldo del 12 aparecen después del
 *        ítem 7, y la venta del 26 después del ítem 8, como pide la v1.
 *        Devuelve null si el método aún no ha llegado (su pestaña no se abre).
 *   unidadesH3()          las diez unidades que puntúan
 *   puntuarH3(aciertos)   aciertos / 10 × 100 (evaluativa: el motor escala)
 *   unidadDeH3(id)        el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* El punto: lo que la tabla pinta como casilla por llenar. */
export const PUNTO = "?";

const textoDe = (it, v) => (it.tipo === "metodo" ? nombreDeMetodo(v) : pesos(v));
export const opcionesDeH3 = (item) => [item.correcta, ...item.distractores.map((d) => d.valor)];

export const prepararH3 = (barajar) => ITEMS_H3.map((it) => ({
  ...it, opciones: barajar(opcionesDeH3(it)).map((v) => ({ valor: v, texto: textoDe(it, v) })),
}));

export function evaluarH3(item, valor) {
  const ok = valor === item.correcta;
  const texto = ok ? item.acierto : item.distractores.find((d) => d.valor === valor)?.retro ?? null;
  return { ok, correcta: item.correcta, textos: [texto], textoCorrecta: textoDe(item, item.correcta) };
}

const ORDEN_BLOQUES = ["en", "sa", "sal"];
const TOTAL_DE = { sa: "saT", sal: "salT" };

/* La fila de la casilla: los bloques de antes, completos; el de la casilla, con su punto. */
function filaConPunto(fila, { bloque, que }) {
  const out = { f: fila.f };
  for (const b of ORDEN_BLOQUES.slice(0, ORDEN_BLOQUES.indexOf(bloque))) {
    if (fila[b]) { out[b] = fila[b]; if (fila[TOTAL_DE[b]] != null) out[TOTAL_DE[b]] = fila[TOTAL_DE[b]]; }
  }
  if (que === "cu") out[bloque] = [[fila[bloque][0][0], PUNTO, null]];
  else { out[bloque] = []; out[TOTAL_DE[bloque]] = PUNTO; }
  return out;
}

export function vistaKardex(metodo, k, respondido) {
  const propios = ITEMS_H3.map((it, i) => [it, i]).filter(([it]) => it.metodo === metodo);
  if (!propios.length || propios[0][1] > k) return null;
  const k3 = KARDEX_H3[metodo];
  const pendiente = propios.find(([, i]) => i > k || (i === k && !respondido));
  if (!pendiente) return { ...k3, punto: null };
  /* Si la casilla que sigue es de un ítem que aún no llega, se ve con su punto, pero no se puede tocar. */
  const [it, i] = pendiente;
  const filas = [];
  for (const r of k3.filas) {
    if (r.f === it.celda.f) { filas.push(filaConPunto(r, it.celda)); break; }
    filas.push(r);
  }
  return { ...k3, filas, punto: i === k ? it.id : null };
}

export const unidadesH3 = () => ITEMS_H3.map((it) => it.id);

export const TOTAL_H3 = unidadesH3().length;
export const puntuarH3 = (aciertos, total = TOTAL_H3) => (total ? (aciertos / total) * 100 : 0);

/* Una casilla, por su método y su pregunta (las de PEPS, UEPS y Promedio se repiten); la comparación, por su pregunta. */
export function unidadDeH3(id) {
  const it = ITEMS_H3.find((x) => x.id === String(id));
  if (!it) return null;
  return it.metodo ? `${nombreDeMetodo(it.metodo)} · ${it.pregunta}` : it.pregunta;
}

export { METODOS_H3 };
