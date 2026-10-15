import { useLayoutEffect, useRef, useState } from "react";
import { C, INTER, SORA } from "./comun.jsx";
import { OpcionR5 } from "./OpcionR5.jsx";
import { pesos } from "../../data/contabilidad.js";
import { INTERFAZ_R5_1, UNIDADES_POR_CAJA, acumuladosDeC9, cuentaDeC9, pesosConCentavos } from "../../data/repasoCap5Cruzado.js";
import { useReducido, useTemporizadores, useCifra, terminarAnimaciones, llevarArriba, volarDesde } from "./movimiento.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PANTALLA 5 · C.9 «Mezcla los lotes» (Itagaki, §a; v2.1, decisión 2).
 *
 * Tres lotes; todo el renglón de cada uno es el botón. Tocar un lote vacía
 * sus cajas en el estante común (400 ms, 15 ms de desfase; 1 caja = 10 u): el
 * lote queda con los contornos de sus cajas y se desactiva, y «Costo total» y
 * «Unidades» suman (300 ms). Orden libre. La figura NO hace la división que se
 * evalúa: solo acumula.
 *
 * Tras el tercero: pausa de 400 ms, salen 22,5 cajas por la derecha (400 ms)
 * y quedan dos y media; aparece «Salen 225 u · Quedan 25 u». Después se
 * despliegan las cuatro opciones y la página deja «Costo total» a 16 px del
 * borde superior de la ventana útil. Al responder, entre las opciones y la
 * devolución aparece «Costo de cada unidad · $21,04».
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CAJA = 12;
const HUECO = 3;
const VUELO_MS = 400;
const DESFASE_MS = 15;
const ROTULO_MS = 300;
const PAUSA_MS = 400;
const SALIDA_MS = 400;
const DESPLIEGUE_MS = 300;

function Caja({ estilo, refCaja, dato }) {
  return <span ref={refCaja} data-caja={dato} style={{ width: `${CAJA}px`, height: `${CAJA}px`, borderRadius: "2px", background: C.hecho, flexShrink: 0, boxSizing: "border-box", ...estilo }} />;
}

/* «—» mientras no hay nada; luego la cifra, que cuenta desde la anterior. */
function Rotulo({ id, rotulo, valor, previo, formato, refRotulo }) {
  const pintado = useCifra(valor ?? 0, ROTULO_MS, previo ?? 0);
  return (
    <div ref={refRotulo} data-rotulo-lotes={id} data-valor={valor ?? "vacio"} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: "40px", gap: "12px" }}>
      <span style={{ fontFamily: INTER, fontSize: "13px", color: C.atenuado }}>{rotulo}</span>
      <span style={{ fontFamily: SORA, fontSize: "24px", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: C.texto, whiteSpace: "nowrap" }}>
        {valor === null ? "—" : formato(Math.round(pintado))}
      </span>
    </div>
  );
}

export function Lotes({ pantalla, onCalificar }) {
  const reducido = useReducido();
  const { despues } = useTemporizadores();
  const [orden, setOrden] = useState([]);
  const [salida, setSalida] = useState("no");
  const [elegida, setElegida] = useState(null);
  const figura = useRef(null);
  const costoTotal = useRef(null);
  const opciones = useRef(null);
  const cajasDeLote = useRef({});
  const enEstante = useRef({});
  const vuelo = useRef(null);

  const { lotes } = pantalla;
  const c = cuentaDeC9(pantalla);
  const acumulados = acumuladosDeC9(pantalla, orden);
  const ultimo = acumulados.at(-1) ?? null;
  const previo = acumulados.at(-2) ?? null;
  const cajasDe = (k) => lotes[k].unidades / UNIDADES_POR_CAJA;
  /* Las cajas del estante, en el orden en que llegaron: [lote, n]. */
  const estante = orden.flatMap((k) => Array.from({ length: cajasDe(k) }, (_, j) => `${k}-${j}`));
  const quedanCajas = c.quedan / UNIDADES_POR_CAJA;

  const vaciar = (k, evento) => {
    evento.stopPropagation();
    terminarAnimaciones(figura.current);
    if (orden.includes(k)) return;
    vuelo.current = { k, rects: Array.from({ length: cajasDe(k) }, (_, j) => cajasDeLote.current[`${k}-${j}`]?.getBoundingClientRect() ?? null) };
    const nuevo = [...orden, k];
    setOrden(nuevo);
    if (nuevo.length === lotes.length) {
      if (reducido) { setSalida("lista"); return; }
      despues(VUELO_MS + PAUSA_MS, () => {
        setSalida("saliendo");
        despues(SALIDA_MS, () => setSalida("lista"));
      });
    }
  };

  useLayoutEffect(() => {
    const v = vuelo.current;
    if (!v) return;
    vuelo.current = null;
    v.rects.forEach((r, j) => volarDesde(enEstante.current[`${v.k}-${j}`], r, VUELO_MS, { retraso: j * DESFASE_MS, reducido }));
  }, [orden.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (salida !== "lista") return;
    if (!reducido && opciones.current?.animate) {
      opciones.current.animate([{ opacity: 0, transform: "translateY(-8px)" }, { opacity: 1, transform: "none" }], { duration: DESPLIEGUE_MS, easing: "ease-out" });
    }
    llevarArriba(costoTotal.current, reducido);
  }, [salida]); // eslint-disable-line react-hooks/exhaustive-deps

  const elegir = (id) => {
    if (elegida) return;
    setElegida(id);
    onCalificar?.({ ok: Boolean(pantalla.opciones.find((o) => o.id === id)?.correcta), elegida: id });
  };
  const estadoDe = (o) => {
    if (!elegida) return null;
    if (o.id === elegida) return o.correcta ? "correcta" : "incorrecta";
    return o.correcta ? "revelada" : null;
  };

  /* La caja del estante según la salida: las 22,5 se van por la derecha. */
  const estiloEnEstante = (i) => {
    const entera = Math.floor(quedanCajas);
    if (salida === "no") return {};
    if (i < entera) return {};
    if (i === entera) return { width: `${CAJA / 2}px`, borderRadius: "2px 0 0 2px", transition: reducido || salida === "lista" ? "none" : `width ${SALIDA_MS}ms ease-in` };
    if (salida === "lista") return { display: "none" };
    return { transform: "translateX(48px)", opacity: 0, transition: `transform ${SALIDA_MS}ms ease-in, opacity ${SALIDA_MS}ms ease-in` };
  };

  return (
    <div data-pantalla-lotes>
      <div ref={figura} data-figura="lotes" data-salida={salida} onClick={() => terminarAnimaciones(figura.current)} style={{ background: C.navy, borderRadius: "12px", padding: "12px" }}>
        {lotes.map((l, k) => {
          const vacio = orden.includes(k);
          return (
            <button
              key={l.marca}
              type="button"
              data-lote={k + 1}
              data-vacio={vacio ? "si" : "no"}
              disabled={vacio}
              onClick={(e) => vaciar(k, e)}
              style={{
                display: "block", width: "100%", minHeight: "48px", marginTop: k ? "8px" : 0, padding: "4px 0", boxSizing: "border-box",
                background: "transparent", border: "none", textAlign: "left", color: C.texto, cursor: vacio ? "default" : "pointer",
              }}
            >
              <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
                <span data-marca-lote style={{ fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: C.atenuado }}>{l.marca}</span>
                <span style={{ fontFamily: INTER, fontSize: "14px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: C.texto, whiteSpace: "nowrap" }}>
                  {INTERFAZ_R5_1.unidadesACosto(l.unidades, l.costo)}
                </span>
              </span>
              <span aria-hidden="true" style={{ display: "flex", gap: `${HUECO}px`, marginTop: "6px" }}>
                {Array.from({ length: cajasDe(k) }, (_, j) => (
                  <Caja
                    key={j}
                    dato={vacio ? "contorno" : "llena"}
                    refCaja={(el) => { cajasDeLote.current[`${k}-${j}`] = el; }}
                    estilo={vacio ? { background: "transparent", border: `1.5px dashed ${C.atenuado}` } : {}}
                  />
                ))}
              </span>
            </button>
          );
        })}
        <span aria-hidden="true" style={{ display: "block", height: "1px", margin: "12px 0", background: "rgba(184,196,212,0.25)" }} />
        <p style={{ margin: 0, fontFamily: INTER, fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", lineHeight: "16px", color: C.atenuado }}>{INTERFAZ_R5_1.estanteComun}</p>
        <div data-estante-comun aria-hidden="true" style={{ display: "flex", flexWrap: "wrap", gap: `${HUECO}px`, minHeight: "27px", marginTop: "6px", overflow: "hidden" }}>
          {estante.map((id, i) => (
            <Caja key={id} dato="estante" refCaja={(el) => { enEstante.current[id] = el; }} estilo={estiloEnEstante(i)} />
          ))}
        </div>
        <div style={{ marginTop: "12px" }}>
          <Rotulo id="costo" refRotulo={costoTotal} rotulo={INTERFAZ_R5_1.costoTotal} valor={ultimo?.costo ?? null} previo={previo?.costo} formato={pesos} />
          <Rotulo id="unidades" rotulo={INTERFAZ_R5_1.unidades} valor={ultimo?.unidades ?? null} previo={previo?.unidades} formato={String} />
        </div>
        {salida === "lista" && (
          <p data-salen-quedan style={{ margin: "4px 0 0", minHeight: "20px", fontFamily: INTER, fontSize: "14px", fontWeight: 600, lineHeight: "20px", color: C.texto }}>
            {INTERFAZ_R5_1.salenQuedan(pantalla.vendidas, c.quedan)}
          </p>
        )}
      </div>
      {salida === "lista" && (
        <div ref={opciones} data-opciones-lotes>
          {pantalla.opciones.map((o) => (
            <div key={o.id} data-opcion={o.id} style={{ marginTop: "8px" }}>
              <OpcionR5 estado={estadoDe(o)} deshabilitada={Boolean(elegida)} etiqueta={pesos(o.valor)} onClick={() => elegir(o.id)}>
                <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{pesos(o.valor)}</span>
              </OpcionR5>
            </div>
          ))}
          {elegida && (
            <p data-costo-unidad style={{ margin: "14px 0 0", fontFamily: INTER, fontSize: "15px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: C.texto }}>
              {`${INTERFAZ_R5_1.costoUnidad} · ${pesosConCentavos(c.promedio)}`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
