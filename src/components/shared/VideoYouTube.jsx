import { useEffect, useRef, useState } from "react";
import { FAE } from "../../theme.js";

/*
 * Video de YouTube embebido, para los bloques de "Aprender".
 *
 * Tres decisiones que conviene no deshacer sin pensarlo:
 *
 * 1. Dominio youtube-nocookie.com. Es el modo con privacidad mejorada: YouTube
 *    no escribe cookies de seguimiento hasta que el estudiante le da play.
 *
 * 2. El reproductor no se toca. Su logo, sus controles y su marca quedan tal
 *    como YouTube los entrega, porque ocultarlos incumple sus términos de uso.
 *    Lo que diseñamos es el marco alrededor, nunca lo de adentro.
 *
 * 3. El iframe no existe hasta que la sección entra en pantalla. Un iframe de
 *    YouTube pesa cientos de kB y abre conexiones incluso sin reproducir nada:
 *    montarlo con el resto de la página le cobraría ese peso a todo el que
 *    nunca baja hasta aquí.
 *
 * El id del video llega por prop y nunca se escribe aquí: este componente no
 * sabe ni tiene por qué saber qué video va en qué tema.
 */

/* Margen de anticipación: empieza a cargar un poco antes de entrar en pantalla. */
const ANTICIPACION = "200px";

export default function VideoYouTube({ videoId, titulo, canal, nota }) {
  const contenedor = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    /*
     * Sin IntersectionObserver se carga de una: un navegador viejo se queda
     * sin la optimización, no sin el video.
     */
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const nodo = contenedor.current;
    if (!nodo) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisible(true);
          observador.disconnect(); // una sola vez: ya no hay nada que vigilar
        }
      },
      { rootMargin: ANTICIPACION }
    );

    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  /*
   * Sin id no hay bloque. Los videos los define Gen y van llegando tema por
   * tema: un tema sin video todavía simplemente no lo muestra, igual que una
   * actividad sin clasificar no lleva insignia.
   */
  if (!videoId) return null;

  const etiquetaCanal = canal ? `Video de ${canal}` : "Video de un canal externo";

  return (
    <figure
      ref={contenedor}
      style={{
        margin: "0 0 20px",
        borderRadius: "18px",
        background: "rgba(248,249,250,0.04)",
        border: "1px solid rgba(248,249,250,0.12)",
        boxShadow: "0 8px 28px rgba(0,0,0,0.28)",
        overflow: "hidden",
      }}
    >
      {/* ---------- cabecera del marco: de quién es lo que se va a ver ---------- */}
      <figcaption
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
          padding: "14px 18px 12px",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontFamily: "Sora, sans-serif",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: FAE.teal,
              margin: "0 0 4px",
            }}
          >
            CONTENIDO EXTERNO
          </p>
          {titulo && (
            <p
              style={{
                fontFamily: "Sora, sans-serif",
                fontWeight: 600,
                fontSize: "15.5px",
                lineHeight: 1.3,
                color: FAE.text,
                margin: 0,
              }}
            >
              {titulo}
            </p>
          )}
        </div>
        <p style={{ fontSize: "13px", color: "rgba(248,249,250,0.55)", margin: 0, whiteSpace: "nowrap" }}>
          {etiquetaCanal}
        </p>
      </figcaption>

      {/*
       * La caja de 16:9 se reserva desde el primer render, cargue o no el
       * iframe: así la página no da un salto cuando el video aparece.
       */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: "rgba(0,0,0,0.35)" }}>
        {visible ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`}
            title={titulo ? `${titulo} — ${etiquetaCanal}` : etiquetaCanal}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", display: "block" }}
          />
        ) : (
          /* Marcador de posición mientras la sección no ha entrado en pantalla. */
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              /* 0,35 daba 3,1:1. Es el texto que explica por qué el video
                 todavía no se ve: si no se lee, parece que está roto. */
              color: "rgba(248,249,250,0.72)",
            }}
          >
            El video carga al llegar aquí
          </div>
        )}
      </div>

      {/* ---------- pie: la advertencia honesta, siempre visible ---------- */}
      <p
        style={{
          fontSize: "12.5px",
          lineHeight: 1.55,
          /* 0,5 daba 3,1:1 sobre esta superficie y el mínimo es 4,5. Es el
             aviso de que el video no es nuestro y de qué recibe YouTube: la
             letra que menos se puede permitir ser ilegible. */
          color: "rgba(248,249,250,0.72)",
          margin: 0,
          padding: "11px 18px 14px",
          borderTop: "1px solid rgba(248,249,250,0.08)",
        }}
      >
        {nota ? nota + " " : ""}
        Este video no es material de AprendeFAE: se reproduce desde YouTube en modo de privacidad
        mejorada. Al darle play, YouTube recibe datos técnicos de tu conexión.{" "}
        <a
          href="/privacidad"
          style={{ color: "rgba(248,249,250,0.7)", textDecoration: "underline", textUnderlineOffset: "2px" }}
        >
          Más en la política de privacidad
        </a>
        .
      </p>
    </figure>
  );
}
