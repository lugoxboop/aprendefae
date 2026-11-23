/*
 * A3 · El problema, resuelto (pe26-a3-problema-resuelto, Aprender).
 * Especificación de Gen, t2 §2 A3: tarjetas con el virus de A2 que al
 * voltearse muestran el mismo dibujo «curado». P1 una tarjeta; P2 cinco; P3
 * cuatro tarjetas se funden en una sola «Estabilización».
 *
 * El volteo es transform (rotateY) con backface-visibility, Baseline amplio;
 * con movimiento reducido las caras se funden en su sitio, sin girar.
 */
import { useEffect, useState } from "react";
import { BORDE, FONDO, INK, INK_2, SUPERFICIE_2 } from "../comun/colores-da.js";
import { MarcoAprender, usePasos } from "../comun/ui.jsx";
import { IconoProblema } from "../comun/iconos-pe.jsx";
import { APRENDER, A3 } from "./textos.js";

export const ID = "pe26-a3-problema-resuelto";
const TEXTOS = APRENDER[ID];

const CSS = `
.pe26-a3-carta { position: relative; display: block; width: 100%; min-height: 96px; padding: 0; border: 0; background: none; color: ${INK}; cursor: pointer; touch-action: manipulation; perspective: 600px; font: inherit; }
.pe26-a3-carta[data-grande="1"] { min-height: 150px; max-width: 260px; margin: 0 auto; }
.pe26-a3-giro { position: absolute; inset: 0; transform-style: preserve-3d; transition: transform 420ms cubic-bezier(.3,.9,.4,1); }
.pe26-a3-carta[data-volteada="1"] .pe26-a3-giro { transform: rotateY(180deg); }
.pe26-a3-cara { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 8px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${FONDO}; -webkit-backface-visibility: hidden; backface-visibility: hidden; text-align: center; font: 600 14px/1.25 var(--planck-font-sans, system-ui, sans-serif); }
.pe26-a3-cara[data-cara="objetivo"] { transform: rotateY(180deg); border-color: ${INK}; background: ${SUPERFICIE_2}; }
.pe26-a3-carta[data-grande="1"] .pe26-a3-cara { font-size: 16px; }
.pe26-a3-tipo { font: 600 12px/16px var(--planck-font-sans, system-ui, sans-serif); color: ${INK_2}; }
.pe26-a3-rejilla { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.pe26-a3-rejilla > :last-child:nth-child(odd) { grid-column: 1 / -1; max-width: calc(50% - 4px); justify-self: center; width: 100%; }
.pe26-a3-funde { position: relative; min-height: 210px; }
.pe26-a3-cuatro { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.pe26-a3-mini { min-height: 96px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${FONDO}; font: 600 14px/1.25 var(--planck-font-sans, system-ui, sans-serif); text-align: center; padding: 6px; transition: transform 520ms cubic-bezier(.3,.9,.4,1), opacity 520ms cubic-bezier(.3,.9,.4,1); }
.pe26-a3-funde[data-fundido="1"] .pe26-a3-mini { opacity: 0; }
.pe26-a3-funde[data-fundido="1"] .pe26-a3-mini:nth-child(1) { transform: translate(calc(50% + 4px), calc(50% + 4px)) scale(.6); }
.pe26-a3-funde[data-fundido="1"] .pe26-a3-mini:nth-child(2) { transform: translate(calc(-50% - 4px), calc(50% + 4px)) scale(.6); }
.pe26-a3-funde[data-fundido="1"] .pe26-a3-mini:nth-child(3) { transform: translate(calc(50% + 4px), calc(-50% - 4px)) scale(.6); }
.pe26-a3-funde[data-fundido="1"] .pe26-a3-mini:nth-child(4) { transform: translate(calc(-50% - 4px), calc(-50% - 4px)) scale(.6); }
.pe26-a3-centro { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.pe26-a3-una { pointer-events: auto; min-width: 180px; min-height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border-radius: 14px; border: 2px solid ${INK}; background: ${SUPERFICIE_2}; color: ${INK}; font: 700 17px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; padding: 10px 16px; }
@media (prefers-reduced-motion: reduce) {
  .pe26-a3-giro { transition: none; transform: none !important; }
  .pe26-a3-cara { transition: opacity 120ms linear; }
  .pe26-a3-cara[data-cara="objetivo"] { transform: none; opacity: 0; }
  .pe26-a3-carta[data-volteada="1"] .pe26-a3-cara[data-cara="objetivo"] { opacity: 1; }
  .pe26-a3-carta[data-volteada="1"] .pe26-a3-cara[data-cara="problema"] { opacity: 0; }
  .pe26-a3-mini { transition: opacity 120ms linear; transform: none !important; }
}
`;

function Carta({ t, volteada, onVoltear, grande = false }) {
  const tam = grande ? 48 : 32;
  return (
    <button type="button" className="pe26-a3-carta" data-carta={t.icono} data-volteada={volteada ? "1" : "0"} data-grande={grande ? "1" : "0"}
      aria-label={volteada ? `Objetivo: ${t.objetivo}` : `Problema: ${t.problema}. Toca para voltear.`} onClick={onVoltear}>
      <span className="pe26-a3-giro">
        <span className="pe26-a3-cara" data-cara="problema" aria-hidden={volteada}>
          <IconoProblema id={t.icono} size={tam} />
          <span>{t.problema}</span>
        </span>
        <span className="pe26-a3-cara" data-cara="objetivo" aria-hidden={!volteada}>
          <IconoProblema id={t.icono} curado size={tam} />
          <span>{t.objetivo}</span>
        </span>
      </span>
    </button>
  );
}

export default function A3ProblemaResuelto({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [volteadas, setVolteadas] = useState(new Set());
  const [fundido, setFundido] = useState(false);
  const [repite, setRepite] = useState(0);
  const voltear = (k) => setVolteadas((v) => { const n = new Set(v); if (n.has(k)) n.delete(k); else n.add(k); return n; });

  useEffect(() => {
    if (paso !== 2) return undefined;
    setFundido(false);
    const t = setTimeout(() => setFundido(true), 700);
    return () => clearTimeout(t);
  }, [paso, repite]);

  let figura;
  if (paso === 0) {
    figura = <Carta t={A3.p1} grande volteada={volteadas.has("p1")} onVoltear={() => voltear("p1")} />;
  } else if (paso === 1) {
    figura = (
      <div className="pe26-a3-rejilla">
        {A3.p2.map((t) => <Carta key={t.icono} t={t} volteada={volteadas.has(t.icono)} onVoltear={() => voltear(t.icono)} />)}
      </div>
    );
  } else {
    figura = (
      <div className="pe26-a3-funde" data-fundido={fundido ? "1" : "0"}>
        <div className="pe26-a3-cuatro" aria-hidden={fundido}>
          {A3.p3.de.map((t) => (
            <div key={t.icono} className="pe26-a3-mini" data-mini={t.icono}><IconoProblema id={t.icono} size={30} /><span>{t.nombre}</span></div>
          ))}
        </div>
        {fundido && (
          <div className="pe26-a3-centro">
          <button type="button" className="pe26-a3-una da26-entra" data-estabilizacion onClick={() => setRepite((n) => n + 1)} aria-label={`${A3.p3.a}. Toca para verlo otra vez.`}>
            <svg width="44" height="30" viewBox="0 0 44 30" aria-hidden="true" style={{ width: 44, height: 30 }}><path d="M2 24c8 0 8-18 20-18s12 18 20 18" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" /><path d="M2 24h40" stroke={INK_2} strokeWidth="2" /></svg>
            <span>{A3.p3.a}</span>
          </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <MarcoAprender
      id={ID}
      paso={paso}
      total={TEXTOS.length}
      texto={TEXTOS[paso]}
      figura={<><style>{CSS}</style>{figura}</>}
      onSiguiente={siguiente}
      onAnterior={anterior}
      onTerminar={() => onTerminar?.()}
    />
  );
}
