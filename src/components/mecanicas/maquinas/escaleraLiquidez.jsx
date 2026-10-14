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
 * LA ESCENA es un BORRADOR FUNCIONAL [ESCRITO POR CLAUDE, NO POR LA FICHA],
 * con las dos notas de Watari: la base abajo y M3 arriba, y la base y M1 se
 * cruzan (comparten el efectivo del público; M1 no contiene a la base: la
 * reserva de los bancos está en la base y no en M1). Al lado, los tres puntos
 * donde pega cada instrumento. Se reemplaza por la figura de Watari; los ids
 * de PARTES_ESCALERA son el contrato con los pasos de Near.
 *
 * LA LETRA: viewBox de 320 de ancho y texto de 15. En el teléfono de 320 px la
 * escena mide 236 px: 15 × 236 / 320 = 11,1 px, por encima del piso de 10,5.
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
export const PARTES_ESCALERA = ["banco-republica", "base", "m1", "m2", "m3", "persona", "bancos", "tes", "encaje", "tasa", "multiplicacion", "credito"];

/* La letra más pequeña de la escena, en unidades del viewBox de ANCHO_ESCENA. */
export const ANCHO_ESCENA = 320;
export const LETRA_ESCENA = 15;

const LINEA = "rgba(248,249,250,0.72)";
const TEXTO = { fontFamily: "Inter, sans-serif", fontSize: `${LETRA_ESCENA}px`, fill: "rgba(248,249,250,0.86)" };

function Rotulo({ x, y, children, anchor = "start", peso = 400 }) {
  return <text x={x} y={y} textAnchor={anchor} style={{ ...TEXTO, fontWeight: peso }}>{children}</text>;
}

/* Arriba, lo menos líquido; cada peldaño suma algo al de abajo. */
const PELDANOS = [
  { id: "m3", nombre: "M3", suma: "bonos de bancos", y: 50 },
  { id: "m2", nombre: "M2", suma: "ahorros y CDT", y: 88 },
];

export function EscenaEscalera({ resaltar = [] }) {
  return (
    <svg viewBox={`0 0 ${ANCHO_ESCENA} 248`} role="img" aria-label="La escalera de liquidez: abajo la base monetaria, que emite el Banco de la República; encima M1, que se cruza con la base en el efectivo; después M2 y arriba M3. Al lado, dónde pegan los TES, el encaje y la tasa" style={{ width: "100%", display: "block" }}>
      <style>{CSS_MAQUINAS}</style>
      <defs>
        <marker id="fae-esc-punta" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={LINEA} />
        </marker>
      </defs>
      <Parte id="bancos" resaltar={resaltar}>
        <rect x={10} y={8} width={80} height={30} rx="6" fill="none" stroke={LINEA} strokeWidth="2" />
        <Rotulo x={50} y={28} anchor="middle">Bancos</Rotulo>
      </Parte>
      <Parte id="tasa" resaltar={resaltar}>
        <rect x={100} y={8} width={54} height={30} rx="6" fill="none" stroke={FAE.ambar} strokeWidth="2" />
        <Rotulo x={127} y={28} anchor="middle">Tasa</Rotulo>
      </Parte>
      <Parte id="credito" resaltar={resaltar}>
        <path d="M158 23 H178" stroke={FAE.ambar} strokeWidth="2.4" strokeLinecap="round" markerEnd="url(#fae-esc-punta)" />
        <Rotulo x={184} y={28}>Crédito pedido</Rotulo>
      </Parte>
      <Parte id="persona" resaltar={resaltar}>
        <circle cx={50} cy={66} r={9} fill="none" stroke={LINEA} strokeWidth="2" />
        <path d="M50 75 V104 M34 86 H66 M50 104 L38 122 M50 104 L62 122" fill="none" stroke={LINEA} strokeWidth="2" strokeLinecap="round" />
        <Rotulo x={50} y={142} anchor="middle">Usted</Rotulo>
      </Parte>
      {PELDANOS.map((p) => (
        <Parte key={p.id} id={p.id} resaltar={resaltar}>
          <rect x={100} y={p.y} width={170} height={30} rx="6" fill="none" stroke={LINEA} strokeWidth="2" />
          <Rotulo x={110} y={p.y + 20} peso={700}>{p.nombre}</Rotulo>
          <Rotulo x={138} y={p.y + 20}>{p.suma}</Rotulo>
        </Parte>
      ))}
      <Parte id="m1" resaltar={resaltar}>
        <rect x={100} y={126} width={170} height={44} rx="6" fill="none" stroke={LINEA} strokeWidth="2" />
        <Rotulo x={110} y={145} peso={700}>M1</Rotulo>
        <Rotulo x={138} y={145}>cuentas corrientes</Rotulo>
      </Parte>
      <Parte id="base" resaltar={resaltar}>
        <rect x={10} y={150} width={190} height={46} rx="6" fill="rgba(42,157,143,0.10)" stroke={FAE.teal} strokeWidth="2" />
        <Rotulo x={18} y={165}>Reserva</Rotulo>
        <Rotulo x={110} y={165}>Efectivo</Rotulo>
        <Rotulo x={18} y={188} peso={700}>Base monetaria</Rotulo>
      </Parte>
      <Parte id="banco-republica" resaltar={resaltar}>
        <rect x={10} y={210} width={190} height={30} rx="6" fill="none" stroke={FAE.teal} strokeWidth="2" />
        <Rotulo x={105} y={230} anchor="middle">Banco de la República</Rotulo>
      </Parte>
      <Parte id="tes" resaltar={resaltar}>
        <path d="M262 186 H210" stroke={FAE.teal} strokeWidth="2.4" strokeLinecap="round" markerEnd="url(#fae-esc-punta)" />
        <Rotulo x={238} y={205} anchor="middle">TES</Rotulo>
      </Parte>
      <Parte id="multiplicacion" resaltar={resaltar}>
        <path d="M292 196 V58" fill="none" stroke={LINEA} strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#fae-esc-punta)" />
      </Parte>
      <Parte id="encaje" resaltar={resaltar}>
        <Rotulo x={312} y={228} anchor="end">Encaje</Rotulo>
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
