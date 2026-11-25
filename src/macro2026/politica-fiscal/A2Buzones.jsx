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
import { IconoMoneda } from "../comun/iconos-pf.jsx";
import { BuzonIlustrado, Ilustrado } from "../comun/ilustrados.jsx";
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
@keyframes ilu-salta { 0%, 100% { transform: none; } 40% { transform: translateY(-6px) scale(1.06); } }
.ilu-salta { animation: ilu-salta 420ms cubic-bezier(.3,.9,.4,1) 1; }
.pf26-a2-barrera { transform-origin: 24px 70px; transition: transform 520ms cubic-bezier(.3,.9,.4,1) 200ms; }
.pf26-a2-escena[data-escena="tasa"] .pf26-a2-barrera { transform: rotate(-70deg); }
@media (prefers-reduced-motion: reduce) { .pf26-a2-cae, .ilu-salta { animation: none; } .pf26-a2-barrera { transition: none; } }
`;

/* Qué pasa con la moneda, ilustrado (Gemini, 25-nov; familia 12): el pozo
 * común lleno de monedas (impuesto), la barrera del parqueadero que se abre
 * con el tiquete (tasa) y la casa con su andén nuevo (contribución). La
 * moneda que cae sigue en vivo encima. */
export function Escena({ tipo }) {
  const tono = tonoTributo(tipo);
  const dibujo = { impuesto: ["pozo-monedas", A2.pozo], tasa: ["barrera-peaje", `${A2.ticket} y barrera arriba`], contribucion: ["casa-anden", A2.anden] }[tipo];
  if (!dibujo) return null;
  const rotulo = { impuesto: A2.pozo, tasa: A2.ticket, contribucion: A2.anden }[tipo];
  return (
    <div role="img" aria-label={dibujo[1]} data-escena-ilustrada={tipo} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <span style={{ position: "relative", display: "block" }}>
        <Ilustrado id={dibujo[0]} alto={96} />
        <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" className="pf26-a2-cae" style={{ position: "absolute", left: "50%", top: -6, marginLeft: -11, width: 22, height: 22 }}>
          <circle cx="11" cy="11" r="9" fill={tono} stroke="#0E1B2E" strokeWidth="2" />
        </svg>
      </span>
      <span style={{ font: "600 14px/1.2 var(--planck-font-sans, system-ui, sans-serif)", color: INK }}>{rotulo}</span>
    </div>
  );
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
              <BuzonIlustrado tributo={t} alto={62} abierto={echada === t} />
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
