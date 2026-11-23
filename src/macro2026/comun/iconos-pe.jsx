/*
 * MACRO 2026 · T2 — los dibujos pequeños: las cuatro ramas (§0), los problemas
 * de A2/A3 (sano y «curado») y los íconos sectoriales de A4. Trazos en línea,
 * sin texto dentro (el nombre va siempre escrito al lado, en HTML).
 * Todos en una caja de 32 × 32 y `currentColor` salvo que se pase `color`.
 */
import { RAMAS } from "./ramas.js";

const T = { fill: "none", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

function Caja({ size, color, children, titulo }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden={titulo ? undefined : "true"} role={titulo ? "img" : undefined} style={{ color, flex: "none", display: "block", width: size, height: size }}>
      {titulo && <title>{titulo}</title>}
      <g stroke="currentColor" {...T}>{children}</g>
    </svg>
  );
}

/* ─── Las ramas ─── */
const RAMA = {
  /* fiscal = alcancía con moneda */
  alcancia: (
    <>
      <path d="M6 17c0-5 4.5-8 10-8s10 3 10 8-4 8-10 8c-1.5 0-2.8-.2-4-.6L9 26v-3.5C7.2 21 6 19.2 6 17Z" />
      <path d="M13 10.5h6" />
      <circle cx="21.5" cy="15" r=".8" fill="currentColor" />
      <circle cx="16" cy="5" r="2.6" />
    </>
  ),
  /* monetaria = moneda con «%» */
  moneda: (
    <>
      <circle cx="16" cy="16" r="11" />
      <circle cx="12.5" cy="12.5" r="1.6" />
      <circle cx="19.5" cy="19.5" r="1.6" />
      <path d="M20.5 11.5 11.5 20.5" />
    </>
  ),
  /* cambiaria = billete de dólar con flecha doble */
  billete: (
    <>
      <rect x="4" y="7" width="24" height="13" rx="2" />
      <path d="M17.6 10.6c-.6-.6-1.4-.9-2.3-.9-1.3 0-2.2.7-2.2 1.7 0 2.3 4.8 1.3 4.8 3.6 0 1-1 1.8-2.4 1.8-1 0-1.9-.4-2.5-1M15.4 8.6v1.1M15.4 16.8v1.1" />
      <path d="M6 25.5h20M9 23l-3 2.5L9 28M23 23l3 2.5-3 2.5" />
    </>
  ),
  /* comercial = contenedor */
  contenedor: (
    <>
      <rect x="4" y="9" width="24" height="15" rx="1.5" />
      <path d="M9 12v9M13 12v9M17 12v9M21 12v9M25 12v9" />
      <path d="M8 9l2-3h12l2 3" />
    </>
  ),
};

export function IconoRama({ id, size = 28, color = null, titulo = null }) {
  const r = RAMAS[id];
  return <Caja size={size} color={color ?? r.color} titulo={titulo}>{RAMA[r.icono]}</Caja>;
}

/* ─── Los problemas (A2, A3) y su versión curada ─── */
const PROBLEMA = {
  inflacion: [
    <><path d="M5 15 15 5h10v10L15 25Z" /><circle cx="20.5" cy="9.5" r="1.4" /><path d="M27 29V19M24 22l3-3 3 3" /></>,
    <><path d="M5 15 15 5h10v10L15 25Z" /><circle cx="20.5" cy="9.5" r="1.4" /><path d="M21 27h9" /></>,
  ],
  desempleo: [
    <><path d="M10 4v14h12M10 18v10M22 18v10M10 11h10" /></>,
    <><path d="M10 4v14h12M10 18v10M22 18v10" /><circle cx="17" cy="7" r="3" /><path d="M14 18v-5c0-1.5 1.3-2.5 3-2.5s3 1 3 2.5v5" /></>,
  ],
  recesion: [
    <><path d="M4 27V15l7 4v-4l7 4v-4l7 4V6h3v21Z" /><path d="M9 23h2M15 23h2M21 23h2" /></>,
    <><path d="M4 27V15l7 4v-4l7 4v-4l7 4V6h3v21Z" /><path d="M9 23h2M15 23h2M21 23h2" /><path d="M26.5 4c-1-1-1-2 0-3" /></>,
  ],
  deficitFiscal: [
    <><path d="M6 17c0-5 4.5-8 10-8s10 3 10 8-4 8-10 8c-1.5 0-2.8-.2-4-.6L9 26v-3.5C7.2 21 6 19.2 6 17Z" /><path d="M14 14l3 3-2 2 3 3" /></>,
    <><path d="M6 17c0-5 4.5-8 10-8s10 3 10 8-4 8-10 8c-1.5 0-2.8-.2-4-.6L9 26v-3.5C7.2 21 6 19.2 6 17Z" /><path d="M12 17l3 3 5-6" /></>,
  ],
  deficitExterno: [
    <><path d="M3 20h12l-2 4H5Z" /><path d="M6 20v-3h6v3" /><path d="M17 19h12l-2 5H19Z" /><path d="M19 19v-7h8v7M19 15.5h8" /></>,
    <><path d="M3 20h12l-2 4H5Z" /><path d="M6 20v-5h6v5" /><path d="M17 20h12l-2 4H19Z" /><path d="M20 20v-5h6v5" /></>,
  ],
  desigualdad: [
    <><path d="M16 5v22M10 27h12M5 9l22 6" /><path d="M5 9l-3 7h6ZM27 15l-3 7h6Z" /></>,
    <><path d="M16 5v22M10 27h12M5 11h22" /><path d="M5 11l-3 7h6ZM27 11l-3 7h6Z" /></>,
  ],
  asignacion: [
    <><rect x="8" y="4" width="16" height="24" rx="1" /><path d="M12 16h8M12 12l8 8M20 12l-8 8" /></>,
    <><path d="M8 28V4h16v24" /><path d="M8 4l9 3v24l-9-3" /><circle cx="14" cy="17" r="1" fill="currentColor" /></>,
  ],
  ambiental: [
    <><path d="M5 28V18l6 3v-3l6 3V10h4v18Z" /><path d="M19 7c2-1 2-3 4-3s3 2 5 1M21 3c1.5-.8 2.5-1 4-.5" /></>,
    <><path d="M16 28V16" /><path d="M16 18c-6 0-9-4-9-10 6 0 9 4 9 10ZM16 22c5 0 8-3 8-8-5 0-8 3-8 8Z" /></>,
  ],
  crecimiento: [
    <><path d="M5 27h22" /><path d="M7 21l6-3 5 2 7-4" /></>,
    <><path d="M5 27h22" /><path d="M7 23l6-5 5 2 8-10M21 10h5v5" /></>,
  ],
};

export function IconoProblema({ id, curado = false, size = 28, color = "currentColor" }) {
  return <Caja size={size} color={color}>{PROBLEMA[id][curado ? 1 : 0]}</Caja>;
}

/* ─── Sectores (A4 P5) ─── */
const SECTOR = {
  agro: <><path d="M16 28V12" /><path d="M16 14c-4-1-6-4-6-8 4 1 6 4 6 8ZM16 14c4-1 6-4 6-8-4 1-6 4-6 8ZM16 21c-4-1-6-4-6-8 4 1 6 4 6 8ZM16 21c4-1 6-4 6-8-4 1-6 4-6 8Z" /></>,
  industria: <><circle cx="16" cy="16" r="5" /><path d="M16 4v4M16 24v4M4 16h4M24 16h4M7.5 7.5l2.8 2.8M21.7 21.7l2.8 2.8M7.5 24.5l2.8-2.8M21.7 10.3l2.8-2.8" /></>,
  mipymes: <><path d="M5 13h22l-2-6H7Z" /><path d="M7 13v14h18V13M13 27v-7h6v7" /></>,
  ciencia: <><path d="M12 4h8M13 4v8l-7 13a2 2 0 0 0 2 3h16a2 2 0 0 0 2-3l-7-13V4" /><path d="M9 20h14" /></>,
  competitividad: <><path d="M10 5h12v6a6 6 0 0 1-12 0Z" /><path d="M10 7H6a4 4 0 0 0 4 5M22 7h4a4 4 0 0 1-4 5M16 17v5M11 27h10M13 22h6v5h-6Z" /></>,
};

export function IconoSector({ id, size = 28, color = "currentColor" }) {
  return <Caja size={size} color={color}>{SECTOR[id]}</Caja>;
}

/* La autoridad económica (A5, H2): silueta neutra, sin rasgos. */
export function Personaje({ size = 28, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ color, display: "block", width: size, height: size }}>
      <circle cx="16" cy="8" r="4.5" fill="currentColor" />
      <path d="M8 30v-9c0-4 3.6-7 8-7s8 3 8 7v9Z" fill="currentColor" />
    </svg>
  );
}
