import { useEffect, useRef } from "react";
import { FAE } from "../theme.js";
import { APRENDER, HACER, ETIQUETAS, actividadesDeTipo } from "../data/subjects.js";
import { CARD_SHELL } from "./SubjectCard.jsx";

/*
 * Tarjeta de tema que se parte en dos al tocarla.
 *
 * Al hacer clic no navega: la misma tarjeta cambia de cara en el sitio donde
 * está. El título se desvanece y en su lugar entran "Aprender" y "Hacer", que
 * ya sí llevan a la vista filtrada. Es una tarjeta en otro estado, no un
 * diálogo encima: no hay velo, no hay salto de posición y la tarjeta conserva
 * su tamaño, así que el resto de la rejilla no se mueve.
 *
 * Las dos caras se apilan en la misma celda de un grid y hacen fundido cruzado.
 * Superponerlas —en vez de sustituir una por otra— es lo que permite animar la
 * transición: si se desmontara la cara cerrada no habría nada que fundir.
 *
 * Qué opciones se ofrecen sale del dato: una opción sin actividades de ese tipo
 * se muestra igual, deshabilitada y diciendo que aún no hay contenido. No se
 * esconde. Un tema a medio construir se ve a medio construir.
 */

const OPCIONES = [
  {
    tipo: APRENDER,
    color: FAE.teal,
    fondo: "rgba(42,157,143,0.14)",
    borde: "rgba(42,157,143,0.55)",
    descripcion: "El material que explica el tema",
  },
  {
    tipo: HACER,
    color: FAE.coral,
    fondo: "rgba(231,111,81,0.16)",
    borde: "rgba(231,111,81,0.62)",
    descripcion: "Los juegos que dan FP",
  },
];

function contar(n) {
  return n === 1 ? "1 actividad" : `${n} actividades`;
}

function BotonModo({ opcion, cantidad, onClick }) {
  const disponible = cantidad > 0;
  return (
    <button
      type="button"
      disabled={!disponible}
      onClick={onClick}
      className="fae-modo"
      aria-label={
        disponible
          ? `${ETIQUETAS[opcion.tipo]} — ${contar(cantidad)}`
          : `${ETIQUETAS[opcion.tipo]} — aún no disponible`
      }
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: "5px",
        flex: 1,
        minWidth: 0,
        padding: "clamp(12px, 1.8vh, 16px) clamp(12px, 1.6vw, 16px)",
        borderRadius: "13px",
        cursor: disponible ? "pointer" : "default",
        font: "inherit",
        textAlign: "left",
        background: disponible ? opcion.fondo : "rgba(248,249,250,0.03)",
        border: `1px solid ${disponible ? opcion.borde : "rgba(248,249,250,0.12)"}`,
        color: FAE.text,
        "--fae-modo-hover-bg": opcion.fondo,
        "--fae-modo-hover-border": opcion.color,
      }}
    >
      <span
        style={{
          fontFamily: "Sora, sans-serif",
          fontWeight: 700,
          fontSize: "clamp(15px, 1.7vw, 17px)",
          letterSpacing: "-0.01em",
          color: disponible ? opcion.color : "rgba(248,249,250,0.4)",
        }}
      >
        {ETIQUETAS[opcion.tipo]}
      </span>
      {/*
        En pantalla angosta la descripción se esconde (home.css) y queda solo el
        conteo: así el texto entra en una línea, la cara abierta no crece más
        que la cerrada y la tarjeta conserva su altura exacta al abrirse. Si
        creciera, empujaría a las tarjetas de abajo y el cambio dejaría de
        leerse como algo que pasa dentro de la tarjeta.
      */}
      <span
        style={{
          fontSize: "12px",
          lineHeight: 1.35,
          color: disponible ? "rgba(248,249,250,0.62)" : "rgba(248,249,250,0.38)",
        }}
      >
        {disponible ? (
          <>
            <span className="fae-modo__desc">{opcion.descripcion} · </span>
            {contar(cantidad)}
          </>
        ) : (
          "Aún no disponible"
        )}
      </span>
    </button>
  );
}

export default function TopicSplitCard({
  topic,
  icon,
  badges,
  accent,
  hoverBg,
  hoverBorder,
  abierta,
  onAbrir,
  onCerrar,
  onElegirModo,
}) {
  const contenedor = useRef(null);
  const opciones = useRef(null);

  /*
   * Al abrir, el foco pasa a la primera opción *disponible*: quien navega con
   * teclado sigue donde acaba de actuar. Se busca la primera habilitada porque
   * en un tema a medias la primera puede estar deshabilitada, y enfocar un
   * botón inerte deja el foco en la nada.
   */
  useEffect(() => {
    if (abierta) opciones.current?.querySelector("button:not(:disabled)")?.focus();
  }, [abierta]);

  /* Tocar fuera cierra. Abrir la elección no puede dejar al estudiante atrapado. */
  useEffect(() => {
    if (!abierta) return;
    const fuera = (e) => {
      if (!contenedor.current?.contains(e.target)) onCerrar();
    };
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, [abierta, onCerrar]);

  const cantidades = {
    [APRENDER]: actividadesDeTipo(topic, APRENDER).length,
    [HACER]: actividadesDeTipo(topic, HACER).length,
  };

  return (
    <div
      ref={contenedor}
      className="fae-card fae-split"
      data-abierta={abierta ? "true" : "false"}
      onKeyDown={(e) => {
        if (e.key === "Escape" && abierta) onCerrar();
      }}
      style={{
        ...CARD_SHELL,
        display: "grid",
        "--fae-card-hover-bg": hoverBg,
        "--fae-card-hover-border": hoverBorder,
      }}
    >
      {/* ---------- cara cerrada: la tarjeta de siempre ---------- */}
      <button
        type="button"
        className="fae-split__cara"
        data-visible={abierta ? "false" : "true"}
        onClick={onAbrir}
        aria-label={`Tema ${topic.title}`}
        aria-expanded={abierta}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "clamp(20px, 3.5vh, 40px)",
          padding: 0,
          border: "none",
          background: "transparent",
          color: "inherit",
          font: "inherit",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", width: "100%" }}>
          {icon}
          {badges && badges.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "flex-end" }}>{badges}</div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
          <h2
            style={{
              fontFamily: "Sora, sans-serif",
              fontWeight: 600,
              fontSize: "clamp(24px, 2.6vw, 30px)",
              lineHeight: 1.12,
              letterSpacing: "-0.025em",
              margin: 0,
              color: FAE.text,
            }}
          >
            {topic.title}
          </h2>
          <span style={{ fontSize: "22px", lineHeight: 1, color: accent }}>→</span>
        </div>
      </button>

      {/* ---------- cara abierta: la elección, en el mismo hueco ---------- */}
      <div
        className="fae-split__cara"
        data-visible={abierta ? "true" : "false"}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "clamp(14px, 2.4vh, 22px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px" }}>
          <p
            style={{
              fontFamily: "Sora, sans-serif",
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "rgba(248,249,250,0.55)",
              margin: 0,
            }}
          >
            {topic.title}
          </p>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar la elección"
            className="fae-split__cerrar"
            style={{
              fontFamily: "Sora, sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: "999px",
              cursor: "pointer",
              background: "transparent",
              border: "1px solid rgba(248,249,250,0.2)",
              color: "rgba(248,249,250,0.6)",
            }}
          >
            Volver
          </button>
        </div>

        <div ref={opciones} style={{ display: "flex", gap: "10px", alignItems: "stretch" }}>
          {OPCIONES.map((opcion) => (
            <BotonModo
              key={opcion.tipo}
              opcion={opcion}
              cantidad={cantidades[opcion.tipo]}
              onClick={() => onElegirModo(topic.id, opcion.tipo)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
