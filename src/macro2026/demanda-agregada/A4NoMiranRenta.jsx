/*
 * A4 · Los que no miran la renta (da26-a4-no-miran-renta, Aprender, sin FP).
 * Especificación de Gen §2 A4. G no depende de la renta; el déficit se cubre
 * con deuda (tramado GRIS, no coral: no es un error del estudiante); el tipo
 * de cambio como una etiqueta de precio colgada de un billete de dólar.
 * Nota de fidelidad (Gen): la dirección de XN con el tipo de cambio es la
 * estándar, la que el profesor usa en la pregunta 11 del Ejercicio 1.
 * Las cifras de X y M son de dibujo (la especificación no las da).
 */
import { useState } from "react";
import { COMPONENTES, GRIS, INK, INK_2, BORDE, FONDO, TINTA_SOBRE_COLOR } from "../comun/colores-da.js";
import { fmtEntero } from "../comun/modelo-da.js";
import { Deslizador, MarcoAprender, useAncho, usePasos } from "../comun/ui.jsx";
import { APRENDER, ESCENAS } from "./textos.js";

export const ID = "da26-a4-no-miran-renta";
const TX = APRENDER[ID];
const RECAUDA = 250;
const AGUA = "#9fb4d6";

/* XN con el tipo de cambio: más pesos por dólar, más X y menos M. */
export const xmDeTc = (tc) => {
  const d = (tc - 4000) / 100;
  return { X: 60 + 4 * d, M: 40 - 3 * d };
};

function RentaYG({ Y }) {
  const [ref, W] = useAncho(262);
  const H = 170, nivel = 30 + (1 - Y / 1000) * 110;
  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Renta ${Y}; el gasto G sigue en 200`} data-renta={Y}>
        <path d="M0 14 H70 V30" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
        <text x={2} y={9} fontSize={13} fontWeight={700} fill={INK}>Y</text>
        {Y > 0 && <rect x={70 - (2 + Y / 140) / 2} y={32} width={2 + Y / 140} height={nivel - 32} fill={AGUA} />}
        <path d="M30 30 L36 150 H104 L110 30" fill="none" stroke={INK} strokeWidth={3} />
        <rect className="da26-trans" x={36} y={nivel} width={68} height={150 - nivel} fill={AGUA} opacity={0.85} />
        <text x={70} y={166} textAnchor="middle" fontSize={12} fill={INK} className="da26-mono">{fmtEntero(Y)}</text>
        <g data-bloque-g>
          <rect x={W - 96} y={70} width={80} height={80} rx={6} fill={COMPONENTES.G.color} />
          <text x={W - 56} y={110} textAnchor="middle" fontSize={22} fontWeight={700} fill={TINTA_SOBRE_COLOR}>G</text>
          <text x={W - 56} y={132} textAnchor="middle" fontSize={13} fill={TINTA_SOBRE_COLOR} className="da26-mono">200</text>
        </g>
      </svg>
    </div>
  );
}

function Columnas({ gasta }) {
  const [ref, W] = useAncho(262);
  const H = 190, base = 168, esc = 0.36;
  const hR = RECAUDA * esc, hG = gasta * esc;
  const deficit = gasta > RECAUDA;
  const cw = Math.min(80, W * 0.28);
  const x1 = W * 0.18, x2 = W * 0.58;
  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Recauda ${RECAUDA}, gasta ${gasta}${deficit ? `: déficit ${gasta - RECAUDA}, se cubre con deuda` : ""}`} data-deficit={Math.max(0, gasta - RECAUDA)}>
        <defs>
          <pattern id="da26-tramado" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="7" height="7" fill={FONDO} /><line x1="0" y1="0" x2="0" y2="7" stroke={GRIS} strokeWidth="3" />
          </pattern>
        </defs>
        <line x1={6} y1={base} x2={W - 6} y2={base} stroke={BORDE} strokeWidth={2} />
        <rect x={x1} y={base - hR} width={cw} height={hR} fill={INK_2} />
        <text x={x1 + cw / 2} y={base + 16} textAnchor="middle" fontSize={13} fill={INK}>Recauda</text>
        <text x={x1 + cw / 2} y={base - 10} textAnchor="middle" fontSize={12} fill={TINTA_SOBRE_COLOR} fontWeight={700} className="da26-mono">{RECAUDA}</text>
        {deficit && (
          <g className="da26-entra" data-tramado>
            <rect x={x1} y={base - hG} width={cw} height={hG - hR} fill="url(#da26-tramado)" stroke={GRIS} strokeWidth={1.5} />
            <line x1={x1 + cw} y1={base - hG} x2={x2} y2={base - hG} stroke={GRIS} strokeDasharray="3 3" />
          </g>
        )}
        <rect className="da26-trans" x={x2} y={base - hG} width={cw} height={hG} fill={COMPONENTES.G.color} />
        <text x={x2 + cw / 2} y={base + 16} textAnchor="middle" fontSize={13} fill={INK}>Gasta</text>
        <text x={x2 + cw / 2} y={base - hG - 6} textAnchor="middle" fontSize={12} fill={INK} className="da26-mono">{gasta}</text>
        {deficit && (
          <text x={x1 + cw / 2} y={base - hG - 8} textAnchor="middle" fontSize={12} fontWeight={700} fill={INK} data-rotulo-deficit>Déficit → deuda</text>
        )}
      </svg>
    </div>
  );
}

function Billete({ tc, barcos = false }) {
  const [ref, W] = useAncho(262);
  const { X, M } = xmDeTc(tc);
  const xn = X - M;
  const nX = Math.max(1, Math.round(X / 16)), nM = Math.max(0, Math.round(M / 16));
  const H = barcos ? 200 : 130;
  const Barco = ({ x, y, sale }) => (
    <g transform={`translate(${x} ${y}) scale(${sale ? 1 : -1} 1)`}>
      <path d="M-12 0h22l-4 6h-14z" fill="none" stroke={INK} strokeWidth={1.8} />
      <path d="M-6 0v-5h7v5" fill="none" stroke={INK} strokeWidth={1.8} />
    </g>
  );
  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Un dólar cuesta ${fmtEntero(tc)} pesos${barcos ? `; exportaciones netas ${Math.round(xn)}` : ""}`} data-tc={tc} data-xn={Math.round(xn)}>
        <rect x={10} y={20} width={130} height={62} rx={6} fill="none" stroke={INK} strokeWidth={2.5} />
        <circle cx={75} cy={51} r={22} fill="none" stroke={INK_2} strokeWidth={2} />
        <text x={75} y={56} textAnchor="middle" fontSize={14} fontWeight={700} fill={INK}>US$</text>
        <path d="M140 40 L162 30" stroke={INK_2} strokeWidth={2} />
        <g data-etiqueta-precio>
          <path d={`M162 18 h${Math.max(80, W - 172)} v30 h-${Math.max(80, W - 172)} l-8 -15 z`} fill={INK} />
          <text x={170 + Math.max(80, W - 172) / 2} y={40} textAnchor="middle" fontSize={16} fontWeight={700} fill={TINTA_SOBRE_COLOR} className="da26-mono">$ {fmtEntero(tc)}</text>
        </g>
        <text x={164} y={66} fontSize={12} fill={INK_2}>pesos por dólar</text>
        {barcos && (
          <g>
            <path d={`M4 ${H - 6} c10 -5 16 5 26 0 s16 5 26 0 s16 5 26 0 s16 5 26 0 s16 5 26 0 s16 5 26 0 s16 5 26 0 s16 5 26 0 s16 5 26 0 s16 5 26 0`} fill="none" stroke={INK_2} strokeWidth={1.5} />
            <text x={6} y={112} fontSize={12} fill={INK}>Salen (X): {nX}</text>
            {Array.from({ length: nX }, (_, k) => <Barco key={`x${k}`} x={22 + k * 26} y={130} sale />)}
            <text x={6} y={156} fontSize={12} fill={INK}>Llegan (M): {nM}</text>
            {Array.from({ length: nM }, (_, k) => <Barco key={`m${k}`} x={22 + k * 26} y={174} />)}
            <rect className="da26-trans" x={W - 52} y={H - 10 - Math.max(0, xn) * 0.9} width={40} height={Math.max(2, Math.abs(xn) * 0.9)} fill={xn >= 0 ? COMPONENTES.XN.color : "transparent"} stroke={xn >= 0 ? "none" : GRIS} strokeDasharray={xn >= 0 ? undefined : "4 3"} data-bloque-xn={Math.round(xn)} />
            <text x={W - 32} y={H - 16 - Math.max(0, xn) * 0.9} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK}>XN</text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function A4NoMiranRenta({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(5);
  const [Y, setY] = useState(500);
  const [gasta, setGasta] = useState(250);
  const [tc, setTc] = useState(4000);

  let figura;
  let controles = null;
  const deslTc = (
    <Deslizador id="a4-tc" etiqueta="Tipo de cambio" min={3500} max={5000} paso={100} valor={tc} onCambio={setTc}
      formato={(v) => `$ ${fmtEntero(v)}`} extremos={["el peso se aprecia", "el peso se deprecia"]} />
  );
  if (paso === 0) {
    figura = <RentaYG Y={Y} />;
    controles = <Deslizador id="a4-y" etiqueta="Renta Y" min={0} max={1000} paso={10} valor={Y} onCambio={setY} formato={fmtEntero} />;
  } else if (paso === 1) {
    figura = <Columnas gasta={gasta} />;
    controles = <Deslizador id="a4-gasta" etiqueta="Gasta" min={100} max={400} paso={10} valor={gasta} onCambio={setGasta} formato={String} />;
  } else if (paso === 2) {
    figura = <Billete tc={4000} />;
  } else {
    figura = <Billete tc={tc} barcos />;
    controles = deslTc;
  }

  return (
    <MarcoAprender escena={ESCENAS[ID]}
      id={ID} paso={paso} total={5} texto={TX[paso]} figura={figura} controles={controles}
      onSiguiente={siguiente} onAnterior={anterior} onTerminar={onTerminar}
    />
  );
}
