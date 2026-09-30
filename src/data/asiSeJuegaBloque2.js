import {
  T1_1, T1_2, T1_5, ZONA_DENTRO, ZONA_FUERA, ROTULO_ZONA, CLASES, PARTES, ROTULO_ENTRA, ROTULO_SALE,
  PIE_T1_5,
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
 * ═══════════ LO PROVISIONAL, MARCADO ═══════════
 *
 * El paquete de Levi remite al guion de Gen para T1-1 y T1-2 y al alt de Gen
 * para T1-2 y T1-5, y esos textos no llegaron. Los tiempos de los tres guiones
 * y esos dos alt están escritos aquí siguiendo el bloque 1 y el propio
 * paquete, y llevan [PROVISIONAL] para que se reemplacen cuando lleguen.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const nombreDeClase = (id) => CLASES.find((c) => c.id === id).nombre;
const ideaDe = (id) => PARTES.find((p) => p.id === id).idea;

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
  pasos: [
    "Lee la pregunta y piensa quién la haría.",
    "Toca la pregunta para tomarla.",
    `Toca después ${ROTULO_ZONA[ZONA_FUERA]} o ${ROTULO_ZONA[ZONA_DENTRO]}.`,
  ],
  /* La pantalla le antepone «Ejemplo: ». */
  alt: `se toca la pregunta del cliente de la panadería y luego la zona ${ROTULO_ZONA[ZONA_FUERA]}. La pregunta se ubica con el rótulo «${EJEMPLO_T1_1.nombre}» y la flecha de vuelta no se enciende.`,
  demo: { items: [EJEMPLO_T1_1] },
  guion: {
    /* [PROVISIONAL] 7 s, como pide el paquete; los tiempos son míos, siguiendo el bloque 1. */
    duracion: 7000,
    toques: [
      { ms: 1500, en: `[data-pregunta="${EJEMPLO_T1_1.id}"]` },
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
  /* [PROVISIONAL] falta el alt de Gen. La pantalla le antepone «Ejemplo: ». */
  alt: `una panadería. Entra harina y sale pan. Se toca «${nombreDeClase(EJEMPLO_T1_2.clase)}» y el trazo entre los dos dice: transformado.`,
  demo: { items: [EJEMPLO_T1_2] },
  guion: {
    /* [PROVISIONAL] falta el guion de Gen: mira ENTRA, mira SALE, toca la clase. */
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
  hecho: {
    id: "demo-horno-200000",
    texto: "La panadería compró un horno a crédito por $200.000.",
    asiento: { debe: [["Maquinaria", 200000]], haber: [["Cuentas por pagar", 200000]] },
  },
  /* De dónde parte: el recorrido de verdad parte de cero, el ejemplo no. */
  antes: { [ACTIVO]: 500000, [PASIVO]: 0, [PATRIMONIO]: 500000 },
};

/* Lo que se escribe, en el formato de la actividad: con puntos, sin «$» (el «$» ya está en la casilla). */
const cifra = (n) => pesos(n).slice(1);
const ESCRITO_T1_5 = { [ACTIVO]: 700000, [PASIVO]: 200000, [PATRIMONIO]: 500000 };

const ASI_T1_5 = {
  actividadId: T1_5.id,
  titulo: T1_5.nombre,
  consigna: T1_5.consigna,
  pasos: [
    "Lee el hecho de la panadería.",
    "Escribe cómo queda cada uno de los tres totales.",
    "Escribe los tres, aunque alguno no cambie.",
  ],
  /* [PROVISIONAL] falta el alt de Gen. La pantalla le antepone «Ejemplo: ». */
  alt: `la panadería parte de ${pesos(EJEMPLO_T1_5.antes[ACTIVO])} = ${pesos(EJEMPLO_T1_5.antes[PASIVO])} + ${pesos(EJEMPLO_T1_5.antes[PATRIMONIO])} y compra un horno a crédito por $200.000. Se escribe ${cifra(ESCRITO_T1_5[ACTIVO])} en «${ideaDe(ACTIVO)}», ${cifra(ESCRITO_T1_5[PASIVO])} en «${ideaDe(PASIVO)}» y ${cifra(ESCRITO_T1_5[PATRIMONIO])} en «${ideaDe(PATRIMONIO)}». El pie dice: ${PIE_T1_5.cuadra.replace("[X]", pesos(ESCRITO_T1_5[ACTIVO]))}`,
  demo: { ejemplo: EJEMPLO_T1_5 },
  guion: {
    /* [PROVISIONAL] las tres cifras una por una y termina en el pie. Sin barras: T1-5 no las tiene. */
    duracion: 8000,
    toques: [
      { ms: 1500, en: `[data-casilla="${ACTIVO}"] input`, escribe: cifra(ESCRITO_T1_5[ACTIVO]) },
      { ms: 3000, en: `[data-casilla="${PASIVO}"] input`, escribe: cifra(ESCRITO_T1_5[PASIVO]) },
      { ms: 4500, en: `[data-casilla="${PATRIMONIO}"] input`, escribe: cifra(ESCRITO_T1_5[PATRIMONIO]) },
      { ms: 6000, en: "[data-pie]", senala: true },
    ],
  },
  cuadros: { gesto: 1 },
};

export const ESCRITO_EJEMPLO_T1_5 = ESCRITO_T1_5;

/** Por id de actividad. */
export const ASI_SE_JUEGA_BLOQUE2 = Object.fromEntries(
  [ASI_T1_1, ASI_T1_2, ASI_T1_5].map((a) => [a.actividadId, a]),
);
