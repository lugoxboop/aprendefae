import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Panel } from "../../salaDeControl/marco.jsx";
import { barajar } from "../../../../utils/barajar.js";
import { POR_QUE } from "./plegable.jsx";
import { PIEZA_EL_KARDEX, KARDEX_A3, BOTON, INTERFAZ } from "../../../../data/contabilidadT7_2_a3.js";
import { FICHAS_K1, ORDEN_EN_PANTALLA, SIGUE_HASTA_EL_20, PORQUE_LADO_A_LADO, ROTULOS_W } from "../../../../data/contabilidadT7_2_a3_c2.js";
import { cifraK } from "../../../../contabilidad/t7_2Kardex.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A3 «El kárdex», renovada: el kárdex que crece (Patrón de enganche
 * C2 de Watari, pieza 1, con K-1, K-2 y K-3 de Mello).
 *
 * Reemplaza a la pieza de hoy (PantallasT7_2 con PIEZA_EL_KARDEX) con el
 * mismo id y en la misma posición. El código de referencia de Watari
 * (`kardex.js`, en orquestador/conocimiento/paquetes/patron-enganche-c2-v1.html),
 * pasado a React sin cambiar lo que hace:
 *
 *   · una tabla de verdad (Fecha, Entradas, Salidas, Saldo) que se llena fila
 *     por fila al mover la fecha. A menos de 560 px de contenido, Entradas y
 *     Salidas comparten columna, con la marca «Entra» o «Sale»
 *   · SOLO un paso exacto hacia adelante se anima (la fila entra en 300 ms y
 *     el total del saldo, si es una sola capa, cuenta hasta su valor en
 *     600 ms). Hacia atrás o a saltos, la tabla salta sin animar
 *   · pantallas 3, 4 y 5: tres fichas que vuelan al hueco. K-1 de Mello: PEPS
 *     y UEPS usan la misma mecánica que el promedio (antes se tocaba una capa
 *     del saldo), con las fichas y devoluciones de su tabla. Al acertar en PEPS
 *     o UEPS, el «mira esto»: las capas que salen viajan del Saldo al hueco
 *     de Salidas (400 ms); en el promedio, la ficha vuela (320 ms)
 *   · pantalla 6: tres métodos, cada uno una fila que se toca
 *   · escalera C2: 1.er error, la pista de Near; 2.º error, la devolución de
 *     Near (o la de Mello) y la correcta con borde blanco. Se reintenta sin
 *     límite. Nunca «Iba aquí» (es Aprender)
 *   · K-2 de Mello: con la pregunta resuelta, el acierto se ve solo en la
 *     fecha de la pregunta (`s.idx === P.espera`); fuera de ella, «Sigue hasta
 *     el 20 de julio.» si la pantalla aún no está lista, o nada si ya lo está
 *   · K-3 de Mello: el porqué de «lado a lado», a la vista, es solo su primera
 *     frase
 *
 * Textos: los de Near, leídos de contabilidadT7_2_a3.js (PIEZA_EL_KARDEX y
 * KARDEX_A3), sin copiarlos; los nuevos de Mello y los rótulos [W] de
 * Watari, de contabilidadT7_2_a3_c2.js.
 *
 * Lo que se decide aquí, fuera de la referencia:
 *   · el deslizador va siempre de 0 a 4 (las cinco marcas) y lo que no se
 *     puede recorrer se ajusta al rango de la pantalla; en la referencia, con
 *     min y max iguales, el pulgar se pinta en el borde, lejos de su marca.
 *     [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION
 *   · al responder, el foco va al mensaje (regla de la casa); al pasar de
 *     pantalla, al texto (como en la referencia)
 *   · «Siguiente pieza» lleva el foco a la pieza siguiente de la vista (en la
 *     referencia no hace nada: es un prototipo de una pieza)
 *   · el rótulo «Pantalla n de 7» va a 12 px (en la referencia, 10,5): la
 *     letra mínima de la célula es 12
 *
 * NO CALIFICA y no da FP: es Aprender. Clases con el prefijo `ekx-`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* (4) Tokens del producto. El kárdex no tiene lados: aquí no hay teal ni ámbar. Coral solo para el error. */
export const CSS_KX = `
.ekx { --texto: #F8F9FA; --atenuado: #A8B6C8; --neutro: #B8C4D4; --coral: #E76F51; --coral-texto: #EE8266;
  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  position: relative; display: grid; gap: 12px; color: var(--texto); font: 400 15px/1.5 "Inter", system-ui, sans-serif; min-width: 0; }
.ekx * { box-sizing: border-box; }
.ekx :focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }
.ekx [hidden] { display: none !important; }
.ekx-cejilla { margin: 0; font: 700 12px/1.3 "Sora", "Inter", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: var(--atenuado); }
.ekx-txt { margin: 0; font-size: 15px; line-height: 1.5; outline: none; }
.ekx-pie { margin: 0; font-size: 12px; color: var(--atenuado); }
.ekx-num { font-family: var(--mono); font-variant-numeric: tabular-nums; }
.ekx-hundido { background: rgba(10,20,34,.45); border: 1px solid rgba(248,249,250,.12); border-radius: 12px; }
.ekx-solo-lector { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.ekx-pastilla { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px 2px 6px; border-radius: 999px; font: 600 12px/1.3 "Inter", sans-serif; white-space: nowrap; }
.ekx-pastilla svg { width: 16px; height: 16px; flex: none; }
.ekx-pastilla.ok { color: var(--texto); border: 1px solid var(--texto); }
.ekx-pastilla.mal { color: var(--coral-texto); border: 1px solid var(--coral); }
.ekx-fig { display: grid; gap: 8px; transition: opacity .2s; min-width: 0; }
.ekx.dormida .ekx-fig { opacity: .55; }
.ekx-metodo { margin: 0; font: 600 14px/1.3 "Sora", sans-serif; }
.ekx-dia { margin: 0; justify-self: start; padding: 5px 12px; border: 1px solid var(--neutro); border-radius: 999px; font: 600 13px/1.3 "Inter", sans-serif; }
.ekx-dia.espera { border-style: dashed; }
/* La tabla: filas y columnas reales. A menos de 560 px de contenido, Entradas y Salidas comparten columna. */
.ekx-tabla { display: grid; padding: 4px 10px 6px; }
.ekx-fila { display: grid; grid-template-columns: 40px minmax(0, .9fr) minmax(0, 1.1fr); column-gap: 8px; padding: 6px 0; border-top: 1px solid rgba(248,249,250,.12); align-items: start; }
.ekx-tabla.ancho .ekx-fila { grid-template-columns: 60px repeat(3, minmax(0, 1fr)); }
.ekx-cab { border-top: 0; padding: 4px 0 6px; font: 600 12px/1.3 "Inter", sans-serif; color: var(--atenuado); }
.ekx-f { font: 600 12px/1.6 "Inter", sans-serif; color: var(--atenuado); white-space: nowrap; }
.ekx-c { display: grid; gap: 4px; min-width: 0; }
.ekx-tag { font: 600 12px/1.3 "Inter", sans-serif; color: var(--atenuado); }
.ekx-capa { display: grid; grid-template-columns: minmax(0, 1fr); padding: 2px 0; font-size: 13px; line-height: 1.35; text-align: left; }
.ekx-cu { white-space: nowrap; color: var(--texto); font-size: 13px; }
.ekx-tot { justify-self: end; white-space: nowrap; color: var(--atenuado); font-size: 13px; }
.ekx-fila.nueva { animation: ekx-entra .3s cubic-bezier(.3,.9,.4,1) .35s both; }
@keyframes ekx-entra { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
.ekx-fila.pendiente .ekx-f { color: var(--texto); }
/* El hueco de lo que espera respuesta: punteado neutro, nunca un color. */
.ekx-hueco { display: block; min-height: 38px; border: 2px dashed rgba(184,196,212,.6); border-radius: 8px; }
.ekx-hueco-cu { display: inline-block; vertical-align: middle; min-height: 22px; width: 52px; }
.ekx-vuelo { position: absolute; z-index: 5; pointer-events: none; padding: 4px 6px; border: 2px solid var(--texto); border-radius: 8px; background: #1F2D3D; display: grid; }
.ekx-vuelo .ekx-capa { padding: 0; }
/* Las fichas (K-1: también en PEPS y UEPS). Botones de 44 px. */
.ekx-fichas { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }
.ekx-ficha { min-height: 44px; display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 4px 8px; border: 1px solid rgba(248,249,250,.35); border-radius: 10px; background: transparent; color: var(--texto); font-size: 14px; cursor: pointer; padding: 6px 4px; }
.ekx-ficha.mal { border: 2px solid var(--coral); }
.ekx-ficha.pista { border: 2px solid var(--texto); }
.ekx-ficha-vuelo { display: block; padding: 6px 8px; font-size: 14px; }
/* Lado a lado: cada método es una fila que se toca. Arriba, los tres rubros de Near. */
.ekx-lado { display: grid; padding: 8px 10px 10px; gap: 6px; }
.ekx-l-cab, .ekx-l-vals { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 8px; }
.ekx-l-cab span { font-size: 12px; line-height: 1.3; color: var(--atenuado); }
.ekx-l-met { min-height: 44px; display: grid; gap: 4px; padding: 7px 9px; border: 1px solid rgba(248,249,250,.35); border-radius: 10px; background: transparent; color: var(--texto); font: inherit; cursor: pointer; text-align: left; }
.ekx-l-met[aria-disabled="true"] { cursor: default; }
.ekx-l-tit { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; font: 600 13px/1.3 "Inter", sans-serif; }
.ekx-l-met.mal { border: 2px solid var(--coral); padding: 6px 8px; }
.ekx-l-met.pista, .ekx-l-met.bien { border: 2px solid var(--texto); padding: 6px 8px; }
.ekx-l-v { font-size: 13px; padding: 2px 3px; border-radius: 6px; }
.ekx-lado.resuelto .ekx-l-v.igual { outline: 2px solid var(--texto); outline-offset: -2px; }
.ekx-lado.resuelto .ekx-l-met:not(.bien) { opacity: .62; }
.ekx-debajo { margin: 0; font-size: 13px; color: var(--atenuado); }
.ekx-lista { margin: 0; padding: 10px 12px 10px 28px; display: grid; gap: 6px; font-size: 14px; border-left: 3px solid var(--neutro); }
.ekx-sig { list-style: none; margin-left: -16px; color: var(--atenuado); font-size: 13px; }
/* El mensaje: fondo neutro al 12 % y raya izquierda de 3 px, neutra o coral. */
.ekx-msg { margin: 0; padding: 10px 12px; background: rgba(184,196,212,.12); border-left: 3px solid var(--neutro); border-radius: 0 10px 10px 0; font-size: 14px; line-height: 1.45; outline: none; }
.ekx-msg:empty { display: none; }
.ekx-msg.mal { border-left-color: var(--coral); }
.ekx-msg .ekx-pastilla { margin-right: 6px; vertical-align: 1px; }
.ekx-msg p { margin: 0; } .ekx-msg p + p { margin-top: 6px; }
.ekx-porque { margin-top: 6px; min-height: 44px; padding: 0 14px; border: 1px solid rgba(248,249,250,.35); border-radius: 999px; background: transparent; color: var(--texto); font: 600 13px/1 "Inter", sans-serif; cursor: pointer; }
.ekx-seguir { width: 100%; min-height: 44px; border: 0; cursor: pointer; font: 700 14px/1.2 "Sora", sans-serif; padding: 12px 16px; background: var(--neutro); color: #1D3557; border-radius: 12px; }
.ekx-seguir[aria-disabled="true"] { background: transparent; color: var(--atenuado); border: 2px solid rgba(184,196,212,.35); cursor: default; }
/* El deslizador de fechas: pista de 6 px y pulgar con caja de 44 × 44 (disco visible de 26). */
.ekx-rango { -webkit-appearance: none; appearance: none; display: block; width: 100%; height: 44px; margin: 0; background: transparent; cursor: pointer; }
.ekx-rango::-webkit-slider-runnable-track { height: 6px; border-radius: 3px; background: rgba(248,249,250,.14); }
.ekx-rango::-moz-range-track { height: 6px; border-radius: 3px; background: rgba(248,249,250,.14); }
.ekx-rango::-webkit-slider-thumb { -webkit-appearance: none; width: 44px; height: 44px; margin-top: -19px; border: 0; border-radius: 50%;
  background: radial-gradient(circle at center, #F8F9FA 0 8px, #1F2D3D 8px 11px, #B8C4D4 11px 13px, transparent 13.5px); }
.ekx-rango::-moz-range-thumb { width: 44px; height: 44px; border: 0; border-radius: 50%;
  background: radial-gradient(circle at center, #F8F9FA 0 8px, #1F2D3D 8px 11px, #B8C4D4 11px 13px, transparent 13.5px); }
.ekx-rango[aria-disabled="true"] { opacity: .45; cursor: default; }
.ekx-rango:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; border-radius: 22px; }
.ekx-marcas { position: relative; height: 8px; margin-top: -10px; pointer-events: none; }
.ekx-marcas i { position: absolute; top: 0; width: 2px; height: 8px; margin-left: -1px; background: var(--neutro); border-radius: 1px; }
@media (prefers-reduced-motion: reduce) { .ekx *, .ekx *::before, .ekx *::after { animation: none !important; transition: none !important; } }
`;

export const reducido = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

/* ═══════════ LAS PANTALLAS, DE LOS DATOS DE NEAR ═══════════ */

const DE_NEAR = (id) => PIEZA_EL_KARDEX.pantallas.find((p) => p.id === id);
export const FECHAS_KX = KARDEX_A3.peps.filas.map((f) => f.f);
/* Las líneas de la figura de «los datos» de Near: una por fecha (la del día, sobre la tabla). */
export const MOV_KX = DE_NEAR("los-datos").figuras[0].filas;
export const ULTIMA_KX = FECHAS_KX.length - 1;
const junto = (...t) => t.filter(Boolean).join(" ");

/* K-1: las fichas de Mello, en el orden de pantalla; la devolución de Near por su id, o la de Mello si es nueva. */
function fichasK1(metodo, near) {
  const porId = Object.fromEntries(FICHAS_K1[metodo].map((f) => [f.id, f]));
  return ORDEN_EN_PANTALLA[metodo].map((id) => {
    const f = porId[id];
    const o = near.opciones.find((x) => x.id === id);
    return { id, t: f.texto, correcta: Boolean(f.correcta), devolucion: f.devolucion ?? o?.devolucion ?? null };
  });
}

function pantallasKX() {
  const portada = DE_NEAR("portada");
  const datos = DE_NEAR("los-datos");
  const peps = DE_NEAR("peps");
  const ueps = DE_NEAR("ueps");
  const prom = DE_NEAR("promedio");
  const lado = DE_NEAR("lado-a-lado");
  const resumen = DE_NEAR("resumen");
  return [
    { id: portada.id, texto: portada.objetivo, metodo: "peps", idx: 0, boton: portada.boton, pie: portada.pie },
    { id: datos.id, texto: datos.parrafos.join(" "), metodo: "peps", idx: 0, rango: [0, 1], listo: (s) => s.visto >= 1, debajo: datos.despues[0], pie: datos.pie },
    {
      id: peps.id, texto: junto(...peps.parrafos, peps.pregunta), metodo: "peps", idx: 1, espera: 2,
      fichas: fichasK1("peps", peps), pista: peps.pista, bien: peps.acierto.texto, listo: (s) => s.resuelto && s.visto >= ULTIMA_KX, pie: peps.pie,
    },
    {
      id: ueps.id, texto: ueps.pregunta, metodo: "ueps", idx: 3, espera: 4,
      fichas: fichasK1("ueps", ueps), pista: ueps.pista, bien: ueps.acierto.texto, listo: (s) => s.resuelto, pie: ueps.pie,
    },
    {
      id: prom.id, texto: junto(...prom.parrafos, prom.pregunta), metodo: "promedio", idx: 2, espera: 3, huecoCosto: true,
      fichas: prom.opciones.map((o) => ({ id: o.id, t: o.texto, correcta: o.correcta, devolucion: o.devolucion ?? null })),
      pista: prom.pista, bien: prom.acierto.texto, porque: prom.acierto.porque, listo: (s) => s.resuelto, pie: prom.pie,
    },
    {
      id: lado.id, texto: lado.pregunta, metodo: "peps", idx: ULTIMA_KX,
      tabla: { nombre: lado.tabla.nombre, filas: lado.tabla.filas.map((f) => [f.rubro, f.valores]) },
      /* Los métodos: el rótulo de la tabla de Near, en el orden de sus opciones. */
      metodos: lado.opciones.map((o, k) => ({ id: o.id, t: lado.tabla.metodos[k], correcta: o.correcta, devolucion: o.devolucion ?? null })),
      pista: lado.pista, bien: lado.acierto.texto, porque: PORQUE_LADO_A_LADO, porqueALaVista: true, listo: (s) => s.resuelto, pie: lado.pie,
    },
    { id: resumen.id, texto: "", metodo: "peps", idx: ULTIMA_KX, rango: [0, ULTIMA_KX], boton: ROTULOS_W.siguientePieza, lista: resumen.lista, siguiente: resumen.siguiente, pie: resumen.pie },
  ];
}

/* La pieza que publica la vista: el mismo id, número y título que la de hoy. */
export const PIEZA_KARDEX_C2 = {
  id: PIEZA_EL_KARDEX.id,
  numero: PIEZA_EL_KARDEX.numero,
  titulo: PIEZA_EL_KARDEX.titulo,
  pantallas: pantallasKX(),
};

/* ═══════════ LO QUE SE VE ═══════════ */

export const listoKX = (P, s) => Boolean(P.boton) || (P.listo ? P.listo(s) : true);

/*
 * El mensaje de la pantalla. Sin resolver: la escalera (1.er error, la pista;
 * 2.º, la devolución de lo tocado). Resuelta: K-2 de Mello.
 */
export function mensajeKX(P, s) {
  if (!s.resuelto) {
    if (!s.errores) return null;
    const tocada = (P.fichas ?? P.metodos).find((x) => x.id === s.intento);
    return s.errores >= 2 ? { tipo: "devolucion", t: tocada?.devolucion || P.pista } : { tipo: "error", t: P.pista };
  }
  if (P.espera === undefined || s.idx === P.espera) return { tipo: "acierto", t: P.bien, porque: P.porque ?? null, vista: Boolean(P.porqueALaVista) };
  if (!listoKX(P, s)) return { tipo: "sigue", t: SIGUE_HASTA_EL_20 };
  return null;
}

const ICONO = {
  ok: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>,
  mal: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>,
};
const Pastilla = ({ ok }) => (
  <span className={`ekx-pastilla ${ok ? "ok" : "mal"}`} data-pastilla={ok ? "ok" : "mal"}>{ok ? ICONO.ok : ICONO.mal}{ok ? ROTULOS_W.correcto : ROTULOS_W.noVaAqui}</span>
);

const capaTxt = (c) => `${c[0]} × ${cifraK(c[1])}`;
const totalSaldo = (m, i) => KARDEX_A3[m].filas[i].sal.reduce((n, c) => n + c[2], 0);

/* El total que cuenta hasta su valor nuevo (600 ms): cambia el texto, no la geometría. */
function TotalQueCuenta({ desde, hasta, ms = 600 }) {
  const animar = desde !== null && desde !== undefined && !reducido() && typeof window !== "undefined" && typeof window.requestAnimationFrame === "function";
  const [v, setV] = useState(animar ? desde : hasta);
  useEffect(() => {
    if (!animar) { setV(hasta); return undefined; }
    let vivo = true;
    const t0 = performance.now();
    const paso = (t) => {
      if (!vivo) return;
      const k = Math.min(1, Math.max(0, (t - t0) / ms));
      const e = 1 - Math.pow(1 - k, 3);
      setV(Math.round(desde + (hasta - desde) * e));
      if (k < 1) window.requestAnimationFrame(paso);
    };
    window.requestAnimationFrame(paso);
    return () => { vivo = false; };
  }, [animar, desde, hasta, ms]);
  return <span className="ekx-num ekx-tot" data-total>{cifraK(v)}</span>;
}

function Capa({ c, saldo, cuenta }) {
  return (
    <span className="ekx-capa" data-capa={capaTxt(c)} data-saldo={saldo ?? undefined}>
      <span className="ekx-num ekx-cu">{capaTxt(c)}</span>
      {cuenta ? <TotalQueCuenta desde={cuenta.desde} hasta={c[2]} /> : <span className="ekx-num ekx-tot">{cifraK(c[2])}</span>}
    </span>
  );
}

/* Una fila del kárdex. «pendiente»: la que espera respuesta (con el hueco punteado). */
function Fila({ metodo, i, ancho, pendiente = false, huecoCosto = false, nueva = false, cuenta = null }) {
  const F = KARDEX_A3[metodo].filas[i];
  const entra = Boolean(F.en) || huecoCosto;
  const mov = pendiente && !huecoCosto
    ? [<span key="h" className="ekx-hueco" data-hueco />]
    : (F.en || F.sa || []).map((c, k) => <Capa key={k} c={c} />);
  const saldo = huecoCosto
    ? (
      <span className="ekx-capa">
        <span className="ekx-num ekx-cu">{`${F.sal[0][0]} × `}<span className="ekx-hueco ekx-hueco-cu" data-hueco-cu /></span>
        <span className="ekx-num ekx-tot" />
      </span>
    )
    : pendiente ? null : F.sal.map((c, k) => <Capa key={k} c={c} saldo={k} cuenta={cuenta && F.sal.length === 1 ? cuenta : null} />);
  return (
    <div className={`ekx-fila${nueva ? " nueva" : ""}${pendiente ? " pendiente" : ""}`} role="row" data-fila={i} data-pendiente={pendiente || undefined}>
      <div className="ekx-c ekx-f" role="rowheader">{FECHAS_KX[i]}</div>
      {ancho ? (
        <>
          <div className="ekx-c" role="cell" data-bloque="entradas">{entra ? mov : null}</div>
          <div className="ekx-c" role="cell" data-bloque="salidas">{!entra ? mov : null}</div>
        </>
      ) : (
        <div className="ekx-c" role="cell" data-bloque={entra ? "entradas" : "salidas"}>
          {/* El 1 de julio no entra ni sale nada: sin marca (la referencia le pone «Sale»). [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION */}
          {(entra || F.sa || pendiente) && <span className="ekx-tag">{entra ? ROTULOS_W.entra : ROTULOS_W.sale}</span>}
          {mov}
        </div>
      )}
      <div className="ekx-c ekx-saldo" role="cell" data-bloque="saldo">{saldo}</div>
    </div>
  );
}

function Tabla({ P, s, ancho, esperando }) {
  const filas = [];
  for (let i = 0; i <= s.idx; i++) {
    const nueva = s.anim.nueva === i;
    filas.push(<Fila key={`${s.anim.n}-${i}`} metodo={P.metodo} i={i} ancho={ancho} nueva={nueva} cuenta={nueva ? { desde: s.anim.desde } : null} />);
  }
  if (esperando) filas.push(<Fila key={`p-${P.espera}`} metodo={P.metodo} i={P.espera} ancho={ancho} pendiente huecoCosto={Boolean(P.huecoCosto)} />);
  return (
    <div className={`ekx-tabla ekx-hundido${ancho ? " ancho" : ""}`} role="table" aria-label={ROTULOS_W.kardex} data-tabla={P.metodo}>
      <div className="ekx-fila ekx-cab" role="row">
        <div role="columnheader">{ROTULOS_W.fecha}</div>
        {ancho
          ? [<div key="e" role="columnheader">{ROTULOS_W.entradas}</div>, <div key="s" role="columnheader">{ROTULOS_W.salidas}</div>]
          : <div role="columnheader">{ROTULOS_W.entraOSale}</div>}
        <div role="columnheader">{ROTULOS_W.saldo}</div>
      </div>
      {filas}
    </div>
  );
}

/* Vuelo de lo tocado: una copia viaja de un sitio a otro (solo transform). Sin animación posible, no vuela. */
function volar(raiz, desde, hacia, contenido, ms) {
  if (reducido() || !raiz || !desde || !hacia || typeof desde.animate !== "function") return Promise.resolve();
  const r0 = raiz.getBoundingClientRect();
  const a = desde.getBoundingClientRect();
  const b = hacia.getBoundingClientRect();
  const g = document.createElement("div");
  g.className = "ekx-vuelo";
  g.setAttribute("aria-hidden", "true");
  g.dataset.vuelo = contenido.dato;
  g.innerHTML = contenido.html;
  g.style.cssText = `left:${a.left - r0.left}px;top:${a.top - r0.top}px;width:${a.width}px;`;
  raiz.appendChild(g);
  const an = g.animate([{ transform: "translate(0,0)" }, { transform: `translate(${b.left - a.left}px,${b.top - a.top}px)` }], { duration: ms, easing: "cubic-bezier(.3,.9,.4,1)", fill: "forwards" });
  return Promise.resolve(an?.finished).catch(() => {}).then(() => g.remove());
}
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const capaHTML = (c) => `<span class="ekx-capa"><span class="ekx-num ekx-cu">${esc(capaTxt(c))}</span><span class="ekx-num ekx-tot">${esc(cifraK(c[2]))}</span></span>`;

/* ═══════════ UNA PANTALLA ═══════════ */

const inicial = (P) => ({ idx: P.idx, visto: P.idx, resuelto: false, errores: 0, intento: null, pista: false, abierto: false, respondio: 0, anim: { nueva: null, desde: null, n: 0 } });

/* Ir a una fecha: solo un paso exacto hacia adelante se anima. */
function irA(x, P, i) {
  const paso = i === x.idx + 1 && !reducido();
  return { ...x, idx: i, visto: Math.max(x.visto, i), anim: { nueva: paso ? i : null, desde: paso ? totalSaldo(P.metodo, x.idx) : null, n: x.anim.n + 1 } };
}

function Pantalla({ P, numero, total, enfocar, onSeguir, barajarOpciones }) {
  const [s, setS] = useState(() => inicial(P));
  /* Lote V (Mello): las opciones, barajadas UNA vez al montar la pantalla (como los Hacer de T7 al armar la tanda); el orden no cambia al reintentar. `barajar` se inyecta en las pruebas. */
  /* Los métodos llevan su columna (k) para leer sus cifras en la tabla. */
  const [fichas] = useState(() => (P.fichas ? barajarOpciones(P.fichas) : null));
  const [metodos] = useState(() => (P.metodos ? barajarOpciones(P.metodos.map((x, k) => ({ x, k }))) : null));
  const [ancho, setAncho] = useState(false);
  const raiz = useRef(null);
  const txt = useRef(null);
  const msg = useRef(null);
  const ocupado = useRef(false);
  const esperando = P.espera !== undefined && !s.resuelto;
  const dormida = P.id === "portada";

  useEffect(() => { if (enfocar) txt.current?.focus({ preventScroll: true }); }, [enfocar]);
  /* Al responder, el foco va al mensaje. */
  useEffect(() => { if (s.respondio) msg.current?.focus({ preventScroll: true }); }, [s.respondio]);
  /* Cuatro columnas cuando el contenido mide 560 px o más. */
  useLayoutEffect(() => {
    const el = raiz.current;
    if (!el) return undefined;
    const medir = () => setAncho(el.clientWidth >= 560);
    medir();
    if (typeof ResizeObserver !== "function") return undefined;
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const acierta = (x) => ({ ...irA({ ...x, resuelto: true, intento: null, pista: false }, P, P.espera ?? x.idx), respondio: x.respondio + 1 });
  const falla = (x, id) => {
    const errores = x.errores + 1;
    return { ...x, errores, intento: id, pista: errores >= 2, respondio: x.respondio + 1 };
  };

  const tocarFicha = async (f, boton) => {
    if (s.resuelto || ocupado.current) return;
    ocupado.current = true;
    try {
      const r = raiz.current;
      if (f.correcta && !P.huecoCosto) {
        /* Mira esto: las capas que salen viajan del Saldo al hueco de Salidas. */
        const sale = KARDEX_A3[P.metodo].filas[P.espera].sa;
        const hueco = r.querySelector("[data-hueco]");
        const fuente = (c) => [...r.querySelectorAll(`[data-fila="${s.idx}"] [data-saldo]`)].find((n) => n.dataset.capa.endsWith(`× ${cifraK(c[1])}`));
        await Promise.all(sale.map((c) => volar(r, fuente(c), hueco, { html: capaHTML(c), dato: capaTxt(c) }, 400)));
      } else {
        const hueco = r.querySelector(P.huecoCosto ? "[data-hueco-cu]" : "[data-hueco]");
        await volar(r, boton, hueco, { html: `<span class="ekx-num ekx-ficha-vuelo">${esc(f.t)}</span>`, dato: f.t }, 320);
      }
      setS((x) => (x.resuelto ? x : f.correcta ? acierta(x) : falla(x, f.id)));
    } finally {
      ocupado.current = false;
    }
  };
  const tocarMetodo = (m) => setS((x) => (x.resuelto ? x : m.correcta ? acierta(x) : falla(x, m.id)));
  const [a, b] = P.rango ?? (s.resuelto ? [0, ULTIMA_KX] : [s.idx, s.idx]);
  const quieto = a === b;
  const mover = (i) => {
    if (quieto) return;
    const j = Math.min(b, Math.max(a, i));
    setS((x) => (j === x.idx ? x : irA(x, P, j)));
  };

  const m = mensajeKX(P, s);
  const listo = listoKX(P, s);
  const nombreBoton = P.boton === BOTON.empezar ? "empezar" : P.boton ? "siguiente-pieza" : "seguir";
  const res = s.resuelto;

  return (
    <div ref={raiz} className={`ekx${dormida ? " dormida" : ""}`} data-kx={P.id}>
      <p className="ekx-cejilla" aria-hidden="true">{ROTULOS_W.pantalla(numero, total)}</p>
      <p className="ekx-txt" tabIndex={-1} ref={txt} data-texto hidden={!P.texto}>{P.texto}</p>
      <div className="ekx-fig" data-figura>
        <p className="ekx-metodo" hidden={Boolean(P.tabla)} data-metodo>{KARDEX_A3[P.metodo].titulo}</p>
        <p className={`ekx-dia${esperando ? " espera" : ""}`} aria-live="polite" hidden={Boolean(P.tabla)} data-dia>{MOV_KX[esperando ? P.espera : s.idx]}</p>
        {!P.tabla && <Tabla P={P} s={s} ancho={ancho} esperando={esperando} />}
        {P.fichas && !res && (
          <div className="ekx-fichas" role="group" aria-label={P.huecoCosto ? ROTULOS_W.costoPromedio : ROTULOS_W.salidas} data-fichas>
            {fichas.map((f) => {
              const mal = s.intento === f.id;
              const pista = s.pista && f.correcta;
              return (
                <button
                  key={f.id} type="button" className={`ekx-ficha ekx-num${mal ? " mal" : ""}${pista ? " pista" : ""}`} data-ficha={f.id}
                  aria-label={`${f.t}${mal ? `. ${INTERFAZ.incorrecto}` : ""}`} onClick={(e) => tocarFicha(f, e.currentTarget)}
                >
                  {f.t}{mal && <Pastilla ok={false} />}
                </button>
              );
            })}
          </div>
        )}
        {P.tabla && (
          <div className={`ekx-lado ekx-hundido${res ? " resuelto" : ""}`} role="group" aria-label={P.tabla.nombre} data-lado>
            <div className="ekx-l-cab" aria-hidden="true">{P.tabla.filas.map(([rubro]) => <span key={rubro}>{rubro}</span>)}</div>
            {metodos.map(({ x, k }) => {
              const mal = !res && s.intento === x.id;
              const pista = !res && s.pista && x.correcta;
              const bien = res && x.correcta;
              const lector = P.tabla.filas.map(([rubro, v]) => `${rubro}: ${cifraK(v[k])}`).join("; ");
              const estado = mal ? `. ${INTERFAZ.incorrecto}` : bien ? `. ${INTERFAZ.correcto}` : "";
              return (
                <button
                  key={x.id} type="button" className={`ekx-l-met${mal ? " mal" : ""}${pista ? " pista" : ""}${bien ? " bien" : ""}`} data-metodo-lado={x.id}
                  aria-disabled={res ? "true" : undefined} aria-label={`${x.t}. ${lector}${estado}`} onClick={() => tocarMetodo(x)}
                >
                  <span className="ekx-l-tit">{x.t}{mal && <Pastilla ok={false} />}{bien && <Pastilla ok />}</span>
                  <span className="ekx-l-vals" aria-hidden="true">
                    {P.tabla.filas.map(([rubro, v], r) => <span key={rubro} className={`ekx-num ekx-l-v${bien && r !== 1 ? " igual" : ""}`} data-valor={rubro}>{cifraK(v[k])}</span>)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <div className="ekx-control" hidden={Boolean(P.tabla) || dormida}>
          <input
            className="ekx-rango" type="range" min={0} max={ULTIMA_KX} step="1" value={s.idx}
            aria-label={ROTULOS_W.fecha} aria-valuetext={MOV_KX[s.idx]} aria-disabled={quieto ? "true" : "false"} tabIndex={quieto ? -1 : 0}
            data-rango={`${a}-${b}`} onChange={(e) => mover(Number(e.target.value))}
          />
          <div className="ekx-marcas" aria-hidden="true">
            {FECHAS_KX.map((f, i) => <i key={f} style={{ left: `calc(22px + (100% - 44px) * ${i / ULTIMA_KX})` }} />)}
          </div>
        </div>
        {P.debajo && <p className="ekx-debajo" data-debajo>{P.debajo}</p>}
        {P.lista && (
          <ul className="ekx-lista" data-lista>
            {P.lista.map((x) => <li key={x}>{x}</li>)}
            <li className="ekx-sig">{P.siguiente}</li>
          </ul>
        )}
      </div>
      <div className={`ekx-msg${m && (m.tipo === "error" || m.tipo === "devolucion") ? " mal" : ""}`} role="status" tabIndex={-1} ref={msg} data-mensaje={m?.tipo}>
        {m && (
          <>
            <p data-mensaje-texto>
              {m.tipo === "acierto" && <Pastilla ok />}
              {(m.tipo === "error" || m.tipo === "devolucion") && <span className="ekx-solo-lector">{`${INTERFAZ.incorrecto} `}</span>}
              {m.t}
            </p>
            {m.porque && !m.vista && (
              <button type="button" className="ekx-porque" data-boton="por-que" aria-expanded={s.abierto} aria-controls={`ekx-porque-${P.id}`} onClick={() => setS((x) => ({ ...x, abierto: !x.abierto }))}>
                {POR_QUE}
              </button>
            )}
            {m.porque && <p id={`ekx-porque-${P.id}`} data-porque hidden={!m.vista && !s.abierto}>{m.porque}</p>}
          </>
        )}
      </div>
      <p className="ekx-pie" data-pie>{P.pie}</p>
      <button type="button" className="ekx-seguir" data-boton={nombreBoton} aria-disabled={listo ? "false" : "true"} onClick={listo ? onSeguir : undefined}>
        {P.boton ?? BOTON.seguir}
      </button>
    </div>
  );
}

/* ═══════════ LA PIEZA ═══════════ */

export default function ElKardexQueCrece({ pieza = PIEZA_KARDEX_C2, rotulo, barajar: barajarOpciones = barajar }) {
  const [k, setK] = useState(0);
  const [movido, setMovido] = useState(false);
  const marco = useRef(null);
  const p = pieza.pantallas[k];
  const ultima = k === pieza.pantallas.length - 1;
  const seguir = () => {
    if (!ultima) { setMovido(true); setK((x) => x + 1); return; }
    /* «Siguiente pieza»: la que sigue en la vista del tema. */
    const sig = marco.current?.closest("section")?.parentElement?.nextElementSibling?.querySelector("[data-pieza]");
    if (sig) { sig.scrollIntoView?.({ behavior: reducido() ? "auto" : "smooth", block: "start" }); sig.focus?.({ preventScroll: true }); }
  };
  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_KX}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-pantalla={p.id} style={{ outline: "none" }}>
        <Pantalla key={p.id} P={p} numero={k + 1} total={pieza.pantallas.length} enfocar={movido} onSeguir={seguir} barajarOpciones={barajarOpciones} />
      </div>
    </Panel>
  );
}

