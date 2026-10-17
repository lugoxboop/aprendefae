import { CAJONES_T5_ACT1, NOMBRE } from "../../data/contabilidadT5Act1.js";
import { TODAS_T5_ACT1, aplicaSegundaT5Act1 } from "../t5Act1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T5 Act1 «¿Qué renta da?» — la consecuencia, pura (D4).
 * Patrón de enganche C4 de Watari (patron-enganche-c4-v1.html, #t5-act1).
 *
 * Objeto propio: los tres cajones de la renta. Los cajones SON las opciones
 * (enFigura): la ficha cae en el cajón tocado y el cajón muestra cómo
 * rendiría así (las barras y su frase). Mello pidió: «Que el título elegido
 * muestre la renta que daría».
 *
 * La pieza sigue en las fichas a un nivel de main (b5/FichasUnNivel.jsx, con
 * su prop opcional `c4`): mismos ítems, mismo puntaje del primer intento,
 * mismo `detalle` y los textos de Near tal cual (data/contabilidadT5Act1.js).
 * El id de cada opción es la clave del cajón de main («variable»,
 * «fija/interes», «fija/descuento»). Solo entran las fichas que se juegan con
 * los cajones: las de nombre (las de descripción van con la segunda
 * decisión, la tira de renta, que ya pinta su consecuencia).
 *
 * [W] pendiente de Near: el chip «Esta ficha», la frase de cada cajón, las
 * alturas de las barras y la frase de `falla` son de Watari (codigo-f5,
 * t5-act1), sin revisar por Near.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const claveT5Act1 = (renta, tipo) => (tipo ? `${renta}/${tipo}` : renta);

/* [W] pendiente de Near · el chip que cae en el cajón tocado. */
export const CHIP_ACT1_C4 = "Esta ficha";
/* [W] pendiente de Near · cómo rinde cada cajón: las barras (0 a 1; 0 se pinta como un trazo) y su frase. */
export const RINDE_ACT1_C4 = {
  variable: [0.5, 0.9, 0.3, 0.7],
  "fija/interes": [0.6, 0.6, 0.6, 0.6],
  "fija/descuento": [0, 0, 0, 1],
};
export const EFECTO_ACT1_C4 = {
  variable: "Rinde según le vaya a quien lo emitió.",
  "fija/interes": "Rinde un interés pactado, igual cada vez.",
  "fija/descuento": "Se compra por menos y se recibe el valor completo.",
};
/* [W] pendiente de Near · lo que implica un cajón que no es el de la ficha. */
export const FALLA_ACT1_C4 = "Si rindiera así, la ficha diría otra cosa.";

const OPCIONES = CAJONES_T5_ACT1.map((k) => ({ id: claveT5Act1(k.renta, k.tipo), t: k.rotulo }));

/* Las fichas que se juegan con los cajones (las de nombre, de los dos mazos). */
const ITEMS = TODAS_T5_ACT1.filter((f) => f.clase === NOMBRE && aplicaSegundaT5Act1(f) == null).map((f) => ({
  id: f.id, texto: f.texto, pregunta: null, pista: f.pista, bien: f.acierto,
  opciones: OPCIONES.map((o) => ({ ...o, correcta: o.id === claveT5Act1(f.renta, f.tipo) })),
}));

export const CONSECUENCIA_C4 = {
  id: "t5-act1",
  objeto: "Los tres cajones de la renta",
  modo: "hacer",
  items: ITEMS,
  consecuencia(item, eleccion) {
    if (eleccion == null) return { ficha: item.id, cajon: null };
    const o = item.opciones.find((x) => x.id === eleccion);
    const estado = { ficha: item.id, cajon: eleccion, rinde: RINDE_ACT1_C4[eleccion] ?? null, efecto: EFECTO_ACT1_C4[eleccion] ?? null };
    return o?.correcta ? estado : { ...estado, falla: FALLA_ACT1_C4 };
  },
};

/* Por ficha y clave de cajón, para la pieza (la ficha llega de main, no del ítem C4). */
export function consecuenciaAct1(ficha, clave) {
  const item = { id: ficha.id, opciones: OPCIONES.map((o) => ({ ...o, correcta: o.id === claveT5Act1(ficha.renta, ficha.tipo) })) };
  return CONSECUENCIA_C4.consecuencia(item, clave);
}
