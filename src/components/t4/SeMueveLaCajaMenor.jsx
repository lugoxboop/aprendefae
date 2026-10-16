/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · HACER 3 · ¿SE MUEVE LA CAJA MENOR? — rediseño de enganche (Célula D).
 *
 * Diseño: Hanayama, «el tablero y el sobre» (celula-d/hanayama-h3-
 * rediseno.md); textos de Katsumi; corte de Yujiro. Portado del prototipo
 * congelado (t4r/H3R.jsx).
 *
 * De arriba abajo, en la figura: la tarjeta de la operación (texto y monto),
 * el tablero de las cuatro cuentas, el sobre del encargado y «lo que dice el
 * libro» de Caja menor. El estudiante pone una ficha al debe y otra al haber
 * (una cuenta no va a los dos lados) y comprueba. Un intento por operación.
 *
 *   · acierto: el monto se suma al total de cada mitad, que cuenta hasta su
 *     valor; ✓ en las dos; el sobre pasa a su estado nuevo, y el libro dice
 *     lo mismo que el sobre («= sobre»)
 *   · error: las mitades mal elegidas quedan con relleno, ✗ y coral, y no se
 *     escribe nada; si el asiento toca Caja menor, la línea «diría» compara
 *     el libro que daría ESE asiento con el sobre de después. A los 0,7 s se
 *     escribe el asiento correcto («Iba aquí», borde blanco), porque la
 *     operación siguiente parte de ese fondo
 *   · el acierto con ✓ y borde blanco, NUNCA teal ni ámbar: por eso no usa
 *     ConstructorAsiento ni Opcion compartidos. «Siguiente operación» en el
 *     Responder compartido, teal (Avance)
 *   · «Operación n de 4» y el pulso activo coinciden: la operación respondida
 *     no cuenta como hecha hasta tocar «Siguiente»
 *   · mientras se pregunta, nada de la respuesta está en el DOM (PH8-2): ni la
 *     devolución, ni la línea «diría» (su hueco guarda un espacio duro)
 *   · en modo demo («Así se juega») no dibuja Encabezado ni Pulsos, pero SÍ
 *     «Comprobar»: el guion de la mano lo toca (Katsumi, «Para Baki»)
 *
 * Piezas compartidas, SIN CAMBIOS: Encabezado, Pulsos, Cierre, useTanda,
 * useNumeroQueSube. Al terminar: onCompletar(pct, ms, detalle); en el error,
 * el detalle guarda el asiento armado («debe / haber»).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useRef, useState } from "react";
import { Pulsos, Cierre } from "../mecanicas/corazon/juego.jsx";
import { TEXTO_CIERRE } from "../mecanicas/bloques/marcos.jsx";
import { useTanda } from "../mecanicas/libros/piezas.jsx";
import { useNumeroQueSube } from "../mecanicas/libros/verbos.jsx";
import { Encabezado } from "../mecanicas/libros/tema1/encabezado.jsx";
import {
  H3, CUENTAS_H3, CAJA_MENOR, BOTON_H3, ROTULOS_H3, CIERRE_H3, ALT_FIGURA_H3, AVISO_H3,
  resumenH3, sortearH3, evaluarH3, puntuarH3, libroCajaMenor, conAsiento, sobreSuma,
} from "../../data/contabilidadT4H3.js";
import { ESPERA_ERROR_MS, cifra } from "../../data/contabilidadT4Hacer.js";
import { C, CSS_T4R, Mensaje, Avance, IconoMal } from "./comun.jsx";
import { Tablero, CSS_TABLERO } from "./tablero.jsx";
import { VACIO, CSS_HACER, mostrarTramo } from "./hacerComun.jsx";

export const CSS_H3 = `
.t4h3-op { display: grid; gap: 4px; border: 1px solid ${C.reposo}; border-radius: 8px; padding: 8px 12px; }
.t4h3-op p { margin: 0; font-size: 15px; line-height: 22px; min-height: 88px; overflow-wrap: anywhere; outline: none; }
.t4h3-op > span { justify-self: end; font: 600 15px/1.2 "Inter", sans-serif; font-variant-numeric: tabular-nums; }
.t4h3-sobre { display: grid; gap: 2px; border: 1px solid ${C.neutro}; border-radius: 0 0 10px 10px; border-top: none; padding: 6px 12px 8px; position: relative; }
.t4h3-f { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; font-size: 13px; line-height: 1.5; color: ${C.texto2}; }
.t4h3-f > span { white-space: nowrap; }
.t4h3-f > span:last-child { font: 500 15px/1.4 "Inter", sans-serif; font-variant-numeric: tabular-nums; color: ${C.texto}; }
.t4h3-f.t4h3-s { border-top: 1px solid rgba(248,249,250,0.22); padding-top: 2px; color: ${C.texto}; }
.t4h3-libro { display: flex; justify-content: space-between; align-items: center; gap: 8px; border: 1px solid ${C.neutro}; border-radius: 10px; padding: 6px 12px; min-height: 40px; }
.t4h3-libro > span { white-space: nowrap; }
.t4h3-rot { font: 500 12px/1.3 "Inter", sans-serif; letter-spacing: .04em; color: ${C.texto2}; margin: 6px 0 0; }
.t4h3-diria { margin: 0; font-size: 13px; line-height: 1.4; min-height: 19px; color: ${C.texto}; overflow-wrap: anywhere; }
`;

function Cifra({ v }) { const x = useNumeroQueSube(v); return <>{cifra(x)}</>; }

/* El sobre del encargado y lo que dice el libro de Caja menor. `diria`: el texto de la línea, o null. */
function Sobre({ rotulo, billetes, soportes, libro, diria }) {
  const suman = billetes + soportes;
  return (
    <div style={{ display: "grid", gap: "4px" }} data-sobre={suman}>
      <p className="t4h3-rot">{rotulo}</p>
      <svg aria-hidden="true" viewBox="0 0 100 18" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "18px", margin: "4px 0 -2px" }}>
        <path d="M0 18 L0 1 L100 1 L100 18 M0 1 L50 17 L100 1" fill="none" stroke={C.neutro} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="t4h3-sobre">
        <div className="t4h3-f" data-fila-sobre="billetes"><span>{ROTULOS_H3.billetes}</span><span><Cifra v={billetes} /></span></div>
        {/* Los soportes solo en el reembolso; si no, la fila guarda su sitio vacía. */}
        <div className="t4h3-f" data-fila-sobre="soportes">{soportes ? <><span>{ROTULOS_H3.soportes}</span><span>{cifra(soportes)}</span></> : <span>{VACIO}</span>}</div>
        <div className="t4h3-f t4h3-s" data-fila-sobre="suman"><span>{ROTULOS_H3.suman}</span><span><Cifra v={suman} /></span></div>
      </div>
      <p className="t4h3-rot">{ROTULOS_H3.libro}</p>
      <div className="t4h3-libro" data-libro={libro}>
        <span style={{ font: "600 13px/1.3 Sora, Inter, sans-serif" }}>{ROTULOS_H3.cuenta}</span>
        <span style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
          <span style={{ font: "500 15px/1.3 Inter, sans-serif", fontVariantNumeric: "tabular-nums" }}><Cifra v={libro} /></span>
          <span data-igual-sobre={libro === suman ? "" : undefined} style={{ font: "600 15px/1 Inter, sans-serif" }}>{libro === suman ? ROTULOS_H3.igual : VACIO}</span>
        </span>
      </div>
      <p className="t4h3-diria" data-diria={diria ? "" : undefined}>
        {diria ? <><span aria-hidden="true" style={{ display: "inline-flex", verticalAlign: "-3px", marginRight: "6px" }}><IconoMal /></span>{diria}</> : VACIO}
      </p>
    </div>
  );
}

export default function SeMueveLaCajaMenor({ Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? sortearH3());
  const serie = t.items;
  const ops = serie.ops;
  const cuantos = ops.length;
  const [puestas, setPuestas] = useState({ debe: null, haber: null });
  const [r, setR] = useState(null); /* { ok, texto, diria, a, aplicado } */
  const [totales, setTotales] = useState({});
  const [bien, setBien] = useState(0);
  const reloj = useRef(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);
  const enfocar = useRef(false);
  const op = ops[t.i];

  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(puntuarH3(bien, cuantos), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  /* Con el veredicto aplicado, el foco lo pone mostrarTramo: al botón si entra con el tramo; si no, a la devolución. */
  useEffect(() => { if (enfocar.current) { enfocar.current = false; tarjeta.current?.focus(); } }, [t.i]);

  const escribir = () => setTotales((x) => conAsiento(x, op.debe, op.haber, op.monto));

  const elegir = (cuenta, lado) => {
    if (r) return;
    setPuestas((p) => {
      const otro = lado === "debe" ? "haber" : "debe";
      const n = { ...p, [lado]: p[lado] === cuenta ? null : cuenta };
      if (n[otro] === cuenta) n[otro] = null; /* una cuenta no va a los dos lados */
      return n;
    });
  };
  const listo = Boolean(puestas.debe && puestas.haber);

  /* «Comprobar» nunca se apaga (P2 de Hanayama, §5.3): con una mitad sin poner, avisa. */
  const [aviso, setAviso] = useState(false);
  const comprobar = () => {
    if (r) return;
    if (!listo) { setAviso(true); return; }
    setAviso(false);
    const a = { debe: puestas.debe, haber: puestas.haber };
    const v = evaluarH3(op, a, totales);
    /* En el error se guarda el asiento armado: eso le dice algo al docente. */
    t.anotar(op.id, v.ok, v.respuesta);
    if (v.ok) { setBien((n) => n + 1); escribir(); setR({ ...v, a, aplicado: true }); return; }
    setR({ ...v, a, aplicado: false });
    reloj.current = setTimeout(() => { escribir(); setR((x) => (x ? { ...x, aplicado: true } : x)); }, ESPERA_ERROR_MS);
  };

  const avanzar = () => {
    clearTimeout(reloj.current);
    /* Si se avanza antes de que el asiento correcto se escriba, se escribe ahora: la operación siguiente parte de ahí. */
    if (r && !r.aplicado) escribir();
    setR(null); setPuestas({ debe: null, haber: null });
    if (t.i + 1 < cuantos) { enfocar.current = true; t.setI(t.i + 1); } else t.setTerminado(true);
  };

  const retro = useRef(null);
  /* La pastilla tocada más alta y el pie de la devolución, en un solo desplazamiento (hacerComun.jsx). */
  useEffect(() => { if (r && !modoDemo) mostrarTramo(retro.current?.closest("[data-t4-h1], [data-t4-h3], [data-t4-h4], [data-t4-h7], [data-t4-h8]"), { enfocar: Boolean(r?.aplicado) }); }, [Boolean(r), r?.aplicado]); // eslint-disable-line react-hooks/exhaustive-deps
  const reiniciar = () => { clearTimeout(reloj.current); t.reiniciar(); setR(null); setPuestas({ debe: null, haber: null }); setTotales({}); setBien(0); setAviso(false); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <div data-t4-h3 data-fin>
          <Cierre pct={Math.round(puntuarH3(bien, cuantos))} onReiniciar={reiniciar} textoReiniciar={BOTON_H3.otraVez}>
            <p data-resumen style={TEXTO_CIERRE}>{resumenH3(bien)}</p>
            <p data-cierre style={{ ...TEXTO_CIERRE, marginTop: "8px" }}>{CIERRE_H3.texto}</p>
            <p data-pie-cierre style={{ margin: "6px 0 0", fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.texto2 }}>{CIERRE_H3.pie}</p>
          </Cierre>
        </div>
      </Marco>
    );
  }

  /* Las marcas: ✓ en lo bien elegido, ✗ en lo mal elegido y, ya escrito el asiento correcto, «Iba aquí». */
  const marcas = {};
  if (r) {
    if (r.ok) { marcas[`${op.debe}:debe`] = "bien"; marcas[`${op.haber}:haber`] = "bien"; }
    else {
      marcas[`${r.a.debe}:debe`] = r.a.debe === op.debe ? "bien" : "mal";
      marcas[`${r.a.haber}:haber`] = r.a.haber === op.haber ? "bien" : "mal";
      if (r.aplicado) {
        if (r.a.debe !== op.debe) marcas[`${op.debe}:debe`] = "era";
        if (r.a.haber !== op.haber) marcas[`${op.haber}:haber`] = "era";
      }
    }
  }
  const sobre = r?.aplicado ? op.despues : op.antes;
  const libro = libroCajaMenor(totales);

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T4R + CSS_TABLERO + CSS_H3 + CSS_HACER}</style>
      {/* La partida lleva `data-t4-h3`; la demo de «Así se juega», `data-t4-h3-demo`. */}
      <div {...(modoDemo ? { "data-t4-h3-demo": "" } : { "data-t4-h3": "" })} data-serie={serie.id}>
        {!modoDemo && (
          <>
            <Encabezado objetivo={H3.objetivo} consigna={H3.consigna} onComoSeJuega={onComoSeJuega} />
            <div style={{ marginBottom: "12px" }}>
              <Pulsos total={cuantos} hechos={t.i} enCurso={t.i + 1} etiqueta="Operación" />
            </div>
          </>
        )}
        <figure className="t4r" style={{ margin: 0 }} data-figura="tablero-caja-menor" aria-describedby={modoDemo ? undefined : "t4h3-alt"}>
          <div className="t4h3-op t4r-nueva" key={op.id} data-tarjeta-op={op.id}>
            <p ref={tarjeta} tabIndex={-1} data-hecho>{op.texto}</p>
            <span data-monto>{cifra(op.monto)}</span>
          </div>
          <Tablero
            cuentas={CUENTAS_H3}
            totales={totales}
            puestas={r && !r.ok ? { debe: r.a.debe, haber: r.a.haber } : puestas}
            monto={cifra(op.monto)}
            onElegir={elegir}
            activo={!r}
            marcas={marcas}
            recien={r?.aplicado ? [`${op.debe}:debe`, `${op.haber}:haber`] : []}
            etiqueta={H3.nombre}
          />
          {/* La devolución: región viva, vacía mientras se pregunta. Va justo debajo del tablero, antes del sobre y del libro, para que con el error la pastilla de la mitad tocada y la devolución entren a la vez en la ventana (decisión de Yujiro sobre la parada de Hanayama, P2 §11). */}
          <div className="t4r" data-retro aria-live="polite" aria-atomic="true" ref={retro}>
            {r && <Mensaje ok={r.ok} texto={r.texto} pagina={op.pagina} />}
          </div>
          <Sobre rotulo={serie.rotuloSobre} billetes={sobre.billetes} soportes={sobre.soportes} libro={libro} diria={r && !r.ok ? r.diria?.texto ?? null : null} />
          {!modoDemo && <figcaption id="t4h3-alt" className="t4f-sr">{ALT_FIGURA_H3}</figcaption>}
        </figure>
        {/* «Comprobar» también en la demo: la mano lo toca. */}
        {!r && (
          <div className="t4r" style={{ marginTop: "14px" }}>
            <Avance nombre="comprobar" onClick={comprobar}>{BOTON_H3.comprobar}</Avance>
            <p className="t4r-aviso" data-aviso aria-live="polite">{aviso && !listo ? AVISO_H3 : null}</p>
          </div>
        )}
        {r && !modoDemo && (
          <div className="t4r">
            <Avance refZona={zonaBoton} onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H3.verResumen : BOTON_H3.siguiente}</Avance>
          </div>
        )}
      </div>
    </Marco>
  );
}

/* Para quien quiera la suma del sobre (pruebas, sonda): la misma regla que pinta la figura. */
export { sobreSuma, CAJA_MENOR };
