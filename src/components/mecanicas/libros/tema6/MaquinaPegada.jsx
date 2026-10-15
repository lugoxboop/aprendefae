import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { useReducido } from "../tema3/DosLineas.jsx";
import EstilosT5, { CLASE_T5 } from "../tema5/EstilosT5.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { estadoParada } from "../../../../contabilidad/fusionar.js";

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
 * vea junto con lo resaltado; si no cabe, manda lo resaltado. `lector(paso)`
 * (T6 · A5) da lo que el lector de pantalla oye después del texto del paso,
 * dentro de la misma región viva (el pie, y en un paso el rótulo fijo); el
 * pie visible se le oculta entonces al lector para que no se lea dos veces.
 *
 * `parada` (hoja 7 de Mai): la predicción entre dos pasos, dentro del mismo
 * bloque. No es un paso: el contador dice «Antes del paso N» (N = `antes`, el
 * paso que viene). En el hueco del texto, la pregunta; debajo, las opciones
 * en fila; «Siguiente» desactivado hasta elegir. Un intento, sin puntaje: las
 * opciones se marcan como en la capa 3 y, si falló, la devolución ocupa el
 * sitio de la pregunta. La escena es la del paso anterior, con el resalte en
 * lo que nombra la pregunta. El bloque crece una sola vez, al entrar, hacia
 * arriba («Siguiente» no se mueve). «Reproducir» se pausa al llegar. La
 * decisión se conserva al volver y con «Ver de nuevo».
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

/* La parada: la pregunta en el estilo del texto de cierre; la devolución, con la forma de la de UnaFrase (sin coral). */
const PREGUNTA_PARADA = { margin: 0, fontFamily: SORA, fontSize: "14px", fontWeight: 600, lineHeight: 1.55, color: TEXTO };
const DEVOLUCION_PARADA = {
  margin: 0, padding: "11px 13px", borderRadius: "12px", fontFamily: INTER, fontSize: "13px", lineHeight: 1.55,
  color: "rgba(248,249,250,0.88)", background: "rgba(184,196,212,0.1)", borderLeft: `3px solid ${BORDES}`,
};
const ESTILOS_PARADA = `
@keyframes b5-parada-aparece { from { opacity: 0; } to { opacity: 1; } }
.b5-parada-aparece { animation: b5-parada-aparece 240ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .b5-parada-aparece { animation: none; } }
`;
const fallaDe = (parada, elegida) => (elegida && elegida !== parada.correcta
  ? (typeof parada.falla === "string" ? parada.falla : parada.falla[elegida])
  : null);
const fallas = (parada) => (typeof parada.falla === "string" ? [parada.falla] : Object.values(parada.falla));

/* Una opción de la parada, con las marcas de la capa 3 (hoja 6): correcta, tachada o apagada. */
function OpcionParada({ opcion, elegida, correcta, reducido, pintar, onElegir }) {
  const decidida = elegida !== null;
  const esCorrecta = decidida && opcion.id === correcta;
  const tachada = decidida && opcion.id === elegida && !esCorrecta;
  const d = esCorrecta ? 1 : 0;
  return (
    <button
      type="button"
      data-opcion={opcion.id}
      data-marca={!decidida ? "" : esCorrecta ? "correcta" : tachada ? "tachada" : "apagada"}
      aria-pressed={opcion.id === elegida}
      aria-disabled={decidida || undefined}
      onClick={() => { if (!decidida) onElegir(opcion.id); }}
      style={{
        flex: "1 1 0", minWidth: 0, minHeight: "44px", boxSizing: "border-box", borderRadius: "11px", textAlign: "center",
        padding: `${10 - d}px ${3 - d}px`,
        border: esCorrecta ? `2px solid ${NODO}` : "1px solid rgba(248,249,250,0.36)",
        background: esCorrecta ? NAVY : "rgba(10,20,34,0.4)",
        color: TEXTO, fontFamily: INTER, fontSize: "12.5px", fontWeight: 400, lineHeight: 1.45,
        textDecoration: tachada ? "line-through" : "none", textDecorationThickness: tachada ? "1.5px" : undefined,
        opacity: decidida && !esCorrecta && !tachada ? 0.5 : 1,
        transition: reducido ? "none" : "opacity 240ms ease",
        cursor: decidida ? "default" : "pointer",
      }}
    >
      {pintar(opcion.texto)}
    </button>
  );
}

export function transicion(reducido) {
  if (reducido) return "none";
  return ["border-color 200ms ease-out", "background-color 200ms ease-out", "color 200ms ease-out",
    "opacity 240ms ease-out", "transform 240ms ease-out", "visibility 240ms ease-out"].join(", ");
}
/*
 * La capa 2 no empieza vacía (hoja 5 de Mai, calidad): lo que todavía no
 * llegó se dibuja como SILUETA en su sitio, con su caja y sus renglones. La
 * silueta lleva la marca `--b5-silueta` y una opacidad de 0,3: sus bordes
 * reales quedan tenues (los transparentes siguen transparentes) y la hoja de
 * estilos de la célula (EstilosT5) le quita el texto y deja una barra por
 * renglón, del largo de sus palabras. Al llegar, la pieza real aparece sobre
 * su silueta con opacidad en 240 ms, sin el desplazamiento de 4 px: la caja
 * ya estaba ahí.
 */
export const SILUETA = "--b5-silueta";
export const OPACIDAD_SILUETA = 0.3;
export function aparicion(e, reducido) {
  return {
    visibility: "visible",
    opacity: e.visible ? 1 : OPACIDAD_SILUETA,
    transform: "none",
    transition: transicion(reducido),
    ...(e.visible ? {} : { [SILUETA]: 1 }),
  };
}
export const enSilueta = (nodo) => Boolean(nodo?.style?.getPropertyValue(SILUETA));

/*
 * Lo que está en silueta no ha llegado: el lector de pantalla no lo lee ni se
 * puede enfocar (D12; antes lo callaba visibility: hidden). En cada render, a
 * todo lo marcado con --b5-silueta y a los [data-futuro] / [data-silueta-futura]
 * de `raiz` se les pone aria-hidden="true" e inert; cuando llega su paso, se les
 * quitan. Solo se quita lo que se puso aquí (data-b5-mudo): un aria-hidden que
 * ya traía el nodo se queda.
 */
const MUDOS = `[style*="${SILUETA}"], [data-futuro], [data-silueta-futura]`;
export function useSiluetasMudas(raiz) {
  useLayoutEffect(() => {
    const r = raiz.current;
    if (!r) return;
    const ahora = new Set(r.querySelectorAll(MUDOS));
    for (const n of r.querySelectorAll("[data-b5-mudo]")) {
      if (ahora.has(n)) continue;
      if (n.dataset.b5Mudo === "propio") n.removeAttribute("aria-hidden");
      n.removeAttribute("inert");
      delete n.dataset.b5Mudo;
    }
    for (const n of ahora) {
      if (n.dataset.b5Mudo) continue;
      n.dataset.b5Mudo = n.getAttribute("aria-hidden") === "true" ? "previo" : "propio";
      n.setAttribute("aria-hidden", "true");
      n.setAttribute("inert", "");
    }
  });
}

/*
 * Las siluetas de lo que todavía no llega (momentos futuros: T5 · A2, T6 · A3
 * y A4) se dibujan mientras quepan enteras en el alto reservado de la escena:
 * la que no cabe no se dibuja, empezando por la última: primero los cuerpos,
 * del último al primero, y después las cabeceras. Nada se recorta y la
 * reserva nunca crece. `contenedor` es la capa viva; las siluetas candidatas
 * llevan `data-silueta-futura` («cuerpo» o «cabecera»). La reserva se mide
 * por su contenido: la celda de la escena se estira a la capa viva.
 */
export function useSiluetasQueCaben(contenedor, deps) {
  useLayoutEffect(() => {
    const ajustar = () => {
      const viva = contenedor.current;
      const escena = viva?.closest("[data-escena]");
      if (!viva || !escena) return;
      const todas = [...viva.querySelectorAll("[data-silueta-futura]")];
      if (!todas.length) return;
      for (const f of todas) f.style.display = "";
      const futuras = [...todas.filter((f) => f.dataset.siluetaFutura === "cabecera"), ...todas.filter((f) => f.dataset.siluetaFutura === "cuerpo")];
      const reserva = Math.max(0, ...[...escena.querySelectorAll("[data-reserva]")].map((r) => r.firstElementChild?.getBoundingClientRect().height ?? 0));
      if (!reserva) return;
      for (let k = futuras.length - 1; k >= 0 && viva.getBoundingClientRect().height > reserva + 0.5; k--) futuras[k].style.display = "none";
    };
    ajustar();
    /* Con las fuentes cargadas o con otro ancho, los renglones cambian: se vuelve a ajustar. */
    let vivo = true;
    document.fonts?.ready?.then(() => { if (vivo) ajustar(); });
    window.addEventListener("resize", ajustar);
    return () => { vivo = false; window.removeEventListener("resize", ajustar); };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
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

export default function MaquinaPegada({ todos, estadoPaso, duracion, escena, atributos = {}, pintar = (t) => t, pintarPie = (t) => t, lector = null, parada = null }) {
  const PASOS = todos.length - 1;
  const CIERRE = todos.length;
  const reducido = useReducido();
  const [paso, setPaso] = useState(1);
  /* La parada: si se está en ella (siempre después del paso `antes − 1`) y lo elegido, que se conserva. */
  const [enParada, setEnParada] = useState(false);
  const [eleccion, setEleccion] = useState(null);
  const recalcular = useRef(null);
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

  const estado = enParada ? estadoParada(estadoPaso, parada.antes, parada.resaltados) : estadoPaso(paso);
  useSiluetasMudas(maquina);

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
    recalcular.current = calcular;
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => { window.removeEventListener("scroll", pedir); window.removeEventListener("resize", pedir); if (cuadro !== null) cancelAnimationFrame(cuadro); };
  }, []);

  /* La parada cambia el alto del bloque: se vuelve a fijar (crece hacia arriba; «Siguiente» no se mueve). */
  useLayoutEffect(() => { recalcular.current?.(); }, [enParada, eleccion]);

  /* Un paso adelante, con la parada entre `antes − 1` y `antes`. Devuelve si quedó en la parada. */
  const avanzar = () => {
    if (parada && !enParada && paso === parada.antes - 1) { setEnParada(true); return true; }
    if (enParada) { setEnParada(false); setPaso(parada.antes); return false; }
    setPaso((p) => Math.min(CIERRE, p + 1));
    return false;
  };

  /* «Reproducir», copiado de LoQueYaPaso. Se pausa al llegar a la parada; la parada no tiene duración. */
  useEffect(() => {
    if (!reproduciendo) return undefined;
    if (paso >= CIERRE) { setReproduciendo(false); return undefined; }
    if (enParada) {
      /* Sin elegir, no sigue; ya elegida, sigue desde el paso que viene. */
      if (eleccion === null) { setReproduciendo(false); return undefined; }
      avanzar();
      return undefined;
    }
    const t = setTimeout(() => { if (avanzar()) setReproduciendo(false); }, duracion(paso));
    return () => clearTimeout(t);
  }, [reproduciendo, paso, enParada]); // eslint-disable-line react-hooks/exhaustive-deps
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
    /*
     * Con el bloque pegado, su tope es el de cuando la página ya se movió:
     * el borde inferior menos su alto. Medirlo antes de mover daba la cima de
     * la máquina cuando esta empezaba baja en la pantalla (T6 · A5, medido).
     */
    const caja = bloque.current?.getBoundingClientRect();
    const tope = caja && (fijo ? window.innerHeight - caja.height : caja.top);
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
  }, [paso, enParada]); // eslint-disable-line react-hooks/exhaustive-deps

  const ir = (nuevo) => {
    setReproduciendo(false);
    const destino = Math.min(CIERRE, Math.max(1, nuevo));
    if (parada) {
      /* Desde la parada: «Siguiente» va al paso que viene; «Anterior», al de antes. Al foco no se le toca. */
      if (enParada) { setEnParada(false); if (destino > paso) setPaso(parada.antes); return; }
      /* Hacia la parada, desde el paso de antes (adelante) o desde el que viene (atrás): vuelve ya decidida. */
      if (paso === parada.antes - 1 && destino === parada.antes) { setEnParada(true); return; }
      if (paso === parada.antes && destino === parada.antes - 1) { setEnParada(true); setPaso(destino); return; }
    }
    if (destino === CIERRE) foco.current = "texto";
    if (destino === 1) foco.current = "siguiente";
    setPaso(destino);
  };

  const primero = paso === 1 && !enParada;
  const ultimo = paso === CIERRE;
  const etiquetaReproducir = ultimo ? "Ver de nuevo" : reproduciendo ? "Pausa" : "Reproducir";
  const falla = enParada ? fallaDe(parada, eleccion) : null;
  const aparece = reducido ? undefined : "b5-parada-aparece";
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
            {/* En la parada (y solo en ella) se reserva también la pregunta y cada devolución: el bloque crece una vez, al entrar. */}
            {enParada && [
              <p key="pregunta" style={{ gridArea: "1 / 1", ...PREGUNTA_PARADA }}>{pintar(parada.pregunta)}</p>,
              ...fallas(parada).map((t) => <p key={t} style={{ gridArea: "1 / 1", ...DEVOLUCION_PARADA }}>{pintar(t)}</p>),
            ]}
          </div>
          <div ref={texto} data-texto-paso tabIndex={-1} aria-live="polite" style={{ gridArea: "1 / 1", outline: "none" }}>
            {enParada ? (
              falla
                ? <p data-devolucion className={aparece} style={DEVOLUCION_PARADA}>{pintar(falla)}</p>
                : <p data-pregunta style={PREGUNTA_PARADA}>{pintar(parada.pregunta)}</p>
            ) : (
              <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.55, color: TEXTO, ...estiloTexto(paso - 1) }}>{pintar(actual.texto)}</p>
            )}
            {lector && (enParada ? [pintar(parada.pie)] : lector(paso)).map((t) => <span key={t} data-lector style={SOLO_LECTOR}>{` ${t}`}</span>)}
          </div>
        </div>
        {enParada && (
          <div data-parada={parada.antes} role="group" aria-label={parada.pregunta} style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
            <style>{ESTILOS_PARADA}</style>
            {parada.opciones.map((o) => (
              <OpcionParada key={o.id} opcion={o} elegida={eleccion} correcta={parada.correcta} reducido={reducido} pintar={pintar} onElegir={setEleccion} />
            ))}
          </div>
        )}
        <div style={{ display: "grid", marginTop: "4px" }}>
          <div aria-hidden="true" style={{ gridArea: "1 / 1", display: "grid", visibility: "hidden" }}>
            {todos.map((x, i) => <p key={`${i}-${x.pie}`} style={{ gridArea: "1 / 1", ...PIE }}>{pintarPie(x.pie)}</p>)}
            {enParada && <p style={{ gridArea: "1 / 1", ...PIE }}>{pintarPie(parada.pie)}</p>}
          </div>
          <p data-pie aria-hidden={lector ? "true" : undefined} style={{ gridArea: "1 / 1", ...PIE }}>{pintarPie(enParada ? parada.pie : actual.pie)}</p>
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
            disabled={ultimo || (enParada && eleccion === null)}
            onClick={() => ir(paso + 1)}
            style={{ ...botonBase, ...(ultimo || (enParada && eleccion === null) ? DESACTIVADO : { background: COLOR.neutro, border: `2px solid ${COLOR.neutro}`, color: COLOR.navy }) }}
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
            {enParada ? `Antes del paso ${parada.antes}` : `Paso ${Math.min(paso, PASOS)} de ${PASOS}`}
          </span>
        </div>
      </div>
      </div>
    </div>
  );
}
