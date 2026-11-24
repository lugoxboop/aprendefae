/*
 * H6 · Lleva la economía a la meta (da26-h6-meta, Hacer, Medio, 25 × 3 FP × %).
 * Especificación de Gen §2 H6. La gráfica de A5 con la recta de 45° siempre
 * visible, el cruce Y₀ y la banderita «Meta». UNA palanca por etapa y «Fijar».
 * Se mueve libre; solo «Fijar» cuenta. Etapa lograda si se fija dentro de
 * ±25 en ≤ 3 «Fijar». Pista tras el 2.º fallo; tras el 3.º, la palanca se
 * anima al valor correcto y se pasa a la siguiente. Puntaje = logradas / 3.
 * El modelo y las cifras viven en comun/modelo-da.js (ETAPAS_H6).
 */
import { useEffect, useState } from "react";
import { ETAPAS_H6, FIJAR_MAX_H6, arranque, fmtEntero, juzgarH6, modelo, pendiente, produccion } from "../comun/modelo-da.js";
import GraficaDA from "../comun/GraficaDA.jsx";
import { Boton, Deslizador, MarcoHacer, Retro, movimientoReducido, useCronometro } from "../comun/ui.jsx";
import { CONSIGNAS, ESCENAS } from "./textos.js";
import { INK_2 } from "../comun/colores-da.js";

export const ID = "da26-h6-meta";

const fmtValor = (e) => (v) => (e.id === "e1" ? fmtEntero(v) : `${String(v).replace(".", ",")}${e.unidad}`);

export default function H6Meta({ onTerminar }) {
  const tiempo = useCronometro();
  const [k, setK] = useState(0);
  const e = ETAPAS_H6[k];
  const [valor, setValor] = useState(e.inicio);
  const [fijados, setFijados] = useState(0);
  const [estado, setEstado] = useState("jugando"); /* jugando · lograda · resuelta */
  const [retro, setRetro] = useState(null);
  const [detalle, setDetalle] = useState([]);

  const p = modelo(e.aModelo(valor));
  const y0 = produccion(p);

  /* Tras el 3.er «Fijar» fallido la palanca va sola al valor correcto. */
  useEffect(() => {
    if (estado !== "resuelta") return undefined;
    if (movimientoReducido()) { setValor(e.solucion); return undefined; }
    const desde = valor, ini = performance.now();
    let marco = 0;
    const paso = (t) => {
      const u = Math.min(1, (t - ini) / 600);
      const v = desde + (e.solucion - desde) * (1 - (1 - u) ** 3);
      setValor(u < 1 ? Math.round(v / e.paso) * e.paso : e.solucion);
      if (u < 1) marco = requestAnimationFrame(paso);
    };
    marco = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(marco);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  const fijar = () => {
    const j = juzgarH6(e, valor);
    const n = fijados + 1;
    setFijados(n);
    if (j.estado === "dentro") {
      setEstado("lograda");
      setRetro(null);
      setDetalle((d) => [...d, { item: `h6-${e.id}`, ok: true, subtemas: e.subtemas }]);
      return;
    }
    setRetro(j.estado === "arriba" ? e.arriba : e.abajo);
    if (n >= FIJAR_MAX_H6) {
      setEstado("resuelta");
      setDetalle((d) => [...d, { item: `h6-${e.id}`, ok: false, subtemas: e.subtemas }]);
    }
  };

  const seguir = () => {
    if (k + 1 >= ETAPAS_H6.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / ETAPAS_H6.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    const sig = ETAPAS_H6[k + 1];
    setK(k + 1);
    setValor(sig.inicio);
    setFijados(0);
    setEstado("jugando");
    setRetro(null);
  };

  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} escena={ESCENAS[ID]}
      mini={{ texto: e.contexto, datos: { "data-contexto": e.id } }} progreso={`${k + 1} / ${ETAPAS_H6.length}`}>
      <p className="da26-rotulo da26-mono" style={{ margin: "0 0 2px" }} data-etapa={e.id}>ETAPA {k + 1} · {e.nombre.toUpperCase()}</p>
      <div data-figura>
        <GraficaDA lineas={[{ id: "da", arranque: arranque(p), pendiente: pendiente(p) }]} bisectriz y0={y0} meta={e.meta}
          titulo={`Producción de equilibrio ${fmtEntero(y0)}; meta ${fmtEntero(e.meta)}`} />
      </div>
      <p style={{ display: "flex", justifyContent: "space-between", margin: "4px 0 0", fontSize: 14, color: INK_2 }}>
        <span>Y₀ = <strong className="da26-mono" style={{ color: "#f4f5f7", fontSize: 17 }} data-y0-vivo={Math.round(y0)}>{fmtEntero(y0)}</strong></span>
        <span>Meta = <strong className="da26-mono" style={{ color: "#f4f5f7", fontSize: 17 }}>{fmtEntero(e.meta)}</strong></span>
      </p>
      <div className="da26-controles">
        <Deslizador id={`h6-${e.id}`} etiqueta={e.palanca} min={e.min} max={e.max} paso={e.paso} valor={valor}
          onCambio={setValor} formato={fmtValor(e)} disabled={estado !== "jugando"} />
      </div>
      {estado !== "lograda" && retro && <Retro estado="mal" key={`${e.id}-${fijados}`}>{retro}</Retro>}
      {estado === "jugando" && fijados >= 2 && <Retro estado="info" data-pista>{e.pista}</Retro>}
      {estado === "lograda" && <Retro estado="bien">Meta: {fmtEntero(y0)}</Retro>}
      <div className="da26-nav">
        <span className="da26-rotulo da26-mono" style={{ alignSelf: "center" }} data-fijados>{fijados} / {FIJAR_MAX_H6}</span>
        {estado === "jugando"
          ? <Boton primario onClick={fijar} data-fijar>Fijar</Boton>
          : <Boton primario onClick={seguir} data-siguiente>{k + 1 >= ETAPAS_H6.length ? "Terminar" : "Siguiente etapa"}</Boton>}
      </div>
    </MarcoHacer>
  );
}
