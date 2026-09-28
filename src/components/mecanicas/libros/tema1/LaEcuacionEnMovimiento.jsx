import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { pesos, ACTIVO, PASIVO, PATRIMONIO } from "../../../../data/contabilidad.js";
import { NEUTRO, NAVY_DEL_CHIP } from "../../../../data/contabilidadIntro.js";
import {
  T1_5, PARTES, TRANSACCIONES_CAP2, PIE_T1_5, HISTORIAL_T1_5,
  ACIERTO_T1_5_FINAL, ALT_T1_5,
} from "../../../../data/contabilidadTema1.js";
import {
  totalesTras, parteQuieta, enModoCorto, evaluarT1_5, puntuar, pesoDeCadaItem, EN_CERO,
} from "../../../../contabilidad/tema1.js";
import { Retro, Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, CampoCifra, leerCifra } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado, IdeaConTermino } from "./encabezado.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-5 · LA ECUACIÓN EN MOVIMIENTO
 *
 * Las ocho transacciones de Caleja, en orden, desde cero hasta 465.000. No hay
 * sorteo: es un recorrido, y saltarse un hecho dejaría los totales siguientes
 * sin explicación.
 *
 * ═══════════ EL PIE COMPRUEBA MIENTRAS SE ESCRIBE ═══════════
 *
 * No espera a enviar. Si los dos lados no dan igual, se ve antes de responder
 * — que es exactamente lo que hace un contador: mirar si cuadra. Comprobar
 * solo al final convertiría la ecuación en una calificación en vez de en una
 * herramienta.
 *
 * ═══════════ EL HISTORIAL VA ABIERTO ═══════════
 *
 * Y no detrás de un botón. Lo de atrás es el dato con el que se calcula lo de
 * adelante: esconderlo obliga a memorizar tres cifras que no son el punto de
 * la actividad.
 *
 * ═══════════ DESDE EL QUINTO, MODO CORTO ═══════════
 *
 * Solo se piden los dos totales que cambian. El tercero se arrastra y se
 * enseña arrastrado, con su rótulo. Lo que se recorta es la mecanografía.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-t15-fila { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
.fae-t15-fila { animation: fae-t15-fila 300ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .fae-t15-fila { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;

const SORA = "Sora, sans-serif";
const CIFRA = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontVariantNumeric: "tabular-nums",
};

export default function LaEcuacionEnMovimiento({ Marco, rotulo, titulo, acento, onCompletar }) {
  const total = TRANSACCIONES_CAP2.length;
  const [i, setI] = useState(0);
  const [texto, setTexto] = useState({});
  const [r, setR] = useState(null);
  const [intento, setIntento] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [terminado, setTerminado] = useState(false);
  const detalle = useRef([]);
  const inicio = useRef(Date.now());
  const zonaBoton = useRef(null);

  const h = TRANSACCIONES_CAP2[i];
  const antes = totalesTras(i);
  const quieta = parteQuieta(i);
  const corto = enModoCorto(i);
  /* En modo corto la parte quieta no se escribe: se arrastra. */
  const seEscribe = (p) => !corto || p !== quieta;

  const pct = puntuar(respuestas, total);
  const esperandoReintento = Boolean(r && !r.ok && intento === 1);
  const puedeResponder = !r || esperandoReintento;

  /* Lo que hay escrito ahora mismo, con lo arrastrado ya puesto. */
  const escrito = {};
  for (const p of PARTES) {
    escrito[p.id] = seEscribe(p.id) ? leerCifra(texto[p.id] ?? "") : antes[p.id];
  }
  const completo = PARTES.every((p) => escrito[p.id] !== null);

  /* El pie comprueba mientras se escribe, no al enviar. */
  const izquierda = escrito[ACTIVO];
  const derecha = completo ? escrito[PASIVO] + escrito[PATRIMONIO] : null;
  const cuadra = completo && izquierda === derecha;

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);
  useEffect(() => {
    if (r && !esperandoReintento) zonaBoton.current?.querySelector("button")?.focus();
  }, [r, esperandoReintento]);

  const enviar = () => {
    if (!completo || (r && !esperandoReintento)) return;
    const nuevo = evaluarT1_5(i, escrito);
    const anotado = PARTES.map((p) => `${p.id}:${escrito[p.id]}`).join(" ");

    if (intento === 0) {
      detalle.current.push({
        item: h.id, ok: nuevo.ok, intentos: 1,
        respuesta: nuevo.ok ? null : anotado, orden: detalle.current.length + 1,
      });
      if (!nuevo.ok) { setR({ ...nuevo, primero: true }); setIntento(1); return; }
      setRespuestas((xs) => [...xs, { id: h.id, primeroOk: true }]);
      setR({ ...nuevo, primero: true });
      return;
    }
    setRespuestas((xs) => [...xs, { id: h.id, primeroOk: false, segundoOk: nuevo.ok }]);
    setIntento(2);
    setR({ ...nuevo, primero: false });
  };

  const avanzar = () => {
    setR(null); setIntento(0); setTexto({});
    if (i + 1 < total) setI(i + 1);
    else setTerminado(true);
  };
  const reiniciar = () => {
    setI(0); setTexto({}); setR(null); setIntento(0); setRespuestas([]); setTerminado(false);
    detalle.current = []; inicio.current = Date.now();
  };

  if (terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    const fin = totalesTras(total);
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra vez desde cero">
          <p style={TEXTO_CIERRE}>
            {bien} de {total} al primer intento. Cada hecho valía {pesoDeCadaItem(total).toFixed(2)} %.
          </p>
          <p data-cierre-final style={TEXTO_CIERRE}>{ACIERTO_T1_5_FINAL}</p>
          <p data-final style={{ ...TEXTO_CIERRE, ...CIFRA }}>
            {pesos(fin[ACTIVO])} = {pesos(fin[PASIVO] + fin[PATRIMONIO])}
          </p>
        </Cierre>
      </Marco>
    );
  }

  const revelado = r && !esperandoReintento && !r.ok ? r.real : null;
  const marcada = (p) => (r && !r.ok ? (r.resaltar ?? []).includes(p) : false);

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <Encabezado objetivo={T1_5.objetivo} consigna={T1_5.consigna} />
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={total} hechos={i + (r && !esperandoReintento ? 1 : 0)} etiqueta="Hecho" />
      </div>

      {/* Aquí dentro no entra el vocabulario del Tema 2. */}
      <div data-contenido>
        <p data-hecho={h.id} style={{
          margin: "0 0 12px", padding: "10px 12px", borderRadius: "11px",
          fontSize: "13px", lineHeight: 1.45, color: FAE.text,
          background: "rgba(10,20,34,0.5)", border: "1px solid rgba(248,249,250,0.16)",
        }}>
          {h.texto}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
          {PARTES.map((p) => (
            <div key={p.id} data-casilla={p.id} data-arrastrada={seEscribe(p.id) ? undefined : "si"}>
              <span style={{ display: "block", marginBottom: "4px" }}>
                <IdeaConTermino
                  idea={p.idea}
                  termino={p.termino}
                  tamano={12}
                  color={marcada(p.id) ? FAE.coral : FAE.text}
                />
              </span>
              {seEscribe(p.id) ? (
                <CampoCifra
                  valor={texto[p.id] ?? ""}
                  onCambio={(v) => setTexto((t) => ({ ...t, [p.id]: v }))}
                  onEnviar={enviar}
                  deshabilitado={!puedeResponder}
                  etiqueta={`${p.idea}, total nuevo`}
                  estado={r && !r.ok ? (marcada(p.id) ? "incorrecta" : null) : null}
                />
              ) : (
                /*
                 * Arrastrada: se enseña el número Y por qué está ahí. Una cifra
                 * que aparece sola en una casilla que no se puede tocar se lee
                 * como un dato del enunciado, no como una consecuencia.
                 */
                <p data-arrastrado={p.id} style={{
                  margin: 0, padding: "11px 13px", borderRadius: "12px",
                  background: "rgba(14,27,46,0.45)", border: "1px dashed rgba(248,249,250,0.22)",
                  display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "3px 8px",
                }}>
                  <span style={{ ...CIFRA, fontSize: "15px", color: FAE.text }}>{pesos(antes[p.id])}</span>
                  <span style={{ fontSize: "11px", color: "rgba(248,249,250,0.55)" }}>
                    {PIE_T1_5.arrastrado}
                  </span>
                </p>
              )}
              {revelado && revelado[p.id] !== escrito[p.id] && (
                <p data-era={p.id} style={{
                  margin: "4px 0 0", fontSize: "11px", color: "rgba(248,249,250,0.6)", ...CIFRA,
                }}>
                  era {pesos(revelado[p.id])}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* ═══════════ EL PIE, QUE COMPRUEBA MIENTRAS SE ESCRIBE ═══════════ */}
        <div data-pie data-cuadra={completo ? (cuadra ? "si" : "no") : "incompleto"} style={{
          marginTop: "11px", padding: "9px 11px", borderRadius: "11px",
          background: "rgba(10,20,34,0.45)",
          border: `1px solid ${completo && !cuadra ? FAE.coral : "rgba(248,249,250,0.16)"}`,
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", alignItems: "baseline" }}>
            <span style={{ fontSize: "11px", color: "rgba(248,249,250,0.6)" }}>{PIE_T1_5.izquierda}</span>
            <span data-lado="izquierda" style={{ ...CIFRA, fontSize: "13px", color: FAE.text }}>
              {izquierda === null ? "—" : pesos(izquierda)}
            </span>
            <span aria-hidden="true" style={{ fontSize: "13px", color: "rgba(248,249,250,0.6)" }}>
              {completo ? (cuadra ? "=" : "≠") : "?"}
            </span>
            <span style={{ fontSize: "11px", color: "rgba(248,249,250,0.6)" }}>{PIE_T1_5.derecha}</span>
            <span data-lado="derecha" style={{ ...CIFRA, fontSize: "13px", color: FAE.text }}>
              {derecha === null ? "—" : pesos(derecha)}
            </span>
          </div>
          {completo && (
            <p data-veredicto style={{
              margin: "5px 0 0", fontSize: "11.5px",
              color: cuadra ? "rgba(248,249,250,0.7)" : FAE.coral,
            }}>
              {cuadra ? PIE_T1_5.cuadra : PIE_T1_5.noCuadra}
            </p>
          )}
        </div>

        {/* ═══════════ EL HISTORIAL, ABIERTO ═══════════ */}
        <div data-historial style={{
          marginTop: "11px", padding: "9px 11px", borderRadius: "11px",
          background: "rgba(10,20,34,0.35)", border: "1px solid rgba(248,249,250,0.12)",
        }}>
          <p style={{
            margin: "0 0 6px", fontFamily: SORA, fontSize: "9.5px", fontWeight: 700,
            letterSpacing: "0.14em", color: "rgba(248,249,250,0.5)",
          }}>
            {HISTORIAL_T1_5.titulo.toUpperCase()}
          </p>
          {i === 0 ? (
            <p data-historial-vacio style={{ margin: 0, fontSize: "11.5px", color: "rgba(248,249,250,0.45)" }}>
              {HISTORIAL_T1_5.vacio}
            </p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "4px" }}>
              {TRANSACCIONES_CAP2.slice(0, i).map((x, k) => {
                const t = totalesTras(k + 1);
                return (
                  <li key={x.id} data-fila-historial={x.id} className="fae-t15-fila" style={{
                    display: "flex", flexWrap: "wrap", gap: "2px 8px", alignItems: "baseline",
                    fontSize: "11px", color: "rgba(248,249,250,0.65)",
                  }}>
                    <span style={{
                      flex: "none", width: "15px", height: "15px", borderRadius: "999px",
                      background: NEUTRO, color: NAVY_DEL_CHIP, fontFamily: SORA,
                      fontSize: "9px", fontWeight: 700, lineHeight: "15px", textAlign: "center",
                    }}>
                      {k + 1}
                    </span>
                    <span style={{ ...CIFRA }}>
                      {pesos(t[ACTIVO])} = {pesos(t[PASIVO])} + {pesos(t[PATRIMONIO])}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {r && r.texto && <Retro texto={r.texto} />}

      {puedeResponder && (
        <Responder onClick={enviar} deshabilitado={!completo}>
          {completo ? "Anotar" : "Escribe los totales"}
        </Responder>
      )}
      {r && !esperandoReintento && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>
            {i + 1 === total ? "Ver el resultado" : "Siguiente hecho"}
          </Responder>
        </div>
      )}

      <p style={SOLO_LECTOR}>{ALT_T1_5}</p>
      <p style={SOLO_LECTOR}>
        Antes de este hecho: {PARTES.map((p) => `${p.idea} ${pesos(antes[p.id])}`).join(", ")}.
        {i === 0 ? ` La empresa arranca en ${pesos(EN_CERO[ACTIVO])}.` : ""}
      </p>
    </Marco>
  );
}
