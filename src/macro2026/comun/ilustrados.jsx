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
  "carro-varado": [528, 300],
  grua: [450, 240],
  "caja-herramientas": [280, 240],
  fabrica: [197, 200],
  "edificio-gobierno": [216, 200],
  virus: [159, 160],
  "globo-aerostatico": [184, 260],
  "balanza-columna": [143, 300],
  "balanza-viga": [610, 80],
  "buzon-impuesto": [167, 240],
  "buzon-tasa": [167, 240],
  "buzon-contribucion": [167, 240],
  "caja-registradora": [220, 220],
  ventanilla: [239, 220],
  montana: [407, 300],
  "pozo-monedas": [238, 180],
  "barrera-peaje": [265, 200],
  "casa-anden": [251, 220],
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

/* El termómetro de vidrio con su mercurio en vivo, para dentro de un <svg>
 * (lote 3: el circuito con fiebre de pe26-a2 y pe26-h5). `nivel` de 0 a 1.
 * Geometría del tubo medida en el WebP (la misma que usa el Termostato). */
const TUBO = { x0: 0.39, x1: 0.625, cero: 0.66, tope: 0.12, bx: 0.5, by: 0.81, br: 0.3 };
export const MERCURIO = "#f2994a";
export function TermometroVidrio({ x = 0, y = 0, alto = 90, nivel = 0, ...resto }) {
  const [w0, h0] = ILUSTRADOS["termometro-vidrio"];
  const h = alto, w = (alto * w0) / h0, n = Math.max(0, Math.min(1, nivel));
  const tuboX = x + w * TUBO.x0, tuboW = w * (TUBO.x1 - TUBO.x0);
  const arriba = y + h * TUBO.tope, base = y + h * TUBO.by, cero = y + h * TUBO.cero;
  const total = base - arriba, lleno = base - cero + n * (cero - arriba);
  return (
    <g aria-hidden="true" {...resto}>
      <image href={rutaIlustrado("termometro-vidrio")} x={x} y={y} width={w} height={h} />
      <circle cx={x + w * TUBO.bx} cy={y + h * TUBO.by} r={w * TUBO.br * 0.86} fill={MERCURIO} />
      <rect x={tuboX + 0.5} y={arriba} width={tuboW - 1} height={total} rx={tuboW / 2 - 0.5} fill={MERCURIO}
        style={{ transformBox: "fill-box", transformOrigin: "bottom", transform: `scaleY(${lleno / total})`, transition: "transform 400ms cubic-bezier(.3,.9,.4,1)" }} />
      <image href={rutaIlustrado("termometro-vidrio")} x={x} y={y} width={w} height={h} opacity=".2" />
    </g>
  );
}

/* El buzón ilustrado de cada tributo (un buzón gris de Gemini teñido con
 * scripts/ilustrados/tenir.py al tono del tributo). `abierto`: da un saltito
 * cuando la moneda entra (clase .ilu-salta del CSS de la pieza). */
export function BuzonIlustrado({ tributo, alto = 64, abierto = false }) {
  return <Ilustrado id={`buzon-${tributo}`} alto={alto} className={abierto ? "ilu-salta" : undefined} key={abierto ? "a" : "c"} />;
}
