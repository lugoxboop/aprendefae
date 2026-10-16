/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · HACER 4 · EL ARQUEO DE CAJA MENOR (con H5 dentro) — rediseño de
 * enganche (Célula D).
 *
 * Diseño: Hanayama, «el sobre y la regla del fondo» (celula-d/hanayama-h4-
 * rediseno.md); textos de Katsumi; corte de Yujiro. Portado del prototipo
 * congelado (t4r/H4R.jsx).
 *
 * Cada ronda es un arqueo. En la figura: la tarjeta de la ronda (quién, el
 * fondo y la regla de la empresa si falta plata), el sobre con lo que se
 * contó (soportes y caja) y la regla del fondo. Lo que el estudiante decide
 * se DIBUJA en la regla:
 *   1 · ¿falta, cuadra o sobra? → la aguja «suman» baja a su sitio real
 *   2 · ¿de cuánto? → su cifra es un tramo desde la marca del fondo: si no es
 *       la diferencia, se queda corto o se sale («→»), en coral
 *   3 · ¿por cuánto el reembolso? → la aguja «caja + tu cheque» cae donde
 *       dice su cifra; solo el cheque correcto la deja en la marca del fondo
 *   4 · ¿a qué cuenta va la diferencia? (de H5) → el tablero de cuatro
 *       cuentas, una ficha; con el acierto, el asiento del reembolso
 * En el error, lo elegido se marca (✗, coral) y a los 0,7 s se dibuja lo que
 * era. Un intento por pregunta; la siguiente se juega con la verdad dibujada.
 *
 *   · el acierto con ✓ y borde blanco, NUNCA teal ni ámbar; el botón de
 *     seguir en el neutro blanco (SeguirHacer)
 *   · «Ronda n de 4» y el pulso activo coinciden
 *   · mientras se pregunta, nada de la respuesta está en el DOM (PH8-2): ni la
 *     aguja «suman», ni el tramo, ni el asiento, ni la devolución
 *   · en modo demo, sin Encabezado ni Pulsos, y solo la pregunta 1
 *
 * Piezas compartidas, SIN CAMBIOS: Encabezado, Pulsos, Cierre, useTanda.
 * Al terminar: onCompletar(pct, ms, detalle); el ítem es «ronda:pregunta» y,
 * en el error, el detalle guarda lo elegido.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useRef, useState } from "react";
import { barajar } from "../../utils/barajar.js";
import { Pulsos, Cierre } from "../mecanicas/corazon/juego.jsx";
import { TEXTO_CIERRE } from "../mecanicas/bloques/marcos.jsx";
import { useTanda } from "../mecanicas/libros/piezas.jsx";
import { Encabezado } from "../mecanicas/libros/tema1/encabezado.jsx";
import {
  H4, CUADRA, FALTA, ARQUEO, DIFERENCIA, CHEQUE, CUENTA, ZONAS_H4, CUENTAS_H4, RENGLONES_ASIENTO_H4,
  BOTON_H4, SOBRE_H4, REGLA_H4, ASIENTO_H4, CIERRE_H4, ALT_FIGURA_H4,
  rotuloPasoH4, resumenH4, sortearH4, evaluarH4, evaluarCuentaH4, puntuarH4, itemH4,
} from "../../data/contabilidadT4H4.js";
import { ESPERA_ERROR_MS, cifra } from "../../data/contabilidadT4Hacer.js";
import { C, CSS_T4R, Mensaje, SeguirHacer } from "./comun.jsx";
import { Tablero, CSS_TABLERO } from "./tablero.jsx";
import { CSS_HACER } from "./hacerComun.jsx";
import { Regla, CSS_REGLA } from "./Regla.jsx";

export const CSS_H4 = `
.t4h4-t { display: grid; gap: 2px; border: 1px solid ${C.neutro}; border-radius: 8px; padding: 8px 12px; }
.t4h4-t b { font: 600 14px/1.35 "Sora", "Inter", sans-serif; }
.t4h4-t p { margin: 0; font-size: 15px; line-height: 22px; min-height: 22px; }
.t4h4-sb { display: grid; gap: 2px; border: 1px solid ${C.neutro}; border-top: none; border-radius: 0 0 10px 10px; padding: 4px 12px 8px; }
.t4h4-f { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; line-height: 1.5; color: ${C.texto2}; }
.t4h4-f > span { white-space: nowrap; }
.t4h4-f > span:last-child { font: 500 15px/1.4 "Inter", sans-serif; font-variant-numeric: tabular-nums; color: ${C.texto}; }
.t4h4-q { display: grid; gap: 8px; }
.t4h4-q > p { margin: 0; font: 600 15px/1.4 "Sora", "Inter", sans-serif; }
.t4h4-q > span { font: 500 12px/1.2 "Inter", sans-serif; color: ${C.texto2}; }
.t4h4-ops { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.t4h4-op { position: relative; min-height: 44px; border-radius: 8px; border: 1px solid ${C.neutro}; background: transparent; color: ${C.texto}; font: 600 14px "Inter", sans-serif; font-variant-numeric: tabular-nums; cursor: pointer; white-space: nowrap; padding: 0 4px; }
.t4h4-op:disabled { cursor: default; }
.t4h4-op[data-marca] { background: rgba(248,249,250,0.08); }
.t4h4-op[data-marca="bien"], .t4h4-op[data-marca="era"] { border: 2px solid ${C.texto}; }
.t4h4-op[data-marca="mal"] { border: 2px solid ${C.error}; }
.t4h4-op .t4h4-g { position: absolute; top: -8px; right: 6px; padding: 0 3px; background: ${C.fondo}; font: 700 12px/1.2 "Inter", sans-serif; }
.t4h4-as { display: grid; gap: 2px; border: 1px solid ${C.neutro}; border-radius: 10px; padding: 8px 12px; font-size: 13px; }
.t4h4-as > div { display: grid; grid-template-columns: minmax(0,1fr) 70px 70px; gap: 4px; align-items: end; }
.t4h4-as > div > span:nth-child(n+2) { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
`;

/* Las opciones de una pregunta 1, 2 o 3: un toque, y la marca en lo elegido y, ya aplicado, en lo que era. */
function Opciones({ opciones, elegida, correcta, aplicado, onElegir, rotulo, etiqueta }) {
  return (
    <div className="t4h4-ops" role="group" aria-label={etiqueta}>
      {opciones.map((o) => {
        const m = elegida == null ? null : o === elegida ? (o === correcta ? "bien" : "mal") : (aplicado && o === correcta ? "era" : null);
        return (
          <button key={o} type="button" className="t4h4-op" data-opcion={o} data-marca={m ?? undefined} disabled={elegida != null} aria-pressed={o === elegida} onClick={() => onElegir(o)}>
            {rotulo(o)}
            {m === "bien" && <span className="t4h4-g" aria-hidden="true">✓</span>}
            {m === "mal" && <span className="t4h4-g" aria-hidden="true" style={{ color: C.error }}>✗</span>}
          </button>
        );
      })}
    </div>
  );
}

/* El asiento del reembolso, con las cifras de la ronda: Gastos generales, la cuenta de la diferencia y Bancos. */
function AsientoReembolso({ r, cuenta }) {
  const lineas = [
    { k: "gastos", renglones: [ASIENTO_H4.gastos], d: r.gastos },
    { k: "diferencia", renglones: RENGLONES_ASIENTO_H4[cuenta.cuenta], d: cuenta.lado === "debe" ? r.dif : null, h: cuenta.lado === "haber" ? r.dif : null },
    { k: "bancos", renglones: [ASIENTO_H4.bancos], h: r.cheque, sangria: true },
  ];
  return (
    <div className="t4h4-as t4r-nueva" data-asiento>
      <div><span /><span style={{ color: C.debe, fontWeight: 600 }}>{ASIENTO_H4.debe}</span><span style={{ color: C.haber, fontWeight: 600 }}>{ASIENTO_H4.haber}</span></div>
      {lineas.map((l) => (
        <div key={l.k} data-linea-asiento={l.k} style={{ borderTop: "1px solid rgba(248,249,250,0.22)", paddingTop: "2px" }}>
          <span style={{ gridColumn: "1 / -1", display: "grid", paddingLeft: l.sangria ? "12px" : 0 }}>{l.renglones.map((t) => <span key={t} style={{ whiteSpace: "nowrap" }}>{t}</span>)}</span>
          <span /><span>{l.d ? cifra(l.d) : ""}</span><span>{l.h ? cifra(l.h) : ""}</span>
        </div>
      ))}
    </div>
  );
}

export default function ElArqueo({ Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? sortearH4(barajar));
  const [k, setK] = useState(0); /* la pregunta en curso de la ronda */
  const [eleg, setEleg] = useState(null); /* lo elegido: una opción, o { cuenta, lado } en la 4 */
  const [aplicado, setAplicado] = useState(false);
  const [hechas, setHechas] = useState({}); /* lo ya resuelto en la ronda, por pregunta */
  const [puesta, setPuesta] = useState({ debe: null, haber: null });
  const [bien, setBien] = useState(0);
  const reloj = useRef(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);
  const enfocar = useRef(false);

  const rondas = t.items;
  const r = rondas[t.i];
  const p = r.preguntas[k];
  const total = rondas.reduce((s, x) => s + x.preguntas.length, 0);

  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(puntuarH4(bien, total), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (aplicado && !modoDemo) zonaBoton.current?.querySelector("button")?.focus(); }, [aplicado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (enfocar.current) { enfocar.current = false; tarjeta.current?.focus(); } }, [t.i]);

  const decidir = (v, ok, respuesta) => {
    t.anotar(itemH4(r.id, p.id), ok, respuesta);
    if (ok) setBien((n) => n + 1);
    setEleg(v);
    const guardar = () => { setHechas((h) => ({ ...h, [p.id]: { v, ok } })); setAplicado(true); };
    if (ok) guardar(); else reloj.current = setTimeout(guardar, ESPERA_ERROR_MS);
  };
  const elegir = (v) => { if (eleg != null) return; decidir(v, evaluarH4(p, v).ok, String(v)); };
  const listo4 = Boolean(puesta.debe || puesta.haber);
  const comprobar = () => {
    if (eleg != null || !listo4) return;
    const lado = puesta.debe ? "debe" : "haber";
    const v = { cuenta: puesta[lado], lado };
    decidir(v, evaluarCuentaH4(p, v.cuenta, v.lado).ok, `${v.cuenta}:${v.lado}`);
  };

  const avanzar = () => {
    clearTimeout(reloj.current);
    if (!aplicado) setHechas((h) => ({ ...h, [p.id]: { v: eleg, ok: false } }));
    setEleg(null); setAplicado(false); setPuesta({ debe: null, haber: null });
    if (k + 1 < r.preguntas.length) { setK(k + 1); return; }
    setHechas({}); setK(0);
    if (t.i + 1 < rondas.length) { enfocar.current = true; t.setI(t.i + 1); } else t.setTerminado(true);
  };
  const reiniciar = () => { clearTimeout(reloj.current); t.reiniciar(); setK(0); setEleg(null); setAplicado(false); setHechas({}); setPuesta({ debe: null, haber: null }); setBien(0); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <div data-t4-h4 data-fin>
          <Cierre pct={Math.round(puntuarH4(bien, total))} onReiniciar={reiniciar} textoReiniciar={BOTON_H4.otraVez}>
            <p data-resumen style={TEXTO_CIERRE}>{resumenH4(bien)}</p>
            <p data-cierre style={{ ...TEXTO_CIERRE, marginTop: "8px" }}>{CIERRE_H4.texto}</p>
            <p data-pie-cierre style={{ margin: "6px 0 0", fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.texto2 }}>{CIERRE_H4.pie}</p>
          </Cierre>
        </div>
      </Marco>
    );
  }

  /* Lo que dibuja la regla: lo ya resuelto en la ronda y, en la pregunta en curso, lo elegido. */
  const signo = r.tipo === FALTA ? -1 : 1;
  const verSuman = Boolean(hechas[ARQUEO]) || (p.id === ARQUEO && aplicado);
  const tramos = [];
  const agujas = [];
  const etiquetas = [];
  if (p.id === DIFERENCIA && eleg != null) {
    const mal = eleg !== r.dif;
    tramos.push({ id: "elegido", desv: signo * eleg, mal });
    etiquetas.push({ id: "tu-diferencia", fila: "A", desv: signo * eleg, valor: eleg, texto: REGLA_H4.tuDiferencia, mal });
    if (aplicado && mal) etiquetas.push({ id: "diferencia", fila: "B", desv: signo * r.dif, valor: r.dif, texto: REGLA_H4.era });
  }
  if (r.tipo !== CUADRA && (hechas[DIFERENCIA] || (p.id === DIFERENCIA && aplicado && eleg !== r.dif))) tramos.push({ id: "diferencia", desv: signo * r.dif });
  if (p.id === CHEQUE && eleg != null) {
    const mal = eleg !== r.cheque;
    agujas.push({ id: "con-el-cheque", desv: r.caja + eleg - r.fondo, mal });
    etiquetas.push({ id: "tu-cheque", fila: "A", desv: r.caja + eleg - r.fondo, valor: r.caja + eleg, texto: REGLA_H4.tuCheque, mal });
    if (aplicado && mal) etiquetas.push({ id: "cheque", fila: "B", desv: 0, valor: r.fondo, texto: REGLA_H4.chequeCorrecto });
  }
  if ((p.id === CHEQUE && aplicado && eleg !== r.cheque) || hechas[CHEQUE]) agujas.push({ id: "con-el-cheque-bien", desv: 0 });

  /* La devolución de la pregunta en curso. */
  let msg = null;
  if (eleg != null) msg = p.id === CUENTA ? evaluarCuentaH4(p, eleg.cuenta, eleg.lado) : evaluarH4(p, eleg);
  const marcas4 = {};
  if (p.id === CUENTA && eleg != null) {
    marcas4[`${eleg.cuenta}:${eleg.lado}`] = msg.ok ? "bien" : "mal";
    if (!msg.ok && aplicado) marcas4[`${p.correcta.cuenta}:${p.correcta.lado}`] = "era";
  }
  const ultima = k === r.preguntas.length - 1;
  const textoSeguir = !ultima ? BOTON_H4.siguientePaso : t.i + 1 < rondas.length ? BOTON_H4.siguienteRonda : BOTON_H4.verResumen;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T4R + CSS_TABLERO + CSS_REGLA + CSS_H4 + CSS_HACER}</style>
      <div {...(modoDemo ? { "data-t4-h4-demo": "" } : { "data-t4-h4": "" })} data-pregunta={p.id}>
        {!modoDemo && (
          <>
            <Encabezado consigna={H4.consigna} onComoSeJuega={onComoSeJuega} />
            <div style={{ marginBottom: "12px" }}>
              <Pulsos total={rondas.length} hechos={t.i} enCurso={t.i + 1} etiqueta="Ronda" />
            </div>
          </>
        )}
        <figure className="t4r" style={{ margin: 0 }} data-figura="regla-del-fondo" aria-describedby={modoDemo ? undefined : "t4h4-alt"}>
          <div className="t4h4-t t4r-nueva" key={r.id} data-tarjeta-ronda={r.id} ref={tarjeta} tabIndex={-1} style={{ outline: "none" }}>
            <b>{r.titulo}</b>
            <p>{r.tarjeta}</p>
          </div>
          <div className="t4h4-sb" data-sobre>
            <div className="t4h4-f"><span>{SOBRE_H4.gastos}</span><span>{cifra(r.gastos)}</span></div>
            <div className="t4h4-f"><span>{SOBRE_H4.caja}</span><span>{cifra(r.caja)}</span></div>
          </div>
          <Regla r={r} suman={verSuman ? r.suma : null} tramos={tramos} aguja2={agujas} etiquetas={etiquetas} />
          <div className="t4h4-q" data-tarjeta-pregunta={p.id}>
            <span data-paso>{rotuloPasoH4(k + 1, r.preguntas.length)}</span>
            <p>{p.pregunta}</p>
            {p.id === ARQUEO && <Opciones opciones={p.opciones} elegida={eleg} correcta={p.correcta} aplicado={aplicado} onElegir={elegir} rotulo={(o) => ZONAS_H4.find((z) => z[0] === o)[1]} etiqueta={p.pregunta} />}
            {(p.id === DIFERENCIA || p.id === CHEQUE) && <Opciones opciones={p.opciones} elegida={eleg} correcta={p.correcta} aplicado={aplicado} onElegir={elegir} rotulo={(o) => cifra(o)} etiqueta={p.pregunta} />}
            {p.id === CUENTA && (
              <>
                <Tablero
                  cuentas={CUENTAS_H4}
                  puestas={eleg ? { [eleg.lado]: eleg.cuenta } : puesta}
                  monto={cifra(r.dif)}
                  activo={eleg == null}
                  marcas={marcas4}
                  ancho={70}
                  totales={aplicado ? { [p.correcta.cuenta]: { [p.correcta.lado]: r.dif } } : {}}
                  recien={aplicado ? [`${p.correcta.cuenta}:${p.correcta.lado}`] : []}
                  onElegir={(id, lado) => setPuesta((x) => (x[lado] === id ? { debe: null, haber: null } : { debe: null, haber: null, [lado]: id }))}
                  etiqueta={p.pregunta}
                />
                {aplicado && <AsientoReembolso r={r} cuenta={p.correcta} />}
              </>
            )}
          </div>
          {!modoDemo && <figcaption id="t4h4-alt" className="t4f-sr">{ALT_FIGURA_H4}</figcaption>}
        </figure>
        <div className="t4r" data-retro aria-live="polite" aria-atomic="true">
          {msg && <div style={{ marginTop: "12px" }}><Mensaje ok={msg.ok} texto={msg.texto} pagina={r.pagina} /></div>}
        </div>
        {p.id === CUENTA && eleg == null && (
          <div className="t4r" style={{ marginTop: "14px" }}>
            <button type="button" className="t4r-btn" data-boton="comprobar" aria-disabled={!listo4 ? "true" : undefined}
              style={!listo4 ? { background: "transparent", color: C.texto2, borderColor: C.texto2 } : undefined} onClick={comprobar}>
              {BOTON_H4.comprobar}
            </button>
          </div>
        )}
        {eleg != null && !modoDemo && (
          <div className="t4r"><SeguirHacer refZona={zonaBoton} onClick={avanzar}>{textoSeguir}</SeguirHacer></div>
        )}
      </div>
    </Marco>
  );
}
