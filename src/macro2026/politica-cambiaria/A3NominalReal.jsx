/*
 * A3 · Nominal no es real (pc26-a3-nominal-real, Aprender).
 * Especificación de Gen, t5 §2 A3. Un cartel con el tc del 16 de abril de
 * 2025; dos termómetros (aquí y afuera); tres palancas (inflación de afuera
 * y de aquí 0–8 %, variación del nominal −6 % a +8 %, paso 0,5) que mueven
 * la aguja del cambio real. P4 arma la fórmula con los colores de cada
 * palanca; P5 la aguja en cada zona con la exportadora (mascota, sin
 * emoji); P6 el ITCR en vivo.
 */
import { useState } from "react";
import { BORDE, FONDO, INK, INK_2, TINTA_SOBRE_COLOR } from "../comun/colores-da.js";
import { DOLAR, PESO } from "../comun/monedas.js";
import { fmtDecimal } from "../comun/modelo-da.js";
import { Deslizador, MarcoAprender, usePasos } from "../comun/ui.jsx";
import { MascotaRol } from "../comun/mascotas.jsx";
import { Objeto } from "../comun/kit.jsx";
import { CAMBIARIA, CSS_PC, Dial, fmtVar } from "./comun-pc.jsx";
import { A3, APRENDER, deltaTcr, itcr, ESCENAS } from "./textos.js";

export const ID = "pc26-a3-nominal-real";
const TEXTOS = APRENDER[ID];
/* Los colores de cada palanca (P4): afuera en el tono del dólar, aquí en el del peso. */
export const TONO_PALANCA = { afuera: DOLAR, aqui: PESO, nominal: CAMBIARIA };
const ZONAS_P5 = [
  { id: "devaluacion", valores: { afuera: 2, aqui: 2, nominal: 4 } },
  { id: "equilibrio", valores: { afuera: 3, aqui: 3, nominal: 0 } },
  { id: "revaluacion", valores: { afuera: 1, aqui: 6, nominal: 1 } },
];

const CSS = `
.pc26-a3-cartel { display: grid; justify-items: center; gap: 2px; margin: 0 auto; padding: 12px 16px; max-width: 280px; border-radius: 12px; border: 3px solid ${INK}; background: ${FONDO}; }
.pc26-a3-termos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
.pc26-a3-termo { display: grid; justify-items: center; gap: 4px; padding: 6px; border-radius: 12px; border: 1px solid ${BORDE}; background: ${FONDO}; font: 600 14px/1.25 var(--planck-font-sans, system-ui, sans-serif); text-align: center; }
.pc26-a3-formula { display: flex; flex-wrap: wrap; justify-content: center; align-items: baseline; gap: 4px 6px; margin-top: 8px; font: 700 16px/1.4 var(--planck-font-mono, monospace); }
.pc26-a3-formula b { padding: 2px 6px; border-radius: 6px; color: ${TINTA_SOBRE_COLOR}; }
`;

export default function A3NominalReal({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [v, setV] = useState(A3.inicial);
  const [movidas, setMovidas] = useState(new Set());
  const [zona, setZona] = useState(null);
  const [zonasVistas, setZonasVistas] = useState(new Set());

  const mover = (k) => (x) => { setV((o) => ({ ...o, [k]: x })); setMovidas((s) => new Set(s).add(k)); };
  const valores = paso === 4 && zona ? ZONAS_P5.find((z) => z.id === zona).valores : v;
  const d = deltaTcr(valores);
  const indice = itcr(valores);

  let figura;
  if (paso <= 1) {
    figura = (
      <div>
        <div className="pc26-a3-cartel" data-cartel>
          <span className="da26-mono" style={{ fontSize: 22, fontWeight: 800, color: PESO }}>{A3.cartel.split(" · ")[0]}</span>
          <span style={{ fontSize: 14, color: INK_2 }}>{A3.cartel.split(" · ")[1]}</span>
        </div>
        {paso === 1 && (
          <div className="pc26-a3-termos da26-entra" data-termometros>
            <div className="pc26-a3-termo" style={{ borderColor: PESO }}><Objeto id="termometro" alto={64} />{A3.aqui}</div>
            <div className="pc26-a3-termo" style={{ borderColor: DOLAR }}><Objeto id="termometro" alto={64} />{A3.afuera}</div>
          </div>
        )}
      </div>
    );
  } else if (paso === 4) {
    figura = (
      <div>
        <Dial valor={zona ? d : null} />
        <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
          <MascotaRol id="exportadora-flores" pose={zona === "devaluacion" ? "recibe-billete" : "flores"} alto={120} rotulo={false} />
        </div>
        <p style={{ margin: "2px 0 0", textAlign: "center", fontWeight: 700 }} data-exportador={zona ?? ""}>
          {zona === "devaluacion" ? A3.gana : zona === "revaluacion" ? A3.pierde : zona === "equilibrio" ? A3.igual : " "}
        </p>
      </div>
    );
  } else {
    figura = (
      <div>
        <Dial valor={d} itcrTexto={paso === 5 ? `${A3.itcr} ${fmtDecimal(indice, 3)}` : null} />
        {paso === 3 && (
          <p className="pc26-a3-formula da26-entra" data-formula aria-label={`Δtcr ≈ (${fmtVar(v.afuera)} − ${fmtVar(v.aqui)}) + ${fmtVar(v.nominal)} = ${fmtVar(d)}`}>
            <span>Δtcr ≈ (</span><b style={{ background: TONO_PALANCA.afuera }}>{fmtDecimal(v.afuera, 1)}</b><span>−</span>
            <b style={{ background: TONO_PALANCA.aqui }}>{fmtDecimal(v.aqui, 1)}</b><span>) +</span>
            <b style={{ background: TONO_PALANCA.nominal }}>{fmtDecimal(v.nominal, 1)}</b><span>= {fmtVar(d)}</span>
          </p>
        )}
        {paso === 5 && (
          <p className="pc26-a3-formula da26-entra" data-itcr={indice.toFixed(3)}>
            <span>{A3.itcr} = (1 + </span><b style={{ background: TONO_PALANCA.nominal }}>{fmtDecimal(v.nominal, 1)} %</b><span>)(1 + </span>
            <b style={{ background: TONO_PALANCA.afuera }}>{fmtDecimal(v.afuera, 1)} %</b><span>) / (1 + </span>
            <b style={{ background: TONO_PALANCA.aqui }}>{fmtDecimal(v.aqui, 1)} %</b><span>) = {fmtDecimal(indice, 3)}</span>
          </p>
        )}
      </div>
    );
  }

  let controles = null;
  if (paso === 2 || paso === 3 || paso === 5) {
    const pal = (k, min, max, etq) => (
      <Deslizador key={k} id={`a3-${k}`} etiqueta={etq} min={min} max={max} paso={0.5} valor={v[k]} onCambio={mover(k)}
        formato={(x) => `${fmtDecimal(x, 1)} %`} extremos={[`${min} %`, `${max} %`]} colorRelleno={TONO_PALANCA[k]} />
    );
    controles = <>{pal("afuera", 0, 8, A3.afuera)}{pal("aqui", 0, 8, A3.aqui)}{pal("nominal", -6, 8, A3.nominal)}</>;
  }
  if (paso === 4) {
    controles = (
      <div className="pc26-opciones" role="group" aria-label="Zonas">
        {ZONAS_P5.map((z) => (
          <button key={z.id} type="button" className="pc26-opcion" aria-pressed={zona === z.id} data-zona-boton={z.id}
            onClick={() => { setZona(z.id); setZonasVistas((s) => new Set(s).add(z.id)); }}>{A3.zonas[z.id]}</button>
        ))}
      </div>
    );
  }

  const puede = paso === 2 ? movidas.size === 3 : paso === 4 ? zonasVistas.has("devaluacion") && zonasVistas.has("revaluacion") : true;
  return (
    <MarcoAprender escena={ESCENAS[ID]} id={ID} paso={paso} total={TEXTOS.length} texto={TEXTOS[paso]}
      figura={<><style>{CSS_PC}{CSS}</style>{figura}</>} controles={controles}
      puedeSeguir={puede} onSiguiente={siguiente} onAnterior={anterior} onTerminar={() => onTerminar?.()} />
  );
}
