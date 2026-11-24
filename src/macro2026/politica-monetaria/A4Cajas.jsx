/*
 * A4 · Bóveda y cajas (pm26-a4-cajas, Aprender).
 * Especificación de Gen, t4 §2 A4. A la izquierda, la bóveda del BanRep
 * (objeto del kit) con la base monetaria, APARTE; a la derecha, M1 ⊂ M2 ⊂ M3
 * como cajas anidadas (§0: la BM no se dibuja dentro de M1).
 * P5 las cajas pasan a escala real: el ÁREA de cada cuadrado es proporcional a
 * su cifra de agosto de 2026 (lado ∝ √cifra); tocar cada una muestra su
 * cifra en billones. P6 la lista de depósitos con la flecha «más líquido».
 */
import { useState } from "react";
import { BORDE, FONDO, INK, INK_2 } from "../comun/colores-da.js";
import { MarcoAprender, usePasos } from "../comun/ui.jsx";
import { Objeto } from "../comun/kit.jsx";
import { fmtDecimal } from "../comun/modelo-da.js";
import { MONETARIA } from "./comun-pm.jsx";
import { A4, APRENDER, ESCENAS } from "./textos.js";

export const ID = "pm26-a4-cajas";
const TEXTOS = APRENDER[ID];
export const billones = (milesDeMillones) => fmtDecimal(milesDeMillones / 1000, 1);
const LADO = 150;
export const ladoEscala = (cifra) => Math.round(LADO * Math.sqrt(cifra / A4.cifras.m3));

const CSS = `
.pm26-a4 { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; align-items: end; }
.pm26-a4-boveda { display: grid; justify-items: center; gap: 4px; font: 600 13px/1.2 var(--planck-font-sans, system-ui, sans-serif); text-align: center; }
.pm26-a4-pila { padding: 2px 8px; border-radius: 999px; border: 1px solid ${BORDE}; background: ${FONDO}; font: 600 12px/18px var(--planck-font-sans, system-ui, sans-serif); }
.pm26-caja { position: relative; display: flex; flex-direction: column; justify-content: flex-end; gap: 4px; padding: 22px 6px 6px; border: 2px solid ${INK_2}; border-radius: 10px; background: rgba(42,157,143,.08); color: ${INK}; font: 600 12px/1.25 var(--planck-font-sans, system-ui, sans-serif); text-align: left; }
.pm26-caja-nombre { position: absolute; top: 3px; left: 8px; font: 700 14px/16px var(--planck-font-sans, system-ui, sans-serif); }
.pm26-chip { display: inline-block; align-self: flex-start; min-height: 22px; padding: 2px 6px; border-radius: 6px; background: ${FONDO}; border: 1px solid ${BORDE}; font: 600 12px/18px var(--planck-font-sans, system-ui, sans-serif); }
.pm26-a4-escala { display: flex; align-items: flex-end; justify-content: center; gap: 12px; }
.pm26-a4-cuadro { position: relative; border: 2px solid ${INK_2}; border-radius: 6px; background: rgba(42,157,143,.10); color: ${INK}; }
.pm26-a4-cuadro > span { position: absolute; top: 2px; left: 6px; font: 700 14px/16px var(--planck-font-sans, system-ui, sans-serif); }
.pm26-a4-cifra { margin: 10px 0 0; min-height: 44px; padding: 8px 12px; border-radius: 10px; border: 1px solid ${BORDE}; background: ${FONDO}; font: 600 15px/1.3 var(--planck-font-sans, system-ui, sans-serif); text-align: center; }
.pm26-a4-lista { display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 4px 8px; }
.pm26-a4-lista li { list-style: none; padding: 8px 10px; border-radius: 10px; border: 1px solid ${BORDE}; background: ${FONDO}; font: 600 14px/1.25 var(--planck-font-sans, system-ui, sans-serif); }
`;

function Boveda({ llena }) {
  return (
    <div className="pm26-a4-boveda" data-boveda>
      <Objeto id="boveda" alto={84} nombre={A4.boveda} />
      <span>{A4.boveda}</span>
      {llena && <span className="pm26-a4-pila da26-entra">{A4.efectivo}</span>}
      {llena && <span className="pm26-a4-pila da26-entra" style={{ animationDelay: "120ms" }}>{A4.reservas}</span>}
    </div>
  );
}

function Anidadas({ hasta, onCuasi }) {
  const m1 = (
    <div className="pm26-caja da26-entra" data-caja="m1" style={{ borderColor: MONETARIA }}>
      <span className="pm26-caja-nombre">M1</span>
      <span className="pm26-chip">{A4.efectivo}</span>
      <span className="pm26-chip">{A4.corrientes}</span>
    </div>
  );
  if (hasta === 1) return m1;
  const m2 = (
    <div className="pm26-caja da26-entra" data-caja="m2">
      <span className="pm26-caja-nombre">M2</span>
      {m1}
      <button type="button" className="pm26-chip" style={{ minHeight: 44, cursor: "pointer", color: INK }} onClick={onCuasi} data-cuasi>{A4.cuasidineros}: {A4.cuasi}</button>
    </div>
  );
  if (hasta === 2) return m2;
  return (
    <div className="pm26-caja da26-entra" data-caja="m3">
      <span className="pm26-caja-nombre">M3</span>
      {m2}
      <span className="pm26-chip">{A4.otros}</span>
    </div>
  );
}

export default function A4Cajas({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [cuasi, setCuasi] = useState(false);
  const [cifra, setCifra] = useState(null);
  const [vistas, setVistas] = useState(new Set());
  const tocarCifra = (id) => { setCifra(id); setVistas((v) => new Set(v).add(id)); };

  let figura;
  if (paso <= 3) {
    figura = (
      <div>
        <div className="pm26-a4">
          <Boveda llena />
          <div>{paso >= 1 && <Anidadas hasta={paso} onCuasi={() => setCuasi(true)} />}</div>
        </div>
        {paso === 2 && cuasi && <p className="pm26-a4-cifra da26-entra" data-definicion-cuasi>{A4.defCuasi}</p>}
      </div>
    );
  } else if (paso === 4) {
    const cuadros = [["bm", "BM"], ["m1", "M1"], ["m2", "M2"], ["m3", "M3"]];
    figura = (
      <div>
        <div className="pm26-a4-escala" data-escala aria-hidden="true">
          <div className="pm26-a4-cuadro" data-cuadro="bm" style={{ width: ladoEscala(A4.cifras.bm), height: ladoEscala(A4.cifras.bm), borderColor: INK }}><span>BM</span></div>
          <div style={{ position: "relative", width: LADO, height: LADO }}>
            {cuadros.slice(1).reverse().map(([id, n]) => (
              <div key={id} className="pm26-a4-cuadro" data-cuadro={id}
                style={{ position: "absolute", left: 0, bottom: 0, width: ladoEscala(A4.cifras[id]), height: ladoEscala(A4.cifras[id]), borderColor: id === "m1" ? MONETARIA : INK_2, background: cifra === id ? "rgba(42,157,143,.28)" : undefined }}>
                <span style={id === "m2" ? { top: 18 } : undefined}>{n}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="da26-fila" style={{ justifyContent: "center", marginTop: 10 }} role="group" aria-label="Las cifras">
          {cuadros.map(([id, n]) => (
            <button key={id} type="button" className="da26-boton" aria-pressed={cifra === id} data-tocar-cifra={id} onClick={() => tocarCifra(id)}>{n}</button>
          ))}
        </div>
        <p className="pm26-a4-cifra" aria-live="polite" data-cifra={cifra ?? ""}>
          {cifra ? `${cifra === "bm" ? "BM" : cifra.toUpperCase()}: ${billones(A4.cifras[cifra])} billones` : " "}
        </p>
      </div>
    );
  } else {
    figura = (
      <ol className="pm26-a4-lista" style={{ margin: 0, padding: 0 }} data-lista-liquidez>
        <li style={{ gridRow: `1 / span ${A4.lista.length}`, padding: 0, border: 0, background: "none", display: "grid", justifyItems: "center" }} aria-hidden="true">
          <svg viewBox="0 0 28 200" width="28" height="200" style={{ height: "100%" }} preserveAspectRatio="none"><path d="M14 196V8M6 16l8-10 8 10" stroke={MONETARIA} strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
        </li>
        {A4.lista.map((x, k) => (
          <li key={x} style={{ gridColumn: 2 }}>{x}{k === 1 && <span className="pm26-chip" style={{ marginLeft: 8, borderColor: MONETARIA }} data-mas-liquido>{A4.liquido}</span>}</li>
        ))}
      </ol>
    );
  }

  const puede = paso === 2 ? cuasi : paso === 4 ? vistas.size === 4 : true;
  return (
    <MarcoAprender escena={ESCENAS[ID]} id={ID} paso={paso} total={TEXTOS.length} texto={TEXTOS[paso]}
      figura={<><style>{CSS}</style>{figura}</>}
      puedeSeguir={puede} onSiguiente={siguiente} onAnterior={anterior} onTerminar={() => onTerminar?.()} />
  );
}
