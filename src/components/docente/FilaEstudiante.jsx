import { useEffect, useRef } from "react";
import { FAE } from "../../theme.js";
import { promedioAciertos, avancePorTema, alertasDe, NIVEL } from "../../docente/alertas.js";
import DetalleEstudiante from "./DetalleEstudiante.jsx";
import MarcaNivel, { NIVEL_MARCA } from "./MarcaNivel.jsx";

/*
 * Una fila por estudiante, con lo que un docente necesita decidir a quién
 * escribirle: quién es, cuándo entró por última vez, cuánto lleva, y cómo le va
 * separando lo que se puede reintentar de lo que no.
 *
 * ═══════════ Y SE ABRE EN SU SITIO (ítem 3) ═══════════
 *
 * La fila entera es el disparador y el detalle aparece DEBAJO, dentro de la
 * misma fila. No hay navegación ni capa encima, así que revisar cinco
 * estudiantes seguidos no cuesta perder la búsqueda, el filtro de grupo ni el
 * scroll — que es exactamente lo que el panel deslizante iba a resolver.
 *
 * EL BOTÓN DE GRUPO SE QUEDA EN LA FILA CERRADA, nunca dentro del detalle.
 * Marcar es triaje rápido: si obligara a abrir algo, dejaría de ser rápido. Por
 * eso vive fuera del área que abre, y su click no propaga.
 *
 * ═══════════ LA ALTURA SE ANIMA CON max-height MEDIDO ═══════════
 *
 * `<details>` no anima su apertura de forma nativa, así que no se usa.
 *
 * La primera versión fue la rejilla de 0fr a 1fr, que es la técnica elegante y
 * la que no obliga a conocer la altura. NO FUNCIONA AQUÍ, y lo comprobé en el
 * navegador antes de cambiarla: con la transición desactivada, 1fr resuelve
 * correctamente a los 307 px del contenido; con la transición puesta, el valor
 * final se queda en 0 px. El motor no interpola bien de 0fr a 1fr cuando el
 * contenedor no tiene altura definida, así que la fila se abría vacía.
 *
 * La objeción a max-height es tener que inventar un tope, y un historial largo
 * lo pasaría y se cortaría. Aquí no se inventa: se MIDE el contenido y se
 * anima hasta esa altura exacta. Al terminar se pasa a `none`, para que lo que
 * llegue después —el historial se pide al abrir y tarda— no quede recortado.
 * 220 ms, dentro de la franja pedida.
 *
 * ═══════════ ACCESIBILIDAD ═══════════
 *
 * La zona que abre es un <button> de verdad, con aria-expanded: se llega con
 * el tabulador y responde a Enter y espacio sin código extra. Escape cierra,
 * y solo si esta fila es la abierta.
 */

const dato = { fontFamily: "Sora, sans-serif", fontWeight: 700, fontVariantNumeric: "tabular-nums" };
const rotulo = { fontSize: "10.5px", letterSpacing: "0.06em", color: "rgba(248,249,250,0.45)", margin: "0 0 2px" };

const CSS = `
.fae-fila-caja { max-height: 0; overflow: hidden; transition: max-height 220ms cubic-bezier(.3,.8,.4,1); }
.fae-fila-chev { transition: transform 220ms cubic-bezier(.3,.8,.4,1); }
.fae-fila-chev.abierta { transform: rotate(180deg); }

/* Escritorio: dos columnas, cifras a la izquierda e historial a la derecha. */
.fae-det-cuerpo { display: grid; grid-template-columns: minmax(0, 210px) minmax(0, 1fr); gap: 20px; }
.fae-det-cifras { display: grid; grid-template-columns: 1fr; gap: 12px; align-content: start; }

@media (max-width: 720px) {
  /* Móvil: una columna, y las cifras en rejilla 2x2 compacta. */
  .fae-det-cuerpo { grid-template-columns: 1fr; gap: 16px; }
  .fae-det-cifras { grid-template-columns: 1fr 1fr; gap: 10px 14px; }
}
@media (prefers-reduced-motion: reduce) {
  .fae-fila-caja, .fae-fila-chev { transition: none !important; }
}
`;

function hace(dias) {
  if (dias === null || dias === undefined) return "—";
  if (dias === 0) return "hoy";
  if (dias === 1) return "ayer";
  return `hace ${dias} d`;
}

/*
 * El % de aciertos NO significa lo mismo en las dos modalidades, y mostrar un
 * número pelado invitaría a compararlos. En exploratoria se puede reintentar
 * hasta acertar, así que tiende a 100 sin decir nada del aprendizaje; en
 * evaluativa sí es señal de dominio. Por eso van separados y etiquetados.
 */
function Acierto({ pct, n, modalidad }) {
  const fiable = modalidad === "evaluativa";
  if (!n) return <span style={{ fontSize: "13px", color: "rgba(248,249,250,0.3)" }}>—</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: "5px" }}>
      <span style={{ ...dato, fontSize: "15px", color: fiable ? FAE.text : "rgba(248,249,250,0.6)" }}>
        {pct === null ? "—" : `${Math.round(Number(pct))}%`}
      </span>
      <span style={{ fontSize: "10.5px", color: "rgba(248,249,250,0.4)" }}>
        ({n})
      </span>
    </span>
  );
}

/* Chevrón de línea simple, no el triángulo del navegador. */
function Chevron({ abierta }) {
  return (
    <svg
      className={`fae-fila-chev ${abierta ? "abierta" : ""}`}
      width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"
      style={{ flexShrink: 0, opacity: 0.55 }}
    >
      <path d="M4 6.5 L8 10.5 L12 6.5" fill="none" stroke={FAE.text} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const MARCA_NIVEL = {
  [NIVEL.URGENTE]: NIVEL_MARCA.URGENTE,
  [NIVEL.ATENCION]: NIVEL_MARCA.ATENCION,
  [NIVEL.INFO]: NIVEL_MARCA.INFO,
};
const PALABRA_NIVEL = {
  [NIVEL.URGENTE]: "alerta urgente",
  [NIVEL.ATENCION]: "alerta de atención",
  [NIVEL.INFO]: "alerta informativa",
};

export default function FilaEstudiante({
  e, subjectId, onMarcar, abierta, onAlternar, destacado, posicion,
}) {
  const temas = avancePorTema(subjectId, e.actividades ?? []);
  const alertas = alertasDe(e);
  /* Solo cuentan los dos niveles que piden acción; lo informativo no marca. */
  const peor = alertas.find((a) => a.nivel === NIVEL.URGENTE)
    ?? alertas.find((a) => a.nivel === NIVEL.ATENCION)
    ?? null;

  const caja = useRef(null);

  /*
   * La altura se mide, no se supone. Al abrir se anima hasta el alto real del
   * contenido y, al acabar, se suelta a `none`: el historial se pide al abrir y
   * llega después, así que dejar fijado el alto de ese instante lo recortaría.
   *
   * El respaldo por temporizador existe porque `transitionend` no siempre
   * llega: si la pestaña se oculta a mitad de la animación, el navegador la
   * congela y el evento no se emite nunca. Sin él, la fila se quedaría abierta
   * a medias y sin manera de crecer.
   */
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const alto = () => el.scrollHeight;

    if (abierta) {
      el.style.maxHeight = `${alto()}px`;
      const soltar = () => { el.style.maxHeight = "none"; };
      el.addEventListener("transitionend", soltar, { once: true });
      const respaldo = setTimeout(soltar, 400);
      return () => { el.removeEventListener("transitionend", soltar); clearTimeout(respaldo); };
    }

    /* Al cerrar hay que partir de una altura concreta: de `none` no se anima. */
    el.style.maxHeight = `${alto()}px`;
    const id = requestAnimationFrame(() => { el.style.maxHeight = "0px"; });
    return () => cancelAnimationFrame(id);
  }, [abierta]);

  /* Escape cierra — pero solo la fila que está abierta. */
  useEffect(() => {
    if (!abierta) return;
    const alPulsar = (ev) => { if (ev.key === "Escape") onAlternar(null); };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [abierta, onAlternar]);

  /*
   * El indicador de la fila cerrada: el nivel de alerta más grave, o el de
   * destacado, o nada. Nunca el color solo: cada uno tiene su SILUETA
   * (▲ urgente, ◆ atención, ★ destacado; ver MarcaNivel) porque coral y teal
   * miden lo mismo en gris, y su palabra va en el aria-label y en el title.
   * El title solo sale al pasar el ratón: no es lo que sostiene el significado.
   */
  const indicador = peor
    ? { marca: MARCA_NIVEL[peor.nivel], palabra: PALABRA_NIVEL[peor.nivel] }
    : destacado
      ? { marca: NIVEL_MARCA.DESTACADO, palabra: "destacado" }
      : null;

  return (
    <div
      style={{
        borderRadius: "12px",
        background: abierta
          ? "rgba(248,249,250,0.065)"
          : e.en_mi_grupo ? "rgba(42,157,143,0.07)" : "rgba(248,249,250,0.03)",
        border: `1px solid ${abierta ? "rgba(248,249,250,0.2)" : e.en_mi_grupo ? "rgba(42,157,143,0.28)" : "rgba(248,249,250,0.1)"}`,
        transition: "background 180ms ease, border-color 180ms ease",
      }}
    >
      <style>{CSS}</style>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) auto",
          alignItems: "center",
          gap: "10px",
          padding: "0 14px 0 0",
        }}
      >
        {/* La fila entera abre. El botón de grupo queda fuera de este botón. */}
        <button
          type="button"
          onClick={() => onAlternar(abierta ? null : e.user_id)}
          aria-expanded={abierta}
          aria-label={`${e.full_name || e.nickname}${indicador ? `, ${indicador.palabra}` : ""}. ${abierta ? "Cerrar" : "Ver"} detalle`}
          style={{
            display: "grid",
            gridTemplateColumns: "auto minmax(0,2.2fr) repeat(4, minmax(0,1fr)) auto",
            gap: "12px",
            alignItems: "center",
            textAlign: "left",
            padding: "12px 0 12px 14px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "inherit",
            font: "inherit",
            minWidth: 0,
          }}
        >
          <span aria-hidden="true" title={indicador ? indicador.palabra : undefined} style={{ display: "flex" }}>
            <MarcaNivel nivel={indicador ? indicador.marca : NIVEL_MARCA.NINGUNO} />
          </span>

          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 600, color: FAE.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {e.full_name || e.nickname}
            </span>
            <span style={{ display: "block", marginTop: "2px", fontSize: "12px", color: "rgba(248,249,250,0.5)" }}>
              {e.full_name ? `${e.nickname} · ` : ""}
              {temas.filter((t) => t.hechas > 0).length} de {temas.length} temas iniciados
              {/*
                * Apagado a propósito: informa de por qué esta fila no suma en
                * los promedios, sin competir con el nombre ni con las alertas.
                * Va en texto y no solo en un tono, como todo lo demás.
                */}
              {e.es_prueba && (
                <span
                  style={{
                    marginLeft: "8px", padding: "1px 7px", borderRadius: "999px",
                    background: "rgba(248,249,250,0.06)",
                    border: "1px solid rgba(248,249,250,0.16)",
                    color: "rgba(248,249,250,0.45)",
                    fontSize: "10.5px", letterSpacing: "0.03em", whiteSpace: "nowrap",
                  }}
                >
                  cuenta de prueba · fuera de los promedios
                </span>
              )}
            </span>
          </span>

          <span>
            <span style={{ ...rotulo, display: "block" }}>FP CICLO</span>
            <span style={{ ...dato, fontSize: "16px", color: FAE.teal }}>{e.fp_ciclo}</span>
          </span>

          <span>
            <span style={{ ...rotulo, display: "block" }}>FP TOTAL</span>
            <span style={{ ...dato, fontSize: "16px", color: FAE.text }}>{e.fp_total}</span>
          </span>

          <span>
            <span style={{ ...rotulo, display: "block" }}>EVALUATIVA</span>
            <Acierto pct={e.pct_evaluativa} n={Number(e.n_evaluativas)} modalidad="evaluativa" />
          </span>

          <span>
            <span style={{ ...rotulo, display: "block" }}>ÚLTIMA VEZ</span>
            <span style={{ ...dato, fontSize: "14px", color: e.dias_inactivo > 7 ? FAE.coral : FAE.text }}>
              {hace(e.dias_inactivo)}
            </span>
          </span>

          <Chevron abierta={abierta} />
        </button>

        {/*
          * Triaje rápido: vive en la fila cerrada y su click no llega al botón
          * de abrir. Marcar a treinta estudiantes no puede exigir treinta
          * aperturas.
          */}
        <button
          type="button"
          onClick={(ev) => { ev.stopPropagation(); onMarcar(e.user_id, !e.en_mi_grupo); }}
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: "12px",
            fontWeight: 600,
            padding: "7px 12px",
            borderRadius: "999px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            background: e.en_mi_grupo ? FAE.teal : "transparent",
            border: `1px solid ${e.en_mi_grupo ? FAE.teal : "rgba(248,249,250,0.25)"}`,
            color: e.en_mi_grupo ? FAE.bg : "rgba(248,249,250,0.75)",
          }}
        >
          {e.en_mi_grupo ? "En mi grupo" : "Añadir"}
        </button>
      </div>

      {/* La caja que anima su altura de 0fr a 1fr. */}
      <div ref={caja} className={`fae-fila-caja ${abierta ? "abierta" : ""}`}>
        <div>
          {/* El detalle solo se monta cuando hace falta: así el historial se
              pide al abrir y no treinta veces al cargar la lista. */}
          {abierta && <DetalleEstudiante e={e} subjectId={subjectId} posicion={posicion} />}
        </div>
      </div>
    </div>
  );
}

export { Acierto };
