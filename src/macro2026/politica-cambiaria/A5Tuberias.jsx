/*
 * A5 · Dos tuberías (pc26-a5-tuberias, Aprender).
 * Especificación de Gen, t5 §2 A5. El país como una casa con dos tuberías
 * al exterior (bienes y servicios arriba, dinero abajo) que desembocan en el
 * tanque de reservas internacionales. Las tuberías son botones: al tocarlas
 * pasa lo que llevan (objetos del kit). P4 la IED (árbol con raíces) y el
 * capital golondrina (pájaro), que se va al pasar un trimestre. P5 la
 * ecuación con cada término en el color de su tubería. P6 el tanque sube o
 * baja con el saldo.
 */
import { useState } from "react";
import { BORDE, FONDO, INK, INK_2, SUPERFICIE_2, TINTA_SOBRE_COLOR } from "../comun/colores-da.js";
import { DOLAR } from "../comun/monedas.js";
import { Boton, MarcoAprender, usePasos } from "../comun/ui.jsx";
import { Objeto } from "../comun/kit.jsx";
import { Ilustrado, ILUSTRADOS, rutaIlustrado } from "../comun/ilustrados.jsx";
import { CAMBIARIA, CSS_PC, Reservas } from "./comun-pc.jsx";
import { A5, APRENDER, ESCENAS } from "./textos.js";

export const ID = "pc26-a5-tuberias";
const TEXTOS = APRENDER[ID];
const TONO = { corriente: CAMBIARIA, capital: DOLAR };
const CARGA = {
  corriente: [["contenedor", A5.bienes], ["avion-carga", A5.servicios], ["recibo", A5.transferencias]],
  capital: [["fabrica", A5.inversion], ["billetes", A5.prestamos]],
};

const CSS = `
.pc26-a5-mapa { display: grid; grid-template-columns: 62px minmax(0, 1fr) 62px; gap: 4px; align-items: center; }
.pc26-a5-tubos { display: grid; gap: 10px; }
.pc26-a5-tubo { position: relative; display: block; width: 100%; min-height: 56px; padding: 0; border-radius: 999px; border: 3px solid ${BORDE}; background: linear-gradient(180deg, #e4e9f4 0%, #aeb9d0 38%, #7f8cab 70%, #a9b5cc 100%); color: ${INK}; overflow: hidden; cursor: pointer; touch-action: manipulation; box-shadow: inset 0 -4px 0 rgba(14,27,46,.25); }
.pc26-a5-tubo[aria-pressed="true"] { border-color: var(--tono); }
.pc26-a5-tubo-rotulo { position: relative; z-index: 1; font: 700 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); padding: 2px 8px; background: ${SUPERFICIE_2}; border-radius: 6px; }
.pc26-a5-pasa { position: absolute; top: 50%; left: 0; display: flex; gap: 10px; transform: translate(-100%, -50%); opacity: 0; }
.pc26-a5-pasa[data-corre="1"] { animation: pc26-a5-corre 1800ms cubic-bezier(.4,0,.6,1) both 1; }
@keyframes pc26-a5-corre { 0% { transform: translate(-100%, -50%); opacity: 1; } 100% { transform: translate(260px, -50%); opacity: 1; } }
.pc26-a5-lista { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 8px; }
.pc26-a5-tanque { position: relative; width: 140px; height: 76px; margin: 10px auto 0; border-radius: 8px 8px 14px 14px; border: 3px solid ${INK}; background: ${FONDO}; overflow: hidden; }
.pc26-a5-agua { position: absolute; inset: 0; transform-origin: bottom; background: ${DOLAR}; opacity: .7; transition: transform 700ms cubic-bezier(.3,.9,.4,1); }
.pc26-a5-ec { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 10px; font: 700 16px/1.3 var(--planck-font-mono, monospace); }
.pc26-a5-ec span { padding: 3px 8px; border-radius: 8px; color: ${TINTA_SOBRE_COLOR}; }
.pc26-a5-pajaro { transition: transform 1200ms cubic-bezier(.5,0,.75,0), opacity 1200ms linear; }
.pc26-a5-pajaro[data-se-fue="1"] { transform: translate(90px, -40px); opacity: 0; }
@media (prefers-reduced-motion: reduce) { .pc26-a5-pasa[data-corre="1"] { animation: none; opacity: 1; transform: translate(8px, -50%); } .pc26-a5-agua, .pc26-a5-pajaro { transition: none; } }
`;

/* La casa del país y el globo, ilustrados (Gemini, 25-nov; familia 8). */
const Casa = () => <Ilustrado id="casa-pais" alto={56} />;
const Mundo = () => <Ilustrado id="globo" alto={60} />;

export default function A5Tuberias({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [corre, setCorre] = useState({ corriente: 0, capital: 0 });
  const [trimestre, setTrimestre] = useState(false);
  const [saldo, setSaldo] = useState(0);

  const tocar = (t) => setCorre((c) => ({ ...c, [t]: c[t] + 1 }));
  const tubo = (t, nombre) => {
    const activo = (paso === 1 && t === "corriente") || (paso === 2 && t === "capital");
    const resalta = paso === 4 || corre[t] > 0 && activo;
    return (
      <button type="button" className="pc26-a5-tubo" data-tubo={t} aria-pressed={resalta} style={{ "--tono": TONO[t] }}
        disabled={!activo} onClick={() => tocar(t)} aria-label={nombre}>
        {corre[t] > 0 && activo && (
          <span className="pc26-a5-pasa" data-corre="1" key={corre[t]} aria-hidden="true">
            {CARGA[t].map(([o]) => <Objeto key={o} id={o} alto={34} />)}
          </span>
        )}
        <span className="pc26-a5-tubo-rotulo">{nombre}</span>
      </button>
    );
  };

  let figura;
  if (paso === 3) {
    figura = (
      <svg viewBox="0 0 300 150" style={{ width: "100%", height: "auto", maxWidth: 380, display: "block", margin: "0 auto" }} role="img" aria-label={`${A5.ied} y ${A5.golondrina}`} data-ied>
        <g data-arbol>
          <image href={rutaIlustrado("arbol-raices")} x={80 - (120 * ILUSTRADOS["arbol-raices"][0]) / ILUSTRADOS["arbol-raices"][1] / 2} y="4" width={(120 * ILUSTRADOS["arbol-raices"][0]) / ILUSTRADOS["arbol-raices"][1]} height="120" />
          <text x="80" y="144" textAnchor="middle" fill={INK} fontSize="14" fontWeight="700">{A5.ied}</text>
        </g>
        <g className="pc26-a5-pajaro" data-se-fue={trimestre ? "1" : "0"} data-pajaro style={{ transformBox: "view-box" }}>
          <image href={rutaIlustrado("golondrina")} x="190" y="30" width="76" height={(76 * ILUSTRADOS.golondrina[1]) / ILUSTRADOS.golondrina[0]} />
        </g>
        <text x="228" y="144" textAnchor="middle" fill={INK} fontSize="14" fontWeight="700">{A5.golondrina}</text>
      </svg>
    );
  } else {
    const nivel = paso === 5 ? 0.5 + saldo * 0.3 : 0.5;
    figura = (
      <div>
        <div className="pc26-a5-mapa">
          <div style={{ display: "grid", justifyItems: "center", fontSize: 13, fontWeight: 600 }}><Casa />{A5.pais}</div>
          <div className="pc26-a5-tubos">
            {tubo("corriente", A5.corriente)}
            {tubo("capital", A5.capital)}
          </div>
          <div style={{ display: "grid", justifyItems: "center", fontSize: 13, fontWeight: 600 }}><Mundo />{A5.exterior}</div>
        </div>
        {(paso === 1 || paso === 2) && corre[paso === 1 ? "corriente" : "capital"] > 0 && (
          <div className="pc26-a5-lista da26-entra" data-carga={paso === 1 ? "corriente" : "capital"}>
            {CARGA[paso === 1 ? "corriente" : "capital"].map(([o, t]) => <span key={o} className="pc26-chip"><Objeto id={o} alto={24} />{t}</span>)}
          </div>
        )}
        {paso === 4 && (
          <p className="pc26-a5-ec da26-entra" data-ecuacion>
            <b style={{ alignSelf: "center" }}>BP =</b>
            {A5.terminos.map((t) => <span key={t.id} style={{ background: TONO[t.tuberia] }} data-termino={t.id} title={t.nombre}>{t.texto}</span>)}
          </p>
        )}
        <div data-tanque={nivel.toFixed(2)} style={{ marginTop: 8 }}><Reservas nivel={nivel} alto={110} nombre={A5.reservas} /></div>
        <p className="da26-rotulo" style={{ textAlign: "center", margin: "4px 0 0", fontSize: 14, color: INK }}>{A5.reservas}</p>
      </div>
    );
  }

  let controles = null;
  if (paso === 3) controles = <Boton onClick={() => setTrimestre(true)} disabled={trimestre} data-trimestre>{A5.trimestre}</Boton>;
  if (paso === 5) {
    controles = (
      <div className="pc26-opciones" role="group" aria-label="Saldo">
        <button type="button" className="pc26-opcion" aria-pressed={saldo === 1} data-saldo="positivo" onClick={() => setSaldo(1)}>{A5.positivo}</button>
        <button type="button" className="pc26-opcion" aria-pressed={saldo === -1} data-saldo="negativo" onClick={() => setSaldo(-1)}>{A5.negativo}</button>
      </div>
    );
  }

  const puede = paso === 1 ? corre.corriente > 0 : paso === 2 ? corre.capital > 0 : paso === 3 ? trimestre : true;
  return (
    <MarcoAprender escena={ESCENAS[ID]} id={ID} paso={paso} total={TEXTOS.length} texto={TEXTOS[paso]}
      figura={<><style>{CSS_PC}{CSS}</style>{figura}</>} controles={controles}
      puedeSeguir={puede} onSiguiente={siguiente} onAnterior={anterior} onTerminar={() => onTerminar?.()} />
  );
}
