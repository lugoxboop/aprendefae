/*
 * A4 · La tonelada de banano (pc26-a4-banano, Aprender).
 * Especificación de Gen, t5 §2 A4 (caso de la d. 12, cifras verificadas en
 * t5-textos-y-bancos). La caja de banano lleva su etiqueta en dólares y se
 * compara con la de la góndola en EE. UU.; si la del banano es mayor, el
 * carrito pasa de largo. P4 se apuesta antes de revelar. P6 la aguja de A3
 * marca los dos casos (ITCR 0,981 y 1,015).
 */
import { useState } from "react";
import { BORDE, FONDO, INK, SUPERFICIE_2 } from "../comun/colores-da.js";
import { DOLAR, PESO } from "../comun/monedas.js";
import { fmtDecimal, fmtEntero } from "../comun/modelo-da.js";
import { MarcoAprender, Retro, usePasos } from "../comun/ui.jsx";
import { Objeto } from "../comun/kit.jsx";
import { Ilustrado } from "../comun/ilustrados.jsx";
import { Balanza, CAMBIARIA, CSS_PC, Dial } from "./comun-pc.jsx";
import { A4, APRENDER, BANANO, ESCENAS } from "./textos.js";

export const ID = "pc26-a4-banano";
const TEXTOS = APRENDER[ID];

const CSS = `
.pc26-a4-caso { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; align-items: end; }
.pc26-a4-lado { display: grid; justify-items: center; gap: 4px; padding: 8px 4px; border-radius: 12px; border: 1px solid ${BORDE}; background: ${FONDO}; text-align: center; font: 600 14px/1.25 var(--planck-font-sans, system-ui, sans-serif); }
.pc26-a4-etiqueta { display: grid; gap: 2px; padding: 6px 10px; border-radius: 8px; border: 2px solid ${DOLAR}; background: ${SUPERFICIE_2}; font: 600 13px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
.pc26-a4-etiqueta b { font: 800 17px/1.2 var(--planck-font-mono, monospace); color: ${INK}; }
.pc26-a4-carrito { transition: transform 900ms cubic-bezier(.5,0,.75,0), opacity 900ms linear; }
.pc26-a4-carrito[data-pasa="1"] { transform: translateX(140px); opacity: .25; }
.pc26-a4-termos { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-top: 8px; }
@media (prefers-reduced-motion: reduce) { .pc26-a4-carrito { transition: opacity 120ms linear; } .pc26-a4-carrito[data-pasa="1"] { transform: none; } }
`;

/* La caja de bananos, ilustrada (Gemini, 25-nov; familia 5). */
const Caja = () => <Ilustrado id="caja-bananos" alto={80} />;

function Etiqueta({ titulo, usd, data }) {
  return <div className="pc26-a4-etiqueta" {...data}><span>{titulo}</span><b>USD {fmtDecimal(usd, 2)}</b></div>;
}

export default function A4Banano({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [apuesta, setApuesta] = useState(null);
  const B = BANANO;

  const necesario = paso <= 2 ? B.usd : paso === 3 ? (apuesta ? B.necesarioBajo : null) : B.necesarioAlto;
  const mercado = paso <= 2 ? B.usd : B.mercado;
  const pasa = paso === 3 && apuesta != null;

  let figura;
  if (paso === 5) {
    figura = <Dial valor={null} marcas={[{ id: "bajo", valor: B.inflAlla - B.inflAqui + B.subeBajo, rotulo: "0,981" }, { id: "alto", valor: B.inflAlla - B.inflAqui + B.subeAlto, rotulo: "1,015" }]} nombre="Los dos casos del banano" />;
  } else if (paso === 2) {
    figura = (
      <div>
        <div className="pc26-a4-lado" style={{ margin: "0 auto", maxWidth: 220 }} data-calendario>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{A4.pasaAnio}</span>
          <span className="da26-mono" style={{ fontSize: 20, fontWeight: 800 }}>+1</span>
        </div>
        <div className="pc26-a4-termos">
          <div className="pc26-a4-lado" style={{ borderColor: PESO }} data-termo="aqui"><Objeto id="termometro" alto={56} />{A4.aquiCo}<b className="da26-mono">+{fmtDecimal(B.inflAqui, 0)} %</b></div>
          <div className="pc26-a4-lado" style={{ borderColor: DOLAR }} data-termo="alla"><Objeto id="termometro" alto={56} />{A4.allaUs}<b className="da26-mono">+{fmtDecimal(B.inflAlla, 1)} %</b></div>
          <div className="pc26-a4-lado" style={{ borderColor: CAMBIARIA }} data-termo="dolar"><Objeto id="billete-dolar" alto={40} />{A4.dolar}<b className="da26-mono">+{fmtDecimal(B.subeBajo, 1)} %</b></div>
        </div>
      </div>
    );
  } else {
    figura = (
      <div>
        {paso === 1 && <Balanza tc={B.tc} />}
        <div className="pc26-a4-caso" style={{ marginTop: paso === 1 ? 8 : 0 }}>
          <div className="pc26-a4-lado" data-vendedor>
            <Caja />
            <span>{A4.vendedor} · {A4.tonelada}</span>
            {paso === 0
              ? <span className="da26-mono" style={{ color: PESO, fontWeight: 800 }} data-costo>${fmtEntero(B.costo)}</span>
              : necesario != null ? <Etiqueta titulo={A4.necesario} usd={necesario} data={{ "data-necesario": necesario.toFixed(2) }} /> : <span className="da26-mono">USD ?</span>}
          </div>
          <div className="pc26-a4-lado" data-comprador>
            <div className="pc26-a4-carrito" data-pasa={pasa ? "1" : "0"}><Ilustrado id="carrito-mercado" alto={60} /></div>
            <span>{A4.comprador}{paso >= 1 ? ` · ${A4.gondola}` : ""}</span>
            {paso >= 1 && <Etiqueta titulo={A4.mercado} usd={mercado} data={{ "data-mercado": mercado.toFixed(2) }} />}
          </div>
        </div>
        {paso === 4 && <p style={{ margin: "6px 0 0", textAlign: "center", fontWeight: 700 }} data-sube-5>{A4.sube5}</p>}
      </div>
    );
  }

  const controles = paso === 3 ? (
    <>
      <div className="pc26-opciones" role="group" aria-label={TEXTOS[3]}>
        {[["si", A4.si], ["no", A4.no]].map(([id, t]) => (
          <button key={id} type="button" className="pc26-opcion" aria-pressed={apuesta === id} data-apuesta={id} disabled={apuesta != null}
            data-estado={apuesta === id ? (id === "no" ? "bien" : "mal") : undefined} onClick={() => setApuesta(id)}>{t}</button>
        ))}
      </div>
      {apuesta && <Retro estado={apuesta === "no" ? "bien" : "mal"} data-retro-apuesta={apuesta}>{apuesta === "no" ? A4.retroNo : A4.retroSi}</Retro>}
    </>
  ) : null;

  return (
    <MarcoAprender escena={ESCENAS[ID]} id={ID} paso={paso} total={TEXTOS.length} texto={TEXTOS[paso]}
      figura={<><style>{CSS_PC}{CSS}</style>{figura}</>} controles={controles}
      puedeSeguir={paso === 3 ? apuesta != null : true} onSiguiente={siguiente} onAnterior={anterior} onTerminar={() => onTerminar?.()} />
  );
}
