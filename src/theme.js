/* Paleta de marca AprendeFAE — pantalla de entrada y vistas de nivel sitio. */
export const FAE = {
  bg: "#0E1B2E",
  navy: "#1D3557",
  text: "#F8F9FA",
  coral: "#E76F51",
  teal: "#2A9D8F",
  node: "#CBDCF2",
  /*
   * Ámbar. Se añade para el nivel intermedio de alertas del panel docente: el
   * kit tenía coral (alarma) y teal (normal), dos niveles, y el sistema de
   * alertas necesita tres. Es el tono medio que no se confunde con ninguno de
   * los dos. Fuera de ese uso, no se emplea como acento general.
   */
  ambar: "#E9C46A",
};

/*
 * Por debajo de este ancho de ventana el sitio pasa a su forma de teléfono: el
 * control de cuenta se encoge a un círculo y el camino de actividades saca el
 * desafío de su ramal lateral. Un solo número para los dos, a propósito: si se
 * ajustara uno sin el otro habría un tramo de anchos donde uno ya es de móvil y
 * el otro todavía no. Se usa en media queries, no leyendo la ventana con
 * JavaScript —ver la nota de AccountControl—.
 */
export const ANCHO_ESTRECHO = 560;

/*
 * LA BANDA DE LA FICHA DE FP (Xeno, 24 oct., #349). La ficha va fija arriba a
 * la derecha (top de 14-24 px y 38 de alto) y no se esconde. Lo que se le
 * reserva es esta banda: en las vistas de Contabilidad todo lo que se
 * desplaza solo lleva este scroll-margin-top (regla .fae-reserva-ficha de
 * global.css, que una prueba ata a esta constante), para no aterrizar debajo
 * de la ficha. 84 es la reserva que ya probó #438; la cabecera compacta
 * reserva 76.
 */
export const FICHA_RESERVA = 84;

/*
 * ═══════════ EL SUELO TIPOGRÁFICO, TAL COMO ESTÁ HOY ═══════════
 *
 * Nada de esto se aplica solo: es la regla que se sigue a mano, escrita aquí
 * para que el día que se quiera subir se suba de forma pareja.
 *
 *   12 px   el mínimo de todo lo que se LEE: texto de contenido, rótulos de
 *           un diagrama, nombres de nodos. Medido a 375 px de ventana, que
 *           es donde falla. Ojo con el texto dentro de un SVG: si el SVG
 *           escala su viewBox, el texto escala con él y un 13 del código
 *           puede salir a 8 en el teléfono. Por eso el camino, el radar, el
 *           expediente y el asedio llevan sus rótulos en HTML encima del
 *           dibujo, a px reales.
 *
 *   10,5 px EL SUELO ACTUAL DEL SITIO, por decisión de estilo: etiquetas en
 *           mayúsculas con tracking ("RONDA 1 DE 3", "ETAPA 2"), contadores y
 *           la insignia «Hacer / Aprender». Son marcas, no texto de lectura,
 *           y se dejaron así a propósito (septiembre de 2026).
 *
 *   Por debajo de 10,5 hay cuatro que ya existen y habría que revisar si se
 *   sube el suelo: «CAPILARES» (9 px, Política Económica · Aprender),
 *   «ARCHIVO» (10 px, Diagnóstico en vivo), «PRIMER / SEGUNDO ORDEN» y
 *   «· TE TOCA» (10 px, Cirugía de reconstrucción) y «NIVEL DEL AGUA»
 *   (10 px, el Proyecto del Arca).
 *
 *   Y un caso distinto, TEXTO QUE SE LEE por debajo de 12, fijo en HTML: las
 *   citas archivadas en los cajones del Arca (11,5), el balance de Corriente
 *   cruzada (11,5) y los avisos "Caso hipotético…" del Simulador de crisis
 *   (10,5) y "Escenario simulado…" del Tablero de decisiones (11). No son
 *   marcas: si se sube algo, esto primero.
 *
 * Para encontrarlos todos: buscar fontSize con valores por debajo de 12 —y
 * mirar a 375 px lo que esté dentro de un <svg>, que no se ve en el código—.
 */

/* Paleta de DA-Learn (tema de Macroeconomía). */
export const COLORS = {
  bg: "#0F1B2E",
  bgPanel: "#16233A",
  blue: "#3D7FFF",
  orange: "#FF8A42",
  teal: "#2FA8A0",
  gold: "#FFC857",
  green: "#2FBF71",
  red: "#FF6B6B",
  textLight: "#EAF0FB",
  textMuted: "#8A9BBE",
};
