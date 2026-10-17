import { useEffect, useReducer, useRef } from "react";
import { Panel } from "../../salaDeControl/marco.jsx";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { formatearCifra } from "../../../../contabilidad/elCierreCompleto.js";
import { sinUnSoloIntento } from "../../../../contabilidad/armaLaLinea.js";
import {
  Pastilla, Mensaje, RegionViva, IconoX, CORRECTA, TACHADA, REVELADA, CSS_B5H, CLASE_B5H, LECTOR_INCORRECTO, ACIERTO_MENSAJE, PALABRA_B, COMPROBAR_B,
} from "../b5/Devolucion.jsx";
import { EncabezadoHacer, BOTONES_T7 } from "./hacerT7.jsx";
import { INTERFAZ_C3, pesos, reducidoAhora } from "./aprenderC3.jsx";
import { ContadorConIntento } from "./armaLaLinea.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PATRÓN DE ENGANCHE C4 · «TODA DECISIÓN SE PINTA» (D4 y D9; Watari,
 * patron-enganche-c4-v1.html, motor4.js → aquí). Módulo de la Célula C.
 *   1. Al tocar una opción o al «Comprobar» una cifra, la figura pinta su
 *      consecuencia (pieza.consecuencia, pura) en el acto.
 *      CIFRA (Mello C4-1, bloquea): mientras se escribe, la figura recibe la
 *      cifra SOLO para mostrarla en su lugar (el renglón, la casilla del
 *      objeto): `vista.borrador`. Nada que dependa del resultado («Cuadra»,
 *      «Sobran»/«Faltan», coral, la balanza nivelada) se pinta antes de
 *      «Comprobar»: `vista.valor` (y `vista.eleccion`, `estado`) existen solo
 *      después de comprobar. consecuencia-c.test.mjs lo comprueba (C5).
 *   2. El veredicto llega ESPERA_C4 = 380 ms después (sin espera con
 *      movimiento reducido): pastilla, «falla» en coral con ✕ y el mensaje.
 *   3. Hacer: un intento, la correcta con «Iba aquí» (b5/Devolucion.jsx),
 *      puntaje y `detalle` del primer intento (useTanda). Aprender: escalera
 *      C2 (pista; luego devolución y correcta en blanco; nunca «Iba aquí»).
 *
 * CÓMO SE REGISTRA UNA PIEZA (sin listas centrales):
 *   a) src/contabilidad/c4/<pieza>_c4.js (puro, sin React) exporta
 *      CONSECUENCIA_C4 = { id, objeto, modo: "hacer"|"aprender", items,
 *        consecuencia(item, eleccion) → estado (JSON) con `falla` si es mala }
 *      eleccion: id de opción (elección) · número escrito (cifra) · null.
 *      consecuencia-c.test.mjs encuentra todo *_c4.js y comprueba la regla.
 *   b) El componente: <DecisionC4 pieza={{ ...CONSECUENCIA_C4, titulo, Figura,
 *        enFigura?, objetivo?, consigna?, pie?, resumen?(bien, total), Propio?,
 *        Antes? ({ item }: lo que va entre el contador y el ítem: el resto del
 *        enunciado o la pantalla de un bloque, como en main) }}
 *        Marco rotulo acento onCompletar(pct, ms, detalle) onComoSeJuega />
 *   item = { id, tipo?: "eleccion"|"cifra"|"propio", texto, pregunta,
 *     opciones: [{ id, t, correcta?, msg?, v? }], pista, bien, porque, pie,
 *     subtema, formato?: "pesos"|"numero"|"factor"|"porcentaje" }
 *   Figura({ estado, item, vista, ctx }) solo pinta `estado`; marca con
 *   `c4-mov` lo que se anima. Cifra: `vista.borrador` (número que se está
 *   escribiendo, o null) solo para escribirlo; `vista.valor` (el comprobado,
 *   o null) y `estado` para la consecuencia. El componente exporta
 *   PIEZA_C4 = { ...CONSECUENCIA_C4, Figura, ... } para que la prueba C5
 *   pinte la figura con la cifra escrita sin comprobar. Con enFigura, pinta las opciones con
 *   <OpcionC4 ctx opcion>. «propio»: pieza.Propio({ item, terminar(ok, r) })
 *   (los asientos que siguen como en main).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ESPERA_C4 = 380;
const INTERFAZ_C4 = { ...INTERFAZ_C3, marca: "Pregunta {n} de {total}" };
/* C4-7 (Mello): en Hacer, los BOTONES_T7 publicados con «caso» en vez de «ítem», como el contador. */
const aCaso = (t) => t.replace("ítem", "caso").replace("Ítem", "Caso");
export const BOTONES_C4 = { siguiente: aCaso(BOTONES_T7.siguiente), verResumen: aCaso(BOTONES_T7.verResumen), contador: aCaso("Ítem") };

/* ═══════════ CIFRAS ═══════════ */

const esDecimal = (I) => /factor|porcent/.test(I.formato ?? "") || I.opciones.some((o) => typeof o.v === "number" && o.v % 1 !== 0);
export function leerC4(I, texto) {
  let t = String(texto ?? "").replace(/[$\s%]/g, "");
  if (!t) return null;
  t = esDecimal(I) ? t.replace(/\./g, "").replace(",", ".") : t.replace(/[.,]/g, "");
  const n = Number(t);
  return t !== "" && Number.isFinite(n) ? n : null;
}
export function fmtC4(I, n) {
  if (n == null) return "";
  if (/porcent/.test(I.formato ?? "")) return `${String(n).replace(".", ",")} %`;
  if (esDecimal(I)) return String(n).replace(".", ",");
  if (I.formato === "numero") return n.toLocaleString("es-CO");
  return pesos(n);
}
const enCasilla = (I, texto) => (esDecimal(I) ? String(texto).replace(/[^\d.,]/g, "") : formatearCifra(texto));
export const opcionDeCifra = (I, n) => (n == null ? null : I.opciones.find((o) => typeof o.v === "number" && Math.abs(o.v - n) < 1e-6) ?? null);

/* ═══════════ EL ESTADO (puro) ═══════════ */

const VACIO = { eleccion: null, valor: null, errores: 0, resuelto: false, fallado: false, veredicto: false, texto: "", borrador: null, abierto: false };
export const estadoInicialC4 = () => ({ i: 0, e: {}, n: 0, evento: "entra", foco: null });
export const deItem = (s, I) => s.e[I.id] ?? VACIO;
const cerrado = (E) => E.resuelto || E.fallado;
const pendiente = (E) => E.eleccion != null && !E.veredicto;
const tipoDe = (I) => I.tipo ?? "eleccion";
const poner = (s, I, E, extra) => ({ ...s, e: { ...s.e, [I.id]: E }, n: s.n + 1, ...extra });

function decidir(s, I, hacer, eleccion, ok) {
  const E = deItem(s, I);
  const valor = tipoDe(I) === "cifra" ? eleccion : null;
  return poner(s, I, { ...E, eleccion, valor, veredicto: false, abierto: false, resuelto: ok, fallado: hacer && !ok, errores: E.errores + (ok ? 0 : 1) }, { evento: "consecuencia" });
}

export function reducirC4(pieza, s, a) {
  const hacer = pieza.modo === "hacer";
  const I = pieza.items[s.i];
  const E = deItem(s, I);
  switch (a.tipo) {
    case "elegir": {
      const o = I.opciones.find((x) => x.id === a.id);
      if (!o || tipoDe(I) !== "eleccion" || cerrado(E) || pendiente(E)) return s;
      return decidir(s, I, hacer, o.id, Boolean(o.correcta));
    }
    case "escribir": {
      if (tipoDe(I) !== "cifra" || cerrado(E) || pendiente(E)) return s;
      const texto = enCasilla(I, a.texto);
      return poner(s, I, { ...E, eleccion: null, valor: null, veredicto: false, texto, borrador: leerC4(I, texto) }, { evento: "escribe" });
    }
    case "comprobar": {
      if (tipoDe(I) !== "cifra" || cerrado(E) || pendiente(E) || E.borrador == null || E.eleccion != null) return s;
      return decidir(s, I, hacer, E.borrador, Boolean(opcionDeCifra(I, E.borrador)?.correcta));
    }
    case "propio":
      if (tipoDe(I) !== "propio" || cerrado(E)) return s;
      return poner(s, I, { ...E, eleccion: a.respuesta ?? null, veredicto: true, resuelto: a.ok, fallado: !a.ok }, { evento: "veredicto" });
    case "veredicto":
      if (!pendiente(E)) return s;
      return poner(s, I, { ...E, veredicto: true }, { evento: "veredicto", foco: { que: "msg", n: s.n + 1 } });
    case "porque":
      return poner(s, I, { ...E, abierto: true }, { evento: "porque", foco: { que: "porque", n: s.n + 1 } });
    case "seguir":
      if (!(cerrado(E) && E.veredicto) || s.i >= pieza.items.length - 1) return s;
      return { ...s, i: s.i + 1, n: s.n + 1, evento: "entra", foco: { que: "txt", n: s.n + 1 } };
    case "reiniciar":
      return estadoInicialC4();
    default:
      return s;
  }
}

/* Lo que la figura y las opciones necesitan saber del ítem en curso.
 * C4-1: `valor` y `eleccion` solo existen tras «Comprobar»; `borrador` es la cifra que se escribe, solo para mostrarla. */
export function vistaC4(pieza, I, E, reducido = false) {
  const hacer = pieza.modo === "hacer";
  const cifra = tipoDe(I) === "cifra";
  const eleccion = E.eleccion ?? null;
  const op = cifra ? opcionDeCifra(I, eleccion) : I.opciones.find((o) => o.id === eleccion) ?? null;
  const ok = E.eleccion != null && E.resuelto;
  return {
    modo: pieza.modo, eleccion, valor: cifra ? E.valor ?? null : null, borrador: cifra ? E.borrador ?? null : null, op, ok, veredicto: E.veredicto, resuelto: E.resuelto, fallado: E.fallado, errores: E.errores,
    escribiendo: cifra && E.eleccion == null && E.borrador != null, pista: !hacer && E.errores >= 2 && !E.resuelto, reducido,
    bloqueada: cerrado(E) || pendiente(E), correcta: I.opciones.find((o) => o.correcta) ?? null,
  };
}

/* Lo que recibe la figura: la vista y el estado de la consecuencia (de `vista.eleccion`, nunca del borrador). */
export function figuraC4(pieza, I, E, reducido = false) {
  const vista = vistaC4(pieza, I, E, reducido);
  return { vista, estado: tipoDe(I) === "propio" ? null : pieza.consecuencia(I, vista.eleccion) };
}

/* El ctx de la figura (y de OpcionC4 dentro de ella). */
export const ctxC4 = (pieza, I, E, vista, elegir = () => {}) => ({ item: I, vista, reducido: vista.reducido, elegir, marca: (id) => marcaC4(pieza, I, E, id), pesos, fmt: (n) => fmtC4(I, n) });

/* La marca de una opción: «tocada» (antes del veredicto) · «bien» · «mal» · «iba» (solo Hacer) · «pista» (solo Aprender, 2.º error). */
export function marcaC4(pieza, I, E, id) {
  const o = I.opciones.find((x) => x.id === id);
  if (!o || E.eleccion == null) return null;
  if (!E.veredicto) return E.eleccion === id ? "tocada" : null;
  if (E.eleccion === id) return o.correcta ? "bien" : "mal";
  if (o.correcta && E.fallado && pieza.modo === "hacer") return "iba";
  if (o.correcta && pieza.modo !== "hacer" && E.errores >= 2 && !E.resuelto) return "pista";
  return null;
}

/* El mensaje del veredicto: acierto (bien y porqué); Hacer, la devolución de lo elegido; Aprender, pista y luego devolución. */
export function mensajeC4(pieza, I, E) {
  if (!E.veredicto || tipoDe(I) === "propio") return null;
  if (E.resuelto) return { ok: true, t: I.bien ?? null, porque: I.porque ?? null };
  const o = tipoDe(I) === "cifra" ? opcionDeCifra(I, E.eleccion) : I.opciones.find((x) => x.id === E.eleccion);
  if (pieza.modo === "hacer") return { ok: false, t: o?.msg ?? I.pista ?? null, porque: I.porque ?? null };
  return { ok: false, t: E.errores >= 2 ? o?.msg ?? I.pista ?? null : I.pista ?? o?.msg ?? null, porque: null };
}

/* ═══════════ LA VISTA ═══════════ */

const ETIQUETA = { mal: LECTOR_INCORRECTO, bien: ACIERTO_MENSAJE, iba: `${PALABRA_B.ibaAqui}.` };
const PASTILLA = { mal: TACHADA, bien: CORRECTA, iba: REVELADA };

/* La opción: un botón real; Hacer y Aprender la pintan igual. También vive dentro de la figura (enFigura). */
export function OpcionC4({ ctx, opcion, children = null, className = "" }) {
  const m = ctx.marca(opcion.id);
  return (
    <button type="button" className={`c4-op${m ? ` ${m}` : ""}${className ? ` ${className}` : ""}`} data-op={opcion.id}
      aria-disabled={ctx.vista.bloqueada ? "true" : undefined} aria-label={ETIQUETA[m] ? `${opcion.t}. ${ETIQUETA[m]}` : opcion.t}
      onClick={() => ctx.elegir(opcion.id)}>
      {children ?? <span>{opcion.t}</span>}
      {PASTILLA[m] && <Pastilla marca={PASTILLA[m]} />}
    </button>
  );
}

export const CSS_C4 = `
.c4 { --texto: #F8F9FA; --atenuado: #A8B6C8; --neutro: #B8C4D4; --coral: #E76F51;
  display: grid; gap: 12px; color: var(--texto); font: 400 15px/1.5 "Inter", system-ui, sans-serif; min-width: 0; outline: none; }
.c4 * { box-sizing: border-box; }
.c4 :focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }
.c4-cejilla { margin: 0; font: 700 12px/1.3 "Sora", "Inter", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: var(--atenuado); }
.c4-txt, .c4-preg { margin: 0; font-size: 15px; line-height: 1.5; outline: none; }
.c4-preg { font-weight: 600; }
.c4-txt[hidden], .c4-preg[hidden], .c4-pie[hidden] { display: none; }
.c4-pie { margin: 0; font-size: 12px; color: var(--atenuado); }
.c4-num { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-variant-numeric: tabular-nums; }
.c4-fig { display: grid; gap: 10px; min-width: 0; }
.c4-fig[data-anim] .c4-mov { animation: c4-entra ${ESPERA_C4}ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes c4-entra { from { transform: translateY(-10px) scale(.96); opacity: 0; } to { transform: none; opacity: 1; } }
.c4-falla { margin: 0; display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 8px; align-items: start; padding: 9px 11px; border: 2px solid var(--coral); border-radius: 10px; font: 500 14px/1.4 "Inter", sans-serif; overflow-wrap: anywhere; }
.c4-falla svg { margin-top: 3px; }
.c4-ops { display: grid; gap: 8px; }
.c4-op { min-height: 44px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 4px 8px; padding: 10px 12px; border: 1px solid rgba(248,249,250,.35); border-radius: 12px; background: transparent; color: var(--texto); font: 500 14px/1.35 "Inter", sans-serif; text-align: left; cursor: pointer; min-width: 0; overflow-wrap: anywhere; }
.c4-op[aria-disabled="true"] { cursor: default; }
.c4-op.tocada { border: 2px solid var(--neutro); padding: 9px 11px; }
.c4-op.mal { border: 2px solid var(--coral); padding: 9px 11px; }
.c4-op.bien, .c4-op.iba, .c4-op.pista { border: 2px solid var(--texto); padding: 9px 11px; }
.c4-casilla { display: flex; flex-wrap: wrap; gap: 8px; }
.c4-casilla input { flex: 1 1 140px; min-width: 0; min-height: 44px; padding: 8px 12px; border: 1px solid rgba(248,249,250,.35); border-radius: 12px; background: rgba(10,20,34,.45); color: var(--texto); font: 600 16px/1.2 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.c4-boton { min-height: 44px; padding: 8px 14px; border-radius: 12px; border: 2px solid var(--neutro); background: transparent; color: var(--texto); font: 600 14px/1.2 "Inter", sans-serif; cursor: pointer; }
.c4-boton[aria-disabled="true"] { opacity: .45; cursor: default; }
.c4-escrito { margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; padding: 9px 12px; border-radius: 12px; border: 1px solid rgba(248,249,250,.35); font-size: 15px; }
.c4-escrito.mal { border: 2px solid var(--coral); }
.c4-escrito.bien, .c4-escrito.iba, .c4-escrito.pista { border: 2px solid var(--texto); }
.c4-msg { outline: none; }
.c4-porque { margin-top: 6px; grid-column: 2; justify-self: start; min-height: 44px; padding: 0 14px; border: 1px solid rgba(248,249,250,.35); border-radius: 999px; background: transparent; color: var(--texto); font: 600 13px/1 "Inter", sans-serif; cursor: pointer; }
.c4-porque-txt { grid-column: 2; margin: 6px 0 0; font-size: 14px; line-height: 1.45; outline: none; }
.c4-seguir { width: 100%; min-height: 44px; border: 0; cursor: pointer; font: 700 14px/1.2 "Sora", sans-serif; padding: 12px 16px; background: var(--neutro); color: #1D3557; border-radius: 12px; }
.c4-seguir[aria-disabled="true"] { background: transparent; color: var(--atenuado); border: 2px solid rgba(184,196,212,.35); cursor: default; }
@media (prefers-reduced-motion: reduce) { .c4 *, .c4 *::before, .c4 *::after { animation: none !important; transition: none !important; } }
`;

const llenar = (t, vars) => t.replace(/\{(\w+)\}/g, (_, k) => String(vars[k]));

export default function DecisionC4({ pieza, Marco = Panel, rotulo, acento, onCompletar = null, onComoSeJuega = null }) {
  const hacer = pieza.modo === "hacer";
  const T = { ...INTERFAZ_C4, ...(pieza.interfaz ?? {}) };
  const t = useTanda(() => pieza.items);
  const [s, despachar] = useReducer((e, a) => reducirC4(pieza, e, a), undefined, estadoInicialC4);
  const bien = useRef(0);
  const txt = useRef(null);
  const msgRef = useRef(null);
  const porqueRef = useRef(null);
  const marco = useRef(null);

  const I = pieza.items[s.i];
  const E = deItem(s, I);
  const tipo = tipoDe(I);
  const reducido = reducidoAhora();
  const fig = figuraC4(pieza, I, E, reducido);
  const vista = { ...fig.vista, anim: !reducido && (s.evento === "consecuencia" || s.evento === "escribe") };
  const espera = pendiente(E) && tipo !== "propio";

  /* 2 · el veredicto, ESPERA_C4 después de la consecuencia (con movimiento reducido llega en el mismo toque). */
  useEffect(() => {
    if (!espera) return undefined;
    const id = setTimeout(() => despachar({ tipo: "veredicto" }), ESPERA_C4);
    return () => clearTimeout(id);
  }, [espera, s.i]);

  useEffect(() => {
    if (!s.foco) return;
    const el = { msg: msgRef, porque: porqueRef, txt }[s.foco.que]?.current;
    (el ?? marco.current)?.focus({ preventScroll: true });
  }, [s.foco]);

  useEffect(() => {
    if (t.terminado) onCompletar?.(pieza.items.length ? (bien.current / pieza.items.length) * 100 : 0, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps

  /* 1 · la consecuencia. En Hacer, el primer (y único) intento se anota aquí. */
  const decidirYa = (accion, eleccion, ok) => {
    if (hacer) { t.anotar(I.id, ok, ok ? null : eleccion); if (ok) bien.current += 1; }
    despachar(accion);
    if (reducidoAhora()) despachar({ tipo: "veredicto" });
  };
  const elegir = (id) => {
    const o = I.opciones.find((x) => x.id === id);
    if (!o || tipo !== "eleccion" || cerrado(E) || pendiente(E)) return;
    decidirYa({ tipo: "elegir", id }, id, Boolean(o.correcta));
  };
  const comprobar = () => {
    if (tipo !== "cifra" || cerrado(E) || pendiente(E) || E.borrador == null) return;
    decidirYa({ tipo: "comprobar" }, E.borrador, Boolean(opcionDeCifra(I, E.borrador)?.correcta));
  };
  const terminarPropio = (ok, respuesta = null) => {
    if (cerrado(E)) return;
    if (hacer) { t.anotar(I.id, ok, ok ? null : respuesta); if (ok) bien.current += 1; }
    despachar({ tipo: "propio", ok, respuesta });
  };
  const ctx = ctxC4(pieza, I, E, vista, elegir);

  const reiniciar = () => { bien.current = 0; t.reiniciar(); despachar({ tipo: "reiniciar" }); };
  if (hacer && t.terminado) {
    const pct = Math.round((bien.current / pieza.items.length) * 100);
    return (
      <Marco rotulo={rotulo} titulo={pieza.titulo} acento={acento}>
        <Cierre pct={pct} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          {pieza.resumen && <p data-resumen style={TEXTO_CIERRE}>{pieza.resumen(bien.current, pieza.items.length)}</p>}
        </Cierre>
      </Marco>
    );
  }

  const estado = fig.estado;
  const msg = mensajeC4(pieza, I, E);
  const falla = E.veredicto && !E.resuelto && estado?.falla;
  const listo = cerrado(E) && E.veredicto;
  const ultimo = s.i >= pieza.items.length - 1;
  const enFigura = typeof pieza.enFigura === "function" ? pieza.enFigura(I) : Boolean(pieza.enFigura);
  const Figura = pieza.Figura;
  const correcta = vista.correcta;

  const avanzarHacer = () => {
    if (!listo) return;
    if (ultimo) t.setTerminado(true);
    else { t.setI(s.i + 1); despachar({ tipo: "seguir" }); }
  };
  const seguirAprender = () => {
    if (!listo) return;
    if (!ultimo) { despachar({ tipo: "seguir" }); return; }
    const sig = marco.current?.closest("section")?.parentElement?.nextElementSibling?.querySelector("[data-pieza]");
    if (sig) { sig.scrollIntoView?.({ block: "start" }); sig.focus({ preventScroll: true }); }
  };

  const escrito = (clase, valor, marca, dato) => (
    <p className={`c4-escrito ${clase}`} data-escrito={dato}><span className="c4-num">{valor}</span>{marca && <Pastilla marca={marca} valor={marca === REVELADA ? correcta?.t : null} />}</p>
  );

  return (
    <Marco rotulo={rotulo} titulo={pieza.titulo} acento={acento}>
      <style>{CSS_B5H}{CSS_C4}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-item={I.id} data-modo={pieza.modo} data-evento={s.evento}
        className={`c4 ${CLASE_B5H}${pieza.clase ? ` ${pieza.clase}` : ""}`}>
        {hacer && <EncabezadoHacer objetivo={pieza.objetivo ?? null} consigna={sinUnSoloIntento(pieza.consigna ?? "")} onComoSeJuega={onComoSeJuega} />}
        {hacer && (
          <ContadorConIntento>
            <Pulsos total={pieza.items.length} hechos={s.i + (listo ? 1 : 0)} enCurso={s.i + 1} etiqueta={BOTONES_C4.contador} />
          </ContadorConIntento>
        )}
        {pieza.Antes && <pieza.Antes item={I} />}
        {/* La cejilla: el subtema solo con el veredicto (en varias piezas nombra la respuesta). */}
        <p className="c4-cejilla" aria-hidden="true" data-cejilla>
          {[!hacer && llenar(T.marca, { n: s.i + 1, total: pieza.items.length }), E.veredicto && I.subtema].filter(Boolean).join(" · ")}
        </p>
        <p ref={txt} className="c4-txt" tabIndex={-1} data-texto hidden={!I.texto}>{I.texto}</p>

        {tipo === "propio" && pieza.Propio ? <pieza.Propio item={I} terminar={terminarPropio} ctx={ctx} /> : <>
          <div className="c4-fig" data-figura data-anim={vista.anim ? "si" : undefined} aria-live="polite">
            {Figura && <Figura estado={estado} item={I} vista={vista} ctx={ctx} />}
          </div>
          {falla && <p className="c4-falla" data-falla><IconoX /><span>{falla}</span></p>}
          <p className="c4-preg" data-pregunta hidden={!I.pregunta}>{I.pregunta}</p>

          {tipo === "eleccion" && !enFigura && (
            <div className="c4-ops" role="group" aria-label={I.pregunta || undefined}>
              {I.opciones.map((o) => <OpcionC4 key={o.id} ctx={ctx} opcion={o} />)}
            </div>
          )}
          {tipo === "cifra" && <>
            {E.veredicto && E.eleccion != null && escrito(E.resuelto ? "bien" : "mal", fmtC4(I, E.eleccion), E.resuelto ? CORRECTA : TACHADA, "tuya")}
            {E.fallado && hacer && escrito("iba", correcta?.t, REVELADA, "iba")}
            {vista.pista && E.veredicto && escrito("pista", correcta?.t, null, "pista")}
            {!cerrado(E) && (
              <div className="c4-casilla">
                <input type="text" inputMode={esDecimal(I) ? "decimal" : "numeric"} autoComplete="off" aria-label={I.pregunta} value={E.texto}
                  readOnly={pendiente(E)} onChange={(ev) => despachar({ tipo: "escribir", texto: ev.target.value })}
                  onKeyDown={(ev) => { if (ev.key === "Enter") comprobar(); }} />
                <button type="button" className="c4-boton" data-accion="comprobar" aria-disabled={E.borrador == null || pendiente(E) ? "true" : undefined} onClick={comprobar}>{COMPROBAR_B}</button>
              </div>
            )}
          </>}

          <div ref={msgRef} tabIndex={-1} className="c4-msg" data-c4-msg>
            <RegionViva>
              {msg && (
                <Mensaje ok={msg.ok} texto={msg.t}>
                  {msg.porque && (E.abierto
                    ? <p ref={porqueRef} tabIndex={-1} className="c4-porque-txt" data-porque>{msg.porque}</p>
                    : <button type="button" className="c4-porque" aria-expanded="false" onClick={() => despachar({ tipo: "porque" })}>{T.porQue}</button>)}
                </Mensaje>
              )}
            </RegionViva>
          </div>
        </>}

        <p className="c4-pie" data-pie hidden={!(I.pie ?? pieza.pie)}>{I.pie ?? pieza.pie}</p>
        {hacer
          ? listo && <div data-responder><Responder onClick={avanzarHacer}>{ultimo ? BOTONES_C4.verResumen : BOTONES_C4.siguiente}</Responder></div>
          : <button type="button" className="c4-seguir" aria-disabled={String(!listo)} onClick={seguirAprender} data-boton={ultimo ? "siguiente-pieza" : "seguir"}>{ultimo ? T.siguientePieza : T.seguir}</button>}
      </div>
    </Marco>
  );
}
