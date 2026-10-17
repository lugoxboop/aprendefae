import { useEffect, useRef, useState } from "react";
import { Panel } from "../../salaDeControl/marco.jsx";
import { barajar } from "../../../../utils/barajar.js";
import {
  PIEZA_LAS_CAPAS, ESTADOS_CAPAS, MOVS_CAPAS, ESCALA_CAPAS, NOMBRE_METODO, SELECTOR_METODO, EJES, INTERFAZ_A4, SIGUE_HASTA_EL_28,
} from "../../../../data/contabilidadT7_2_a4_capas.js";
import { METODOS_CAPAS, movTxt, salePartes, numCapa } from "../../../../contabilidad/t7_2Capas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A4 «Las capas que la venta corta» (Patrón de enganche C, pieza 4,
 * v6 de Watari, con A4-N1 de Mello).
 *
 * El código de referencia de la v6 (`a4.js`, en patron-enganche-c-v6.html),
 * pasado a React sin cambiar lo que hace:
 *
 *   · la pila: una capa por compra, de abajo (lo más antiguo) hacia arriba;
 *     cada capa dice «unidades × costo» y su barra es proporcional a las
 *     unidades, con la misma escala para todas (12.200). Con el promedio no
 *     hay capas: una sola barra, «Todo», y sin ejes
 *   · una sola fecha a la vez: la ficha dice qué pasa ese día y el
 *     deslizador (nativo, diez paradas) la mueve. F1 de Mello: SOLO un paso
 *     exacto hacia adelante se anima (la capa que llega, el corte rayado, la
 *     capa que se agota, la compra que se funde en el promedio); hacia atrás
 *     o a saltos, la pila salta al estado de la fecha sin animar
 *   · pantallas 3 y 4: tocar la capa que la venta corta primero; pantallas 5
 *     y 6: tres opciones. Escalera (C4): el 1.er error da el texto propio de
 *     lo tocado («No es esta» o «No es este» y su porqué) y se puede volver a
 *     intentar; el 2.º marca la respuesta en borde neutro sólido y el mensaje
 *     da su porqué. El acierto lleva ✓ y borde neutro (B4). Coral solo en lo
 *     equivocado; nada de teal ni ámbar
 *   · pantallas 6 y 8: el selector de método, dentro de la figura, cambia lo
 *     que se ve y no califica (C1)
 *   · A4-N1 de Mello: al mover el deslizador con la pregunta ya resuelta, en
 *     las pantallas 3, 4 y 5 el mensaje pasa a «Sigue hasta el 28 de
 *     febrero.» mientras no se haya visto el 28; después queda vacío. En las
 *     pantallas 6 y 8 (la 7 de la v6) queda vacío
 *
 * La pantalla 7 es la del cierre (decisión de la v6), rehecha por C1 (Near,
 * t7-2-a4-el-cierre-c1.md, con PASA de Mello): `ElCierreQueSobra`, abajo. La
 * lista de los cinco cierres del periódico se toca (selección múltiple) y
 * «Comprobar» la califica. Escalera (C2): 1.er error, la retro de la fila
 * que no sobra o, si solo faltó marcar, la pista, y se puede volver a
 * intentar; 2.º error, la respuesta con su porqué. Al acertar o en el 2.º
 * error salen las tres filas que sobran y entra «Cerrar Costo de mercancía
 * vendida» con la marca «nuevo»; la lista del permanente se queda (C8).
 * [PROVISIONAL PARA WATARI] La figura es una versión sobria con las clases
 * `ea4-`: filas de 44 px con casilla, coral y ✕ solo en la fila que no
 * sobra tras el error, y la marca «nuevo» en borde neutro.
 *
 * Lo que la v6 no resuelve dentro del producto y se decide aquí:
 *   · [ESCRITO POR CLAUDE, NO POR LA FICHA] «Siguiente pieza», en la última
 *     pantalla, lleva el foco a la pieza siguiente de la vista (en la v6 no
 *     hace nada: es el prototipo de una sola pieza). PENDIENTE_DE_REVISION
 *   · el rótulo «Pantalla n de 8» va a 12 px (en la v6, 10,5): la letra
 *     mínima de la célula es 12
 *   · al responder, el foco va al mensaje (regla de la casa); al pasar de
 *     pantalla, al texto (como en la v6)
 *
 * NO CALIFICA y no da FP: es Aprender. Clases con el prefijo `ea4-`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* (4) T7-2 A4 · tokens del producto. Coral solo para el error; el acierto es ✓ con borde neutro (B4).
   No hay Debe ni Haber en la figura, así que no aparecen teal ni ámbar. Las capas son un supuesto de costo: relleno neutro, no cartón (F4 de Mello). */
export const CSS_A4 = `
.ea4 { --fondo: #0E1B2E; --texto: #F8F9FA; --texto2: #A8B6C8; --neutro: #B8C4D4; --borde: rgba(248,249,250,0.16); --coral: #E76F51;
  display: grid; gap: 12px; color: var(--texto); font: 400 15px/1.5 "Inter", system-ui, sans-serif; min-width: 0; }
.ea4 * { box-sizing: border-box; }
.ea4-marca { margin: 0; font: 600 12px/1.3 "Sora", "Inter", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: var(--texto2); }
.ea4-txt { margin: 0; font-size: 15px; line-height: 1.5; outline: none; }
.ea4-fig { display: grid; gap: 8px; border: 1px solid var(--borde); border-radius: 12px; padding: 10px 12px 4px; transition: opacity .2s; min-width: 0; }
.ea4.dormida .ea4-fig { opacity: .55; }
.ea4-metodo { margin: 0; font: 600 13px/1.3 "Sora", sans-serif; }
/* Una sola fecha a la vez: la ficha del día. */
.ea4-ficha { margin: 0; justify-self: start; padding: 5px 12px; border: 1px solid var(--neutro); border-radius: 999px; font: 600 13px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; }
.ea4-ficha.espera { border-style: dashed; }
/* La pila: de abajo (lo más antiguo) hacia arriba (lo último que entró). */
.ea4-pila-marco { display: grid; gap: 4px; }
.ea4-eje { font-size: 12px; line-height: 1.2; color: var(--texto2); }
.ea4-eje.abajo { padding-top: 4px; border-top: 2px solid var(--neutro); }
.ea4-pila { display: flex; flex-direction: column-reverse; gap: 6px; min-height: 48px; }
.ea4-capa { display: grid; grid-template-columns: 46px minmax(0, 1fr); grid-template-areas: "f num" "f barra"; align-items: center; gap: 4px 8px; min-height: 48px; width: 100%; padding: 4px 8px 4px 8px;
  border: 1px solid var(--borde); border-radius: 10px; background: transparent; color: var(--texto); font: inherit; text-align: left; cursor: default; }
.ea4-capa:disabled { opacity: 1; }
.ea4-f { grid-area: f; font: 600 12px/1.2 "Sora", sans-serif; color: var(--texto2); white-space: nowrap; }
.ea4-cuerpo { display: contents; }
.ea4-num { grid-area: num; font: 500 13.5px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
.ea4-barra { grid-area: barra; position: relative; display: block; height: 12px; }
/* F4 (Mello): la capa es un supuesto de costo, no mercancía física: relleno neutro, no cartón. */
.ea4-lleno { position: absolute; left: 0; top: 0; bottom: 0; width: var(--w); min-width: 3px; border-radius: 3px; background: rgba(184,196,212,.35); border: 1px solid var(--neutro); }
/* El corte: lo que se lleva la venta, rayado, se desliza a la derecha y se va. */
.ea4-corte { position: absolute; top: 0; bottom: 0; border-radius: 0 3px 3px 0; background: repeating-linear-gradient(135deg, rgba(184,196,212,.85) 0 3px, transparent 3px 6px); border: 1px solid var(--neutro); animation: ea4-corte .7s ease-in .1s both; }
@keyframes ea4-corte { from { transform: none; opacity: 1; } 40% { transform: translateX(6px); opacity: 1; } to { transform: translateX(28px); opacity: 0; } }
.ea4-capa.llega { animation: ea4-llega .4s ease-out both; }
@keyframes ea4-llega { from { transform: translateY(-22px); opacity: 0; } to { transform: none; opacity: 1; } }
.ea4-capa.agotada { animation: ea4-agota .45s ease-in .75s both; overflow: hidden; }
@keyframes ea4-agota { from { opacity: 1; max-height: 60px; } to { opacity: 0; max-height: 0; min-height: 0; padding-block: 0; border-width: 0; } }
/* Promedio: la capa nueva se funde con lo que había; la barra crece de su largo anterior al nuevo. */
.ea4-capa.mezcla .ea4-lleno { animation: ea4-crece .45s ease-out both; }
@keyframes ea4-crece { from { width: var(--w0); } to { width: var(--w); } }
.ea4-capa.mezcla { animation: ea4-brilla .6s ease-out; }
@keyframes ea4-brilla { from { border-color: var(--neutro); } to { border-color: var(--borde); } }
/* El sello va a la derecha de la barra: ninguna capa que se toca pasa del 43 % del ancho (5.200 de 12.200). */
.ea4-sello { grid-area: barra; justify-self: end; align-self: center; font: 600 12px/1.2 "Inter", sans-serif; white-space: nowrap; }
.ea4-sello:empty { display: none; }
/* Se puede tocar: borde punteado, como en las piezas 1 y 2. */
.ea4-capa.blanco { border: 2px dashed var(--neutro); padding: 3px 7px; cursor: pointer; }
.ea4-capa.mal { border: 2px solid var(--coral); }
.ea4-capa.rebota > * { animation: ea4-rebota .4s ease-out; }
@keyframes ea4-rebota { 0%, 100% { transform: none; } 25% { transform: translateX(-5px); } 60% { transform: translateX(4px); } }
.ea4-capa:focus-visible { outline: 2px solid var(--texto); outline-offset: 2px; }
.ea4-sale { margin: 0; font-size: 13px; line-height: 1.4; color: var(--texto); font-variant-numeric: tabular-nums; }
.ea4-sale:empty { display: none; }
.ea4-sale span { white-space: nowrap; }
/* Con el promedio no hay capas que ordenar: los rótulos de arriba y abajo se van (el de abajo queda como línea de base). */
.ea4.sin-capas .ea4-eje.arriba { display: none; }
.ea4.sin-capas .ea4-eje.abajo { padding-top: 0; }
/* El deslizador de fechas: diez paradas, una por día con movimiento. */
.ea4-dia { position: relative; }
.ea4-rango { -webkit-appearance: none; appearance: none; width: 100%; height: 44px; margin: 0; background: transparent; cursor: pointer; position: relative; z-index: 1; }
.ea4-rango::-webkit-slider-runnable-track { height: 6px; border-radius: 3px; background: rgba(248,249,250,.14); }
.ea4-rango::-moz-range-track { height: 6px; border-radius: 3px; background: rgba(248,249,250,.14); }
/* R7 del lote de dialecto C: lo que se agarra mide 44 × 44; el disco visible sigue de 26 px. */
.ea4-rango::-webkit-slider-thumb { -webkit-appearance: none; width: 44px; height: 44px; margin-top: -19px; border: 0; border-radius: 50%; background: radial-gradient(circle at center, #F8F9FA 0 8px, #1F2D3D 8px 11px, #B8C4D4 11px 13px, transparent 13.5px); }
.ea4-rango::-moz-range-thumb { width: 44px; height: 44px; border: 0; border-radius: 50%; background: radial-gradient(circle at center, #F8F9FA 0 8px, #1F2D3D 8px 11px, #B8C4D4 11px 13px, transparent 13.5px); }
.ea4-rango:focus-visible { outline: 2px solid var(--texto); outline-offset: 2px; border-radius: 8px; }
.ea4-rango:disabled { cursor: default; opacity: .45; }
.ea4-marcas { position: absolute; left: 0; right: 0; bottom: 8px; height: 10px; pointer-events: none; }
.ea4-marcas i { position: absolute; top: 0; width: 2px; height: 10px; margin-left: -1px; background: var(--neutro); border-radius: 1px; }
.ea4-acc:empty { display: none; }
.ea4-ops { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.ea4-op, .ea4-seguir { min-height: 44px; border-radius: 12px; font: 600 15px/1.2 "Inter", sans-serif; cursor: pointer; padding: 8px 10px; }
.ea4-op { background: transparent; color: var(--texto); border: 1px solid var(--borde); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; text-align: center; }
.ea4-op:disabled { cursor: default; opacity: 1; }
.ea4-op.mal { border: 2px solid var(--coral); }
/* Escalera de ayuda: la respuesta correcta en borde neutro sólido, nunca coral. */
.ea4-op.pista, .ea4-capa.blanco.pista { border: 2px solid var(--neutro); background: rgba(184,196,212,.12); }
.ea4-msg.pista { padding: 8px 12px; border-left: 3px solid var(--neutro); background: rgba(184,196,212,.08); border-radius: 0 8px 8px 0; }
/* C1 (Mello): el selector de método, dentro de la figura y sin calificar. */
.ea4-selector { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; border: 1px solid var(--neutro); border-radius: 10px; overflow: hidden; }
.ea4-selector[hidden] { display: none; }
.ea4-selector button { min-height: 44px; padding: 6px 4px; background: transparent; color: var(--texto); border: 0; border-left: 1px solid var(--borde); font: 600 13px/1.2 "Inter", sans-serif; cursor: pointer; }
.ea4-selector button:first-child { border-left: 0; }
.ea4-selector button.activo { background: var(--neutro); color: #1D3557; }
.ea4-op em { font: 600 12px/1.2 "Inter", sans-serif; font-style: normal; }
.ea4-msg { margin: 0; font-size: 14px; color: var(--texto); outline: none; }
.ea4-msg:empty { display: none; }
.ea4-msg.mal { padding: 8px 12px; border-left: 3px solid var(--coral); background: rgba(231,111,81,.10); border-radius: 0 8px 8px 0; }
.ea4-msg.bien { padding: 8px 12px; border: 2px solid var(--neutro); border-radius: 12px; }
.ea4-nav { display: flex; }
.ea4-seguir { width: 100%; background: var(--neutro); color: #1D3557; border: 0; text-align: center; }
.ea4-seguir:disabled { background: transparent; color: var(--texto2); border: 2px solid rgba(184,196,212,.35); cursor: default; }
.ea4 button:focus-visible { outline: 2px solid var(--texto); outline-offset: 2px; }
/* T7-2 A4 · el cierre (C1). [PROVISIONAL PARA WATARI] Filas que se tocan, con casilla; sin montos. */
.ea4-c-lista { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; }
.ea4-c-lista li { list-style: none; min-width: 0; }
.ea4-c-fila { display: grid; grid-template-columns: 20px minmax(0, 1fr) auto; align-items: center; gap: 10px; width: 100%; min-height: 44px; padding: 8px 10px;
  border: 1px solid var(--borde); border-radius: 10px; background: transparent; color: var(--texto); font: 400 14px/1.35 "Inter", sans-serif; text-align: left; overflow-wrap: anywhere; }
button.ea4-c-fila { cursor: pointer; }
.ea4-c-caja { width: 18px; height: 18px; border: 2px solid var(--neutro); border-radius: 4px; display: grid; place-items: center; font: 700 12px/1 "Inter", sans-serif; color: #1D3557; }
.ea4-c-fila[aria-pressed="true"] { border: 2px solid var(--neutro); padding: 7px 9px; }
.ea4-c-fila[aria-pressed="true"] .ea4-c-caja { background: var(--neutro); }
.ea4-c-fila.mal { border: 2px solid var(--coral); padding: 7px 9px; }
.ea4-c-x { font: 700 13px/1 "Inter", sans-serif; color: var(--coral); }
.ea4-c-x:empty { display: none; }
.ea4-c-fila.quieta { grid-template-columns: minmax(0, 1fr) auto; }
.ea4-c-nuevo { justify-self: end; padding: 2px 8px; border: 1px solid var(--neutro); border-radius: 999px; font: 600 12px/1.3 "Inter", sans-serif; color: var(--texto); white-space: nowrap; }
.ea4-c-entra { animation: ea4-llega .4s ease-out both; }
.ea4-comprobar { width: 100%; min-height: 44px; border-radius: 12px; font: 600 15px/1.2 "Inter", sans-serif; cursor: pointer; padding: 8px 10px; background: transparent; color: var(--texto); border: 2px solid var(--neutro); }
.ea4-comprobar[aria-disabled="true"] { color: var(--texto2); border-color: rgba(184,196,212,.35); cursor: default; }
.ea4-pie { margin: 0; font-size: 12px; line-height: 1.4; color: var(--texto2); overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .ea4 *, .ea4 *::before, .ea4 *::after { animation: none !important; transition: none !important; } }
`;

/* La compra del promedio llega como capa aparte y, este tiempo después, se funde con lo que hay (v6). */
export const MEZCLA_MS = 650;

export const reducido = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

const ULTIMA = MOVS_CAPAS.length; // 9: el 28 de febrero
const pct = (u) => (100 * u) / ESCALA_CAPAS;

/*
 * F1 (Mello): lo que la pila pinta. Solo un paso exacto hacia adelante, con el
 * mismo método, guarda el estado anterior (ant) para animar; o, en el
 * promedio, la compra que se funde (mezcla 1 → 2). Lo demás, sin animar.
 */
export function vistaNueva(prev, metodo, idx, paso, sinMovimiento = reducido()) {
  const n = (prev?.n ?? 0) + 1;
  if (!paso || sinMovimiento || !prev || prev.metodo !== metodo) return { metodo, idx, ant: null, mezcla: 0, n, rebota: null };
  if (metodo === "promedio" && idx === prev.idx + 1 && MOVS_CAPAS[idx - 1].compra) return { metodo, idx, ant: null, mezcla: 1, n, rebota: null };
  return { metodo, idx, ant: prev.idx, mezcla: 0, n, rebota: null };
}

/* Las filas de la pila, de la más antigua a la más nueva (como `pintarPila` y `pintarMezcla` de la v6). */
export function filasDeLaPila(vista) {
  const { metodo, idx, ant: antIdx, mezcla } = vista;
  if (mezcla === 1) {
    const A = ESTADOS_CAPAS.promedio[idx - 1].capas[0];
    const m = MOVS_CAPAS[idx - 1];
    const nueva = { id: m.f, f: m.f, u: m.compra[0], c: m.compra[1] };
    return [{ x: A, v: null, clase: "", fecha: INTERFAZ_A4.todo }, { x: nueva, v: null, clase: "llega", fecha: nueva.f }];
  }
  if (mezcla === 2) {
    const A = ESTADOS_CAPAS.promedio[idx - 1].capas[0];
    return [{ x: ESTADOS_CAPAS.promedio[idx].capas[0], v: A, clase: "mezcla", fecha: INTERFAZ_A4.todo }];
  }
  const E = ESTADOS_CAPAS[metodo][idx];
  const ant = antIdx === null ? null : ESTADOS_CAPAS[metodo][antIdx];
  const viejos = ant ? Object.fromEntries(ant.capas.map((x) => [x.id, x])) : {};
  const filas = [];
  /* Las capas que se agotan en este paso se ven una vez cortadas del todo y se van. */
  if (ant) for (const v of ant.capas) if (!E.capas.find((x) => x.id === v.id)) filas.push({ x: { ...v, u: 0 }, v, clase: "agotada" });
  for (const x of E.capas) filas.push({ x, v: viejos[x.id], clase: ant && !viejos[x.id] ? "llega" : "" });
  const todas = ant ? ant.capas.concat(E.capas) : E.capas;
  const orden = (r) => todas.findIndex((y) => y.id === r.x.id);
  filas.sort((a, b) => orden(a) - orden(b));
  const fecha = (x) => (metodo === "promedio" ? INTERFAZ_A4.todo : x.f);
  return filas.map((r) => ({ ...r, fecha: fecha(r.x) }));
}

function Capa({ fila, tocable, estado, onTocar }) {
  const { x, v, clase, fecha } = fila;
  const w = pct(x.u);
  const w0 = v ? pct(v.u) : w;
  const id = x.id === "prom" ? "prom" : x.f;
  const extra = [clase, tocable && "blanco", estado.mal && "mal", estado.pista && "pista", estado.rebota && "rebota"].filter(Boolean).map((c) => ` ${c}`).join("");
  return (
    <button type="button" className={`ea4-capa${extra}`} data-capa={id} disabled={!tocable} onClick={tocable ? () => onTocar(id) : undefined}>
      <span className="ea4-f">{fecha}</span>
      <span className="ea4-cuerpo">
        <span className="ea4-num">{numCapa(x, v)}</span>
        <span className="ea4-barra">
          <i className="ea4-lleno" style={{ "--w": `${w}%`, "--w0": `${w0}%` }} />
          {v && v.u > x.u && <i className="ea4-corte" data-corte style={{ left: `${w}%`, width: `${w0 - w}%` }} />}
        </span>
      </span>
      <span className="ea4-sello" aria-hidden="true">{estado.mal ? INTERFAZ_A4.noEsta : ""}</span>
    </button>
  );
}

/* ═══════════ UNA PANTALLA DE CAPAS ═══════════ */

const inicial = (P) => ({
  idx: P.idx, metodo: P.metodo, visto: P.idx, resuelto: false, errores: 0, pista: false, intento: null, msg: "", tipo: "", respondio: 0,
  vista: vistaNueva(null, P.metodo, P.idx, false),
});

function PantallaCapas({ P, numero, total, enfocar, onSeguir, barajarOpciones }) {
  const [s, setS] = useState(() => inicial(P));
  /* Lote V (Mello): las opciones, barajadas UNA vez al montar la pantalla (como los Hacer de T7 al armar la tanda); el orden no cambia al reintentar. `barajar` se inyecta en las pruebas. */
  const [opciones] = useState(() => (P.opciones ? barajarOpciones(P.opciones) : null));
  const txt = useRef(null);
  const msg = useRef(null);
  const dormida = P.id === "portada";
  const T = P.tocar ?? P.elegir ?? null;
  const esperando = P.gate !== undefined && !s.resuelto;
  const E = ESTADOS_CAPAS[s.metodo][s.idx];
  const mov = esperando ? MOVS_CAPAS[P.gate - 1] : E.mov;

  useEffect(() => { if (enfocar) txt.current?.focus({ preventScroll: true }); }, [enfocar]);
  /* Al responder, el foco va al mensaje. */
  useEffect(() => { if (s.respondio) msg.current?.focus({ preventScroll: true }); }, [s.respondio]);
  /* Promedio: la compra se funde un instante después de llegar. */
  useEffect(() => {
    if (s.vista.mezcla !== 1) return undefined;
    const n = s.vista.n;
    const t = setTimeout(() => setS((x) => (x.vista.n === n && x.vista.mezcla === 1 ? { ...x, vista: { ...x.vista, mezcla: 2 } } : x)), MEZCLA_MS);
    return () => clearTimeout(t);
  }, [s.vista.n, s.vista.mezcla]);

  /* F1 (Mello): se anima solo un paso exacto hacia adelante. */
  const irA = (x, i, cambios = {}) => {
    const paso = i === x.idx + 1;
    return { ...x, ...cambios, idx: i, visto: Math.max(x.visto, i), vista: vistaNueva(x.vista, x.metodo, i, paso) };
  };
  const acierta = (x) => ({ ...x, resuelto: true, intento: null, pista: false, msg: T.bien, tipo: "bien", respondio: x.respondio + 1 });
  /* C4 (Mello): escalera de ayuda. Al segundo error, la respuesta correcta se marca en neutro y el mensaje da su porqué. */
  const falla = (x, id) => {
    const errores = x.errores + 1;
    const segundo = errores >= 2;
    return { ...x, errores, intento: id, pista: segundo, msg: segundo ? T.pista : T.mal[id], tipo: segundo ? "pista" : "mal", respondio: x.respondio + 1 };
  };

  const tocarCapa = (id) => setS((x) => {
    if (!P.tocar || x.resuelto) return x;
    if (id === P.tocar.correcta) return irA(acierta(x), P.gate);
    const y = falla(x, id);
    return { ...y, vista: { ...vistaNueva(x.vista, x.metodo, x.idx, false), rebota: reducido() ? null : id } };
  });
  const elegir = (id) => setS((x) => {
    if (!P.elegir || x.resuelto) return x;
    if (id === P.elegir.correcta) {
      const y = acierta(x);
      return P.gate !== undefined ? irA(y, P.gate) : { ...y, vista: vistaNueva(x.vista, x.metodo, x.idx, false) };
    }
    return { ...falla(x, id), vista: vistaNueva(x.vista, x.metodo, x.idx, false) };
  });
  const mover = (i) => setS((x) => {
    if (i === x.idx) return x;
    const y = irA(x, i);
    /* A4-N1 (Mello): con la pregunta resuelta, el mensaje del acierto no se queda pegado a otra fecha. */
    if (T && x.resuelto) {
      const sigue = P.gate !== undefined && y.visto < ULTIMA;
      return { ...y, msg: sigue ? SIGUE_HASTA_EL_28 : "", tipo: "" };
    }
    return y;
  });
  const verMetodo = (m) => setS((x) => ({ ...x, metodo: m, vista: vistaNueva(x.vista, m, x.idx, false) }));

  const filas = filasDeLaPila(s.vista);
  const [a, b] = P.rango ?? (s.resuelto ? [0, ULTIMA] : [s.idx, s.idx]);
  const listo = Boolean(P.boton) || (P.listo !== undefined ? s.visto >= P.listo && (P.gate === undefined || s.resuelto) : s.resuelto);
  const promedio = s.metodo === "promedio";
  const vende = !esperando && !E.mov.inicial && E.mov.venta;
  const nombreBoton = P.boton === "Empezar" ? "empezar" : P.boton ? "siguiente-pieza" : "seguir";

  return (
    <div className={`ea4${dormida ? " dormida" : ""}${promedio ? " sin-capas" : ""}`} data-capas={P.id}>
      <p className="ea4-marca" aria-hidden="true">{`Pantalla ${numero} de ${total}`}</p>
      <p className="ea4-txt" tabIndex={-1} ref={txt} data-texto>{P.texto}</p>
      <div className="ea4-fig" data-figura>
        <p className="ea4-metodo" data-metodo-visto={s.metodo}>{NOMBRE_METODO[s.metodo]}</p>
        <div className="ea4-selector" role="group" aria-label={INTERFAZ_A4.verOtroMetodo} hidden={!P.selector}>
          {METODOS_CAPAS.map((m) => (
            <button key={m} type="button" data-metodo={m} className={m === s.metodo ? "activo" : undefined} aria-pressed={m === s.metodo} onClick={P.selector ? () => verMetodo(m) : undefined}>
              {SELECTOR_METODO[m]}
            </button>
          ))}
        </div>
        <p className={`ea4-ficha${esperando ? " espera" : ""}`} aria-live="polite" data-ficha>{movTxt(mov)}</p>
        <div className="ea4-pila-marco">
          <span className="ea4-eje arriba" aria-hidden="true">{promedio ? "" : EJES.arriba}</span>
          <div className="ea4-pila" role="group" aria-label={INTERFAZ_A4.capasDelInventario}>
            {filas.map((f) => {
              const id = f.x.id === "prom" ? "prom" : f.x.f;
              const tocable = Boolean(P.tocar) && !s.resuelto;
              const estado = {
                mal: tocable && s.intento === id,
                pista: tocable && s.pista && id === P.tocar.correcta,
                rebota: s.vista.rebota === id,
              };
              return <Capa key={`${s.vista.n}-${s.vista.mezcla}-${f.x.id}-${f.clase}`} fila={f} tocable={tocable} estado={estado} onTocar={tocarCapa} />;
            })}
          </div>
          <span className="ea4-eje abajo" aria-hidden="true">{promedio ? "" : EJES.abajo}</span>
        </div>
        <p className="ea4-sale" data-sale>
          {vende ? [`${INTERFAZ_A4.salen} `, ...salePartes(E.sale).flatMap((t, k) => [k ? " y " : null, <span key={t + k}>{t}</span>]).filter(Boolean)] : null}
        </p>
        <div className="ea4-dia">
          <input
            className="ea4-rango" type="range" min={a} max={b} step="1" value={s.idx}
            aria-label={INTERFAZ_A4.fecha} aria-valuetext={movTxt(E.mov)} disabled={dormida || esperando}
            onChange={(e) => mover(Number(e.target.value))}
          />
          <div className="ea4-marcas" aria-hidden="true">
            {Array.from({ length: ULTIMA + 1 }, (_, i) => <i key={i} style={{ left: `calc(22px + (100% - 44px) * ${i / ULTIMA})` }} />)}
          </div>
        </div>
      </div>
      <div className="ea4-acc">
        {P.opciones && (
          <div className="ea4-ops" role="group">
            {opciones.map((o) => {
              const mal = !s.resuelto && s.intento === o.id;
              const pista = !s.resuelto && s.pista && o.id === P.elegir.correcta;
              const ok = s.resuelto && o.id === P.elegir.correcta;
              return (
                <button key={o.id} type="button" className={`ea4-op${mal ? " mal" : ""}${pista ? " pista" : ""}`} data-op={o.id} disabled={s.resuelto} onClick={() => elegir(o.id)}>
                  <span>{o.t}</span>
                  {mal && <em>{INTERFAZ_A4.noEste}</em>}
                  {ok && <em>{INTERFAZ_A4.ok}</em>}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <p className={`ea4-msg${s.msg && s.tipo ? ` ${s.tipo}` : ""}`} role="status" tabIndex={-1} ref={msg} data-mensaje={s.msg ? s.tipo || "sigue" : undefined}>{s.msg}</p>
      <div className="ea4-nav">
        <button type="button" className="ea4-seguir" data-boton={nombreBoton} disabled={!listo} onClick={listo ? onSeguir : undefined}>
          {P.boton ?? INTERFAZ_A4.seguir}
        </button>
      </div>
    </div>
  );
}

/* ═══════════ EL CIERRE (C1): LOS CIERRES DEL PERIÓDICO QUE LE SOBRAN AL PERMANENTE ═══════════ */

/*
 * Lo que dice «Comprobar» con estas marcas y estos errores previos (pura, para
 * la prueba): { resuelta, peldano: "acierto" | "retro" | "pista" | "respuesta", texto, malas }.
 * 1.er error: la retro de la primera fila marcada que no sobra (en el orden de
 * la lista); si no marcó ninguna así (solo le faltó marcar), la pista. 2.º: la
 * respuesta, y la pantalla queda resuelta como con el acierto.
 */
export function comprobarCierre(P, marcadas, errores) {
  const sobran = P.filas.filter((f) => f.sobra).map((f) => f.id);
  const exacta = sobran.length === marcadas.length && sobran.every((id) => marcadas.includes(id));
  if (exacta) return { resuelta: true, peldano: "acierto", texto: P.mensajes.acierto, malas: [] };
  const malas = P.filas.filter((f) => !f.sobra && marcadas.includes(f.id)).map((f) => f.id);
  if (errores + 1 >= 2) return { resuelta: true, peldano: "respuesta", texto: P.mensajes.respuesta, malas: [] };
  if (malas.length) return { resuelta: false, peldano: "retro", texto: P.filas.find((f) => f.id === malas[0]).retro, malas };
  return { resuelta: false, peldano: "pista", texto: P.mensajes.pista, malas: [] };
}

/* La lista del permanente: las filas que no sobran, con la que entra en su sitio. */
export const listaDelPermanente = (P) => P.filas.filter((f) => !f.sobra).flatMap((f) => (f.id === P.entra.despuesDe ? [f, P.entra] : [f]));

function ElCierreQueSobra({ P, numero, total, enfocar, onSeguir }) {
  const [s, setS] = useState({ marcadas: [], errores: 0, resuelta: false, peldano: null, texto: "", malas: [], respondio: 0 });
  const txt = useRef(null);
  const msg = useRef(null);
  const idEnc = `ea4-c-${P.id}`;
  useEffect(() => { if (enfocar) txt.current?.focus({ preventScroll: true }); }, [enfocar]);
  /* Al responder, el foco va al mensaje. */
  useEffect(() => { if (s.respondio) msg.current?.focus({ preventScroll: true }); }, [s.respondio]);

  const tocar = (id) => setS((x) => (x.resuelta ? x : {
    ...x,
    marcadas: x.marcadas.includes(id) ? x.marcadas.filter((m) => m !== id) : [...x.marcadas, id],
    /* La marca de error se va de la fila que se vuelve a tocar. */
    malas: x.malas.filter((m) => m !== id),
  }));
  const comprobar = () => setS((x) => {
    if (x.resuelta || !x.marcadas.length) return x;
    const r = comprobarCierre(P, x.marcadas, x.errores);
    return { ...x, ...r, errores: r.peldano === "acierto" ? x.errores : x.errores + 1, respondio: x.respondio + 1 };
  });

  const tipoMsg = { acierto: "bien", respuesta: "pista", retro: "mal", pista: "mal" }[s.peldano] ?? "";
  const filas = s.resuelta ? listaDelPermanente(P) : P.filas;
  return (
    <div className="ea4" data-cierre-c1={P.id} data-estado={s.resuelta ? "resuelta" : s.peldano ? "error" : "colocando"}>
      <p className="ea4-marca" aria-hidden="true">{`Pantalla ${numero} de ${total}`}</p>
      <p className="ea4-txt" tabIndex={-1} ref={txt} data-texto>{P.texto}</p>
      <div className="ea4-fig" data-figura>
        <p className="ea4-metodo" id={idEnc} data-encabezado>{P.encabezado}</p>
        <ul className="ea4-c-lista" aria-labelledby={idEnc} data-lista={s.resuelta ? "permanente" : "periodico"}>
          {filas.map((f) => {
            if (s.resuelta) {
              const nueva = f.id === P.entra.id;
              return (
                <li key={f.id} className={nueva ? "ea4-c-entra" : undefined}>
                  <span className="ea4-c-fila quieta" data-fila={f.id} data-nueva={nueva ? "si" : undefined}>
                    <span>{f.texto}</span>
                    {nueva && <span className="ea4-c-nuevo" data-marca-nuevo>{P.entra.marca}</span>}
                  </span>
                </li>
              );
            }
            const marcada = s.marcadas.includes(f.id);
            const mal = s.malas.includes(f.id);
            return (
              <li key={f.id}>
                <button type="button" className={`ea4-c-fila${mal ? " mal" : ""}`} data-fila={f.id} aria-pressed={marcada} onClick={() => tocar(f.id)}>
                  <span className="ea4-c-caja" aria-hidden="true">{marcada ? "✓" : ""}</span>
                  <span>{f.texto}</span>
                  <span className="ea4-c-x" aria-hidden="true">{mal ? "✕" : ""}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {!s.resuelta && (
        <button type="button" className="ea4-comprobar" data-boton="comprobar" aria-disabled={s.marcadas.length ? undefined : "true"} onClick={comprobar}>
          {P.boton}
        </button>
      )}
      <p className={`ea4-msg${tipoMsg ? ` ${tipoMsg}` : ""}`} role="status" tabIndex={-1} ref={msg} data-mensaje={s.peldano ? (s.peldano === "acierto" ? "acierto" : "error") : undefined} data-peldano={s.peldano ?? undefined}>
        {s.peldano === "acierto" && <span aria-hidden="true">{"✓ "}</span>}
        {s.texto}
      </p>
      <div className="ea4-nav">
        <button type="button" className="ea4-seguir" data-boton="seguir" disabled={!s.resuelta} onClick={s.resuelta ? onSeguir : undefined}>
          {INTERFAZ_A4.seguir}
        </button>
      </div>
      <p className="ea4-pie" data-pie>{P.pie}</p>
    </div>
  );
}

/* ═══════════ LA PIEZA ═══════════ */

export default function LasCapasQueLaVentaCorta({ pieza = PIEZA_LAS_CAPAS, rotulo, barajar: barajarOpciones = barajar }) {
  const [k, setK] = useState(0);
  const p = pieza.pantallas[k];
  const marco = useRef(null);
  const [movido, setMovido] = useState(false);
  const ultima = k === pieza.pantallas.length - 1;
  const seguir = () => {
    if (!ultima) { setMovido(true); setK((x) => x + 1); return; }
    /* «Siguiente pieza»: la que sigue en la vista del tema. */
    const sig = marco.current?.closest("section")?.parentElement?.nextElementSibling?.querySelector("[data-pieza]");
    if (sig) { sig.scrollIntoView?.({ behavior: reducido() ? "auto" : "smooth", block: "start" }); sig.focus?.({ preventScroll: true }); }
  };

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_A4}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-pantalla={p.id} style={{ outline: "none" }}>
        {p.tipo === "cierre-que-sobra" ? (
          <ElCierreQueSobra key={p.id} P={p} numero={k + 1} total={pieza.pantallas.length} enfocar={movido} onSeguir={seguir} />
        ) : (
          <PantallaCapas key={p.id} P={p} numero={k + 1} total={pieza.pantallas.length} enfocar={movido} onSeguir={seguir} barajarOpciones={barajarOpciones} />
        )}
      </div>
    </Panel>
  );
}
