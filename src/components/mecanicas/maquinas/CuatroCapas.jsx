import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAE } from "../../../theme.js";
import { Panel } from "../salaDeControl/marco.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * UNA PIEZA DE APRENDER EN CUATRO CAPAS — Política Monetaria.
 *
 *   Capa 1  Primero, los nombres     las definiciones
 *   Capa 2  Mírelo funcionar         paso a paso; cada paso resalta UNA parte
 *                                    de la escena y apaga el resto
 *   Capa 3  Ahora pruebe usted       la exploración libre, sin calificar
 *   Capa 4  En una frase             una pregunta abierta y la respuesta de
 *                                    referencia, que se muestra a pedido
 *
 * Material teórico: cero FP. No llama a registrar_fp, no entra al catálogo y
 * la capa 4 no califica nada: la respuesta de referencia es para comparar, no
 * para corregir.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * El rótulo de una cita textual dentro de la capa 1. Vive aquí, en el
 * componente que la pinta, y no en los datos de una materia: la capa 1 es lo
 * que comparten todas las piezas de Aprender del sitio, y si la etiqueta
 * viviera en Contabilidad, la siguiente materia que citara un libro escribiría
 * la suya y habría dos formas de decir lo mismo.
 */
const ROTULO_DEL_LIBRO = "Así lo dice el libro";

const ROTULO_CAPA = {
  fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em",
  color: FAE.teal, margin: "0 0 10px",
};

/*
 * `refSeccion` y `refRotulo` solo los usa la capa 1 paginada: «Continuar» baja
 * hasta la capa 2 y le pone el foco a su rótulo. Sin ellos (un solo término),
 * el rótulo no lleva tabindex y la capa es la de siempre.
 */
function Capa({ numero, nombre, children, refSeccion, refRotulo }) {
  return (
    <section ref={refSeccion} data-capa={numero} style={{ marginTop: numero === 1 ? 0 : "26px" }}>
      <p
        ref={refRotulo}
        {...(refRotulo ? { tabIndex: -1 } : {})}
        style={refRotulo ? { ...ROTULO_CAPA, outline: "none" } : ROTULO_CAPA}
      >
        CAPA {numero} — {nombre.toUpperCase()}
      </p>
      {children}
    </section>
  );
}

/* ═══════════ LA CAPA 1 DE SIEMPRE: TODOS LOS TÉRMINOS A LA VEZ ═══════════ */

/*
 * La que se pinta con un solo término, o cuando la pieza pide
 * `capa1EnLista` (ver abajo). Es, sin un pixel de diferencia, la capa 1 que
 * había antes de la paginada.
 */
function CapaUnoEnLista({ nombres }) {
  return (
    <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "9px" }}>
      {nombres.map((n) => (
        <div key={n.termino}>
          <dt style={{ display: "inline", fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700, color: FAE.text }}>{n.termino}: </dt>
          <dd style={{ display: "inline", margin: 0, fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.8)" }}>{n.definicion}</dd>
          {/*
            ═══════════ LA CITA VA DEBAJO, Y NUNCA ABRE LA LÍNEA ═══════════

            Cuando una línea trae `delLibro`, la idea simple se lee primero
            y la frase textual del libro va debajo, rotulada. El orden es el
            argumento: quien no entiende la frase del libro alcanza a
            entender la línea de arriba, y solo entonces se topa con la
            cita. Al revés, la cita lo detiene antes de empezar.

            Las piezas que no traen `delLibro` no pintan nada de esto.
          */}
          {n.delLibro && <CajaDelLibro n={n} />}
          {n.notaDebajo && <CajaDelLibro n={notaDe(n)} atributos={{ "data-nota": "" }} />}
        </div>
      ))}
    </dl>
  );
}

/*
 * Lo que trae un término bajo la definición:
 *   · la CITA del libro: `delLibro` sin `rotuloDelLibro` (rótulo «Así lo dice
 *     el libro»);
 *   · una NOTA: `delLibro` con `rotuloDelLibro` (p. ej. «Nota»), o
 *     `notaDebajo` ({ rotulo, texto }) cuando el término trae cita y nota.
 */
const esNota = (n) => Boolean(n.delLibro && n.rotuloDelLibro);
const citaDe = (n) => (n.delLibro && !n.rotuloDelLibro ? n : null);
const notaDe = (n) => (esNota(n) ? n : n.notaDebajo ? { delLibro: n.notaDebajo.texto, rotuloDelLibro: n.notaDebajo.rotulo } : null);

/* La caja de la cita (o de la nota, con `rotuloDelLibro`), igual en las dos capas 1. */
function CajaDelLibro({ n, estilo, atributos = {} }) {
  return (
    <div data-del-libro {...atributos} style={{
      margin: "7px 0 0", padding: "9px 11px", borderRadius: "10px",
      background: "rgba(10,20,34,0.4)", borderLeft: "3px solid rgba(248,249,250,0.2)", ...estilo,
    }}>
      <p style={{
        margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: "10px",
        fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
        color: "rgba(248,249,250,0.5)",
      }}>
        {n.rotuloDelLibro ?? ROTULO_DEL_LIBRO}
      </p>
      <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.55, color: "rgba(248,249,250,0.72)" }}>
        {n.delLibro}
      </p>
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CAPA 1 PAGINADA: UN TÉRMINO POR PANTALLA (Mai, 15-oct; B2 de Futaba).
 *
 * Desde dos términos, la capa 1 muestra uno a la vez:
 *   1. una fila de 44 con «Término N de M» y un punto por término. Los puntos
 *      se tocan (28 × 44, con el nombre del término para el lector) y su
 *      FORMA dice el estado, no el color: el actual es más grande, relleno y
 *      con anillo (aria-current="step"); el visto, relleno; el que falta,
 *      solo contorno. Con muchos términos (T5 · A1 tiene 9), los puntos bajan
 *      a su propio renglón: a 320 no caben junto al contador;
 *   2. la carta del término: su nombre (encabezado con tabindex="-1": recibe
 *      el foco al cambiar), la `figura` si la trae, la definición (con su pie,
 *      si la pieza lo compuso dentro), la NOTA si la trae, siempre a la
 *      vista bajo la definición (como antes de la paginada), y, solo si el
 *      término trae cita del libro, «Ver lo que dice el libro», que pliega la
 *      caja de la cita (auditoría de Shoko, 15-oct: plegar la nota escondía
 *      lo que el término necesita para entenderse);
 *   3. «Anterior» y «Siguiente», en el bloque pegado abajo, como la capa 2.
 *      En el último término, «Siguiente» pasa a «Continuar»: baja a la capa 2
 *      y le pone el foco a su rótulo.
 *
 * Los botones no se mueven entre términos: todas las cartas se apilan en la
 * misma celda de una rejilla, así que la celda mide lo que la más alta (con
 * la cita cerrada y la nota a la vista). Solo se ve la actual; las otras quedan ocultas a la vista,
 * al lector y al foco (visibility, aria-hidden e inert), y su texto no se lee.
 *
 * El bloque pegado va «fijo por script» (el modo B de MaquinaPegada.jsx):
 * position: sticky no pega porque FondoMateria, que envuelve las vistas,
 * tiene overflow: hidden. Se fija cuando su sitio natural queda por debajo
 * de la ventana y la capa está en pantalla; deja un hueco de su alto.
 *
 * Al cambiar de término: la carta nueva aparece con opacidad en 200 ms (al
 * instante con movimiento reducido), el foco pasa a su nombre y, si la cima
 * de la capa quedó arriba de la pantalla, la página sube hasta ella.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SECUNDARIO = "#A8B6C8";
const NEUTRO = "#B8C4D4";
const QUIETO = "#8C9BB0";
/* El relleno del Panel (marco.jsx): el bloque pegado llega a sus bordes. */
const RELLENO_PANEL = "clamp(14px, 2.2vw, 20px)";
/* Lo más alto que puede medir una figura (Mai §4). */
const ALTO_FIGURA = 150;

const ESTILOS_PAGINADA = `
.fae-cc-carta { transition: opacity 200ms ease; }
.fae-cc-chevron { transition: transform 200ms ease; }
@media (prefers-reduced-motion: reduce) { .fae-cc-carta, .fae-cc-chevron { transition: none; } }
`;

const conMovimientoReducido = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function"
  && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Los botones del bloque pegado de la capa 2 (MaquinaPegada.jsx): 44 de alto, píldora; «Siguiente» con relleno. */
const BOTON_NAV = {
  flex: "1 1 0", minWidth: 0, height: "44px", borderRadius: "999px", fontFamily: "Sora, sans-serif", fontSize: "14px",
  fontWeight: 600, cursor: "pointer", boxSizing: "border-box",
};
const NAV_DESACTIVADO = { background: "transparent", border: `2px solid ${QUIETO}`, color: SECUNDARIO, cursor: "default" };
const NAV_ANTERIOR = { background: "transparent", border: `2px solid ${NEUTRO}`, color: "#FFFFFF" };
const NAV_SIGUIENTE = { background: NEUTRO, border: `2px solid ${NEUTRO}`, color: FAE.navy };

/* El punto de un término: la forma dice el estado (actual · visto · sin-ver). */
function Punto({ estado }) {
  const lado = estado === "actual" ? 12 : 8;
  return (
    <span aria-hidden="true" style={{
      display: "block", width: `${lado}px`, height: `${lado}px`, borderRadius: "50%", boxSizing: "border-box",
      ...(estado === "sin-ver"
        ? { background: "transparent", border: `1.5px solid ${FAE.node}` }
        : { background: FAE.node }),
      ...(estado === "actual" ? { boxShadow: `0 0 0 2px ${FAE.bg}, 0 0 0 3.5px ${FAE.node}` } : {}),
    }} />
  );
}

function CapaUnoPaginada({ nombres, capa, capa2, rotuloCapa2 }) {
  const total = nombres.length;
  const [actual, setActual] = useState(0);
  const [vistos, setVistos] = useState(() => new Set([0]));
  const [abierto, setAbierto] = useState(false);
  const [fijo, setFijo] = useState(null);
  const encabezados = useRef([]);
  const zona = useRef(null);
  const hueco = useRef(null);
  const bloque = useRef(null);
  const cambio = useRef(false);
  const id = useId();
  const ultimo = actual === total - 1;

  const ir = (k) => {
    if (k < 0 || k >= total || k === actual) return;
    cambio.current = true;
    setActual(k);
    setAbierto(false);
    setVistos((v) => new Set(v).add(k));
  };

  /* Después de cambiar de término (no al montar): el foco al nombre y, si hace falta, la página a la cima de la capa. */
  useEffect(() => {
    if (!cambio.current) return;
    cambio.current = false;
    /*
     * Con movimiento reducido, la hoja global le da a todo una transición de
     * 0,01 ms, y el nombre hereda `visibility` con ella: en este instante
     * todavía está oculto y focus() no hace nada. Si no lo tomó, se reintenta
     * cuando la transición ya terminó (dos cuadros después).
     */
    const nombre = encabezados.current[actual];
    nombre?.focus({ preventScroll: true });
    if (nombre && document.activeElement !== nombre) {
      requestAnimationFrame(() => requestAnimationFrame(() => nombre.focus({ preventScroll: true })));
    }
    const seccion = capa.current;
    if (seccion && seccion.getBoundingClientRect().top < 0) {
      seccion.scrollIntoView?.({ block: "start", behavior: conMovimientoReducido() ? "auto" : "smooth" });
    }
  }, [actual]); // eslint-disable-line react-hooks/exhaustive-deps

  /* «Continuar»: todos quedan vistos, la página baja a la capa 2 y el foco va a su rótulo. */
  const continuar = () => {
    setVistos(new Set(nombres.map((_, k) => k)));
    rotuloCapa2.current?.focus({ preventScroll: true });
    capa2.current?.scrollIntoView?.({ block: "start", behavior: conMovimientoReducido() ? "auto" : "smooth" });
  };

  /*
   * El bloque pegado, fijo por script (modo B de MaquinaPegada.jsx). Se
   * recalcula en scroll y resize, una vez por cuadro, y cuando la capa cambia
   * de alto (al abrir «Más»).
   */
  useLayoutEffect(() => {
    let cuadro = null;
    const calcular = () => {
      cuadro = null;
      const h = hueco.current; const z = zona.current; const b = bloque.current;
      if (!h || !z || !b) return;
      const alto = b.getBoundingClientRect().height;
      const sitio = h.getBoundingClientRect().top;
      const cima = z.getBoundingClientRect().top;
      const panel = capa.current?.parentElement?.getBoundingClientRect();
      const va = Boolean(panel) && sitio + alto > window.innerHeight && cima + alto < window.innerHeight;
      setFijo((antes) => {
        if (!va) return antes === null ? antes : null;
        const nuevo = { left: panel.left + 1, width: panel.width - 2, alto };
        return antes && ["left", "width", "alto"].every((k) => Math.abs(antes[k] - nuevo[k]) < 0.5) ? antes : nuevo;
      });
    };
    const pedir = () => { if (cuadro === null) cuadro = requestAnimationFrame(calcular); };
    calcular();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    const ro = typeof ResizeObserver !== "undefined" && zona.current ? new ResizeObserver(pedir) : null;
    ro?.observe(zona.current);
    return () => {
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      ro?.disconnect();
      if (cuadro !== null) cancelAnimationFrame(cuadro);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const estadoDe = (k) => (k === actual ? "actual" : vistos.has(k) ? "visto" : "sin-ver");

  return (
    <div ref={zona} data-capa1-paginada>
      <style>{ESTILOS_PAGINADA}</style>

      <div data-fila-contador style={{
        display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
        columnGap: "8px", minHeight: "44px",
      }}>
        <p id={`${id}-contador`} data-contador style={{
          margin: 0, fontFamily: "Inter, sans-serif", fontSize: "12px", lineHeight: "16px", color: SECUNDARIO,
        }}>
          Término {actual + 1} de {total}
        </p>
        <div role="group" aria-labelledby={`${id}-contador`} data-puntos style={{ display: "flex", marginLeft: "auto" }}>
          {nombres.map((n, k) => (
            <button
              key={`${k}-${n.termino}`}
              type="button"
              data-punto={k}
              data-estado={estadoDe(k)}
              aria-label={n.termino}
              aria-current={k === actual ? "step" : undefined}
              onClick={() => ir(k)}
              style={{
                width: "28px", height: "44px", padding: 0, margin: 0, border: 0, background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
            >
              <Punto estado={estadoDe(k)} />
            </button>
          ))}
        </div>
      </div>

      {/* Todas las cartas en la misma celda: la celda mide lo que la más alta. */}
      <div data-cartas style={{ display: "grid", marginTop: "4px" }}>
        {nombres.map((n, k) => {
          const visible = k === actual;
          const Figura = n.figura;
          const cita = citaDe(n);
          const nota = notaDe(n);
          return (
            <div
              key={`${k}-${n.termino}`}
              data-termino={k}
              {...(visible ? { "data-actual": "" } : { "aria-hidden": "true", inert: "" })}
              className="fae-cc-carta"
              style={{ gridArea: "1 / 1", minWidth: 0, visibility: visible ? "visible" : "hidden", opacity: visible ? 1 : 0 }}
            >
              <h4
                ref={(el) => { encabezados.current[k] = el; }}
                tabIndex={-1}
                data-nombre-termino
                style={{
                  margin: 0, fontFamily: "Sora, sans-serif", fontSize: "16px", fontWeight: 600, lineHeight: 1.35,
                  color: FAE.text, outline: "none",
                }}
              >
                {n.termino}
              </h4>
              {Figura && (
                <div data-figura style={{ marginTop: "10px", maxHeight: `${ALTO_FIGURA}px`, overflow: "hidden" }}>
                  <Figura />
                </div>
              )}
              <div data-definicion style={{ marginTop: "8px", fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.8)" }}>
                {n.definicion}
              </div>
              {/* La nota, siempre a la vista bajo la definición. */}
              {nota && <CajaDelLibro n={nota} atributos={{ "data-nota": "" }} />}
              {/* Solo la cita del libro se pliega: con ella, un término pasaba de 100 palabras (B2 pide 60). */}
              {cita && (
                <>
                  <button
                    type="button"
                    data-mas
                    aria-expanded={visible && abierto}
                    aria-controls={visible ? `${id}-mas` : undefined}
                    onClick={() => setAbierto((a) => !a)}
                    style={{
                      marginTop: "6px", width: "100%", minHeight: "44px", padding: 0, border: 0, background: "transparent",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", textAlign: "left",
                      fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "rgba(248,249,250,0.88)",
                      cursor: "pointer",
                    }}
                  >
                    <span>Ver lo que dice el libro</span>
                    <ChevronDown
                      aria-hidden="true"
                      size={18}
                      className="fae-cc-chevron"
                      style={{ flexShrink: 0, transform: visible && abierto ? "rotate(180deg)" : "none" }}
                    />
                  </button>
                  {visible && (
                    <div id={`${id}-mas`} data-mas-contenido hidden={!abierto}>
                      <CajaDelLibro n={cita} estilo={{ margin: 0 }} />
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* El bloque pegado; en su sitio, llega a los bordes del Panel con el margen negativo de su relleno. */}
      <div ref={hueco} data-hueco-nav style={{
        marginTop: "12px", height: fijo ? `${fijo.alto}px` : undefined,
        marginLeft: `calc(-1 * ${RELLENO_PANEL})`, marginRight: `calc(-1 * ${RELLENO_PANEL})`,
      }}>
        <div ref={bloque} data-nav-capa1 data-modo={fijo ? "fijo" : "en-su-sitio"} style={{
          ...(fijo
            ? { position: "fixed", bottom: 0, left: `${fijo.left}px`, width: `${fijo.width}px`, boxSizing: "border-box" }
            : { position: "relative" }),
          zIndex: 20, display: "flex", gap: "9px", padding: `12px ${RELLENO_PANEL}`,
          background: FAE.bg, borderTop: "1px solid rgba(248,249,250,0.14)",
        }}>
          <button
            type="button"
            data-anterior
            disabled={actual === 0}
            onClick={() => ir(actual - 1)}
            style={{ ...BOTON_NAV, ...(actual === 0 ? NAV_DESACTIVADO : NAV_ANTERIOR) }}
          >
            Anterior
          </button>
          <button
            type="button"
            data-siguiente
            data-continuar={ultimo ? "" : undefined}
            onClick={ultimo ? continuar : () => ir(actual + 1)}
            style={{ ...BOTON_NAV, ...NAV_SIGUIENTE }}
          >
            {ultimo ? "Continuar" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
}

/*
 *  llega desde fuera desde que Contabilidad usa esta pieza: el mundo
 * visual de cada materia es suyo, y una pieza de Contabilidad rotulada «SALA
 * DE MAQUINAS» diria que el estudiante esta en Politica Monetaria. El valor
 * por defecto conserva el de las tres piezas que ya existian.
 */
/*
 * ═══════════ LO QUE UNA PIEZA PUEDE TRAER SUYO ═══════════
 *
 * `Capa2` sustituye el paso-a-paso por la máquina propia de esa pieza, y
 * `pieza.opciones` cambia la capa 4 de «ver la respuesta de referencia» a un
 * selector con devolución. Los dos van apagados por defecto: las cuatro
 * piezas que ya existían no cambian ni un pixel.
 *
 * En la capa 1, cada término puede traer `figura` (un componente, de 150 de
 * alto como mucho a 320), que va entre su nombre y su definición. Y la pieza
 * puede pedir `capa1EnLista: true` para conservar todos los términos a la
 * vez cuando uno remite a otro que tiene que estar en pantalla al mismo
 * tiempo (la siembra de los verbos de T1, en contabilidadIntro.js). Con un
 * solo término, la capa 1 es la de siempre: sin contador y sin botones.
 *
 * Se hizo así y no forkando el componente porque lo que comparten —el panel,
 * los rótulos de capa, la capa 1— es justo lo que hace que todas las piezas
 * de Aprender del sitio se sientan la misma cosa. Dos marcos parecidos se
 * separan en el primer retoque.
 */
export default function CuatroCapas({
  pieza, Escena, Exploracion, rotulo = "SALA DE MÁQUINAS · APRENDER",
  Capa2 = null, Capa4 = null,
}) {
  const [paso, setPaso] = useState(0);
  const [verRespuesta, setVerRespuesta] = useState(false);
  /* Un término por pantalla desde dos términos; `capa1EnLista` lo apaga (ver arriba). */
  const paginada = pieza.nombres.length > 1 && !pieza.capa1EnLista;
  const capa1 = useRef(null);
  const capa2 = useRef(null);
  const rotuloCapa2 = useRef(null);
  const actual = pieza.pasos?.[paso] ?? null;
  const boton = (activo) => ({
    padding: "10px 16px", borderRadius: "999px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
    cursor: activo ? "pointer" : "default",
    background: "transparent", border: `1px solid ${activo ? "rgba(248,249,250,0.3)" : "rgba(248,249,250,0.1)"}`,
    color: activo ? FAE.text : "rgba(248,249,250,0.35)",
  });

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      {/* El objetivo va ANTES de la capa 1: se sabe qué se va a aprender antes de empezar. */}
      {pieza.objetivo && (
        <p data-objetivo style={{
          margin: "0 0 18px", padding: "11px 13px", borderRadius: "12px",
          fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.88)",
          background: "rgba(42,157,143,0.08)", borderLeft: `3px solid ${FAE.teal}`,
        }}>
          {pieza.objetivo}
        </p>
      )}
      <Capa numero={1} nombre="Primero, los nombres" refSeccion={paginada ? capa1 : undefined}>
        {paginada
          ? <CapaUnoPaginada nombres={pieza.nombres} capa={capa1} capa2={capa2} rotuloCapa2={rotuloCapa2} />
          : <CapaUnoEnLista nombres={pieza.nombres} />}
      </Capa>

      <Capa numero={2} nombre="Mírelo funcionar" refSeccion={paginada ? capa2 : undefined} refRotulo={paginada ? rotuloCapa2 : undefined}>
        {Capa2 ? <Capa2 /> : (
          <>
            <div style={{ borderRadius: "14px", background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.1)", padding: "10px" }}>
              <Escena resaltar={actual.resaltar} />
            </div>
            <p style={{ margin: "12px 0 6px", fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 600, color: "rgba(248,249,250,0.55)" }}>
              Paso {paso + 1} de {pieza.pasos.length}
            </p>
            <p data-texto-paso aria-live="polite" style={{ margin: 0, fontSize: "15px", lineHeight: 1.6, color: FAE.text }}>{actual.texto}</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button type="button" disabled={paso === 0} onClick={() => setPaso((p) => Math.max(0, p - 1))} style={boton(paso > 0)}>Anterior</button>
              <button type="button" disabled={paso === pieza.pasos.length - 1} onClick={() => setPaso((p) => Math.min(pieza.pasos.length - 1, p + 1))} style={boton(paso < pieza.pasos.length - 1)}>Siguiente</button>
            </div>
          </>
        )}
      </Capa>

      <Capa numero={3} nombre="Ahora pruebe usted">
        <Exploracion />
      </Capa>

      <Capa numero={4} nombre="En una frase">
        {Capa4 ? <Capa4 /> : (<>
        <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700, lineHeight: 1.45, color: FAE.text }}>{pieza.pregunta}</p>
        {!verRespuesta ? (
          <button type="button" onClick={() => setVerRespuesta(true)} style={{ ...boton(true), marginTop: "12px" }}>
            Ver la respuesta de referencia
          </button>
        ) : (
          <p data-respuesta style={{ margin: "12px 0 0", padding: "12px 14px", borderRadius: "12px", fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.85)", background: "rgba(42,157,143,0.08)", borderLeft: `3px solid ${FAE.teal}` }}>
            {pieza.respuesta}
          </p>
        )}
        </>)}
      </Capa>
    </Panel>
  );
}
