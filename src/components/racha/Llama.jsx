/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA LLAMA DE LA RACHA (25-nov, Mateo: «que no sea una forma geométrica, sino
 * la mascotica con una animación de fueguito»).
 *
 * Una llama redonda, de dibujo, con el mismo lenguaje de las mascotas: curvas
 * blandas, contorno cálido y tres capas (fuera naranja, en medio ámbar, el
 * corazón crema). Sustituye a la llama facetada de tramos rectos, que se leía
 * como una gema y no como fuego.
 *
 * La usan las dos escalas:
 *   · IconoRacha (15–40 px): la ficha de la cuenta y el banner del Repaso.
 *     Quieta por defecto: muchas llamas moviéndose en una lista cansan.
 *   · El momento de racha (200+ px): `viva` la hace chisporrotear —cada capa
 *     se mece a su ritmo, desde la base— y `chispas` suelta brasas que suben.
 *
 * Apagada (`encendida={false}`) es solo el contorno en `colorApagado` con el
 * corazón insinuado: así la pide el banner del Repaso sin racha.
 *
 * COLOR. Sin coral (#E76F51 es solo error). El naranja es de ilustración,
 * igual que la llama que la mascota lleva en la cabeza; el ámbar es el del kit.
 * Con «reducir movimiento», todo quieto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las tres capas, dibujadas sobre una caja de 100 × 120 con la base en y = 116. */
export const FORMA_FUERA =
  "M50 4 C57 20 74 28 82 46 C92 68 88 96 70 109 C63 114 57 116 50 116 C43 116 37 114 30 109 C12 96 9 70 18 52 C22 44 27 39 31 34 C31 43 34 49 40 52 C38 36 42 18 50 4 Z";
export const FORMA_MEDIO =
  "M53 36 C59 50 72 58 72 79 C72 97 62 108 50 108 C38 108 28 98 28 83 C28 71 33 63 39 58 C39 66 43 70 47 70 C45 58 47 46 53 36 Z";
export const FORMA_CORAZON =
  "M50 66 C55 75 62 82 62 92 C62 101 56 106 50 106 C44 106 38 101 38 93 C38 85 44 77 50 66 Z";

export const COLORES_LLAMA = {
  fueraAlto: "#FFB347",
  fueraBajo: "#F58A1F",
  medioAlto: "#FFE08A",
  medioBajo: "#E9C46A",
  corazon: "#FFF6D8",
  contorno: "#8A4312",
};

const CSS_LLAMA = `
.fae-llama .fae-llama__capa { transform-box: fill-box; transform-origin: 50% 100%; }
.fae-llama--viva .fae-llama__fuera { animation: fae-llama-a 1.15s ease-in-out infinite alternate; }
.fae-llama--viva .fae-llama__medio { animation: fae-llama-b .82s ease-in-out infinite alternate; }
.fae-llama--viva .fae-llama__corazon { animation: fae-llama-c .64s ease-in-out infinite alternate; }
.fae-llama--viva .fae-llama__brasa { transform-box: fill-box; transform-origin: 50% 50%; animation: fae-llama-brasa 1.9s ease-out infinite; opacity: 0; }
.fae-llama--viva .fae-llama__brasa:nth-of-type(2) { animation-delay: .55s; animation-duration: 2.2s; }
.fae-llama--viva .fae-llama__brasa:nth-of-type(3) { animation-delay: 1.1s; }
.fae-llama--viva .fae-llama__brasa:nth-of-type(4) { animation-delay: 1.5s; animation-duration: 2.4s; }
@keyframes fae-llama-a { 0% { transform: scale(1, 1) skewX(-2deg); } 50% { transform: scale(1.03, .97) skewX(1.5deg); } 100% { transform: scale(.98, 1.04) skewX(3deg); } }
@keyframes fae-llama-b { 0% { transform: scale(1, .96) skewX(3deg); } 100% { transform: scale(1.04, 1.06) skewX(-3deg); } }
@keyframes fae-llama-c { 0% { transform: scale(.94, .92); } 100% { transform: scale(1.06, 1.08); } }
@keyframes fae-llama-brasa { 0% { opacity: 0; transform: translateY(0) scale(1); } 15% { opacity: 1; } 100% { opacity: 0; transform: translateY(-46px) scale(.4); } }
@media (prefers-reduced-motion: reduce) {
  .fae-llama--viva .fae-llama__capa, .fae-llama--viva .fae-llama__brasa { animation: none !important; }
}
`;

let estiloPuesto = false;
function asegurarEstilo() {
  if (estiloPuesto || typeof document === "undefined") return;
  if (document.getElementById("fae-llama-estilo")) { estiloPuesto = true; return; }
  const s = document.createElement("style");
  s.id = "fae-llama-estilo";
  s.textContent = CSS_LLAMA;
  document.head.appendChild(s);
  estiloPuesto = true;
}

/**
 * @param {object}  p
 * @param {number}  [p.tamano=28]     ancho en px; el alto es 1,2 veces
 * @param {boolean} [p.encendida=true]
 * @param {boolean} [p.viva=false]    chisporrotea (solo el momento grande)
 * @param {boolean} [p.chispas=false] brasas que suben (solo con `viva`)
 * @param {boolean} [p.brillo=false]  halo suave alrededor
 * @param {string}  [p.colorApagado]
 * @param {string}  [p.id="fae-llama"] prefijo de los degradados
 */
export default function Llama({ tamano = 28, encendida = true, viva = false, chispas = false, brillo = false, colorApagado = "rgba(248,249,250,0.32)", id = "fae-llama", style = null, ...resto }) {
  asegurarEstilo();
  const C = COLORES_LLAMA;
  /* El contorno engorda en lo pequeño: a 15 px, 2,5 unidades no se verían. */
  const grosor = tamano < 40 ? 7 : tamano < 90 ? 4.5 : 3;

  if (!encendida) {
    return (
      <svg viewBox="0 0 100 120" width={tamano} height={tamano * 1.2} aria-hidden="true" data-llama-racha="apagada" style={{ display: "block", overflow: "visible", ...(style ?? {}) }} {...resto}>
        <path d={FORMA_FUERA} fill="none" stroke={colorApagado} strokeWidth={grosor} strokeLinejoin="round" />
        <path d={FORMA_CORAZON} fill={colorApagado} opacity="0.55" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 120"
      width={tamano}
      height={tamano * 1.2}
      aria-hidden="true"
      data-llama-racha={viva ? "viva" : "encendida"}
      className={`fae-llama${viva ? " fae-llama--viva" : ""}`}
      style={{ display: "block", overflow: "visible", ...(style ?? {}) }}
      {...resto}
    >
      <defs>
        <linearGradient id={`${id}-fuera`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={C.fueraBajo} />
          <stop offset="100%" stopColor={C.fueraAlto} />
        </linearGradient>
        <linearGradient id={`${id}-medio`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={C.medioBajo} />
          <stop offset="100%" stopColor={C.medioAlto} />
        </linearGradient>
        {brillo && (
          <filter id={`${id}-brillo`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        )}
      </defs>
      <g filter={brillo ? `url(#${id}-brillo)` : undefined}>
        <path className="fae-llama__capa fae-llama__fuera" d={FORMA_FUERA} fill={`url(#${id}-fuera)`} stroke={C.contorno} strokeOpacity="0.55" strokeWidth={grosor} strokeLinejoin="round" />
        <path className="fae-llama__capa fae-llama__medio" d={FORMA_MEDIO} fill={`url(#${id}-medio)`} />
        <path className="fae-llama__capa fae-llama__corazon" d={FORMA_CORAZON} fill={C.corazon} />
        {/* El brillito de dibujo animado: lo que la hace de la familia de las mascotas. */}
        <ellipse cx="38" cy="58" rx="4" ry="9" transform="rotate(-24 38 58)" fill="#FFFFFF" opacity="0.38" />
      </g>
      {viva && chispas && (
        <g fill={C.fueraAlto}>
          <circle className="fae-llama__brasa" cx="24" cy="44" r="3.2" />
          <circle className="fae-llama__brasa" cx="78" cy="38" r="2.6" fill={C.medioAlto} />
          <circle className="fae-llama__brasa" cx="62" cy="14" r="2.2" />
          <circle className="fae-llama__brasa" cx="36" cy="20" r="2.4" fill={C.medioAlto} />
        </g>
      )}
    </svg>
  );
}
