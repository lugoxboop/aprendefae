/*
 * El microvideo abre la Aprender: primero la historia (video de Jane), después
 * la pieza interactiva de siempre, sin tocarla. Solo se agrega: la pieza y sus
 * pantallas quedan iguales, y quien quiera puede saltar el video.
 *
 * Uso: conVideo(() => import("./A1Carrito.jsx"), "da26-a1-carrito") dentro de lazy().
 */
import { lazy, Suspense, useState } from "react";
import { Sparkles, Play } from "lucide-react";
import { Boton } from "./ui.jsx";
import { INK, INK_2 } from "./colores-da.js";
import { MICROVIDEOS } from "./microvideos.js";
import { simuladorDe, AVISO_IA } from "../simulador/escenas.js";

/* El simulador con IA solo se descarga cuando alguien abre su pestaña o su columna. */
const Simulador = lazy(() => import("../simulador/Simulador.jsx"));

function TarjetaVideo({ id, onSeguir, onSimulador = null }) {
  const v = MICROVIDEOS[id];
  return (
    <div className="da26-tarjeta" data-pieza={id} data-microvideo>
      <p className="da26-rotulo da26-mono" style={{ margin: 0 }}>Microvideo · {v.segundos} s</p>
      <h3 style={{ margin: "4px 0 10px", color: INK, fontSize: 20 }}>{v.titulo}</h3>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {/* Ancho y alto enteros (9:16) para que la página no salte al cargar. */}
        <video
          controls
          playsInline
          preload="metadata"
          width={360}
          height={640}
          poster={v.poster}
          aria-label={`Microvideo: ${v.titulo} (${v.segundos} segundos, con subtítulos)`}
          style={{ width: "100%", maxWidth: 320, height: "auto", borderRadius: 14, background: "#2A1E17", display: "block" }}
        >
          <source src={v.src} type="video/mp4" />
        </video>
      </div>
      <details className="da26-rotulo" style={{ margin: "10px 0 0" }} data-transcripcion>
        <summary style={{ cursor: "pointer", color: INK_2 }}>Leer lo que dice el video</summary>
        <div style={{ marginTop: 8, color: INK, lineHeight: 1.5 }}>
          {v.transcripcion.map((t, k) => <p key={k} style={{ margin: "0 0 6px" }}>{t}</p>)}
        </div>
      </details>
      {onSimulador && (
        <button type="button" className="sim-invita" onClick={onSimulador} data-ir-simulador>
          <Sparkles size={18} aria-hidden="true" />
          <span><b>¿Ya lo viste? Ahora vívelo.</b><br />Entra a la oficina del simulador con IA.</span>
        </button>
      )}
      <div className="da26-nav">
        <span />
        <Boton primario onClick={onSeguir} data-siguiente data-ir-a-pieza>Ahora, a moverlo tú</Boton>
      </div>
    </div>
  );
}

/*
 * ═══════════ EL SIMULADOR CON IA, AL LADO DEL VIDEO (orden de Mateo, 26-nov) ═══════════
 *
 * Pantalla ancha (≥ 900 px): dos columnas, el video a la izquierda y la
 * oficina del simulador a la derecha, las dos vivas a la vez.
 * Celular: dos pestañas arriba («Video» y «Simulador con IA»), y al pie del
 * video una invitación a entrar a la oficina. El botón de siempre, «Ahora, a
 * moverlo tú», sigue llevando a la pieza interactiva.
 *
 * Solo se enciende con `{ simulador: true }` y si el escenario existe: hoy,
 * únicamente en la vista previa sin publicar.
 */
const CSS_LADO = `
.sim-lado { max-width: 1080px; margin: 0 auto; display: grid; gap: 12px; }
.sim-pestanas { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px; border-radius: 999px; background: #0E1B2E; border: 1px solid #3a4a63; max-width: 640px; width: 100%; margin: 0 auto; }
.sim-pestanas button { min-height: 44px; border-radius: 999px; border: 0; background: transparent; color: #b6bbc5; font: 700 14px/18px var(--planck-font-sans, system-ui, sans-serif); display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; }
.sim-pestanas button[aria-selected="true"] { background: #f4f5f7; color: #121418; }
.sim-pestanas button[data-ia] svg { stroke: #2A9D8F; }
@media (max-width: 360px) { .sim-pestanas button { font-size: 13px; gap: 4px; } }
.sim-columnas { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; }
.sim-lado > * { min-width: 0; }
.sim-columnas > [data-visible="0"] { display: none; }
.sim-col-sim { max-width: 640px; width: 100%; margin: 0 auto; }
.sim-invita { display: flex; gap: 10px; align-items: center; width: 100%; margin-top: 12px; padding: 12px 14px; border-radius: 14px; border: 1px solid #5FD3C3; background: linear-gradient(135deg, rgba(95,211,195,.16), rgba(95,211,195,.04)); color: #f4f5f7; font: 400 14px/19px var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: pointer; }
.sim-invita svg { color: #5FD3C3; flex: none; }
@media (min-width: 900px) {
  .sim-pestanas, .sim-invita { display: none; }
  .sim-columnas { grid-template-columns: minmax(300px, 380px) minmax(0, 1fr); align-items: start; }
  .sim-columnas > [data-visible="0"] { display: block; }
  .sim-columnas .da26-tarjeta { max-width: none; margin: 0; }
  .sim-col-sim { max-width: none; }
}
`;

function VideoYSimulador({ id, onSeguir }) {
  const [pestana, setPestana] = useState("video");
  const v = MICROVIDEOS[id];
  return (
    <div className="sim-lado" data-con-simulador={id}>
      <style>{CSS_LADO}</style>
      <div className="sim-pestanas" role="tablist" aria-label="Cómo aprender este tema">
        <button type="button" role="tab" aria-selected={pestana === "video"} onClick={() => setPestana("video")} data-pestana="video">
          <Play size={16} aria-hidden="true" />Video · {v.segundos} s
        </button>
        <button type="button" role="tab" aria-selected={pestana === "simulador"} onClick={() => setPestana("simulador")} data-pestana="simulador" data-ia>
          <Sparkles size={16} aria-hidden="true" />Simulador con IA
        </button>
      </div>
      <div className="sim-columnas">
        <div data-visible={pestana === "video" ? "1" : "0"}>
          <TarjetaVideo id={id} onSeguir={onSeguir} onSimulador={() => { setPestana("simulador"); window.scrollTo?.({ top: 0 }); }} />
        </div>
        <div className="sim-col-sim da26-tarjeta" data-visible={pestana === "simulador" ? "1" : "0"} aria-label={AVISO_IA}>
          <Suspense fallback={<div style={{ minHeight: 320 }} />}>
            <Simulador escenaId={id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export function conVideo(cargar, id, { simulador = false } = {}) {
  return cargar().then((m) => {
    const Pieza = m.default;
    if (!MICROVIDEOS[id]) return m;
    function PiezaConVideo(props) {
      const [visto, setVisto] = useState(false);
      if (visto) return <Pieza {...props} />;
      return simulador && simuladorDe(id)
        ? <VideoYSimulador id={id} onSeguir={() => setVisto(true)} />
        : <TarjetaVideo id={id} onSeguir={() => setVisto(true)} />;
    }
    return { ...m, default: PiezaConVideo };
  });
}
