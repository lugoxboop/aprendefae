/*
 * A1 · Lo que llevas en la billetera (pm26-a1-billetera, Aprender).
 * Especificación de Gen, t4 §2 A1. P1 la billetera se abre al tocarla y salen
 * billetes, cheque, débito, crédito y CDT. P2 cada cosa dice de dónde sale su
 * dinero (hay que tocarlas todas). P3 la tarjeta de crédito se aparta con el
 * rótulo «préstamo». P4 el bolso tejido con billetes (sin país nombrado): al
 * tocarlo, la etiqueta «el papel vale más que el billete». P5 la aguja «tasa
 * de interés» conecta ahorro, crédito y capitales (objetos del kit).
 */
import { useState } from "react";
import { BORDE, FONDO, INK, INK_2, SUPERFICIE_2, TINTA_SOBRE_COLOR } from "../comun/colores-da.js";
import { MarcoAprender, usePasos } from "../comun/ui.jsx";
import { Objeto } from "../comun/kit.jsx";
import { MONETARIA } from "./comun-pm.jsx";
import { A1, APRENDER } from "./textos.js";

export const ID = "pm26-a1-billetera";
const TEXTOS = APRENDER[ID];

const CSS = `
.pm26-a1-cartera { display: block; margin: 0 auto; padding: 0; border: 0; background: none; cursor: pointer; min-height: 44px; }
.pm26-a1-cosas { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-top: 8px; }
.pm26-a1-cosa { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; min-height: 84px; padding: 6px 4px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; font: 600 13px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; transition: transform 280ms cubic-bezier(.3,.9,.4,1); }
.pm26-a1-cosa[aria-pressed="true"] { border-color: ${MONETARIA}; }
.pm26-a1-cosa[data-aparte="1"] { transform: translateY(10px); border-style: dashed; border-color: ${INK}; }
.pm26-a1-tarjeta { width: 52px; height: 34px; border-radius: 6px; border: 2px solid ${INK_2}; background: ${SUPERFICIE_2}; display: grid; place-items: center; font: 700 12px/1 var(--planck-font-mono, monospace); }
.pm26-a1-origen { margin: 8px 0 0; min-height: 44px; padding: 8px 12px; border-radius: 10px; border: 1px solid ${BORDE}; background: ${FONDO}; font: 600 15px/1.3 var(--planck-font-sans, system-ui, sans-serif); }
.pm26-a1-rotulo { display: inline-block; margin-top: 2px; padding: 2px 8px; border-radius: 999px; background: ${INK}; color: ${TINTA_SOBRE_COLOR}; font: 700 12px/16px var(--planck-font-sans, system-ui, sans-serif); }
.pm26-a1-bolso { display: flex; flex-direction: column; align-items: center; gap: 6px; margin: 0 auto; padding: 4px; border: 0; background: none; color: ${INK}; cursor: pointer; min-height: 44px; }
.pm26-a1-red { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; align-items: end; text-align: center; font: 600 13px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
`;

function Cartera({ abierta }) {
  return (
    <svg viewBox="0 0 200 120" style={{ width: 200, height: 120 }} aria-hidden="true">
      <rect x="20" y="40" width="160" height="70" rx="10" fill={SUPERFICIE_2} stroke={INK} strokeWidth="3" />
      <path d={abierta ? "M20 40L50 6h100l30 34" : "M20 40h160"} fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <rect x="150" y="62" width="30" height="22" rx="5" fill={FONDO} stroke={INK} strokeWidth="3" />
      <circle cx="162" cy="73" r="4" fill={MONETARIA} />
    </svg>
  );
}

function Icono({ cosa }) {
  if (cosa.objeto) return <Objeto id={cosa.objeto} alto={40} />;
  return <span className="pm26-a1-tarjeta" aria-hidden="true">{cosa.id === "cdt" ? "CDT" : cosa.id === "debito" ? "DÉB" : "CRÉD"}</span>;
}

export default function A1Billetera({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [abierta, setAbierta] = useState(false);
  const [tocada, setTocada] = useState(null);
  const [vistas, setVistas] = useState(new Set());
  const [bolso, setBolso] = useState(false);

  const tocar = (id) => { setTocada(id); setVistas((v) => new Set(v).add(id)); };
  const actual = A1.objetos.find((o) => o.id === tocada);

  let figura;
  if (paso <= 2) {
    figura = (
      <div>
        <button type="button" className="pm26-a1-cartera" onClick={() => setAbierta(true)} aria-label={A1.abrir} aria-expanded={abierta} data-billetera>
          <Cartera abierta={abierta} />
        </button>
        {abierta && (
          <div className="pm26-a1-cosas" role="group" aria-label="Lo que hay en la billetera">
            {A1.objetos.map((o, k) => (
              <button key={o.id} type="button" className="pm26-a1-cosa da26-entra" style={{ animationDelay: `${k * 60}ms` }} data-cosa={o.id}
                aria-pressed={paso === 1 && tocada === o.id} data-aparte={paso === 2 && o.id === "credito" ? "1" : "0"}
                disabled={paso !== 1} onClick={() => tocar(o.id)}>
                <Icono cosa={o} />
                <span>{o.nombre}</span>
                {paso === 2 && o.id === "credito" && <span className="pm26-a1-rotulo" data-rotulo-prestamo>{A1.prestamo}</span>}
              </button>
            ))}
          </div>
        )}
        {paso === 1 && <p className="pm26-a1-origen" aria-live="polite" data-origen={tocada ?? ""}>{actual ? `${actual.nombre}: ${actual.origen}.` : " "}</p>}
      </div>
    );
  } else if (paso === 3) {
    figura = (
      <button type="button" className="pm26-a1-bolso" onClick={() => setBolso(true)} aria-label={A1.tocarBolso} data-bolso>
        <svg viewBox="0 0 200 140" style={{ width: 200, height: 140 }} aria-hidden="true">
          <path d="M40 50h120l-10 84H50Z" fill={SUPERFICIE_2} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          {[60, 80, 100, 120, 140].map((x) => <path key={x} d={`M${x} 52l-6 80`} stroke={INK_2} strokeWidth="2" />)}
          {[70, 90, 110].map((y) => <path key={y} d={`M44 ${y}h112`} stroke={INK_2} strokeWidth="2" />)}
          <path d="M70 50c0-30 60-30 60 0" fill="none" stroke={INK} strokeWidth="3" />
        </svg>
        <Objeto id="billetes-alas" alto={56} style={{ marginTop: -70 }} />
        {bolso && <span className="pm26-a1-rotulo da26-entra" data-etiqueta-bolso style={{ fontSize: 14, marginTop: 8 }}>{A1.bolso}</span>}
      </button>
    );
  } else {
    figura = (
      <div>
        <div style={{ display: "grid", placeItems: "center", marginBottom: 8 }}>
          <span className="pm26-a1-rotulo" style={{ background: MONETARIA, fontSize: 14 }} data-aguja>{A1.aguja}</span>
        </div>
        <svg viewBox="0 0 300 40" style={{ width: "100%", height: 40, display: "block" }} aria-hidden="true">
          <path d="M150 4L50 36M150 4V36M150 4L250 36" stroke={MONETARIA} strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div className="pm26-a1-red">
          {A1.conexiones.map((c) => (
            <div key={c.id} data-conexion={c.id} style={{ display: "grid", justifyItems: "center", gap: 4 }}>
              <Objeto id={c.objeto} alto={56} />
              <span>{c.nombre}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const puede = paso === 0 ? abierta : paso === 1 ? vistas.size === A1.objetos.length : paso === 3 ? bolso : true;
  return (
    <MarcoAprender id={ID} paso={paso} total={TEXTOS.length} texto={TEXTOS[paso]}
      figura={<><style>{CSS}</style>{figura}</>}
      puedeSeguir={puede} onSiguiente={siguiente} onAnterior={anterior} onTerminar={() => onTerminar?.()} />
  );
}
