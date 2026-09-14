import { useEffect, useState } from "react";
import { Lamina, Renglones, C } from "./previasComun.jsx";
import { Esfera, CSS_TABLERO } from "../../mecanicas/TableroDeDecisiones.jsx";
import { Onda, CSS_EXPLICA } from "../../mecanicas/ExplicaLaPolitica.jsx";

/* Política Económica. Ver PreviaActividad.jsx para la regla y de dónde sale cada una. */

/* PROPIA. El titular cae hacia la línea de archivo; un botón se enciende y el titular se va, clasificado. */
function Diagnostico() {
  return (
    <Lamina
      id="diagnostico-en-vivo"
      css={`
@keyframes fae-pv-dv-cae {
  0% { transform: translateY(0); opacity: 0; } 6% { transform: translateY(1px); opacity: 1; }
  55% { transform: translateY(17px); opacity: 1; } 62% { transform: translateY(17px) scale(1); opacity: 1; }
  76%, 100% { transform: translateY(17px) scale(1.08); opacity: 0; }
}
.fae-pv-dv-carta { animation: fae-pv-dv-cae 2.2s linear infinite; }
@keyframes fae-pv-dv-toque { 0%, 52% { stroke: ${C.hueco}; } 57%, 68% { stroke: ${C.luz}; } 76%, 100% { stroke: ${C.hueco}; } }
.fae-pv-dv-boton { animation: fae-pv-dv-toque 2.2s linear infinite; }
`}
    >
      <rect x="8" y="4" width="104" height="56" rx="8" fill={C.fondo} stroke={C.borde} />
      <path d="M12 50 H108" stroke={C.trazo} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.55" />
      <g className="fae-pv-dv-carta">
        <rect x="26" y="10" width="68" height="20" rx="4" fill={C.tarjeta} stroke="rgba(248,249,250,0.4)" />
        <Renglones x={32} y={17} anchos={[48, 34]} />
      </g>
      {[10, 45, 80].map((x, k) => (
        <rect key={x} className={k === 1 ? "fae-pv-dv-boton" : undefined} x={x} y="68" width="30" height="14" rx="7" fill="none" stroke={C.hueco} strokeWidth="1.8" />
      ))}
    </Lamina>
  );
}

/* GESTO. Una tarjeta sin texto sube y encaja en su casilla; una línea de luz la une con la de al lado. */
function ArmaGrupo() {
  return (
    <Lamina
      id="arma-grupo-logico"
      css={`
@keyframes fae-pv-ag-sube {
  0% { transform: translateY(64px); animation-timing-function: cubic-bezier(.2,.8,.3,1); }
  37.5%, 88% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(0); opacity: 0; }
}
.fae-pv-ag-carta { animation: fae-pv-ag-sube 1.6s linear infinite; }
@keyframes fae-pv-ag-luz { 0%, 37.5% { stroke-dashoffset: 1; opacity: 1; } 62.5%, 88% { stroke-dashoffset: 0; opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 0; } }
.fae-pv-ag-luz { animation: fae-pv-ag-luz 1.6s linear infinite; }
@keyframes fae-pv-ag-chispa { 0%, 37.5% { transform: translateX(0); opacity: 0; } 40% { transform: translateX(0); opacity: 1; } 62.5% { transform: translateX(16px); opacity: 1; } 72%, 100% { transform: translateX(16px); opacity: 0; } }
.fae-pv-ag-chispa { animation: fae-pv-ag-chispa 1.6s linear infinite; }
`}
    >
      {[8, 48, 88].map((x) => (
        <rect key={x} x={x} y="26" width="24" height="30" rx="4" fill="none" stroke={C.hueco} strokeWidth="1.6" strokeDasharray="4 3" />
      ))}
      <path d="M32 41 H48" stroke={C.hueco} strokeWidth="1.6" opacity="0.6" />
      <rect className="fae-pv-ag-carta" x="48" y="26" width="24" height="30" rx="4" fill={C.silueta} />
      <path className="fae-pv-trazo fae-pv-ag-luz" pathLength="1" d="M72 41 H88" stroke={C.luz} strokeWidth="3" strokeLinecap="round" />
      <circle className="fae-pv-ag-chispa" cx="72" cy="41" r="3" fill={C.luz} />
    </Lamina>
  );
}

/* CLIP. El medidor del tablero, el mismo componente: la aguja siguiendo al dial ES la interacción. */
const VALORES_TABLERO = [30, 72, 46, 84, 38];
function Tablero() {
  const [k, setK] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setK((x) => (x + 1) % VALORES_TABLERO.length), 1100);
    return () => clearInterval(t);
  }, []);
  return (
    <div data-previa="tablero-decisiones" style={{ width: "100%", padding: "14px 14px 0", boxSizing: "border-box" }}>
      <style>{CSS_TABLERO}</style>
      <Esfera soloDial valor={VALORES_TABLERO[k]} min={0} max={100} />
    </div>
  );
}

/*
 * GESTO. Una tarjeta del centro va a la zona derecha; la siguiente, a la
 * izquierda. Alterna a propósito: siempre al mismo lado insinuaría un patrón.
 */
function QuienGana() {
  return (
    <Lamina
      id="quien-gana-quien-pierde"
      css={`
@keyframes fae-pv-qg-a {
  0% { transform: translateX(0); opacity: 0; } 6% { transform: translateX(0); opacity: 1; animation-timing-function: cubic-bezier(.3,.7,.3,1); }
  31% { transform: translateX(39px); opacity: 1; } 46% { transform: translateX(39px); opacity: 1; } 50%, 100% { transform: translateX(39px); opacity: 0; }
}
@keyframes fae-pv-qg-b {
  0%, 50% { transform: translateX(0); opacity: 0; } 56% { transform: translateX(0); opacity: 1; animation-timing-function: cubic-bezier(.3,.7,.3,1); }
  81% { transform: translateX(-39px); opacity: 1; } 96% { transform: translateX(-39px); opacity: 1; } 100% { transform: translateX(-39px); opacity: 0; }
}
.fae-pv-qg-a { animation: fae-pv-qg-a 1.6s linear infinite; }
.fae-pv-qg-b { animation: fae-pv-qg-b 1.6s linear infinite; }
`}
    >
      <rect x="4" y="18" width="34" height="54" rx="8" fill="none" stroke={C.hueco} strokeWidth="1.6" strokeDasharray="4 3" />
      <rect x="82" y="18" width="34" height="54" rx="8" fill="none" stroke={C.hueco} strokeWidth="1.6" strokeDasharray="4 3" />
      <rect className="fae-pv-qg-a" x="48" y="33" width="24" height="24" rx="4" fill={C.silueta} />
      <rect className="fae-pv-qg-b" x="48" y="33" width="24" height="24" rx="4" fill={C.silueta} />
    </Lamina>
  );
}

/* PROPIA. El titular cruza la cinta mientras la banda corre; un botón se enciende y el titular sale. */
function Corriente() {
  const rayas = Array.from({ length: 13 }, (_, k) => `M${k * 11} 47 v6`).join(" ");
  return (
    <Lamina
      id="corriente-titulares"
      css={`
@keyframes fae-pv-ct-veta { from { transform: translateX(-11px); } to { transform: translateX(0); } }
.fae-pv-ct-veta { animation: fae-pv-ct-veta 0.35s linear infinite; }
@keyframes fae-pv-ct-carta {
  0% { transform: translateX(-48px); opacity: 1; } 55% { transform: translateX(28px); opacity: 1; }
  60% { transform: translateX(28px) scale(1); opacity: 1; } 74%, 100% { transform: translateX(28px) scale(1.08); opacity: 0; }
}
.fae-pv-ct-carta { animation: fae-pv-ct-carta 2s linear infinite; }
@keyframes fae-pv-ct-toque { 0%, 52% { stroke: ${C.hueco}; } 57%, 68% { stroke: ${C.luz}; } 76%, 100% { stroke: ${C.hueco}; } }
.fae-pv-ct-boton { animation: fae-pv-ct-toque 2s linear infinite; }
`}
    >
      <defs>
        <clipPath id="fae-pv-ct-marco"><rect x="4" y="8" width="112" height="48" rx="8" /></clipPath>
      </defs>
      <rect x="4" y="8" width="112" height="48" rx="8" fill={C.fondo} stroke={C.borde} />
      <g clipPath="url(#fae-pv-ct-marco)">
        <path className="fae-pv-ct-veta" d={rayas} stroke="rgba(203,220,242,0.28)" strokeWidth="2" />
        <g className="fae-pv-ct-carta">
          <rect x="18" y="16" width="44" height="22" rx="4" fill={C.tarjeta} stroke="rgba(248,249,250,0.4)" />
          <Renglones x={23} y={23} anchos={[32, 22]} />
        </g>
      </g>
      {[10, 45, 80].map((x, k) => (
        <rect key={x} className={k === 2 ? "fae-pv-ct-boton" : undefined} x={x} y="66" width="30" height="14" rx="7" fill="none" stroke={C.hueco} strokeWidth="1.8" />
      ))}
    </Lamina>
  );
}

/*
 * PROPIA. La onda de la actividad, el mismo componente: ruido y después señal
 * limpia, que es lo que pasa al transmitir. El coral de la onda rota es el de
 * la actividad real y es de error —ruido—, el único sitio donde aparece.
 */
function Explica() {
  const [limpia, setLimpia] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setLimpia((v) => !v), 1200);
    return () => clearInterval(t);
  }, []);
  return (
    <div data-previa="explica-la-politica" style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
      <style>{CSS_EXPLICA}</style>
      <span style={{ display: "inline-flex", transform: "scale(2.2)" }}>
        <Onda limpia={limpia} animada />
      </span>
    </div>
  );
}

/*
 * GESTO. Una pieza sin texto encaja en uno de los cinco huecos; al encajar,
 * el pulso ámbar del panel se atenúa un momento y vuelve a su ritmo. PARCIAL:
 * la resolución entera solo llega con las cinco correctas, y una pieza sola
 * no puede parecer que resuelve nada.
 */
function Simulador() {
  return (
    <Lamina
      id="simulador-de-crisis"
      css={`
@keyframes fae-pv-sc-borde {
  0% { stroke-opacity: .5; } 22% { stroke-opacity: 1; } 33% { stroke-opacity: .92; }
  42% { stroke-opacity: .3; } 52% { stroke-opacity: .55; } 75% { stroke-opacity: 1; } 100% { stroke-opacity: .5; }
}
.fae-pv-sc-borde { animation: fae-pv-sc-borde 1.8s ease-in-out infinite; }
@keyframes fae-pv-sc-pieza {
  0% { transform: translateY(-40px); opacity: 0; } 8% { transform: translateY(-40px); opacity: 1; animation-timing-function: cubic-bezier(.3,.7,.3,1); }
  33%, 88% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(0); opacity: 0; }
}
.fae-pv-sc-pieza { animation: fae-pv-sc-pieza 1.8s linear infinite; }
`}
    >
      <rect className="fae-pv-sc-borde" x="6" y="12" width="108" height="66" rx="8" fill={C.fondo} stroke={C.ambar} strokeWidth="2" />
      <path className="fae-pv-sc-borde" d="M13 29 L18.5 19.5 L24 29 Z" fill="none" stroke={C.ambar} strokeWidth="1.8" strokeLinejoin="round" />
      {[12, 32, 52, 72, 92].map((x) => (
        <rect key={x} x={x} y="44" width="16" height="20" rx="3" fill="none" stroke={C.hueco} strokeWidth="1.5" strokeDasharray="3 2.5" />
      ))}
      <rect className="fae-pv-sc-pieza" x="52" y="44" width="16" height="20" rx="3" fill={C.silueta} />
    </Lamina>
  );
}

const GESTOS = {
  "diagnostico-en-vivo": Diagnostico,
  "arma-grupo-logico": ArmaGrupo,
  "tablero-decisiones": Tablero,
  "quien-gana-quien-pierde": QuienGana,
  "corriente-titulares": Corriente,
  "explica-la-politica": Explica,
  "simulador-de-crisis": Simulador,
};

export default function PreviasEconomica({ actividadId }) {
  const Gesto = GESTOS[actividadId];
  return Gesto ? <Gesto /> : null;
}
