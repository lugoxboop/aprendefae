/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · HACER 8 · ¿SE ASIENTA O NO? — rediseño de enganche (Célula D).
 *
 * Diseño: Hanayama, «hacia el mayor» (celula-d/hanayama-h8-rediseno.md);
 * textos de Katsumi; corte de Yujiro. Portado del prototipo congelado
 * (t4r/H8R.jsx). Una figura que va creciendo hacia el mayor de Bancos:
 *
 *   1 · ¿Se asienta? Dos bandejas lado a lado, «Se asienta / en los libros» y
 *       «No se asienta / lo arregla / el banco». La cifra cae en la bandeja
 *       elegida («✓ Correcto»); con el error, borde coral y «✗ No va aquí»,
 *       y a los 0,7 s cae en la otra («Iba aquí»). Las dos reservan cinco
 *       renglones: el alto no delata cuántas van en cada una
 *   2 · Los asientos. El tablero de cinco cuentas y, debajo, el mayor de
 *       Bancos, que arranca con el saldo de los libros. Una ficha por lado y
 *       «Comprobar»: con el acierto, la línea de Bancos CAE EN EL MAYOR, en su
 *       lado. Con el error no se escribe nada; a los 0,7 s, el asiento
 *       verdadero, porque la etapa 3 parte del mayor completo
 *   3 · El mayor. El campo arriba; el mayor pone al pie la cifra escrita,
 *       con su marca de cifra. Solo con el acierto, el par dice «el mayor =
 *       el banco»: el saldo conciliado y el extracto NO están en el DOM antes
 *       (v3, PH8-1)
 *
 *   · el acierto con ✓ y borde blanco, NUNCA teal ni ámbar; seguir en blanco
 *   · «Paso n de 15» y el pulso activo coinciden (con 15, el Pulsos
 *     compartido pasa a barra: es interfaz)
 *   · en modo demo, sin Encabezado ni Pulsos, y solo la etapa 1
 *
 * Piezas compartidas, SIN CAMBIOS: Encabezado, Pulsos, Cierre, useTanda.
 * Al terminar: onCompletar(pct, ms, detalle) con quince puntos.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useRef, useState } from "react";
import { barajar } from "../../utils/barajar.js";
import { Pulsos, Cierre } from "../mecanicas/corazon/juego.jsx";
import { TEXTO_CIERRE } from "../mecanicas/bloques/marcos.jsx";
import { useTanda } from "../mecanicas/libros/piezas.jsx";
import { Encabezado } from "../mecanicas/libros/tema1/encabezado.jsx";
import {
  H8, BANDEJAS_H8, CUENTAS_H8, BANCOS, ETAPAS_H8, BOTON_H8, AVISOS_H8, ROTULOS_H8, PIE_H8, CIERRE_H8, ALT_FIGURA_H8, TOTAL_H8,
  lectorParH8, resumenH8, sortearH8, notasEnOrden, evaluarEtapa1H8, evaluarEtapa2H8, evaluarEtapa3H8, puntuarH8,
} from "../../data/contabilidadT4H8.js";
import { ESPERA_ERROR_MS, MARCA_CIFRA_BIEN, MARCA_CIFRA_MAL, cifra, pesos, leerCifra } from "../../data/contabilidadT4Hacer.js";
import { C, CSS_T4R, Mensaje, Marca, Avance } from "./comun.jsx";
import { Tablero, Mayor, Campo, CSS_TABLERO } from "./tablero.jsx";
import { ParConLector, CSS_HACER } from "./hacerComun.jsx";

export const CSS_H8 = `
.t4h8-t { display: grid; gap: 4px; border: 1px solid ${C.neutro}; border-radius: 8px; padding: 8px 12px; }
.t4h8-t p { margin: 0; font-size: 15px; line-height: 22px; min-height: 88px; overflow-wrap: anywhere; outline: none; }
.t4h8-t > span { justify-self: end; font: 600 15px/1.2 "Inter", sans-serif; font-variant-numeric: tabular-nums; }
.t4h8-et { font: 600 14px/1.3 "Sora", "Inter", sans-serif; color: ${C.texto}; margin: 0; }
.t4bj { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.t4bj-b { position: relative; min-width: 0; display: grid; gap: 2px; align-content: start; padding: 8px; border-radius: 10px; border: 1px solid ${C.reposo}; background: transparent; color: ${C.texto}; text-align: left; font: inherit; cursor: pointer; min-height: 44px; }
.t4bj-b:disabled { cursor: default; }
.t4bj-b[data-marca="bien"], .t4bj-b[data-marca="era"] { border: 2px solid ${C.texto}; padding: 7px; }
.t4bj-b[data-marca="mal"] { border: 2px solid ${C.error}; padding: 7px; }
.t4bj-b > b { display: grid; font: 600 13px/1.3 "Sora", "Inter", sans-serif; }
.t4bj-b > b > span { white-space: nowrap; }
.t4bj-ls { display: grid; gap: 2px; min-height: 108px; align-content: start; }
.t4bj-ls > span { justify-self: end; font: 500 15px/20px "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; color: ${C.texto2}; }
.t4bj-ls > span.t4bj-f { color: ${C.texto}; font-weight: 600; }
.t4bj-hueco { min-height: 20px; display: flex; justify-content: flex-end; }
.t4h8-aviso { margin: 9px 0 0; font-size: 12.5px; color: ${C.texto2}; text-align: center; }
`;

const elegirSerie = (xs) => xs[Math.floor(Math.random() * xs.length) % xs.length];
const VACIAS = { debe: null, haber: null };

export default function SeAsientaONo({ Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? sortearH8(elegirSerie, barajar));
  const { serie: s, partidas } = t.items;
  const notas = notasEnOrden(s, partidas).filter(Boolean);
  /* `etapaInicial` solo lo usan las pruebas: una etapa sola, con sus ítems. */
  const [etapa, setEtapa] = useState(() => t.items.etapaInicial ?? 1);
  const [r, setR] = useState(null); /* { ok, texto, aplicado, elegido | a | v } */
  const [bandejas, setBandejas] = useState([]); /* las partidas ya puestas, en su bandeja correcta */
  const [puestas, setPuestas] = useState(VACIAS);
  const [totales, setTotales] = useState({});
  const [mayor, setMayor] = useState({ debe: [], haber: [] }); /* las líneas de Bancos que ya cayeron */
  const [saldo, setSaldo] = useState("");
  const [aviso, setAviso] = useState(null);
  const [bien, setBien] = useState(0);
  const reloj = useRef(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);
  const enfocar = useRef(false);

  const p = etapa === 1 ? partidas[t.i] : etapa === 2 ? notas[t.i] : null;

  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(puntuarH8(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (r?.aplicado && !modoDemo) zonaBoton.current?.querySelector("button")?.focus(); }, [r?.aplicado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (enfocar.current) { enfocar.current = false; tarjeta.current?.focus(); } }, [t.i, etapa]);

  const despues = (fn) => { reloj.current = setTimeout(() => { fn(); setR((x) => (x ? { ...x, aplicado: true } : x)); }, ESPERA_ERROR_MS); };

  /* Etapa 1. */
  const ponerBandeja = (x) => setBandejas((bs) => (bs.some((y) => y.id === x.id) ? bs : [...bs, { id: x.id, bandeja: evaluarEtapa1H8(x, null).respuesta, monto: x.monto }]));
  const elegir1 = (b) => {
    if (r) return;
    const v = evaluarEtapa1H8(p, b);
    t.anotar(p.id, v.ok, b);
    if (v.ok) { setBien((n) => n + 1); ponerBandeja(p); setR({ ...v, elegido: b, aplicado: true }); return; }
    setR({ ...v, elegido: b, aplicado: false });
    despues(() => ponerBandeja(p));
  };
  /* Etapa 2. */
  const escribirAsiento = (n) => {
    setTotales((x) => {
      const y = { ...x, [n.debe]: { ...(x[n.debe] ?? {}) }, [n.haber]: { ...(x[n.haber] ?? {}) } };
      y[n.debe].debe = (y[n.debe].debe ?? 0) + n.monto; y[n.haber].haber = (y[n.haber].haber ?? 0) + n.monto;
      return y;
    });
    setMayor((m) => {
      const lado = n.debe === BANCOS ? "debe" : "haber";
      return m[lado].some((l) => l.id === n.id) ? m : { ...m, [lado]: [...m[lado], { id: n.id, monto: n.monto }] };
    });
  };
  const elegir2 = (cuenta, lado) => {
    if (r) return;
    setAviso(null);
    setPuestas((x) => { const otro = lado === "debe" ? "haber" : "debe"; const n = { ...x, [lado]: x[lado] === cuenta ? null : cuenta }; if (n[otro] === cuenta) n[otro] = null; return n; });
  };
  const comprobar2 = () => {
    if (r) return;
    if (!puestas.debe || !puestas.haber) { setAviso(AVISOS_H8.lados); return; }
    setAviso(null);
    const a = { ...puestas };
    const v = evaluarEtapa2H8(p, a);
    t.anotar(p.idAsiento, v.ok, `${a.debe} / ${a.haber}`);
    if (v.ok) { setBien((n) => n + 1); escribirAsiento(p); setR({ ...v, a, aplicado: true }); return; }
    setR({ ...v, a, aplicado: false });
    despues(() => escribirAsiento(p));
  };
  /* Etapa 3. */
  const comprobar3 = () => {
    if (r) return;
    const v = leerCifra(saldo);
    if (v == null) { setAviso(AVISOS_H8.saldo); return; }
    setAviso(null);
    const e = evaluarEtapa3H8(s, v);
    t.anotar("saldo-mayor", e.ok, String(v));
    if (e.ok) setBien((n) => n + 1);
    setR({ ...e, v, aplicado: true, iba: false });
    /* Sin reintento: a los 0,7 s, «Iba aquí: {valor}» bajo el campo (prompt maestro §4.2; decisión de Yujiro, 16 oct). */
    if (!e.ok) reloj.current = setTimeout(() => setR((x) => (x ? { ...x, iba: true } : x)), ESPERA_ERROR_MS);
  };

  const avanzar = () => {
    clearTimeout(reloj.current);
    if (r && !r.aplicado) { if (etapa === 1) ponerBandeja(p); else if (etapa === 2) escribirAsiento(p); }
    setR(null); setPuestas(VACIAS); setAviso(null);
    enfocar.current = true;
    if (etapa === 1) { if (t.i + 1 < partidas.length) t.setI(t.i + 1); else { setEtapa(2); t.setI(0); } }
    else if (etapa === 2) { if (t.i + 1 < notas.length) t.setI(t.i + 1); else { setEtapa(3); t.setI(0); } }
    else { enfocar.current = false; t.setTerminado(true); }
  };
  const reiniciar = () => {
    clearTimeout(reloj.current); t.reiniciar();
    setEtapa(1); setR(null); setBandejas([]); setPuestas(VACIAS); setTotales({}); setMayor({ debe: [], haber: [] }); setSaldo(""); setAviso(null); setBien(0);
  };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <div data-t4-h8 data-fin>
          <Cierre pct={Math.round(puntuarH8(bien))} onReiniciar={reiniciar} textoReiniciar={BOTON_H8.otraVez}>
            <p data-resumen style={TEXTO_CIERRE}>{resumenH8(bien)}</p>
            <p data-cierre style={{ ...TEXTO_CIERRE, marginTop: "8px" }}>{CIERRE_H8.texto}</p>
            <p data-pie-cierre style={{ margin: "6px 0 0", fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.texto2 }}>{CIERRE_H8.pie}</p>
          </Cierre>
        </div>
      </Marco>
    );
  }

  /* Etapa 1: las bandejas. */
  const correcta1 = etapa === 1 && p ? evaluarEtapa1H8(p, null).respuesta : null;
  const marcaBandeja = (b) => (!r || etapa !== 1 ? null : r.elegido === b ? (r.ok ? "bien" : "mal") : (r.aplicado && !r.ok && correcta1 === b ? "era" : null));
  const recien1 = etapa === 1 && r?.aplicado ? p.id : null;
  const bandeja = ({ id, renglones }) => {
    const m = marcaBandeja(id);
    return (
      <button key={id} type="button" className="t4bj-b" data-destino={id} data-marca={m ?? undefined} disabled={etapa !== 1 || Boolean(r)} onClick={() => elegir1(id)} aria-label={renglones.join(" ")}>
        <b>{renglones.map((x) => <span key={x}>{x}</span>)}</b>
        <span className="t4bj-ls">{bandejas.filter((x) => x.bandeja === id).map((x) => <span key={x.id} className={`t4r-nueva${x.id === recien1 ? " t4bj-f" : ""}`} data-linea={x.id}>{cifra(x.monto)}</span>)}</span>
        <span className="t4bj-hueco"><Marca marca={m} /></span>
      </button>
    );
  };

  /* Etapa 2: las marcas del tablero. */
  const marcas2 = {};
  if (r && etapa === 2) {
    marcas2[`${r.a.debe}:debe`] = r.a.debe === p.debe ? "bien" : "mal";
    marcas2[`${r.a.haber}:haber`] = r.a.haber === p.haber ? "bien" : "mal";
    if (!r.ok && r.aplicado) { if (r.a.debe !== p.debe) marcas2[`${p.debe}:debe`] = "era"; if (r.a.haber !== p.haber) marcas2[`${p.haber}:haber`] = "era"; }
  }
  const recien2 = etapa === 2 && r?.aplicado ? p.id : null;
  const linea = (l) => ({ id: l.id, v: cifra(l.monto), foco: l.id === recien2 });
  const mayorDebe = [{ id: "inicial", r: ROTULOS_H8.saldoInicial, v: cifra(s.libros) }, ...mayor.debe.map(linea)];
  const mayorHaber = mayor.haber.map(linea);

  const pasos = partidas.length + notas.length + 1;
  const hechos = etapa === 1 ? t.i : etapa === 2 ? partidas.length + t.i : pasos - 1;
  const conPar = etapa === 3;
  const acierto3 = etapa === 3 && r?.ok;
  const textoSeguir = etapa === 1 ? (t.i + 1 === partidas.length ? BOTON_H8.aLosAsientos : BOTON_H8.siguientePartida)
    : etapa === 2 ? (t.i + 1 === notas.length ? BOTON_H8.alMayor : BOTON_H8.siguienteAsiento) : BOTON_H8.verResumen;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T4R + CSS_TABLERO + CSS_H8 + CSS_HACER}</style>
      <div {...(modoDemo ? { "data-t4-h8-demo": "" } : { "data-t4-h8": "" })} data-etapa={etapa} data-serie={s.id}>
        {!modoDemo && (
          <>
            <Encabezado consigna={H8.consigna} onComoSeJuega={onComoSeJuega} />
            <div style={{ marginBottom: "12px" }}>
              <Pulsos total={pasos} hechos={hechos} enCurso={hechos + 1} etiqueta="Paso" />
            </div>
          </>
        )}
        <figure className="t4r" style={{ margin: 0 }} data-figura="hacia-el-mayor" aria-describedby={modoDemo ? undefined : "t4h8-alt"}>
          <p className="t4h8-et" data-rotulo-etapa>{ETAPAS_H8[etapa - 1]}</p>
          {p && (
            <div className="t4h8-t t4r-nueva" key={`${etapa}-${p.id}`} data-tarjeta-partida={p.id}>
              <p ref={tarjeta} tabIndex={-1} data-hecho>{p.texto}</p>
              <span data-monto>{cifra(p.monto)}</span>
            </div>
          )}
          {etapa === 1 && <div className="t4bj" role="group" aria-label={ETAPAS_H8[0]}>{BANDEJAS_H8.map(bandeja)}</div>}
          {etapa === 2 && (
            <Tablero cuentas={CUENTAS_H8} totales={totales} puestas={r && !r.ok ? r.a : puestas} monto={cifra(p.monto)} onElegir={elegir2}
              activo={!r} marcas={marcas2} recien={r?.aplicado ? [`${p.debe}:debe`, `${p.haber}:haber`] : []} etiqueta={ETAPAS_H8[1]} />
          )}
          {etapa === 3 && <Campo id="mayor" rotulo={ROTULOS_H8.campo} valor={saldo} bloqueado={Boolean(r)} iba={r?.iba ? pesos(s.saldoMayor) : null} onCambio={(v) => { setSaldo(v); setAviso(null); }} />}
          {etapa >= 2 && (
            <Mayor titulo={s.tituloMayor} debe={mayorDebe} haber={mayorHaber} reserva={3} rotuloSaldo={ROTULOS_H8.saldoPie}
              saldo={etapa === 3 && r ? cifra(r.v) : null} marcaSaldo={etapa === 3 && r ? (r.ok ? MARCA_CIFRA_BIEN : MARCA_CIFRA_MAL) : null}
              eco={etapa === 3 && !r && leerCifra(saldo) != null ? cifra(leerCifra(saldo)) : null} />
          )}
          {conPar && (
            <ParConLector
              izq={{ r: acierto3 ? ROTULOS_H8.parMayor : ROTULOS_H8.parLibros, v: acierto3 ? s.saldoMayor : s.libros, foco: acierto3 }}
              der={{ r: acierto3 ? ROTULOS_H8.parBanco : "", v: acierto3 ? s.saldoMayor : null }}
              igual={acierto3}
              lector={acierto3 ? lectorParH8.acierto(cifra(s.saldoMayor), cifra(s.saldoMayor)) : lectorParH8.antes(cifra(s.libros))}
            />
          )}
          {!modoDemo && <figcaption id="t4h8-alt" className="t4f-sr">{ALT_FIGURA_H8}</figcaption>}
        </figure>
        <div className="t4r" data-retro aria-live="polite" aria-atomic="true">
          {r && <div style={{ marginTop: "12px" }}><Mensaje ok={r.ok} texto={r.texto} pagina={PIE_H8[etapa]} /></div>}
        </div>
        {etapa >= 2 && !r && (
          <div className="t4r" style={{ marginTop: "14px" }}>
            <Avance nombre="comprobar" onClick={etapa === 2 ? comprobar2 : comprobar3}>{etapa === 2 ? BOTON_H8.comprobar : BOTON_H8.comprobarSaldo}</Avance>
            {aviso && <p className="t4h8-aviso" data-aviso>{aviso}</p>}
          </div>
        )}
        {r && !modoDemo && (
          <div className="t4r"><Avance refZona={zonaBoton} onClick={avanzar}>{textoSeguir}</Avance></div>
        )}
      </div>
    </Marco>
  );
}

export { TOTAL_H8 };
