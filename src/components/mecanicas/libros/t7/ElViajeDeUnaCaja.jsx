import { useEffect, useRef, useState } from "react";
import { Panel } from "../../salaDeControl/marco.jsx";
import { PIEZA_EL_VIAJE, ESTACIONES, INTERFAZ } from "../../../../data/contabilidadT7_1_a7_viaje.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A7 «El viaje de una caja» (Patrón de enganche C v6, pieza 2).
 *
 * El código de referencia de Watari (a7.js y a7.css de la v6), pasado a un
 * componente de la casa. Una línea vertical con tres estaciones por las que
 * pasa la mercancía (Recepción, Bodega y Salida) y dos que cuelgan de ella
 * con un trazo punteado (Contabilidad, de Recepción; Conteos, de Bodega). La
 * caja baja por la línea. En cada caso el estudiante la detiene tocando la
 * estación donde falla el control.
 *
 *   · p0   la línea espera atenuada; «Empezar»
 *   · p1   «Soltar la caja»: la caja baja una vez; al pasar por Recepción, la
 *          hoja del informe vuela a Contabilidad
 *   · p2-p4  los tres casos. La caja viaja sin parar. Un error en la línea: la
 *          caja va a la estación, tiembla y a los 700 ms sigue viajando; en una
 *          rama, la caja no se desvía. Escalera: 1.er error, el porqué de esa
 *          estación con borde coral y «No es aquí»; 2.º error, la estación
 *          correcta en borde neutro sólido y «Es en …», sin ✓. Al acertar, ✓ y
 *          la caja se queda en la estación (en el caso 3, en Bodega)
 *   · p5   el resumen. Sin botón: «Siguiente pieza» de la referencia no tiene
 *          a dónde ir, porque A7 es la última pieza de Aprender de T7-1
 *
 * A7-1 (Mello): en el caso 1 (p2) la hoja no vuela nunca, ni antes ni después
 * de acertar: la mercancía no llegó bien y no hay informe de recepción.
 *
 * Lo que cambia frente a la referencia, y por qué:
 *   · la marca «Pantalla n de 6» va a 12 px (la v6 la tenía a 10,5): letra
 *     mínima de la casa;
 *   · el foco va al mensaje al responder (regla de la casa); al pasar de
 *     pantalla, al texto, como en la referencia;
 *   · lo que mueve el motor (la caja, «pasando», la hoja, el temblor) va en
 *     atributos data-* que React no toca, para que un render no lo borre;
 *   · «Seguir» bloqueado con aria-disabled (como el resto de la célula), no
 *     con disabled;
 *   · sin fondo propio en la raíz: el del Panel.
 *
 * Movimiento reducido (o sin requestAnimationFrame): la caja no viaja y la
 * hoja no vuela. Al soltarla, la caja aparece al final; en los casos espera
 * arriba y salta a la estación tocada.
 *
 * Aprender: no califica, no da FP. Clases con el prefijo `t7vc-`. Colores:
 * los de la v6 (coral solo para el error; el acierto es ✓ con borde neutro;
 * sin teal ni ámbar, que aquí no hay Debe ni Haber).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const P = { fondo: "#0E1B2E", texto: "#F8F9FA", texto2: "#A8B6C8", neutro: "#B8C4D4", borde: "rgba(248,249,250,0.16)", coral: "#E76F51", carton: "#8A6F4E" };

const EN_LINEA = ESTACIONES.filter((e) => e.linea);

/* La pantalla del caso 1, donde la hoja del informe no vuela (A7-1). */
export const PANTALLA_SIN_HOJA = "p2";

/* Los números del viaje, los de la referencia: px por segundo, margen de la ruta arriba y abajo, espera tras un error, duración del frenado, cercanía para «pasando». */
export const VIAJE = { velocidad: 70, margen: 18, espera: 700, frenado: 260, cerca: 16 };

export const ESTADO_INICIAL = { soltada: false, resuelto: {}, errores: {}, intento: null, pista: false, msg: "", tipo: "" };

/* Tocar una estación en un caso: el mismo cambio de estado que el clic de la referencia. */
export function responder(s, pantalla, id) {
  if (!pantalla.caso || s.resuelto[pantalla.id]) return s;
  if (id === pantalla.caso.correcta) {
    return { ...s, resuelto: { ...s.resuelto, [pantalla.id]: true }, intento: null, pista: false, msg: pantalla.caso.bien, tipo: "bien" };
  }
  const n = (s.errores[pantalla.id] || 0) + 1;
  const base = { ...s, errores: { ...s.errores, [pantalla.id]: n }, intento: id };
  return n >= 2 ? { ...base, pista: true, msg: pantalla.caso.pista, tipo: "pista" } : { ...base, msg: pantalla.caso.mal[id], tipo: "mal" };
}

/* Al pasar de pantalla se limpia el mensaje y el intento; lo resuelto, los errores y «soltada» se quedan. */
export const alSeguir = (s) => ({ ...s, msg: "", tipo: "", intento: null, pista: false });

/* Cómo se ve una estación en una pantalla y un estado. */
export function vistaEstacion(pantalla, s, e) {
  const resuelto = Boolean(pantalla.caso && s.resuelto[pantalla.id]);
  const abierta = Boolean(pantalla.caso && !resuelto);
  const mal = abierta && s.intento === e.id;
  const pista = abierta && s.pista && e.id === pantalla.caso.correcta;
  const bien = Boolean(pantalla.caso && resuelto && e.id === pantalla.caso.correcta);
  return { abierta, mal, pista, bien, sello: bien ? INTERFAZ.bien : mal ? INTERFAZ.noEsAqui : "" };
}

export const puedeSeguir = (pantalla, s) => Boolean(pantalla.boton || (pantalla.accion && s.soltada) || (pantalla.caso && s.resuelto[pantalla.id]));

/* La hoja vuela cuando la caja cruza Recepción hacia abajo, con movimiento, y nunca en el caso 1 (A7-1). */
export const lanzaHoja = ({ antes, ahora, yRecepcion, pantallaId, reducido }) =>
  ahora >= yRecepcion && antes < yRecepcion && !reducido && pantallaId !== PANTALLA_SIN_HOJA;

/*
 * El motor del viaje: mueve la caja a mano, fuera de React, como la
 * referencia. Lee la posición de cada estación del DOM en cada cuadro.
 */
function crearMotor(ctx) {
  let anim = null;
  let espera = null;
  let y = 0;
  const q = (sel) => ctx.raiz()?.querySelector(sel) ?? null;
  const conRaf = () => typeof window !== "undefined" && typeof window.requestAnimationFrame === "function";
  const raf = (f) => window.requestAnimationFrame(f);
  const parar = () => { if (anim !== null && typeof window.cancelAnimationFrame === "function") window.cancelAnimationFrame(anim); anim = null; };
  const quieto = () => ctx.reducido() || !conRaf();
  const yDe = (id) => {
    const nodo = q(`[data-est="${id}"] .t7vc-nodo`);
    const ruta = q(".t7vc-ruta");
    if (!nodo || !ruta) return 0;
    const r = ruta.getBoundingClientRect();
    const b = nodo.getBoundingClientRect();
    return b.top - r.top + b.height / 2;
  };
  /* La caja espera y termina en los márgenes de la ruta, sin tapar ninguna estación. */
  const yIni = () => VIAJE.margen;
  const yFin = () => (q(".t7vc-ruta")?.getBoundingClientRect().height ?? 0) - VIAJE.margen;

  function ponerY(v) {
    const caja = q(".t7vc-caja");
    if (!caja) return;
    if (lanzaHoja({ antes: y, ahora: v, yRecepcion: yDe("recepcion"), pantallaId: ctx.pantallaId(), reducido: quieto() })) {
      const c = q('[data-est="contabilidad"]');
      c.removeAttribute("data-hoja");
      void c.offsetWidth;
      c.setAttribute("data-hoja", "");
    }
    y = v;
    caja.style.transform = `translateY(${v - 14}px)`;
    for (const e of EN_LINEA) {
      const b = q(`[data-est="${e.id}"]`);
      if (Math.abs(yDe(e.id) - v) < VIAJE.cerca) b.setAttribute("data-pasando", "");
      else b.removeAttribute("data-pasando");
    }
  }

  /* vueltas: 1 al soltar (baja una vez y se queda al final); 0 en los casos (sin parar). */
  function viajar(vueltas) {
    parar();
    if (quieto()) { ponerY(vueltas ? yFin() : yIni()); return; }
    let t0 = null;
    let hechas = 0;
    const paso = (t) => {
      if (!ctx.raiz()?.isConnected) return;
      if (t0 === null) t0 = t;
      const d = ((t - t0) / 1000) * VIAJE.velocidad;
      const total = yFin() - yIni();
      /*
       * «>=» y no «>» como la referencia: con «>», un cuadro que cae justo en d === total pone la caja arriba
       * (d % total = 0) y el siguiente la lleva al final, así que cruza Recepción otra vez y la hoja vuela dos
       * veces al soltar. Se ve con cuadros de 16 ms exactos (la prueba lo juega).
       */
      if (d >= total) {
        hechas += 1;
        if (vueltas && hechas >= vueltas) { ponerY(yFin()); anim = null; return; }
        t0 = t;
        y = yIni() - 1;
      }
      ponerY(yIni() + (total > 0 ? d % total : 0));
      anim = raf(paso);
    };
    anim = raf(paso);
  }

  function detenerEn(id, ok) {
    parar();
    const destino = yDe(id);
    const caja = q(".t7vc-caja");
    if (caja) {
      caja.removeAttribute("data-rebota");
      void caja.offsetWidth;
      if (!ok) caja.setAttribute("data-rebota", "");
    }
    if (quieto()) { ponerY(destino); return; }
    const desde = y;
    /* El reloj es el del primer cuadro (la referencia toma performance.now()): un cuadro de diferencia, y el mismo reloj que el viaje. */
    let t0 = null;
    const paso = (t) => {
      if (t0 === null) t0 = t;
      const k = Math.min(1, (t - t0) / VIAJE.frenado);
      ponerY(desde + (destino - desde) * (1 - Math.pow(1 - k, 3)));
      anim = k < 1 ? raf(paso) : null;
    };
    anim = raf(paso);
  }

  return {
    ponerY, viajar, detenerEn, yIni,
    /* Soltar o empezar un caso: la caja sale desde arriba. */
    salir(vueltas) { y = yIni() - 1; viajar(vueltas); },
    esperar(f) { clearTimeout(espera); espera = setTimeout(f, VIAJE.espera); },
    /* Al pasar de pantalla: sin temblor ni hoja, y sin la espera pendiente. */
    limpiar() {
      clearTimeout(espera);
      q(".t7vc-caja")?.removeAttribute("data-rebota");
      q('[data-est="contabilidad"]')?.removeAttribute("data-hoja");
    },
    apagar() { parar(); clearTimeout(espera); },
  };
}

export const CSS_A7_VIAJE = `
.t7vc { display: grid; gap: 12px; min-width: 0; color: ${P.texto}; font: 400 15px/1.5 "Inter", system-ui, sans-serif; }
.t7vc * { box-sizing: border-box; }
.t7vc-marca { margin: 0; font: 600 12px/1.3 "Sora", "Inter", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: ${P.texto2}; }
.t7vc-txt { margin: 0; font-size: 15px; line-height: 1.5; outline: none; overflow-wrap: anywhere; }
.t7vc-fig { display: grid; gap: 12px; min-width: 0; }
/* La ficha del pedido: lo que trae la caja en este caso. */
.t7vc-ficha { margin: 0; justify-self: start; display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border: 1px solid ${P.neutro}; border-radius: 999px; font: 600 13px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; }
.t7vc-ficha[hidden] { display: none; }
.t7vc-cajita { width: 16px; height: 13px; border-radius: 3px; background: ${P.carton}; box-shadow: inset 0 -2px 0 rgba(0,0,0,.25); flex: none; }
/* La ruta: una línea vertical con las tres estaciones por las que pasa la mercancía. La caja viaja por la columna de la izquierda.
 * Contabilidad y Conteos cuelgan de la línea con un trazo punteado: no son paradas de la caja. */
.t7vc-ruta { position: relative; display: grid; gap: 8px; padding: 36px 0 36px; transition: opacity .2s; }
.t7vc-dormida .t7vc-ruta { opacity: .55; }
.t7vc-linea { position: absolute; left: 21px; top: 8px; bottom: 8px; width: 2px; background: ${P.neutro}; opacity: .6; }
.t7vc-linea::before, .t7vc-linea::after { content: ""; position: absolute; left: -5px; width: 12px; height: 2px; background: ${P.neutro}; }
.t7vc-linea::before { top: 0; }
.t7vc-linea::after { bottom: 0; }
.t7vc-est { position: relative; z-index: 1; display: grid; grid-template-columns: 44px minmax(0, 1fr) auto; align-items: center; gap: 0 8px; min-height: 52px; padding: 6px 10px 6px 0;
  border: 1px solid ${P.borde}; border-radius: 12px; background: ${P.fondo}; color: ${P.texto}; text-align: left; font: inherit; cursor: default; transition: border-color .15s; appearance: none; }
.t7vc-est:disabled { opacity: 1; }
.t7vc-nodo { justify-self: center; width: 26px; height: 26px; border-radius: 50%; border: 2px solid ${P.neutro}; display: grid; place-items: center; font: 700 12px/1 "Sora", sans-serif; color: ${P.texto2}; background: ${P.fondo}; transition: background .15s, color .15s; }
.t7vc-etq { display: grid; gap: 1px; min-width: 0; }
.t7vc-etq b { font: 600 14px/1.3 "Sora", sans-serif; }
.t7vc-etq span { font-size: 13px; line-height: 1.35; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7vc-sello { font: 600 12px/1.2 "Inter", sans-serif; white-space: nowrap; }
.t7vc-sello:empty { display: none; }
.t7vc-est[data-pasando] { border-color: ${P.neutro}; }
.t7vc-est[data-pasando] .t7vc-nodo { background: ${P.neutro}; color: ${P.fondo}; }
/* Se puede tocar: borde punteado, como en la pieza 1. */
.t7vc-est.t7vc-blanco { border: 2px dashed ${P.neutro}; padding: 5px 9px 5px 0; cursor: pointer; grid-template-columns: 43px minmax(0, 1fr) auto; }
.t7vc-est.t7vc-blanco[data-pasando] { border-style: solid; }
.t7vc-est.t7vc-mal { border: 2px solid ${P.coral}; }
.t7vc-est.t7vc-mal .t7vc-sello { color: ${P.texto}; }
.t7vc-est.t7vc-bien { border: 2px solid ${P.neutro}; padding: 5px 9px 5px 0; grid-template-columns: 43px minmax(0, 1fr) auto; }
.t7vc-est.t7vc-bien .t7vc-sello { font-size: 18px; }
/* Segundo error: la estación correcta se marca en borde neutro sólido (escalera de ayuda). */
.t7vc-est.t7vc-blanco.t7vc-pista { border: 2px solid ${P.neutro}; background: #1A2A40; }
/* Las ramas: fuera de la línea, sangradas, unidas por un trazo punteado a la estación de la que cuelgan. */
.t7vc-est.t7vc-rama { margin-left: 52px; min-height: 48px; grid-template-columns: 30px minmax(0, 1fr) auto; overflow: visible; }
.t7vc-est.t7vc-rama.t7vc-blanco, .t7vc-est.t7vc-rama.t7vc-bien { grid-template-columns: 29px minmax(0, 1fr) auto; }
.t7vc-est.t7vc-rama::before { content: ""; position: absolute; left: -26px; top: -10px; width: 25px; height: calc(50% + 10px); border-left: 2px dashed ${P.neutro}; border-bottom: 2px dashed ${P.neutro}; border-bottom-left-radius: 8px; opacity: .8; }
/* En las ramas el sello va en su propia línea, debajo del texto: el texto no se aprieta. */
.t7vc-est.t7vc-rama .t7vc-sello { grid-column: 2 / -1; justify-self: start; margin-top: 2px; }
.t7vc-est.t7vc-rama.t7vc-bien .t7vc-sello { grid-column: 3; grid-row: 1; justify-self: end; margin-top: 0; }
.t7vc-est.t7vc-rama .t7vc-nodo { width: 22px; height: 22px; border: 0; background: transparent; color: ${P.neutro}; }
.t7vc-hoja { width: 15px; height: 19px; color: ${P.neutro}; }
.t7vc-ciclo { width: 18px; height: 18px; color: ${P.neutro}; }
.t7vc-est.t7vc-rama[data-hoja] .t7vc-hoja { animation: t7vc-hoja .7s ease-out both; }
@keyframes t7vc-hoja { from { transform: translate(-30px, -34px) rotate(-12deg); opacity: 0; } 30% { opacity: 1; } to { transform: none; opacity: 1; } }
.t7vc-cada { justify-self: start; margin-top: 3px; padding: 1px 8px; border: 1px solid ${P.neutro}; border-radius: 999px; font: 600 12px/1.4 "Inter", sans-serif; font-style: normal; color: ${P.texto}; }
/* La caja: cartón, el único color nuevo; no significa nada contable. */
.t7vc-caja { position: absolute; z-index: 2; left: 8px; top: 0; width: 28px; height: 28px; pointer-events: none; will-change: transform; }
.t7vc-caja i { display: block; width: 100%; height: 100%; border-radius: 5px; background: ${P.carton}; box-shadow: inset 0 -4px 0 rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.14), 0 2px 6px rgba(0,0,0,.35); position: relative; }
.t7vc-caja i::before { content: ""; position: absolute; left: 50%; top: 0; bottom: 4px; width: 5px; margin-left: -2.5px; background: rgba(0,0,0,.18); }
.t7vc-caja[data-rebota] i { animation: t7vc-rebota .4s ease-out; }
@keyframes t7vc-rebota { 0%, 100% { transform: none; } 25% { transform: translateX(-4px); } 60% { transform: translateX(4px); } }
.t7vc-acc:empty { display: none; }
.t7vc-boton, .t7vc-seguir { appearance: none; min-height: 44px; border-radius: 12px; font: 600 15px/1.2 "Inter", sans-serif; cursor: pointer; padding: 10px 14px; width: 100%; text-align: center; }
.t7vc-boton { background: transparent; color: ${P.texto}; border: 2px solid ${P.neutro}; }
.t7vc-msg { margin: 0; font-size: 14px; color: ${P.texto}; outline: none; overflow-wrap: anywhere; }
.t7vc-msg:empty { display: none; }
.t7vc-msg.t7vc-msg-mal { padding: 8px 12px; border-left: 3px solid ${P.coral}; background: rgba(231,111,81,.10); border-radius: 0 8px 8px 0; }
.t7vc-msg.t7vc-msg-bien { padding: 8px 12px; border: 2px solid ${P.neutro}; border-radius: 12px; }
.t7vc-msg.t7vc-msg-pista { padding: 8px 12px; border-left: 3px solid ${P.neutro}; background: rgba(184,196,212,.08); border-radius: 0 8px 8px 0; }
.t7vc-nav { display: flex; }
.t7vc-seguir { background: ${P.neutro}; color: #1D3557; border: 0; }
.t7vc-seguir[aria-disabled="true"] { background: transparent; color: ${P.texto2}; border: 2px solid rgba(184,196,212,.35); cursor: default; }
.t7vc-est:focus-visible, .t7vc-boton:focus-visible, .t7vc-seguir:focus-visible { outline: 2px solid ${P.texto}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .t7vc *, .t7vc *::before, .t7vc *::after { animation: none !important; transition: none !important; } }
`;

const Ciclo = () => (
  <svg className="t7vc-ciclo" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M16 10a6 6 0 1 1-1.8-4.3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M15.5 2.5v4h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Hoja = () => (
  <svg className="t7vc-hoja" viewBox="0 0 16 20" aria-hidden="true">
    <path d="M2 1.5h8l4 4v13H2z" fill="currentColor" />
    <path d="M10 1.5v4h4" fill="none" stroke={P.fondo} strokeWidth="1.2" />
    <path d="M4.5 9h7M4.5 12h7M4.5 15h5" stroke={P.fondo} strokeWidth="1.2" />
  </svg>
);

const reducidoAhora = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function ElViajeDeUnaCaja({ pieza = PIEZA_EL_VIAJE, rotulo }) {
  const pantallas = pieza.pantallas;
  const [k, setK] = useState(0);
  const [s, setS] = useState(ESTADO_INICIAL);
  /* Lo que el motor tiene que hacer después de pintar: { n, tipo, id? }. */
  const [orden, setOrden] = useState(null);
  const p = pantallas[k];
  const raiz = useRef(null);
  const txt = useRef(null);
  const msg = useRef(null);
  const actual = useRef({ p, s });
  actual.current = { p, s };
  const motor = useRef(null);
  if (!motor.current) motor.current = crearMotor({ raiz: () => raiz.current, pantallaId: () => actual.current.p.id, reducido: reducidoAhora });
  const primera = useRef(true);

  useEffect(() => () => motor.current.apagar(), []);

  /* Al llegar a una pantalla: en un caso la caja sale a viajar; si no, espera arriba. El foco va al texto, salvo al montar. */
  useEffect(() => {
    const m = motor.current;
    m.limpiar();
    if (p.caso) m.salir(0);
    else { m.apagar(); m.ponerY(m.yIni()); }
    if (primera.current) { primera.current = false; return; }
    txt.current?.focus({ preventScroll: true });
  }, [k]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Lo que mueve un toque, ya pintado. */
  useEffect(() => {
    if (!orden) return;
    const m = motor.current;
    if (orden.tipo === "soltar") { m.salir(1); return; }
    const E = ESTACIONES.find((x) => x.id === orden.id);
    const P0 = orden.pantalla;
    if (orden.tipo === "bien") {
      /* Fuera de la línea, la caja no va a la estación: se queda donde está la mercancía que se revisa. */
      if (E.linea) m.detenerEn(E.id, true);
      else if (P0.caso.aparcar) m.detenerEn(P0.caso.aparcar, true);
    } else if (E.linea) {
      m.detenerEn(E.id, false);
      m.esperar(() => { const a = actual.current; if (!a.s.resuelto[P0.id] && a.p === P0) m.viajar(0); });
    }
    msg.current?.focus({ preventScroll: true });
  }, [orden]);

  const soltar = () => {
    setS((x) => ({ ...x, soltada: true }));
    setOrden((o) => ({ n: (o?.n ?? 0) + 1, tipo: "soltar" }));
  };
  const tocar = (id) => {
    const nuevo = responder(s, p, id);
    if (nuevo === s) return;
    setS(nuevo);
    setOrden((o) => ({ n: (o?.n ?? 0) + 1, tipo: nuevo.tipo === "bien" ? "bien" : "mal", id, pantalla: p }));
  };
  const seguir = () => {
    if (!puedeSeguir(p, s)) return;
    setS(alSeguir);
    setK((x) => Math.min(pantallas.length - 1, x + 1));
  };

  const ultima = k === pantallas.length - 1;
  const resuelto = Boolean(p.caso && s.resuelto[p.id]);
  let n = 0;

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_A7_VIAJE}</style>
      <div ref={raiz} className={`t7vc${p.id === "p0" ? " t7vc-dormida" : ""}`} data-pieza={pieza.id} data-pantalla={p.id}>
        <p className="t7vc-marca" aria-hidden="true" data-marca>{INTERFAZ.marca(k + 1, pantallas.length)}</p>
        <p ref={txt} className="t7vc-txt" tabIndex={-1} data-texto>{p.texto}</p>
        <div className="t7vc-fig" data-figura>
          <p className="t7vc-ficha" hidden={!p.caso} data-ficha>
            <span className="t7vc-cajita" aria-hidden="true" />
            <span>{p.caso ? (resuelto && p.caso.fichaBien ? p.caso.fichaBien : p.caso.ficha) : ""}</span>
          </p>
          <div className="t7vc-ruta" role="group" aria-label={INTERFAZ.ruta}>
            <div className="t7vc-linea" aria-hidden="true" />
            <div className="t7vc-caja" aria-hidden="true"><i /></div>
            {ESTACIONES.map((e) => {
              const v = vistaEstacion(p, s, e);
              const clase = [e.linea ? "t7vc-en-linea" : "t7vc-rama", v.abierta && "t7vc-blanco", v.mal && "t7vc-mal", v.pista && "t7vc-pista", v.bien && "t7vc-bien"].filter(Boolean).join(" ");
              return (
                <button key={e.id} type="button" className={`t7vc-est ${clase}`} data-est={e.id} disabled={!v.abierta} onClick={() => tocar(e.id)}>
                  <span className="t7vc-nodo" aria-hidden="true">{e.linea ? ++n : e.hoja ? <Hoja /> : <Ciclo />}</span>
                  <span className="t7vc-etq"><b>{e.nombre}</b><span>{e.control}</span>{e.marca && <em className="t7vc-cada">{e.marca}</em>}</span>
                  <span className="t7vc-sello" aria-hidden="true" data-sello>{v.sello}</span>
                </button>
              );
            })}
          </div>
        </div>
        {p.accion === "soltar" && (
          <div className="t7vc-acc">
            <button type="button" className="t7vc-boton" data-boton="soltar" onClick={soltar}>{s.soltada ? INTERFAZ.soltarOtraVez : INTERFAZ.soltar}</button>
          </div>
        )}
        <p ref={msg} className={`t7vc-msg${s.msg ? ` t7vc-msg-${s.tipo}` : ""}`} role="status" tabIndex={-1} data-mensaje={s.msg ? s.tipo : undefined}>{s.msg}</p>
        {!ultima && (
          <div className="t7vc-nav">
            <button type="button" className="t7vc-seguir" data-boton={p.boton ? "empezar" : "seguir"} aria-disabled={puedeSeguir(p, s) ? undefined : "true"} onClick={seguir}>
              {p.boton || INTERFAZ.seguir}
            </button>
          </div>
        )}
      </div>
    </Panel>
  );
}
