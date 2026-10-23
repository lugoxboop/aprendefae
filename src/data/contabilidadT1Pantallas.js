import {
  ID, PIEZA_RECORRIDO, ESTACIONES, TEXTOS, CIERRE, ALTERNATIVOS, ROTULO_CIERRE,
  USUARIOS, VACIO_CAPA_3, TEXTO_DEL_SELECTOR, PREGUNTA_FINAL, OPCIONES,
} from "./contabilidadIntro.js";
import {
  PIEZAS_INTRO, ID_P2, ID_P3, ID_P4,
  TEXTOS_P2, CIERRE_P2, ALTERNATIVOS_P2, ROTULO_CIERRE_P2, CASOS_P2, NOTA_CAPA3_P2, PREGUNTA_P2, OPCIONES_P2,
  TEXTOS_P3, CIERRE_P3, ALTERNATIVOS_P3, ROTULO_CIERRE_P3, CONSIGNA_P3, PREGUNTAS_P3, RESPUESTAS_P3, PREGUNTA_P3, OPCIONES_P3,
  TEXTOS_P4, CIERRE_P4, ALTERNATIVOS_P4, ROTULO_CIERRE_P4, CONSIGNA_P4, FLECHAS_P4, INFORMES_P4, PREGUNTA_P4, OPCIONES_P4,
} from "./contabilidadPiezas234.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 1 · APRENDER — LAS PANTALLAS DE CADA PIEZA, EN ORDEN.
 *
 * Las cuatro piezas (cu0-a1 a cu0-a4) van a pasar a ser una presentación:
 * una idea por pantalla. El componente es de Erwin y el patrón de Ukyo. Este
 * archivo deja el contenido listo para ese paso, sin cambiar lo que el
 * estudiante ve hoy: es la misma secuencia que pinta `CuatroCapas` con las
 * escenas de `escenasIntro.jsx`, escrita como lista.
 *
 * ═══════════ NO HAY UN TEXTO NUEVO AQUÍ ═══════════
 *
 * Cada pantalla APUNTA a las constantes de `contabilidadIntro.js` y de
 * `contabilidadPiezas234.js`, que son las que leen los componentes de hoy.
 * Copiarlas abriría dos fuentes del mismo texto, y la primera corrección se
 * haría en una sola. La prueba t1-pantallas lo vigila: cada texto de una
 * pantalla es, por identidad, el de la constante.
 *
 * ═══════════ LA FORMA DE UNA PANTALLA ═══════════
 *
 *   clave   única dentro de la pieza, estable: sirve para guardar «por dónde
 *           iba» si la presentación llega a recordarlo.
 *   capa    0 el objetivo · 1 los nombres · 2 míralo funcionar ·
 *           3 explóralo · 4 en una frase. Es la capa de `CuatroCapas` donde
 *           vive hoy esa pantalla.
 *   lo demás, según la capa (ver cada constructor).
 *
 * Las figuras NO están aquí: son componentes y siguen en `intro/`. La capa
 * 2 de cada pieza recibe el número de paso y dibuja ese estado; la lista
 * dice cuántos pasos hay y qué se lee en cada uno.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CAPA_OBJETIVO = 0;
export const CAPA_NOMBRES = 1;
export const CAPA_MIRALO = 2;
export const CAPA_EXPLORA = 3;
export const CAPA_FRASE = 4;

/* El rótulo de un paso, igual que el que escriben hoy las cuatro capas 2. */
export const rotuloDePaso = (n, total) => `Paso ${n} de ${total}`;

const objetivo = (pieza) => [{ clave: "objetivo", capa: CAPA_OBJETIVO, texto: pieza.objetivo }];

/*
 * Capa 1, como la pinta `CuatroCapas`: un término por pantalla desde dos
 * términos, salvo que la pieza pida `capa1EnLista` (la 1 lo pide: su siembra
 * manda contar los verbos de la cita del término 1, y las dos tienen que
 * estar a la vista a la vez). La siembra es el último término de `nombres`.
 */
function nombres(pieza) {
  if (pieza.capa1EnLista || pieza.nombres.length <= 1) {
    return [{ clave: "nombres", capa: CAPA_NOMBRES, nombres: pieza.nombres }];
  }
  return pieza.nombres.map((n, k) => ({ clave: `nombre-${k + 1}`, capa: CAPA_NOMBRES, ...n }));
}

/* Capa 2: un paso por pantalla, y el cierre al final con su propio rótulo. */
function miralo({ textos, alternativos, cierre, rotuloCierre, extra = () => ({}) }) {
  const pasos = Object.keys(textos).map(Number).sort((a, b) => a - b);
  return [
    ...pasos.map((n) => ({
      clave: `paso-${n}`, capa: CAPA_MIRALO, paso: n,
      rotulo: rotuloDePaso(n, pasos.length), texto: textos[n], alternativo: alternativos[n], ...extra(n),
    })),
    { clave: "cierre", capa: CAPA_MIRALO, paso: pasos.length + 1, rotulo: rotuloCierre, texto: cierre, alternativo: alternativos.cierre },
  ];
}

const frase = (pregunta, opciones) => [{ clave: "frase", capa: CAPA_FRASE, pregunta, opciones }];

const pieza = (id) => PIEZAS_INTRO.find((p) => p.id === id);

export const PANTALLAS_T1 = {
  [ID]: [
    ...objetivo(PIEZA_RECORRIDO),
    ...nombres(PIEZA_RECORRIDO),
    ...miralo({
      textos: TEXTOS, alternativos: ALTERNATIVOS, cierre: CIERRE, rotuloCierre: ROTULO_CIERRE,
      /* La estación que se enciende en ese paso: su número, su rótulo y la forma que toma el hecho. */
      extra: (n) => ({ estacion: ESTACIONES[n - 1] }),
    }),
    {
      clave: "usuarios", capa: CAPA_EXPLORA,
      vacio: VACIO_CAPA_3, texto: TEXTO_DEL_SELECTOR, usuarios: USUARIOS, alternativo: ALTERNATIVOS.capa3,
    },
    ...frase(PREGUNTA_FINAL, OPCIONES),
  ],
  [ID_P2]: [
    ...objetivo(pieza(ID_P2)),
    ...nombres(pieza(ID_P2)),
    ...miralo({ textos: TEXTOS_P2, alternativos: ALTERNATIVOS_P2, cierre: CIERRE_P2, rotuloCierre: ROTULO_CIERRE_P2 }),
    { clave: "casos", capa: CAPA_EXPLORA, casos: CASOS_P2, nota: NOTA_CAPA3_P2 },
    ...frase(PREGUNTA_P2, OPCIONES_P2),
  ],
  [ID_P3]: [
    ...objetivo(pieza(ID_P3)),
    ...nombres(pieza(ID_P3)),
    ...miralo({ textos: TEXTOS_P3, alternativos: ALTERNATIVOS_P3, cierre: CIERRE_P3, rotuloCierre: ROTULO_CIERRE_P3 }),
    /* Hoy la capa 3 muestra una pregunta a la vez y «Otra pregunta» pasa a la siguiente: una pantalla cada una. */
    ...PREGUNTAS_P3.map((q, k) => ({
      clave: `pregunta-${k + 1}`, capa: CAPA_EXPLORA, consigna: CONSIGNA_P3, pregunta: q, respuestas: RESPUESTAS_P3,
    })),
    ...frase(PREGUNTA_P3, OPCIONES_P3),
  ],
  [ID_P4]: [
    ...objetivo(pieza(ID_P4)),
    ...nombres(pieza(ID_P4)),
    ...miralo({ textos: TEXTOS_P4, alternativos: ALTERNATIVOS_P4, cierre: CIERRE_P4, rotuloCierre: ROTULO_CIERRE_P4 }),
    { clave: "flechas", capa: CAPA_EXPLORA, consigna: CONSIGNA_P4, flechas: FLECHAS_P4, informes: INFORMES_P4 },
    ...frase(PREGUNTA_P4, OPCIONES_P4),
  ],
};

/* Las pantallas de una pieza, o una lista vacía si el id no es de T1. */
export const pantallasDe = (id) => PANTALLAS_T1[id] ?? [];
