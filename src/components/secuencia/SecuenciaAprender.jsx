import { useEffect, useId, useRef, useState } from "react";
import { FAE } from "../../theme.js";
import { Panel } from "../mecanicas/salaDeControl/marco.jsx";
import { Pulsos } from "../mecanicas/corazon/juego.jsx";
import {
  FASES, LITERAL, estadoInicial, guardadoValido, pantallaActual, pasosDados, pasosTotales,
  queHaceSiguiente, literalSiguiente, avanzar, puedeRetroceder, retroceder, cambiarFigura,
  claveDe, mostrarCorrecto,
} from "./secuencia.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * SECUENCIA APRENDER — un Aprender como fila de pantallas, una a la vez.
 *
 * El contenedor compartido de aprender-secuencia-v1.md (Ukyo). Lo usan las
 * cuatro células para sus temas; ninguna lo copia. Las reglas viven en
 * secuencia.js; aquí solo se pintan.
 *
 * ═══════════ NO TOCA CuatroCapas ═══════════
 *
 * CuatroCapas lo usan nueve vistas, Política Monetaria entre ellas
 * (Macroeconomía, con estudiantes reales). Este componente es nuevo y aparte
 * (parada 1 de la especificación). Lo que reutiliza de allí —el botón de
 * navegación, el punto de progreso, el bloque pegado por script, el foco con
 * reintento— está escrito de nuevo aquí con los mismos valores, y una prueba
 * compara los del botón contra CuatroCapas para que no se separen en silencio.
 *
 * ═══════════ USO ═══════════
 *
 *   <SecuenciaAprender
 *     temaId="introduccion-contabilidad"     clave de lo guardado en la pestaña
 *     piezas={[pieza, …]}                    la forma, en secuencia.js
 *     final="hacer" | "tema"                 qué hace el último cierre (§5.3)
 *     onFinal={() => …}                      la vista decide adónde lleva
 *   />
 *
 * ⛔ «Ir a Hacer» toca el camino y la tarjeta del tema, que son compartidos:
 * aquí solo se pinta el botón y se llama onFinal; adónde lleva lo decide la
 * vista de cada tema.
 *
 * Lo guardado es posición de interfaz (pieza, pantalla, pasos, lo operado),
 * en sessionStorage: no es dato de estudiantes y no sale del dispositivo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Colores con rol (§4). La barra de progreso en Contabilidad es FAE.node, nunca teal. */
const SECUNDARIO = "#A8B6C8";
const NEUTRO = "#B8C4D4";
const QUIETO = "#8C9BB0";
const CURVA = "cubic-bezier(.3,.9,.4,1)";

/* Los botones del bloque pegado: los mismos valores que BOTON_NAV de CuatroCapas (la prueba los compara). */
export const BOTON_NAV = {
  flex: "1 1 0", minWidth: 0, height: "44px", borderRadius: "999px", fontFamily: "Sora, sans-serif", fontSize: "14px",
  fontWeight: 600, cursor: "pointer", boxSizing: "border-box",
};
const NAV_DESACTIVADO = { background: "transparent", border: `2px solid ${QUIETO}`, color: SECUNDARIO, cursor: "default" };
const NAV_ANTERIOR = { background: "transparent", border: `2px solid ${NEUTRO}`, color: "#FFFFFF" };
const NAV_SIGUIENTE = { background: NEUTRO, border: `2px solid ${NEUTRO}`, color: FAE.navy };

/* La clase que una figura pone a lo que revela un paso: un grupo, 240 ms, opacidad + 8 px (§8.2). */
export const CLASE_PASO = "fae-sec-paso";

/*
 * El movimiento (§8). Una sola curva. Solo transform y opacity. Nada en bucle.
 * Tres grupos al avanzar (0 · 80 · 160 ms, 280 ms, 16 · 24 · 12 px desde la
 * derecha); al retroceder entran juntos en 200 ms desde la izquierda. La
 * salida es una opacidad de 120 ms sin desplazamiento. Con movimiento reducido
 * todo es instantáneo.
 */
const ESTILOS = `
.fae-sec-zona { overflow-x: clip; }
@keyframes fae-sec-entra { from { opacity: 0; transform: translateX(var(--fae-sec-dx, 0)); } to { opacity: 1; transform: none; } }
@keyframes fae-sec-sale { from { opacity: 1; } to { opacity: 0; } }
@keyframes fae-sec-pulso { 0% { transform: scale(1); } 50% { transform: scale(1.03); } 100% { transform: scale(1); } }
@keyframes fae-sec-paso-entra { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.fae-sec-g { animation: fae-sec-entra 280ms ${CURVA} both; }
.fae-sec-g1 { --fae-sec-dx: 16px; animation-delay: 0ms; }
.fae-sec-g2 { --fae-sec-dx: 24px; animation-delay: 80ms; }
.fae-sec-g3 { --fae-sec-dx: 12px; animation-delay: 160ms; }
.fae-sec--cierre .fae-sec-g3 { animation-delay: 400ms; }
.fae-sec--cierre .fae-sec-figura-viva { animation: fae-sec-pulso 400ms ${CURVA} 360ms both; }
.fae-sec--atras .fae-sec-g { animation-duration: 200ms; animation-delay: 0ms; }
.fae-sec--atras .fae-sec-g1 { --fae-sec-dx: -16px; }
.fae-sec--atras .fae-sec-g2 { --fae-sec-dx: -24px; }
.fae-sec--atras .fae-sec-g3 { --fae-sec-dx: -12px; }
.fae-sec--atras .fae-sec-figura-viva { animation: none; }
.fae-sec--animando .fae-sec-g { will-change: transform, opacity; }
.fae-sec--sale { animation: fae-sec-sale 120ms ${CURVA} both; }
.${CLASE_PASO} { animation: fae-sec-paso-entra 240ms ${CURVA} both; }
.fae-sec-nav { transition: transform 160ms ${CURVA}; }
.fae-sec-nav:active:not([aria-disabled="true"]) { transform: scale(.97); transition-duration: 100ms; }
.fae-sec-titular:focus-visible, .fae-sec-nav:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }
/*
 * min-height y no height (#549): el hueco reservado es el mismo en todas las
 * pantallas de la pieza (D5), pero si la figura de verdad mide más, empuja lo
 * de abajo en vez de taparlo. Antes se salía de su caja y tapaba «Siguiente».
 */
.fae-sec-figura { min-height: var(--fae-sec-alto-320, 150px); }
@media (min-width: 375px) and (min-height: 640px) { .fae-sec-figura { min-height: var(--fae-sec-alto-375, 200px); } }
@media (min-width: 760px) { .fae-sec-figura { min-height: 320px; } .fae-sec-raiz { max-width: 860px; margin: 0 auto; } }
@media (prefers-reduced-motion: reduce) {
  .fae-sec-g, .fae-sec--sale, .${CLASE_PASO}, .fae-sec--cierre .fae-sec-figura-viva { animation: none !important; }
  .fae-sec-nav { transition: none; }
}
`;

const conMovimientoReducido = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function"
  && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const VERSION_GUARDADO = 1;
const claveGuardado = (temaId) => `fae-secuencia:${temaId}`;

function leerGuardado(temaId, piezas) {
  try {
    const g = JSON.parse(sessionStorage.getItem(claveGuardado(temaId)));
    if (!g || g.v !== VERSION_GUARDADO) return null;
    const { v, ...estado } = g; // eslint-disable-line no-unused-vars
    return guardadoValido(estado, piezas) ? estado : null;
  } catch {
    return null;
  }
}

function guardar(temaId, estado) {
  try {
    sessionStorage.setItem(claveGuardado(temaId), JSON.stringify({ v: VERSION_GUARDADO, ...estado }));
  } catch {
    /* Sin almacenamiento, la secuencia funciona igual: solo no sobrevive a una recarga. */
  }
}

/*
 * Los Pulsos son los del kit, de corazon/juego.jsx, y no una copia: la prueba
 * de opcion-avance.test.mjs prohíbe que una pantalla lleve su propio avance,
 * para que el contador sea uno solo en todo el sitio (FAE.node, sin teal).
 */

/**
 * La pastilla de veredicto de un Haz calificado (§9): «Correcto» en blanco o
 * «No va aquí» en coral, nunca teal ni ámbar. Con dos errores enseña el porqué.
 * Lleva data-mensaje para la sonda de enganche (§11).
 */
export function Veredicto({ estado, pista, porque }) {
  if (!estado?.ultimo) return null;
  const acierto = estado.ultimo === "acierto";
  const color = acierto ? "#F8F9FA" : FAE.coral;
  return (
    <div data-mensaje={acierto ? "acierto" : "error"} role="status" style={{ marginTop: "8px" }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "999px",
        border: `2px solid ${color}`, color, fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600,
      }}>
        <span aria-hidden="true">{acierto ? "✓" : "✕"}</span>
        {acierto ? "Correcto" : "No va aquí"}
      </span>
      {!acierto && !mostrarCorrecto(estado) && pista && (
        <p style={{ margin: "6px 0 0", fontFamily: "Inter, sans-serif", fontSize: "14px", lineHeight: "22px", color: "rgba(248,249,250,0.8)" }}>{pista}</p>
      )}
      {mostrarCorrecto(estado) && porque && (
        <p style={{ margin: "6px 0 0", fontFamily: "Inter, sans-serif", fontSize: "14px", lineHeight: "22px", color: "rgba(248,249,250,0.8)" }}>{porque}</p>
      )}
    </div>
  );
}

/*
 * El alto reservado de la figura, por pieza (`pieza.altoFigura = { a320, a375 }`).
 * Es el mismo en todas las pantallas de la pieza (D5: la figura no cambia de
 * alto al avanzar). Sin decirlo, 150 y 200, los de la especificación v1. Con
 * tope: 206 a 320 y 253 a 375, que es lo que cabe con la banda de apoyo
 * debajo (medido por Hanayama en T4, #513). Pedir más no rompe: se recorta al
 * tope, y en desarrollo lo avisa la consola. «a375» es el alto A 375 px de ancho.
 */
export const TOPE_FIGURA = { a320: 206, a375: 253 };
export const ALTO_FIGURA = { a320: 150, a375: 200 };
export function altoFiguraDe(pieza) {
  const pedido = pieza?.altoFigura ?? {};
  const de = (k) => {
    const quiere = Math.max(0, Number(pedido[k]) || ALTO_FIGURA[k]);
    /* El recorte no es silencioso (pedido de Levi): en desarrollo se avisa por consola. */
    if (quiere > TOPE_FIGURA[k] && import.meta.env?.DEV) {
      console.warn(`[SecuenciaAprender] ${pieza?.id}: la figura pide ${quiere} px (${k}) y el tope es ${TOPE_FIGURA[k]}; se recorta.`);
    }
    return Math.min(quiere, TOPE_FIGURA[k]);
  };
  return { a320: de("a320"), a375: de("a375") };
}

export default function SecuenciaAprender({ temaId, piezas, final = "tema", onFinal }) {
  const id = useId();
  const [estado, setEstado] = useState(() => leerGuardado(temaId, piezas) ?? estadoInicial(piezas));
  const [direccion, setDireccion] = useState(null); // null al montar · "adelante" · "atras"
  const [saliendo, setSaliendo] = useState(false);
  const [animando, setAnimando] = useState(false);
  const [anuncio, setAnuncio] = useState("");
  const [primeras, setPrimeras] = useState(() => new Set());
  const titular = useRef(null);
  const figuraViva = useRef(null);
  const zona = useRef(null);
  const bloque = useRef(null);
  const cambio = useRef(false);
  const pendiente = useRef(null);
  const reloj = useRef(null);

  useEffect(() => { guardar(temaId, estado); }, [temaId, estado]);

  const pieza = piezas[estado.p];
  const pantalla = pantallaActual(estado, piezas);
  const clave = claveDe(pieza, pantalla);
  const total = pieza.pantallas.length;
  const dados = pasosDados(estado, piezas);
  const totalPasos = pasosTotales(pantalla);
  const accion = queHaceSiguiente(estado, piezas);
  const espera = accion === "espera";


  /* La apertura arma su figura UNA vez al llegar (§8.3): la figura recibe primeraVez. */
  const primeraVez = !primeras.has(clave) && direccion !== "atras";
  useEffect(() => {
    if (primeraVez) setPrimeras((p) => new Set(p).add(clave));
  }, [clave]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Cambiar de pantalla: la anterior sale en 120 ms y la nueva entra escalonada. Un toque durante la transición la completa. */
  const irA = (nuevo, dir) => {
    clearTimeout(reloj.current);
    const aplicar = () => {
      pendiente.current = null;
      setSaliendo(false);
      setDireccion(dir);
      cambio.current = true;
      setEstado(nuevo);
      setAnimando(true);
      clearTimeout(reloj.current);
      reloj.current = setTimeout(() => setAnimando(false), 600);
    };
    if (conMovimientoReducido() || saliendo) return aplicar();
    pendiente.current = aplicar;
    setSaliendo(true);
    reloj.current = setTimeout(aplicar, 120);
  };
  useEffect(() => () => clearTimeout(reloj.current), []);

  const siguiente = () => {
    if (pendiente.current) return pendiente.current();
    switch (accion) {
      case "paso": {
        const nuevo = avanzar(estado, piezas);
        setEstado(nuevo);
        const n = dados + 1;
        const rotulo = pantalla.rotulosPaso?.[n - 1];
        setAnuncio(`Paso ${n} de ${totalPasos}${rotulo ? `: ${rotulo}` : ""}`);
        return;
      }
      case "pantalla":
      case "pieza":
        return irA(avanzar(estado, piezas), "adelante");
      case "final":
        return onFinal?.();
      default:
        return; // "espera": apagado, con su razón visible
    }
  };

  const anterior = () => {
    /* Un toque durante la transición solo la completa: el estado de este cierre ya no es el actual. */
    if (pendiente.current) return pendiente.current();
    if (!puedeRetroceder(estado)) return;
    irA(retroceder(estado, piezas), "atras");
  };

  /* Después de cambiar de pantalla (no al montar): el foco al titular, con reintento si la hoja de movimiento reducido lo oculta. */
  useEffect(() => {
    if (!cambio.current) return;
    cambio.current = false;
    setAnuncio("");
    const t = titular.current;
    t?.focus({ preventScroll: true });
    if (t && document.activeElement !== t) {
      requestAnimationFrame(() => requestAnimationFrame(() => t.focus({ preventScroll: true })));
    }
    const z = zona.current;
    if (z && z.getBoundingClientRect().top < 0) {
      z.scrollIntoView?.({ block: "start", behavior: conMovimientoReducido() ? "auto" : "smooth" });
    }
  }, [estado.p, estado.s]);

  /* Las flechas avanzan y retroceden SOLO con el foco en el titular (§5.4): en un control de la figura son del control. */
  const alTeclear = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "ArrowRight") { e.preventDefault(); siguiente(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); anterior(); }
  };

  /*
   * El bloque pegado va con position: sticky y OCUPA SU SITIO en el flujo
   * (#558, cambio 5 de Mai). Antes iba fijo por script y tapaba los últimos 69
   * px del contenido. FondoMateria ya usa overflow-x: clip (no hidden), así que
   * sticky vuelve a pegar a la ventana.
   */

  const Figura = pantalla.Figura;
  const Mensaje = pantalla.Mensaje ?? null;
  const setFigura = (valor) => setEstado((e) => cambiarFigura(e, piezas, valor));
  /*
   * Si la figura mide más que su hueco, en desarrollo se avisa: ya no tapa
   * nada (empuja), pero la pantalla deja de caber y eso lo tiene que ver quien
   * la diseña, no descubrirlo el estudiante.
   */
  useEffect(() => {
    if (!import.meta.env?.DEV) return;
    const viva = figuraViva.current;
    const figura = viva?.parentElement;
    if (!viva || !figura || typeof getComputedStyle !== "function") return;
    const reserva = parseFloat(getComputedStyle(figura).minHeight) || 0;
    const mide = viva.scrollHeight;
    if (reserva && mide > reserva + 1) {
      console.warn(`[SecuenciaAprender] ${pieza.id} · pantalla ${estado.s + 1}: la figura mide ${mide} px y su hueco ${reserva}; empuja lo de abajo. Pide más altoFigura (tope 206/253) o mueve el mensaje a pantalla.Mensaje.`);
    }
  });

  const propsFigura = {
    estado: estado.estados[clave],
    setEstado: setFigura,
    paso: dados,
    primeraVez,
    reducido: conMovimientoReducido(),
  };
  const primeraPantalla = !puedeRetroceder(estado);
  const textoSiguiente = literalSiguiente(estado, piezas, final);
  /*
   * La razón. En un cierre, que nunca espera, la zona es la del pie de fuente
   * (§16 b del contrato): `pie`, o la `razon` del cierre (#536, Mello: antes
   * solo se pintaba esperando, así que el pie de los cierres no salía en
   * ninguna célula).
   */
  const razon = espera
    ? pantalla.razon
    : totalPasos > 0 && dados < totalPasos
      ? `Paso ${dados + 1} de ${totalPasos}`
      : pantalla.pie ?? (pantalla.tipo === "cierre" ? pantalla.razon ?? null : null);
  /* El apoyo puede ser uno por paso (#558, cambio 6 de Mai): una sola zona que cambia al dar el paso. */
  const apoyoDelPaso = Array.isArray(pantalla.apoyo) ? pantalla.apoyo[Math.min(dados, pantalla.apoyo.length - 1)] : pantalla.apoyo;
  /*
   * LA BANDA BAJO LA FIGURA TIENE UN SOLO DUEÑO A LA VEZ (#536, Watari; la
   * cuenta de Hanayama en #513 §1-§2): el apoyo antes de responder y la
   * devolución después. Una pantalla que declara `devolucion(estado)` recibe
   * aquí, en el sitio del apoyo y fuera de la figura, la línea de consecuencia
   * y el Veredicto pintado por la cáscara. Así la figura mide solo su modelo y
   * sus controles, y `altoFigura` no tiene que sumar la devolución.
   */
  const devolucion = typeof pantalla.devolucion === "function" && propsFigura.estado?.ultimo
    ? pantalla.devolucion(propsFigura.estado) ?? null
    : null;
  const apoyo = devolucion ? null : apoyoDelPaso;
  /* Lo que bloquea (un Haz, o una apertura que predice) reserva 48 px de razón: la pista de 20 palabras son 3 renglones a 320 (#558). */
  const reservaRazon = pantalla.tipo === "haz" || typeof pantalla.resuelta === "function" ? "48px" : "16px";
  /* El alto de la figura: el de la pantalla si lo declara, si no el de la pieza. Mismo tope. */
  const alto = altoFiguraDe(pantalla.altoFigura ? { id: `${pieza.id}/${pantalla.id}`, altoFigura: pantalla.altoFigura } : pieza);

  const clases = [
    "fae-sec-pantalla",
    direccion === "atras" ? "fae-sec--atras" : "",
    pantalla.tipo === "cierre" && direccion === "adelante" ? "fae-sec--cierre" : "",
    animando ? "fae-sec--animando" : "",
    saliendo ? "fae-sec--sale" : "",
  ].filter(Boolean).join(" ");
  /* Al montar no hay escalonado: la pantalla ya estaba ahí. */
  const g = (n) => (direccion ? `fae-sec-g fae-sec-g${n}` : undefined);

  return (
    <Panel style={{ position: "relative" }}>
      <div
        className="fae-sec-raiz"
        data-secuencia={temaId}
        data-pieza={pieza.id}
        ref={zona}
        style={{ "--fae-sec-alto-320": `${alto.a320}px`, "--fae-sec-alto-375": `${alto.a375}px` }}
      >
        <style>{ESTILOS}</style>

        {/*
          Una sola fila: los Pulsos (o, si la pieza los omite, el contador solo
          para el lector) y «Pieza k de N» a la derecha (#558, Mai §1.2: ahorra
          el renglón de 20 px que llevaba aparte).
        */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "28px" }}>
          <div id={`${id}-contador`} data-contador style={{ display: "flex", alignItems: "center", flex: "1 1 auto", minWidth: 0 }}>
            {pieza.sinPulsos ? (
              <span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
                Pantalla {estado.s + 1} de {total}
              </span>
            ) : (
              <Pulsos total={total} hechos={estado.s} enCurso={estado.s + 1} etiqueta="Pantalla" />
            )}
          </div>
          {piezas.length > 1 && (
            <p data-contador-pieza style={{ margin: 0, flex: "0 0 auto", fontFamily: "Inter, sans-serif", fontSize: "12px", lineHeight: "16px", color: SECUNDARIO, whiteSpace: "nowrap" }}>
              Pieza {estado.p + 1} de {piezas.length}
            </p>
          )}
        </div>

        <div className="fae-sec-zona">
          <div
            key={clave}
            className={clases}
            role="group"
            aria-roledescription="pantalla"
            aria-label={`Pantalla ${estado.s + 1} de ${total}: ${pantalla.titular}`}
            data-pantalla={estado.s + 1}
            data-tipo={pantalla.tipo}
          >
            <div className={g(1)}>
              <p data-cejilla style={{ margin: "4px 0 0", fontFamily: "Inter, sans-serif", fontSize: "12px", lineHeight: "16px", color: SECUNDARIO }}>
                {pantalla.fase ?? FASES[pantalla.tipo]}
              </p>
              <h2
                ref={titular}
                tabIndex={-1}
                onKeyDown={alTeclear}
                className="fae-sec-titular"
                style={{ margin: "4px 0 0", fontFamily: "Sora, sans-serif", fontSize: "17px", fontWeight: 700, lineHeight: "22px", color: "#F8F9FA", letterSpacing: "-0.01em" }}
              >
                {pantalla.titular}
              </h2>
            </div>

            <figure
              className={`fae-sec-figura ${g(2) ?? ""}`}
              aria-label={pantalla.nombreFigura}
              style={{ margin: "12px 0 0", position: "relative" }}
            >
              <div ref={figuraViva} className="fae-sec-figura-viva" style={{ width: "100%", height: "100%" }}>
                <Figura {...propsFigura} />
              </div>
            </figure>

            {/*
              LA ZONA DE MENSAJE (#549), fuera de la figura: el veredicto, la
              pista y la consecuencia de un Haz. Crece con lo que diga sin mover
              el hueco de la figura, que es el que fija D5. Opcional: la pantalla
              que no la necesita no la declara.
            */}
            {Mensaje && (
              <div data-mensaje-zona style={{ marginTop: "8px" }}>
                <Mensaje {...propsFigura} />
              </div>
            )}

            <div className={g(3)}>
              {devolucion && (
                <div data-devolucion style={{ margin: "12px 0 0" }}>
                  {devolucion.consecuencia && (
                    <p data-consecuencia style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: "14px", lineHeight: "22px", color: "#F8F9FA" }}>
                      {devolucion.consecuencia}
                    </p>
                  )}
                  <Veredicto estado={propsFigura.estado} pista={devolucion.pista} porque={devolucion.porque} />
                </div>
              )}
              {apoyo && (
                <p data-apoyo style={{ margin: "12px 0 0", fontFamily: "Inter, sans-serif", fontSize: "14px", lineHeight: "22px", color: "rgba(248,249,250,0.8)" }}>
                  {apoyo}
                </p>
              )}
              <p id={`${id}-razon`} data-razon style={{ margin: "8px 0 0", minHeight: reservaRazon, fontFamily: "Inter, sans-serif", fontSize: "12px", lineHeight: "16px", color: SECUNDARIO }}>
                {razon ?? ""}
              </p>
            </div>
          </div>
        </div>

        {/* Los pasos se anuncian; el cambio de pantalla no (el foco en el titular ya lo dice). */}
        <p aria-live="polite" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", margin: 0 }}>
          {anuncio}
        </p>

        <div
          ref={bloque}
          data-navegacion
          style={{
            display: "flex", gap: "12px", padding: "12px 0",
            position: "sticky", bottom: 0, zIndex: 20,
            background: "linear-gradient(180deg, rgba(14,27,46,0), #0E1B2E 30%)",
          }}
        >
          <button
            type="button"
            className="fae-sec-nav"
            data-anterior
            aria-disabled={primeraPantalla ? "true" : undefined}
            aria-describedby={primeraPantalla ? `${id}-contador` : undefined}
            onClick={anterior}
            /* «Anterior» toma su ancho (mín. 96); el de avance, el resto (#558, cambio 9). BOTON_NAV no se toca. */
            style={{ ...BOTON_NAV, flex: "0 0 auto", minWidth: "96px", padding: "0 16px", ...(primeraPantalla ? NAV_DESACTIVADO : NAV_ANTERIOR) }}
          >
            {LITERAL.anterior}
          </button>
          <button
            type="button"
            className="fae-sec-nav"
            data-siguiente={accion}
            aria-disabled={espera ? "true" : undefined}
            aria-describedby={espera ? `${id}-razon` : undefined}
            onClick={siguiente}
            /* Sin partirse: «Siguiente pieza» medía 110,7 px en un botón de 124,5 y se partía. */
            style={{ ...BOTON_NAV, flex: "1 1 auto", whiteSpace: "nowrap", padding: "0 12px", ...(espera ? NAV_DESACTIVADO : NAV_SIGUIENTE) }}
          >
            {textoSiguiente}
          </button>
        </div>
      </div>
    </Panel>
  );
}

/* Para quien escriba una figura: el estado guardado tiene que ser JSON. */
export { LITERAL, FASES };
