/*
 * A2 · La subasta de dólares (pc26-a2-subasta, Aprender).
 * Especificación de Gen, t5 §2 A2. P1 dos filas de mascotas (nunca
 * personas), cada una con su rol escrito: las que traen dólares y las que
 * los piden; tocar cada una dice si trae o pide. P2 las curvas y su cruce.
 * P3 «Llegan inversionistas»: Od a la derecha, tc baja. P4 «Importamos
 * más»: Dd a la derecha, tc sube.
 */
import { useState } from "react";
import { BORDE, FONDO, INK } from "../comun/colores-da.js";
import { DOLAR } from "../comun/monedas.js";
import { Boton, MarcoAprender, usePasos } from "../comun/ui.jsx";
import { MascotaRol } from "../comun/mascotas.jsx";
import { CAMBIARIA, CSS_PC, GraficaDivisas } from "./comun-pc.jsx";
import { A2, APRENDER, FILAS_A2, MODELO_DIVISAS } from "./textos.js";

export const ID = "pc26-a2-subasta";
const TEXTOS = APRENDER[ID];

const CSS = `
.pc26-a2-filas { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.pc26-a2-fila { display: grid; gap: 6px; align-content: start; padding: 6px 4px; border-radius: 12px; border: 1px solid ${BORDE}; background: ${FONDO}; }
.pc26-a2-titulo { text-align: center; font: 700 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
.pc26-a2-quien { display: grid; justify-items: center; gap: 2px; padding: 4px; border: 2px solid transparent; border-radius: 12px; background: none; color: ${INK}; cursor: pointer; touch-action: manipulation; }
.pc26-a2-quien[aria-pressed="true"] { border-color: ${INK}; }
.pc26-a2-dice { min-height: 20px; font: 700 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
.pc26-a2-llega { display: flex; align-items: flex-end; justify-content: center; gap: 8px; margin-top: 6px; }
`;

function Quien({ q, lado, visto, onTocar }) {
  return (
    <button type="button" className="pc26-a2-quien" aria-pressed={visto} data-quien={q.id} onClick={onTocar}
      aria-label={`${q.rol}${visto ? `: ${lado === "oferta" ? A2.trae : A2.pide}` : ""}`}>
      <MascotaRol id={q.mascota} pose={q.pose} alto={120} rotulo={false} />
      <span style={{ fontSize: 13, fontWeight: 600, textAlign: "center" }}>{q.rol}</span>
      <span className="pc26-a2-dice" style={{ color: lado === "oferta" ? DOLAR : CAMBIARIA }} data-dice={visto ? lado : ""}>{visto ? (lado === "oferta" ? A2.trae : A2.pide) : " "}</span>
    </button>
  );
}

export default function A2Subasta({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [vistos, setVistos] = useState(new Set());
  const [llegan, setLlegan] = useState(false);
  const [importan, setImportan] = useState(false);
  const { corre } = MODELO_DIVISAS;

  let figura;
  if (paso === 0) {
    figura = (
      <div className="pc26-a2-filas">
        {["oferta", "demanda"].map((lado) => (
          <div key={lado} className="pc26-a2-fila" data-fila={lado}>
            <span className="pc26-a2-titulo" style={{ color: lado === "oferta" ? DOLAR : CAMBIARIA }}>{lado === "oferta" ? A2.filaOferta : A2.filaDemanda}</span>
            {FILAS_A2[lado].map((q) => <Quien key={q.id} q={q} lado={lado} visto={vistos.has(q.id)} onTocar={() => setVistos((s) => new Set(s).add(q.id))} />)}
          </div>
        ))}
      </div>
    );
  } else {
    const so = paso === 2 && llegan ? corre : 0;
    const sd = paso === 3 && importan ? corre : 0;
    const movio = (paso === 2 && llegan) || (paso === 3 && importan);
    figura = (
      <div>
        <GraficaDivisas so={so} sd={sd} fantasma={movio ? { so: 0, sd: 0 } : null} flecha={movio ? (paso === 2 ? "baja" : "sube") : null} />
        {paso === 2 && llegan && <div className="pc26-a2-llega da26-entra" data-llega="inversionista"><MascotaRol id="inversionista" pose="monedas" alto={120} /></div>}
        {paso === 3 && importan && <div className="pc26-a2-llega da26-entra" data-llega="importadora"><MascotaRol id="importadora-celulares" pose="contenedor" alto={120} /></div>}
      </div>
    );
  }

  let controles = null;
  if (paso === 2) controles = <Boton onClick={() => setLlegan(true)} disabled={llegan} data-llegan>{A2.llegan}</Boton>;
  if (paso === 3) controles = <Boton onClick={() => setImportan(true)} disabled={importan} data-importamos>{A2.importamos}</Boton>;

  const total = FILAS_A2.oferta.length + FILAS_A2.demanda.length;
  const puede = paso === 0 ? vistos.size === total : paso === 2 ? llegan : paso === 3 ? importan : true;
  return (
    <MarcoAprender id={ID} paso={paso} total={TEXTOS.length} texto={TEXTOS[paso]}
      figura={<><style>{CSS_PC}{CSS}</style>{figura}</>} controles={controles}
      puedeSeguir={puede} onSiguiente={siguiente} onAnterior={anterior} onTerminar={() => onTerminar?.()} />
  );
}
