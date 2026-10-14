import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { TITULOS, ROTULOS_ESCENA, PASOS_CAPA_2, CIERRE_CAPA_2 } from "../../../../data/contabilidadTema5Pieza1.js";
import { estadoPaso, PASOS, CIERRE } from "../../../../contabilidad/efectivoDeSobra.js";
import { useReducido } from "../tema3/DosLineas.jsx";
import EstilosT5, { CLASE_T5 } from "./EstilosT5.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · PIEZA 1 · CAPA 2 · «MÍRELO FUNCIONAR» — una empresa y su efectivo
 * de sobra. Siete pasos y el cierre (guía de Mai v3, §4).
 *
 * De arriba abajo: la escena (decorativa: el texto del paso dice todo lo que
 * muestra), el texto del paso y la fila de botones.
 *
 * Los botones son los de LoQueYaPaso —mismas palabras, píldora de 44 px,
 * «Siguiente» relleno neutro y el desactivado que se ve, no desaparece—:
 * la guía (§4.5) dice que, si LoQueYaPaso usa otro estilo de botón, manda
 * LoQueYaPaso, por coherencia entre piezas. La fila sigue la guía:
 * «Anterior» · contador · «Siguiente».
 *
 * Nada avanza solo. Ningún texto vive aquí: todo sale del archivo de datos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";

/* Los colores de la guía (§1), todos ya del sitio. */
const TEXTO = FAE.text; // #F8F9FA
const SECUNDARIO = COLOR.apagado; // #A8B6C8
const NODO = FAE.node; // #CBDCF2
const BORDES = COLOR.neutro; // #B8C4D4
const ATENUADO = "rgba(184,196,212,.50)";
const NAVY = FAE.navy; // #1D3557
const FONDO_SOLIDO = FAE.bg; // #0E1B2E

/* LoQueYaPaso: la píldora, el «Siguiente» relleno y el desactivado. */
const botonBase = {
  width: "100%", minWidth: 0, height: "44px", borderRadius: "999px", fontFamily: SORA, fontSize: "14px", fontWeight: 600,
  cursor: "pointer", boxSizing: "border-box",
};
const DESACTIVADO = { background: "transparent", border: `2px solid ${COLOR.quieto}`, color: COLOR.apagado, cursor: "default" };

/* El tronco va en x = 11; el grupo empieza en x = 24 (guía §4.2). */
const X_TRONCO = 11;

function transicion(reducido) {
  if (reducido) return "none";
  return [
    "border-color 200ms ease-out", "background-color 200ms ease-out", "color 200ms ease-out",
    "opacity 240ms ease-out", "transform 240ms ease-out", "visibility 240ms ease-out",
  ].join(", ");
}

/* Lo que aún no ha aparecido ocupa su sitio, invisible: la escena no salta. */
function aparicion(e, reducido) {
  return {
    visibility: e.visible ? "visible" : "hidden",
    opacity: e.visible ? 1 : 0,
    transform: e.visible || reducido ? "none" : "translateY(4px)",
    transition: transicion(reducido),
  };
}

/* Borde y relleno de una caja según su estado. `fino` es el grosor en reposo. */
function caja(e, fino, relleno, reducido) {
  const [v, h] = relleno;
  const grueso = e.resaltado ? 2 : fino;
  const d = grueso - fino; // se compensa en el relleno: nada se mueve
  return {
    border: `${grueso}px solid ${e.resaltado ? NODO : e.atenuado ? ATENUADO : BORDES}`,
    background: e.resaltado ? NAVY : "transparent",
    /* El efectivo no tiene relleno vertical (alto fijo de 36): ahí no hay nada que compensar. */
    padding: `${Math.max(0, v - d)}px ${Math.max(0, h - d)}px`,
    color: e.atenuado ? SECUNDARIO : TEXTO,
    ...aparicion(e, reducido),
  };
}

export default function EfectivoDeSobra() {
  const reducido = useReducido();
  const [paso, setPaso] = useState(1);
  const foco = useRef(null);
  const escena = useRef(null);
  const efectivo = useRef(null);
  const tarjetas = useRef([]);
  const texto = useRef(null);
  const anterior = useRef(null);
  const siguiente = useRef(null);
  const [lineas, setLineas] = useState(null);

  const estado = estadoPaso(paso);
  const el = estado.elementos;

  /* El tronco y las ramas se miden en vivo: siguen a las tarjetas a cualquier ancho y con cualquier fuente. */
  useLayoutEffect(() => {
    const medir = () => {
      const base = escena.current?.getBoundingClientRect();
      const ef = efectivo.current?.getBoundingClientRect();
      const ts = tarjetas.current.map((t) => t?.getBoundingClientRect());
      if (!base || !ef || ts.some((t) => !t)) return;
      const centros = ts.map((t) => t.top + t.height / 2 - base.top);
      setLineas({
        desde: ef.bottom - base.top,
        hasta: centros[centros.length - 1],
        ramas: ts.map((t, i) => ({ y: centros[i], ancho: t.left - base.left - X_TRONCO })),
      });
    };
    medir();
    let ro = null;
    if (typeof ResizeObserver !== "undefined" && escena.current) {
      ro = new ResizeObserver(medir);
      ro.observe(escena.current);
    }
    document.fonts?.ready?.then(medir).catch(() => {});
    return () => ro?.disconnect();
  }, []);

  /* Cuando un botón se desactiva con el foco encima, el foco no se pierde (guía §4.5). */
  useEffect(() => {
    if (foco.current === "texto") texto.current?.focus();
    if (foco.current === "siguiente") siguiente.current?.focus();
    foco.current = null;
  }, [paso]);

  const ir = (nuevo) => {
    const destino = Math.min(CIERRE, Math.max(1, nuevo));
    if (destino === CIERRE) foco.current = "texto";
    if (destino === 1) foco.current = "siguiente";
    setPaso(destino);
  };

  const primero = paso === 1;
  const ultimo = paso === CIERRE;
  const linea = (e) => (e.atenuado ? ATENUADO : BORDES);
  const textos = [...PASOS_CAPA_2, CIERRE_CAPA_2];
  const estiloTexto = (i) => (i === PASOS
    ? { fontFamily: SORA, fontWeight: 600 }
    : { fontFamily: INTER, fontWeight: 400 });

  return (
    <div data-capa2-t5 className={CLASE_T5}>
      <EstilosT5 />
      {/* ═══ LA ESCENA ═══ */}
      <div ref={escena} data-escena aria-hidden="true" style={{ position: "relative" }}>
        {lineas && (
          <div data-ramas style={{ ...aparicion(el.ramas, reducido) }}>
            <span style={{
              position: "absolute", left: `${X_TRONCO}px`, top: `${lineas.desde}px`, width: "1px",
              height: `${Math.max(0, lineas.hasta - lineas.desde)}px`, background: linea(el.ramas), transition: transicion(reducido),
            }} />
            {lineas.ramas.map((r, i) => (
              <span key={TITULOS[i].id} style={{
                position: "absolute", left: `${X_TRONCO}px`, top: `${r.y}px`, height: "1px",
                width: `${Math.max(0, r.ancho)}px`, background: linea(el.ramas), transition: transicion(reducido),
              }} />
            ))}
          </div>
        )}

        <div
          ref={efectivo}
          data-elemento="efectivo"
          data-resaltado={el.efectivo.resaltado ? "si" : "no"}
          style={{
            boxSizing: "border-box", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center",
            fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3,
            ...caja(el.efectivo, 1, [0, 12], reducido),
          }}
        >
          {ROTULOS_ESCENA.efectivo}
        </div>

        <div
          data-elemento="grupo"
          data-resaltado={el.grupo.resaltado ? "si" : "no"}
          style={{
            position: "relative", marginLeft: "24px", marginTop: "8px", padding: "6px", borderRadius: "14px",
            display: "flex", flexDirection: "column", gap: "6px",
            border: `2px solid ${el.grupo.resaltado ? NODO : "transparent"}`,
            background: el.grupo.resaltado ? NAVY : "transparent",
            transition: transicion(reducido),
          }}
        >
          {TITULOS.map((t, i) => {
            const tarjeta = el[t.id];
            const tipo = el[`tipo-${t.id}`];
            const rinde = el[`rinde-${t.id}`];
            return (
              <div
                key={t.id}
                ref={(n) => { tarjetas.current[i] = n; }}
                data-elemento={t.id}
                data-resaltado={tarjeta.resaltado ? "si" : "no"}
                style={{ borderRadius: "10px", ...caja(tarjeta, 1, [8, 10], reducido) }}
              >
                <p style={{ margin: 0, fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, whiteSpace: "nowrap", color: "inherit" }}>
                  {t.nombre}
                </p>
                <p
                  data-elemento={`tipo-${t.id}`}
                  style={{
                    margin: "1px 0 0", fontFamily: INTER, fontSize: "12px", lineHeight: 1.35, whiteSpace: "nowrap",
                    color: tipo.atenuado ? SECUNDARIO : NODO, ...aparicion(tipo, reducido),
                  }}
                >
                  {t.tipo}
                </p>
                <span
                  data-elemento={`rinde-${t.id}`}
                  data-resaltado={rinde.resaltado ? "si" : "no"}
                  style={{
                    display: "inline-block", marginTop: "4px", borderRadius: "999px", whiteSpace: "nowrap",
                    fontFamily: INTER, fontSize: "12px", lineHeight: 1.35,
                    ...caja(rinde, 1, [1, 8], reducido),
                  }}
                >
                  {t.rinde}
                </span>
              </div>
            );
          })}

          {/* Sobre el borde del GRUPO, fuera de toda tarjeta y de toda rama (nota de Futaba). */}
          <span
            data-elemento="venta"
            data-resaltado={el.venta.resaltado ? "si" : "no"}
            style={{
              position: "absolute", left: "50%", bottom: 0, whiteSpace: "nowrap",
              borderRadius: "999px", padding: "2px 10px", border: `2px solid ${NODO}`, background: FONDO_SOLIDO,
              fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: 1.35, color: TEXTO,
              ...aparicion(el.venta, reducido),
              transform: `translate(-50%, 50%)${el.venta.visible || reducido ? "" : " translateY(4px)"}`,
            }}
          >
            {ROTULOS_ESCENA.venta}
          </span>
        </div>
        {/* La franja de la mitad inferior de la cápsula de venta. */}
        <div style={{ height: "16px" }} />
      </div>

      {/*
        ═══ EL TEXTO DEL PASO ═══
        Su alto es el del texto más largo de los ocho A ESTE ANCHO: los ocho
        se apilan invisibles en la misma celda y la celda toma el mayor. Así
        los botones nunca saltan, y no hay cifras copiadas.
      */}
      <div style={{ display: "grid", marginTop: "14px" }}>
        <div aria-hidden="true" style={{ gridArea: "1 / 1", display: "grid", visibility: "hidden" }}>
          {textos.map((t, i) => (
            <p key={t} style={{ gridArea: "1 / 1", margin: 0, fontSize: "14px", lineHeight: 1.55, ...estiloTexto(i) }}>{t}</p>
          ))}
        </div>
        <div ref={texto} data-texto-paso tabIndex={-1} aria-live="polite" style={{ gridArea: "1 / 1", outline: "none" }}>
          <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.55, color: TEXTO, ...estiloTexto(paso - 1) }}>{textos[paso - 1]}</p>
        </div>
      </div>

      {/* ═══ LOS BOTONES: «Anterior» · contador · «Siguiente» ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "8px", alignItems: "center", marginTop: "12px" }}>
        <button
          ref={anterior}
          type="button"
          data-anterior
          disabled={primero}
          onClick={() => ir(paso - 1)}
          style={{ ...botonBase, ...(primero ? DESACTIVADO : { background: "transparent", border: `2px solid ${COLOR.neutro}`, color: COLOR.blanco }) }}
        >
          Anterior
        </button>
        <span data-paso-de style={{ fontFamily: INTER, fontSize: "12px", lineHeight: 1.4, color: SECUNDARIO, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", visibility: ultimo ? "hidden" : "visible" }}>
          Paso {Math.min(paso, PASOS)} de {PASOS}
        </span>
        <button
          ref={siguiente}
          type="button"
          data-siguiente
          disabled={ultimo}
          onClick={() => ir(paso + 1)}
          style={{ ...botonBase, ...(ultimo ? DESACTIVADO : { background: COLOR.neutro, border: `2px solid ${COLOR.neutro}`, color: COLOR.navy }) }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
