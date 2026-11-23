/*
 * H5 · Las dos montañas (pf26-h5-montanas, Hacer, Medio, 25 FP × %).
 * Especificación de Gen, t3 §2 H5. Las dos montañas de A4 (interna y
 * externa) y cinco microdesafíos seguidos; cada uno cambia algo en ellas:
 *   1. un deslizador parte 1.194 en dos (interna 840 ± 30);
 *   2. cuatro banderas de acreedores a su montaña;
 *   3. el papel con que se presta la interna se pega a su montaña;
 *   4. la cubeta va a «Saldo» o a «Servicio de la deuda»;
 *   5. dos cables: interna y externa → tasa de interés y tipo de cambio.
 * Un error da su retro y se reintenta; el reto ya no suma.
 * Puntaje = retos resueltos al primer intento / 5.
 */
import { useState } from "react";
import { BORDE, CORAL, FONDO, INK, INK_2, SUPERFICIE_2 } from "../comun/colores-da.js";
import { fmtEntero } from "../comun/modelo-da.js";
import { Boton, Deslizador, MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { useArrastre } from "../comun/arrastre.js";
import { colorRama } from "../comun/ramas.js";
import { CONSIGNAS, H5 } from "./textos.js";

export const ID = "pf26-h5-montanas";
const AGUA = colorRama("fiscal");
const TOTAL = 1194;

const CSS = `
.pf26-h5-montes { display: block; width: 100%; max-width: 320px; margin: 0 auto; }
.pf26-h5-reto { font: 600 15px/1.35 var(--planck-font-sans, system-ui, sans-serif); margin: 10px 0 8px; }
.pf26-h5-fila { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
.pf26-h5-ficha { min-height: 44px; padding: 6px 12px; border-radius: 999px; border: 2px solid ${INK_2}; background: ${SUPERFICIE_2}; color: ${INK}; font: 600 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: grab; touch-action: none; -webkit-user-select: none; user-select: none; }
.pf26-h5-ficha[aria-pressed="true"] { box-shadow: 0 0 0 3px ${INK}; }
.pf26-h5-ficha[data-estado="mal"] { border-color: ${CORAL}; }
.pf26-h5-destinos { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; margin-top: 8px; }
.pf26-h5-destino { display: flex; flex-direction: column; align-items: center; gap: 4px; min-height: 76px; padding: 8px 6px; border-radius: 12px; border: 2px dashed ${BORDE}; background: ${FONDO}; color: ${INK}; font: 700 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.pf26-h5-destino[data-blanco="1"] { border-color: ${INK}; }
.pf26-h5-destino[aria-pressed="true"] { border-style: solid; border-color: ${INK}; }
.pf26-h5-puesta { font: 500 12px/1.25 var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; text-align: center; }
.pf26-h5-cable { min-height: 44px; padding: 6px 12px; border-radius: 12px; border: 2px solid ${AGUA}; background: ${FONDO}; color: ${INK}; font: 700 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.pf26-h5-cable[aria-pressed="true"] { background: ${SUPERFICIE_2}; box-shadow: 0 0 0 3px ${INK}; }
`;

function Montanas({ interna, externa, etiquetas = {} }) {
  const alto = (v) => Math.max(6, (110 * v) / 840);
  const pico = (cx, v, id, nombre) => {
    const h = alto(v);
    return (
      <g data-montana={id} data-valor={Math.round(v)}>
        <path className="pf26-h5-monte" d={`M${cx - 66} 132 L${cx} ${132 - h} L${cx + 66} 132 Z`} fill="none" stroke={AGUA} strokeWidth="3" strokeLinejoin="round" />
        <text x={cx} y={Math.max(16, 126 - h)} textAnchor="middle" fill={INK} fontSize="15" fontWeight="700" className="da26-mono">{fmtEntero(v)}</text>
        <text x={cx} y="152" textAnchor="middle" fill={INK} fontSize="15" fontWeight="600">{nombre}</text>
        {etiquetas[id] && <text x={cx} y={Math.max(34, 146 - h / 2)} textAnchor="middle" fill={INK} fontSize="13" fontWeight="700">{etiquetas[id]}</text>}
      </g>
    );
  };
  return (
    <svg className="pf26-h5-montes" viewBox="0 0 300 160" style={{ width: "100%", height: "auto" }} role="img" aria-label={`${H5.interna} ${fmtEntero(interna)}, ${H5.externa} ${fmtEntero(externa)}`}>
      <path d="M4 132h292" stroke={BORDE} strokeWidth="2" />
      {pico(78, interna, "interna", H5.interna)}
      {pico(222, externa, "externa", H5.externa)}
    </svg>
  );
}

export default function H5Montanas({ onTerminar }) {
  const tiempo = useCronometro();
  const [k, setK] = useState(0);
  const [fallo, setFallo] = useState(false);
  const [resuelto, setResuelto] = useState(false);
  const [detalle, setDetalle] = useState([]);
  const [retro, setRetro] = useState(null);
  const [mal, setMal] = useState(0);
  const [rojo, setRojo] = useState(null);
  /* Estado de cada reto. */
  const [division, setDivision] = useState(H5.retos[0].inicial);
  const [banderas, setBanderas] = useState({});
  const [papel, setPapel] = useState(null);
  const [cubeta, setCubeta] = useState(null);
  const [cables, setCables] = useState({});
  const [cableElegido, setCableElegido] = useState(null);
  const reto = H5.retos[k];

  const error = (texto, id = null) => {
    setFallo(true);
    setRetro(texto);
    setMal((m) => m + 1);
    setRojo(id);
    setTimeout(() => setRojo(null), 300);
  };
  const acierto = () => {
    setResuelto(true);
    setRetro(null);
    setDetalle((d) => [...d, { item: reto.id, ok: !fallo, subtemas: reto.subtemas }]);
  };

  const soltar = (id, destino) => {
    if (resuelto) return;
    if (reto.id === "acreedores") {
      const b = reto.banderas.find((x) => x.id === id);
      if (destino !== b.correcta) { error(b.retro, id); return; }
      const nuevas = { ...banderas, [id]: destino };
      setBanderas(nuevas);
      setRetro(null);
      if (Object.keys(nuevas).length === reto.banderas.length) acierto();
    }
    if (reto.id === "cubeta") {
      if (destino !== reto.correcta) { error(reto.retro, "cubeta"); return; }
      setCubeta(destino);
      acierto();
    }
  };
  const { contenedor, pieza, destino } = useArrastre({ alSoltar: soltar, activo: !resuelto });

  const seguir = () => {
    if (k + 1 >= H5.retos.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / H5.retos.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setK(k + 1);
    setFallo(false);
    setResuelto(false);
    setRetro(null);
  };

  /* Lo que cada reto deja en las montañas. */
  const interna = k === 0 ? division : 840;
  const externa = k === 0 ? TOTAL - division : 354;
  const etiquetas = {};
  if (papel === "tes") etiquetas.interna = "TES";

  let cuerpo = null;
  if (reto.id === "division") {
    cuerpo = (
      <>
        <Deslizador id="h5-division" etiqueta={H5.interna} min={reto.min} max={reto.max} paso={reto.paso} valor={division}
          onCambio={(v) => { if (!resuelto) setDivision(v); }} formato={fmtEntero} extremos={["0", fmtEntero(TOTAL)]} colorRelleno={AGUA} disabled={resuelto} />
        {!resuelto && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
            <Boton data-comprobar onClick={() => {
              if (Math.abs(division - reto.correcta) <= reto.tolerancia) acierto();
              else error(division < reto.correcta ? reto.retroBajo : reto.retroAlto);
            }}>{H5.comprobar}</Boton>
          </div>
        )}
      </>
    );
  } else if (reto.id === "acreedores") {
    cuerpo = (
      <>
        <div className="pf26-h5-fila" role="group" aria-label="Acreedores">
          {reto.banderas.filter((b) => !banderas[b.id]).map((b) => (
            <button key={`${b.id}-${mal}`} type="button" className={`pf26-h5-ficha${rojo === b.id ? " da26-tiembla" : ""}`} data-bandera={b.id}
              data-estado={rojo === b.id ? "mal" : undefined} {...pieza(b.id)}>⚑ {b.texto}</button>
          ))}
        </div>
        <div className="pf26-h5-destinos">
          {["interna", "externa"].map((m) => (
            <button key={m} type="button" className="pf26-h5-destino" data-destino-montana={m} {...destino(m)}>
              {H5[m]}
              {reto.banderas.filter((b) => banderas[b.id] === m).map((b) => <span key={b.id} className="pf26-h5-puesta da26-entra">⚑ {b.texto}</span>)}
            </button>
          ))}
        </div>
      </>
    );
  } else if (reto.id === "papel") {
    cuerpo = (
      <div className="pf26-h5-fila" role="group" aria-label="Papeles">
        {reto.papeles.map((x) => (
          <button key={x.id} type="button" className={`pf26-h5-ficha${rojo === x.id ? " da26-tiembla" : ""}`} data-papel={x.id}
            data-estado={rojo === x.id ? "mal" : undefined} aria-pressed={papel === x.id} disabled={resuelto}
            onClick={() => { if (x.id === reto.correcta) { setPapel(x.id); acierto(); } else error(x.retro, x.id); }}>{x.texto}</button>
        ))}
      </div>
    );
  } else if (reto.id === "cubeta") {
    cuerpo = (
      <>
        {!cubeta && (
          <div className="pf26-h5-fila">
            <button key={`cubeta-${mal}`} type="button" className={`pf26-h5-ficha${rojo === "cubeta" ? " da26-tiembla" : ""}`} data-cubeta
              data-estado={rojo === "cubeta" ? "mal" : undefined} {...pieza("cubeta")}>{reto.cubeta}</button>
          </div>
        )}
        <div className="pf26-h5-destinos">
          {reto.destinos.map((d) => (
            <button key={d.id} type="button" className="pf26-h5-destino" data-destino-cubeta={d.id} aria-pressed={cubeta === d.id} {...destino(d.id, "cubeta")}>
              {d.texto}
              {cubeta === d.id && <span className="pf26-h5-puesta da26-entra">{reto.cubeta}</span>}
            </button>
          ))}
        </div>
      </>
    );
  } else {
    const conectar = (toma) => {
      if (!cableElegido || resuelto) return;
      const nuevos = { ...cables, [cableElegido]: toma };
      setCables(nuevos);
      setCableElegido(null);
      if (nuevos.interna && nuevos.externa) {
        if (nuevos.interna === reto.correcta.interna && nuevos.externa === reto.correcta.externa) acierto();
        else { error(reto.retro); setCables({}); }
      }
    };
    cuerpo = (
      <div className="pf26-h5-destinos" style={{ alignItems: "start" }}>
        <div style={{ display: "grid", gap: 8 }} role="group" aria-label="Deudas">
          {["interna", "externa"].map((c) => (
            <button key={c} type="button" className="pf26-h5-cable" data-cable={c} aria-pressed={cableElegido === c} disabled={resuelto || Boolean(cables[c])}
              onClick={() => setCableElegido(c)}>
              {H5[c]}{cables[c] ? ` → ${reto.tomas.find((x) => x.id === cables[c]).texto}` : ""}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gap: 8 }} role="group" aria-label="Lo que puede mover">
          {reto.tomas.map((x) => (
            <button key={x.id} type="button" className="pf26-h5-destino" style={{ minHeight: 44 }} data-toma={x.id} disabled={resuelto || !cableElegido} onClick={() => conectar(x.id)}>{x.texto}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} progreso={`${k + 1} / ${H5.retos.length}`}>
      <style>{CSS}</style>
      <div data-figura ref={contenedor} data-reto={reto.id}>
        <Montanas interna={interna} externa={externa} etiquetas={etiquetas} />
        <p className="pf26-h5-reto da26-entra" key={reto.id} data-consigna-reto>{reto.consigna}</p>
        {cuerpo}
      </div>
      <Retro estado="mal" key={`r${mal}`}>{retro}</Retro>
      {resuelto && reto.id === "division" && <Retro estado="bien" data-reto-resuelto>{H5.interna} {fmtEntero(division)}</Retro>}
      <div className="da26-nav">
        <span />
        <Boton primario onClick={seguir} disabled={!resuelto} data-siguiente>{k + 1 >= H5.retos.length ? H5.terminar : H5.siguiente}</Boton>
      </div>
    </MarcoHacer>
  );
}
