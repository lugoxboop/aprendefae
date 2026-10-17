import { useEffect, useReducer, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { Panel } from "../../salaDeControl/marco.jsx";
import { Pastilla, Mensaje, RegionViva, CORRECTA, TACHADA, CSS_B5H, CLASE_B5H, LECTOR_INCORRECTO } from "../b5/Devolucion.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 APRENDER · EL MOTOR C3 DE LA CÉLULA (Patrón de enganche C3 de Watari,
 * 16-oct-2026, motor.js → aquí). Módulo de la Célula C, NO compartido: solo
 * lo montan A2, A5 y A6 de T7-1. Pastilla y bloque de mensaje, de
 * b5/Devolucion.jsx sin cambios.
 *
 * API · `<AprenderC3 pieza={…} rotulo="…" />`
 *   pieza = { id, titulo, clase, pantallas, figura(ctx) → JSX, fig?: {…} }
 *   pantalla = { id, tipo: "portada" | "lectura" | "eleccion" | "lados" | "resumen",
 *     texto, consigna, pregunta, opciones: [{ id, t, correcta?, devolucion }],
 *     pista, bien (o acierto), porque, porqueALaVista, antes(s), listo(s),
 *     enFigura, lineas: [{ id, cuenta, monto, lado, pista, devolucion, fantasma? }],
 *     lista, siguiente, pie, boton (null: sin botón) }
 *   ctx (lo recibe la figura) = { s, P, evento, reducido, fig(cambios), elegir(id),
 *     ubicar(lado), marca(idOpcion) → "mal" | "pista" | "bien" | null, interfaz,
 *     ordenar(lista, clave = P.id) → la lista en el orden barajado al montar }
 *   C3.AsientoT ({ ctx, titulo, lineas?, resueltas? }) · C3.Cruce ({ clave, fichas,
 *     rotulos? }) · C3.pesos(n) · CSS_C3 (prefijo c3-).
 *
 * M-1 de Mello (auditoria-mello-patron-c3.md §3): la pantalla separa
 * `consigna` de `texto`; la consigna se pinta solo mientras !P.antes(s), y la
 * pregunta con sus opciones solo cuando P.antes(s) (o si no hay `antes`).
 *
 * Escalera C2 (Aprender): 1.er error, borde coral + «No va aquí» + la pista;
 * 2.º, la devolución del distractor (su porqué) y la correcta en borde blanco
 * de 2 px. Nunca «Iba aquí». El foco va al mensaje; «Seguir» lleva
 * aria-disabled hasta resolver. Movimiento reducido: sin animación, el
 * estado final. Teal y ámbar solo en los rótulos DEBE y HABER.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const INTERFAZ_C3 = {
  marca: "Pantalla {n} de {total}",
  seguir: "Seguir",
  porQue: "¿Por qué?",
  debe: "DEBE",
  haber: "HABER",
  ladoDebe: "Debe",
  ladoHaber: "Haber",
  siguientePieza: "Siguiente pieza",
};

export const CSS_C3 = `
/* C3 · lo común de A2, A5 y A6 (motor de Watari, con los tokens del §4). */
.c3 { --texto: #F8F9FA; --atenuado: #A8B6C8; --neutro: #B8C4D4; --coral: #E76F51; --coral-texto: #EE8266;
  --teal-texto: #3FA69A; --ambar: #E9C46A; /* lado */
  --hundido: rgba(10,20,34,.45); --hundido-borde: rgba(248,249,250,.12); --reposo: 1px solid rgba(248,249,250,.35);
  display: grid; gap: 12px; color: var(--texto); font: 400 15px/1.5 "Inter", system-ui, sans-serif; min-width: 0; outline: none; }
.c3 * { box-sizing: border-box; }
.c3 :focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }
.c3-cejilla { margin: 0; font: 700 12px/1.3 "Sora", "Inter", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: var(--atenuado); }
.c3-txt, .c3-consigna { margin: 0; font-size: 15px; line-height: 1.5; outline: none; }
.c3-txt[hidden], .c3-consigna[hidden] { display: none; }
.c3-pie { margin: 0; font-size: 12px; color: var(--atenuado); }
.c3-num { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-variant-numeric: tabular-nums; }
.c3-hundido { background: var(--hundido); border: 1px solid var(--hundido-borde); border-radius: 12px; }
.c3-fig { display: grid; gap: 10px; transition: opacity .2s; }
.c3.dormida .c3-fig { opacity: .55; }
.c3-acc:empty { display: none; }
.c3-acc { display: grid; gap: 8px; }
.c3-preg { margin: 0; font: 600 15px/1.45 "Inter", sans-serif; }
.c3-ops { display: grid; gap: 8px; }
.c3-op { min-height: 44px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 4px 8px; padding: 10px 12px; border: 1px solid rgba(248,249,250,.35); border-radius: 12px; background: transparent; color: var(--texto); font: 500 14px/1.35 "Inter", sans-serif; text-align: left; cursor: pointer; }
.c3-op[aria-disabled="true"] { cursor: default; }
.c3-op.mal { border: 2px solid var(--coral); padding: 9px 11px; }
.c3-op.pista, .c3-op.bien { border: 2px solid var(--texto); padding: 9px 11px; }
.c3-boton { min-height: 44px; border-radius: 12px; border: 2px solid var(--neutro); background: transparent; color: var(--texto); font: 600 14px/1.2 "Inter", sans-serif; cursor: pointer; padding: 8px 12px; }
.c3-boton[aria-disabled="true"] { opacity: .45; cursor: default; }
.c3-msg { outline: none; }
.c3-msg [data-mensaje] { margin-top: 0 !important; }
.c3-porque { margin-top: 6px; min-height: 44px; padding: 0 14px; border: 1px solid rgba(248,249,250,.35); border-radius: 999px; background: transparent; color: var(--texto); font: 600 13px/1 "Inter", sans-serif; cursor: pointer; }
.c3-porque-txt { grid-column: 2; margin: 6px 0 0; font-size: 14px; line-height: 1.45; outline: none; }
.c3-msg .c3-porque { grid-column: 2; justify-self: start; }
.c3-seguir { width: 100%; min-height: 44px; border: 0; cursor: pointer; font: 700 14px/1.2 "Sora", sans-serif; padding: 12px 16px; background: var(--neutro); color: #1D3557; border-radius: 12px; }
.c3-seguir[aria-disabled="true"] { background: transparent; color: var(--atenuado); border: 2px solid rgba(184,196,212,.35); cursor: default; }
.c3-seguir[hidden] { display: none; }
.c3-lista { margin: 0; padding: 10px 12px 10px 28px; display: grid; gap: 6px; font-size: 14px; border-left: 3px solid var(--neutro); }
.c3-lista li { list-style: disc; }
.c3-lista li.c3-sig { list-style: none; margin-left: -16px; color: var(--atenuado); font-size: 13px; }
/* La línea en curso y la cuenta T del asiento: los dos lados son botones mientras hay una línea por ubicar. */
.c3-ficha { margin: 0; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 10px; padding: 8px 12px; border: 1px dashed var(--neutro); border-radius: 10px; font: 600 13px/1.35 "Inter", sans-serif; }
.c3-t { padding: 10px 12px; display: grid; gap: 8px; min-width: 0; }
.c3-t-tit { margin: 0; padding-bottom: 6px; border-bottom: 2px solid var(--neutro); font: 600 13px/1.3 "Sora", sans-serif; }
.c3-t-lados { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.c3-lado { display: grid; align-content: start; gap: 6px; min-height: 60px; min-width: 0; padding: 6px 8px; border: 0; border-radius: 8px; background: transparent; color: inherit; font: inherit; text-align: left; margin: 0; }
.c3-lado[data-lado="debe"] { border-right: 2px solid var(--neutro); border-radius: 8px 0 0 8px; }
.c3-lado-rot { font: 700 12px/1.3 "Inter", sans-serif; letter-spacing: .06em; }
.c3-lado[data-lado="debe"] .c3-lado-rot { color: var(--teal-texto); }
.c3-lado[data-lado="haber"] .c3-lado-rot { color: var(--ambar); }
.c3-lado.blanco { min-height: 88px; cursor: pointer; outline: 1px solid rgba(248,249,250,.35); outline-offset: -1px; }
.c3-lado.blanco:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }
.c3-lado.blanco.mal { outline: 2px solid var(--coral); outline-offset: -2px; }
.c3-lado.blanco.pista { outline: 2px solid var(--texto); outline-offset: -2px; }
.c3-lado-cab { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; }
.c3-ren { display: grid; gap: 1px; font-size: 12px; line-height: 1.3; color: var(--atenuado); overflow-wrap: anywhere; }
.c3-ren b { color: var(--texto); font-size: 13px; font-weight: 600; }
.c3-ren.nuevo { animation: c3-cae .4s cubic-bezier(.3,.9,.4,1) both; }
@keyframes c3-cae { from { transform: translateY(-14px); opacity: 0; } to { transform: none; opacity: 1; } }
.c3-ren.fantasma { opacity: .55; border: 1px dashed rgba(248,249,250,.35); border-radius: 6px; padding: 4px 6px; }
.c3-ren.fantasma small { font: 500 12px/1.2 "Inter", sans-serif; color: var(--atenuado); }
/* El cruce (A2, A5 y A6): fichas con key estable que se deslizan de columna (transform). A2-2 de Mello: borde de reposo. */
.c3-cruce { position: relative; display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 8px; padding: 10px 12px 12px; }
.c3-cruce::after { content: ""; position: absolute; left: 50%; top: 40px; bottom: 10px; width: 2px; margin-left: -1px; background: var(--neutro); }
.c3-cruce-rot { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 8px; padding-bottom: 6px; border-bottom: 2px solid var(--neutro); font: 600 12px/1.3 "Inter", sans-serif; color: var(--atenuado); }
.c3-tile { grid-column: 1; display: grid; gap: 2px; min-width: 0; padding: 8px 10px; border: var(--reposo); border-radius: 8px; background: #1F2D3D; font-size: 12px; line-height: 1.3; color: var(--atenuado); overflow-wrap: anywhere; transition: transform .5s cubic-bezier(.3,.9,.4,1); }
.c3-tile b { color: var(--texto); font-size: 13px; }
.c3-tile.der { transform: translateX(calc(100% + 8px)); }
.c3-roles { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--neutro); border-radius: 10px; overflow: hidden; }
.c3-roles button { min-height: 44px; padding: 6px 8px; border: 0; background: transparent; color: var(--texto); font: 600 13px/1.25 "Inter", sans-serif; cursor: pointer; }
.c3-roles button.on { background: var(--neutro); color: #1D3557; }
.c3-rotulo { margin: 0; font-size: 12px; line-height: 1.4; color: var(--atenuado); }
.c3-arriba, .c3-abajo { display: grid; gap: 10px; }
.c3-abajo:empty, .c3-arriba:empty { display: none; }
@media (prefers-reduced-motion: reduce) { .c3 *, .c3 *::before, .c3 *::after { animation: none !important; transition: none !important; } }
`;

/* ═══════════ AYUDAS ═══════════ */

export const pesos = (n) => "$" + Math.round(n).toLocaleString("es-CO");
const llenar = (t, vars) => t.replace(/\{(\w+)\}/g, (_, k) => String(vars[k]));
const bienDe = (P) => P.bien ?? P.acierto ?? "";
const msgAcierto = (P) => ({ tipo: "ok", t: bienDe(P), porque: P.porque, vista: Boolean(P.porqueALaVista) });
export const reducidoAhora = () => typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

/** M-1: la consigna se ve mientras !antes(s); la pregunta, cuando antes(s) (o si no hay antes). */
export const consignaVisible = (P, s) => Boolean(P.consigna) && !(P.antes && P.antes(s));
export const preguntaVisible = (P, s) => !P.antes || Boolean(P.antes(s));

export function estaListo(P, s) {
  if (P.boton) return true;
  if (P.listo) return Boolean(P.listo(s));
  if (P.tipo === "eleccion" || P.tipo === "lados") return Boolean(s.resuelto[P.id]);
  return true;
}

/* ═══════════ EL ESTADO (funciones puras; el componente las usa con useReducer) ═══════════ */

export const estadoInicial = (pieza) => ({
  p: 0, resuelto: {}, errores: {}, intento: null, pista: false, msg: null, linea: {}, fig: { ...(pieza.fig ?? {}) },
  evento: "entra", n: 0, foco: null,
});

/* 1.er error: la pista. 2.º y siguientes: la devolución de lo elegido y lo bueno en blanco (s.pista). */
function fallar(s, clave, id, pista, devolucion) {
  const errores = { ...s.errores, [clave]: (s.errores[clave] ?? 0) + 1 };
  const segundo = errores[clave] >= 2;
  return { ...s, errores, intento: id, pista: segundo || s.pista, msg: { tipo: "mal", t: segundo ? devolucion : pista }, evento: "error", n: s.n + 1, foco: { que: "msg", n: s.n + 1 } };
}

export function elegir(s, P, id) {
  if (P.tipo !== "eleccion" || s.resuelto[P.id] || !preguntaVisible(P, s)) return s;
  const o = P.opciones.find((x) => x.id === id);
  if (!o) return s;
  if (!o.correcta) return fallar(s, P.id, id, P.pista, o.devolucion);
  return { ...s, resuelto: { ...s.resuelto, [P.id]: true }, intento: null, pista: false, msg: msgAcierto(P), evento: "acierto", n: s.n + 1, foco: { que: "msg", n: s.n + 1 } };
}

export function ubicar(s, P, lado) {
  if (P.tipo !== "lados" || s.resuelto[P.id]) return s;
  const k = s.linea[P.id] ?? 0;
  const L = P.lineas[k];
  if (!L) return s;
  if (lado !== L.lado) return fallar(s, `${P.id}:${L.id}`, lado, L.pista, L.devolucion);
  const fin = k + 1 >= P.lineas.length;
  return {
    ...s, linea: { ...s.linea, [P.id]: k + 1 }, resuelto: fin ? { ...s.resuelto, [P.id]: true } : s.resuelto, intento: null, pista: false,
    msg: fin ? msgAcierto(P) : { tipo: "ok", t: "" }, evento: "cae", n: s.n + 1, foco: { que: "msg", n: s.n + 1 },
  };
}

export const abrirPorque = (s) => (s.msg?.porque ? { ...s, msg: { ...s.msg, abierto: true }, foco: { que: "porque", n: s.n + 1 }, n: s.n + 1 } : s);
export const conFigura = (s, cambios) => ({ ...s, fig: { ...s.fig, ...(typeof cambios === "function" ? cambios(s.fig) : cambios) }, evento: "figura", n: s.n + 1 });

export function seguir(s, pantallas) {
  const P = pantallas[s.p];
  if (!estaListo(P, s) || s.p >= pantallas.length - 1) return s;
  return { ...s, p: s.p + 1, intento: null, pista: false, msg: null, evento: "entra", n: s.n + 1, foco: { que: "txt", n: s.n + 1 } };
}

function reducir(pantallas, s, a) {
  const P = pantallas[s.p];
  if (a.tipo === "elegir") return elegir(s, P, a.id);
  if (a.tipo === "ubicar") return ubicar(s, P, a.lado);
  if (a.tipo === "porque") return abrirPorque(s);
  if (a.tipo === "fig") return conFigura(s, a.cambios);
  if (a.tipo === "seguir") return seguir(s, pantallas);
  return s;
}

/* ═══════════ LAS FIGURAS COMUNES ═══════════ */

/*
 * La cuenta T de un asiento «lados»: las líneas ya ubicadas, la línea en curso
 * como ficha y los dos lados como botones. Con `fantasma` (A6), cada línea
 * deja en el otro lado la original que reversa; el fantasma nombra la cuenta
 * solo si cambia.
 */
export function AsientoT({ ctx, titulo, lineas, resueltas = [] }) {
  const { s, P, interfaz: T } = ctx;
  const ls = lineas ?? P.lineas;
  const k = s.linea[P.id] ?? 0;
  const abierta = !s.resuelto[P.id];
  const puestas = resueltas.concat(ls.slice(0, k));
  const ultima = ctx.evento === "cae" && !ctx.reducido ? ls[k - 1] : null;
  const monto = (m) => (m != null ? pesos(m) : "$?");
  const lado = (l) => {
    const mal = abierta && s.intento === l;
    const pista = abierta && s.pista && ls[k]?.lado === l;
    const nombre = l === "debe" ? T.ladoDebe : T.ladoHaber;
    const filas = puestas.filter((x) => x.lado === l || x.fantasma).map((x, i) => {
      const nuevo = x === ultima ? " nuevo" : "";
      if (x.lado !== l) {
        return <span key={`f${i}`} className={`c3-ren fantasma${nuevo}`}>{x.fantasma.cuenta !== x.cuenta && <span>{x.fantasma.cuenta}</span>}<b className="c3-num">{pesos(x.fantasma.monto)}</b><small>{x.fantasma.fecha}</small></span>;
      }
      return <span key={`r${i}`} className={`c3-ren${nuevo}`} data-ren={x.id ?? x.cuenta}><span>{x.cuenta}</span><b className="c3-num">{monto(x.monto)}</b></span>;
    });
    const dentro = <><span className="c3-lado-cab"><span className="c3-lado-rot">{l === "debe" ? T.debe : T.haber}</span>{mal && <Pastilla marca={TACHADA} envuelve />}</span>{filas}</>;
    const clases = `c3-lado${abierta ? " blanco" : ""}${mal ? " mal" : ""}${pista ? " pista" : ""}`;
    return abierta
      ? <button key={`${l}-b`} type="button" className={clases} data-lado={l} aria-label={`${nombre}${mal ? `. ${LECTOR_INCORRECTO}` : ""}`} onClick={() => ctx.ubicar(l)}>{dentro}</button>
      : <div key={`${l}-g`} className={clases} data-lado={l} role="group" aria-label={nombre}>{dentro}</div>;
  };
  const L = abierta ? ls[k] : null;
  return (
    <>
      {L && <p className="c3-ficha" aria-live="polite" data-linea={L.id}><span>{L.cuenta}</span><b className="c3-num">{monto(L.monto)}</b></p>}
      <div className="c3-t c3-hundido"><p className="c3-t-tit">{titulo}</p><div className="c3-t-lados">{lado("debe")}{lado("haber")}</div></div>
    </>
  );
}

/*
 * C3.cruce de Watari, en React: cada ficha lleva una key estable, así que
 * React conserva el nodo y solo cambia su clase (`der`): la ficha se desliza
 * (transform). fichas = [{ key, der, clase?, contenido }].
 */
export function Cruce({ clave, fichas, rotulos = [INTERFAZ_C3.debe, INTERFAZ_C3.haber], className = "" }) {
  return (
    <div className={`c3-cruce c3-hundido${className ? ` ${className}` : ""}`} data-clave={clave} aria-live="polite">
      <div className="c3-cruce-rot"><span>{rotulos[0]}</span><span>{rotulos[1]}</span></div>
      {fichas.map((f) => <span key={f.key} data-ficha={f.key} className={`c3-tile${f.der ? " der" : ""}${f.clase ? ` ${f.clase}` : ""}`}>{f.contenido}</span>)}
    </div>
  );
}

export const C3 = { pesos, Cruce, cruce: Cruce, AsientoT, asientoT: AsientoT };

/* ═══════════ EL MOTOR ═══════════ */

/*
 * Lote V (Mello): las opciones de cada pantalla (y las de sus `pasos`, con la
 * clave «pantalla:paso»), barajadas UNA vez al montar, como T7-1 A1; el orden
 * no cambia al reintentar. Solo los ids: la lista se rearma con `ordenar`.
 */
export function ordenesAlMontar(pantallas, barajarOpciones = barajar) {
  const o = {};
  for (const p of pantallas) {
    if (p.opciones) o[p.id] = barajarOpciones(p.opciones.map((x) => x.id));
    for (const paso of p.pasos ?? []) if (paso.opciones) o[`${p.id}:${paso.id}`] = barajarOpciones(paso.opciones.map((x) => x.id));
  }
  return o;
}

export default function AprenderC3({ pieza, rotulo, barajar: barajarOpciones = barajar }) {
  const pantallas = pieza.pantallas;
  /* `barajar` se inyecta en las pruebas para fijar el azar. */
  const [ordenes] = useState(() => ordenesAlMontar(pantallas, barajarOpciones));
  const T = { ...INTERFAZ_C3, ...(pieza.interfaz ?? {}) };
  const [s, despachar] = useReducer((e, a) => reducir(pantallas, e, a), pieza, estadoInicial);
  const marco = useRef(null);
  const txt = useRef(null);
  const consigna = useRef(null);
  const msgRef = useRef(null);
  const porqueRef = useRef(null);

  /* El foco: al mensaje al responder, al porqué al abrirlo, al texto (o la consigna) al seguir. */
  useEffect(() => {
    if (!s.foco) return;
    const ir = { msg: msgRef, porque: porqueRef }[s.foco.que];
    const el = ir ? ir.current : [txt.current, consigna.current, marco.current].find((x) => x && !x.hidden);
    el?.focus({ preventScroll: true });
  }, [s.foco]);

  const P = pantallas[s.p];
  const reducido = reducidoAhora();
  const res = Boolean(s.resuelto[P.id]);
  const marca = (id) => {
    const o = P.opciones?.find((x) => x.id === id);
    if (!o) return null;
    if (res) return o.correcta ? "bien" : null;
    if (s.intento === id) return "mal";
    return s.pista && o.correcta ? "pista" : null;
  };
  const ctx = {
    s, P, evento: s.evento, n: s.n, reducido, interfaz: T, marca,
    fig: (cambios) => despachar({ tipo: "fig", cambios }),
    elegir: (id) => despachar({ tipo: "elegir", id }),
    ubicar: (lado) => despachar({ tipo: "ubicar", lado }),
    ordenar: (lista, clave = P.id) => {
      const ids = ordenes[clave];
      return ids ? ids.map((id) => lista.find((x) => x.id === id)).filter(Boolean) : lista;
    },
  };
  const listo = estaListo(P, s);
  const ultima = s.p === pantallas.length - 1;
  const boton = P.boton === undefined ? T.seguir : P.boton;

  const onSeguir = () => {
    if (!listo) return;
    if (ultima) {
      if (boton === T.siguientePieza) {
        const sig = marco.current?.closest("section")?.parentElement?.nextElementSibling?.querySelector("[data-pieza]");
        if (sig) { sig.scrollIntoView?.({ block: "start" }); sig.focus({ preventScroll: true }); }
      }
      return;
    }
    despachar({ tipo: "seguir" });
  };

  const verPregunta = P.tipo === "eleccion" && !P.enFigura && preguntaVisible(P, s);

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_B5H}{CSS_C3}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-pantalla={P.id} data-evento={s.evento}
        className={`c3 ${CLASE_B5H}${pieza.clase ? ` ${pieza.clase}` : ""}${P.tipo === "portada" ? " dormida" : ""}`}>
        <p className="c3-cejilla" aria-hidden="true">{llenar(T.marca, { n: s.p + 1, total: pantallas.length })}</p>
        <p ref={txt} className="c3-txt" tabIndex={-1} data-texto hidden={!P.texto}>{P.texto}</p>
        <p ref={consigna} className="c3-consigna" tabIndex={-1} data-consigna hidden={!consignaVisible(P, s)}>{consignaVisible(P, s) ? P.consigna : ""}</p>

        <div className="c3-fig" data-figura>{pieza.figura ? pieza.figura(ctx) : null}</div>

        <div className="c3-acc" aria-live="polite">
          {verPregunta && <>
            {P.pregunta && <p className="c3-preg" data-pregunta>{P.pregunta}</p>}
            <div className="c3-ops" role="group" aria-label={P.pregunta || undefined}>
              {ctx.ordenar(P.opciones).map((o) => {
                const m = marca(o.id);
                return (
                  <button key={o.id} type="button" className={`c3-op${m ? ` ${m}` : ""}`} data-op={o.id}
                    aria-disabled={res ? "true" : undefined} aria-label={`${o.t}${m === "mal" ? `. ${LECTOR_INCORRECTO}` : m === "bien" ? ". Correcto." : ""}`}
                    onClick={() => ctx.elegir(o.id)}>
                    <span>{o.t}</span>{m === "mal" && <Pastilla marca={TACHADA} />}{m === "bien" && <Pastilla marca={CORRECTA} />}
                  </button>
                );
              })}
            </div>
          </>}
          {P.tipo === "resumen" && P.lista && (
            <ul className="c3-lista">{P.lista.map((x) => <li key={x} data-texto>{x}</li>)}{P.siguiente && <li className="c3-sig" data-texto>{P.siguiente}</li>}</ul>
          )}
        </div>

        <div ref={msgRef} tabIndex={-1} className="c3-msg" data-c3-msg>
          <RegionViva>
            {s.msg && (
              <Mensaje ok={s.msg.tipo === "ok"} texto={s.msg.t || null}>
                {s.msg.porque && (s.msg.vista || s.msg.abierto
                  ? <p ref={porqueRef} tabIndex={-1} className="c3-porque-txt" data-porque>{s.msg.porque}</p>
                  : <button type="button" className="c3-porque" data-boton="por-que" aria-expanded="false" onClick={() => despachar({ tipo: "porque" })}>{T.porQue}</button>)}
              </Mensaje>
            )}
          </RegionViva>
        </div>

        <p className="c3-pie" data-pie hidden={!P.pie}>{P.pie}</p>
        <button type="button" className="c3-seguir" hidden={boton === null} aria-disabled={String(!listo)} onClick={onSeguir}
          data-boton={boton === T.siguientePieza ? "siguiente-pieza" : P.boton ? "empezar" : "seguir"}>
          {boton}
        </button>
      </div>
    </Panel>
  );
}
