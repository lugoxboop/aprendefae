/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · HACER 7 · CONCILIA LA CUENTA (con H6 dentro) — rediseño de enganche
 * (Célula D).
 *
 * Diseño: Hanayama, «las libretas y el par» (celula-d/hanayama-h7-
 * rediseno.md); textos de Katsumi; corte de Yujiro. Portado del prototipo
 * congelado (t4r/H7R.jsx).
 *
 * Fase 1 · las nueve partidas. Arriba, el par de A5 (el banco y los libros,
 * con sus saldos de partida); debajo, la partida y las dos libretas de A4,
 * cada una con su «Más» y su «Menos» como destinos. Mandar la partida a una
 * libreta es la pregunta de H6 (¿quién todavía no la tiene?); el Más o el
 * Menos, la de H7. Un toque.
 *   · acierto: el monto se escribe en esa sección, con «✓ Correcto»
 *   · error: la sección elegida queda con relleno, borde coral y «✗ No va
 *     aquí», y no se escribe nada. A los 0,7 s la partida se escribe donde
 *     iba («Iba aquí»): la conciliación queda completa para la fase 2
 *   · las cuatro secciones reservan tres renglones: el alto no delata cuántas
 *     partidas van en cada una
 *
 * Fase 2 · los saldos. Las libretas completas, los dos campos y, debajo, el
 * par, que CUENTA HASTA LO ESCRITO. El «=» sale solo si los dos son el saldo
 * verdadero; si no, el par se queda 1,2 s con lo escrito y pasa a los saldos
 * verdaderos. Cada campo lleva su marca de cifra («✓ Correcto» o «✗ Cifra
 * errada»). Con un campo vacío, «Comprobar» da un aviso y no gasta el intento.
 *
 *   · el acierto con ✓ y borde blanco, NUNCA teal ni ámbar; seguir en blanco
 *   · «Paso n de 10» y el pulso activo coinciden
 *   · mientras se pregunta, nada de la respuesta está en el DOM (PH8-2)
 *   · en modo demo, sin Encabezado ni Pulsos
 *
 * Piezas compartidas, SIN CAMBIOS: Encabezado, Pulsos, Cierre, useTanda.
 * Al terminar: onCompletar(pct, ms, detalle) con once puntos (nueve partidas
 * y dos saldos).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useRef, useState } from "react";
import { barajar } from "../../utils/barajar.js";
import { Pulsos, Cierre } from "../mecanicas/corazon/juego.jsx";
import { TEXTO_CIERRE } from "../mecanicas/bloques/marcos.jsx";
import { useTanda } from "../mecanicas/libros/piezas.jsx";
import { Encabezado } from "../mecanicas/libros/tema1/encabezado.jsx";
import {
  H7, ROTULOS_H7, BOTON_H7, PIE_FASE2_H7, CIERRE_PIE_H7, FALTAN_SALDOS, ALT_FIGURA_H7,
  resumenH7, lectorParH7, sortearH7, evaluarPartidaH7, evaluarSaldosH7, puntuarH7,
} from "../../data/contabilidadT4H7.js";
import { ESPERA_ERROR_MS, ESPERA_SALDOS_MS, MARCA_CIFRA_BIEN, MARCA_CIFRA_MAL, cifra, leerCifra } from "../../data/contabilidadT4Hacer.js";
import { C, CSS_T4R, Mensaje, Marca, SeguirHacer } from "./comun.jsx";
import { Campo, CSS_TABLERO } from "./tablero.jsx";
import { ParConLector, CSS_HACER } from "./hacerComun.jsx";

export const CSS_H7 = `
.t4h7-t { display: grid; gap: 4px; border: 1px solid ${C.neutro}; border-radius: 8px; padding: 8px 12px; }
.t4h7-t p { margin: 0; font-size: 15px; line-height: 22px; min-height: 88px; overflow-wrap: anywhere; outline: none; }
.t4h7-t > span { justify-self: end; font: 600 15px/1.2 "Inter", sans-serif; font-variant-numeric: tabular-nums; }
.t4lb { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.t4lb-l { display: grid; gap: 6px; align-content: start; border: 1px solid ${C.neutro}; border-radius: 10px; padding: 8px; min-width: 0; }
.t4lb-n { display: grid; font: 600 13px/1.3 "Sora", "Inter", sans-serif; padding-bottom: 4px; border-bottom: 1px solid rgba(248,249,250,0.22); }
.t4lb-n > span { white-space: nowrap; }
.t4lb-n > span + span { font: 500 12px/1.3 "Inter", sans-serif; color: ${C.texto2}; }
.t4lb-s { position: relative; display: grid; gap: 2px; align-content: start; min-height: 44px; padding: 6px 8px; border-radius: 8px; border: 1px solid rgba(248,249,250,0.30); background: transparent; color: ${C.texto}; text-align: right; font: inherit; cursor: pointer; }
.t4lb-s:disabled { cursor: default; }
.t4lb-s[data-marca] { background: rgba(248,249,250,0.08); }
.t4lb-s[data-marca="bien"], .t4lb-s[data-marca="era"] { border: 2px solid ${C.texto}; padding: 5px 7px; }
.t4lb-s[data-marca="mal"] { border: 2px solid ${C.error}; padding: 5px 7px; }
.t4lb-s > b { justify-self: start; font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .04em; }
.t4lb-ls { display: grid; gap: 2px; min-height: 66px; align-content: start; }
.t4lb-ls > span { font: 500 15px/20px "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; color: ${C.texto2}; }
.t4lb-ls > span.t4lb-f { color: ${C.texto}; font-weight: 600; }
.t4lb-hueco { min-height: 20px; display: flex; justify-content: flex-end; }
.t4h7-saldos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.t4h7-aviso { margin: 9px 0 0; font-size: 12.5px; color: ${C.texto2}; text-align: center; }
`;

const elegirSerie = (xs) => xs[Math.floor(Math.random() * xs.length) % xs.length];

/* Una sección de una libreta: su rótulo, sus montos (tres renglones reservados) y el hueco de su marca. */
function Seccion({ k, rotulo, libreta, lineas, activo, marca, onElegir }) {
  return (
    <button type="button" className="t4lb-s" data-destino={k} data-marca={marca ?? undefined} disabled={!activo} onClick={() => onElegir(k)} aria-label={`${libreta}: ${rotulo}`}>
      <b>{rotulo}</b>
      <span className="t4lb-ls">{lineas.map((l) => <span key={l.id} className={`t4r-nueva${l.foco ? " t4lb-f" : ""}`} data-linea={l.id}>{cifra(l.v)}</span>)}</span>
      <span className="t4lb-hueco"><Marca marca={marca} /></span>
    </button>
  );
}

export default function ConciliaLaCuenta({ Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? sortearH7(elegirSerie, barajar));
  const { serie: s, partidas } = t.items;
  const [r, setR] = useState(null); /* fase 1: { seccion, ok, texto, aplicado } */
  const [puestas, setPuestas] = useState([]); /* las partidas ya escritas, en su sección correcta */
  const [fase, setFase] = useState(1);
  const [saldos, setSaldos] = useState({ banco: "", libros: "" });
  const [aviso, setAviso] = useState(false);
  const [r2, setR2] = useState(null); /* fase 2: { ok, bien, texto, banco, libros, aplicado } */
  const [bien, setBien] = useState(0);
  const reloj = useRef(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);
  const enfocar = useRef(false);
  const p = partidas[t.i];
  const cuantas = partidas.length;

  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (t.terminado && !modoDemo) {
      const sb = r2 ? Number(r2.bien.banco) + Number(r2.bien.libros) : 0;
      onCompletar?.(puntuarH7(bien, sb), Date.now() - t.inicio.current, t.detalle.current);
    }
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if ((r?.aplicado || r2?.aplicado) && !modoDemo) zonaBoton.current?.querySelector("button")?.focus(); }, [r?.aplicado, r2?.aplicado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (enfocar.current) { enfocar.current = false; tarjeta.current?.focus(); } }, [t.i]);

  const poner = (x) => setPuestas((ps) => (ps.some((y) => y.id === x.id) ? ps : [...ps, { id: x.id, seccion: x.va, monto: x.monto }]));

  const elegir = (seccion) => {
    if (r || fase !== 1) return;
    const v = evaluarPartidaH7(p, seccion);
    t.anotar(p.id, v.ok, seccion);
    if (v.ok) { setBien((n) => n + 1); poner(p); setR({ seccion, ...v, aplicado: true }); return; }
    setR({ seccion, ...v, aplicado: false });
    reloj.current = setTimeout(() => { poner(p); setR((x) => (x ? { ...x, aplicado: true } : x)); }, ESPERA_ERROR_MS);
  };
  const avanzar = () => {
    clearTimeout(reloj.current);
    poner(p);
    setR(null);
    if (t.i + 1 < cuantas) { enfocar.current = true; t.setI(t.i + 1); } else setFase(2);
  };
  const comprobar = () => {
    if (r2) return;
    const b = leerCifra(saldos.banco), l = leerCifra(saldos.libros);
    if (b == null || l == null) { setAviso(true); return; }
    setAviso(false);
    const v = evaluarSaldosH7(s, b, l);
    t.anotar("saldo-banco", v.bien.banco, String(b));
    t.anotar("saldo-libros", v.bien.libros, String(l));
    setR2({ ...v, banco: b, libros: l, aplicado: v.ok });
    if (!v.ok) reloj.current = setTimeout(() => setR2((x) => (x ? { ...x, aplicado: true } : x)), ESPERA_SALDOS_MS);
  };
  const terminar = () => { clearTimeout(reloj.current); t.setTerminado(true); };
  const reiniciar = () => {
    clearTimeout(reloj.current); t.reiniciar();
    setR(null); setPuestas([]); setFase(1); setSaldos({ banco: "", libros: "" }); setAviso(false); setR2(null); setBien(0);
  };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <div data-t4-h7 data-fin>
          <Cierre pct={Math.round(puntuarH7(bien, r2 ? Number(r2.bien.banco) + Number(r2.bien.libros) : 0))} onReiniciar={reiniciar} textoReiniciar={BOTON_H7.otraVez}>
            <p data-resumen style={TEXTO_CIERRE}>{resumenH7(bien)}</p>
            <p data-cierre style={{ ...TEXTO_CIERRE, marginTop: "8px" }}>{s.cierre}</p>
            <p data-pie-cierre style={{ margin: "6px 0 0", fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.texto2 }}>{CIERRE_PIE_H7}</p>
          </Cierre>
        </div>
      </Marco>
    );
  }

  const recien = fase === 1 && r?.aplicado ? p.id : null;
  const lineasDe = (k) => puestas.filter((x) => x.seccion === k).map((x) => ({ id: x.id, v: x.monto, foco: x.id === recien }));
  const marcas = {};
  if (fase === 1 && r) { marcas[r.seccion] = r.ok ? "bien" : "mal"; if (!r.ok && r.aplicado) marcas[p.va] = "era"; }
  const libreta = (lado, nombre, sub) => (
    <div className="t4lb-l" data-libreta={lado}>
      <span className="t4lb-n"><span>{nombre}</span><span>{sub}</span></span>
      {[["mas", ROTULOS_H7.mas], ["menos", ROTULOS_H7.menos]].map(([signo, rot]) => {
        const k = `${lado}:${signo}`;
        return <Seccion key={k} k={k} rotulo={rot} libreta={nombre} lineas={lineasDe(k)} activo={fase === 1 && !r} marca={marcas[k]} onElegir={elegir} />;
      })}
    </div>
  );

  /* El par: los saldos de partida; con la fase 2 comprobada, lo escrito y, después, la verdad. */
  const izq = !r2 ? s.extracto : r2.aplicado ? s.conciliadoBanco : r2.banco;
  const der = !r2 ? s.libros : r2.aplicado ? s.conciliadoLibros : r2.libros;
  const igual = Boolean(r2?.aplicado);
  const par = (
    <ParConLector
      izq={{ r: ROTULOS_H7.parBanco, v: izq, foco: Boolean(r2) }}
      der={{ r: ROTULOS_H7.parLibros, v: der, foco: Boolean(r2) }}
      igual={igual}
      lector={lectorParH7(cifra(izq), cifra(der))}
    />
  );
  const msg = fase === 1 ? (r ? { ok: r.ok, texto: r.texto, pagina: p.pagina } : null) : (r2 ? { ok: r2.ok, texto: r2.texto, pagina: PIE_FASE2_H7 } : null);
  const marcaCampo = (lado) => (r2 ? (r2.bien[lado] ? MARCA_CIFRA_BIEN : MARCA_CIFRA_MAL) : null);

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T4R + CSS_TABLERO + CSS_H7 + CSS_HACER}</style>
      <div {...(modoDemo ? { "data-t4-h7-demo": "" } : { "data-t4-h7": "" })} data-fase={fase} data-serie={s.id}>
        {!modoDemo && (
          <>
            <Encabezado consigna={H7.consigna} onComoSeJuega={onComoSeJuega} />
            <div style={{ marginBottom: "12px" }}>
              <Pulsos total={cuantas + 1} hechos={fase === 2 ? cuantas : t.i} enCurso={fase === 2 ? cuantas + 1 : t.i + 1} etiqueta="Paso" />
            </div>
          </>
        )}
        <figure className="t4r" style={{ margin: 0 }} data-figura="libretas" aria-describedby={modoDemo ? undefined : "t4h7-alt"}>
          {fase === 1 && par}
          {fase === 1 && (
            <div className="t4h7-t t4r-nueva" key={p.id} data-tarjeta-partida={p.id}>
              <p ref={tarjeta} tabIndex={-1} data-hecho>{p.texto}</p>
              <span data-monto>{cifra(p.monto)}</span>
            </div>
          )}
          <div className="t4lb">
            {libreta("banco", ROTULOS_H7.banco, ROTULOS_H7.bancoSub)}
            {libreta("libros", ROTULOS_H7.libros, ROTULOS_H7.librosSub)}
          </div>
          {fase === 2 && (
            <div className="t4h7-saldos" data-saldos>
              <Campo id="banco" rotulo={ROTULOS_H7.campoBanco} valor={saldos.banco} bloqueado={Boolean(r2)} marca={marcaCampo("banco")} onCambio={(v) => setSaldos((x) => ({ ...x, banco: v }))} />
              <Campo id="libros" rotulo={ROTULOS_H7.campoLibros} valor={saldos.libros} bloqueado={Boolean(r2)} marca={marcaCampo("libros")} onCambio={(v) => setSaldos((x) => ({ ...x, libros: v }))} />
            </div>
          )}
          {fase === 2 && par}
          {!modoDemo && <figcaption id="t4h7-alt" className="t4f-sr">{ALT_FIGURA_H7}</figcaption>}
        </figure>
        <div className="t4r" data-retro aria-live="polite" aria-atomic="true">
          {msg && <div style={{ marginTop: "12px" }}><Mensaje ok={msg.ok} texto={msg.texto} pagina={msg.pagina} /></div>}
        </div>
        {fase === 2 && !r2 && (
          <div className="t4r" style={{ marginTop: "14px" }}>
            <button type="button" className="t4r-btn" data-boton="comprobar" onClick={comprobar}>{BOTON_H7.comprobar}</button>
            {aviso && <p className="t4h7-aviso" data-aviso>{FALTAN_SALDOS}</p>}
          </div>
        )}
        {fase === 1 && r && !modoDemo && (
          <div className="t4r"><SeguirHacer refZona={zonaBoton} onClick={avanzar}>{t.i + 1 === cuantas ? BOTON_H7.aLosSaldos : BOTON_H7.siguiente}</SeguirHacer></div>
        )}
        {fase === 2 && r2 && !modoDemo && (
          <div className="t4r"><SeguirHacer refZona={zonaBoton} onClick={terminar}>{BOTON_H7.verResumen}</SeguirHacer></div>
        )}
      </div>
    </Marco>
  );
}
