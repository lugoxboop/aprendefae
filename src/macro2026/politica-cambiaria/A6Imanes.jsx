/*
 * A6 · Imanes de capital (pc26-a6-imanes, Aprender).
 * Especificación de Gen, t5 §2 A6 (caso del ahorro, d. 22; cifras
 * verificadas en t5-textos-y-bancos). Dos países como imanes; las monedas de
 * capital van hacia la tasa mayor; la nube del riesgo las espanta; la cuesta
 * (el peso se deprecia) devuelve algunas. P5 se apuesta (aquí o afuera) con
 * el inversionista (mascota, pose «monedas»: nunca «tableta», que regala la
 * dirección); P6 la barra de afuera crece con la devaluación; P7 la regla.
 */
import { useState } from "react";
import { BORDE, FONDO } from "../comun/colores-da.js";
import { DOLAR, PESO } from "../comun/monedas.js";
import { Boton, Deslizador, MarcoAprender, Retro, usePasos } from "../comun/ui.jsx";
import { MascotaRol } from "../comun/mascotas.jsx";
import { Barras, CAMBIARIA, CSS_PC, Imanes } from "./comun-pc.jsx";
import { A6, AHORRO, APRENDER, afuera, aqui, ESCENAS } from "./textos.js";

export const ID = "pc26-a6-imanes";
const TEXTOS = APRENDER[ID];

export default function A6Imanes({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [tAqui, setTAqui] = useState(8);
  const [tAlla, setTAlla] = useState(8);
  const [movio, setMovio] = useState(false);
  const [riesgo, setRiesgo] = useState(false);
  const [apuesta, setApuesta] = useState(null);

  const atraccion = paso === 0 ? 0 : paso === 1 ? (tAlla - tAqui) / 8 : paso === 2 ? -0.6 : paso === 3 ? -0.8 : 0;
  let figura;
  if (paso <= 3) {
    figura = <Imanes atraccion={atraccion} nube={paso === 2 && riesgo} cuesta={paso === 3} nombres={[A6.colombia, A6.eeuu]} />;
  } else if (paso === 4 || paso === 5) {
    const vAqui = aqui(AHORRO), vAfuera = afuera(AHORRO, paso === 5 ? AHORRO.devalua : 0);
    figura = (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", gap: 8, alignItems: "center" }}>
          <MascotaRol id="inversionista" pose="monedas" alto={120} />
          <Barras aqui={paso === 5 || apuesta ? vAqui : null} afuera={paso === 5 || apuesta ? vAfuera : null} etiquetas={[A6.aquiBtn, A6.afueraBtn]}
            max={720} gana={paso === 5 || apuesta ? (vAqui >= vAfuera ? "aqui" : "afuera") : null} />
        </div>
      </div>
    );
  } else {
    figura = (
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 6, fontWeight: 700 }} data-regla>
        <span className="pc26-chip" style={{ borderColor: DOLAR, borderWidth: 2 }}>{A6.regla[0]}</span>
        <span>+</span>
        <span className="pc26-chip" style={{ borderColor: PESO, borderWidth: 2 }}>{A6.regla[1]}</span>
        <span>≈</span>
        <span className="pc26-chip" style={{ borderColor: CAMBIARIA, borderWidth: 2 }}>{A6.regla[2]}</span>
        <p className="da26-mono" style={{ width: "100%", textAlign: "center", margin: "8px 0 0", padding: 8, borderRadius: 10, border: `1px solid ${BORDE}`, background: FONDO }}>
          4 % + 12 % ≈ 16,5 %
        </p>
      </div>
    );
  }

  let controles = null;
  if (paso === 1) {
    controles = (
      <>
        <Deslizador id="tasa-aqui" etiqueta={A6.tasaAqui} min={0} max={16} paso={1} valor={tAqui} onCambio={(x) => { setTAqui(x); setMovio(true); }}
          formato={(x) => `${x} %`} extremos={["0 %", "16 %"]} colorRelleno={PESO} />
        <Deslizador id="tasa-alla" etiqueta={A6.tasaAlla} min={0} max={16} paso={1} valor={tAlla} onCambio={(x) => { setTAlla(x); setMovio(true); }}
          formato={(x) => `${x} %`} extremos={["0 %", "16 %"]} colorRelleno={DOLAR} />
      </>
    );
  }
  if (paso === 2) controles = <Boton onClick={() => setRiesgo(true)} disabled={riesgo} data-riesgo>{A6.riesgo}: {A6.colombia}</Boton>;
  if (paso === 4) {
    controles = (
      <>
        <div className="pc26-opciones" role="group" aria-label={TEXTOS[4]}>
          {[["aqui", A6.aquiBtn], ["afuera", A6.afueraBtn]].map(([id, t]) => (
            <button key={id} type="button" className="pc26-opcion" aria-pressed={apuesta === id} data-apuesta={id} disabled={apuesta != null}
              data-estado={apuesta === id ? (id === "aqui" ? "bien" : "mal") : undefined} onClick={() => setApuesta(id)}>{t}</button>
          ))}
        </div>
        {apuesta && <Retro estado={apuesta === "aqui" ? "bien" : "mal"} data-retro-apuesta={apuesta}>{apuesta === "aqui" ? A6.retroAqui : A6.retroAfuera}</Retro>}
      </>
    );
  }

  const puede = paso === 1 ? movio && tAqui !== tAlla : paso === 2 ? riesgo : paso === 4 ? apuesta != null : true;
  return (
    <MarcoAprender escena={ESCENAS[ID]} id={ID} paso={paso} total={TEXTOS.length} texto={TEXTOS[paso]}
      figura={<><style>{CSS_PC}</style>{figura}</>} controles={controles}
      puedeSeguir={puede} onSiguiente={siguiente} onAnterior={anterior} onTerminar={() => onTerminar?.()} />
  );
}
