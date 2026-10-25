/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · LOS SLIDES DE APRENDER — lo común a A0-A5 (Célula D).
 *
 * T4 Aprender va sobre SecuenciaAprender (src/components/secuencia/, de
 * Erwin), que no se toca. Aquí está lo que T4 le pasa: la figura de cada
 * pantalla, con su modelo y su banda, según el diseño de Hanayama
 * (orquestador/revisiones/t4-slides/diseno-hanayama.md, §1 y §2).
 *
 *   · la figura es el modelo (alto fijo de 206 px, contenido arriba) y la
 *     banda debajo. Cada pieza declara `altoFigura` (la prop de Erwin, #537)
 *     con 206 a 320 y a 375: la reserva del modelo. Como la banda de T4 vive
 *     dentro del `<figure>` (la devolución cambia; el apoyo del contenedor
 *     es fijo), el `<figure>` mide `auto` desde `.t4-sec`: el modelo (206) y
 *     la banda (66 como mínimo). Decisión de Yujiro (24 oct): 206 sin rehacer
 *     los modelos
 *   · la banda tiene un solo dueño a la vez (§2.2): antes de responder, el
 *     texto de antes; tras responder, la devolución (pastilla con palabra y
 *     el texto de Katsumi); en el Cierre, la frase y el pie. Reserva desde el
 *     principio el alto del más largo de todos, así que nada se mueve (E2) y
 *     no hace falta ningún scrollIntoView
 *   · el veredicto va en el control tocado (§2.3): borde de 2 px (#F8F9FA o
 *     coral) y Check o X de lucide dentro; la palabra va en la pastilla de la
 *     banda y en el nombre del control. Sin LineaMarcas y sin «Iba aquí»
 *   · C2 (§2.5): primer error, la devolución y el control sigue activo;
 *     segundo error, la figura toma el estado correcto, la banda da el
 *     porqué y «Siguiente» se libera. `calificar` lo lleva por tarjeta
 *
 * Lo que la figura recuerda es JSON (se guarda en la pestaña). Carril de la
 * Célula D: nadie más lo usa.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useLayoutEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import { hazResuelto, mostrarCorrecto, responderHaz } from "../../secuencia/secuencia.js";
import { MARCA } from "../../../data/contabilidadT4.js";
import { marcarTerminada } from "../caso.js";
import { C } from "../comun.jsx";

/* §1: la reserva del modelo y el mínimo de la banda. */
export const ALTO_MODELO = 206;
export const ALTO_BANDA = 66;
/* La reserva que cada pieza declara al contenedor (`pieza.altoFigura`). */
export const ALTO_FIGURA_T4 = { a320: ALTO_MODELO, a375: ALTO_MODELO };

/*
 * La reserva del contenedor sube desde fuera, sin tocar SecuenciaAprender: la
 * clase `.t4-sec` envuelve el contenedor en la vista. Con `auto`, el
 * `<figure>` del contenedor mide lo que miden el modelo y la banda.
 */
export const CSS_SLIDES = `
.t4-sec .fae-sec-figura { height: auto; }
.t4s { display: grid; grid-template-rows: ${ALTO_MODELO}px auto; height: 100%; min-width: 0; color: ${C.texto}; font-family: "Inter", sans-serif; }
.t4s * { box-sizing: border-box; }
.t4s-modelo { position: relative; min-width: 0; display: grid; align-content: start; gap: 8px; }
.t4s-banda { display: grid; min-height: ${ALTO_BANDA}px; margin-top: 8px; }
.t4s-banda > * { grid-area: 1 / 1; min-width: 0; }
.t4s-capa { display: grid; align-content: start; gap: 2px; }
.t4s-capa[data-oculta] { visibility: hidden; }
.t4s-t { margin: 0; font: 400 14px/22px "Inter", sans-serif; color: rgba(248,249,250,0.8); overflow-wrap: anywhere; }
.t4s-t[data-fuerte] { color: ${C.texto}; }
.t4s-pie { margin: 0; font: 400 12px/16px "Inter", sans-serif; color: ${C.texto2}; overflow-wrap: anywhere; }
.t4s-sig { margin: 0; font: 400 12px/16px "Inter", sans-serif; color: ${C.texto2}; }
@media (max-width: 374px) { .t4s-sig { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; } }
.t4s-pastilla { display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 8px; margin-right: 6px; border-radius: 999px; border: 2px solid ${C.texto}; color: ${C.texto}; font: 600 13px/18px "Inter", sans-serif; vertical-align: top; }
.t4s-pastilla[data-ver="mal"] { border-color: ${C.error}; }
.t4s-ctl { position: relative; appearance: none; min-height: 44px; min-width: 0; border-radius: 8px; border: 1px solid ${C.reposo}; background: transparent; color: ${C.texto}; font: 600 14px/18px "Inter", sans-serif; cursor: pointer; padding: 2px 6px; }
.t4s-ctl[data-ver] { border-width: 2px; border-color: ${C.texto}; padding: 1px 5px; }
.t4s-ctl[data-ver="mal"] { border-color: ${C.error}; }
.t4s-ctl[aria-disabled="true"] { cursor: default; }
.t4s-ctl:focus-visible { outline: 2px solid ${C.texto}; outline-offset: 2px; }
/* El ícono va en la esquina, como insignia sobre el borde: nunca pisa la palabra del control (A5: «ninguno» en 82 px). */
.t4s-ico { position: absolute; top: -8px; right: -8px; display: block; padding: 1px; border-radius: 999px; background: ${C.fondo}; box-sizing: content-box; pointer-events: none; z-index: 4; }
.t4s-nueva { animation: t4s-aparece 120ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes t4s-aparece { from { opacity: 0; } to { opacity: 1; } }
.t4s-opc { display: grid; gap: 6px; }
.t4s-opc > .t4s-ctl { min-height: 48px; display: grid; place-items: center; text-align: center; text-wrap: balance; white-space: normal; }
.t4s-opc[data-cifra] > .t4s-ctl { font: 600 13px/18px "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
.t4s-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
@media (prefers-reduced-motion: reduce) { .t4s *, .t4s *::before, .t4s *::after { transition: none !important; animation: none !important; } }
`;

/* El ícono del veredicto dentro del control: lucide, 16 px, trazo 2,5. */
export function IconoVer({ ver }) {
  if (!ver) return null;
  const Ico = ver === "bien" ? Check : X;
  return <Ico className="t4s-ico t4s-nueva" size={16} strokeWidth={2.5} color={ver === "bien" ? C.texto : C.error} aria-hidden="true" data-icono={ver === "bien" ? "check" : "x"} />;
}

/* El nombre accesible de un control con veredicto: el suyo y la palabra. */
export const conPalabra = (nombre, ver) => (ver ? `${nombre}: ${MARCA[ver]}` : nombre);

/*
 * Un control calificable: un botón con su veredicto dentro. `apagado` lo deja
 * quieto pero en el orden de tabulación (aria-disabled), como el contenedor.
 */
export function Control({ ver = null, apagado = false, onClick, nombre, children, className = "", ...resto }) {
  return (
    <button
      type="button"
      className={`t4s-ctl ${className}`.trim()}
      data-ver={ver ?? undefined}
      aria-disabled={apagado ? "true" : undefined}
      aria-label={nombre ? conPalabra(nombre, ver) : undefined}
      onClick={apagado ? undefined : onClick}
      {...resto}
    >
      {children}
      <IconoVer ver={ver} />
    </button>
  );
}

/*
 * ═══════════ C2, TARJETA POR TARJETA ═══════════
 *
 * estado = { it: { [tarjeta]: { intentos, ok, ultimo, eleccion } }, foco }
 * `foco` es la última tarjeta tocada: de ella sale la devolución. Una tarjeta
 * con dos errores queda resuelta y pasa sola a su lugar (lote 4 de Katsumi).
 */
export const HAZ_VACIO = { it: {}, foco: null };

export function calificar(estado, tarjeta, eleccion, correcta) {
  const e = estado ?? HAZ_VACIO;
  const antes = e.it[tarjeta];
  if (hazResuelto(antes)) return e;
  const nuevo = { ...responderHaz(antes, eleccion === correcta), eleccion };
  return { it: { ...e.it, [tarjeta]: nuevo }, foco: tarjeta };
}

export const tarjeta = (estado, id) => estado?.it?.[id] ?? null;
export const resueltaTarjeta = (estado, id) => hazResuelto(tarjeta(estado, id));
export const todasResueltas = (estado, ids) => ids.every((id) => resueltaTarjeta(estado, id));
export const correctoTarjeta = (estado, id) => mostrarCorrecto(tarjeta(estado, id));

/*
 * El veredicto que lleva una opción de la tarjeta: la elegida, con su marca;
 * con dos errores, la correcta toma el estado correcto (borde #F8F9FA y
 * Check) y la elegida deja de marcarse. Nada delata la correcta antes.
 */
export function verDe(estado, id, opcion, correcta) {
  const t = tarjeta(estado, id);
  if (!t) return null;
  if (mostrarCorrecto(t)) return opcion === correcta ? "bien" : null;
  if (t.eleccion !== opcion) return null;
  return t.ok ? "bien" : "mal";
}

/* Lo que la tarjeta deja en el modelo: la elección si acertó, la correcta si se resolvió con dos errores. */
export function colocada(estado, id, correcta) {
  const t = tarjeta(estado, id);
  if (!t) return null;
  if (t.ok) return t.eleccion;
  return mostrarCorrecto(t) ? correcta : null;
}

/*
 * ═══════════ LA BANDA ═══════════
 *
 *   antes       textos que se ven antes de responder (y en el Cierre)
 *   dev         la devolución en curso: { ver: "bien" | "mal", textos: [] } o null
 *   posibles    todas las devoluciones que la pantalla puede dar: reservan
 *               su alto desde el principio, invisibles (aria-hidden)
 *   pie         en el Cierre, la última línea («Basado en el libro, pp. …»)
 *   siguiente   en el Cierre, «Siguiente: «X».»: a 320 solo para el lector
 */
function Capa({ textos = [], ver = null, pie = null, siguiente = null, oculta = false, ...datos }) {
  const pastilla = ver ? (
    <span className="t4s-pastilla" data-ver={ver} data-palabra>
      {ver === "bien" ? <Check size={14} strokeWidth={2.5} aria-hidden="true" /> : <X size={14} strokeWidth={2.5} color={C.error} aria-hidden="true" />}
      {MARCA[ver]}
    </span>
  ) : null;
  const lineas = textos.length ? textos : ver ? [""] : [];
  return (
    <div className="t4s-capa" data-oculta={oculta ? "" : undefined} aria-hidden={oculta ? "true" : undefined} {...datos}>
      {lineas.map((t, k) => (
        <p key={k} className="t4s-t" data-fuerte={ver ? "" : undefined} data-texto={t ? "" : undefined}>
          {k === 0 && pastilla}
          {t}
        </p>
      ))}
      {siguiente && <p className="t4s-sig" data-sig-pieza>{siguiente}</p>}
      {pie && <p className="t4s-pie" data-pie>{pie}</p>}
    </div>
  );
}

/*
 * E2 a 320 (auditoría de Shibukawa, #488): la navegación del contenedor queda
 * fija abajo y tapaba la banda. Al montar la pantalla y cada vez que cambia
 * la devolución, la página baja lo justo para que la banda quede entera
 * encima de la navegación: d = banda.bottom − (innerHeight − alto de la
 * navegación). Sin animar: es un ajuste de sitio, no un movimiento.
 */
export function useBandaALaVista(clave) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const banda = ref.current;
    const V = banda?.ownerDocument?.defaultView;
    if (!banda || !V?.scrollBy) return undefined;
    const ajustar = () => {
      const nav = banda.closest("[data-secuencia]")?.querySelector("[data-navegacion]");
      const d = banda.getBoundingClientRect().bottom - (V.innerHeight - (nav?.getBoundingClientRect().height ?? 0));
      if (d > 0.5) V.scrollBy({ top: Math.ceil(d), behavior: "instant" });
    };
    ajustar();
    /*
     * La navegación pasa a fija un cuadro después (la calcula el contenedor) y
     * la pantalla puede crecer al llegar (fuentes, la manija de A1): mientras
     * dure esta devolución, cada cambio de tamaño de la pantalla se vuelve a
     * mirar. Desplazarse a mano no lo dispara.
     */
    const cuadro = V.requestAnimationFrame?.(ajustar);
    const raiz = banda.closest("[data-secuencia]");
    const ro = V.ResizeObserver && raiz ? new V.ResizeObserver(() => ajustar()) : null;
    ro?.observe(raiz);
    /*
     * Al cambiar de pieza el contenedor sube la página hasta su zona con un
     * desplazamiento suave (después de este ajuste): cuando ese desplazamiento
     * acaba, se vuelve a mirar. Solo el primer segundo, para no pelear con
     * quien se desplaza a mano.
     */
    V.addEventListener?.("scrollend", ajustar);
    const tarde = V.setTimeout(ajustar, 700);
    const reloj = V.setTimeout(() => V.removeEventListener?.("scrollend", ajustar), 1000);
    return () => {
      V.cancelAnimationFrame?.(cuadro); ro?.disconnect();
      V.clearTimeout(tarde); V.clearTimeout(reloj); V.removeEventListener?.("scrollend", ajustar);
    };
  }, [clave]);
  return ref;
}

const claveDev = (dev) => (dev ? `${dev.ver}:${dev.textos.join("|")}:${dev.n ?? 0}` : "antes");

export function Banda({ antes = [], dev = null, posibles = [], pie = null, siguiente = null }) {
  const ref = useBandaALaVista(claveDev(dev));
  return (
    <div ref={ref} className="t4s-banda" data-banda data-dueno={dev ? "devolucion" : "antes"}>
      {/* Las reservas: lo más alto que la banda va a tener, sin que nada se vea. */}
      <Capa textos={antes} pie={pie} siguiente={siguiente} oculta />
      {posibles.map((d, k) => <Capa key={k} textos={d.textos} ver={d.ver} oculta />)}
      <div aria-live="polite" data-capa-viva>
        {dev ? (
          <Capa key={claveDev(dev)} textos={dev.textos} ver={dev.ver} className="t4s-capa t4s-nueva" data-mensaje={dev.ver === "bien" ? "acierto" : "error"} />
        ) : (
          <Capa textos={antes} pie={pie} siguiente={siguiente} data-antes />
        )}
      </div>
    </div>
  );
}

/* La figura de una pantalla de T4: el modelo de 206 y la banda. */
export function Slide({ banda, children, ...datos }) {
  return (
    <div className="t4s" {...datos}>
      <div className="t4s-modelo" data-modelo>{children}</div>
      {banda}
    </div>
  );
}

/* Opciones de palabras o de cifras (Chips de §2.7), con el veredicto dentro de cada una. */
export function Opciones({ opciones, ver, onElegir, apagadas = false, etiqueta, cifra = false, columnas = opciones.length }) {
  return (
    <div className="t4s-opc" role="group" aria-label={etiqueta} data-cifra={cifra ? "" : undefined}
      style={{ gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))` }}>
      {opciones.map((o) => (
        <Control key={o.id} data-opcion={o.id} ver={ver(o.id)} apagado={apagadas} nombre={o.texto} onClick={() => onElegir(o.id)}>
          <span>{o.texto}</span>
        </Control>
      ))}
    </div>
  );
}

/* El Cierre de una pieza la da por terminada (D8: la próxima vez, sorteo del caso). */
export function useTerminada(piezaId) {
  useEffect(() => { marcarTerminada(piezaId); }, [piezaId]);
}

/*
 * La razón visible de por qué «Siguiente» espera en un Haz (D11). Texto de
 * interfaz común, sin contenido del libro; el literal es de Katsumi (auditoría del #488).
 */
export const RAZON_HAZ = "Decide para seguir.";
