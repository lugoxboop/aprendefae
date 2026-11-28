/*
 * C11 · H05 · La bandeja de cata (gp26-pla-c11-h05-cata, Medio, 25 × 2 FP × %).
 * La bandeja de cata de madera con 5 × 5 cavidades: es la matriz (fila =
 * probabilidad 0,10 → 0,90, columna = impacto 0,05 → 0,80), con su cara de
 * Amenazas y su cara de Oportunidades. Cada taza encajada muestra su número y
 * su P × I; la del turno no se pinta hasta comprobar. La escala de Altamira
 * va plegada en una franja que se abre al tocar. Etapa 2: la repisa (ordenar
 * por valor, con empate 0,05 = 0,05) y las fichas de zona Alta ●●● · Media ●● ·
 * Baja ● (forma, no solo color).
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote6, Lamina, Rejilla } from "../comun/lote6.jsx";
import { GP_C11_H05, AMPLIACION_C11, cifra } from "./textos-c11.js";

export const ID = GP_C11_H05.id;

// imagen-pendiente: bandeja-cata · taza-cata · repisa · ficha-granos
const BANDEJA = primero("bandeja-cata", "bandeja-madera");
const TAZA = primero("taza-cata", "taza-cafe");

const FILAS = [0.9, 0.7, 0.5, 0.3, 0.1].map((v) => ({ id: `p${Math.round(v * 100)}`, nombre: cifra(v.toFixed(2)) }));
const COLUMNAS = [0.05, 0.1, 0.2, 0.4, 0.8].map((v) => ({ id: `i${Math.round(v * 100)}`, nombre: cifra(v.toFixed(2)) }));
const TAZA_DE = Object.fromEntries(AMPLIACION_C11.tazas.map((t) => [t.id, t]));

function Escala() {
  return (
    <details className="gp4-lamina" data-escala>
      <summary style={{ cursor: "pointer", minHeight: 32, font: "700 13px/32px var(--planck-font-sans, system-ui, sans-serif)" }}>Escala de Altamira (tocar para abrir)</summary>
      <small style={{ display: "block" }}>Probabilidad: 1–10 % 0,10 · 11–30 % 0,30 · 31–50 % 0,50 · 51–70 % 0,70 · más de 70 % 0,90.</small>
      <small style={{ display: "block" }}>Tiempo: 1 semana 0,05 · 1–4 semanas 0,10 · 1–3 meses 0,20 · 3–6 meses 0,40 · más de 6 meses 0,80.</small>
      <small style={{ display: "block" }}>Costo: menos de $40 0,05 · $40–200 0,10 · $201–400 0,20 · $401–2.000 0,40 · más de $2.000 0,80.</small>
    </details>
  );
}

function Bandeja(estado) {
  if (!estado.paso.taza) return null;
  const hechas = (estado.etapa?.hechos ?? []).map((h) => h.paso).filter((p) => p.taza);
  if (estado.revelado) hechas.push(estado.paso);
  const celda = (fila, col) => {
    const ts = hechas.map((p) => TAZA_DE[p.taza]).filter((x) => `p${Math.round(x.p * 100)}` === fila && `i${Math.round(x.i * 100)}` === col);
    return ts.length ? ts.map((t) => `${t.lado === "amenaza" ? "▼" : "▲"}${t.n} ${cifra(t.pi.toFixed(2))}`).join(" ") : null;
  };
  return (
    <>
      <Escala />
      <Lamina titulo="La bandeja · ▼ cara amenazas · ▲ cara oportunidades" data-bandeja={hechas.length}>
        <Rejilla nombre="bandeja" filas={FILAS} columnas={COLUMNAS} celda={celda} />
        <small style={{ display: "block", marginTop: 4 }}>Fila: probabilidad · columna: impacto</small>
      </Lamina>
    </>
  );
}

export const ESCENA = {
  nombre: "cata", fondo: ["#3a2614", "#130b05"], acento: "#e9c46a", luz: "rgba(233,196,106,.18)",
  portada: BANDEJA,
  mesa: "patrocinadora",
  objeto: { id: TAZA, alto: 56 },
  antes: () => <EstiloLote6 />,
  encima: (e) => <Bandeja {...e} />,
  etapas: [{}, { mesa: "tu", objetos: [BANDEJA].filter(Boolean), objetoTarjeta: TAZA }],
};

export default function C11H05Cata({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C11_H05} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
