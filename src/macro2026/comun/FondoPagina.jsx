/*
 * El fondo de la PÁGINA mientras una pieza de Macro 2026 está abierta
 * (fondos-vida, pedido de Mateo: el azul plano se veía «soso»).
 *
 * - Atmósfera: un resplandor radial del acento del tema arriba y abajo,
 *   sobre el azul FONDO.
 * - Patrón: iconos del tema (SVG en línea como fondo), al 7 % de opacidad,
 *   que derivan muy despacio en diagonal. Estático con «reducir movimiento».
 *
 * El patrón vive en una capa fija (position: fixed) detrás de todo: no ocupa
 * sitio, no desborda y no recibe toques. La tarjeta lleva su propio fondo
 * sólido; el texto que queda sobre la página (volver, VISTA PREVIA, la nota
 * del pie) se midió AA sobre el píxel más claro del resplandor.
 */
import { FONDO } from "./colores-da.js";
import { TEMAS_ESCENA } from "./Escenario.jsx";

/* Carpeta del tema (o id de la vista previa) → escena del tema. */
export const ESCENA_DE_TEMA = {
  "demanda-agregada": "plaza",
  "politica-economica": "despacho",
  "politica-fiscal": "hacienda",
  "politica-monetaria": "boveda",
  "politica-cambiaria": "puerto",
  t1: "plaza",
  t2: "despacho",
  t3: "hacienda",
  t4: "boveda",
  t5: "puerto",
};

/* Cada icono cabe en una caja de 48 × 48, en trazo. */
const ICONOS = {
  moneda: '<circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="11"/><path d="M24 17v14M20 20.5h6a2.5 2.5 0 0 1 0 5h-4a2.5 2.5 0 0 0 0 5h6"/>',
  bolsa: '<path d="M9 17h30l-3 25H12Z"/><path d="M17 20v-6a7 7 0 0 1 14 0v6"/>',
  documento: '<path d="M12 5h17l9 9v29H12Z"/><path d="M29 5v9h9M17 22h15M17 29h15M17 36h10"/>',
  flecha: '<path d="M6 40l12-12 8 7 15-17"/><path d="M32 17h10v10"/>',
  recibo: '<path d="M12 5h24v38l-4-3-4 3-4-3-4 3-4-3-4 3Z"/><path d="M17 14h14M17 21h14M17 28h9"/>',
  columna: '<path d="M8 12h32L24 5Z"/><path d="M10 15h28M14 18v20M21 18v20M27 18v20M34 18v20M9 41h30"/>',
  billete: '<rect x="4" y="13" width="40" height="22" rx="2"/><circle cx="24" cy="24" r="6"/><path d="M9 18v12M39 18v12"/>',
  candado: '<rect x="10" y="21" width="28" height="21" rx="3"/><path d="M16 21v-6a8 8 0 0 1 16 0v6M24 29v6"/>',
  contenedor: '<rect x="4" y="13" width="40" height="22" rx="1"/><path d="M11 17v14M18 17v14M25 17v14M32 17v14M39 17v14"/>',
  avion: '<path d="M5 27l14-3 9-15h4l-4 14 12-2 4-5h3l-2 8 2 8h-3l-4-5-12-2 4 14h-4l-9-15-14-3Z"/>',
};
const PAR_DE_TEMA = {
  plaza: ["moneda", "bolsa"],
  despacho: ["documento", "flecha"],
  hacienda: ["recibo", "columna"],
  boveda: ["billete", "candado"],
  puerto: ["contenedor", "avion"],
};
export const TESELA = 200;

/* La tesela de 200 × 200 con los dos iconos del tema, dos veces cada uno. */
export function teselaSvg(tema) {
  const acento = (TEMAS_ESCENA[tema] ?? TEMAS_ESCENA.plaza).acento;
  const [a, b] = PAR_DE_TEMA[tema] ?? PAR_DE_TEMA.plaza;
  const pon = (icono, x, y, giro) => `<g transform="translate(${x} ${y}) rotate(${giro} 24 24)">${ICONOS[icono]}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TESELA}" height="${TESELA}" viewBox="0 0 ${TESELA} ${TESELA}" fill="none" stroke="${acento}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">`
    + pon(a, 18, 22, -8) + pon(b, 122, 34, 10) + pon(b, 34, 122, -12) + pon(a, 128, 126, 6)
    + "</svg>";
}
const urlDe = (tema) => `url("data:image/svg+xml,${encodeURIComponent(teselaSvg(tema))}")`;

/* Acento #rrggbb con alfa, para los resplandores. */
const conAlfa = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
export function fondoAtmosfera(tema) {
  const acento = (TEMAS_ESCENA[tema] ?? TEMAS_ESCENA.plaza).acento;
  return [
    `radial-gradient(120% 55% at 50% -8%, ${conAlfa(acento, 0.2)}, transparent 70%)`,
    `radial-gradient(120% 50% at 50% 108%, ${conAlfa(acento, 0.16)}, transparent 70%)`,
    FONDO,
  ].join(", ");
}

const CSS_FONDO = `
.da26-pagina { position: relative; isolation: isolate; }
.da26-pagina-patron {
  position: fixed; top: -${TESELA}px; left: -${TESELA}px; right: 0; bottom: 0; z-index: -1;
  pointer-events: none; opacity: .07; background-repeat: repeat;
  animation: da26-patron 90s linear infinite;
}
@keyframes da26-patron { from { transform: translate(0, 0); } to { transform: translate(${TESELA}px, ${TESELA}px); } }
@media (prefers-reduced-motion: reduce) { .da26-pagina-patron { animation: none; } }
`;

/* tema: la escena (plaza, despacho…) o null para el azul plano de siempre. */
export default function FondoPagina({ tema = null, children, style = null, ...resto }) {
  if (!tema || !TEMAS_ESCENA[tema]) {
    return <div style={{ minHeight: "100vh", background: FONDO, ...style }} {...resto}>{children}</div>;
  }
  return (
    <div className="da26-pagina" data-fondo-pagina={tema} style={{ minHeight: "100vh", ...style, background: fondoAtmosfera(tema) }} {...resto}>
      <style>{CSS_FONDO}</style>
      <div className="da26-pagina-patron" aria-hidden="true" style={{ backgroundImage: urlDe(tema) }} />
      {children}
    </div>
  );
}
