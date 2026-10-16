import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { pesos, DEBE, HABER } from "../../../../data/contabilidad.js";
import { H2, FICHAS_H2, BOTON_H2, LADOS_H2, CIFRAS_H2, DONDE_H2, FACTURA_H2, ENUNCIADO_H2, resumenH2 } from "../../../../data/contabilidadT7_1_h2.js";
import { prepararH2, idDeLinea, puntuarH2, TOTAL_H2, devolucionH2, renglonH2 } from "../../../../contabilidad/t7H2.js";
import { retroDeLinea, sinUnSoloIntento, TEXTOS_ARMA } from "../../../../contabilidad/armaLaLinea.js";
import { formatearCifra, leerCifra } from "../../../../contabilidad/elCierreCompleto.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { ContadorConIntento } from "./armaLaLinea.jsx";
import { Plegable } from "./plegable.jsx";
import {
  Pastilla, CORRECTA, TACHADA, REVELADA, CSS_B5H, CLASE_B5H, LECTOR_INCORRECTO, ibaAquiCon, COMPROBAR_B,
} from "../b5/Devolucion.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · HACER 2 · ARMA LA FACTURA (Célula C) — «la factura que se arma».
 *
 * Patrón de enganche C2 de Watari (patron-enganche-c2-v1.html, sección
 * «factura»), con las correcciones obligatorias de Mello
 * (auditoria-mello-patron-c2.md §3):
 *
 *   · Dos facturas (compra y venta) con la cabecera de los cinco datos de
 *     Near y sus renglones: mercancía, + IVA, − retención, = total. Cada
 *     cálculo (ítems 1, 2, 3 y 5) es la casilla de su renglón: al teclear, la
 *     cifra toma formato y la barra de la factura cambia en el acto.
 *   · La casilla es el MISMO nodo <input> de la primera tecla a «Comprobar»
 *     (condición 4 de Mello: en un teléfono no puede perder el foco ni cerrar
 *     el teclado). React solo cambia su valor; nada la remonta.
 *   · Los asientos (ítems 4 y 6): al entrar, los cuatro renglones viajan a
 *     sus líneas (400 ms cada uno, 90 ms entre uno y otro; con movimiento
 *     reducido no viajan). En cada línea, la cuenta (la buena y los dos
 *     distractores de Near, barajados) y el lado.
 *   · Fa-1: el IVA y la retención de la venta se ven «—» hasta que se
 *     responde el ítem 5 (renglonH2).
 *   · Fa-2: en el ítem 1, a la vista solo la frase del periódico y el
 *     párrafo de las tarifas; los párrafos 1, 2 y 4, en «Ver el enunciado».
 *     Desde el ítem 2, el enunciado de Near entero va plegado (C2).
 *
 * Dialecto de Hacer (b5/Devolucion.jsx): «Correcto», «No va aquí» e «Iba
 * aquí: $…» a los 0,7 s sobre la pieza donde iba; «Ítem n de 6»; «Siguiente
 * ítem» y «Ver mi resumen»; Debe en teal y Haber en ámbar (solo los lados);
 * el acierto con borde de 2 px #F8F9FA, nunca en teal.
 *
 * La evaluación es la de antes: seis ítems, doce unidades, un intento por
 * unidad, sin arrastre. Al terminar: onCompletar(pct, ms, detalle).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const P = "fae-c2f";
const RENGLONES = ["mercancia", "iva", "ret", "total"];
const SIGNO = { mercancia: "", iva: "+", ret: "−", total: "=" };
/* La escala común de las dos barras: el total con IVA de la venta. */
const ESCALA = CIFRAS_H2.venta + CIFRAS_H2.ivaVenta;
export const anchoDeBarra = (n) => Math.max(0, Math.min(1.25, (n ?? 0) / ESCALA));
export const VUELO_MS = 400;
export const ENTRE_VUELOS_MS = 90;
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export const CSS_C2F = `
.${P} { display: grid; gap: 12px; min-width: 0; color: ${FAE.text}; font-family: Inter, sans-serif; }
.${P} * { box-sizing: border-box; }
.${P} [data-encabezado] { margin: 0 !important; }
.${P}-enunciado p { margin: 0 0 6px; font-size: 14px; line-height: 1.5; }
.${P}-enunciado p:last-child { margin-bottom: 0; }
.${P}-ver { justify-self: start; min-height: 44px; padding: 0 14px; border: 1px solid rgba(248,249,250,0.35); border-radius: 999px; background: transparent; color: ${FAE.text}; font: 600 13px/1 Inter, sans-serif; cursor: pointer; }
.${P}-figs { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); }
.${P}-factura { padding: 10px 12px 12px; display: grid; gap: 8px; align-content: start; min-width: 0; border-radius: 12px; background: rgba(10,20,34,0.45); border: 1px solid rgba(248,249,250,0.12); }
.${P}-factura:not(.activa) { opacity: .62; }
.${P}-fcab { display: flex; justify-content: space-between; gap: 8px; padding-bottom: 6px; border-bottom: 2px solid #B8C4D4; font: 600 13px/1.3 Sora, sans-serif; }
.${P}-fcab span + span { font: 400 12px/1.6 Inter, sans-serif; color: #A8B6C8; }
.${P}-datos { margin: 0; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 2px 10px; font-size: 12px; line-height: 1.45; }
.${P}-datos div { display: contents; }
.${P}-datos dt { color: #A8B6C8; }
.${P}-datos dd { margin: 0; overflow-wrap: anywhere; }
.${P}-renglones { display: grid; gap: 4px; }
.${P}-ren { display: grid; grid-template-columns: 14px minmax(0, 1fr) auto; align-items: center; column-gap: 6px; row-gap: 4px; min-height: 30px; font-size: 13px; }
.${P}-ren.total { border-top: 1px solid rgba(248,249,250,0.35); padding-top: 6px; font-weight: 600; }
.${P}-signo { font-family: ${MONO}; color: #A8B6C8; }
.${P}-v { justify-self: end; font-size: 13px; white-space: nowrap; font-family: ${MONO}; font-variant-numeric: tabular-nums; }
.${P}-marca { grid-column: 2 / -1; display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 4px 6px; }
.${P}-ren.activo .${P}-rot { font-weight: 600; }
.${P}-casilla { justify-self: end; width: 128px; min-height: 44px; padding: 0 10px; border: 1px solid rgba(248,249,250,0.35); border-radius: 10px; background: transparent; color: ${FAE.text}; font: 600 15px/1 ${MONO}; text-align: right; font-variant-numeric: tabular-nums; }
.${P}-ren.ok .${P}-v { outline: 2px solid ${FAE.text}; outline-offset: 2px; border-radius: 4px; }
.${P}-ren.mal .${P}-v { outline: 2px solid ${FAE.coral}; outline-offset: 2px; border-radius: 4px; }
.${P}-barra { position: relative; height: 14px; margin-top: 2px; }
.${P}-barra i { position: absolute; top: 0; bottom: 0; left: calc(var(--a) * 80%); width: 80%; transform-origin: left center; transform: scaleX(var(--l)); border-radius: 3px; transition: transform .25s cubic-bezier(.3,.9,.4,1); }
.${P}-barra .m { background: rgba(184,196,212,0.45); }
.${P}-barra .i { border: 1px solid #B8C4D4; }
.${P}-barra .r { background: repeating-linear-gradient(135deg, rgba(31,45,61,0.95) 0 3px, transparent 3px 6px); border-left: 1px solid #B8C4D4; }
.${P}-pregunta { margin: 0; font: 600 15px/1.45 Inter, sans-serif; outline: none; }
.${P}-pie { margin: 4px 0 0; font-size: 12px; color: rgba(248,249,250,0.6); }
.${P}-asiento { padding: 10px 12px; display: grid; gap: 10px; border-radius: 12px; background: rgba(10,20,34,0.45); border: 1px solid rgba(248,249,250,0.12); }
.${P}-acab { margin: 0; padding-bottom: 6px; border-bottom: 2px solid #B8C4D4; font: 600 13px/1.3 Sora, sans-serif; }
.${P}-linea { display: grid; gap: 6px; padding-bottom: 10px; border-bottom: 1px solid rgba(248,249,250,0.12); }
.${P}-lcab { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; }
.${P}-lv { font: 700 14px/1.3 ${MONO}; font-variant-numeric: tabular-nums; }
.${P}-chips { display: grid; gap: 6px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 170px), 1fr)); }
.${P}-chip, .${P}-lado { position: relative; min-height: 44px; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; padding: 6px 10px; border: 1px solid rgba(248,249,250,0.35); border-radius: 10px; background: transparent; color: ${FAE.text}; font: 500 13px/1.3 Inter, sans-serif; text-align: left; cursor: pointer; }
.${P}-chip.elegido, .${P}-lado.elegido { border: 2px solid ${FAE.text}; padding: 5px 9px; }
.${P}-chip.mal, .${P}-lado.mal { border: 2px solid ${FAE.coral}; padding: 5px 9px; }
.${P}-chip[aria-disabled="true"], .${P}-lado[aria-disabled="true"] { cursor: default; }
.${P}-lados { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.${P}-lado { justify-content: center; font-weight: 700; }
.${P}-lado.debe { color: #3FA69A; } /* lado */
.${P}-lado.haber { color: ${FAE.ambar}; } /* lado */
.${P}-lretro { margin: 0; padding: 8px 10px; background: rgba(184,196,212,0.12); border-left: 3px solid ${FAE.coral}; border-radius: 0 8px 8px 0; font-size: 13px; line-height: 1.45; }
.${P}-sumas { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 10px; font: 600 13px/1.3 Inter, sans-serif; padding-top: 4px; }
.${P}-sumas span + span { font-family: ${MONO}; font-variant-numeric: tabular-nums; }
.${P}-msg { margin: 0; padding: 10px 12px; background: rgba(184,196,212,0.12); border-left: 3px solid #B8C4D4; border-radius: 0 10px 10px 0; font-size: 14px; line-height: 1.45; outline: none; }
.${P}-msg.mal { border-left-color: ${FAE.coral}; }
.${P}-msg p { margin: 0; }
.${P}-msg [data-pastilla] { margin-right: 6px; vertical-align: 1px; }
.${P}-solo { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.${P}-vuelo { position: absolute; z-index: 5; pointer-events: none; padding: 2px 6px; border: 2px solid ${FAE.text}; border-radius: 6px; background: #1F2D3D; font: 700 14px/1.3 ${MONO}; }
.${P} [data-responder] button { margin-top: 0 !important; min-height: 44px; }
@media (prefers-reduced-motion: reduce) { .${P} *, .${P} *::before, .${P} *::after { transition: none !important; } }
`;

const reducido = () => {
  try { return Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches); } catch { return false; }
};

export default function ArmaLaFactura({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH2(barajar));
  const [escrito, setEscrito] = useState("");
  const [r, setR] = useState(null);
  const [elegidos, setElegidos] = useState({});
  const [marcas, setMarcas] = useState({});
  const [bien, setBien] = useState(0);
  const [verEnunciado, setVerEnunciado] = useState(false);
  const raiz = useRef(null);
  const mensaje = useRef(null);
  const pregunta = useRef(null);
  const avanzado = useRef(false);

  const item = t.items[t.i];
  const cuantos = t.items.length;
  const fac = item ? DONDE_H2[item.id].factura : null;
  const lineas = item?.tipo === "asiento" ? item.orden.map((id) => item.lineas.find((l) => l.id === id)) : [];
  const valor = leerCifra(escrito);
  const listo = item?.tipo === "cifra" ? valor !== null : lineas.every((l) => elegidos[l.id]?.cuenta && elegidos[l.id]?.lado);
  const resuelto = (id) => { const k = t.items.findIndex((x) => x.id === id); return k < t.i || (k === t.i && Boolean(r)); };

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuarH2(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Al responder, el foco va al mensaje. */
  useEffect(() => { if (r) mensaje.current?.focus({ preventScroll: true }); }, [r]);

  /* Al pasar de ítem: el foco a la casilla (o a la pregunta), y en un asiento los renglones viajan a sus líneas. */
  useLayoutEffect(() => {
    if (!avanzado.current || !item) return;
    avanzado.current = false;
    const caja = raiz.current;
    const c = caja?.querySelector("[data-casilla]");
    (c ?? pregunta.current)?.focus({ preventScroll: true });
    if (item.tipo === "asiento" && caja && !reducido() && typeof caja.animate === "function") viajar(caja, item, fac, lineas);
  }, [t.i]); // eslint-disable-line react-hooks/exhaustive-deps

  const comprobar = () => {
    if (r || !listo) return;
    if (item.tipo === "cifra") {
      const res = devolucionH2(item, valor);
      t.anotar(item.id, res.ok, valor);
      if (res.ok) setBien((n) => n + 1);
      setMarcas((m) => ({ ...m, [item.id]: res.ok }));
      setR({ ...res, valor });
      return;
    }
    const porLinea = {};
    let n = 0;
    for (const l of lineas) {
      const e = elegidos[l.id];
      const ok = e.cuenta === l.cuenta && e.lado === l.lado;
      t.anotar(idDeLinea(item, l), ok, `${e.cuenta}|${e.lado}`);
      if (ok) n += 1;
      porLinea[l.id] = { ok, retro: ok ? null : retroDeLinea(l, e.cuenta) };
    }
    setBien((b) => b + n);
    setR({ lineas: porLinea, n });
  };

  const avanzar = () => {
    setR(null); setEscrito(""); setElegidos({});
    if (t.i + 1 < cuantos) { avanzado.current = true; t.setI(t.i + 1); } else t.setTerminado(true);
  };

  const reiniciar = () => {
    t.reiniciar(); setR(null); setEscrito(""); setElegidos({}); setMarcas({}); setBien(0); setVerEnunciado(false);
  };

  const elegir = (lineaId, cambio) => {
    if (r) return;
    setElegidos((e) => ({ ...e, [lineaId]: { ...e[lineaId], ...cambio } }));
  };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(puntuarH2(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH2(bien, TOTAL_H2)}</p>
        </Cierre>
      </Marco>
    );
  }

  /* ─── Una factura: cabecera de datos, renglones (con la casilla del cálculo en curso) y su barra ─── */
  const factura = (f) => {
    const estado = { resuelto, actual: item.id, escrito: valor };
    const ren = Object.fromEntries(RENGLONES.map((rn) => [rn, renglonH2(f, rn, estado)]));
    const mercancia = ren.mercancia.v;
    const iva = ren.iva.v ?? 0;
    const ret = ren.ret.v ?? 0;
    const nombre = FACTURA_H2.titulos[f];
    return (
      <section key={f} className={`${P}-factura${f === fac ? " activa" : ""}`} data-factura={f} aria-label={`${nombre}, ${FACTURA_H2.fechas[f]}`}>
        <header className={`${P}-fcab`}><span data-titulo-factura>{nombre}</span><span data-fecha>{FACTURA_H2.fechas[f]}</span></header>
        <dl className={`${P}-datos`}>
          {FICHAS_H2.campos.map((c, k) => (
            <div key={c}><dt>{c}</dt><dd>{FICHAS_H2[f].valores[k]}</dd></div>
          ))}
        </dl>
        <div className={`${P}-renglones`}>
          {RENGLONES.map((rn) => {
            const x = ren[rn];
            const rot = rn === "total" ? FACTURA_H2.renglones.total[f] : FACTURA_H2.renglones[rn];
            const ok = x.item ? marcas[x.item.id] : undefined;
            const marcado = ok !== undefined;
            return (
              <div key={rn} data-renglon={`${f}-${rn}`} className={`${P}-ren${rn === "total" ? " total" : ""}${x.activo ? " activo" : ""}${marcado ? (ok ? " ok" : " mal") : ""}`}>
                <span className={`${P}-signo`} aria-hidden="true">{SIGNO[rn]}</span>
                <span className={`${P}-rot`} data-rotulo>{rot}</span>
                {x.activo ? (
                  <input
                    className={`${P}-casilla`}
                    data-casilla={x.item.id}
                    value={escrito}
                    onChange={(e) => setEscrito(formatearCifra(e.target.value))}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); comprobar(); } }}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="$"
                    aria-label={`${x.item.pregunta} ${TEXTOS_ARMA.campo}`}
                  />
                ) : (
                  <span className={`${P}-v`} data-cifra>{x.v != null ? pesos(x.v) : "—"}</span>
                )}
                {marcado && (
                  <span className={`${P}-marca`} data-marca>
                    <Pastilla marca={ok ? CORRECTA : TACHADA} />
                    {!ok && <Pastilla marca={REVELADA} valor={pesos(x.item.correcta)} />}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className={`${P}-barra`} aria-hidden="true" data-barra={f}>
          <i className="m" data-tramo="mercancia" style={{ "--a": 0, "--l": anchoDeBarra(mercancia) }} />
          <i className="i" data-tramo="iva" style={{ "--a": anchoDeBarra(mercancia), "--l": anchoDeBarra(iva) }} />
          <i className="r" data-tramo="ret" style={{ "--a": anchoDeBarra(mercancia + iva - ret), "--l": anchoDeBarra(ret) }} />
        </div>
      </section>
    );
  };

  /* ─── Una línea del asiento: su cifra, la cuenta y el lado ─── */
  const linea = (l) => {
    const el = elegidos[l.id] ?? {};
    const lr = r?.lineas?.[l.id];
    const bloqueo = r ? { "aria-disabled": "true" } : {};
    return (
      <div key={l.id} data-linea={l.id} className={`${P}-linea`}>
        <div className={`${P}-lcab`}>
          <span className={`${P}-lv`} data-l-valor>{pesos(l.valor)}</span>
          {lr && <Pastilla marca={lr.ok ? CORRECTA : TACHADA} />}
        </div>
        <div className={`${P}-chips`} role="group" aria-label={`Cuenta de ${pesos(l.valor)}`}>
          {l.banco.map((c) => {
            const elegido = el.cuenta === c;
            const mal = Boolean(lr) && elegido && c !== l.cuenta;
            const iba = Boolean(lr) && !lr.ok && c === l.cuenta;
            return (
              <button key={c} type="button" data-cuenta={c} aria-pressed={elegido} {...bloqueo}
                className={`${P}-chip${elegido ? " elegido" : ""}${mal ? " mal" : ""}`} onClick={() => elegir(l.id, { cuenta: c })}>
                <span data-nombre>{c}</span>{iba && <Pastilla marca={REVELADA} />}
              </button>
            );
          })}
        </div>
        <div className={`${P}-lados`} role="group" aria-label={`Lado de ${pesos(l.valor)}`}>
          {[DEBE, HABER].map((ld) => {
            const elegido = el.lado === ld;
            const mal = Boolean(lr) && elegido && ld !== l.lado;
            const iba = Boolean(lr) && !lr.ok && ld === l.lado && el.lado !== l.lado;
            return (
              <button key={ld} type="button" data-lado={ld} aria-pressed={elegido} {...bloqueo}
                className={`${P}-lado ${ld}${elegido ? " elegido" : ""}${mal ? " mal" : ""}`} onClick={() => elegir(l.id, { lado: ld })}>
                <span data-nombre>{LADOS_H2[ld]}</span>{iba && <Pastilla marca={REVELADA} />}
              </button>
            );
          })}
        </div>
        {lr && !lr.ok && <p className={`${P}-lretro`} data-l-retro><Plegable texto={lr.retro} /></p>}
      </div>
    );
  };

  const enunciadoVisible = t.i === 0 ? ENUNCIADO_H2.visible : [];
  const enunciadoPlegado = t.i === 0 ? ENUNCIADO_H2.plegadoItem1 : ENUNCIADO_H2.plegado;
  const todoBien = r && item.tipo === "asiento" && r.n === lineas.length;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_B5H + CSS_C2F}</style>
      <div data-h2 ref={raiz} className={`${CLASE_B5H} ${P}`} style={{ position: "relative" }}>
        <Encabezado consigna={sinUnSoloIntento(H2.consigna)} onComoSeJuega={onComoSeJuega} />
        <ContadorConIntento>
          <Pulsos total={cuantos} hechos={t.i + (r ? 1 : 0)} enCurso={t.i + 1} etiqueta="Ítem" />
        </ContadorConIntento>

        {enunciadoVisible.length > 0 && (
          <div className={`${P}-enunciado`} data-enunciado-visible>
            {enunciadoVisible.map((p) => <p key={p}>{p}</p>)}
          </div>
        )}
        <button type="button" className={`${P}-ver`} data-ver-enunciado aria-expanded={verEnunciado} aria-controls={`${P}-enunciado`}
          onClick={() => setVerEnunciado((v) => !v)}>
          {verEnunciado ? FACTURA_H2.ocultarEnunciado : FACTURA_H2.verEnunciado}
        </button>
        <div id={`${P}-enunciado`} className={`${P}-enunciado`} data-enunciado hidden={!verEnunciado}>
          {enunciadoPlegado.map((p) => <p key={p}>{p}</p>)}
        </div>

        <div className={`${P}-figs`} data-facturas>
          {factura("compra")}
          {factura("venta")}
        </div>

        <div data-item={item.id}>
          <p ref={pregunta} tabIndex={-1} data-pregunta className={`${P}-pregunta`}>{item.pregunta}</p>
          <p data-pie className={`${P}-pie`}>{H2.pie}</p>
        </div>

        {item.tipo === "asiento" && (
          <div className={`${P}-asiento`} data-asiento={item.id}>
            <p className={`${P}-acab`} data-titulo-asiento>{FACTURA_H2.asientos[fac]}</p>
            {lineas.map(linea)}
            {r && (
              <div className={`${P}-sumas`} data-sumas>
                <span>{FACTURA_H2.sumas}</span><span>{pesos(item.sumas)}</span><span>{pesos(item.sumas)}</span>
              </div>
            )}
          </div>
        )}

        <div data-region-mensaje aria-live="polite" aria-atomic="true">
          {r && item.tipo === "cifra" && (
            <div ref={mensaje} tabIndex={-1} className={`${P}-msg${r.ok ? "" : " mal"}`} data-mensaje={r.ok ? "acierto" : "error"}>
              <p data-devolucion>
                {r.ok
                  ? <Pastilla marca={CORRECTA} />
                  : <span className={`${P}-solo`} data-lector>{`${LECTOR_INCORRECTO} ${ibaAquiCon(pesos(item.correcta))}. `}</span>}
                <span data-texto-retro><Plegable texto={r.texto} /></span>
              </p>
            </div>
          )}
          {r && item.tipo === "asiento" && (
            <div ref={mensaje} tabIndex={-1} className={`${P}-msg${todoBien ? "" : " mal"}`} data-mensaje={todoBien ? "acierto" : "error"}>
              <p data-devolucion>
                {todoBien && <Pastilla marca={CORRECTA} />}
                <span data-texto-retro>{FACTURA_H2.lineasAlPrimerToque(r.n)}</span>
              </p>
            </div>
          )}
        </div>

        <div data-responder>
          {!r
            ? <Responder onClick={comprobar} deshabilitado={!listo}>{COMPROBAR_B}</Responder>
            : <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H2.verResumen : BOTON_H2.siguiente}</Responder>}
        </div>
      </div>
    </Marco>
  );
}

/*
 * «Mira esto»: cada renglón de la factura viaja a su línea del asiento, uno
 * tras otro. Solo con movimiento; con movimiento reducido no se llama.
 */
function viajar(caja, item, fac, lineas) {
  const r0 = caja.getBoundingClientRect();
  lineas.forEach((l, n) => {
    const renglon = DONDE_H2[item.id].lineas[l.id];
    const de = caja.querySelector(`[data-renglon="${fac}-${renglon}"] [data-cifra]`);
    const a = caja.querySelector(`[data-linea="${l.id}"] [data-l-valor]`);
    if (!de || !a) return;
    const A = de.getBoundingClientRect();
    const B = a.getBoundingClientRect();
    const g = document.createElement("span");
    g.className = `${P}-vuelo`;
    g.dataset.vuelo = l.id;
    g.setAttribute("aria-hidden", "true");
    g.textContent = pesos(l.valor);
    g.style.left = `${A.left - r0.left}px`;
    g.style.top = `${A.top - r0.top}px`;
    caja.appendChild(g);
    a.style.opacity = "0";
    const fin = () => { g.remove(); a.style.opacity = ""; };
    const anim = g.animate(
      [{ transform: "translate(0, 0)" }, { transform: `translate(${B.left - A.left}px, ${B.top - A.top}px)` }],
      { duration: VUELO_MS, delay: n * ENTRE_VUELOS_MS, easing: "cubic-bezier(.3,.9,.4,1)", fill: "both" },
    );
    if (anim?.finished) anim.finished.then(fin, fin); else fin();
  });
}
