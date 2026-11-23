/*
 * MACRO 2026 · T3 — íconos propios de Política fiscal (trazo, sin relleno de
 * color salvo el tono que se pase). Cada SVG lleva su tamaño en línea: la
 * regla `.da26-figura svg { width: 100% }` lo estiraría.
 */
const caja = (size) => ({ width: size, height: size, flex: "none", display: "inline-block" });

/** Marca de forma de un impuesto directo: la lupa. */
export function IconoDirecto({ size = 22, color = "currentColor" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={caja(size)} aria-hidden="true">
      <circle cx="10" cy="10" r="6" fill="none" stroke={color} strokeWidth="2.2" />
      <path d="M14.5 14.5 20 20" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** Marca de forma de un impuesto indirecto: el código de barras. */
export function IconoIndirecto({ size = 22, color = "currentColor" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={caja(size)} aria-hidden="true">
      {[3, 6, 8, 11, 14, 16, 19, 21].map((x, k) => (
        <rect key={x} x={x} y="5" width={k % 3 === 0 ? 2 : 1.2} height="14" fill={color} />
      ))}
    </svg>
  );
}

/** Un buzón con su ranura; `tono` es el del tributo. */
export function IconoBuzon({ size = 56, tono = "currentColor", abierto = false }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} style={caja(size)} aria-hidden="true">
      <rect x="8" y="14" width="40" height="30" rx="8" fill="none" stroke={tono} strokeWidth="3" />
      <rect x="18" y={abierto ? 19 : 21} width="20" height={abierto ? 6 : 3} rx="1.5" fill={tono} />
      <path d="M28 44v8" stroke={tono} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function IconoMoneda({ size = 28, color = "currentColor" }) {
  return (
    <svg viewBox="0 0 28 28" width={size} height={size} style={caja(size)} aria-hidden="true">
      <circle cx="14" cy="14" r="11" fill="none" stroke={color} strokeWidth="2.4" />
      <path d="M14 7.5v13M17.5 10.5c-.8-1.2-2-1.8-3.5-1.8-2 0-3.3 1-3.3 2.4 0 3.5 7 1.6 7 5.2 0 1.5-1.5 2.5-3.6 2.5-1.7 0-3-.6-3.8-1.8" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconoBilletera({ size = 40, color = "currentColor", escala = 1 }) {
  const w = 18 + 14 * escala;
  return (
    <svg viewBox="0 0 48 40" width={size} height={size * (40 / 48)} style={{ ...caja(size), height: size * (40 / 48) }} aria-hidden="true">
      <rect x={24 - w / 2} y="10" width={w} height={14 + 10 * escala} rx="4" fill="none" stroke={color} strokeWidth="2.4" />
      <circle cx={24 + w / 2 - 6} cy={17 + 5 * escala} r="2" fill={color} />
    </svg>
  );
}

export function IconoCamisa({ size = 32, color = "currentColor" }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} style={caja(size)} aria-hidden="true">
      <path d="M11 4 4 8l3 6 3-1.5V28h12V12.5L25 14l3-6-7-4c-1 2-2.7 3-5 3s-4-1-5-3Z" fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}

/** Íconos pequeños de los objetivos de política (A1 P4) y de destinos del gasto (A4). */
const TRAZOS = {
  asignacion: "M5 19h14M7 19V9l5-4 5 4v10M10 19v-5h4v5",
  redistribucion: "M4 8h11l-3-3M20 16H9l3 3",
  estabilizacion: "M3 12c3-6 6 6 9 0s6 6 9 0",
  crecimiento: "M4 19 10 13l4 3 6-8M15 8h5v5",
  ambiente: "M12 21V11M12 11c-5 0-7-4-7-8 5 0 7 4 7 8Zm0 2c4 0 7-3 7-7-4 0-7 3-7 7Z",
  nomina: "M5 20v-2a7 7 0 0 1 14 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  insumos: "M4 8l8-4 8 4v8l-8 4-8-4V8Zm0 0 8 4 8-4M12 12v8",
  servicios: "M13 3 5 13h6l-1 8 8-10h-6l1-8Z",
  via: "M8 21 10 3M16 21 14 3M12 6v2M12 11v2M12 16v2",
  escuela: "M3 10l9-6 9 6M5 10v10h14V10M10 20v-5h4v5",
  metro: "M6 4h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM4 11h16M8 21l2-3M16 21l-2-3",
  intereses: "M4 7h16v12H4zM4 11h16M8 15h3",
  empresa: "M3 21V9l6 3V9l6 3V5h6v16H3Z",
  region: "M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2V6ZM9 4v14M15 6v14",
};
export function IconoTrazo({ id, size = 26, color = "currentColor" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={caja(size)} aria-hidden="true">
      <path d={TRAZOS[id]} fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
