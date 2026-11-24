/*
 * A1 · La lupa de seis caras (pf26-a1-lupa, Aprender).
 * Especificación de Gen, t3 §2 A1. Una lupa con lente hexagonal. Cada cara es
 * un botón, y al tocarla el lente «enfoca» un dibujo distinto de la política
 * fiscal. P1 deja tocar todas; de P2 a P6 el lente abre en la cara de la
 * pantalla, y las demás se pueden seguir tocando.
 */
import { useEffect, useState } from "react";
import { BORDE, FONDO, INK, INK_2, SUPERFICIE_2 } from "../comun/colores-da.js";
import { MarcoAprender, usePasos } from "../comun/ui.jsx";
import { Carrito } from "../comun/carrito.jsx";
import { Objeto } from "../comun/kit.jsx";
import { colorRama } from "../comun/ramas.js";
import { IconoTrazo } from "../comun/iconos-pf.jsx";
import { APRENDER, A1, CARAS_A1, ESCENAS } from "./textos.js";

export const ID = "pf26-a1-lupa";
const TEXTOS = APRENDER[ID];
const CARA_DE_PASO = [null, "naturaleza", "mercado", "objetivos", "instrumentos", "medidas"];
const ICONO_OBJETIVO = ["asignacion", "redistribucion", "estabilizacion", "crecimiento", "ambiente"];
const FISCAL = colorRama("fiscal");

const CSS = `
.pf26-a1 { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.pf26-a1-lupa { position: relative; width: 220px; height: 236px; }
.pf26-a1-marco { position: absolute; inset: 0 0 16px 0; }
.pf26-a1-lente { position: absolute; left: 14px; top: 10px; width: 192px; height: 192px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 18px; text-align: center; font: 600 13px/1.25 var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; }
.pf26-a1-caras { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; width: 100%; }
.pf26-a1-cara { min-height: 44px; min-width: 0; padding: 4px 2px; border-radius: 10px; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; font: 600 12.5px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; transition: background 280ms cubic-bezier(.3,.9,.4,1), border-color 280ms cubic-bezier(.3,.9,.4,1); }
.pf26-a1-cara[aria-pressed="true"] { border-color: ${INK}; background: ${SUPERFICIE_2}; }
.pf26-a1-cara[data-vista="1"]::after { content: " ✓"; color: ${INK_2}; }
.pf26-a1-flechas { display: flex; gap: 6px; }
.pf26-a1-flecha { display: flex; flex-direction: column; align-items: center; font: 600 12px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
.pf26-a1-objs { display: grid; grid-template-columns: repeat(3, 44px); gap: 4px; justify-content: center; }
.pf26-a1-obj { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 50%; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; cursor: pointer; touch-action: manipulation; padding: 0; }
.pf26-a1-obj[aria-pressed="true"] { border-color: ${INK}; background: ${SUPERFICIE_2}; }
.pf26-a1-asa { display: block; width: 100%; padding: 4px 8px; border-radius: 999px; border: 2px solid ${FISCAL}; font: 600 13px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
.pf26-a1-medida { display: flex; align-items: center; gap: 6px; font: 600 13px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
`;

function Lente({ cara, objetivo, setObjetivo }) {
  if (cara === "naturaleza") {
    return (
      <>
        <Objeto id="alcancia" alto={56} nombre="Alcancía del Estado" />
        <div className="pf26-a1-flechas">
          {A1.flechas.map((f, k) => (
            <span key={f} className="pf26-a1-flecha" data-flecha={f}>
              <span aria-hidden="true" style={{ fontSize: 18 }}>{["↓", "↑", "↻"][k]}</span>{f}
            </span>
          ))}
        </div>
      </>
    );
  }
  if (cara === "mercado") {
    return <div style={{ width: 160 }}><Carrito valores={{ C: 300, I: 120, G: 200, XN: 50 }} alto={130} escala={0.13} /></div>;
  }
  if (cara === "objetivos") {
    return (
      <>
        <div className="pf26-a1-objs" role="group" aria-label="Objetivos">
          {A1.objetivos.map((o, k) => (
            <button key={o} type="button" className="pf26-a1-obj" data-objetivo={k} aria-pressed={objetivo === k} aria-label={o} onClick={() => setObjetivo(k)}>
              <IconoTrazo id={ICONO_OBJETIVO[k]} size={24} />
            </button>
          ))}
        </div>
        <span data-objetivo-nombre style={{ minHeight: 16 }}>{objetivo != null ? A1.objetivos[objetivo] : ""}</span>
      </>
    );
  }
  if (cara === "instrumentos") {
    return A1.instrumentos.map((i) => <span key={i} className="pf26-a1-asa" data-instrumento>{i}</span>);
  }
  if (cara === "medidas") {
    return (
      <>
        <span className="pf26-a1-medida"><span aria-hidden="true" style={{ fontSize: 22 }}>⬆</span>{A1.expansiva}</span>
        <div style={{ width: 120 }}><Carrito valores={{ C: 300, I: 120, G: 200, XN: 50 }} alto={90} escala={0.09} /></div>
        <span className="pf26-a1-medida"><span aria-hidden="true" style={{ fontSize: 22 }}>⬇</span>{A1.contraccionista}</span>
      </>
    );
  }
  if (cara === "impactos") return <span data-impactos>{A1.impactos}</span>;
  return null;
}

export default function A1Lupa({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [cara, setCara] = useState(null);
  const [vistas, setVistas] = useState(new Set());
  const [objetivo, setObjetivo] = useState(null);
  useEffect(() => { setCara(CARA_DE_PASO[paso]); setObjetivo(null); }, [paso]);
  useEffect(() => { if (cara) setVistas((v) => new Set(v).add(cara)); }, [cara]);

  /* El hexágono del lente, con su mango. */
  const hex = Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k - Math.PI / 2;
    return `${110 + 100 * Math.cos(a)},${106 + 100 * Math.sin(a)}`;
  }).join(" ");

  const figura = (
    <div className="pf26-a1">
      <div className="pf26-a1-lupa" data-lupa data-cara={cara ?? ""}>
        <svg className="pf26-a1-marco" viewBox="0 0 220 236" style={{ width: 220, height: 236 }} aria-hidden="true">
          <path d="M160 190 L196 230" stroke={INK_2} strokeWidth="12" strokeLinecap="round" />
          <polygon points={hex} fill={FONDO} stroke={cara ? INK : INK_2} strokeWidth="4" style={{ transition: "stroke 280ms" }} />
        </svg>
        <div className="pf26-a1-lente da26-entra" key={cara ?? "nada"} data-lente>
          <Lente cara={cara} objetivo={objetivo} setObjetivo={setObjetivo} />
        </div>
      </div>
      <div className="pf26-a1-caras" role="group" aria-label="Las seis caras">
        {CARAS_A1.map((c) => (
          <button key={c.id} type="button" className="pf26-a1-cara" data-cara={c.id} aria-pressed={cara === c.id} data-vista={vistas.has(c.id) ? "1" : "0"} onClick={() => setCara(c.id)}>
            {c.nombre}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <MarcoAprender escena={ESCENAS[ID]}
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
