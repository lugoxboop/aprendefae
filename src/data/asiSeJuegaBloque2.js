import {
  T1_1, T1_2, T1_5, TORRES_T1_5, ZONA_DENTRO, ZONA_FUERA, ROTULO_ZONA, CLASES, ROTULO_ENTRA, ROTULO_SALE,
} from "./contabilidadTema1.js";
import { ACTIVO, PASIVO, PATRIMONIO, pesos } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» — BLOQUE 2: T1-1, T1-2 y T1-5.
 *
 * El mismo patrón que el bloque 1 (ver `asiSeJuegaBloque1.js`): la demo es el
 * componente real con un ejemplo que llega desde afuera, no se puede tocar y
 * no guarda nada. Los ejemplos no están en ningún banco; sus ids empiezan por
 * `demo-` y hay una prueba que lo comprueba.
 *
 * Los nombres que el estudiante ve en pantalla —las zonas, las clases, las
 * casillas— salen de los datos de cada actividad, no se copian a mano: si uno
 * cambia allí, cambia aquí.
 *
 * Los tiempos de los tres guiones y el alt de T1-2 los escribí siguiendo el
 * bloque 1, y Levi los aprobó. El alt de T1-5 es el suyo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const nombreDeClase = (id) => CLASES.find((c) => c.id === id).nombre;

/* ═══════════════════ T1-1 · ¿DESDE DÓNDE PREGUNTAN? ═══════════════════ */

export const EJEMPLO_T1_1 = {
  id: "demo-clientes-panaderia",
  nombre: "Clientes",
  pregunta: "Le compro pan todos los días a la panadería. ¿Va a seguir abierta?",
  tipo: "externo",
  zona: ZONA_FUERA,
  cierraElCiclo: false,
  acierto: "✅ Afuera. Le compra a la panadería, pero no es parte de ella.",
};

const ASI_T1_1 = {
  actividadId: T1_1.id,
  titulo: T1_1.nombre,
  consigna: T1_1.consigna,
  /* Dos pasos: en la actividad la pregunta no se toca, se lee. Corrección de Levi. */
  pasos: [
    "Lee la pregunta y piensa quién la haría.",
    `Toca ${ROTULO_ZONA[ZONA_DENTRO]} o ${ROTULO_ZONA[ZONA_FUERA]}.`,
  ],
  /* La pantalla le antepone «Ejemplo: ». */
  /*
   * Futaba (lote D, §2): no nombra a quien pregunta (así T1-1 no le contesta a
   * H2) y cuenta lo que se ve: la mano no toca la pregunta, solo la zona.
   */
  alt: `se lee la pregunta de la panadería y se toca ${ROTULO_ZONA[ZONA_FUERA]}. La ficha «la pregunta» entra ahí y la vuelta sigue tenue.`,
  demo: { items: [EJEMPLO_T1_1] },
  guion: {
    /* 7 s. La mano no toca la pregunta: solo AFUERA. */
    duracion: 7000,
    toques: [
      { ms: 3000, en: `[data-zona="${ZONA_FUERA}"]` },
    ],
  },
  cuadros: { gesto: 1 },
};

/* ═══════════════════ T1-2 · ¿QUÉ ENTRÓ Y QUÉ SALIÓ? ═══════════════════ */

export const EJEMPLO_T1_2 = {
  id: "demo-panaderia-harina",
  empresa: "Una panadería",
  entra: "Harina",
  sale: "Pan",
  clase: "industrial",
  relacion: "Transformado",
  acierto: "✅ Industrial. Entró harina. Salió pan. No es lo mismo: adentro lo cambiaron.",
};

const ASI_T1_2 = {
  actividadId: T1_2.id,
  titulo: T1_2.nombre,
  consigna: T1_2.consigna,
  pasos: [
    "Mira el cuadro de lo que entra.",
    "Mira el cuadro de lo que sale.",
    "Toca la clase de empresa que es.",
  ],
  /* La pantalla le antepone «Ejemplo: ». */
  alt: `una panadería. Entra harina y sale pan. Se toca «${nombreDeClase(EJEMPLO_T1_2.clase)}» y el trazo entre los dos dice: transformado.`,
  demo: { items: [EJEMPLO_T1_2] },
  guion: {
    /* Mira ENTRA, mira SALE, toca la clase. */
    duracion: 7000,
    toques: [
      { ms: 1500, en: `[data-recuadro="${ROTULO_ENTRA}"]`, senala: true },
      { ms: 3000, en: `[data-recuadro="${ROTULO_SALE}"]`, senala: true },
      { ms: 4500, en: `[data-clase="${EJEMPLO_T1_2.clase}"]` },
    ],
  },
  cuadros: { gesto: 2 },
};

/* ═══════════════════ T1-5 · LA ECUACIÓN EN MOVIMIENTO ═══════════════════ */

export const EJEMPLO_T1_5 = {
  /*
   * Futaba, 24-oct: un aporte en plata con cifras construidas que no salen
   * del libro (el horno a crédito era el mismo ejemplo de t1-4). El id es
   * interno, no de estudiante.
   */
  hecho: {
    id: "demo-aporte-187000",
    texto: "Escenario simulado. A la panadería le entran $187.000 en plata de sus dueños.",
    asiento: { debe: [["Caja", 187000]], haber: [["Aportes sociales", 187000]] },
  },
  /* De dónde parte: el recorrido de verdad parte de cero, el ejemplo no. */
  antes: { [ACTIVO]: 500000, [PASIVO]: 0, [PATRIMONIO]: 500000 },
  acierto: "Entró plata de los dueños. Lo que tiene y lo de los dueños suben a $687.000, y lo que debe no se mueve.",
};

/*
 * Lo que se escribía antes de las torres. Queda exportado (ESCRITO_EJEMPLO_T1_5)
 * porque es el estado al que llega el ejemplo: $687.000 = $0 + $687.000.
 */
const ESCRITO_T1_5 = { [ACTIVO]: 687000, [PASIVO]: 0, [PATRIMONIO]: 687000 };

/*
 * Con las torres (P2 de Mai, decisión 2 de Shoko): la mano toca la parte
 * quieta, el total nuevo de las otras dos y «Anotar». Los pasos y el
 * alternativo son nuevos, PARA SHOKO; el ejemplo es el aporte de Futaba.
 */
const ASI_T1_5 = {
  actividadId: T1_5.id,
  titulo: T1_5.nombre,
  consigna: TORRES_T1_5.consigna,
  pasos: [
    "Lee el hecho de la panadería.",
    "Toca la parte que no se mueve.",
    "En las otras dos, elige con cuánto quedan. Luego toca Anotar.",
  ],
  /* La pantalla le antepone «Ejemplo: ». */
  /* Futaba, 24-oct. */
  alt: "Escenario simulado. La panadería tiene $500.000 y no debe nada. Lo de los dueños es $500.000. Ellos ponen $187.000 en plata.",
  demo: { ejemplo: EJEMPLO_T1_5 },
  guion: {
    /* La parte quieta, los dos totales nuevos y «Anotar»: las torres suben juntas. 9,5 s, como antes. */
    duracion: 9500,
    toques: [
      { ms: 1500, en: `[data-parte="${PASIVO}"]` },
      { ms: 3500, en: `[data-opcion-total="${ACTIVO}:687000"]` },
      { ms: 5000, en: `[data-opcion-total="${PATRIMONIO}:687000"]` },
      { ms: 6500, en: "[data-torres]", senala: true },
      { ms: 7800, texto: TORRES_T1_5.anotar },
    ],
  },
  cuadros: { gesto: 1 },
};

export const ESCRITO_EJEMPLO_T1_5 = ESCRITO_T1_5;

/** Por id de actividad. */
export const ASI_SE_JUEGA_BLOQUE2 = Object.fromEntries(
  [ASI_T1_1, ASI_T1_2, ASI_T1_5].map((a) => [a.actividadId, a]),
);
