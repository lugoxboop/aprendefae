/*
 * A1 · La balanza del dólar (pc26-a1-balanza, Aprender).
 * Especificación de Gen, t5 §2 A1. Una balanza de mostrador: USD 1 en un
 * plato y pilas de pesos de $100 en el otro. P1 las noticias la empujan;
 * P3 y P4 el deslizador del tc (3.500–5.000, paso 50) hasta 4.500 y 3.800;
 * P5 los dos espejos y la escena exportadora-importadora (cada movimiento
 * tiene dos caras: a una le sirve y a la otra no).
 */
import { useState } from "react";
import { BORDE, FONDO, INK } from "../comun/colores-da.js";
import { DOLAR, PESO } from "../comun/monedas.js";
import { Deslizador, MarcoAprender, usePasos } from "../comun/ui.jsx";
import { EscenaMascotas } from "../comun/mascotas.jsx";
import { Balanza, CAMBIARIA, CSS_PC, fmtTc } from "./comun-pc.jsx";
import { A1, APRENDER } from "./textos.js";

export const ID = "pc26-a1-balanza";
const TEXTOS = APRENDER[ID];

const CSS = `
.pc26-a1-noticias { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; margin-bottom: 8px; }
.pc26-a1-noticia { min-height: 48px; border-radius: 12px; border: 2px dashed ${BORDE}; background: ${FONDO}; color: ${INK}; font: 600 15px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.pc26-a1-noticia[aria-pressed="true"] { border-style: solid; border-color: ${CAMBIARIA}; }
.pc26-a1-espejos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 8px; }
.pc26-a1-espejo { display: grid; gap: 4px; justify-items: center; padding: 10px 6px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${FONDO}; font: 700 17px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
`;

export default function A1Balanza({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [tocadas, setTocadas] = useState(new Set());
  const [empuje, setEmpuje] = useState(0);
  const [tc, setTc] = useState(A1.base);

  const tocar = (n) => { setTocadas((s) => new Set(s).add(n.id)); setEmpuje(n.empuje); };
  const tcPantalla = paso <= 1 ? A1.base : paso === 4 ? A1.base : tc;
  const rotulos = paso === 2 && tc > A1.base ? { peso: A1.pesoDeprecia, dolar: A1.dolarAprecia }
    : paso === 3 && tc < A1.base ? { peso: A1.pesoAprecia, dolar: A1.dolarDeprecia } : null;

  let figura;
  if (paso === 4) {
    figura = (
      <div>
        <div style={{ display: "grid", placeItems: "center" }}><EscenaMascotas id="exportadora-importadora" alto={150} perezosa={false} /></div>
        <div className="pc26-a1-espejos" data-espejos>
          {A1.espejos.map(([p, d], k) => (
            <div key={k} className="pc26-a1-espejo" data-espejo={k}>
              <span style={{ color: PESO }}>$ {p}</span>
              <span aria-hidden="true">=</span>
              <span style={{ color: DOLAR }}>USD {d}</span>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    figura = (
      <div>
        {paso === 0 && (
          <div className="pc26-a1-noticias" role="group" aria-label="Noticias">
            {A1.noticias.map((n) => (
              <button key={n.id} type="button" className="pc26-a1-noticia da26-entra" aria-pressed={tocadas.has(n.id)} data-noticia={n.id} onClick={() => tocar(n)}>{n.texto}</button>
            ))}
          </div>
        )}
        <Balanza tc={tcPantalla} inclina={paso === 0 ? empuje : 0} rotulos={rotulos} />
      </div>
    );
  }

  let controles = null;
  if (paso === 2 || paso === 3) {
    controles = <Deslizador id="tc" etiqueta={A1.tc} min={A1.min} max={A1.max} paso={A1.paso} valor={tc} onCambio={setTc}
      formato={(x) => `$${fmtTc(x)}`} extremos={[`$${fmtTc(A1.min)}`, `$${fmtTc(A1.max)}`]} colorRelleno={CAMBIARIA} />;
  }

  const puede = paso === 0 ? tocadas.size === A1.noticias.length : paso === 2 ? tc >= A1.deprecia : paso === 3 ? tc <= A1.aprecia : true;
  return (
    <MarcoAprender id={ID} paso={paso} total={TEXTOS.length} texto={TEXTOS[paso]}
      figura={<><style>{CSS_PC}{CSS}</style>{figura}</>} controles={controles}
      puedeSeguir={puede} onSiguiente={siguiente} onAnterior={anterior} onTerminar={() => onTerminar?.()} />
  );
}
