/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1 A T4 · LOS IDENTIFICADORES DE TEMA DE LOS CUATRO PRIMEROS TEMAS DE
 * CONTABILIDAD (Ukyo, orquestador/conocimiento/prompts/logitos-temas-conta-v1.md;
 * los integra la Célula D), en el sistema de Xeno (kit.md, «El sistema de los
 * identificadores de tema»).
 *
 *   · T1 «Introducción»: LibretaYLapiz. La contabilidad empieza por anotar; el
 *     lápiz (acento) sube 4 px, como levantarlo para escribir.
 *   · T2 «Las cuentas, el debe y el haber»: CasilleroDeCuentas. Cada cuenta en
 *     su casilla; la ficha de arriba a la derecha (acento) sube 3 px.
 *   · T3 «Ingresos, gastos y ajustes»: CalendarioConCinta. A qué periodo le
 *     toca; la cinta (acento) baja 4 px, como un marcador que se corre.
 *   · T4 «Efectivo, caja menor y bancos»: CajonDePaso, el de Hanayama (§4).
 *
 * La geometría es la del §3, tal cual. 64 × 64, trazo de 3 px redondeado,
 * currentColor; un solo elemento en el acento, con el único relleno al 16 %,
 * y es el único que se mueve (`data-mueve` + `--mueve`; la regla y su
 * movimiento reducido los pone IdentificadorDeTema.jsx). El nombre accesible
 * lo da la tarjeta: el dibujo va oculto.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export { CajonDePaso } from "./CajonDePaso.jsx";

const SVG = { viewBox: "0 0 64 64", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false" };
const ACENTO = { stroke: "var(--fae-acento)", fill: "var(--fae-acento)", fillOpacity: "0.16" };

export function LibretaYLapiz({ size = 64 }) {
  return (
    <svg {...SVG} width={size} height={size}>
      <rect x="6" y="8" width="32" height="48" rx="4" />
      <path d="M14 22H30M14 32H30M14 42H24" />
      <g data-mueve {...ACENTO} style={{ "--mueve": "translateY(-4px)" }}>
        <path d="M47 16a5 5 0 0 1 10 0V40L52 50L47 40Z" />
        <path d="M47 24H57" fill="none" />
      </g>
    </svg>
  );
}

export function CasilleroDeCuentas({ size = 64 }) {
  return (
    <svg {...SVG} width={size} height={size}>
      <rect x="8" y="10" width="48" height="44" rx="5" />
      <path d="M32 10V54M8 32H56" />
      <rect data-mueve x="38" y="18" width="12" height="7" rx="2" {...ACENTO} style={{ "--mueve": "translateY(-3px)" }} />
    </svg>
  );
}

export function CalendarioConCinta({ size = 64 }) {
  return (
    <svg {...SVG} width={size} height={size}>
      <rect x="8" y="14" width="48" height="42" rx="5" />
      <path d="M8 26H56M20 8V18M44 8V18M18 38H32M18 48H28" />
      <path data-mueve d="M42 26V41L46.5 37L51 41V26" {...ACENTO} style={{ "--mueve": "translateY(4px)" }} />
    </svg>
  );
}
