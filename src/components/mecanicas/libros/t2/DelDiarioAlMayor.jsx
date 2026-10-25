import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { DEBE, COLOR_LADO, pesos } from "../../../../data/contabilidad.js";
import { ACIERTO_REVISAR, CONSIGNAS_DIARIO, IBA_REVISAR, OBJETIVO_T2_NUEVAS, PIE_T2_NUEVAS } from "../../../../data/contabilidadT2HacerNuevas.js";
import {
  cuentasDe, evaluarDiario, mayorCon, mayorRevisar, pasadosDe, prepararDiario, puntuar, renglonesDe,
} from "../../../../contabilidad/t2HacerNuevas.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { CuentaT, Responder, useRelojes, useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { RETARDO_IBA_MS } from "../tema3/segundaDecision.jsx";
import { Devolucion, OpcionC } from "../t7/hacerT7.jsx";
import { CORAL_B, IconoX, Pastilla, REVELADA, TACHADA, botonDeAvance } from "../b5/Devolucion.jsx";
import {
  CSS_T2_NUEVAS, CSS_T2_DELTA, Consecuencia, PAUSA_VEREDICTO_MS, Pie, RAIZ_T2, ROTULO_T2, movimientoReducido,
} from "./comunT2.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · 9.º HACER · DEL DIARIO AL MAYOR (cu-del-diario-al-mayor). Célula C.
 *
 * Los dos libros a la vista a la vez: arriba el diario, por fecha; abajo el
 * mayor, por cuenta, en una cuadrícula 2 × 2 de cuentas T compactas (CuentaT
 * compacta, sin cambiarla). Como mucho 4 cuentas y 7 renglones por caso.
 *
 *   destino  un renglón del diario está marcado; se toca la cuenta del mayor.
 *            El lado NO se elige: se copia del diario (eso es «¿Debita o
 *            acredita?»). Aquí se enseña a agrupar.
 *   origen   una línea del mayor está encendida; se toca su renglón.
 *   revisar  el punteo (Mello §1.2, Near y Watari T2-4 §2): el mayor llega
 *            ya pasado, con una línea mal pasada; cada línea de las T es un
 *            botón de 44 px. Al tocarla se enciende su renglón del diario y
 *            sale el cotejo Diario/Mayor (Cuenta, Lado, Monto, con «=» o
 *            «≠»), CALCULADO comparando. A los 380 ms, el veredicto.
 *
 * Un intento por ítem. El error se queda a la vista: la ficha cae en la cuenta
 * equivocada, con borde coral y «No va aquí», y la correcta lleva «Iba aquí».
 * Al acertar, el renglón queda enlazado en los dos libros y aparece «Por fecha
 * / Por cuenta», que reordena los mismos renglones y no califica.
 *
 * El saldo queda fuera: lo practica «El saldo de la cuenta» (decisión de L).
 * El banco es el de Near (lote T2-2, §1.2, y delta T2-4 §2): dos casos de 5
 * renglones y 7 ítems (3 destino, 2 origen y 2 revisar, al final) que se
 * alternan por intento. El mayor llega con los renglones de origen ya
 * pasados, y la cuadrícula de T se baraja en cada intento (H6). Al responder el último, el
 * cierre del caso («El diario suma… El mayor suma lo mismo») se lee sin
 * calificar: es la comprobación final que pide Mello.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CIFRA = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontVariantNumeric: "tabular-nums" };

function Renglon({ r, marcado, enlazado }) {
  return (
    /* Watari T2-3 (.ren2): la cuenta en su propia línea; el lado y el monto, debajo. */
    <span data-renglon={r.k} data-marcado={marcado ? "true" : undefined} data-enlazado={enlazado ? "true" : undefined} style={{
      display: "grid", gridTemplateColumns: "3.4em minmax(0, 1fr) auto", gridTemplateAreas: '"f c c" "f l m"', columnGap: "6px", rowGap: 0, alignItems: "baseline",
      fontSize: "13px", lineHeight: 1.35, color: FAE.text, width: "100%",
    }}>
      <span style={{ gridArea: "f", alignSelf: "start", fontSize: "12px", color: "rgba(248,249,250,0.7)" }}>{r.fecha}</span>
      <span style={{ gridArea: "c", minWidth: 0, overflowWrap: "break-word" }}>{r.cuenta}</span>
      {/* El lado con la palabra en claro y el color en el filete: el teal a 12 px midió 4,07:1. */}
      <span style={{ gridArea: "l", justifySelf: "start", fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, color: FAE.text, borderBottom: `2px solid ${COLOR_LADO[r.lado]}` }}>
        {r.lado === DEBE ? "Debe" : "Haber"}
      </span>
      <span style={{ ...CIFRA, gridArea: "m", fontSize: "13px" }}>{pesos(r.monto)}</span>
    </span>
  );
}

const CLASE_LINEA = { incorrecta: "malb", correcta: "bien", revelada: "pista" };
const miles = (n) => pesos(n).replace("$", "");
const nombreLado = (l) => (l === DEBE ? "Debe" : "Haber");

/* El cotejo de Watari: Diario y Mayor lado a lado, tres filas; lo trae evaluarDiario, calculado. */
function Cotejo({ fecha, filas }) {
  const ver = (campo, v) => (campo === "Lado" ? nombreLado(v) : campo === "Monto" ? miles(v) : v);
  return (
    <div className="cotejo" role="table" aria-label={`Cotejo del renglón ${fecha}`} data-cotejo>
      <p className="tit">Cotejo · {fecha}</p>
      <p className="cot cab" role="row"><span role="columnheader" /><span role="columnheader">Diario</span><span role="columnheader" /><span role="columnheader">Mayor</span></p>
      {filas.map((f) => (
        <p key={f.campo} role="row" className={`cot${f.igual ? "" : " distinto"}`} data-campo={f.campo} data-igual={f.igual ? "true" : "false"}>
          <span className="k" role="rowheader">{f.campo}</span>
          <span className="a" role="cell">{ver(f.campo, f.diario)}</span>
          <span className="s" role="cell" aria-label={f.igual ? "coincide" : "no coincide"}>{f.igual ? "=" : "≠"}</span>
          <span className="b" role="cell">{ver(f.campo, f.mayor)}</span>
        </p>
      ))}
    </div>
  );
}

/*
 * El mayor de «revisar» (Watari §2): la cuadrícula de 2 × 2 en el orden de la
 * tanda; la T no es botón (un botón no puede contener otro), cada línea sí,
 * de 44 px, con la fecha encima del monto y la cifra sin «$». Debajo, el
 * cotejo, la fila de estado y la consecuencia.
 */
function MayorRevisar({ item, orden, r, elegida, veredicto, revelar, onTocar }) {
  const lineas = mayorRevisar(item);
  const renglones = renglonesDe(item.caso);
  const estado = (x) => {
    if (!r) return null;
    if (x.r === elegida) return r.ok ? "correcta" : "incorrecta";
    if (revelar && !r.ok && x.r === r.correcta) return "revelada";
    return null;
  };
  const tocada = r ? lineas.find((x) => x.r === elegida) : null;
  return (
    <div className={RAIZ_T2}>
      <div className="ctas" data-libro="mayor">
        {orden.map((c) => {
          const mias = lineas.filter((x) => x.cuenta === c);
          const columna = (ld) => mias.filter((x) => x.lado === ld).map((x) => {
            const e = estado(x);
            const fecha = renglones[x.r].fecha;
            return (
              <button key={x.r} type="button" className={`lnb ${CLASE_LINEA[e] ?? ""}`.trim()} data-linea-mayor={x.r} data-estado={e ?? "libre"}
                disabled={Boolean(r)} onClick={() => onTocar(x.r)}
                aria-label={`${x.cuenta}, ${nombreLado(x.lado).toLowerCase()}, ${miles(x.monto)}, ${fecha}`}>
                <small>{fecha}</small><span className="num">{miles(x.monto)}</span>
              </button>
            );
          });
          return (
            <div key={c} className="cta tr" data-cuenta-mayor={c}>
              <span className="cta-tit">{c}</span>
              <span className="cta-t"><span>{columna(DEBE)}</span><span>{columna("haber")}</span></span>
            </div>
          );
        })}
      </div>
      {tocada && (
        <div className="veredicto-l" style={{ marginTop: "10px" }}>
          <Cotejo fecha={renglones[tocada.r].fecha} filas={r.cotejo} />
          {/* El acierto, con el cotejo y en neutro: el error es del libro, no del estudiante (Watari T2-4 §2; texto de Near T2-9). */}
          {r.ok && <p className="cuadra" data-acierto-revisar>{ACIERTO_REVISAR}</p>}
          {veredicto && (
            <p className="estado-l" data-estado-revisar>
              <Pastilla marca={r.ok ? "correcta" : TACHADA} />
              {revelar && <span className="pas-iba" data-pastilla="iba-punteada">{IBA_REVISAR}</span>}
            </p>
          )}
          {r.consecuencia && (
            <p className="falla" data-consecuencia="error"><IconoX color="#EE8266" /><span>{r.consecuencia}</span></p>
          )}
        </div>
      )}
    </div>
  );
}

export default function DelDiarioAlMayor({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null, pausado = false,
}) {
  /* Los dos casos se alternan por intento (D8): «Otra tanda» juega el otro. */
  const anterior = useRef(null);
  const t = useTanda(() => {
    const xs = items ?? prepararDiario(barajar, anterior.current);
    anterior.current = xs[0]?.caso.id ?? null;
    return xs;
  });
  const [puestos, setPuestos] = useState([]);
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [bien, setBien] = useState(0);
  const [vista, setVista] = useState("fecha");
  const [acerto, setAcerto] = useState(false);
  /* Solo en «revisar»: «consecuencia» a los 0 ms y «veredicto» a los 380 (Watari). Los otros dos tipos, al instante. */
  const [fase, setFase] = useState(null);
  const zonaBoton = useRef(null);
  const { despues, limpiar } = useRelojes(pausado);

  const item = t.items[t.i];
  const cuantos = t.items.length;
  const caso = item.caso;
  const renglones = renglonesDe(caso);
  const marcado = renglones[item.renglon];
  const ultimo = t.i + 1 === cuantos;
  const veredicto = Boolean(r) && (item.tipo !== "revisar" || fase === "veredicto" || fase === "iba");
  /* «Iba en la línea punteada» y la línea punteada, 0,7 s después del veredicto del error (Mello, auditoría T2-5 §2.1). */
  const revelar = fase === "iba";

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(puntuar(bien, cuantos), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (veredicto && !modoDemo) zonaBoton.current?.querySelector("button")?.focus(); }, [veredicto]); // eslint-disable-line react-hooks/exhaustive-deps

  const responder = (respuesta) => {
    if (r) return;
    const nuevo = evaluarDiario(item, respuesta);
    t.anotar(item.id, nuevo.ok, String(respuesta));
    if (nuevo.ok) { setBien((n) => n + 1); setAcerto(true); }
    setElegida(respuesta);
    setR(nuevo);
    if (item.tipo === "revisar") {
      const alVeredicto = () => { setFase("veredicto"); if (!nuevo.ok) despues(RETARDO_IBA_MS, () => setFase("iba")); };
      if (movimientoReducido()) alVeredicto();
      else { setFase("consecuencia"); despues(PAUSA_VEREDICTO_MS, alVeredicto); }
    }
  };

  const avanzar = () => {
    /* Bien o mal, el renglón queda en su cuenta correcta para el ítem siguiente. */
    if (item.tipo === "destino" && !puestos.includes(item.renglon)) setPuestos((xs) => [...xs, item.renglon]);
    limpiar();
    setR(null); setElegida(null); setFase(null);
    if (t.i + 1 < cuantos) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    limpiar(); t.reiniciar(); setR(null); setElegida(null); setBien(0); setPuestos([]); setVista("fecha"); setAcerto(false); setFase(null);
  };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(puntuar(bien, cuantos))} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p data-resumen style={TEXTO_CIERRE}>{bien} de {cuantos} renglones al primer intento.</p>
        </Cierre>
      </Marco>
    );
  }

  /*
   * Lo que se pinta en el mayor: los renglones ya puestos y, al responder un
   * destino, el de ahora donde cayó (en la cuenta elegida, aunque sea la mala).
   */
  /* El mayor llega con los renglones de origen ya pasados (Mello §2.2); los destino se suman al jugarlos. */
  const mayor = mayorCon(caso, [...new Set([...pasadosDe(caso), ...puestos])].sort((a, b) => a - b));
  const orden = item.orden ?? cuentasDe(caso);
  if (item.tipo === "destino" && r) {
    const destino = mayor[elegida];
    destino[marcado.lado === DEBE ? "debitos" : "creditos"].push({ valor: marcado.monto });
    destino.renglones[marcado.lado === DEBE ? "debe" : "haber"].push(marcado.k);
  }
  const lado = (rr) => (rr.lado === DEBE ? "debe" : "haber");
  const marcarDe = (c) => {
    const lista = mayor[c].renglones[lado(marcado)];
    const k = lista.indexOf(marcado.k);
    if (k < 0) return null;
    return { [lado(marcado)]: [k] };
  };

  const revisar = item.tipo === "revisar";
  const enlazado = (k) => (revisar ? Boolean(r) && k === elegida : r?.ok && k === item.renglon);
  const resaltado = (k) => (revisar ? Boolean(r) && k === elegida : k === item.renglon);
  const ordenados = vista === "fecha" ? renglones
    : cuentasDe(caso).flatMap((c) => renglones.filter((x) => x.cuenta === c));

  const estadoRenglon = (k) => {
    if (!r) return null;
    if (k === elegida) return r.ok ? "correcta" : "incorrecta";
    if (k === r.correcta) return "revelada";
    return null;
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T2_NUEVAS}</style>
      {revisar && <style>{CSS_T2_DELTA}</style>}
      <div data-t2-diario={item.tipo} data-item={item.id} data-fase={revisar ? fase ?? "pregunta" : undefined}>
        {!modoDemo && (
          <>
            <Encabezado objetivo={OBJETIVO_T2_NUEVAS["cu-del-diario-al-mayor"]} consigna={CONSIGNAS_DIARIO[item.tipo]} onComoSeJuega={onComoSeJuega} />
            <div style={{ marginBottom: "12px" }}>
              <Pulsos total={cuantos} hechos={t.i + (r ? 1 : 0)} enCurso={t.i + 1} etiqueta="Renglón" />
            </div>
          </>
        )}

        <div data-libro="diario" style={{ padding: "10px 12px", borderRadius: "13px", background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)" }}>
          <p style={{ ...ROTULO_T2, margin: "0 0 8px" }}>LIBRO DIARIO · {vista === "fecha" ? "POR FECHA" : "POR CUENTA"}</p>
          <div style={{ display: "grid", gap: item.tipo === "origen" ? "8px" : "4px" }}>
            {ordenados.map((x) => (item.tipo === "origen" ? (
              <span key={x.k} data-opcion-renglon={x.k} style={{ display: "contents" }}>
                <OpcionC ancho deshabilitada={Boolean(r)} estado={estadoRenglon(x.k)} onClick={() => responder(x.k)}>
                  <Renglon r={x} enlazado={enlazado(x.k)} />
                </OpcionC>
              </span>
            ) : (
              <div key={x.k} className="fae-t2n-mueve" style={{
                padding: "5px 7px", borderRadius: "8px",
                background: resaltado(x.k) ? "rgba(248,249,250,0.1)" : "transparent",
                border: resaltado(x.k) ? "1px solid rgba(248,249,250,0.6)" : "1px solid transparent",
              }}>
                <Renglon r={x} marcado={!revisar && x.k === item.renglon} enlazado={enlazado(x.k)} />
              </div>
            )))}
          </div>
        </div>

        {acerto && (
          <div role="group" aria-label="Ordenar el diario" data-selector-vista style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "10px" }}>
            {[["fecha", "Por fecha"], ["cuenta", "Por cuenta"]].map(([v, texto]) => (
              <button key={v} type="button" aria-pressed={vista === v} onClick={() => setVista(v)} style={{
                minHeight: "44px", borderRadius: "999px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
                background: vista === v ? "rgba(248,249,250,0.14)" : "transparent", color: FAE.text,
                border: `1px solid rgba(248,249,250,${vista === v ? 0.7 : 0.3})`, cursor: "pointer",
              }}>{texto}</button>
            ))}
          </div>
        )}

        <p style={ROTULO_T2}>LIBRO MAYOR · POR CUENTA</p>
        {revisar ? <MayorRevisar item={item} orden={orden} r={r} elegida={elegida} veredicto={veredicto} revelar={revelar} onTocar={responder} /> : (
        <div data-libro="mayor" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
          {orden.map((c) => {
            const malo = item.tipo === "destino" && r && !r.ok && c === elegida;
            const iba = item.tipo === "destino" && r && !r.ok && c === r.correcta;
            const bueno = item.tipo === "destino" && r?.ok && c === elegida;
            const enciende = (item.tipo === "origen" && c === marcado.cuenta) || malo || bueno || (item.tipo === "destino" && r && c === elegida);
            const cuerpo = (
              <>
                <CuentaT cuenta={mayor[c]} compacta marcar={enciende ? marcarDe(c) : null} />
                {(malo || iba || bueno) && (
                  <span style={{ display: "flex", justifyContent: "center", marginTop: "6px" }}>
                    <Pastilla marca={malo ? TACHADA : iba ? REVELADA : "correcta"} envuelve />
                  </span>
                )}
              </>
            );
            const marco = {
              display: "block", width: "100%", minWidth: 0, minHeight: "44px", padding: "3px", boxSizing: "border-box",
              borderRadius: "16px", background: "transparent", textAlign: "inherit", color: "inherit", font: "inherit",
              border: malo ? `2px solid ${CORAL_B}` : iba ? "2px dashed rgba(248,249,250,0.85)" : bueno ? "2px solid rgba(248,249,250,0.85)" : "1px solid rgba(248,249,250,0.18)",
            };
            return item.tipo === "destino" ? (
              <button key={c} type="button" data-cuenta-destino={c} aria-label={`Llevar el renglón a ${c}`}
                disabled={Boolean(r)} onClick={() => responder(c)} style={{ ...marco, cursor: r ? "default" : "pointer" }}>
                {cuerpo}
              </button>
            ) : (
              <div key={c} data-cuenta-mayor={c} style={marco}>{cuerpo}</div>
            );
          })}
        </div>
        )}

        {!revisar && <Consecuencia texto={r?.consecuencia} />}
        <Devolucion r={veredicto ? (ultimo && caso.cierre ? { ...r, textos: [...r.textos, caso.cierre] } : r) : null} />
        {!modoDemo && <Pie texto={PIE_T2_NUEVAS["cu-del-diario-al-mayor"]} />}
      </div>
      {veredicto && !modoDemo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{botonDeAvance("Renglón", t.i + 1 === cuantos)}</Responder>
        </div>
      )}
    </Marco>
  );
}
