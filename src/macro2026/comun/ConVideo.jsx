/*
 * El microvideo abre la Aprender: primero la historia (video de Jane), después
 * la pieza interactiva de siempre, sin tocarla. Solo se agrega: la pieza y sus
 * pantallas quedan iguales, y quien quiera puede saltar el video.
 *
 * Uso: conVideo(() => import("./A1Carrito.jsx"), "da26-a1-carrito") dentro de lazy().
 */
import { useState } from "react";
import { Boton } from "./ui.jsx";
import { INK, INK_2 } from "./colores-da.js";
import { MICROVIDEOS } from "./microvideos.js";

function TarjetaVideo({ id, onSeguir }) {
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
      <div className="da26-nav">
        <span />
        <Boton primario onClick={onSeguir} data-siguiente data-ir-a-pieza>Ahora, a moverlo tú</Boton>
      </div>
    </div>
  );
}

export function conVideo(cargar, id) {
  return cargar().then((m) => {
    const Pieza = m.default;
    if (!MICROVIDEOS[id]) return m;
    function PiezaConVideo(props) {
      const [visto, setVisto] = useState(false);
      return visto ? <Pieza {...props} /> : <TarjetaVideo id={id} onSeguir={() => setVisto(true)} />;
    }
    return { ...m, default: PiezaConVideo };
  });
}
