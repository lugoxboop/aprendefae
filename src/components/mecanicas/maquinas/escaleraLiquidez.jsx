import { useState } from "react";
import { FAE } from "../../../theme.js";
import { Parte, CSS_MAQUINAS } from "./salaDeMaquinas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA ESCALERA DE LIQUIDEZ — escena y exploración de «Las tallas del dinero».
 *
 * Archivo nuevo: salaDeMaquinas.jsx no se toca (de ahí solo se usan Parte y
 * CSS_MAQUINAS, tal cual, para que la escena resalte y apague como las otras
 * tres: data-parte, fae-sm-parte, fae-sm-apagada).
 *
 * LA ESCENA es un BORRADOR FUNCIONAL [ESCRITO POR CLAUDE, NO POR LA FICHA]:
 * cuatro peldaños, de lo más líquido arriba a lo menos líquido abajo, y los
 * tres puntos donde pega cada instrumento. Sirve para que la capa 2 resalte
 * las partes que nombran los pasos. Se reemplaza por la figura de Watari; los
 * ids de PARTES_ESCALERA son el contrato con los pasos de Near.
 *
 * LA EXPLORACIÓN sigue las tres reglas del encargo, una por instrumento, cada
 * una en un punto distinto de la escalera:
 *   · comprar TES sube la BASE (el Banco los compra y crea pesos nuevos)
 *   · bajar el encaje sube CUÁNTO SE MULTIPLICA esa base hacia M1 y M2
 *   · bajar la tasa sube CUÁNTO CRÉDITO SE PIDE
 * Sin cifras: tres barras que dicen hacia dónde, como ExploraInstrumentos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las partes que puede resaltar un paso. */
export const PARTES_ESCALERA = ["banco-republica", "base", "m1", "m2", "m3", "tes", "encaje", "tasa", "multiplicacion", "credito"];

const LINEA = "rgba(248,249,250,0.72)";
const TEXTO = { fontFamily: "Inter, sans-serif", fontSize: "13.5px", fill: "rgba(248,249,250,0.82)" };

function Rotulo({ x, y, children, anchor = "middle", peso = 400 }) {
  return <text x={x} y={y} textAnchor={anchor} style={{ ...TEXTO, fontWeight: peso }}>{children}</text>;
}

/* Cada peldaño, más ancho que el de arriba: se agrega a lo anterior. */
const PELDANOS = [
  { id: "base", nombre: "Base monetaria", y: 40, ancho: 120 },
  { id: "m1", nombre: "M1", y: 90, ancho: 170 },
  { id: "m2", nombre: "M2", y: 140, ancho: 220 },
  { id: "m3", nombre: "M3", y: 190, ancho: 270 },
];

export function EscenaEscalera({ resaltar = [] }) {
  return (
    <svg viewBox="0 0 360 262" role="img" aria-label="La escalera de liquidez: base monetaria, M1, M2 y M3, de lo más líquido a lo menos; y dónde pegan los TES, el encaje y la tasa" style={{ width: "100%", display: "block" }}>
      <style>{CSS_MAQUINAS}</style>
      <Parte id="banco-republica" resaltar={resaltar}>
        <rect x={10} y={8} width={110} height={22} rx="6" fill="none" stroke={FAE.teal} strokeWidth="2" />
        <Rotulo x={65} y={24}>Banco de la República</Rotulo>
      </Parte>
      {PELDANOS.map((p) => (
        <Parte key={p.id} id={p.id} resaltar={resaltar}>
          <rect x={10} y={p.y} width={p.ancho} height={34} rx="6" fill="none" stroke={LINEA} strokeWidth="2" />
          <Rotulo x={20} y={p.y + 22} anchor="start" peso={700}>{p.nombre}</Rotulo>
        </Parte>
      ))}
      <Parte id="tes" resaltar={resaltar}>
        <path d="M140 57 H200" stroke={FAE.teal} strokeWidth="2.4" strokeLinecap="round" />
        <Rotulo x={204} y={62} anchor="start">TES</Rotulo>
      </Parte>
      <Parte id="multiplicacion" resaltar={resaltar}>
        <path d="M190 107 C 240 107, 250 157, 240 157" fill="none" stroke={LINEA} strokeWidth="2" strokeDasharray="4 4" />
      </Parte>
      <Parte id="encaje" resaltar={resaltar}>
        <Rotulo x={256} y={130} anchor="start">Encaje</Rotulo>
      </Parte>
      <Parte id="tasa" resaltar={resaltar}>
        <Rotulo x={296} y={212} anchor="start">Tasa</Rotulo>
      </Parte>
      <Parte id="credito" resaltar={resaltar}>
        <path d="M290 230 H350" stroke={FAE.ambar} strokeWidth="2.4" strokeLinecap="round" />
        <Rotulo x={350} y={250} anchor="end">Crédito pedido</Rotulo>
      </Parte>
    </svg>
  );
}

/* ═══════════ CAPA 3 · LA EXPLORACIÓN ═══════════ */

/*
 * Las reglas, sin React, para que la prueba las vigile. Cada instrumento pega
 * en un solo punto: los TES no mueven el crédito pedido, la tasa no mueve la
 * base, el encaje no mueve ni una ni otro.
 */
export function efectosAgregados(e) {
  const s = (v, mas, menos) => (v === mas ? 1 : v === menos ? -1 : 0);
  return {
    base: s(e.tes, "comprar", "vender"),
    multiplicacion: s(e.encaje, "bajar", "subir"),
    credito: s(e.tasa, "bajar", "subir"),
  };
}

/* [ESCRITO POR CLAUDE, NO POR LA FICHA] Los rótulos de los controles, con los de ExploraInstrumentos. */
const CONTROLES = [
  { id: "tes", nombre: "TES", opciones: [["comprar", "El Banco compra TES"], ["no", "Nada"], ["vender", "El Banco vende TES"]] },
  { id: "encaje", nombre: "Encaje bancario", opciones: [["subir", "Subir"], ["no", "Mantener"], ["bajar", "Bajar"]] },
  { id: "tasa", nombre: "Tasa de intervención", opciones: [["subir", "Subir"], ["no", "Mantener"], ["bajar", "Bajar"]] },
];

const BOTON = (activo) => ({
  padding: "9px 12px", borderRadius: "999px", cursor: "pointer", fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
  background: activo ? "rgba(42,157,143,0.16)" : "transparent",
  border: `1px solid ${activo ? FAE.teal : "rgba(248,249,250,0.22)"}`,
  color: activo ? FAE.text : "rgba(248,249,250,0.72)",
});

function Barra({ valor, nombre }) {
  const pos = 50 + Math.max(-1, Math.min(1, valor)) * 40;
  return (
    <div style={{ marginTop: "12px" }} data-barra={nombre}>
      <p style={{ margin: "0 0 5px", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(248,249,250,0.6)" }}>{nombre.toUpperCase()}</p>
      <div style={{ position: "relative", height: "10px", borderRadius: "999px", background: "rgba(248,249,250,0.1)" }}>
        <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "-3px", width: "2px", height: "16px", background: "rgba(248,249,250,0.35)" }} />
        <span aria-hidden="true" style={{ position: "absolute", top: "-4px", left: `calc(${pos}% - 9px)`, width: "18px", height: "18px", borderRadius: "999px", background: FAE.teal, transition: "left 400ms ease" }} />
      </div>
    </div>
  );
}

export function ExploraTallas() {
  const [estado, setEstado] = useState({ tes: "no", encaje: "no", tasa: "no" });
  const { base, multiplicacion, credito } = efectosAgregados(estado);
  const texto = (v) => (v > 0 ? "sube" : v < 0 ? "baja" : "sin cambio");
  return (
    <div>
      {CONTROLES.map((c) => (
        <fieldset key={c.id} style={{ border: "none", padding: 0, margin: "0 0 12px" }}>
          <legend style={{ fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700, color: FAE.text, marginBottom: "7px" }}>{c.nombre}</legend>
          <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
            {c.opciones.map(([v, etiqueta]) => (
              <button key={v} type="button" aria-pressed={estado[c.id] === v} onClick={() => setEstado((s) => ({ ...s, [c.id]: v }))} style={BOTON(estado[c.id] === v)}>
                {etiqueta}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <Barra nombre="Base monetaria" valor={base} />
      <Barra nombre="Multiplicación" valor={multiplicacion} />
      <Barra nombre="Crédito pedido" valor={credito} />
      <p data-efectos-tallas role="status" style={{ margin: "10px 0 0", fontSize: "13px", lineHeight: 1.5, color: "rgba(248,249,250,0.8)" }}>
        Base monetaria: {texto(base)}. Multiplicación: {texto(multiplicacion)}. Crédito pedido: {texto(credito)}.
      </p>
    </div>
  );
}
