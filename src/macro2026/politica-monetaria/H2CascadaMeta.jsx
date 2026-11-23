/*
 * H2 · Ajusta la cascada (pm26-h2-cascada-meta, Hacer, Fácil, 10 × 3 = 30 FP × %).
 * Especificación de Gen, t4 §2 H2. La cascada de A3 con 1.000 iniciales, el
 * contador «Dinero total en depósitos», la bandera «Meta» y el deslizador del
 * encaje (5 %–50 %, paso 5). Se mueve libre; «Fijar» cuenta. Total = 1.000 /
 * encaje. Etapa lograda si se fija exacto en ≤ 3 «Fijar»; tras el 2.º fallo,
 * la pista; tras el 3.º, el deslizador va solo al valor correcto.
 * Al terminar, la tarjeta de cierre: «Supone que todo préstamo vuelve como
 * depósito.» Puntaje = etapas logradas / 3.
 */
import { useEffect, useRef, useState } from "react";
import { INK } from "../comun/colores-da.js";
import { Boton, Deslizador, MarcoHacer, Retro, movimientoReducido, useCronometro } from "../comun/ui.jsx";
import { fmtEntero } from "../comun/modelo-da.js";
import { Cascada, CSS_PM, MONETARIA } from "./comun-pm.jsx";
import { CONSIGNAS, ETAPAS_H2, H2, totalCascada } from "./textos.js";

export const ID = "pm26-h2-cascada-meta";

export function juzgarH2(etapa, encaje) {
  if (encaje === etapa.solucion) return "bien";
  return totalCascada(encaje) > etapa.meta ? "arriba" : "abajo";
}

export default function H2CascadaMeta({ onTerminar }) {
  const tiempo = useCronometro();
  const [k, setK] = useState(0);
  const [encaje, setEncaje] = useState(H2.inicial);
  const [fallos, setFallos] = useState(0);
  const [estado, setEstado] = useState(null); /* null | "bien" | "perdida" */
  const [retro, setRetro] = useState(null);
  const [mal, setMal] = useState(0);
  const [detalle, setDetalle] = useState([]);
  const [cierre, setCierre] = useState(null);
  const anim = useRef(0);
  const etapa = ETAPAS_H2[k];
  const total = totalCascada(encaje);
  useEffect(() => () => cancelAnimationFrame(anim.current), []);

  const llevarA = (destino) => {
    if (movimientoReducido()) { setEncaje(destino); return; }
    const desde = encaje, pasos = Math.abs(destino - desde) / H2.paso;
    if (pasos === 0) return;
    const ini = performance.now();
    const tic = (t) => {
      const f = Math.min(1, (t - ini) / 600);
      setEncaje(desde + Math.round(f * pasos) * H2.paso * Math.sign(destino - desde));
      if (f < 1) anim.current = requestAnimationFrame(tic);
    };
    anim.current = requestAnimationFrame(tic);
    setTimeout(() => setEncaje(destino), 700);
  };

  const fijar = () => {
    const j = juzgarH2(etapa, encaje);
    if (j === "bien") {
      setEstado("bien");
      setRetro(null);
      setDetalle((d) => [...d, { item: etapa.id, ok: true, subtemas: etapa.subtemas }]);
      return;
    }
    const f = fallos + 1;
    setFallos(f);
    setMal((m) => m + 1);
    setRetro(j === "arriba" ? etapa.retroArriba : etapa.retroAbajo);
    if (f >= H2.fijarMax) {
      setEstado("perdida");
      setDetalle((d) => [...d, { item: etapa.id, ok: false, subtemas: etapa.subtemas }]);
      llevarA(etapa.solucion);
    }
  };
  const seguir = () => {
    if (k + 1 >= ETAPAS_H2.length) {
      const bien = detalle.filter((d) => d.ok).length;
      setCierre({ pct: Math.round((bien / ETAPAS_H2.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setK(k + 1);
    setFallos(0);
    setEstado(null);
    setRetro(null);
    setEncaje(H2.inicial);
  };

  if (cierre) {
    return (
      <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} progreso={`${ETAPAS_H2.length} / ${ETAPAS_H2.length}`}>
        <div data-figura data-cierre-h2>
          <Retro estado="info">{H2.cierre}</Retro>
        </div>
        <div className="da26-nav"><span /><Boton primario onClick={() => onTerminar?.(cierre)} data-siguiente>{H2.terminar}</Boton></div>
      </MarcoHacer>
    );
  }

  const cerca = total >= etapa.meta;
  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} progreso={`${k + 1} / ${ETAPAS_H2.length}`}>
      <style>{CSS_PM}</style>
      <div data-figura data-etapa={etapa.id}>
        <div className="pm26-contador" data-total={total}>
          <span>{H2.contador}</span>
          <b className="da26-mono">{fmtEntero(total)}</b>
        </div>
        <div className="pm26-contador" style={{ marginTop: 6 }} data-meta={etapa.meta}>
          <span><span aria-hidden="true" style={{ color: MONETARIA }}>⚑ </span>{H2.meta}</span>
          <b className="da26-mono">{fmtEntero(etapa.meta)}</b>
        </div>
        <div style={{ marginTop: 8 }}><Cascada encaje={encaje} visibles={7} /></div>
        <p className="da26-rotulo" style={{ textAlign: "center", margin: "4px 0 0", fontSize: 13, color: INK }} aria-hidden="true">{cerca ? "≥" : "<"} {H2.meta}</p>
        <Deslizador id="encaje-h2" etiqueta="Encaje" min={H2.min} max={H2.max} paso={H2.paso} valor={encaje}
          onCambio={(v) => { if (!estado) setEncaje(v); }} formato={(x) => `${x} %`} extremos={[`${H2.min} %`, `${H2.max} %`]} colorRelleno={MONETARIA} disabled={Boolean(estado)} />
      </div>
      <Retro estado="mal" key={`r${mal}`}>{estado === "bien" ? null : retro}</Retro>
      {fallos >= 2 && estado !== "bien" && <Retro estado="info" data-pista>{etapa.pista}</Retro>}
      {estado === "bien" && <Retro estado="bien">{H2.meta}: {fmtEntero(etapa.meta)} · {encaje} %</Retro>}
      <div className="da26-nav">
        <span className="da26-rotulo da26-mono" style={{ alignSelf: "center" }} data-fijar-quedan>{H2.fijar}: {Math.max(0, H2.fijarMax - fallos)}</span>
        {estado
          ? <Boton primario onClick={seguir} data-siguiente>{k + 1 >= ETAPAS_H2.length ? H2.terminar : H2.siguiente}</Boton>
          : <Boton primario onClick={fijar} data-fijar>{H2.fijar}</Boton>}
      </div>
    </MarcoHacer>
  );
}
