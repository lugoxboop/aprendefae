/*
 * A5 · El precio del dinero (pm26-a5-precio-dinero, Aprender).
 * Especificación de Gen, t4 §2 A5. La oferta es una pared vertical en M̄/P
 * (80–120) y la demanda la recta L = kY − h·i (k 0,5; h 10; Y 260–360). La
 * tasa de equilibrio i = (kY − M̄/P)/h arranca en 5 % y, con esos rangos,
 * siempre queda entre 1 % y 10 %. Tasa con un decimal.
 * P2 un punto sobre la demanda se mueve con un deslizador de tasa (decisión 5:
 * el deslizador es el «arrastre» accesible del punto). P3 deslizador Y.
 * P5 la pared se arrastra (asa con flechas del teclado). P6 «Suben los
 * precios P»: M̄/P pasa de 100 a 100 / 1,2 y la tasa sube.
 */
import { useState } from "react";
import { Boton, Deslizador, MarcoAprender, usePasos } from "../comun/ui.jsx";
import { fmtDecimal, fmtEntero } from "../comun/modelo-da.js";
import { CSS_PM, GraficaDinero, MONETARIA } from "./comun-pm.jsx";
import { A5, APRENDER, MODELO_DINERO, ESCENAS } from "./textos.js";

export const ID = "pm26-a5-precio-dinero";
const TEXTOS = APRENDER[ID];
const { Y: Y0, M: M0, Mmin, Mmax, Ymin, Ymax } = MODELO_DINERO;
export const SUBIDA_PRECIOS = 1.2;

export default function A5PrecioDinero({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [Y, setY] = useState(Y0);
  const [M, setM] = useState(M0);
  const [punto, setPunto] = useState(5);
  const [movioY, setMovioY] = useState(false);
  const [movioM, setMovioM] = useState(false);
  const [precios, setPrecios] = useState(false);

  const Yv = paso >= 2 ? Y : Y0;
  const Mv = paso === 5 ? (precios ? M0 / SUBIDA_PRECIOS : M0) : paso === 4 ? M : M0;
  const figura = (
    <GraficaDinero
      M={Mv} Y={Yv} conDemanda={paso >= 1} cruce={paso >= 3} punto={paso === 1 ? punto : null}
      fantasma={paso === 5 && precios ? { M: M0 } : null}
      asas={paso === 4 ? { oferta: { onCambio: (v) => { setM(Math.max(Mmin, Math.min(Mmax, v))); setMovioM(true); } } } : {}}
    />
  );

  let controles = null;
  if (paso === 1) {
    controles = (
      <>
        <Deslizador id="punto" etiqueta="Tasa de interés i" min={1} max={10} paso={0.5} valor={punto} onCambio={setPunto} formato={(x) => `${fmtDecimal(x, 1)} %`} extremos={["1 %", "10 %"]} colorRelleno={MONETARIA} />
        <p className="pm26-contador" style={{ margin: 0 }} data-dinero-deseado>
          <span>Dinero que quieren (M/P)</span><b className="da26-mono">{fmtEntero(MODELO_DINERO.k * Y0 - MODELO_DINERO.h * punto)}</b>
        </p>
      </>
    );
  }
  if (paso === 2) {
    controles = <Deslizador id="ingreso" etiqueta={A5.ingreso} min={Ymin} max={Ymax} paso={10} valor={Y} onCambio={(v) => { setY(v); setMovioY(true); }} formato={fmtEntero} extremos={[fmtEntero(Ymin), fmtEntero(Ymax)]} colorRelleno={MONETARIA} />;
  }
  if (paso === 3) {
    controles = <p className="pm26-contador" style={{ margin: 0 }} data-i1><span>{A5.cruce}</span><b className="da26-mono">{fmtDecimal((MODELO_DINERO.k * Yv - Mv) / MODELO_DINERO.h, 1)} %</b></p>;
  }
  if (paso === 4) {
    controles = (
      <>
        <p className="da26-rotulo" style={{ margin: 0, textAlign: "center", fontSize: 14 }}>{A5.pared}</p>
        <Deslizador id="oferta" etiqueta={A5.oferta} min={Mmin} max={Mmax} paso={5} valor={Math.round(M)} onCambio={(v) => { setM(v); setMovioM(true); }} formato={fmtEntero} extremos={[fmtEntero(Mmin), fmtEntero(Mmax)]} colorRelleno={MONETARIA} />
      </>
    );
  }
  if (paso === 5) controles = <Boton onClick={() => setPrecios(true)} disabled={precios} data-precios>{A5.precios}</Boton>;

  const puede = paso === 2 ? movioY : paso === 4 ? movioM : paso === 5 ? precios : true;
  return (
    <MarcoAprender escena={ESCENAS[ID]} id={ID} paso={paso} total={TEXTOS.length} texto={TEXTOS[paso]}
      figura={<><style>{CSS_PM}</style>{figura}</>} controles={controles}
      puedeSeguir={puede} onSiguiente={siguiente} onAnterior={anterior} onTerminar={() => onTerminar?.()} />
  );
}
