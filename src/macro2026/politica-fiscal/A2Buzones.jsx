/*
 * A2 · Tres buzones (pf26-a2-buzones, Aprender).
 * Especificación de Gen, t3 §2 A2. Hay tres buzones, cada uno con su color.
 * Una moneda que se echa en cada buzón produce algo distinto:
 * - impuesto: cae al pozo común y no vuelve nada;
 * - tasa: sale un ticket y se levanta la barrera del peaje;
 * - contribución: frente a la casa aparece un andén nuevo.
 * La moneda se arrastra al buzón, o se toca el buzón (la moneda es una sola).
 * En P2 a P4, «Siguiente» espera a que la moneda caiga en el buzón de esa
 * pantalla; los otros buzones también se pueden probar.
 */
import { useEffect, useState } from "react";
import { BORDE, FONDO, INK, INK_2 } from "../comun/colores-da.js";
import { MarcoAprender, usePasos } from "../comun/ui.jsx";
import { useArrastre } from "../comun/arrastre.js";
import { ORDEN_TRIBUTOS, TRIBUTOS, tonoTributo } from "../comun/tributos.js";
import { IconoBuzon, IconoMoneda } from "../comun/iconos-pf.jsx";
import { APRENDER, A2, ESCENAS } from "./textos.js";

export const ID = "pf26-a2-buzones";
const TEXTOS = APRENDER[ID];
const BUZON_DE_PASO = [null, "impuesto", "tasa", "contribucion"];

export const CSS_A2 = `
.pf26-a2-moneda { display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 6px 14px; border-radius: 999px; border: 2px solid ${INK}; background: ${FONDO}; color: ${INK}; font: 600 14px/1 var(--planck-font-sans, system-ui, sans-serif); cursor: grab; touch-action: none; -webkit-user-select: none; user-select: none; transition: transform 280ms cubic-bezier(.3,.9,.4,1); }
.pf26-a2-moneda[aria-pressed="true"] { box-shadow: 0 0 0 3px ${INK_2}; }
.pf26-a2-moneda[data-arrastrando="1"] { transition: none; cursor: grabbing; }
.pf26-a2-buzones { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-top: 10px; }
.pf26-a2-buzon { display: flex; flex-direction: column; align-items: center; gap: 2px; min-height: 96px; padding: 6px 2px; border-radius: 12px; border: 2px solid var(--tono); background: ${FONDO}; color: ${INK}; font: 600 13px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.pf26-a2-buzon[data-blanco="1"] { box-shadow: 0 0 0 3px var(--tono); }
.pf26-a2-escena { margin-top: 10px; min-height: 120px; border: 1px solid ${BORDE}; border-radius: 12px; display: grid; place-items: center; padding: 8px; }
@keyframes pf26-a2-cae { from { transform: translateY(-40px); opacity: 0; } to { transform: none; opacity: 1; } }
.pf26-a2-cae { animation: pf26-a2-cae 420ms cubic-bezier(.3,.9,.4,1) both 1; }
.pf26-a2-barrera { transform-origin: 24px 70px; transition: transform 520ms cubic-bezier(.3,.9,.4,1) 200ms; }
.pf26-a2-escena[data-escena="tasa"] .pf26-a2-barrera { transform: rotate(-70deg); }
@media (prefers-reduced-motion: reduce) { .pf26-a2-cae { animation: none; } .pf26-a2-barrera { transition: none; } }
`;

export function Escena({ tipo }) {
  const tono = tonoTributo(tipo);
  if (tipo === "impuesto") {
    return (
      <svg viewBox="0 0 220 110" style={{ width: 220, height: 110 }} role="img" aria-label={A2.pozo}>
        <ellipse cx="110" cy="80" rx="90" ry="24" fill="none" stroke={tono} strokeWidth="3" />
        {[50, 72, 94, 118, 140, 162, 84, 130, 106].map((x, k) => (
          <circle key={k} cx={x} cy={k > 5 ? 74 : 84} r="8" fill="none" stroke={INK_2} strokeWidth="2" />
        ))}
        <circle className="pf26-a2-cae" cx="110" cy="62" r="9" fill={tono} />
        <text x="110" y="24" textAnchor="middle" fill={INK} fontSize="14" fontWeight="600">{A2.pozo}</text>
      </svg>
    );
  }
  if (tipo === "tasa") {
    return (
      <svg viewBox="0 0 220 110" style={{ width: 220, height: 110 }} role="img" aria-label={`${A2.ticket} y barrera arriba`}>
        <rect x="20" y="70" width="10" height="30" fill={INK_2} />
        <g className="pf26-a2-barrera"><rect x="24" y="66" width="110" height="8" rx="3" fill={tono} /></g>
        <rect className="pf26-a2-cae" x="150" y="40" width="54" height="36" rx="4" fill="none" stroke={tono} strokeWidth="2.5" strokeDasharray="5 3" />
        <text x="177" y="63" textAnchor="middle" fill={INK} fontSize="13" fontWeight="600">{A2.ticket}</text>
      </svg>
    );
  }
  if (tipo === "contribucion") {
    return (
      <svg viewBox="0 0 220 110" style={{ width: 220, height: 110 }} role="img" aria-label={A2.anden}>
        <path d="M70 70V40l40-26 40 26v30Z" fill="none" stroke={INK_2} strokeWidth="3" strokeLinejoin="round" />
        <rect x="100" y="50" width="20" height="20" fill="none" stroke={INK_2} strokeWidth="2.5" />
        <rect className="pf26-a2-cae" x="30" y="78" width="160" height="12" rx="2" fill={tono} />
        <text x="110" y="106" textAnchor="middle" fill={INK} fontSize="13" fontWeight="600">{A2.anden}</text>
      </svg>
    );
  }
  return null;
}

export default function A2Buzones({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [echada, setEchada] = useState(null);
  const [n, setN] = useState(0);
  useEffect(() => { setEchada(null); }, [paso]);
  const soltar = (_, buzon) => { setEchada(buzon); setN((x) => x + 1); };
  const { contenedor, pieza, destino } = useArrastre({ alSoltar: soltar, activo: paso > 0 });
  const meta = BUZON_DE_PASO[paso];

  const figura = (
    <div ref={contenedor}>
      {paso > 0 && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button type="button" className="pf26-a2-moneda" data-moneda aria-label={`${A2.moneda}. Arrástrala a un buzón o toca el buzón.`} {...pieza("moneda")}>
            <IconoMoneda size={26} />{A2.moneda}
          </button>
        </div>
      )}
      <div className="pf26-a2-buzones" role="group" aria-label="Los tres buzones">
        {ORDEN_TRIBUTOS.map((t) => {
          const props = paso > 0 ? destino(t, "moneda") : {};
          const Etq = paso > 0 ? "button" : "div";
          return (
            <Etq key={t} {...(paso > 0 ? { type: "button" } : {})} className="pf26-a2-buzon" data-buzon={t} style={{ "--tono": tonoTributo(t) }}
              aria-label={paso > 0 ? `Echar la moneda en ${TRIBUTOS[t].nombre}` : undefined} {...props}>
              <IconoBuzon size={52} tono={tonoTributo(t)} abierto={echada === t} />
              <span>{TRIBUTOS[t].nombre}</span>
            </Etq>
          );
        })}
      </div>
      {paso > 0 && (
        <div className="pf26-a2-escena" data-escena={echada ?? ""} aria-live="polite">
          {echada && <div key={`${echada}-${n}`} className="da26-entra"><Escena tipo={echada} /></div>}
        </div>
      )}
    </div>
  );

  return (
    <MarcoAprender escena={ESCENAS[ID]}
      id={ID}
      paso={paso}
      total={TEXTOS.length}
      texto={TEXTOS[paso]}
      figura={<><style>{CSS_A2}</style>{figura}</>}
      puedeSeguir={!meta || echada === meta}
      onSiguiente={siguiente}
      onAnterior={anterior}
      onTerminar={() => onTerminar?.()}
    />
  );
}
