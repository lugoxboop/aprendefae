/*
 * A2 · El vaso de la renta (da26-a2-vaso-renta, Aprender, sin FP).
 * Especificación de Gen §2 A2. Un grifo (renta Y) llena un vaso; un gotero del
 * Gobierno añade (TR); un desagüe se lleva un tajo (T = tY); lo que queda se
 * reparte entre una taza «consumo» y una alcancía «ahorro».
 * Celular: grifo y vaso a la izquierda (60 %), tazas a la derecha; controles
 * debajo, en columna.
 */
import { useState } from "react";
import { COMPONENTES, INK, INK_2, FONDO } from "../comun/colores-da.js";
import { fmtDecimal, fmtEntero, rentaDisponible } from "../comun/modelo-da.js";
import { Boton, Deslizador, Interruptor, MarcoAprender, useAncho, usePasos } from "../comun/ui.jsx";
import { APRENDER, ESCENAS } from "./textos.js";

export const ID = "da26-a2-vaso-renta";
const T = APRENDER[ID];
const AGUA = "#9fb4d6";
const CBAR = 100;
const TOPE = 1100;

function Figura({ paso, Y, TR, t, c, resaltado }) {
  const [ref, W] = useAncho(262);
  const H = 210;
  const izq = W * 0.6;
  const yd = rentaDisponible(Y, paso >= 1 ? TR : 0, paso >= 1 ? t : 0);
  const vx = 22, vw = izq - 48, vTop = 70, vBot = 186;
  const nivel = Math.max(0, Math.min(1, yd / TOPE));
  const yNivel = vBot - nivel * (vBot - vTop);
  const chorro = Y > 0 ? 3 + (Y / 1000) * 9 : 0;
  const desague = t * Y > 0 ? 2 + ((t * Y) / 400) * 8 : 0;
  const dim = (k) => (resaltado && resaltado !== k ? 0.3 : 1);
  const cx = izq + 6, cw = W - izq - 10;
  const consumo = c * yd, ahorro = (1 - c) * yd;
  const Taza = ({ x, y, w, h, frac, rotulo, valor, color, id, alcancia = false }) => (
    <g data-taza={id}>
      {alcancia
        ? <rect x={x} y={y} width={w} height={h} rx={h / 2.6} fill="none" stroke={INK_2} strokeWidth={2.5} />
        : <path d={`M${x} ${y} h${w} l-${w * 0.12} ${h} h-${w * 0.76} z`} fill="none" stroke={INK_2} strokeWidth={2.5} strokeLinejoin="round" />}
      {alcancia && <rect x={x + w / 2 - 8} y={y - 1} width={16} height={4} fill={FONDO} stroke={INK_2} strokeWidth={1.5} />}
      <rect className="da26-trans" x={x + 4} y={y + h - 3 - Math.max(0, Math.min(1, frac)) * (h - 6)} width={w - 8} height={Math.max(0, Math.min(1, frac)) * (h - 6)} fill={color} rx={3} />
      <text x={x + w / 2} y={y + h + 14} fontSize={12} fill={INK} textAnchor="middle">{rotulo}</text>
      {valor != null && <text x={x + w / 2} y={y + h / 2 + 5} fontSize={12} fill={INK} textAnchor="middle" className="da26-mono" fontWeight={700}>{valor}</text>}
    </g>
  );

  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H + (paso >= 2 ? 30 : 12)}`} width="100%" role="img" aria-label={`Vaso de la renta disponible: ${fmtEntero(yd)}`} data-vaso={Math.round(yd)}>
        {/* el grifo de la renta */}
        <g opacity={dim("paren")}>
          <path d={`M0 18 H${vx + vw / 2 + 6} V40`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          <rect x={vx + vw / 2 - 2} y={10} width={16} height={8} rx={2} fill={INK} />
          <text x={4} y={12} fontSize={14} fontWeight={700} fill={INK}>Y</text>
          {chorro > 0 && <rect x={vx + vw / 2 + 6 - chorro / 2} y={42} width={chorro} height={yNivel - 42} fill={AGUA} opacity={0.8} />}
        </g>
        {/* gotero y desagüe */}
        {paso >= 1 && (
          <g opacity={dim("paren")}>
            <path d={`M${vx + vw - 6} 34 v12 l-4 6 h8 l-4 -6`} fill="none" stroke={INK} strokeWidth={2} />
            <text x={vx + vw + 4} y={44} fontSize={12} fontWeight={700} fill={INK}>TR</text>
            {TR > 0 && <><circle cx={vx + vw - 6} cy={58} r={3} fill={AGUA} /><circle cx={vx + vw - 6} cy={66} r={2.5} fill={AGUA} /></>}
            <path d={`M${vx + vw * 0.7} ${vBot} v8 h${izq - vx - vw * 0.7 - 6}`} fill="none" stroke={INK_2} strokeWidth={5} strokeLinecap="round" />
            {desague > 0 && <rect x={izq - 8} y={vBot + 8} width={desague} height={14} fill={AGUA} opacity={0.6} />}
            <text x={izq - 12} y={vBot + 22} fontSize={12} fill={INK} textAnchor="end">T = tY</text>
          </g>
        )}
        {/* el vaso */}
        <g opacity={dim("paren")} data-vaso-dibujo>
          <path d={`M${vx} ${vTop} L${vx + 6} ${vBot} H${vx + vw - 6} L${vx + vw} ${vTop}`} fill="none" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <rect className="da26-trans" x={vx + 6} y={yNivel} width={vw - 12} height={vBot - yNivel} fill={AGUA} opacity={0.85} />
          {paso >= 2 && (
            <text x={vx} y={vBot + 40} fontSize={12} fill={INK} textAnchor="start" fontWeight={700}>
              <tspan className="da26-mono">Y + TR − T = {fmtEntero(yd)}</tspan>
            </text>
          )}
        </g>
        {/* las tazas */}
        {paso >= 3 && (
          <g opacity={dim("c")}>
            <path d={`M${vx + vw} ${vTop + 6} Q${cx - 4} ${vTop + 6} ${cx + 4} 50`} fill="none" stroke={INK_2} strokeWidth={1.5} strokeDasharray="3 3" />
            <Taza id="consumo" x={cx} y={56} w={cw} h={44} frac={consumo / TOPE * 1.3} rotulo="Consumo inducido" valor={fmtEntero(consumo)} color={COMPONENTES.C.color} />
            <Taza id="ahorro" x={cx + 6} y={122} w={cw - 12} h={34} frac={ahorro / (TOPE * 0.5)} rotulo="Ahorro" valor={fmtEntero(ahorro)} color={INK_2} alcancia />
            <text x={cx + cw / 2} y={186} fontSize={12} fill={INK_2} textAnchor="middle" className="da26-mono">s = 1 − c</text>
          </g>
        )}
        {paso >= 4 && (
          <g opacity={dim("Cbar")} className="da26-entra">
            <Taza id="cbar" x={cx + cw * 0.22} y={4} w={cw * 0.56} h={28} frac={CBAR / CBAR} rotulo="" valor={null} color={COMPONENTES.C.color} />
            <text x={cx + cw / 2} y={45} fontSize={12} fontWeight={700} fill={INK} textAnchor="middle">C̄ = {CBAR}</text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function A2VasoRenta({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(6);
  const [Y, setY] = useState(500);
  const [TR, setTR] = useState(50);
  const [tPct, setT] = useState(25);
  const [c, setC] = useState(0.8);
  const [resaltado, setResaltado] = useState(null);
  const t = tPct / 100;

  const dY = <Deslizador id="a2-y" etiqueta="Renta Y" min={0} max={1000} paso={10} valor={Y} onCambio={setY} formato={fmtEntero} />;
  const dTR = <Interruptor id="a2-tr" etiqueta={`Transferencias: ${TR}`} activo={TR > 0} onCambio={(v) => setTR(v ? 50 : 0)} />;
  const dT = <Deslizador id="a2-t" etiqueta="Tasa t" min={0} max={40} valor={tPct} onCambio={setT} formato={(v) => `${v} %`} />;
  const dC = <Deslizador id="a2-c" etiqueta="c" min={0.5} max={0.95} paso={0.05} valor={c} onCambio={(v) => setC(Math.round(v * 100) / 100)} formato={(v) => fmtDecimal(v, 2)} />;

  const controles = [
    dY,
    <>{dTR}{dT}</>,
    <>{dY}{dTR}{dT}</>,
    dC,
    dY,
    null,
  ][paso];

  return (
    <MarcoAprender escena={ESCENAS[ID]}
      id={ID} paso={paso} total={6} texto={T[paso]}
      figura={(
        <>
          <Figura paso={paso} Y={Y} TR={TR} t={t} c={c} resaltado={paso === 5 ? resaltado : null} />
          {paso === 5 && (
            <div role="group" aria-label="Toca cada término de la fórmula" data-formula
              style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8, font: "600 18px/1 var(--planck-font-mono, monospace)" }}>
              <span>C =</span>
              <Boton aria-pressed={resaltado === "Cbar"} onClick={() => setResaltado(resaltado === "Cbar" ? null : "Cbar")} data-termino="Cbar"><span className="da26-mono">C̄</span></Boton>
              <span>+</span>
              <Boton aria-pressed={resaltado === "c"} onClick={() => setResaltado(resaltado === "c" ? null : "c")} data-termino="c"><span className="da26-mono">c</span></Boton>
              <Boton aria-pressed={resaltado === "paren"} onClick={() => setResaltado(resaltado === "paren" ? null : "paren")} data-termino="paren"><span className="da26-mono">(Y + TR − T)</span></Boton>
            </div>
          )}
        </>
      )}
      controles={controles}
      onSiguiente={siguiente} onAnterior={anterior} onTerminar={onTerminar}
    />
  );
}
