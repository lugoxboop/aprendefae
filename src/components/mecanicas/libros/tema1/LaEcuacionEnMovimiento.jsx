import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { pesos, ACTIVO, PASIVO, PATRIMONIO } from "../../../../data/contabilidad.js";
import {
  T1_5, PARTES, TRANSACCIONES_CAP2, ACIERTO_T1_5_FINAL, TORRES_T1_5,
} from "../../../../data/contabilidadTema1.js";
import {
  totalesTras, movimientoT1_5, evaluarTorresT1_5, altoDeTorre, ALTO_TORRE_T1_5, sinEmoji, pesoDeCadaItem,
} from "../../../../contabilidad/tema1.js";
import { Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import EncabezadoCompacto from "../b5/EncabezadoCompacto.jsx";
import {
  Pastilla, Mensaje, RegionViva, CORRECTA, TACHADA, REVELADA, CSS_B5H, CLASE_B5H, CORAL_B, TEXTO_B, NEUTRO_B,
} from "../b5/Devolucion.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-5 · LA ECUACIÓN EN MOVIMIENTO — LAS DOS TORRES (P2 de Mai, 23-oct).
 *
 * Ficha: orquestador/conocimiento/fichas/b-t1-5-torres-p2-mai.md.
 *
 * El estudiante ve dos torres —«Lo que tiene» contra «Lo que debe» más «Lo
 * que es de los dueños»— subir y bajar por el monto de cada hecho cuando dice
 * qué parte se queda quieta y hacia dónde van las otras dos. Los ocho hechos
 * de Caleja, en orden, de cero a $465.000.
 *
 * Lo que se fue: las tres casillas de cifra, el pie que comparaba los lados
 * mientras se escribía (era la respuesta, R10), el reintento y el modo corto.
 *
 * ═══════════ DOS DECISIONES, UN INTENTO ═══════════
 *
 * 1 · tocar la parte que NO se mueve. Se marca al instante (E4).
 * 2 · en las otras dos —las que de verdad se mueven, aunque la 1 haya
 *     fallado—, «+ monto» o «− monto». Las torres NO se mueven todavía.
 * «Anotar»: las torres van a los totales correctos, también en el error, y si
 * lo elegido daba otra altura queda el fantasma —el contorno coral
 * discontinuo de la torre que habría salido— solo en la torre que difiere.
 *
 * El veredicto lo pinta esta pieza (Check y X de lucide, sin emoji). `Retro`
 * y `Responder`, que son compartidos, no se usan aquí: van con Erwin (#487).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const CIFRA = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontVariantNumeric: "tabular-nums" };
const SECUNDARIO = "#A8B6C8";
const NAVY = "#1D3557";
const TEAL = "#2A9D8F";
const MAS = 1;
const MENOS = -1;

const CSS = `
.fae-t15-tramo { transform-origin: 50% 100%; transition: transform 320ms cubic-bezier(.3,.9,.4,1); }
@keyframes fae-t15-fantasma { from { opacity: 0; } to { opacity: 1; } }
.fae-t15-fantasma { animation: fae-t15-fantasma 240ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .fae-t15-tramo { transition: none !important; }
  .fae-t15-fantasma { animation: none !important; opacity: 1 !important; }
}
`;

const ancho = (n) => `${n}px`;
const conSigno = (s, monto) => `${s === MAS ? "+" : "−"} ${pesos(monto)}`;
const parte = (id) => PARTES.find((p) => p.id === id);

/*
 * Un tramo de torre. Mide siempre ALTO_TORRE_T1_5 y se escala con scaleY
 * desde abajo; `sobre` es cuánto lo sube el tramo de debajo (translateY), para
 * que la animación sea solo transform.
 */
function Tramo({ valor, sobre = 0, estilo, dato }) {
  const h = altoDeTorre(valor);
  return (
    <div
      data-tramo={dato}
      data-alto={h.toFixed(2)}
      className="fae-t15-tramo"
      style={{
        position: "absolute", left: 0, right: 0, bottom: 0, height: ancho(ALTO_TORRE_T1_5), boxSizing: "border-box",
        transform: `translateY(${-altoDeTorre(sobre)}px) scaleY(${h / ALTO_TORRE_T1_5})`, ...estilo,
      }}
    />
  );
}

const RELLENO_TIENE = { background: "rgba(184,196,212,.30)", outline: `2px solid ${TEXTO_B}`, outlineOffset: "-2px" };
const RAYADO_DEBE = { background: `repeating-linear-gradient(135deg, rgba(184,196,212,.55) 0 2px, transparent 2px 7px)`, outline: `1px solid ${NEUTRO_B}`, outlineOffset: "-1px" };
const TENUE_DUENOS = { background: "rgba(184,196,212,.14)", outline: `1px solid ${NEUTRO_B}`, outlineOffset: "-1px" };
const MUESTRA = { [ACTIVO]: RELLENO_TIENE, [PASIVO]: RAYADO_DEBE, [PATRIMONIO]: TENUE_DUENOS };

/* La torre que habría salido con lo elegido: contorno coral discontinuo, solo si difiere. */
function Fantasma({ valor, dato }) {
  return (
    <div data-fantasma={dato} className="fae-t15-fantasma" aria-hidden="true" style={{
      position: "absolute", left: "-3px", right: "-3px", bottom: 0, height: ancho(altoDeTorre(valor)),
      border: `2px dashed ${CORAL_B}`, borderRadius: "3px", boxSizing: "border-box", pointerEvents: "none",
    }} />
  );
}

function Torres({ t, fantasma }) {
  const izquierda = t[ACTIVO];
  const derecha = t[PASIVO] + t[PATRIMONIO];
  const alt = TORRES_T1_5.alt
    .replace("[X]", pesos(t[ACTIVO])).replace("[Y]", pesos(t[PASIVO])).replace("[Z]", pesos(t[PATRIMONIO]))
    .replace("[T]", pesos(izquierda));
  const total = (v, lado) => (
    <p data-total={lado} style={{ margin: "0 0 6px", textAlign: "center", fontFamily: INTER, fontSize: "12px", fontWeight: 600, color: TEXTO_B, ...CIFRA }}>
      {pesos(v)}
    </p>
  );
  return (
    <div data-torres role="img" aria-label={alt} style={{
      height: "244px", boxSizing: "border-box", padding: "14px 16px 0", borderRadius: "12px",
      background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)",
      display: "grid", gridTemplateColumns: "1fr 28px 1fr", alignItems: "end",
    }}>
      <div>
        {total(izquierda, "izquierda")}
        <div data-torre="izquierda" style={{ position: "relative", height: ancho(ALTO_TORRE_T1_5), margin: "0 auto", width: "64%", borderBottom: `2px solid ${NEUTRO_B}` }}>
          <Tramo valor={t[ACTIVO]} estilo={RELLENO_TIENE} dato={ACTIVO} />
          {fantasma?.izquierda != null && <Fantasma valor={fantasma.izquierda} dato="izquierda" />}
        </div>
      </div>
      <p aria-hidden="true" style={{ margin: "0 0 68px", textAlign: "center", fontFamily: SORA, fontSize: "16px", fontWeight: 700, color: SECUNDARIO }}>=</p>
      <div>
        {total(derecha, "derecha")}
        <div data-torre="derecha" style={{ position: "relative", height: ancho(ALTO_TORRE_T1_5), margin: "0 auto", width: "64%", borderBottom: `2px solid ${NEUTRO_B}` }}>
          <Tramo valor={t[PASIVO]} estilo={RAYADO_DEBE} dato={PASIVO} />
          <Tramo valor={t[PATRIMONIO]} sobre={t[PASIVO]} estilo={TENUE_DUENOS} dato={PATRIMONIO} />
          {fantasma?.derecha != null && <Fantasma valor={fantasma.derecha} dato="derecha" />}
        </div>
      </div>
      <div style={{ gridColumn: "1 / -1", height: "14px" }} />
    </div>
  );
}

function Leyenda() {
  return (
    <ul data-leyenda style={{ margin: "8px 0 0", padding: 0, listStyle: "none", display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
      {PARTES.map((p) => (
        <li key={p.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: INTER, fontSize: "12px", color: SECUNDARIO }}>
          <span aria-hidden="true" style={{ width: "14px", height: "14px", borderRadius: "2px", ...MUESTRA[p.id] }} />
          {p.idea}
        </li>
      ))}
    </ul>
  );
}

/* El botón de avance de la pieza: teal con texto oscuro; sin las dos decisiones, apagado. */
function Avance({ children, onClick, deshabilitado = false, refBoton }) {
  return (
    <button ref={refBoton} type="button" data-avance onClick={onClick} disabled={deshabilitado} style={{
      width: "100%", minHeight: "44px", marginTop: "14px", borderRadius: "999px", cursor: deshabilitado ? "default" : "pointer",
      fontFamily: SORA, fontSize: "14px", fontWeight: 700,
      background: deshabilitado ? "transparent" : TEAL, color: deshabilitado ? SECUNDARIO : "#06202A",
      border: deshabilitado ? "1px solid rgba(248,249,250,.16)" : `1px solid ${TEAL}`,
    }}>
      {children}
    </button>
  );
}

/* Borde de un botón según su estado: reposo, elegido (antes de anotar), o la marca E4. */
function bordeDe({ elegido, marca }) {
  if (marca === CORRECTA || marca === REVELADA) return { border: `2px solid ${TEXTO_B}`, background: "transparent" };
  if (marca === TACHADA) return { border: `2px solid ${CORAL_B}`, background: "transparent" };
  if (elegido) return { border: `2px solid ${TEXTO_B}`, background: NAVY };
  return { border: "1px solid rgba(248,249,250,0.35)", background: "transparent" };
}

/*
 * ═══════════ EL MODO DEMO DE «ASÍ SE JUEGA» ═══════════
 *
 * Es este mismo componente. `ejemplo` ({ hecho, antes }) le da un hecho de
 * fuera del recorrido y el estado del que parte; `modoDemo` le quita el
 * encabezado y el avance tras anotar, y no llama a `onCompletar`: ni FP, ni
 * intentos, ni progreso. El flujo es el mismo de la partida.
 */
export default function LaEcuacionEnMovimiento({
  Marco, rotulo, titulo, acento, onCompletar, ejemplo = null, modoDemo = false,
}) {
  const total = ejemplo ? 1 : TRANSACCIONES_CAP2.length;
  const [i, setI] = useState(0);
  const [quietaElegida, setQuietaElegida] = useState(null);
  const [signos, setSignos] = useState({});
  const [r, setR] = useState(null);
  const [puntos, setPuntos] = useState([]);
  const [terminado, setTerminado] = useState(false);
  const detalle = useRef([]);
  const inicio = useRef(Date.now());
  const botonSeguir = useRef(null);

  const h = ejemplo ? ejemplo.hecho : TRANSACCIONES_CAP2[i];
  const antes = ejemplo ? ejemplo.antes : totalesTras(i);
  const mov = movimientoT1_5(antes, h);
  const listo = quietaElegida !== null && mov.mueven.every((p) => signos[p] === MAS || signos[p] === MENOS);

  /* Cada decisión vale la mitad del hecho; los hechos pesan lo mismo que antes. */
  const pct = total ? (puntos.reduce((s, x) => s + (x.quietaOk ? 0.5 : 0) + (x.direccionOk ? 0.5 : 0), 0) / total) * 100 : 0;

  useEffect(() => {
    if (terminado && !modoDemo) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);
  useEffect(() => {
    if (r && !modoDemo) botonSeguir.current?.focus();
  }, [r]);

  const anotar = () => {
    if (!listo || r) return;
    const nuevo = evaluarTorresT1_5(mov, quietaElegida, signos);
    if (!modoDemo) {
      /* Las dos decisiones, cada una con su ítem e `intentos: 1`. */
      const orden = detalle.current.length;
      detalle.current.push(
        { item: `${h.id}:quieta`, ok: nuevo.quietaOk, intentos: 1, respuesta: nuevo.quietaOk ? null : quietaElegida, orden: orden + 1 },
        {
          item: `${h.id}:direccion`, ok: nuevo.direccionOk, intentos: 1, orden: orden + 2,
          respuesta: nuevo.direccionOk ? null : mov.mueven.map((p) => `${p}:${signos[p] === MAS ? "+" : "-"}`).join(" "),
        },
      );
      setPuntos((xs) => [...xs, { id: h.id, quietaOk: nuevo.quietaOk, direccionOk: nuevo.direccionOk }]);
    }
    setR(nuevo);
  };

  const avanzar = () => {
    setR(null); setQuietaElegida(null); setSignos({});
    if (i + 1 < total) setI(i + 1);
    else setTerminado(true);
  };
  const reiniciar = () => {
    setI(0); setR(null); setQuietaElegida(null); setSignos({}); setPuntos([]); setTerminado(false);
    detalle.current = []; inicio.current = Date.now();
  };

  if (terminado) {
    const bien = puntos.filter((x) => x.quietaOk && x.direccionOk).length;
    const fin = totalesTras(total);
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra vez desde cero">
          <p style={TEXTO_CIERRE}>
            {bien} de {total} al primer intento. Cada hecho valía {pesoDeCadaItem(total).toFixed(2)} %.
          </p>
          <p data-cierre-final style={TEXTO_CIERRE}>{sinEmoji(ACIERTO_T1_5_FINAL)}</p>
          <p data-final style={{ ...TEXTO_CIERRE, ...CIFRA }}>
            {pesos(fin[ACTIVO])} = {pesos(fin[PASIVO] + fin[PATRIMONIO])}
          </p>
        </Cierre>
      </Marco>
    );
  }

  /* R10: antes de anotar, las torres enseñan el estado anterior; después, el correcto, también en el error. */
  const enTorres = r ? r.real : antes;
  const fantasma = r && !r.ok ? {
    izquierda: r.fantasma.izquierda ? r.elegido[ACTIVO] : null,
    derecha: r.fantasma.derecha ? r.elegido[PASIVO] + r.elegido[PATRIMONIO] : null,
  } : null;

  const marcaQuieta = (id) => {
    if (quietaElegida === null) return null;
    if (id === mov.quieta) return quietaElegida === id ? CORRECTA : REVELADA;
    return quietaElegida === id ? TACHADA : null;
  };
  const marcaSigno = (id, s) => {
    if (!r) return null;
    const correcto = mov.signos[id] === s;
    if (signos[id] === s) return correcto ? CORRECTA : TACHADA;
    return correcto ? REVELADA : null;
  };

  const ultimoHecho = !ejemplo && i + 1 === total;
  const textoAcierto = ultimoHecho ? sinEmoji(ACIERTO_T1_5_FINAL) : null;

  /* Una función y no un componente: definido aquí dentro, React lo volvería a montar en cada render y perdería el foco. */
  const renderParte = (id) => {
    const p = parte(id);
    const marca = marcaQuieta(id);
    const muestraSignos = quietaElegida !== null && mov.mueven.includes(id);
    return (
      <div key={id} data-casilla={id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <button
          type="button"
          data-parte={id}
          aria-pressed={quietaElegida === id}
          disabled={quietaElegida !== null}
          onClick={() => setQuietaElegida(id)}
          style={{
            minHeight: "44px", width: "100%", padding: "7px 10px", borderRadius: "12px", textAlign: "left",
            display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px",
            color: TEXTO_B, cursor: quietaElegida === null ? "pointer" : "default", ...bordeDe({ marca }),
          }}
        >
          <span style={{ fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: 1.3 }}>{p.idea}</span>
          <span style={{ fontFamily: INTER, fontSize: "12px", lineHeight: 1.3, color: SECUNDARIO, ...CIFRA }}>
            {p.termino} · {pesos(antes[id])}
          </span>
          {marca && <Pastilla marca={marca} valor={TORRES_T1_5.quedaIgual} envuelve />}
        </button>
        {muestraSignos && (
          <div role="group" aria-label={p.idea} data-signos={id} style={{ display: "flex", gap: "6px" }}>
            {[MAS, MENOS].map((s) => {
              const m = marcaSigno(id, s);
              return (
                <button
                  key={s}
                  type="button"
                  data-signo={`${id}:${s === MAS ? "+" : "-"}`}
                  aria-pressed={signos[id] === s}
                  disabled={Boolean(r)}
                  onClick={() => setSignos((x) => ({ ...x, [id]: s }))}
                  style={{
                    flex: 1, minWidth: 0, minHeight: "44px", padding: "6px 6px", borderRadius: "12px",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px",
                    fontFamily: INTER, fontSize: "13px", fontWeight: 600, color: TEXTO_B, cursor: r ? "default" : "pointer",
                    ...CIFRA, ...bordeDe({ elegido: !r && signos[id] === s, marca: m }),
                  }}
                >
                  {conSigno(s, mov.monto)}
                  {m && <Pastilla marca={m} valor={m === REVELADA ? conSigno(s, mov.monto) : null} envuelve />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}{CSS_B5H}</style>
      <div className={CLASE_B5H} data-t15-torres>
        {!modoDemo && (
          <EncabezadoCompacto
            objetivo={T1_5.objetivo}
            contador={TORRES_T1_5.contador.replace("[n]", String(i + 1)).replace("[N]", String(total))}
            consigna={TORRES_T1_5.consigna}
          />
        )}

        <div data-contenido>
          <p data-hecho={h.id} style={{
            margin: "0 0 12px", padding: "10px 12px", borderRadius: "11px",
            fontFamily: INTER, fontSize: "14px", fontWeight: 600, lineHeight: 1.45, color: TEXTO_B,
            background: "rgba(10,20,34,0.5)", border: "1px solid rgba(248,249,250,0.16)",
          }}>
            {h.texto}
          </p>

          <Torres t={enTorres} fantasma={fantasma} />
          <Leyenda />

          <p data-pregunta style={{
            margin: "14px 0 8px", minHeight: "39.2px", fontFamily: INTER, fontSize: "14px", fontWeight: 600, lineHeight: 1.4, color: TEXTO_B,
          }}>
            {quietaElegida === null ? TORRES_T1_5.preguntaQuieta : TORRES_T1_5.preguntaDireccion}
          </p>

          {/* Las partes, alineadas con sus torres: lo que tiene a la izquierda; lo que debe y lo de los dueños a la derecha. */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", alignItems: "start" }}>
            {renderParte(ACTIVO)}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {renderParte(PASIVO)}
              {renderParte(PATRIMONIO)}
            </div>
          </div>
        </div>

        <RegionViva>
          {r && <Mensaje ok={r.ok} texto={r.ok ? textoAcierto : sinEmoji(r.texto)} />}
        </RegionViva>

        {!r && <Avance onClick={anotar} deshabilitado={!listo}>{TORRES_T1_5.anotar}</Avance>}
        {r && !modoDemo && (
          <Avance onClick={avanzar} refBoton={botonSeguir}>
            {i + 1 === total ? TORRES_T1_5.verResultado : TORRES_T1_5.siguiente}
          </Avance>
        )}
      </div>
    </Marco>
  );
}
