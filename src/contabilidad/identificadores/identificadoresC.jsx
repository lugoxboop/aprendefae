/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CÉLULA C · LOS IDENTIFICADORES DE SUS CUATRO TEMAS (Watari, 17 oct.), en el
 * sistema de Xeno (orquestador/conocimiento/kit.md, «El sistema de los
 * identificadores de tema»). Va en src/contabilidad/identificadores/.
 *
 *   · activos-financieros          El título con su sello
 *   · inventarios-periodico        Las cajas que se cuentan al cierre
 *   · inventarios-permanente       El kárdex al día
 *   · inventarios-descuentos-nic2  La etiqueta con su rebaja
 *
 * 64 × 64, viewBox 0 0 64 64, dibujo dentro de 4…60. Contorno de 3 px,
 * extremos y esquinas redondeados, trazo currentColor. Un solo elemento en
 * el acento (var(--fae-acento)), con el único relleno tintado al 16 %; ese
 * mismo es el único que se mueve: lleva data-mueve y su --mueve (la regla y
 * su apagado los pone IdentificadorDeTema.jsx). Sin letras, cifras, coral,
 * teal ni nada de la lista prohibida. 4 px o más entre trazos en reposo.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const base = (size) => ({ viewBox: "0 0 64 64", width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false" });
const acento = { stroke: "var(--fae-acento)", fill: "var(--fae-acento)", fillOpacity: 0.16 };

/* T5 · Activos financieros: el título valor con su sello. El sello gira 10° sobre su centro. */
export function TituloConSello({ size = 64 }) {
  return (
    <svg {...base(size)}>
      <rect x="6" y="12" width="52" height="36" rx="4" />
      <path d="M14 22H38M14 30H30" />
      <path data-mueve d="M44 28.5L51.5 36L44 43.5L36.5 36Z" {...acento} style={{ "--mueve": "rotate(10deg)", transformBox: "fill-box", transformOrigin: "center" }} />
    </svg>
  );
}

/* T7-1 · Inventario periódico: las cajas que se cuentan al cierre. La de arriba, la que se cuenta, sube 4 px. */
export function CajasDelConteo({ size = 64 }) {
  return (
    <svg {...base(size)}>
      <rect x="8" y="36" width="22" height="20" rx="3" />
      <rect x="34" y="36" width="22" height="20" rx="3" />
      <path d="M19 36v6M45 36v6" />
      <g data-mueve style={{ "--mueve": "translateY(-4px)" }}>
        <rect x="21" y="12" width="22" height="20" rx="3" {...acento} />
        <path d="M32 12v6" stroke="var(--fae-acento)" />
      </g>
    </svg>
  );
}

/* T7-2 · Inventario permanente: el kárdex al día. La fila nueva sube 4 px a su renglón. */
export function KardexAlDia({ size = 64 }) {
  return (
    <svg {...base(size)}>
      <rect x="12" y="6" width="40" height="52" rx="4" />
      <path d="M12 16H52M32 16V38M12 27H52M12 38H52" />
      <rect data-mueve x="16" y="43" width="32" height="10" rx="3" {...acento} style={{ "--mueve": "translateY(-4px)" }} />
    </svg>
  );
}

/* T7-3 · Descuentos y NIC 2: la etiqueta con su rebaja. La esquina cortada se aparta 4 px. */
export function EtiquetaRebajada({ size = 64 }) {
  return (
    <svg {...base(size)}>
      <path d="M36 52H22L8 32L22 12H48a4 4 0 0 1 4 4V36" />
      <circle cx="20" cy="32" r="3" />
      <path d="M28 26H42M28 34H38" />
      <path data-mueve d="M56 40V52a4 4 0 0 1-4 4H40Z" {...acento} style={{ "--mueve": "translateX(4px)" }} />
    </svg>
  );
}
