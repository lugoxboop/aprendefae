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
