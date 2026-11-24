/*
 * H4 · Mueve la curva, mira la tasa (pm26-h4-mueve-tasa, Hacer, Medio, 25 FP × %).
 * Especificación de Gen, t4 §2 H4. La gráfica de A5 con un asa en la pared
 * (oferta) y otra en la recta (demanda), las dos de arrastre horizontal (o con
 * las flechas del teclado). Se lee como respuesta la curva que más se movió y
 * hacia dónde (umbral: un paso del asa). «Revelar»: la curva correcta se
 * corre, la otra vuelve a su sitio, y la tasa sube o baja con una flecha. Se
 * califican qué curva y hacia dónde. Partida: 5 de 7. Puntaje = criterios / 10.
 */
import { useMemo, useState } from "react";
import { Boton, MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, sortear } from "../comun/azar.js";
import { CSS_PM, GraficaDinero } from "./comun-pm.jsx";
import { BANCO_H4, CONSIGNAS, H4, MODELO_DINERO, PARTIDA_H4, ESCENAS } from "./textos.js";

export const ID = "pm26-h4-mueve-tasa";
export const prepararH4 = (rng = Math.random) => sortear(BANCO_H4, PARTIDA_H4, rng);
const { M: M0, Y: Y0, k } = MODELO_DINERO;
const DM = 15;          /* lo que se corre la curva correcta, en M/P */
const UMBRAL = 4;       /* en M/P: menos que esto no cuenta como mover */

/** La respuesta que leen los dos desplazamientos (en M/P). */
export function leerRespuesta(dOferta, dDemanda) {
  const a = Math.abs(dOferta), b = Math.abs(dDemanda);
  if (Math.max(a, b) < UMBRAL) return null;
  const curva = a >= b ? "oferta" : "demanda";
  const d = curva === "oferta" ? dOferta : dDemanda;
  return { curva, direccion: d > 0 ? "derecha" : "izquierda" };
}
/** Dónde queda cada curva al revelar el suceso. */
export function revelado(s) {
  const signo = s.direccion === "derecha" ? 1 : -1;
  return s.curva === "oferta" ? { M: M0 + signo * DM, Y: Y0 } : { M: M0, Y: Y0 + (signo * DM) / k };
}

export default function H4MueveTasa({ onTerminar, rng = null }) {
  const sucesos = useMemo(() => prepararH4(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [M, setM] = useState(M0);
  const [Y, setY] = useState(Y0);
  const [res, setRes] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const s = sucesos[n];
  const resp = leerRespuesta(M - M0, k * (Y - Y0));

  const revelar = () => {
    const okCurva = resp.curva === s.curva;
    const okDir = resp.direccion === s.direccion;
    setRes({ okCurva, okDir });
    setDetalle((d) => [...d,
      { item: `${s.id}-curva`, ok: okCurva, subtemas: s.subtemas },
      { item: `${s.id}-direccion`, ok: okDir, subtemas: s.subtemas }]);
    const r = revelado(s);
    setM(r.M);
    setY(r.Y);
  };
  const seguir = () => {
    if (n + 1 >= sucesos.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / detalle.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setM(M0);
    setY(Y0);
    setRes(null);
  };

  return (
    <MarcoHacer id={ID} escena={ESCENAS[ID]} mini={{ etiqueta: ESCENAS[ID].porRonda.etiqueta, texto: s.texto, datos: { "data-suceso": s.id } }} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${sucesos.length}`}>
      <style>{CSS_PM}</style>
      {/* Rediseño lote 3: el suceso de la ronda va en la franja de escena. */}
      <div data-figura data-respuesta={resp ? `${resp.curva}-${resp.direccion}` : ""}>
        <GraficaDinero M={M} Y={Y} fantasma={res ? { M: M0, Y: Y0 } : null} flecha={res ? s.tasa : null}
          asas={res ? {} : { oferta: { onCambio: setM }, demanda: { onCambio: setY } }} />
      </div>
      {res && !res.okCurva && <Retro estado="mal" data-retro-curva>{s.retroCurva}</Retro>}
      {res && !res.okDir && <Retro estado="mal" data-retro-direccion>{s.retroDireccion}</Retro>}
      {res && res.okCurva && res.okDir && <Retro estado="bien">{s.curva === "oferta" ? H4.oferta : H4.demanda} · {s.tasa === "sube" ? H4.tasaSube : H4.tasaBaja}</Retro>}
      {res && !(res.okCurva && res.okDir) && <Retro estado="info" data-tasa-revelada>{s.curva === "oferta" ? H4.oferta : H4.demanda} → {s.tasa === "sube" ? H4.tasaSube : H4.tasaBaja}</Retro>}
      <div className="da26-nav">
        <Boton onClick={() => { setM(M0); setY(Y0); }} disabled={Boolean(res) || !resp} data-reiniciar aria-label="Volver las curvas a su sitio">↺</Boton>
        {res
          ? <Boton primario onClick={seguir} data-siguiente>{n + 1 >= sucesos.length ? H4.terminar : H4.siguiente}</Boton>
          : <Boton primario onClick={revelar} disabled={!resp} data-revelar>{H4.revelar}</Boton>}
      </div>
    </MarcoHacer>
  );
}
