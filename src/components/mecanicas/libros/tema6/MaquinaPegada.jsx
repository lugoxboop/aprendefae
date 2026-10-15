import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { useReducido } from "../tema3/DosLineas.jsx";
import EstilosT5, { CLASE_T5 } from "../tema5/EstilosT5.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · LA MÁQUINA DE PASOS CON EL BLOQUE PEGADO (Célula B).
 *
 * Lo que comparten las piezas de Aprender del Tema 6, sacado de DosMomentos
 * (pieza 1) para que la pieza 2 no lo copie: el bloque de control PEGADO en
 * modo B (fixed por script: el modo A falla porque un contenedor de la página
 * tiene overflow: hidden, que no es nuestro), «Reproducir» de LoQueYaPaso, y
 * el desplazamiento que deja lo resaltado entre el borde y el bloque, con el
 * primero de RESALTADO como prioridad si no caben juntos.
 *
 * Cada pieza pone su escena (`escena(estado, refDe, reducido)`), su estado
 * por paso y sus textos (`todos`: los pasos y, al final, el cierre). Las
 * piezas de dibujo (caja, Anotacion, Lado) van exportadas para las escenas.
 * `pintar` deja que una pieza pinte el texto del paso a su modo (T5 · A2: las
 * cuentas sin partir); por defecto, el texto tal cual. `pintarPie`, lo mismo
 * con el pie (T6 · A5: los cuatro tipos de pie). Si el estado trae
 * `tambienEnVista` (T6 · A5: el rótulo fijo), el desplazamiento intenta que se
 * vea junto con lo resaltado; si no cabe, manda lo resaltado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const SORA = "Sora, sans-serif";
export const INTER = "Inter, sans-serif";
export const TEXTO = FAE.text;
export const SECUNDARIO = COLOR.apagado; // #A8B6C8
export const NODO = FAE.node; // #CBDCF2
export const BORDES = COLOR.neutro; // #B8C4D4
export const ATENUADO = "rgba(184,196,212,.50)";
export const NAVY = FAE.navy;
export const TEAL = FAE.teal; // Debe
export const AMBAR = FAE.ambar; // Haber
export const FONDO = FAE.bg; // #0E1B2E

const botonBase = {
  flex: "1 1 0", minWidth: 0, height: "44px", borderRadius: "999px", fontFamily: SORA, fontSize: "14px", fontWeight: 600,
  cursor: "pointer", boxSizing: "border-box",
};
const DESACTIVADO = { background: "transparent", border: `2px solid ${COLOR.quieto}`, color: COLOR.apagado, cursor: "default" };
export const PIE = { margin: 0, fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: COLOR.apagado };

export function transicion(reducido) {
  if (reducido) return "none";
  return ["border-color 200ms ease-out", "background-color 200ms ease-out", "color 200ms ease-out",
    "opacity 240ms ease-out", "transform 240ms ease-out", "visibility 240ms ease-out"].join(", ");
}
export function aparicion(e, reducido) {
  return {
    visibility: e.visible ? "visible" : "hidden",
    opacity: e.visible ? 1 : 0,
    transform: e.visible || reducido ? "none" : "translateY(4px)",
    transition: transicion(reducido),
  };
}
/* Resaltado: borde 2 nodo y relleno navy, con el relleno compensado; atenuado: secundario. */
export function caja(e, relleno, reducido, { conNavy = true } = {}) {
  const [v, h, abajo = v] = relleno;
  const d = e.resaltado ? 1 : 0;
  return {
    border: `${e.resaltado ? 2 : 1}px solid ${e.resaltado ? NODO : e.atenuado ? ATENUADO : BORDES}`,
    background: e.resaltado && conNavy ? NAVY : "transparent",
    padding: `${v - d}px ${h - d}px ${abajo - d}px`,
    color: e.atenuado ? SECUNDARIO : TEXTO,
    ...aparicion(e, reducido),
  };
}

/* La cápsula de Debe o Haber: rellena, con su palabra. No se atenúa nunca. */
export function Lado({ lado, textos }) {
  const debe = lado === "debe";
  return (
    <span data-lado={lado} style={{
      display: "inline-block", whiteSpace: "nowrap", borderRadius: "999px", padding: "1px 8px",
      background: debe ? TEAL : AMBAR, color: FONDO, fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: 1.35,
    }}>
      {debe ? textos.debita : textos.acredita}
    </span>
  );
}

/* `linea`: el nombre del cliente en su propia línea, bajo la cuenta (T6 · A3 v1b y A4). */
export function Anotacion({ id, e, cuenta, linea, movimiento, lado, reducido, refDe, textos, partirNombre = false }) {
  return (
    <div ref={refDe(id)} data-elemento={id} data-resaltado={e.resaltado ? "si" : "no"} style={{ borderRadius: "10px", ...caja(e, [6, 8], reducido) }}>
      <p style={{ margin: 0, fontFamily: SORA, fontSize: "12.5px", fontWeight: 600, lineHeight: 1.3, whiteSpace: partirNombre ? "normal" : "nowrap", color: "inherit" }}>{cuenta}</p>
      {linea && <p data-linea style={{ margin: "2px 0 0", fontFamily: INTER, fontSize: "12px", lineHeight: 1.35, color: "inherit" }}>{linea}</p>}
      {/* Si el movimiento y la cápsula no caben juntos, la cápsula baja de línea entera (Mai, T6 · A2 v1b: 73,63). */}
      <p data-movimiento style={{ margin: "3px 0 0", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", fontFamily: INTER, fontSize: "12px", lineHeight: 1.35, color: "inherit" }}>
        <span>{movimiento}</span>
        {lado && <Lado lado={lado} textos={textos} />}
      </p>
    </div>
  );
}

export default function MaquinaPegada({ todos, estadoPaso, duracion, escena, atributos = {}, pintar = (t) => t, pintarPie = (t) => t }) {
  const PASOS = todos.length - 1;
  const CIERRE = todos.length;
  const reducido = useReducido();
  const [paso, setPaso] = useState(1);
  const [reproduciendo, setReproduciendo] = useState(false);
  const maquina = useRef(null);
  const bloque = useRef(null);
  const texto = useRef(null);
  const siguiente = useRef(null);
  const piezas = useRef({});
  const foco = useRef(null);
  const primeraVez = useRef(true);
  const hueco = useRef(null);
  /* Modo B: null mientras el bloque va en su sitio; { top, left, width, alto } cuando va fijo. */
  const [fijo, setFijo] = useState(null);
  const refDe = (id) => (n) => { piezas.current[id] = n; };

  const estado = estadoPaso(paso);

  /*
   * ═══════════ MODO B: EL BLOQUE PEGADO POR SCRIPT (guía v2 §D) ═══════════
   * Se fija cuando su sitio natural queda por debajo de la ventana y la capa
   * está en pantalla. top = el mayor entre (alto de la ventana − alto del
   * bloque) y la cima de la máquina; left y width, los del interior del
   * Panel. Deja en su sitio un hueco del mismo alto: la página no se mueve.
   * Se recalcula en scroll y resize, una vez por cuadro.
   */
  useLayoutEffect(() => {
    let cuadro = null;
    const calcular = () => {
      cuadro = null;
      const h = hueco.current; const m = maquina.current; const b = bloque.current;
      if (!h || !m || !b) return;
      const sitio = h.getBoundingClientRect();
      const cima = m.getBoundingClientRect().top;
      const alto = b.offsetHeight;
      const panel = m.closest("section[data-capa]")?.parentElement?.getBoundingClientRect();
      const va = sitio.top + alto > window.innerHeight && cima < window.innerHeight && panel;
      setFijo((antes) => {
        if (!va) return antes === null ? antes : null;
        const nuevo = { top: Math.max(window.innerHeight - alto, cima), left: panel.left + 1, width: panel.width - 2, alto };
        return antes && ["top", "left", "width", "alto"].every((k) => Math.abs(antes[k] - nuevo[k]) < 0.5) ? antes : nuevo;
      });
    };
    const pedir = () => { if (cuadro === null) cuadro = requestAnimationFrame(calcular); };
    calcular();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => { window.removeEventListener("scroll", pedir); window.removeEventListener("resize", pedir); if (cuadro !== null) cancelAnimationFrame(cuadro); };
  }, []);

  /* «Reproducir», copiado de LoQueYaPaso. */
  useEffect(() => {
    if (!reproduciendo) return undefined;
    if (paso >= CIERRE) { setReproduciendo(false); return undefined; }
    const t = setTimeout(() => setPaso((p) => Math.min(CIERRE, p + 1)), duracion(paso));
    return () => clearTimeout(t);
  }, [reproduciendo, paso]);
  useEffect(() => {
    if (!reproduciendo) return undefined;
    const alOcultar = () => { if (document.visibilityState === "hidden") setReproduciendo(false); };
    document.addEventListener("visibilitychange", alOcultar);
    let io = null;
    if (typeof IntersectionObserver !== "undefined" && maquina.current) {
      io = new IntersectionObserver((es) => { if (es.some((x) => x.intersectionRatio < 0.3)) setReproduciendo(false); }, { threshold: [0, 0.3] });
      io.observe(maquina.current);
    }
    return () => { document.removeEventListener("visibilitychange", alOcultar); io?.disconnect(); };
  }, [reproduciendo]);

  /*
   * Al cambiar de paso, lo resaltado tiene que quedar entre el borde superior
   * (+ 8) y el bloque pegado (− 8). Si no cabe, la página se mueve lo justo;
   * con dos resaltados que no caben juntos, manda el primero (guía v2 §D).
   * scrollIntoView no sirve: no ve lo que tapa el bloque pegado (Mai, v1).
   */
  useEffect(() => {
    if (primeraVez.current) { primeraVez.current = false; return; }
    if (foco.current === "texto") texto.current?.focus({ preventScroll: true });
    if (foco.current === "siguiente") siguiente.current?.focus({ preventScroll: true });
    foco.current = null;
    const rects = estado.resaltados.map((id) => piezas.current[id]?.getBoundingClientRect()).filter(Boolean);
    const tope = bloque.current?.getBoundingClientRect().top;
    if (!rects.length || tope === undefined) return;
    const arriba = 8;
    const abajo = Math.min(tope, window.innerHeight) - 8;
    const union = (rs) => ({ top: Math.min(...rs.map((r) => r.top)), bottom: Math.max(...rs.map((r) => r.bottom)) });
    const cabe = (r) => r.bottom - r.top <= abajo - arriba;
    const extra = (estado.tambienEnVista ?? []).map((id) => piezas.current[id]?.getBoundingClientRect()).filter(Boolean);
    const conExtra = union([...rects, ...extra]);
    const juntos = union(rects);
    const objetivo = extra.length && cabe(conExtra) ? conExtra : cabe(juntos) ? juntos : rects[0];
    let delta = 0;
    if (objetivo.bottom > abajo) delta = objetivo.bottom - abajo;
    if (objetivo.top - delta < arriba) delta = objetivo.top - arriba;
    if (Math.abs(delta) > 0.5) window.scrollBy({ top: delta, behavior: reducido ? "auto" : "smooth" });
  }, [paso]); // eslint-disable-line react-hooks/exhaustive-deps

  const ir = (nuevo) => {
    setReproduciendo(false);
    const destino = Math.min(CIERRE, Math.max(1, nuevo));
    if (destino === CIERRE) foco.current = "texto";
    if (destino === 1) foco.current = "siguiente";
    setPaso(destino);
  };

  const primero = paso === 1;
  const ultimo = paso === CIERRE;
  const etiquetaReproducir = ultimo ? "Ver de nuevo" : reproduciendo ? "Pausa" : "Reproducir";
  const actual = todos[paso - 1];
  const estiloTexto = (i) => (i === PASOS ? { fontFamily: SORA, fontWeight: 600 } : { fontFamily: INTER, fontWeight: 400 });
  return (
    <div ref={maquina} {...atributos} className={CLASE_T5}>
      <EstilosT5 />
      {escena(estado, refDe, reducido)}

      {/*
        ═══ EL BLOQUE DE CONTROL, PEGADO (guía v2 §4.4, modo B) ═══
        En su sitio, llega a los bordes del Panel con el margen negativo de su
        relleno (el mismo clamp de marco.jsx). Fijo, toma el interior del
        Panel. Lleva los radios inferiores del Panel.
      */}
      <div ref={hueco} data-hueco-bloque style={{
        marginTop: "14px", height: fijo ? `${fijo.alto}px` : undefined,
        marginLeft: "calc(-1 * clamp(14px, 2.2vw, 20px))", marginRight: "calc(-1 * clamp(14px, 2.2vw, 20px))",
      }}>
      <div ref={bloque} data-bloque-control data-modo={fijo ? "B-fijo" : "B-en-su-sitio"} style={{
        ...(fijo ? { position: "fixed", top: `${fijo.top}px`, left: `${fijo.left}px`, width: `${fijo.width}px`, boxSizing: "border-box" } : { position: "relative" }),
        zIndex: 20, padding: "12px 14px 14px", background: FONDO, borderTop: "1px solid rgba(248,249,250,0.14)",
        borderRadius: "0 0 20px 20px",
      }}>
        {/* El texto del paso: reserva el alto del más largo, a este ancho. */}
        <div style={{ display: "grid" }}>
          <div aria-hidden="true" style={{ gridArea: "1 / 1", display: "grid", visibility: "hidden" }}>
            {todos.map((x, i) => (
              <p key={`${i}-${x.texto}`} style={{ gridArea: "1 / 1", margin: 0, fontSize: "14px", lineHeight: 1.55, ...estiloTexto(i) }}>{pintar(x.texto)}</p>
            ))}
          </div>
          <div ref={texto} data-texto-paso tabIndex={-1} aria-live="polite" style={{ gridArea: "1 / 1", outline: "none" }}>
            <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.55, color: TEXTO, ...estiloTexto(paso - 1) }}>{pintar(actual.texto)}</p>
          </div>
        </div>
        <div style={{ display: "grid", marginTop: "4px" }}>
          <div aria-hidden="true" style={{ gridArea: "1 / 1", display: "grid", visibility: "hidden" }}>
            {todos.map((x, i) => <p key={`${i}-${x.pie}`} style={{ gridArea: "1 / 1", ...PIE }}>{pintarPie(x.pie)}</p>)}
          </div>
          <p data-pie style={{ gridArea: "1 / 1", ...PIE }}>{pintarPie(actual.pie)}</p>
        </div>

        {/* Los controles, copiados de LoQueYaPaso. */}
        <div style={{ display: "flex", gap: "9px", marginTop: "12px" }}>
          <button
            type="button"
            data-anterior
            disabled={primero}
            onClick={() => ir(paso - 1)}
            style={{ ...botonBase, ...(primero ? DESACTIVADO : { background: "transparent", border: `2px solid ${COLOR.neutro}`, color: COLOR.blanco }) }}
          >
            Anterior
          </button>
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "44px", marginTop: "4px" }}>
          <button
            type="button"
            data-reproducir
            aria-pressed={ultimo ? undefined : reproduciendo}
            onClick={() => {
              if (ultimo) { ir(1); return; }
              setReproduciendo((r) => !r);
            }}
            style={{
              minHeight: "44px", padding: "0 4px", background: "transparent", border: "none", cursor: "pointer",
              fontFamily: SORA, fontSize: "13px", fontWeight: 600, color: COLOR.blanco, textDecoration: "underline", textUnderlineOffset: "3px",
            }}
          >
            {etiquetaReproducir}
          </button>
          {/* «Paso N de M». En el cierre, vacío. */}
          <span data-paso-de style={{ fontFamily: INTER, fontSize: "12px", color: COLOR.apagado, fontVariantNumeric: "tabular-nums", visibility: ultimo ? "hidden" : "visible" }}>
            Paso {Math.min(paso, PASOS)} de {PASOS}
          </span>
        </div>
      </div>
      </div>
    </div>
  );
}
