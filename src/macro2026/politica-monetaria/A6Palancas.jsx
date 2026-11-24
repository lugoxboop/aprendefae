/*
 * A6 · Tres palancas (pm26-a6-palancas, Aprender).
 * Especificación de Gen, t4 §2 A6.
 * P1 la lupa (objeto del kit) en la cara Naturaleza: en el lente, la
 * ventanilla y la cascada en miniatura. P2 Objetivos: termómetro y flecha de
 * crecimiento (objetos del kit). P3 el tablero, con la autoridad económica
 * (panda, pose «timón», 120 px): tocar el nombre de cada palanca dice a qué
 * proceso toca. P4 las tres en «baja» encienden «Expansiva»; P5 las tres en
 * «sube», «Contraccionista». P6 la ecuación de T1 con −b·i en el tono
 * monetario: la palanca de la tasa mueve i y la DA. P7 nueve impactos
 * alrededor de la escena «autoridad-empresario»; tocar cada uno dice su nombre.
 */
import { useState } from "react";
import { BORDE, FONDO, INK, INK_2, TINTA_SOBRE_COLOR } from "../comun/colores-da.js";
import { MarcoAprender, usePasos } from "../comun/ui.jsx";
import { Objeto } from "../comun/kit.jsx";
import { EscenaMascotas, MascotaRol } from "../comun/mascotas.jsx";
import { BASE, fmtEntero, modelo, produccion } from "../comun/modelo-da.js";
import { Cascada, CSS_PM, Letrero, MONETARIA, Tablero, medidaDe } from "./comun-pm.jsx";
import { A6, APRENDER, PALANCAS, ESCENAS } from "./textos.js";

export const ID = "pm26-a6-palancas";
const TEXTOS = APRENDER[ID];
const IGUAL = { tasa: "igual", tes: "igual", encaje: "igual" };
/* La palanca de la tasa mueve i de T1 (8 %) un punto y medio arriba o abajo. */
export const iDe = (pos) => BASE.i + (pos === "sube" ? 1.5 : pos === "baja" ? -1.5 : 0);

const CSS = `
.pm26-a6-proceso { margin: 8px 0 0; min-height: 44px; padding: 8px 12px; border-radius: 10px; border: 1px solid ${BORDE}; background: ${FONDO}; font: 600 15px/1.3 var(--planck-font-sans, system-ui, sans-serif); }
.pm26-a6-ec { display: flex; flex-wrap: wrap; justify-content: center; gap: 2px 4px; padding: 10px 6px; border-radius: 12px; border: 1px solid ${BORDE}; background: ${FONDO}; font: 600 16px/1.3 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); color: ${INK_2}; }
.pm26-a6-ec b { color: ${TINTA_SOBRE_COLOR}; background: ${MONETARIA}; border-radius: 6px; padding: 0 4px; }
.pm26-a6-impactos { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.pm26-a6-imp { display: grid; justify-items: center; gap: 2px; min-height: 72px; padding: 4px 2px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; font: 600 12px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; }
.pm26-a6-imp[aria-pressed="true"] { border-color: ${MONETARIA}; }
`;

export default function A6Palancas({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [pos, setPos] = useState(IGUAL);
  const [proceso, setProceso] = useState(null);
  const [vistas, setVistas] = useState(new Set());
  const [impacto, setImpacto] = useState(null);
  const [impactos, setImpactos] = useState(new Set());
  const [tasa, setTasa] = useState("igual");
  const [antes, setAntes] = useState(paso);
  if (antes !== paso) { setAntes(paso); setPos(IGUAL); }

  let figura;
  if (paso === 0) {
    figura = (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Objeto id="lupa" alto={120} />
        <div style={{ display: "grid", gap: 6, justifyItems: "center", minWidth: 0 }}>
          <span className="pm26-a6-proceso" style={{ margin: 0, minHeight: 0, padding: "4px 10px" }} data-cara="naturaleza">{A6.caras.naturaleza}</span>
          <Objeto id="banco-central" alto={56} />
          <div style={{ width: 150 }}><Cascada encaje={20} visibles={4} mini /></div>
        </div>
      </div>
    );
  } else if (paso === 1) {
    figura = (
      <div style={{ display: "flex", justifyContent: "center", gap: 28 }} data-cara="objetivos">
        <div style={{ display: "grid", justifyItems: "center", gap: 4 }}><Objeto id="termometro" alto={110} /><span>{A6.precios}</span></div>
        <div style={{ display: "grid", justifyItems: "center", gap: 4 }}><Objeto id="flecha-arriba" alto={110} /><span>{A6.crecimiento}</span></div>
      </div>
    );
  } else if (paso <= 4) {
    figura = (
      <div>
        {paso === 2 && <div style={{ display: "grid", placeItems: "center", marginBottom: 6 }}><MascotaRol id="autoridad-economica" pose="timon" alto={120} /></div>}
        {paso >= 3 && <Letrero pos={pos} />}
        <Tablero pos={pos} onCambio={setPos} bloqueado={paso === 2}
          onNombre={paso === 2 ? (id) => { setProceso(id); setVistas((v) => new Set(v).add(id)); } : null} />
        {paso === 2 && (
          <p className="pm26-a6-proceso" aria-live="polite" data-proceso={proceso ?? ""}>
            {proceso ? `${PALANCAS.find((p) => p.id === proceso).nombre}: ${A6.proceso} ${PALANCAS.find((p) => p.id === proceso).proceso}.` : " "}
          </p>
        )}
      </div>
    );
  } else if (paso === 5) {
    const Y0 = produccion(modelo());
    const Y = produccion(modelo({ i: iDe(tasa) }));
    figura = (
      <div>
        <p className="pm26-a6-ec" data-ecuacion>
          <span>DA = C̄ + c(Y + TR − tY) + Ī</span><b data-termino-i>−b·i</b><span>+ G + XN</span>
        </p>
        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          <div className="pm26-palanca" data-palanca="tasa">
            <span className="pm26-palanca-nombre" style={{ display: "grid", placeItems: "center", minHeight: 0 }}>{PALANCAS[0].nombre}</span>
            <div role="radiogroup" aria-label={PALANCAS[0].nombre} style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 4 }}>
              {["sube", "igual", "baja"].map((x) => (
                <button key={x} type="button" role="radio" aria-checked={tasa === x} className="pm26-pos" data-pos={x} onClick={() => setTasa(x)}>
                  {x === "sube" ? "↑" : x === "baja" ? "↓" : "="} {PALANCAS[0].posiciones[x]}
                </button>
              ))}
            </div>
          </div>
          <div className="pm26-contador" style={{ display: "grid", gap: 2, textAlign: "center" }} data-y-da={Math.round(Y)}>
            <span>i = {iDe(tasa)} %</span>
            <b className="da26-mono">Y {fmtEntero(Y)} {Y > Y0 ? "↑" : Y < Y0 ? "↓" : ""}</b>
          </div>
        </div>
      </div>
    );
  } else {
    const it = A6.impactos.find((x) => x.id === impacto);
    figura = (
      <div>
        <div className="pm26-a6-impactos" role="group" aria-label="Los impactos">
          {A6.impactos.slice(0, 3).map((x) => <Imp key={x.id} x={x} impacto={impacto} tocar={(id) => { setImpacto(id); setImpactos((s) => new Set(s).add(id)); }} />)}
        </div>
        <div style={{ display: "grid", placeItems: "center", margin: "6px 0" }}><EscenaMascotas id="autoridad-empresario" alto={120} perezosa={false} /></div>
        <div className="pm26-a6-impactos">
          {A6.impactos.slice(3).map((x) => <Imp key={x.id} x={x} impacto={impacto} tocar={(id) => { setImpacto(id); setImpactos((s) => new Set(s).add(id)); }} />)}
        </div>
        <p className="pm26-a6-proceso" aria-live="polite" data-impacto-nombre={impacto ?? ""}>{it ? it.nombre : " "}</p>
      </div>
    );
  }

  const puede = paso === 2 ? vistas.size === 3
    : paso === 3 ? PALANCAS.every((p) => pos[p.id] === "baja") && medidaDe(pos) === "expansiva"
      : paso === 4 ? PALANCAS.every((p) => pos[p.id] === "sube")
        : paso === 5 ? tasa !== "igual"
          : paso === 6 ? impactos.size >= 3 : true;
  return (
    <MarcoAprender escena={ESCENAS[ID]} id={ID} paso={paso} total={TEXTOS.length} texto={TEXTOS[paso]}
      figura={<><style>{CSS_PM}{CSS}</style>{figura}</>}
      puedeSeguir={puede} onSiguiente={siguiente} onAnterior={anterior} onTerminar={() => onTerminar?.()} />
  );
}

function Imp({ x, impacto, tocar }) {
  return (
    <button type="button" className="pm26-a6-imp" aria-pressed={impacto === x.id} data-impacto={x.id} aria-label={x.nombre} onClick={() => tocar(x.id)}>
      <Objeto id={x.objeto} alto={40} />
      <span aria-hidden="true">{impacto === x.id ? x.nombre : ""}</span>
    </button>
  );
}
