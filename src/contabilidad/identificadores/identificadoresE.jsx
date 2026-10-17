/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CÉLULA E · EL IDENTIFICADOR DE SU TEMA (P2 de Itagaki), en el sistema de
 * Xeno (orquestador/conocimiento/kit.md, «El sistema de los identificadores
 * de tema»). Va en src/contabilidad/identificadores/.
 *
 *   · repaso-capitulo-5   El mazo del capítulo: tres fichas de estudio
 *     apiladas en diagonal. La del frente es la que tienes en la mano; las de
 *     atrás, los temas que ya pasaste.
 *
 * 64 × 64, viewBox 0 0 64 64, dibujo dentro de 4…60 (el trazo más externo
 * llega a 56,9). Contorno de 3 px redondeado en currentColor. Las fichas de
 * atrás son solo su borde izquierdo y su borde superior, cortados antes de la
 * ficha de delante (sin relleno que tape). La del frente es el único elemento
 * en el acento, con el relleno al 16 %, y la única que se mueve: escala 1,08
 * sobre su centro (36, 37). Huecos de 7 px entre fichas y de 6 px con los
 * renglones; 5,6 px al moverse.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const base = (size) => ({ viewBox: "0 0 64 64", width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false" });

/* Repaso del capítulo 5: el mazo. */
export function MazoDelCapitulo({ size = 64 }) {
  return (
    <svg {...base(size)}>
      <path d="M8 36V10a4 4 0 0 1 4-4h20" />
      <path d="M15 43V17a4 4 0 0 1 4-4h20" />
      <g data-mueve style={{ "--mueve": "scale(1.08)", transformOrigin: "36px 37px" }}>
        <rect x="22" y="20" width="28" height="34" rx="4" stroke="var(--fae-acento)" fill="var(--fae-acento)" fillOpacity={0.16} />
        <path d="M28 31h16M28 38h10" />
      </g>
    </svg>
  );
}
