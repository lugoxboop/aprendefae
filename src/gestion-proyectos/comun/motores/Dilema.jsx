/*
 * GESTIÓN DE PROYECTOS · MOTOR «DILEMA» (H14, decisiones encadenadas).
 *
 * Exploratorio: no hay clave, hay consecuencias. Cada decisión mueve los
 * cuatro medidores del código del PMI (flecha y la palabra «sube» o «baja»,
 * no solo color) y deja su retro. El proveedor no es mascota: es el sobre.
 * Qué valor mueve cada acción es criterio de Gen (vive en textos.js).
 */
import { useRef, useState } from "react";
import { Boton } from "../../../macro2026/comun/ui.jsx";
import { Personaje } from "../elenco.jsx";
import { Objeto } from "../objetos.jsx";

const CSS = `
.gp-tablero { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 12px; padding: 10px 12px; border-radius: 12px; background: rgba(8,16,30,.8); border: 1px solid rgba(244,245,247,.3); }
.gp-valor { display: grid; gap: 4px; font: 600 13px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
.gp-valor-cab { display: flex; justify-content: space-between; gap: 4px; }
.gp-cambio { font: 700 12px/16px var(--planck-font-mono, monospace); }
.gp-dilema-op { display: block; width: 100%; min-height: 52px; margin-top: 8px; padding: 10px 12px; border-radius: 12px; border: 2px solid rgba(244,245,247,.6); background: rgba(8,16,30,.78); color: #f4f5f7; font: 600 15px/1.35 var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: pointer; }
.gp-dilema-op[aria-pressed="true"] { border-color: #f4f5f7; background: rgba(31,50,80,.95); }
.gp-dilema-op:disabled { cursor: default; opacity: .6; }
.gp-dilema-op[aria-pressed="true"]:disabled { opacity: 1; }
`;

const PASO = 0.2;

export default function Dilema({ paso, escena = {}, alTerminar, valores }) {
  const [k, setK] = useState(0);
  const [nivel, setNivel] = useState(() => Object.fromEntries(valores.map((v) => [v.id, 0.5])));
  const [ultimo, setUltimo] = useState({});
  const [elegida, setElegida] = useState(null);
  const detalle = useRef([]);
  const p = paso.pasos[k];

  const elegir = (o) => {
    if (elegida) return;
    setElegida(o);
    setUltimo(o.efecto);
    setNivel((n) => {
      const m = { ...n };
      for (const [v, d] of Object.entries(o.efecto)) m[v] = Math.max(0, Math.min(1, m[v] + d * PASO));
      return m;
    });
    detalle.current.push({ item: `${p.id}:${o.id}`, ok: Object.values(o.efecto).every((d) => d > 0), subtemas: ["gp-etica"] });
  };

  const seguir = () => {
    if (k + 1 >= paso.pasos.length) { alTerminar({ detalle: detalle.current, puntos: 0, medidores: nivel }); return; }
    setK(k + 1);
    setElegida(null);
    setUltimo({});
  };

  return (
    <div data-motor="dilema">
      <style>{CSS}</style>
      <div className="gp-visual" data-visual="dilema" style={{ "--gp-a": escena.fondo?.[0], "--gp-b": escena.fondo?.[1], "--gp-acento": escena.acento }}>
        <div className="gp-tablero" role="group" aria-label="Los cuatro valores del código">
          {valores.map((v) => {
            const d = ultimo[v.id];
            return (
              <div key={v.id} className="gp-valor" data-valor={v.id} data-nivel={nivel[v.id].toFixed(1)}>
                <span className="gp-valor-cab">
                  <span>{v.nombre}</span>
                  {d ? <span className="gp-cambio da26-entra">{d > 0 ? "▲ sube" : d < -1 ? "▼▼ baja" : "▼ baja"}</span> : null}
                </span>
                <span className="gp-medidor" aria-hidden="true"><span style={{ transform: `scaleX(${nivel[v.id]})` }} /></span>
              </div>
            );
          })}
        </div>
        <div className="gp-mesa" style={{ marginTop: 10 }}>
          <Personaje quien="tu" alto={124} />
          <div className="gp-centro">
            <p className="gp-contexto" data-paso-dilema={p.id}><small>{k + 1} / {paso.pasos.length}</small>{p.titulo}</p>
            <Objeto id={k === 0 ? "sobre-boleto" : k === 1 ? "portapapeles" : "telefono-antiguo"} alto={96} />
          </div>
        </div>
        <div role="group" aria-label="Qué haces">
          {p.opciones.map((o) => (
            <button key={o.id} type="button" className="gp-dilema-op" data-opcion-dilema={o.id} aria-pressed={elegida?.id === o.id} disabled={Boolean(elegida)} onClick={() => elegir(o)}>
              {o.texto}
            </button>
          ))}
        </div>
      </div>
      {elegida && (
        <>
          <p className="da26-retro da26-entra" data-estado="info" data-retro>{elegida.retro}</p>
          <div className="gp-pie"><Boton primario onClick={seguir} data-seguir>{k + 1 >= paso.pasos.length ? "Ver los medidores" : "Seguir"}</Boton></div>
        </>
      )}
    </div>
  );
}
