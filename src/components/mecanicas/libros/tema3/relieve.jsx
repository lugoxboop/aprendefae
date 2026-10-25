/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · EL RELIEVE DE LOS CONTROLES PROPIOS DE LA CÉLULA E.
 *
 * La forma: orquestador/revisiones/volumen/e-volumen-forma-v1.md (Itagaki,
 * PASA con condiciones de Takamura), que aplica vida-visual-v1 (#545) §2 a §4.
 * Solo de T3 de Contabilidad: no toca nada de Erwin.
 *
 * LA ESCALERA, sin ningún tono nuevo: N0 #0E1B2E (la página), N1 #1D3557,
 * N2 #344968, el filo #586A83 y, para lo que recibe, #0D1725 (el interior
 * publicado de la cuenta T).
 *
 * CÓMO SE DIBUJA (vida-visual §3). El canto NO es un borde ni una sombra: es
 * una capa hermana DETRÁS de la cara, del mismo tamaño y radio, que asoma por
 * abajo los px de la elevación. El contenedor reserva siempre 4 px (la
 * elevación máxima), así que pasar de E1 a E2 no mueve nada de abajo, y en E1
 * queda 1 px libre bajo el canto (regla 4). Al pulsar, la cara baja hasta
 * tapar el canto; con hover sube 2 px. Solo se anima `transform`; nada va en
 * bucle. Con movimiento reducido el hundido se queda (sin transición).
 *
 * EL CONTORNO DE SILUETA (regla 3): 1 px rgba(248,249,250,.18) alrededor del
 * bloque entero. Son anillos sin desenfoque que hacen de borde y no se animan
 * (vida-visual §2.3: «no es una sombra y no cae aquí»): el canto lleva el
 * anillo completo, la cara lo lleva arriba y a los lados, para que no quede
 * una raya entre cara y canto.
 *
 * El blanco de toque es el bloque entero: el canto va detrás de la cara y
 * dentro del contenedor, que es el que recibe el dedo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const N0 = "#0E1B2E";
export const N1 = "#1D3557";
export const N2 = "#344968";
export const FILO = "#586A83";
export const HUNDIDO = "#0D1725";
export const SILUETA = "rgba(248,249,250,.18)";
/* Destino hundido: el contorno de siempre en reposo, y #CBDCF2 cuando hay algo tomado esperando sitio. */
export const DESTINO_REPOSO = "rgba(248,249,250,.35)";
export const DESTINO_DISPONIBLE = "#CBDCF2";
/* Sobre N2, el texto secundario va en #B8C4D4 (#A8B6C8 da 4,43). */
export const SECUNDARIO_N2 = "#B8C4D4";
/* La marca de error sobre una cara N2: el coral de texto ya publicado en MismoHecho (#F4A592, 4,5:1 contra N2); el coral pleno da 2,7. */
export const CORAL_SOBRE_N2 = "#F4A592";
const CURVA = "cubic-bezier(.3,.9,.4,1)";

export const CSS_RELIEVE = `
.fae-rel { position: relative; display: block; box-sizing: border-box; padding-bottom: 4px; border-radius: var(--fae-rel-r, 14px); }
.fae-rel > .fae-rel-canto {
  position: absolute; left: 0; right: 0; top: 0; bottom: 4px; border-radius: inherit; pointer-events: none;
  background: var(--fae-rel-canto, ${N1}); box-shadow: 0 0 0 1px ${SILUETA};
  transform: translateY(var(--fae-rel-e, 4px));
}
.fae-rel > .fae-rel-cara {
  position: relative; transform: translateY(0); transition: transform 160ms ${CURVA};
  box-shadow: 0 -1px 0 0 ${SILUETA}, -1px 0 0 0 ${SILUETA}, 1px 0 0 0 ${SILUETA};
}
.fae-rel[data-filo] > .fae-rel-cara {
  box-shadow: inset 0 1px 0 ${FILO}, 0 -1px 0 0 ${SILUETA}, -1px 0 0 0 ${SILUETA}, 1px 0 0 0 ${SILUETA};
}
.fae-rel > .fae-rel-cara:active:not(:disabled):not([aria-disabled="true"]) { transform: translateY(var(--fae-rel-e, 4px)); transition-duration: 100ms; }
@media (hover: hover) {
  .fae-rel > .fae-rel-cara:hover:not(:disabled):not([aria-disabled="true"]):not(:active) { transform: translateY(-2px); }
}
.fae-rel[data-plano] > .fae-rel-cara { transform: translateY(var(--fae-rel-e, 4px)); box-shadow: 0 0 0 1px ${SILUETA}; }
.fae-rel[data-plano] > .fae-rel-canto { visibility: hidden; }
.fae-destino { transition: transform 100ms ${CURVA}; }
.fae-destino:active:not(:disabled):not([aria-disabled="true"]) { transform: scale(.97); }
@keyframes fae-rel-llega { from { transform: translateY(-4px); } to { transform: none; } }
.fae-rel-llega { animation: fae-rel-llega 160ms ${CURVA} both; }
@media (prefers-reduced-motion: reduce) {
  .fae-rel > .fae-rel-cara, .fae-destino { transition: none !important; }
  .fae-rel-llega { animation: none !important; }
}
`;

/*
 * El contenedor con su canto. El hijo es la cara: un botón con la clase
 * `fae-rel-cara`. `e` es la elevación (3 = E1, 4 = E2); `plano` la baja a E0
 * (la ficha ya puesta); `filo` pone la luz de arriba (toda cara N2 la lleva).
 */
export function Relieve({ e = 4, canto = N1, radio = "14px", filo = false, plano = false, style, children, ...resto }) {
  return (
    <span
      className="fae-rel"
      data-elevacion={plano ? 0 : e === 3 ? 1 : 2}
      data-filo={filo && !plano ? "" : undefined}
      data-plano={plano ? "" : undefined}
      style={{ "--fae-rel-e": `${e}px`, "--fae-rel-canto": canto, "--fae-rel-r": radio, ...style }}
      {...resto}
    >
      <span aria-hidden="true" className="fae-rel-canto" />
      {children}
    </span>
  );
}
