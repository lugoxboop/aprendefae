/*
 * A4 · Las perillas de la demanda (pe26-a4-perillas, Aprender).
 * Especificación de Gen, t2 §2 A4: la ecuación de la DA de T1 montada como
 * consola, con perillas del tono de su rama y una aguja «Y». El número sale
 * del modelo de T1 (comun/modelo-da.js), no de una tabla aparte.
 *   P1 los cuatro especialistas y sus herramientas;
 *   P2 la ecuación con perillas sobre TR, t, G (fiscal), i (monetaria) y XN
 *      (cambiaria y comercial): tocar una resalta su rama;
 *   P3 tres perillas operables: G 100–400, i 2–14 %, XN −50–150;
 *   P4 se habilita t (0–40 %) y el altavoz «× multiplicador» crece o encoge;
 *   P5 los íconos sectoriales alrededor de la consola.
 */
import { useState } from "react";
import { BORDE, FONDO, INK, INK_2, SUPERFICIE_2, TINTA_SOBRE_COLOR } from "../comun/colores-da.js";
import { BASE, modelo, produccion, multiplicador, fmtEntero, fmtDecimal } from "../comun/modelo-da.js";
import { Deslizador, MarcoAprender, usePasos, useAnimado } from "../comun/ui.jsx";
import { RAMAS, ORDEN_RAMAS, colorRama } from "../comun/ramas.js";
import { IconoRama, IconoSector } from "../comun/iconos-pe.jsx";
import { APRENDER, HERRAMIENTAS, SECTORES, A4, ESCENAS } from "./textos.js";

export const ID = "pe26-a4-perillas";
const TEXTOS = APRENDER[ID];
export const Y_TOPE = 4500;

/* Las perillas de la ecuación: término → rama(s). */
const PERILLAS = { TR: ["fiscal"], t: ["fiscal"], G: ["fiscal"], i: ["monetaria"], XN: ["cambiaria", "comercial"] };

const CSS = `
.pe26-a4-ramas { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.pe26-a4-esp { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; min-height: 64px; padding: 8px 10px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; text-align: left; cursor: pointer; touch-action: manipulation; font: 600 14px/18px var(--planck-font-sans, system-ui, sans-serif); }
.pe26-a4-esp[aria-expanded="true"] { border-color: var(--rama); background: ${SUPERFICIE_2}; }
.pe26-a4-esp-cab { display: flex; align-items: center; gap: 8px; }
.pe26-a4-herr { margin: 0; padding: 0 0 0 2px; list-style: none; font: 500 13px/18px var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; }
.pe26-a4-herr li::before { content: "· "; color: var(--rama); font-weight: 700; }
.pe26-a4-ec { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 4px 3px; padding: 12px 6px; border-radius: 12px; border: 1px solid ${BORDE}; background: ${FONDO}; font: 600 16px/1 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); }
.pe26-a4-tok { padding: 4px 1px; }
.pe26-a4-perilla { min-width: 44px; min-height: 44px; padding: 0 8px; border-radius: 999px; border: 2px solid var(--rama); background: var(--rama); color: ${TINTA_SOBRE_COLOR}; font: 700 16px/1 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); cursor: pointer; touch-action: manipulation; }
.pe26-a4-perilla[data-apagada="1"] { background: ${FONDO}; color: ${INK}; }
.pe26-a4-leyenda { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; justify-content: center; }
.pe26-a4-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px 4px 6px; border-radius: 999px; border: 1px solid ${BORDE}; font: 600 13px/18px var(--planck-font-sans, system-ui, sans-serif); color: ${INK_2}; }
.pe26-a4-chip[data-activa="1"] { border-color: var(--rama); color: ${INK}; background: ${SUPERFICIE_2}; }
.pe26-a4-consola { display: grid; grid-template-columns: 1fr; justify-items: center; }
.pe26-a4-medidor { width: 100%; max-width: 260px; display: block; }
.pe26-a4-altavoz { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 52px; font: 600 14px/18px var(--planck-font-sans, system-ui, sans-serif); }
.pe26-a4-altavoz svg { transition: transform 280ms cubic-bezier(.3,.9,.4,1); transform-origin: center; }
.pe26-a4-sect > :nth-child(-n+3) { grid-column: span 2; }
.pe26-a4-sect > :nth-child(n+4) { grid-column: span 3; }
.pe26-a4-sect { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; margin-top: 8px; }
.pe26-a4-sector { display: flex; flex-direction: column; align-items: center; gap: 4px; min-height: 64px; padding: 6px 2px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; cursor: pointer; touch-action: manipulation; font: 600 12px/14px var(--planck-font-sans, system-ui, sans-serif); text-align: center; min-width: 0; }
.pe26-a4-sector[aria-pressed="true"] { border-color: ${INK}; background: ${SUPERFICIE_2}; }
@media (prefers-reduced-motion: reduce) { .pe26-a4-altavoz svg { transition: none; } }
`;

function Medidor({ Y }) {
  const y = useAnimado(Y);
  const f = Math.max(0, Math.min(1, y / Y_TOPE));
  const ang = Math.PI * (1 - f);
  const cx = 110, cy = 104, r = 84;
  return (
    <svg className="pe26-a4-medidor" viewBox="0 0 220 130" role="img" aria-label={`Producción Y = ${fmtEntero(Y)}`} data-aguja-y={Math.round(Y)}>
      <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={BORDE} strokeWidth="10" strokeLinecap="round" />
      <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r * Math.cos(ang)} ${cy - r * Math.sin(ang)}`} fill="none" stroke={INK_2} strokeWidth="10" strokeLinecap="round" />
      <path d={`M${cx} ${cy} L${cx + (r - 14) * Math.cos(ang)} ${cy - (r - 14) * Math.sin(ang)}`} stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="7" fill={INK} />
      <text x={cx} y={cy - 26} textAnchor="middle" fontSize="15" fontWeight="700" fill={INK}>Y</text>
      <text x={cx} y={cy + 24} textAnchor="middle" fontSize="18" fontWeight="600" fill={INK} className="da26-mono">{fmtEntero(Y)}</text>
    </svg>
  );
}

function Altavoz({ m }) {
  const esc = Math.max(0.6, Math.min(1.8, m / multiplicador(BASE)));
  return (
    <div className="pe26-a4-altavoz" data-multiplicador={m.toFixed(3)}>
      <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" style={{ width: 36, height: 36, transform: `scale(${esc})` }}>
        <g fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
          <path d="M5 14h6l8-7v22l-8-7H5Z" fill={SUPERFICIE_2} /><path d="M24 12c2 2 2 10 0 12M28 8c4 4 4 16 0 20" />
        </g>
      </svg>
      <span>{A4.multiplicador}</span>
      <span className="da26-mono" style={{ fontSize: 16 }}>{fmtDecimal(m, 2)}</span>
    </div>
  );
}

export default function A4Perillas({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [abierta, setAbierta] = useState(null);
  const [perilla, setPerilla] = useState(null);
  const [v, setV] = useState({ G: BASE.G, i: BASE.i, XN: BASE.XN, t: BASE.t });
  const [sector, setSector] = useState(new Set());
  const p = modelo(paso >= 3 ? v : { ...v, t: BASE.t });
  const Y = produccion(p);
  const ramasActivas = perilla ? PERILLAS[perilla] : [];

  let figura;
  let controles = null;
  if (paso === 0) {
    figura = (
      <div className="pe26-a4-ramas">
        {ORDEN_RAMAS.map((r) => (
          <button key={r} type="button" className="pe26-a4-esp" data-rama={r} aria-expanded={abierta === r} style={{ "--rama": colorRama(r) }} onClick={() => setAbierta(abierta === r ? null : r)}>
            <span className="pe26-a4-esp-cab"><IconoRama id={r} size={28} /><span>{RAMAS[r].nombre}</span></span>
            {abierta === r && (
              <ul className="pe26-a4-herr da26-entra" data-herramientas={r}>
                {HERRAMIENTAS[r].map((h) => <li key={h}>{h}</li>)}
              </ul>
            )}
          </button>
        ))}
      </div>
    );
  } else if (paso === 1) {
    const K = (t, txt = t) => (
      <button type="button" className="pe26-a4-perilla" data-perilla={t} data-apagada={perilla && perilla !== t ? "1" : "0"}
        style={{ "--rama": colorRama(PERILLAS[t][0]) }} aria-pressed={perilla === t}
        aria-label={`${txt}: ${PERILLAS[t].map((r) => RAMAS[r].largo).join(" y ")}`} onClick={() => setPerilla(perilla === t ? null : t)}>{txt}</button>
    );
    figura = (
      <>
        <div className="pe26-a4-ec" aria-label="DA = C̄ + c(Y + TR − tY) + Ī − b·i + G + XN">
          <span className="pe26-a4-tok">DA =</span><span className="pe26-a4-tok">C̄ + c(Y +</span>{K("TR")}<span className="pe26-a4-tok">−</span>{K("t")}<span className="pe26-a4-tok">Y)</span>
          <span className="pe26-a4-tok">+ Ī − b·</span>{K("i")}<span className="pe26-a4-tok">+</span>{K("G")}<span className="pe26-a4-tok">+</span>{K("XN")}
        </div>
        <div className="pe26-a4-leyenda" data-leyenda>
          {ORDEN_RAMAS.map((r) => (
            <span key={r} className="pe26-a4-chip" data-chip-rama={r} data-activa={ramasActivas.includes(r) ? "1" : "0"} style={{ "--rama": colorRama(r) }}>
              <IconoRama id={r} size={20} />{RAMAS[r].nombre}
            </span>
          ))}
        </div>
      </>
    );
  } else if (paso === 2 || paso === 3) {
    figura = (
      <div className="pe26-a4-consola">
        <Medidor Y={Y} />
        {paso === 3 && <Altavoz m={multiplicador(p)} />}
      </div>
    );
    controles = (
      <>
        <Deslizador id="G" etiqueta="G · gasto público (fiscal)" min={100} max={400} paso={10} valor={v.G} onCambio={(x) => setV({ ...v, G: x })} formato={fmtEntero} extremos={["100", "400"]} colorRelleno={colorRama("fiscal")} />
        <Deslizador id="i" etiqueta="i · tasa de interés (monetaria)" min={2} max={14} paso={1} valor={v.i} onCambio={(x) => setV({ ...v, i: x })} formato={(x) => `${x} %`} extremos={["2 %", "14 %"]} colorRelleno={colorRama("monetaria")} />
        <Deslizador id="XN" etiqueta="XN · exportaciones netas (cambiaria y comercial)" min={-50} max={150} paso={10} valor={v.XN} onCambio={(x) => setV({ ...v, XN: x })} formato={fmtEntero} extremos={["−50", "150"]} colorRelleno={colorRama("cambiaria")} />
        {paso === 3 && (
          <Deslizador id="t" etiqueta="t · impuesto sobre la renta (fiscal)" min={0} max={40} paso={1} valor={Math.round(v.t * 100)} onCambio={(x) => setV({ ...v, t: x / 100 })} formato={(x) => `${x} %`} extremos={["0 %", "40 %"]} colorRelleno={colorRama("fiscal")} />
        )}
      </>
    );
  } else {
    figura = (
      <div className="pe26-a4-consola">
        <Medidor Y={Y} />
        <div className="pe26-a4-sect" style={{ width: "100%" }} role="group" aria-label="Políticas sectoriales">
          {SECTORES.map((s) => (
            <button key={s.id} type="button" className="pe26-a4-sector" data-sector={s.id} aria-pressed={sector.has(s.id)} aria-label={s.nombre} onClick={() => setSector((a) => new Set(a).add(s.id))}>
              <IconoSector id={s.id} size={26} />
              {sector.has(s.id) && <span className="da26-entra">{s.nombre}</span>}
            </button>
          ))}
        </div>
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
      controles={controles}
      onSiguiente={siguiente}
      onAnterior={anterior}
      onTerminar={() => onTerminar?.()}
    />
  );
}
