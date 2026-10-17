import { FAE } from "../../../../theme.js";
import { SORA, INTER, TEXTO, SECUNDARIO, NODO, BORDES, NAVY } from "./MaquinaPegada.jsx";
import { ConCifras, CURVA } from "./TanqueProvision.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 21 · LA FICHA QUE ENTRA: la escena común de la capa 2 de T5 A1, T6 A1,
 * T6 A2, T6 A4 y T6 A5 (P2 de Mai, 16-oct). MaquinaPegada no cambia: el paso
 * trae `gesto` y la escena recibe `hacer`.
 *
 *   · las fichas: botones de 44 px como mínimo. La del paso, con contorno de
 *     2 px #F8F9FA y la pista; las demás, en reposo (1 px .35), y tocarlas no
 *     hace nada. Con `fila`, las fichas son las filas del modelo;
 *   · el modelo, una rejilla con todos sus sitios reservados: ni el modelo ni
 *     «Siguiente» se mueven entre pasos. Lo que entra, resaltado (2 px nodo y
 *     navy) hasta el paso siguiente; entra con opacidad y 6 px en 240 ms (con
 *     movimiento reducido, al instante);
 *   · el modelo anuncia lo que entra (aria-live).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ENTRA = "@keyframes b5-ficha-entra { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } } .b5f-foco:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }";
const REPOSO = "1px solid rgba(248,249,250,0.35)";
const FICHA = { fontFamily: INTER, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, color: TEXTO };

function Ficha({ f, onTocar, ancho = false, idTexto = null, alto = 44, compacta = false }) {
  return (
    <button type="button" data-ficha-entra={f.id} data-activa={f.activa ? "si" : "no"}
      aria-disabled={f.activa ? undefined : true} aria-describedby={f.activa && idTexto ? idTexto : undefined}
      onClick={f.activa ? onTocar : undefined} className="b5f-foco"
      style={{
        minHeight: `${alto}px`, minWidth: "44px", boxSizing: "border-box", padding: compacta ? (f.activa ? "4px 9px" : "5px 10px") : (f.activa ? "5px 9px" : "6px 10px"), borderRadius: "10px",
        background: "transparent", border: f.activa ? `2px solid ${FAE.text}` : REPOSO, cursor: f.activa ? "pointer" : "default",
        textAlign: "left", width: ancho ? "100%" : "auto", ...FICHA, ...(compacta ? { fontSize: "12px", lineHeight: "16px" } : null),
      }}>
      <ConCifras texto={f.texto} />
    </button>
  );
}

export function crearEscenaFichas(pieza) {
  const enCelda = new Set(pieza.modelo.celdas.filter((c) => c.ficha).map((c) => c.ficha));
  /* La fila de las fichas se reserva siempre que la pieza tenga fichas sueltas (no se mueve nada entre pasos). */
  const conFila = pieza.fichas.some((f) => !enCelda.has(f.id));
  /* Cada blanco, 44 px (en el tablero de T6 A5, Mai midió 48; con 44 cabe sobre el bloque pegado a 320 × 568). */
  const ALTO = 44;
  return function Escena(estado, refDe, reducido, { hacer } = {}) {
    const deFila = estado.fichas.filter((f) => !enCelda.has(f.id));
    const ficha = (id) => estado.fichas.find((f) => f.id === id) ?? null;
    const nuevos = Object.values(estado.sitios).filter((s) => s.nuevo).map((s) => [].concat(s.texto).join(", "));
    const entra = reducido ? "none" : `b5-ficha-entra 240ms ${CURVA} both`;
    const Sitio = ({ id, tenue, sinHueco }) => {
      const s = estado.sitios[id];
      if (!s) return sinHueco ? <span style={{ minHeight: "32px" }} /> : <span data-sitio={id} data-vacio="si" style={{ minHeight: `${ALTO}px`, boxSizing: "border-box", borderRadius: "8px", border: `1px dashed rgba(248,249,250,${tenue ? 0.1 : 0.22})` }} />;
      /* Lo que entra va en sus renglones (una lista en los datos): el sitio reserva dos y no crece al llenarse. */
      const lineas = Array.isArray(s.texto) ? s.texto : [s.texto];
      return (
        <span data-sitio={id} data-nuevo={s.nuevo ? "si" : "no"} style={{
          minHeight: sinHueco ? "32px" : `${ALTO}px`, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center",
          padding: s.nuevo ? "3px 6px" : "4px 7px", borderRadius: "8px", overflow: "hidden",
          border: s.nuevo ? `2px solid ${NODO}` : `1px solid ${BORDES}`, background: s.nuevo ? NAVY : "transparent", animation: s.nuevo ? entra : "none",
          fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: TEXTO,
        }}>
          {lineas.map((l) => <span key={l} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "clip" }}><ConCifras texto={l} /></span>)}
        </span>
      );
    };
    return (
      <div data-escena data-escena-viva data-fichas-que-entran>
        <style>{ENTRA}</style>
        {conFila ? (
          <div data-fichas style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignContent: "flex-start", minHeight: `${pieza.altoFichas ?? 44}px` }}>
            {deFila.map((f) => <Ficha key={f.id} f={f} onTocar={hacer} />)}
          </div>
        ) : null}
        <p data-pista-gesto aria-hidden={estado.gesto ? undefined : true} style={{ margin: "0 0 5px", minHeight: "16px", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: SECUNDARIO }}>
          {estado.gesto ? pieza.pista : ""}
        </p>
        <div data-modelo {...(pieza.modelo.atributos ?? {})} style={{ visibility: estado.modeloVisible === false ? "hidden" : "visible", display: "grid", gridTemplateColumns: pieza.modelo.fila ? "minmax(0, 1.4fr) minmax(0, 1fr)" : `repeat(${pieza.modelo.columnas}, minmax(0, 1fr))`, gap: pieza.modelo.fila ? "4px" : "6px" }}>
          {pieza.modelo.celdas.map((c, k) => {
            const span = c.span ? { gridColumn: `span ${c.span}` } : {};
            if (c.simulado) {
              /* El rótulo fijo del escenario simulado: primera línea del modelo, nunca atenuado. Lo oye el lector con el texto del paso, no aquí. */
              return <span key={k} data-elemento="rotulo" data-resaltado="no" style={{ ...span, display: "block" }}><span data-rotulo-simulado aria-hidden="true" style={{ fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: NODO }}>{c.rotulo}</span></span>;
            }
            if (c.cabecera) {
              return <span key={k} style={{ ...span, alignSelf: "end", fontFamily: SORA, fontSize: "12px", fontWeight: 700, lineHeight: 1.3, color: c.tenue ? SECUNDARIO : TEXTO, textAlign: c.span ? "center" : "left" }}>{c.rotulo}</span>;
            }
            const f = c.ficha ? ficha(c.ficha) : null;
            if (c.ficha && !c.id) {
              /* La fila es la ficha (T6 A5): se toca la fila del grupo. */
              return (
                <span key={k} style={{ ...span, display: "flex" }}>
                  {f ? <Ficha f={f} onTocar={hacer} ancho alto={ALTO} compacta /> : (
                    /* Ya tocada, la fila se queda con su nombre (es el tablero). */
                    <span data-fila-hecha={c.ficha} style={{ minHeight: `${ALTO}px`, width: "100%", boxSizing: "border-box", display: "flex", alignItems: "center", padding: "5px 10px", borderRadius: "10px", border: `1px solid ${BORDES}`, fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: TEXTO }}>{c.texto}</span>
                  )}
                </span>
              );
            }
            /* El sitio: con su nombre de elemento, para la parada (su resalte y su etiqueta, hoja 7 de Mai). */
            const resaltado = (estado.resaltados ?? []).includes(c.id);
            return (
              <span key={k} ref={refDe(c.id)} data-elemento={c.id} data-resaltado={resaltado ? "si" : "no"}
                style={{ ...span, display: "flex", flexDirection: "column", borderRadius: "10px", outline: resaltado ? `2px solid ${NODO}` : "none", outlineOffset: "2px" }}>
                {f?.activa ? <Ficha f={{ ...f, texto: [].concat(estado.sitios[c.id]?.texto ?? f.texto).join(" · ") }} onTocar={hacer} ancho /> : <Sitio id={c.id} tenue={c.tenue} sinHueco={c.sinHueco} />}
              </span>
            );
          })}
        </div>
        <p data-anuncio-modelo aria-live="polite" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>{nuevos.join(". ")}</p>
      </div>
    );
  };
}
