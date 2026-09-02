/*
 * Detección de capacidad usada por las tres animaciones de fondo
 * (red de nodos, curvas de oferta/demanda y tablero de ajedrez).
 * Los umbrales son los del export original de Claude Design.
 */

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isLowEndDevice = () =>
  (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) < 4;

/* true → dibujar un solo fotograma estático en vez de animar. */
export const shouldRenderStatic = (animation = true) =>
  prefersReducedMotion() || isLowEndDevice() || animation === false;

/* Los móviles reciben menos carga gráfica: menos segmentos, sombras más pequeñas, 30 fps. */
export const isNarrowViewport = () => window.innerWidth < 700;

/*
 * Los tres niveles de calidad de la escena 3D, y qué dispara cada uno.
 *
 *   STATIC  imagen fija, no se inicializa WebGL ni se construye geometría.
 *           Lo dispara: prefers-reduced-motion, o ausencia de WebGL, o
 *           hardwareConcurrency <= 4, o deviceMemory < 4.
 *   MOBILE  escena completa pero más barata: pixelRatio tope 1.5, sin
 *           antialias, sombras de 512px y tope de 30 fps.
 *           Lo dispara: innerWidth < 700 (y no ser STATIC).
 *   FULL    escena completa: pixelRatio tope 2, antialias, sombras de 1024px,
 *           fps libre.
 *
 * Advertencia conocida: NO hay detección real de GPU. hardwareConcurrency y
 * deviceMemory miden CPU y RAM, y deviceMemory solo existe en navegadores
 * Chromium (en Safari y Firefox es undefined y aquí cae al valor por defecto).
 * Además muchos iPhone reportan hardwareConcurrency = 4, así que hoy caen en
 * STATIC aunque su GPU mueva la escena sin problema. Ver el README antes de
 * mover estos umbrales.
 */
export const QUALITY = { FULL: "full", MOBILE: "mobile", STATIC: "static" };

export function detectQualityTier({ needsWebGL = false } = {}) {
  const cores = navigator.hardwareConcurrency || 8;
  const mem = navigator.deviceMemory || 8;
  const width = window.innerWidth;

  if (prefersReducedMotion()) return { tier: QUALITY.STATIC, reason: "prefers-reduced-motion", cores, mem, width };
  if (needsWebGL && !hasWebGL()) return { tier: QUALITY.STATIC, reason: "sin WebGL", cores, mem, width };
  if (cores <= 4) return { tier: QUALITY.STATIC, reason: `hardwareConcurrency=${cores} (<= 4)`, cores, mem, width };
  if (mem < 4) return { tier: QUALITY.STATIC, reason: `deviceMemory=${mem} (< 4)`, cores, mem, width };
  if (width < 700) return { tier: QUALITY.MOBILE, reason: `innerWidth=${width} (< 700)`, cores, mem, width };
  return { tier: QUALITY.FULL, reason: `innerWidth=${width}, ${cores} núcleos, ${mem}GB`, cores, mem, width };
}

export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) {
    return false;
  }
}
