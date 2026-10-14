import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { ESCENA_T6, PASOS_T6, CIERRE_T6 } from "../../../../data/contabilidadT6Pieza1.js";
import { estadoPasoT6, PASOS, CIERRE, duracionPasoT6 } from "../../../../contabilidad/t6Pieza1.js";
import { useReducido } from "../tema3/DosLineas.jsx";
import EstilosT5, { CLASE_T5 } from "../tema5/EstilosT5.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 1 · CAPA 2 · «MÍRELO FUNCIONAR» — los libros de
 * Comercializadora Santa Pacha en dos días (guía v2 de Mai, §4).
 *
 * La escena (decorativa: el texto del paso dice cada movimiento, incluidos
 * «se debita» y «se acredita») y, debajo, el bloque de control PEGADO
 * (§4.4, modo A: sticky), porque la máquina no cabe en una pantalla. Los
 * modos B y C de la v2 solo hacen falta si A falla en el sitio; la prueba de
 * la regla dio A, así que no se construyen.
 *
 * Teal es Debe y ámbar es Haber, siempre en cápsula rellena con su palabra;
 * las cápsulas no se atenúan. Los controles son los de LoQueYaPaso, como en
 * T5 · A1. Ningún texto vive aquí: todo sale del archivo de datos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const TEXTO = FAE.text;
const SECUNDARIO = COLOR.apagado; // #A8B6C8
const NODO = FAE.node; // #CBDCF2
const BORDES = COLOR.neutro; // #B8C4D4
const ATENUADO = "rgba(184,196,212,.50)";
const NAVY = FAE.navy;
const TEAL = FAE.teal; // Debe
const AMBAR = FAE.ambar; // Haber
const FONDO = FAE.bg; // #0E1B2E

const botonBase = {
  flex: "1 1 0", minWidth: 0, height: "44px", borderRadius: "999px", fontFamily: SORA, fontSize: "14px", fontWeight: 600,
  cursor: "pointer", boxSizing: "border-box",
};
const DESACTIVADO = { background: "transparent", border: `2px solid ${COLOR.quieto}`, color: COLOR.apagado, cursor: "default" };
const PIE = { margin: 0, fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: COLOR.apagado };

function transicion(reducido) {
  if (reducido) return "none";
  return ["border-color 200ms ease-out", "background-color 200ms ease-out", "color 200ms ease-out",
    "opacity 240ms ease-out", "transform 240ms ease-out", "visibility 240ms ease-out"].join(", ");
}
function aparicion(e, reducido) {
  return {
    visibility: e.visible ? "visible" : "hidden",
    opacity: e.visible ? 1 : 0,
    transform: e.visible || reducido ? "none" : "translateY(4px)",
    transition: transicion(reducido),
  };
}
/* Resaltado: borde 2 nodo y relleno navy, con el relleno compensado; atenuado: secundario. */
function caja(e, relleno, reducido, { conNavy = true } = {}) {
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
function Lado({ lado }) {
  const debe = lado === "debe";
  return (
    <span data-lado={lado} style={{
      display: "inline-block", whiteSpace: "nowrap", borderRadius: "999px", padding: "1px 8px",
      background: debe ? TEAL : AMBAR, color: FONDO, fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: 1.35,
    }}>
      {debe ? ESCENA_T6.debita : ESCENA_T6.acredita}
    </span>
  );
}

function Anotacion({ id, e, cuenta, movimiento, lado, reducido, refDe }) {
  return (
    <div ref={refDe(id)} data-elemento={id} data-resaltado={e.resaltado ? "si" : "no"} style={{ borderRadius: "10px", ...caja(e, [6, 8], reducido) }}>
      <p style={{ margin: 0, fontFamily: SORA, fontSize: "12.5px", fontWeight: 600, lineHeight: 1.3, whiteSpace: "nowrap", color: "inherit" }}>{cuenta}</p>
      <p style={{ margin: "3px 0 0", display: "flex", alignItems: "center", gap: "6px", fontFamily: INTER, fontSize: "12px", lineHeight: 1.35, color: "inherit" }}>
        <span>{movimiento}</span>
        {lado && <Lado lado={lado} />}
      </p>
    </div>
  );
}

export default function DosMomentos() {
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
  const refDe = (id) => (n) => { piezas.current[id] = n; };

  const estado = estadoPasoT6(paso);
  const el = estado.elementos;

  /* «Reproducir», copiado de LoQueYaPaso. */
  useEffect(() => {
    if (!reproduciendo) return undefined;
    if (paso >= CIERRE) { setReproduciendo(false); return undefined; }
    const t = setTimeout(() => setPaso((p) => Math.min(CIERRE, p + 1)), duracionPasoT6(paso));
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
    const juntos = { top: Math.min(...rects.map((r) => r.top)), bottom: Math.max(...rects.map((r) => r.bottom)) };
    const objetivo = juntos.bottom - juntos.top <= abajo - arriba ? juntos : rects[0];
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
  const todos = [...PASOS_T6, CIERRE_T6];
  const actual = todos[paso - 1];
  const estiloTexto = (i) => (i === PASOS ? { fontFamily: SORA, fontWeight: 600 } : { fontFamily: INTER, fontWeight: 400 });
  const dia = (id, e) => ({
    borderRadius: "12px", display: "flex", flexDirection: "column", gap: "6px",
    /* El recuadro resaltado lleva borde nodo SIN relleno navy (v2 §A), y compensa el borde. */
    ...caja(e, [8, 10, 10], reducido, { conNavy: false }),
  });

  return (
    <div ref={maquina} data-capa2-t6 className={CLASE_T5}>
      <EstilosT5 />
      {/* ═══ LA ESCENA ═══ */}
      <div data-escena aria-hidden="true">
        <p data-elemento="perspectiva" style={{ margin: "0 0 8px", fontFamily: INTER, fontSize: "12px", lineHeight: 1.35, color: SECUNDARIO }}>
          {ESCENA_T6.perspectiva}
        </p>

        <div ref={refDe("dia10")} data-elemento="dia10" data-resaltado={el.dia10.resaltado ? "si" : "no"} style={dia("dia10", el.dia10)}>
          <p style={{ margin: 0, fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, color: "inherit" }}>{ESCENA_T6.dia10}</p>
          <div ref={refDe("hecho10")} data-elemento="hecho10" data-resaltado={el.hecho10.resaltado ? "si" : "no"} style={{
            borderRadius: "10px", display: "flex", justifyContent: "space-between", gap: "8px",
            fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, ...caja(el.hecho10, [6, 8], reducido),
          }}>
            <span>{ESCENA_T6.venta}</span><span>{ESCENA_T6.monto}</span>
          </div>
          <span ref={refDe("plazo")} data-elemento="plazo" data-resaltado={el.plazo.resaltado ? "si" : "no"} style={{
            alignSelf: "flex-start", borderRadius: "999px", whiteSpace: "nowrap", fontFamily: INTER, fontSize: "12px", lineHeight: 1.35,
            ...caja(el.plazo, [1, 8], reducido),
          }}>
            {ESCENA_T6.plazo}
          </span>
          <Anotacion id="ingresos10" e={el.ingresos10} cuenta={ESCENA_T6.ingresos} movimiento={ESCENA_T6.monto} lado="haber" reducido={reducido} refDe={refDe} />
          <Anotacion id="clientes10" e={el.clientes10} cuenta={ESCENA_T6.clientes} movimiento={ESCENA_T6.sube} lado="debe" reducido={reducido} refDe={refDe} />
        </div>

        <div ref={refDe("dia25")} data-elemento="dia25" data-resaltado={el.dia25.resaltado ? "si" : "no"} style={{ marginTop: "8px", ...dia("dia25", el.dia25) }}>
          <p style={{ margin: 0, fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, color: "inherit" }}>{ESCENA_T6.dia25}</p>
          <div ref={refDe("hecho25")} data-elemento="hecho25" data-resaltado={el.hecho25.resaltado ? "si" : "no"} style={{
            borderRadius: "10px", fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, ...caja(el.hecho25, [6, 8], reducido),
          }}>
            {ESCENA_T6.pago}
          </div>
          <Anotacion id="caja25" e={el.caja25} cuenta={ESCENA_T6.caja} movimiento={ESCENA_T6.monto} lado="debe" reducido={reducido} refDe={refDe} />
          <Anotacion id="clientes25" e={el.clientes25} cuenta={ESCENA_T6.clientes} movimiento={ESCENA_T6.baja} lado="haber" reducido={reducido} refDe={refDe} />
        </div>
      </div>

      {/*
        ═══ EL BLOQUE DE CONTROL, PEGADO (guía v2 §4.4, modo A) ═══
        Llega a los bordes del Panel con el margen negativo de su relleno
        (el mismo clamp de marco.jsx), y lleva sus radios inferiores.
      */}
      <div ref={bloque} data-bloque-control style={{
        position: "sticky", bottom: 0, zIndex: 2, marginTop: "14px",
        marginLeft: "calc(-1 * clamp(14px, 2.2vw, 20px))", marginRight: "calc(-1 * clamp(14px, 2.2vw, 20px))",
        padding: "12px 14px 14px", background: FONDO, borderTop: "1px solid rgba(248,249,250,0.14)",
        borderRadius: "0 0 20px 20px",
      }}>
        {/* El texto del paso: reserva el alto del más largo, a este ancho. */}
        <div style={{ display: "grid" }}>
          <div aria-hidden="true" style={{ gridArea: "1 / 1", display: "grid", visibility: "hidden" }}>
            {todos.map((x, i) => (
              <p key={x.texto} style={{ gridArea: "1 / 1", margin: 0, fontSize: "14px", lineHeight: 1.55, ...estiloTexto(i) }}>{x.texto}</p>
            ))}
          </div>
          <div ref={texto} data-texto-paso tabIndex={-1} aria-live="polite" style={{ gridArea: "1 / 1", outline: "none" }}>
            <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.55, color: TEXTO, ...estiloTexto(paso - 1) }}>{actual.texto}</p>
          </div>
        </div>
        <div style={{ display: "grid", marginTop: "4px" }}>
          <div aria-hidden="true" style={{ gridArea: "1 / 1", display: "grid", visibility: "hidden" }}>
            {todos.map((x, i) => <p key={`${i}-${x.pie}`} style={{ gridArea: "1 / 1", ...PIE }}>{x.pie}</p>)}
          </div>
          <p data-pie style={{ gridArea: "1 / 1", ...PIE }}>{actual.pie}</p>
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
          {/* «Paso N de 9»: el total depende de la v3 de Mai (la v2 dice 8). En el cierre, vacío. */}
          <span data-paso-de style={{ fontFamily: INTER, fontSize: "12px", color: COLOR.apagado, fontVariantNumeric: "tabular-nums", visibility: ultimo ? "hidden" : "visible" }}>
            Paso {Math.min(paso, PASOS)} de {PASOS}
          </span>
        </div>
      </div>
    </div>
  );
}
