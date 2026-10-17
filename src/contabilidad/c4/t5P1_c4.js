import { PAQUETES, OPCIONES_CAPA_3, FIGURA_CAPA_3, PREGUNTA_CAPA_3 } from "../../data/contabilidadT5Pieza1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T5 P1 «Del efectivo de sobra al activo financiero» · capa 3 — la
 * consecuencia, pura (D4). Patrón de enganche C4 de Watari
 * (patron-enganche-c4-v1.html, #t5-p1).
 *
 * Objeto propio: los dos cajones («Temporal» y «No temporal», los de la
 * figura de la capa 3 de main). El paquete entra al cajón que dice la opción
 * tocada, con su razón pegada: «Sí» va a «Temporal»; las dos «No», a «No
 * temporal», cada una con su razón. Mello pidió: «Que en la capa 3 el paquete
 * mal decidido entre a su cajón equivocado y se vea por qué».
 *
 * La capa 3 sigue siendo la de main (tema6/CajasQueRevelan.jsx, con su prop
 * opcional `c4`): la escalera C2 (pista y otro intento), sin puntaje. Los
 * textos de Near (pregunta, opciones, pista, devolución, revela), tal cual.
 *
 * [W] pendiente de Near: el chip («Paquete A · cumple las dos condiciones»,
 * la razón sin «Sí:»/«No:») y la frase de `falla` son de Watari (codigo-f5,
 * t5-p1), sin revisar por Near.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CAJON_TEMPORAL = "temporal";
export const CAJON_NO_TEMPORAL = "no-temporal";
export const cajonDeP1 = (opcionId) => (opcionId === "si" ? CAJON_TEMPORAL : CAJON_NO_TEMPORAL);
export const nombreCajonP1 = (cajon) => (cajon === CAJON_TEMPORAL ? FIGURA_CAPA_3.temporal : FIGURA_CAPA_3.noTemporal);
/* [W] pendiente de Near · la razón pegada al paquete: la opción sin «Sí: »/«No: ». */
export const razonDeP1 = (texto) => texto.replace(/^(Sí|No): /, "");
/* [W] pendiente de Near · lo que implica una opción mala. */
export const fallaP1 = (nombre, cajon) => `Así, ${nombre} quedaría en «${nombreCajonP1(cajon)}» por una razón que su descripción no sostiene.`;

const ITEMS = PAQUETES.map((p) => ({
  id: p.id, subtema: p.nombre, texto: p.descripcion, pregunta: PREGUNTA_CAPA_3, pista: p.pista, bien: p.revela,
  opciones: OPCIONES_CAPA_3.map((o) => ({ id: o.id, t: o.texto, correcta: o.id === p.correcta })),
}));

export const CONSECUENCIA_C4 = {
  id: "t5-p1",
  objeto: "Los dos cajones",
  modo: "aprender",
  items: ITEMS,
  consecuencia(item, eleccion) {
    if (eleccion == null) return { paquete: item.id, cajon: null };
    const o = item.opciones.find((x) => x.id === eleccion);
    const cajon = cajonDeP1(eleccion);
    const estado = { paquete: item.id, cajon, chip: `${item.subtema} · ${razonDeP1(o.t)}` };
    return o.correcta ? estado : { ...estado, falla: fallaP1(item.subtema, cajon) };
  },
};

/* Por id de paquete y de opción (lo que da CajasQueRevelan). */
export function consecuenciaP1(paqueteId, opcionId) {
  const item = ITEMS.find((x) => x.id === paqueteId);
  return item ? CONSECUENCIA_C4.consecuencia(item, opcionId) : null;
}
