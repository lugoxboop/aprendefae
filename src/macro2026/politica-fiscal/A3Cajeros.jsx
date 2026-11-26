/*
 * A3 · Dos cajeros (pf26-a3-cajeros, Aprender).
 * Especificación de Gen, t3 §2 A3. Dos cajeros: el «directo» mira tu
 * billetera con una lupa; el «indirecto» solo pasa el producto por el lector
 * de código de barras. Directo e indirecto se distinguen por la FORMA de su
 * marca (lupa, código de barras) y su nombre escrito, nunca solo por color.
 *   P1 cajero directo: tres billeteras, cobro 1, 2 y 4 (tarifa progresiva);
 *   P2 cajero indirecto: las tres compran la misma camisa, cobro igual;
 *   P3 las fichas pasan a la columna de su cajero;
 *   P4 doce meses de retención, la declaración y el saldo a pagar;
 *   P5 tres capas: Nación, departamento y municipio.
 */
import { useEffect, useState } from "react";
import { BORDE, FONDO, INK, INK_2, SUPERFICIE_2 } from "../comun/colores-da.js";
import { Boton, MarcoAprender, usePasos } from "../comun/ui.jsx";
import { barajar, azarDeLaPagina } from "../comun/azar.js";
import { IconoBilletera, IconoCamisa, IconoDirecto, IconoIndirecto, IconoMoneda } from "../comun/iconos-pf.jsx";
import { Objeto } from "../comun/kit.jsx";
import { Ilustrado } from "../comun/ilustrados.jsx";
import { APRENDER, A3, ESCENAS } from "./textos.js";

export const ID = "pf26-a3-cajeros";
const TEXTOS = APRENDER[ID];
const ESCALA_BILLETERA = { pequena: 0, mediana: 0.5, grande: 1 };
/* En P2 la camisa cuesta lo mismo a las tres billeteras. */
const COBRO_CAMISA = 2;
const ALTO_UNIDAD = 16;

const CSS = `
.pf26-a3-cajero { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 12px; border: 2px solid ${INK_2}; background: ${FONDO}; font: 700 15px/1.2 var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; }
.pf26-a3-billeteras { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-top: 10px; align-items: end; }
.pf26-a3-billetera { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 4px; min-height: 76px; padding: 6px 2px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; font: 600 13px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.pf26-a3-billetera[aria-pressed="true"] { border-color: ${INK}; background: ${SUPERFICIE_2}; }
.pf26-a3-barras { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; height: ${ALTO_UNIDAD * 4 + 22}px; align-items: end; margin-top: 6px; border-bottom: 2px solid ${BORDE}; }
.pf26-a3-barra { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 2px; font: 600 12px/1 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); color: ${INK}; }
.pf26-a3-barra > i { display: block; width: 28px; border-radius: 4px 4px 0 0; background: ${INK_2}; transform-origin: bottom; animation: pf26-a3-crece 420ms cubic-bezier(.3,.9,.4,1) both 1; }
@keyframes pf26-a3-crece { from { transform: scaleY(0); } to { transform: none; } }
.pf26-a3-cols { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.pf26-a3-col { min-width: 0; display: flex; flex-direction: column; gap: 6px; min-height: 150px; padding: 8px 6px; border-radius: 12px; border: 1px solid ${BORDE}; background: ${FONDO}; }
.pf26-a3-col-cab { display: flex; align-items: center; gap: 6px; font: 700 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
.pf26-a3-ficha { min-height: 44px; padding: 6px 10px; border-radius: 999px; border: 2px solid ${BORDE}; background: ${SUPERFICIE_2}; color: ${INK}; font: 600 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.pf26-a3-ficha[data-puesta="1"] { display: flex; align-items: center; gap: 4px; min-height: 36px; min-width: 0; padding: 4px 6px; font-size: 12.5px; overflow-wrap: anywhere; border-color: ${INK_2}; background: transparent; cursor: default; }
.pf26-a3-fuera { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 10px; min-height: 44px; }
.pf26-a3-meses { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 2px; }
.pf26-a3-mes { display: grid; place-items: center; height: 36px; border-radius: 6px; border: 1px solid ${BORDE}; font: 500 12px/1 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); color: ${INK_2}; }
.pf26-a3-mes[data-pasado="1"] { border-color: ${INK_2}; color: ${INK}; background: ${SUPERFICIE_2}; }
.pf26-a3-caja { display: flex; flex-wrap: wrap; align-content: flex-end; gap: 2px; min-height: 64px; margin-top: 8px; padding: 6px; border-radius: 10px; border: 2px solid ${INK_2}; }
.pf26-a3-moneda { animation: pf26-a3-cae 380ms cubic-bezier(.3,.9,.4,1) both 1; }
@keyframes pf26-a3-cae { from { transform: translateY(-24px); opacity: 0; } to { transform: none; opacity: 1; } }
.pf26-a3-decl { margin-top: 8px; padding: 8px 10px; border-radius: 10px; border: 2px solid ${INK}; display: grid; grid-template-columns: 1fr auto; gap: 4px 8px; font: 600 14px/1.3 var(--planck-font-sans, system-ui, sans-serif); }
.pf26-a3-capas { position: relative; height: 196px; max-width: 320px; margin: 0 auto; }
.pf26-a3-capa { position: absolute; display: flex; align-items: flex-start; justify-content: flex-start; padding: 12px 12px; border-radius: 14px; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; font: 700 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; text-align: left; transition: border-color 280ms cubic-bezier(.3,.9,.4,1), background 280ms cubic-bezier(.3,.9,.4,1); }
.pf26-a3-capa[aria-pressed="true"] { border-color: ${INK}; background: ${SUPERFICIE_2}; }
.pf26-a3-cobra { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; min-height: 40px; margin-top: 10px; }
.pf26-a3-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; border: 1px solid ${INK_2}; font: 600 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
@media (prefers-reduced-motion: reduce) { .pf26-a3-barra > i, .pf26-a3-moneda { animation: none; } .pf26-a3-capa { transition: none; } }
`;

const Marca = ({ tipo, size = 28 }) => (tipo === "directo" ? <IconoDirecto size={size} /> : <IconoIndirecto size={size} />);

function Cajero({ tipo }) {
  return (
    <div className="pf26-a3-cajero" data-cajero={tipo}>
      {/* La ventanilla que mira tu renta (directo) y la caja registradora de
          la tienda (indirecto), ilustradas (Gemini, 25-nov; familia 12). */}
      <Ilustrado id={tipo === "directo" ? "ventanilla" : "caja-registradora"} alto={64} />
      <span>{tipo === "directo" ? A3.directo : A3.indirecto}</span>
      {tipo === "indirecto" && <span style={{ marginLeft: "auto" }}><IconoCamisa size={36} /><span className="da26-solo-lector">{A3.camisa}</span></span>}
    </div>
  );
}

function Billeteras({ tipo, tocadas, tocar }) {
  return (
    <>
      <Cajero tipo={tipo} />
      <div className="pf26-a3-billeteras" role="group" aria-label="Las tres billeteras">
        {A3.billeteras.map((b) => (
          <button key={b.id} type="button" className="pf26-a3-billetera" data-billetera={b.id} aria-pressed={tocadas.has(b.id)} onClick={() => tocar(b.id)}>
            <Ilustrado id="billetera" alto={22 + 14 * ESCALA_BILLETERA[b.id]} />
            <span>{b.nombre}</span>
          </button>
        ))}
      </div>
      <div className="pf26-a3-barras" aria-live="polite">
        {A3.billeteras.map((b) => {
          const cobro = tipo === "directo" ? b.cobro : COBRO_CAMISA;
          return (
            <span key={b.id} className="pf26-a3-barra" data-cobro={tocadas.has(b.id) ? cobro : ""}>
              {tocadas.has(b.id) && (
                <>
                  <span>{cobro}</span>
                  <i style={{ height: cobro * ALTO_UNIDAD }} aria-hidden="true" />
                  <span className="da26-solo-lector">{`${b.nombre}: paga ${cobro}`}</span>
                </>
              )}
            </span>
          );
        })}
      </div>
    </>
  );
}

export default function A3Cajeros({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [tocadas, setTocadas] = useState(new Set());
  const [fuera] = useState(() => barajar(A3.fichas, azarDeLaPagina()));
  const [puestas, setPuestas] = useState(new Set());
  const [mes, setMes] = useState(0);
  const [capa, setCapa] = useState(null);
  useEffect(() => { setTocadas(new Set()); }, [paso]);

  let figura;
  let controles = null;
  if (paso === 0 || paso === 1) {
    figura = <Billeteras tipo={paso === 0 ? "directo" : "indirecto"} tocadas={tocadas} tocar={(id) => setTocadas((s) => new Set(s).add(id))} />;
  } else if (paso === 2) {
    const columna = (tipo) => (
      <div className="pf26-a3-col" data-columna={tipo}>
        <span className="pf26-a3-col-cab"><Marca tipo={tipo} size={24} />{tipo === "directo" ? A3.directo : A3.indirecto}</span>
        {A3.fichas.filter((f) => f.tipo === tipo && puestas.has(f.id)).map((f) => (
          <span key={f.id} className="pf26-a3-ficha da26-entra" data-puesta="1" data-ficha={f.id}>{f.nombre}</span>
        ))}
      </div>
    );
    const restantes = fuera.filter((f) => !puestas.has(f.id));
    figura = (
      <>
        <div className="pf26-a3-cols">{columna("directo")}{columna("indirecto")}</div>
        <div className="pf26-a3-fuera" role="group" aria-label="Fichas por ubicar">
          {restantes.map((f) => (
            <button key={f.id} type="button" className="pf26-a3-ficha" data-ficha={f.id} onClick={() => setPuestas((s) => new Set(s).add(f.id))}>{f.nombre}</button>
          ))}
        </div>
      </>
    );
  } else if (paso === 3) {
    const caja = mes * A3.retencionMes;
    const saldo = A3.impuestoDelAno - caja;
    figura = (
      <div data-linea-tiempo data-mes={mes}>
        <div className="pf26-a3-meses" aria-hidden="true">
          {Array.from({ length: 12 }, (_, k) => (
            <span key={k} className="pf26-a3-mes" data-pasado={k < mes ? "1" : "0"}>{k + 1}</span>
          ))}
        </div>
        <div className="pf26-a3-caja" aria-label={`${A3.caja}: ${caja}`} role="img">
          {Array.from({ length: mes }, (_, k) => <span key={k} className="pf26-a3-moneda"><IconoMoneda size={22} /></span>)}
        </div>
        <span className="da26-rotulo" style={{ display: "block", marginTop: 4 }}>{A3.caja} · {A3.retencion}</span>
        {mes === 12 && (
          <div className="pf26-a3-decl da26-entra" data-declaracion aria-live="polite">
            <span style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8 }}><Objeto id="recibo" alto={40} />{A3.declaracion}</span>
            <span>{A3.impuestoAno}</span><span className="da26-mono">{A3.impuestoDelAno}</span>
            <span>{A3.caja}</span><span className="da26-mono">− {caja}</span>
            <span>{A3.saldo}</span><span className="da26-mono" data-saldo={saldo}>{saldo}</span>
          </div>
        )}
      </div>
    );
    controles = <Boton onClick={() => setMes((m) => Math.min(12, m + 1))} disabled={mes >= 12} data-pasar-mes>{A3.pasarMes}</Boton>;
  } else {
    const POS = [
      { inset: "0" },
      { inset: "52px 14px 14px 14px" },
      { inset: "104px 28px 28px 28px" },
    ];
    const elegida = A3.niveles.find((n) => n.id === capa);
    figura = (
      <>
        <div className="pf26-a3-capas" role="group" aria-label="Los tres niveles">
          {A3.niveles.map((n, k) => (
            <button key={n.id} type="button" className="pf26-a3-capa" data-capa={n.id} aria-pressed={capa === n.id} style={POS[k]} onClick={() => setCapa(n.id)}>
              {n.nombre}
            </button>
          ))}
        </div>
        <div className="pf26-a3-cobra" aria-live="polite" data-cobra={capa ?? ""}>
          {elegida && elegida.impuestos.map((i) => {
            const tipo = A3.fichas.find((f) => f.nombre === i)?.tipo;
            return <span key={`${capa}-${i}`} className="pf26-a3-chip da26-entra"><Marca tipo={tipo} size={18} />{i}</span>;
          })}
        </div>
      </>
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
