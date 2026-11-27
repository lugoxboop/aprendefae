/*
 * Tarjeta de un microvideo de Gestión de Proyectos: el video 9:16 con subtítulos
 * quemados y, debajo, la transcripción para quien no puede o no quiere oírlo.
 * Mismo formato que la TarjetaVideo de Macro 2026 (src/macro2026/comun/ConVideo.jsx).
 */
import { MICROVIDEOS } from "./microvideos.js";

export default function Microvideo({ id }) {
  const v = MICROVIDEOS[id];
  if (!v) return null;
  return (
    <figure className="gp-video" data-microvideo={id} style={{ margin: "10px 0 0", maxWidth: 320 }}>
      {/* Ancho y alto enteros (9:16) para que la página no salte al cargar. */}
      <video
        controls
        playsInline
        preload="metadata"
        width={360}
        height={640}
        poster={v.poster}
        aria-label={`Microvideo: ${v.titulo} (${v.segundos} segundos, con subtítulos)`}
        style={{ width: "100%", height: "auto", borderRadius: 14, background: "#2A1E17", display: "block" }}
      >
        <source src={v.src} type="video/mp4" />
      </video>
      <figcaption style={{ fontSize: 13, marginTop: 6 }}>
        <b>{v.titulo}</b> · {v.segundos} s
      </figcaption>
      <details style={{ fontSize: 13, marginTop: 4 }} data-transcripcion>
        <summary style={{ cursor: "pointer", minHeight: 24 }}>Leer lo que dice el video</summary>
        {v.transcripcion.map((t, k) => <p key={k} style={{ margin: "6px 0 0", lineHeight: 1.5 }}>{t}</p>)}
      </details>
    </figure>
  );
}
