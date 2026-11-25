/*
 * A1 · El carrito de la economía (da26-a1-carrito, Aprender, sin FP).
 * Especificación de Gen §2 A1. Gancho: un carrito de mercado que «es» la
 * economía; cuatro manos echan bloques de su color y el carrito sube de nivel.
 *
 * Lote 4 (kit de animación de Gen): cada mano lleva su objeto real (bolsa de
 * mercado C, fábrica I, edificio de gobierno G, barco XN) y, al tocarla, el
 * objeto vuela al carrito de Gemini, que va encima de la barra DA (la barra
 * que se llena sigue igual). Solo transform y opacity; con movimiento
 * reducido el objeto no vuela.
 */
import { useRef, useState } from "react";
import { COMPONENTES, ORDEN_COMPONENTES, INK_2 } from "../comun/colores-da.js";
import { Carrito } from "../comun/carrito.jsx";
import { Objeto } from "../comun/kit.jsx";
import { Deslizador, MarcoAprender, usePasos } from "../comun/ui.jsx";
import { APRENDER, ESCENAS } from "./textos.js";

export const ID = "da26-a1-carrito";
const T = APRENDER[ID];
/* Cuánto echa cada mano (unidades de dibujo; la pieza no enseña cifras de C, I ni G). */
const ECHA = { C: 120, I: 70, G: 85, XN: 20 };
export const OBJETO_MANO = { C: "bolsa-mercado", I: "fabrica", G: "edificio-gobierno", XN: "barco" };

const CSS = `
.da26-a1-manos { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; margin-bottom: 8px; }
.da26-a1-mano > span:last-child { min-width: 0; }
.da26-a1-mano { display: flex; align-items: center; gap: 8px; min-height: 64px; min-width: 0; padding: 8px 8px; border-radius: 12px; border: 2px solid var(--mano); background: #0E1B2E; color: #f4f5f7; font: 600 14px/18px var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: pointer; touch-action: manipulation; }
@media (max-width: 374px) { .da26-a1-mano { flex-direction: column; align-items: flex-start; gap: 4px; } }
.da26-a1-mano[aria-pressed="true"] { background: #1F3250; }
.da26-a1-mano .da26-a1-letra { font: 700 15px/1 var(--planck-font-mono, monospace); display: inline-block; min-width: 1.6em; padding: 2px 4px; border-radius: 4px; background: var(--mano); color: #121418; text-align: center; }
.da26-letra { display: inline-block; min-width: 1.6em; padding: 2px 4px; border-radius: 4px; background: var(--c); color: #121418; text-align: center; }
.da26-a1-formula { font: 600 17px/1.4 var(--planck-font-mono, monospace); text-align: center; margin-top: 6px; }
.da26-a1-cesta { position: relative; display: flex; justify-content: center; height: 76px; margin-bottom: -6px; }
.da26-a1-vuela { position: absolute; left: 50%; top: 0; margin-left: -20px; pointer-events: none; animation: da26-a1-vuela 600ms cubic-bezier(.3,.9,.4,1) both 1; }
@keyframes da26-a1-vuela { from { transform: translate(var(--dx, 0), -70px) scale(1); opacity: 1; } 70% { opacity: 1; } to { transform: translate(0, 18px) scale(.45); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .da26-a1-vuela { animation: none; opacity: 0; } }
.da26-a1-puerto { display: flex; justify-content: space-between; align-items: flex-end; gap: 8px; font-size: 13px; color: ${INK_2}; }
`;

function Formula() {
  const L = ({ k, children }) => <span className="da26-letra" style={{ "--c": COMPONENTES[k].color }}>{children}</span>;
  return (
    <p className="da26-a1-formula da26-entra" data-formula aria-label="DA igual a C más I más G más, entre paréntesis, X menos M">
      DA = <L k="C">C</L> + <L k="I">I</L> + <L k="G">G</L> + <L k="XN">(X − M)</L>
    </p>
  );
}

/* El hueco donde cae lo echado, encima del carrito ilustrado (carrito.jsx);
 * `vuela` = el último objeto echado. */
function Cesta({ vuela = null }) {
  const DX = { C: "-90px", I: "-30px", G: "30px", XN: "90px" };
  return (
    <div className="da26-a1-cesta" data-cesta>
      <div style={{ height: 44 }} aria-hidden="true" />
      {vuela && <Objeto key={vuela.n} id={OBJETO_MANO[vuela.k]} alto={40} className="da26-a1-vuela" data-vuela={vuela.k} style={{ "--dx": DX[vuela.k] }} />}
    </div>
  );
}

function Manos({ echadas = null, onEchar = null }) {
  return (
    <div className="da26-a1-manos da26-entra" data-manos>
      {ORDEN_COMPONENTES.map((k) => {
        const hecha = echadas?.has(k);
        return (
          <button
            key={k} type="button" className="da26-a1-mano" data-mano={k}
            style={{ "--mano": COMPONENTES[k].color }}
            aria-pressed={onEchar ? Boolean(hecha) : undefined}
            disabled={!onEchar}
            aria-label={onEchar ? `Mano ${COMPONENTES[k].nombre}` : COMPONENTES[k].nombre}
            onClick={() => onEchar?.(k)}
          >
            <Objeto id={OBJETO_MANO[k]} alto={40} />
            <span><span className="da26-a1-letra">{COMPONENTES[k].letra}</span>{hecha || !onEchar ? <><br />{COMPONENTES[k].nombre}</> : null}</span>
          </button>
        );
      })}
    </div>
  );
}

/* Un barco: sale (X) o llega (M); su tamaño sigue al valor. */
function Barco({ valor, sale, rotulo }) {
  const s = 0.55 + valor / 200;
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <svg viewBox="0 0 80 50" width="100%" height="56" aria-hidden="true">
        <g className="da26-trans" style={{ transform: `translate(${sale ? 40 + valor * 0.12 : 40 - valor * 0.12}px, 26px) scale(${sale ? s : -s}, ${s})` }}>
          <path d="M-26 0h46l-8 12h-30z" fill="none" stroke="#f4f5f7" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M-14 0v-10h14v10" fill="none" stroke="#f4f5f7" strokeWidth="2.5" />
          <path d="M24 6h10m-4-4 4 4-4 4" fill="none" stroke="#f4f5f7" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <path d="M0 46c8-4 12 4 20 0s12 4 20 0 12 4 20 0 12 4 20 0" fill="none" stroke={INK_2} strokeWidth="2" />
      </svg>
      <span>{rotulo}</span>
    </div>
  );
}

export default function A1Carrito({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(4);
  const [sacude, setSacude] = useState(0);
  const [echadas, setEchadas] = useState(() => new Set());
  const [vuela, setVuela] = useState(null);
  const [X, setX] = useState(60);
  const [Mi, setM] = useState(40);
  const [vals, setVals] = useState({ C: ECHA.C, I: ECHA.I, G: ECHA.G, XN: ECHA.XN });
  const agarre = useRef(null);
  const escala = 0.4;

  let figura;
  let controles = null;
  let puede = true;
  if (paso === 0) {
    figura = (
      <>
        {sacude > 0 && <Manos />}
        <button type="button" onClick={() => setSacude((n) => n + 1)} aria-label="Tocar el carrito" data-tocar-carrito
          style={{ display: "block", width: "100%", padding: 0, border: 0, background: "transparent", cursor: "pointer" }}>
          <Cesta />
          <Carrito valores={{}} sacude={sacude} />
        </button>
      </>
    );
  } else if (paso === 1) {
    const valores = Object.fromEntries([...echadas].map((k) => [k, ECHA[k]]));
    figura = (
      <>
        <Manos echadas={echadas} onEchar={(k) => { setEchadas((s) => new Set(s).add(k)); setVuela((v) => ({ k, n: (v?.n ?? 0) + 1 })); }} />
        <Cesta vuela={vuela} />
        <Carrito valores={valores} />
        {echadas.size === 4 && <Formula />}
      </>
    );
    puede = echadas.size === 4;
  } else if (paso === 2) {
    const xn = X - Mi;
    figura = (
      <>
        <div className="da26-a1-puerto" data-puerto>
          <Barco valor={X} sale rotulo={`Sale X = ${X}`} />
          <Barco valor={Mi} rotulo={`Llega M = ${Mi}`} />
        </div>
        <Carrito valores={{ C: ECHA.C, I: ECHA.I, G: ECHA.G, XN: xn }} />
        <p className="da26-a1-formula" data-xn={xn}>XN = {X} − {Mi} = {xn < 0 ? `−${-xn}` : xn}</p>
      </>
    );
    controles = (
      <>
        <Deslizador id="a1-x" etiqueta="Lo que vendemos afuera" min={0} max={100} valor={X} onCambio={setX} />
        <Deslizador id="a1-m" etiqueta="Lo que compramos afuera" min={0} max={100} valor={Mi} onCambio={setM} />
      </>
    );
  } else {
    const total = vals.C + vals.I + vals.G + vals.XN;
    const limitar = (k, v) => Math.max(0, Math.min(ECHA[k], Math.round(v)));
    figura = (
      <Carrito
        valores={vals} total={total} escala={escala}
        onAgarre={{
          inicio: (k, y) => { agarre.current = { k, y, v: vals[k] }; },
          mover: (k, y) => {
            const a = agarre.current;
            if (!a || a.k !== k) return;
            setVals((s) => ({ ...s, [k]: limitar(k, a.v - (y - a.y) / escala) }));
          },
          tecla: (k, d) => setVals((s) => ({ ...s, [k]: limitar(k, s[k] + d) })),
        }}
      />
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div>
        <MarcoAprender escena={ESCENAS[ID]}
          id={ID} paso={paso} total={4} texto={T[paso]} figura={figura} controles={controles}
          puedeSeguir={puede} onSiguiente={siguiente} onAnterior={anterior} onTerminar={onTerminar}
        />
      </div>
    </>
  );
}
