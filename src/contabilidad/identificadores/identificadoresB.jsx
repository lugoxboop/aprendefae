/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 Y T6 · LOS IDENTIFICADORES DE TEMA DE LA CÉLULA B (Mai, 16 oct.; lote 16),
 * en el sistema de Xeno (orquestador/conocimiento/kit.md, «El sistema de los
 * identificadores de tema»).
 *
 *   · T5 «Activos financieros temporales»: un título apaisado con dos
 *     renglones y un sello-reloj en el acento; la aguja gira 10° con hover,
 *     foco o pulsación de la tarjeta: es temporal.
 *   · T6 «Cuentas por cobrar»: una factura vertical con el borde de abajo
 *     dentado y una moneda en el acento con su flecha hacia la factura; la
 *     moneda se acerca 4 px: la plata que se va a cobrar.
 *
 * El dibujo es el de Mai, tal cual. Del SVG que entregó cambia solo lo que el
 * kit fija de otro modo: `--mueve` es un transform (no una animación con
 * keyframes al cargar) y lo aplica IdentificadorDeTema.jsx, con su movimiento
 * reducido; el nombre accesible lo da la tarjeta, así que el dibujo va oculto.
 * 64 × 64, trazo de 3 px redondeado, currentColor.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const SVG = { viewBox: "0 0 64 64", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false" };
const ACENTO = { stroke: "var(--fae-acento)" };

export function TituloConReloj({ size = 64 }) {
  return (
    <svg {...SVG} width={size} height={size}>
      <path d="M35 46H10a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4h34a4 4 0 0 1 4 4v12" />
      <path d="M14 24h20M14 31h12" />
      <g style={ACENTO}>
        <circle cx="48" cy="44" r="11" />
        <path d="M48 44h4" />
        <path data-mueve d="M48 44v-6" style={{ transformBox: "view-box", transformOrigin: "48px 44px", "--mueve": "rotate(10deg)" }} />
      </g>
    </svg>
  );
}

export function FacturaPorCobrar({ size = 64 }) {
  return (
    <svg {...SVG} width={size} height={size}>
      <path d="M18 8h24a4 4 0 0 1 4 4v40l-4-3-4 3-4-3-4 3-4-3-4 3-4-3-4 3V12a4 4 0 0 1 4-4z" transform="translate(-4 0)" />
      <path d="M20 19h16M20 26h16M20 33h9" />
      <g data-mueve style={{ ...ACENTO, "--mueve": "translateX(-4px)" }}>
        <circle cx="52" cy="42" r="8" />
        <path d="M56 42h-8m3-3-3 3 3 3" />
      </g>
    </svg>
  );
}
