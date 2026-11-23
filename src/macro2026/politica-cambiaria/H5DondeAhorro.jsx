/*
 * H5 · ¿Aquí o afuera? (pc26-h5-donde-ahorro, Hacer, Difícil, 50 FP × %).
 * Especificación de Gen, t5 §2 H5 (casos de la d. 22; cifras verificadas en
 * t5-textos-y-bancos). Dos casos seguidos, tres decisiones cada uno; cada
 * decisión trae su consigna (va en el encabezado). Los imanes de A6 y las
 * barras aquí/afuera muestran el resultado en pesos al decidir. Tras cada
 * caso, su línea de cierre. El inversionista (mascota) acompaña: «monedas»
 * para el ahorro y «ladrillo» para el crédito (nunca «tableta»).
 * Puntaje = decisiones correctas / 6.
 */
import { useState } from "react";
import { Boton, MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { MascotaRol } from "../comun/mascotas.jsx";
import { Barras, CSS_PC, Imanes } from "./comun-pc.jsx";
import { A6, AHORRO, CASOS_H5, CREDITO, H5, afuera, aqui } from "./textos.js";

export const ID = "pc26-h5-donde-ahorro";
const DATOS = { ahorro: AHORRO, credito: CREDITO };
const TOPE = { ahorro: 720, credito: 1260 };
/** Lo que se ve al revelar: millones de pesos aquí y afuera. */
export const resultadoH5 = (d) => ({ aqui: aqui(DATOS[d.caso]), afuera: afuera(DATOS[d.caso], d.dtc) });
const DECISIONES = CASOS_H5.flatMap((c) => c.decisiones);

export default function H5DondeAhorro({ onTerminar }) {
  const tiempo = useCronometro();
  const [k, setK] = useState(0);
  const [eleccion, setEleccion] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const d = DECISIONES[k];
  const caso = CASOS_H5.find((c) => c.id === d.caso);
  const ultimaDelCaso = caso.decisiones[caso.decisiones.length - 1].id === d.id;
  const r = eleccion ? resultadoH5(d) : null;
  const ok = eleccion === d.correcta;

  const decidir = (x) => {
    if (eleccion) return;
    setEleccion(x);
    setDetalle((dd) => [...dd, { item: d.id, ok: x === d.correcta, subtemas: d.subtemas }]);
  };
  const seguir = () => {
    if (k + 1 >= DECISIONES.length) {
      const bien = detalle.filter((x) => x.ok).length;
      onTerminar?.({ pct: Math.round((bien / DECISIONES.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setK(k + 1);
    setEleccion(null);
  };

  return (
    <MarcoHacer id={ID} consigna={d.consigna} progreso={`${k + 1} / ${DECISIONES.length}`}>
      <style>{CSS_PC}</style>
      <p className="pc26-contador da26-entra" key={caso.id} style={{ margin: "0 0 6px", display: "grid", gap: 2 }} data-caso={caso.id}>
        <span style={{ fontWeight: 700 }}>{caso.titulo}</span>
        <span className="da26-mono" style={{ fontSize: 14 }}>{caso.datos}</span>
      </p>
      <div data-figura data-decision={d.id}>
        <Imanes atraccion={r ? (d.correcta === "aqui" ? -0.8 : 0.8) : 0} nombres={[A6.colombia, A6.eeuu]} />
        <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", gap: 8, alignItems: "center", marginTop: 6 }}>
          <MascotaRol id="inversionista" pose={caso.id === "ahorro" ? "monedas" : "ladrillo"} alto={120} />
          <div style={{ display: "grid", gap: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{caso.id === "ahorro" ? H5.recibes : H5.pagas}</span>
            <Barras aqui={r?.aqui ?? null} afuera={r?.afuera ?? null} etiquetas={[H5.aqui, H5.afuera]} max={TOPE[caso.id]} gana={r ? d.correcta : null} />
          </div>
        </div>
      </div>
      <div className="pc26-opciones" role="group" aria-label={d.consigna} style={{ marginTop: 8 }}>
        {[["aqui", H5.aqui], ["afuera", H5.afuera]].map(([id, t]) => (
          <button key={id} type="button" className="pc26-opcion" aria-pressed={eleccion === id} data-eleccion={id} disabled={Boolean(eleccion)}
            data-estado={eleccion === id ? (ok ? "bien" : "mal") : undefined} onClick={() => decidir(id)}>{t}</button>
        ))}
      </div>
      {eleccion && !ok && <Retro estado="mal" data-retro-decision={d.id}>{d.retro}</Retro>}
      {eleccion && ok && <Retro estado="bien">{d.correcta === "aqui" ? H5.aqui : H5.afuera}</Retro>}
      {eleccion && ultimaDelCaso && <Retro estado="info" data-cierre-caso={caso.id}>{caso.cierre}</Retro>}
      <div className="da26-nav">
        <span />
        {eleccion && <Boton primario onClick={seguir} data-siguiente>{k + 1 >= DECISIONES.length ? H5.terminar : ultimaDelCaso ? H5.siguienteCaso : H5.siguiente}</Boton>}
      </div>
    </MarcoHacer>
  );
}
