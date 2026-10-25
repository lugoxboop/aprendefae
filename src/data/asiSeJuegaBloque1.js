import { T1_4, T1_7, T1_8, PARTES, SUBE, IGUAL } from "./contabilidadTema1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» — BLOQUE 1: T1-8, T1-7 y T1-4.
 *
 * Cada actividad trae lo mismo:
 *
 *   titulo, consigna   los de la actividad, sin reescribir
 *   pasos              los tres de la lista numerada
 *   alt                lo que lee el lector de pantalla de la demo
 *   demo               las props que recibe el componente real en modo demo:
 *                      el ítem (y en T1-7, las dos hojas) que llega desde afuera
 *   guion              los toques, con su momento en ms, y cuánto dura todo
 *   cuadros.gesto      cuántos toques ya están hechos en el cuadro 2 de
 *                      movimiento reducido; la mano se queda sobre el último
 *
 * ═══════════ LOS EJEMPLOS NO SON DEL BANCO ═══════════
 *
 * Ni la harina, ni las dos hojas, ni el horno están entre los ítems que se
 * sortean: el estudiante no puede encontrarse en la partida la respuesta que
 * acaba de ver resuelta. Sus ids empiezan por `demo-` y hay una prueba que lo
 * comprueba contra los bancos.
 *
 * Un toque apunta a un selector (`en`) o al texto de un botón (`texto`).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const [TIENE, DEBE, DUENOS] = PARTES.map((p) => p.id);

/* ═══════════════════ T1-8 · ¿DÓNDE SE ROMPIÓ? ═══════════════════ */

export const EJEMPLO_T1_8 = {
  id: "demo-panaderia",
  texto: "La panadería compró harina y la pagó en efectivo. No pidió factura.",
  /* «Queda un papel»: sin factura el hecho no deja papel. Se apagan cuatro. */
  rompe: 2,
};

const ASI_T1_8 = {
  actividadId: T1_8.id,
  titulo: T1_8.nombre,
  consigna: T1_8.consigna,
  pasos: [
    "Lee lo que pasó en la panadería.",
    "Toca el punto donde se rompió.",
    "Elige cuántos se apagan: ese punto y los que siguen.",
  ],
  alt: "Cinco puntos en columna. Se toca «Queda un papel» y se elige 4. El corte queda ahí y se apagan «Queda un papel», «Se anota», «Sale un informe» y «Los jefes deciden».",
  demo: { items: [EJEMPLO_T1_8] },
  guion: {
    duracion: 8000,
    toques: [
      { ms: 1500, en: `[data-punto="${EJEMPLO_T1_8.rompe}"]` },
      { ms: 2500, en: '[data-prediccion-opcion="4"]' },
    ],
  },
  cuadros: { gesto: 1 },
};

/* ═══════════════════ T1-7 · LA ARTICULACIÓN ═══════════════════ */

/*
 * Las dos hojas de la panadería, con dos líneas cada una. «Pan que sobró» y
 * «Pedidos del próximo mes» no se conectan con nada: están para que la demo
 * tenga que elegir, igual que la partida.
 */
export const BANCO_DEMO_T1_7 = {
  informes: [
    { id: "demo-semana", idea: "Cuenta de la semana", termino: "", cuando: "" },
    { id: "demo-mes", idea: "Resumen del mes", termino: "", cuando: "" },
  ],
  lineas: [
    { id: "demo-total-vendido", informe: "demo-semana", nombre: "Total vendido" },
    { id: "demo-pan-sobro", informe: "demo-semana", nombre: "Pan que sobró" },
    { id: "demo-ventas-semana-1", informe: "demo-mes", nombre: "Ventas de la semana 1" },
    { id: "demo-pedidos-proximo-mes", informe: "demo-mes", nombre: "Pedidos del próximo mes" },
  ],
  flechas: [
    { id: "demo-f1", desde: "demo-total-vendido", hasta: "demo-ventas-semana-1" },
  ],
  aciertos: {
    "demo-f1": "✅ «Total vendido» manda su cifra a «Ventas de la semana 1». Son la misma cifra en dos hojas, así que la flecha queda trazada.",
  },
};

const ASI_T1_7 = {
  actividadId: T1_7.id,
  titulo: T1_7.nombre,
  consigna: T1_7.consigna,
  pasos: [
    "Toca la línea de donde sale.",
    "Toca la línea a donde llega.",
    "Mira si la flecha queda trazada.",
  ],
  alt: "Dos hojas de la panadería, con dos líneas cada una. Se toca «Total vendido» y luego «Ventas de la semana 1». Una flecha queda trazada entre las dos.",
  demo: { banco: BANCO_DEMO_T1_7, items: [...BANCO_DEMO_T1_7.flechas] },
  guion: {
    /* A los 4,0 s la flecha ya quedó fija: lo lleva el propio hilo. */
    duracion: 7000,
    toques: [
      { ms: 1500, en: '[data-linea="demo-total-vendido"]' },
      { ms: 3000, en: '[data-linea="demo-ventas-semana-1"]' },
    ],
  },
  cuadros: { gesto: 1 },
};

/* ═══════════════════ T1-4 · ¿QUÉ LE PASA A CADA UNO? ═══════════════════ */

export const EJEMPLO_T1_4 = {
  id: "demo-horno",
  texto: "La panadería compró un horno a crédito.",
  /* Las cifras no se ven en esta actividad: solo deciden qué sube y qué no. */
  asiento: { debe: [["Maquinaria", 1]], haber: [["Cuentas por pagar", 1]] },
  acierto: "✅ «Lo que tiene» sube: entró el horno. «Lo que debe» sube: nació la deuda. «Lo que es de los dueños» queda igual: nadie puso ni sacó plata.",
};

const ASI_T1_4 = {
  actividadId: T1_4.id,
  titulo: T1_4.nombre,
  consigna: T1_4.consigna,
  pasos: [
    "Lee el hecho de la panadería.",
    "Toca sube, baja o queda igual en cada parte.",
    "Mira cómo se mueven las tres barras.",
  ],
  alt: "Tres barras. En «Lo que tiene» y «Lo que debe» se toca sube, y las dos crecen igual. En «Lo que es de los dueños» se toca queda igual, y esa barra late sin cambiar de alto.",
  demo: { items: [EJEMPLO_T1_4] },
  guion: {
    duracion: 7500,
    toques: [
      { ms: 1500, en: `[data-control="${TIENE}-${SUBE}"]` },
      { ms: 3000, en: `[data-control="${DEBE}-${SUBE}"]` },
      { ms: 4500, en: `[data-control="${DUENOS}-${IGUAL}"]` },
      /* 6,0 s: las barras se mueven al anotar (lote 4: un solo «Anotar», como t1-5). */
      { ms: 6000, texto: "Anotar" },
    ],
  },
  cuadros: { gesto: 1 },
};

/** Por id de actividad. Las que no están aquí no tienen «Así se juega» todavía. */
export const ASI_SE_JUEGA = Object.fromEntries(
  [ASI_T1_8, ASI_T1_7, ASI_T1_4].map((a) => [a.actividadId, a]),
);
