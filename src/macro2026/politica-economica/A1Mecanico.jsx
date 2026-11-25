/*
 * A1 · ¿Mecánico o te arreglas solo? (pe26-a1-mecanico, Aprender).
 * Especificación de Gen, t2 §2 A1: un carro varado con dos salidas, la caja de
 * herramientas (izquierda) y la grúa al taller (derecha). P1 se sigue al tocar
 * las dos; P2 las rotula; P3 el carro pasa a ser el circuito y las salidas,
 * «Mercado» y «Estado»; P4 la cadena de cuatro nodos que se revelan al tocar.
 */
import { useState } from "react";
import { BORDE, FONDO, GRIS, INK, INK_2, SUPERFICIE_2 } from "../comun/colores-da.js";
import { MarcoAprender, usePasos } from "../comun/ui.jsx";
import { APRENDER, A1, ESCENAS } from "./textos.js";
import { Ilustrado, ILUSTRADOS, medidaIlustrado, rutaIlustrado } from "../comun/ilustrados.jsx";

export const ID = "pe26-a1-mecanico";
const TEXTOS = APRENDER[ID];

const CSS = `
.pe26-a1-fig { display: grid; grid-template-columns: 1fr 1fr; grid-template-areas: "c c" "i d"; align-items: stretch; gap: 8px; }
.pe26-a1-fig > :nth-child(1) { grid-area: i; justify-self: start; }
.pe26-a1-fig > :nth-child(2) { grid-area: c; }
.pe26-a1-fig > :nth-child(3) { grid-area: d; justify-self: end; }
.pe26-a1-salida { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%; max-width: 150px; min-height: 64px; padding: 8px 6px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; cursor: pointer; touch-action: manipulation; font: 600 12px/15px var(--planck-font-sans, system-ui, sans-serif); text-align: center; }
.pe26-a1-salida[aria-pressed="true"] { border-color: ${INK}; background: ${SUPERFICIE_2}; }
.pe26-a1-centro { position: relative; display: flex; justify-content: center; }
.pe26-a1-centro svg { width: 100%; max-width: 330px; height: auto; display: block; }
@keyframes pe26-a1-gira { from { transform: rotate(0deg); } to { transform: rotate(300deg); } }
@keyframes pe26-a1-llega { from { transform: translateX(70px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pe26-a1-humo { from { transform: translateY(4px); opacity: 0; } 50% { opacity: .9; } to { transform: translateY(-8px); opacity: .5; } }
@keyframes pe26-a1-salta { 0%, 100% { transform: none; } 40% { transform: translateY(-6px) scale(1.06); } }
@keyframes pe26-a1-parpadeo { 0%, 100% { opacity: 1; } 50% { opacity: .2; } }
.pe26-a1-llave { transform-box: fill-box; transform-origin: center; animation: pe26-a1-gira 600ms cubic-bezier(.3,.9,.4,1) 1; }
.pe26-a1-grua { animation: pe26-a1-llega 600ms cubic-bezier(.3,.9,.4,1) 1 both; }
.pe26-a1-humo { animation: pe26-a1-humo 1200ms cubic-bezier(.3,.9,.4,1) 1 both; }
.pe26-a1-salta { animation: pe26-a1-salta 420ms cubic-bezier(.3,.9,.4,1) 1; }
.pe26-a1-cadena { display: flex; flex-direction: column; align-items: stretch; gap: 0; }
.pe26-a1-nodo { width: 100%; min-height: 48px; padding: 10px 12px; border-radius: 12px; border: 2px dashed ${BORDE}; background: ${FONDO}; color: ${INK_2}; font: 600 15px/1.3 var(--planck-font-sans, system-ui, sans-serif); text-align: center; cursor: pointer; touch-action: manipulation; }
.pe26-a1-nodo[data-visto="1"] { border-style: solid; border-color: ${INK}; color: ${INK}; background: ${SUPERFICIE_2}; cursor: default; }
.pe26-a1-flecha { height: 20px; display: flex; justify-content: center; color: ${INK_2}; }
.pe26-a1-pregunta { display: inline-block; animation: pe26-a1-parpadeo 700ms linear 1; }
@media (prefers-reduced-motion: reduce) {
  .pe26-a1-llave, .pe26-a1-grua, .pe26-a1-humo, .pe26-a1-salta, .pe26-a1-pregunta { animation: none; }
}
`;

/* ─── Dibujos ─── */
/* El carro varado, la grúa y la caja, ilustrados (Gemini, 25-nov; familia 9
 * del diagnóstico visual). El humo del capó viene en la imagen; encima sale
 * un soplo en vivo. Al tocar la caja, la caja aparece junto al carro y la
 * llave gira; al tocar la grúa, la grúa llega desde la derecha. */
const CARRO_W = 172, CARRO_H = (CARRO_W * ILUSTRADOS["carro-varado"][1]) / ILUSTRADOS["carro-varado"][0];
const GRUA_W = 108, GRUA_H = (GRUA_W * ILUSTRADOS.grua[1]) / ILUSTRADOS.grua[0];
const CAJA_W = 46, CAJA_H = (CAJA_W * ILUSTRADOS["caja-herramientas"][1]) / ILUSTRADOS["caja-herramientas"][0];
const PISO = 128;
function Carro({ llave, grua }) {
  return (
    <svg viewBox="0 0 330 136" aria-hidden="true" data-carro-ilustrado>
      <ellipse cx="88" cy={PISO + 2} rx="84" ry="5" fill="#0E1B2E" opacity=".35" />
      <image href={rutaIlustrado("carro-varado")} x="2" y={PISO - CARRO_H} width={CARRO_W} height={CARRO_H} />
      <g fill={GRIS} className="pe26-a1-humo" key={`h${llave}`} opacity=".8">
        <circle cx="146" cy="18" r="8" /><circle cx="158" cy="10" r="6" />
      </g>
      {llave > 0 && (
        <g key={`l${llave}`} data-caja-junto>
          <image href={rutaIlustrado("caja-herramientas")} x="174" y={PISO - CAJA_H} width={CAJA_W} height={CAJA_H} className="pe26-a1-salta" />
          <g className="pe26-a1-llave" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M134 62l10-10" /><circle cx="147" cy="49" r="4.5" />
          </g>
        </g>
      )}
      {grua > 0 && (
        <g key={`g${grua}`} className="pe26-a1-grua" data-grua-llega>
          <image href={rutaIlustrado("grua")} x={330 - GRUA_W} y={PISO - GRUA_H} width={GRUA_W} height={GRUA_H} />
        </g>
      )}
      <path d={`M2 ${PISO + 4}h326`} stroke={BORDE} strokeWidth="2" />
    </svg>
  );
}

/* El carro pasa a ser el circuito: los hogares y las empresas, ilustrados,
 * con el dinero dando la vuelta (familia 9-10 del diagnóstico visual). */
function Circuito() {
  const casa = medidaIlustrado("casa-pais", 44), fab = medidaIlustrado("fabrica", 44);
  return (
    <svg viewBox="0 0 220 120" aria-hidden="true" data-circuito-ilustrado>
      <ellipse cx="110" cy="60" rx="78" ry="44" fill="none" stroke={INK_2} strokeWidth="3" />
      <path d="M180 48l8 10 8-10" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 72l-8-10-8 10" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <image href={rutaIlustrado("casa-pais")} x={32 - casa.width / 2} y={60 - casa.height / 2} width={casa.width} height={casa.height} />
      <image href={rutaIlustrado("fabrica")} x={188 - fab.width / 2} y={60 - fab.height / 2} width={fab.width} height={fab.height} />
      {[[110, 16], [110, 104]].map(([x, y]) => (
        <image key={y} href={rutaIlustrado("moneda-oro")} x={x - 10} y={y - 10} width="20" height="20" />
      ))}
    </svg>
  );
}

const ICONO = {
  caja: <path d="M6 14h28v18H6ZM14 14v-4h12v4M6 21h28M18 21v4h4v-4" />,
  grua: <><path d="M8 30V18h10l4 6v6Z" /><path d="M22 24l8-14M30 10l2 8" /><circle cx="12" cy="31" r="3" /><path d="M32 18v6" /></>,
  mercado: <path d="M12 32v-9l-3-6c-.8-1.6 1.4-2.8 2.4-1.3L14 19V8c0-1.8 2.6-1.8 2.6 0v8-10c0-1.8 2.6-1.8 2.6 0v10-9c0-1.8 2.6-1.8 2.6 0v9-7c0-1.8 2.6-1.8 2.6 0v12c0 4-2 6-3 7v5Z" />,
  estado: <path d="M6 32h28M8 32V17h24v15M5 17l15-9 15 9M12 20v9M18 20v9M24 20v9M30 20v9" />,
};
const ILUSTRADA = { caja: ["caja-herramientas", 40], grua: ["grua", 34], estado: ["edificio-gobierno", 40] };
function IconoSalida({ id, salta }) {
  if (ILUSTRADA[id]) return <Ilustrado id={ILUSTRADA[id][0]} alto={ILUSTRADA[id][1]} className={salta ? "pe26-a1-salta" : undefined} key={salta} />;
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" style={{ width: 40, height: 40 }} className={salta ? "pe26-a1-salta" : undefined} key={salta}>
      <g fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{ICONO[id]}</g>
    </svg>
  );
}

export default function A1Mecanico({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [toques, setToques] = useState({ caja: 0, grua: 0, mercado: 0, estado: 0 });
  const [vistos, setVistos] = useState(new Set());
  const tocar = (k) => setToques((t) => ({ ...t, [k]: t[k] + 1 }));

  let figura;
  if (paso <= 1) {
    const rotulo = paso === 1;
    figura = (
      <div className="pe26-a1-fig">
        <button type="button" className="pe26-a1-salida" data-salida="caja" aria-pressed={toques.caja > 0} onClick={() => tocar("caja")} aria-label={rotulo ? A1.caja : "Caja de herramientas"}>
          <IconoSalida id="caja" />{rotulo && <span data-rotulo-salida="caja">{A1.caja}</span>}
        </button>
        <div className="pe26-a1-centro"><Carro llave={toques.caja} grua={toques.grua} /></div>
        <button type="button" className="pe26-a1-salida" data-salida="grua" aria-pressed={toques.grua > 0} onClick={() => tocar("grua")} aria-label={rotulo ? A1.grua : "Grúa al taller"}>
          <IconoSalida id="grua" />{rotulo && <span data-rotulo-salida="grua">{A1.grua}</span>}
        </button>
      </div>
    );
  } else if (paso === 2) {
    figura = (
      <div className="pe26-a1-fig">
        <button type="button" className="pe26-a1-salida" data-salida="mercado" onClick={() => tocar("mercado")}>
          <IconoSalida id="mercado" salta={toques.mercado} /><span>{A1.mercado}</span>
        </button>
        <div className="pe26-a1-centro"><Circuito /></div>
        <button type="button" className="pe26-a1-salida" data-salida="estado" onClick={() => tocar("estado")}>
          <IconoSalida id="estado" salta={toques.estado} /><span>{A1.estado}</span>
        </button>
      </div>
    );
  } else {
    figura = (
      <div className="pe26-a1-cadena" role="list">
        {A1.cadena.map((nombre, k) => {
          const visto = vistos.has(k);
          const ultimo = k === A1.cadena.length - 1;
          return (
            <div key={nombre} role="listitem">
              {k > 0 && <div className="pe26-a1-flecha" aria-hidden="true"><svg width="16" height="20" viewBox="0 0 16 20" style={{ width: 16, height: 20 }}><path d="M8 2v14M3 11l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>}
              <button
                type="button"
                className="pe26-a1-nodo da26-entra"
                data-nodo={k + 1}
                data-visto={visto ? "1" : "0"}
                aria-label={visto ? nombre : `Nodo ${k + 1}: toca para revelar`}
                onClick={() => setVistos((v) => new Set(v).add(k))}
              >
                {!visto ? <span aria-hidden="true" className="da26-mono">?</span>
                  : ultimo ? <><span className="pe26-a1-pregunta">¿</span>{nombre.slice(1, -1)}<span className="pe26-a1-pregunta">?</span></>
                  : nombre}
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <MarcoAprender escena={ESCENAS[ID]}
      id={ID}
      paso={paso}
      total={TEXTOS.length}
      texto={TEXTOS[paso]}
      figura={<><style>{CSS}</style>{figura}</>}
      puedeSeguir={paso !== 0 || (toques.caja > 0 && toques.grua > 0)}
      onSiguiente={siguiente}
      onAnterior={anterior}
      onTerminar={() => onTerminar?.()}
    />
  );
}
