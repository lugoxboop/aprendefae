/*
 * A3 · El columpio de la tasa (da26-a3-columpio-tasa, Aprender, sin FP).
 * Especificación de Gen §2 A3. Un balancín: de un lado la tasa de interés, del
 * otro una pila de ladrillos (inversión). El largo del brazo es b.
 * I = Ī − b·i con el modelo común (Ī = 200, b = 10, i = 8 → I = 120).
 */
import { useState } from "react";
import { COMPONENTES, INK, INK_2, BORDE, FONDO } from "../comun/colores-da.js";
import { BASE, fmtEntero } from "../comun/modelo-da.js";
import { Boton, Deslizador, MarcoAprender, useAncho, usePasos } from "../comun/ui.jsx";
import { APRENDER } from "./textos.js";

export const ID = "da26-a3-columpio-tasa";
const TX = APRENDER[ID];
const LADRILLO = COMPONENTES.I.color;
const IBAR_INCIERTO = 120;

function Grua({ subidos }) {
  return (
    <svg viewBox="0 0 260 170" width="100%" role="img" aria-label={`Grúa que sube ladrillos de crédito: ${subidos}`} data-ladrillos={subidos}>
      <path d="M40 165V20h8v145M44 20h170M44 34l26-14M200 20v24" fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M10 165h240" stroke={INK_2} strokeWidth={3} />
      <rect x={140} y={120} width={100} height={45} fill="none" stroke={INK_2} strokeWidth={3} />
      <path d="M140 120l50-26 50 26" fill="none" stroke={INK_2} strokeWidth={3} />
      {Array.from({ length: Math.min(subidos, 6) }, (_, k) => (
        <rect key={k} className="da26-entra" x={146 + (k % 3) * 30} y={150 - Math.floor(k / 3) * 14} width={26} height={12} rx={2} fill={LADRILLO} />
      ))}
      <g className="da26-entra" key={subidos}>
        <path d="M200 44v24" stroke={INK_2} strokeWidth={2} />
        <rect x={168} y={68} width={64} height={22} rx={3} fill={LADRILLO} />
        <text x={200} y={84} textAnchor="middle" fontSize={13} fontWeight={700} fill="#121418">crédito</text>
      </g>
    </svg>
  );
}

function Balancin({ i, b, Ibar, nubes = false, base = false }) {
  const [ref, W] = useAncho(262);
  const H = 200;
  const I = Math.max(0, Ibar - b * i);
  const cx = W * 0.42, cy = 150;
  const izq = W * 0.32;
  const der = 40 + b * 4.2;                        /* el brazo de la pila: b */
  const ang = (i - 8) * 1.6;                       /* al subir i, su lado sube */
  const rad = (ang * Math.PI) / 180;
  const fx = cx + der * Math.cos(rad), fy = cy + der * Math.sin(rad);
  const ix = cx - izq * Math.cos(rad), iy = cy - izq * Math.sin(rad);
  const hI = I * 0.42, hBase = Ibar * 0.42;
  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Balancín: tasa ${i} %, inversión ${fmtEntero(I)}`} data-inversion={Math.round(I)}>
        {nubes && (
          <g className="da26-entra" data-nubes>
            {[[W * 0.66, 26], [W * 0.84, 40]].map(([x, y], k) => (
              <path key={k} d={`M${x - 24} ${y} a12 12 0 0 1 14 -12 a14 14 0 0 1 26 2 a10 10 0 0 1 8 16 z`} fill={INK_2} opacity={0.75} />
            ))}
          </g>
        )}
        <path d={`M${cx - 14} ${cy + 34} L${cx} ${cy + 4} L${cx + 14} ${cy + 34} Z`} fill={BORDE} />
        <path d={`M8 ${cy + 34} H${W - 8}`} stroke={INK_2} strokeWidth={2} />
        <g className="da26-trans">
          <line x1={ix} y1={iy} x2={fx} y2={fy} stroke={INK} strokeWidth={6} strokeLinecap="round" data-brazo={b} />
          <circle cx={ix} cy={iy - 16} r={16} fill={FONDO} stroke={INK} strokeWidth={2.5} />
          <text x={ix} y={iy - 11} textAnchor="middle" fontSize={15} fontWeight={700} fill={INK}>i</text>
          <text x={ix} y={iy + 22} textAnchor="middle" fontSize={12} fill={INK} className="da26-mono">{i} %</text>
          {/* la pila sobre la punta del brazo */}
          {base && <rect x={fx - 24} y={fy - 4 - Math.min(hBase, 20)} width={48} height={Math.min(hBase, 20)} fill={LADRILLO} opacity={0.4} stroke={LADRILLO} data-base-ibar={Ibar} />}
          {base && <text x={fx + 30} y={fy - 8} fontSize={13} fontWeight={700} fill={INK}>Ī</text>}
          <rect x={fx - 18} y={fy - 4 - (base ? Math.min(hBase, 20) : 0) - hI} width={36} height={hI} fill={LADRILLO} rx={2} />
          <text x={fx} y={fy - 10 - (base ? Math.min(hBase, 20) : 0) - hI} textAnchor="middle" fontSize={15} fontWeight={700} fill={INK}>I</text>
        </g>
      </svg>
      <p className="da26-mono" style={{ textAlign: "center", fontSize: 16, margin: "2px 0 0" }} data-formula>
        <span style={{ display: "inline-block" }}>I = Ī − b·i</span>{" "}
        <span style={{ display: "inline-block" }}>= {fmtEntero(Ibar)} − {b}·{i} = {fmtEntero(I)}</span>
      </p>
    </div>
  );
}

export default function A3ColumpioTasa({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(4);
  const [subidos, setSubidos] = useState(0);
  const [i, setI] = useState(BASE.i);
  const [b, setB] = useState(BASE.b);
  const [subida, setSubida] = useState(0);
  const [incierto, setIncierto] = useState(false);

  let figura;
  let controles = null;
  if (paso === 0) {
    figura = (
      <button type="button" onClick={() => setSubidos((n) => n + 1)} aria-label="Tocar la grúa" data-tocar-grua
        style={{ display: "block", width: "100%", padding: 0, border: 0, background: "transparent", cursor: "pointer" }}>
        <Grua subidos={subidos} />
      </button>
    );
  } else if (paso === 1) {
    figura = <Balancin i={i} b={BASE.b} Ibar={BASE.Ibar} />;
    controles = <Deslizador id="a3-i" etiqueta="Tasa i" min={2} max={14} valor={i} onCambio={setI} formato={(v) => `${v} %`} />;
  } else if (paso === 2) {
    const iVista = BASE.i + subida;
    figura = (
      <>
        <Balancin i={iVista} b={b} Ibar={BASE.Ibar} />
        {subida > 0 && (
          <p className="da26-rotulo da26-mono da26-entra" style={{ textAlign: "center", margin: "2px 0 0" }} data-caida>
            I: {fmtEntero(BASE.Ibar - b * BASE.i)} → {fmtEntero(BASE.Ibar - b * iVista)} (−{fmtEntero(b * 2)})
          </p>
        )}
      </>
    );
    controles = (
      <>
        <Deslizador id="a3-b" etiqueta="b" min={5} max={20} valor={b} onCambio={(v) => { setB(v); setSubida(0); }} formato={String} />
        <Boton onClick={() => setSubida((s) => (s ? 0 : 2))} aria-pressed={subida > 0} data-sube-tasa>Sube la tasa 2 puntos</Boton>
      </>
    );
  } else {
    figura = <Balancin i={BASE.i} b={BASE.b} Ibar={incierto ? IBAR_INCIERTO : BASE.Ibar} nubes={incierto} base />;
    controles = (
      <div className="da26-fila">
        <Boton onClick={() => setIncierto(true)} disabled={incierto} data-incertidumbre style={{ flex: 1 }}>Llega incertidumbre</Boton>
        <Boton onClick={() => setIncierto(false)} disabled={!incierto} data-despeja style={{ flex: 1 }}>Se despeja</Boton>
      </div>
    );
  }

  return (
    <MarcoAprender
      id={ID} paso={paso} total={4} texto={TX[paso]} figura={figura} controles={controles}
      onSiguiente={siguiente} onAnterior={anterior} onTerminar={onTerminar}
    />
  );
}
