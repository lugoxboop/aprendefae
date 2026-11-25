/*
 * MACRO 2026 · LOS OBJETOS ILUSTRADOS (Gemini, desde el 25-nov).
 *
 * Paso 6 de la regla maestra (orden de Mateo, 25-nov): todo objeto del visual
 * que no sea mascota se pide a Gemini con la guía de estilo
 * (guia-estilo-imagenes.md, «Objetos ilustrados») y se recorta e integra aquí.
 * Se piden sobre verde croma y se recortan con alfa; el vidrio queda
 * translúcido para pintar en vivo lo que hay dentro (agua, mercurio, compras).
 * Origen de cada uno en /mnt/project-files/macro-2026/ilustrados-origen/.
 * Diagnóstico y lotes: orquestador/conocimiento/macro-2026/diagnostico-visual.md.
 */

/* [ancho, alto] del WebP (la prueba ilustrados.test.mjs los mide). */
export const ILUSTRADOS = {
  "frasco-banco": [255, 360],
  "termometro-vidrio": [160, 420],
  grifo: [332, 300],
  "casa-aire": [480, 400],
  "tanque-estado": [296, 400],
  "carrito-mercado": [496, 360],
  manguera: [354, 300],
  "balanza-pie": [221, 360],
  "balanza-brazo": [596, 372],
  "fajo-pesos": [280, 200],
  "billete-usd": [247, 160],
  "moneda-oro": [197, 200],
  iman: [267, 260],
  "nube-tormenta": [243, 220],
  balde: [189, 240],
  "casa-pais": [221, 200],
  globo: [167, 220],
  "arbol-raices": [177, 240],
  golondrina: [196, 180],
  "deposito-reservas": [218, 300],
  "caja-bananos": [253, 220],
  candado: [162, 220],
};

export const rutaIlustrado = (id) => `/macro2026/ilustrados/${id}.webp`;

export const medidaIlustrado = (id, alto) => {
  const [w, h] = ILUSTRADOS[id];
  return { width: Math.round((alto * w) / h), height: alto };
};

/** Un objeto ilustrado a `alto` px. Decorativo por defecto (alt vacío). */
export function Ilustrado({ id, alto = 56, nombre = null, style = null, ...resto }) {
  const { width, height } = medidaIlustrado(id, alto);
  return (
    <img src={rutaIlustrado(id)} alt={nombre ?? ""} width={width} height={height} decoding="async" draggable={false}
      data-ilustrado={id} style={{ display: "block", flex: "none", width, height, ...style }} {...resto} />
  );
}
