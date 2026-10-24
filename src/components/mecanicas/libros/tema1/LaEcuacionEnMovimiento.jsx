import { useEffect, useRef, useState } from "react";
import { useMovimientoReducido } from "../verbos.jsx";
import { FAE } from "../../../../theme.js";
import { pesos, ACTIVO, PASIVO, PATRIMONIO } from "../../../../data/contabilidad.js";
import {
  T1_5, PARTES, TRANSACCIONES_CAP2, ACIERTO_T1_5_FINAL, ACIERTO_T1_5, TORRES_T1_5,
} from "../../../../data/contabilidadTema1.js";
import {
  totalesTras, movimientoT1_5, evaluarTorresT1_5, opcionesTotalT1_5, claseDeTotalT1_5, altoDeTorre, ALTO_TORRE_T1_5, sinEmoji, pesoDeCadaItem,
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
 *     fallado—, con cuánto queda cada una: el total anterior más el monto,
 *     menos el monto, o el monto solo (auditoría de Shoko: con «+/− monto»
 *     solo se decidía el sentido, como en t1-4). Las torres NO se mueven todavía.
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
/* Lo que se espera a que el desplazamiento suave llegue a las torres antes de moverlas. */
export const MS_SUBIR = 420;
/* Una cifra con su signo de verdad: un total negativo se lee con «−», no con un guion. */
const cifra = (v) => (v < 0 ? `−${pesos(-v)}` : pesos(v));
const parte = (id) => PARTES.find((p) => p.id === id);
const minuscula = (t) => t.charAt(0).toLowerCase() + t.slice(1);
/* La pregunta con una palabra en negrilla (el «no» de Shoko, que antes iba en mayúsculas). */
function conNegrilla(texto, palabra) {
  const k = texto.indexOf(` ${palabra} `);
  if (k < 0) return texto;
  return <>{texto.slice(0, k + 1)}<b data-negrilla style={{ fontWeight: 800 }}>{palabra}</b>{texto.slice(k + 1 + palabra.length)}</>;
}

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

/*
 * La muestra de la leyenda (Mai; decisión de Sakuta tras Shoko, 24-oct): un
 * rectángulo plano de 24×8, sin redondear y sin borde propio —el cuadrado de
 * 14 con borde se leía como casilla de verificación—, con el tratamiento de
 * su tramo y 7 px de hueco hasta la palabra.
 */
export const MUESTRA_LEYENDA = {
  [ACTIVO]: { background: "rgba(184,196,212,.30)", boxShadow: `inset 0 0 0 2px ${TEXTO_B}` },
  [PASIVO]: { background: "repeating-linear-gradient(135deg, rgba(184,196,212,.55) 0 2px, transparent 2px 6px)" },
  [PATRIMONIO]: { background: "rgba(184,196,212,.14)" },
};

function Leyenda() {
  return (
    <ul data-leyenda style={{ margin: "8px 0 0", padding: 0, listStyle: "none", display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
      {PARTES.map((p) => (
        <li key={p.id} style={{ display: "flex", alignItems: "center", gap: "7px", fontFamily: INTER, fontSize: "12px", color: SECUNDARIO }}>
          <span data-muestra={p.id} aria-hidden="true" style={{ flex: "none", width: "24px", height: "8px", borderRadius: 0, border: "none", ...MUESTRA_LEYENDA[p.id] }} />
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
  const [totales, setTotales] = useState({});
  const [r, setR] = useState(null);
  const [puntos, setPuntos] = useState([]);
  const [terminado, setTerminado] = useState(false);
  const detalle = useRef([]);
  const inicio = useRef(Date.now());
  const botonSeguir = useRef(null);
  /*
   * ═══════════ LAS TORRES SE VEN MOVERSE (PR propio, D4) ═══════════
   *
   * A 320 «Anotar» queda bajo las partes y los totales: para tocarlo, las
   * torres ya salieron por arriba (−278 px), y al pasar el foco a «Siguiente»
   * se iban más (−493). Lo que la pieza enseña —las dos torres yendo al total
   * nuevo— pasaba fuera de la pantalla. Ahora, al anotar, la pieza sube a las
   * torres si no se ven, y solo cuando llegó las mueve; el foco va a
   * «Siguiente» sin desplazar la página.
   */
  const reducido = useMovimientoReducido();
  const cajaTorres = useRef(null);
  const reloj = useRef(null);
  const [torresAlDia, setTorresAlDia] = useState(false);
  useEffect(() => () => clearTimeout(reloj.current), []);

  const h = ejemplo ? ejemplo.hecho : TRANSACCIONES_CAP2[i];
  const antes = ejemplo ? ejemplo.antes : totalesTras(i);
  const mov = movimientoT1_5(antes, h);
  const listo = quietaElegida !== null && mov.mueven.every((p) => totales[p] !== undefined);

  /* Cada decisión vale la mitad del hecho; los hechos pesan lo mismo que antes. */
  const pct = total ? (puntos.reduce((s, x) => s + (x.quietaOk ? 0.5 : 0) + (x.direccionOk ? 0.5 : 0), 0) / total) * 100 : 0;

  useEffect(() => {
    if (terminado && !modoDemo) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);
  useEffect(() => {
    if (r && !modoDemo) botonSeguir.current?.focus({ preventScroll: true });
  }, [r]);

  const anotar = () => {
    if (!listo || r) return;
    const nuevo = evaluarTorresT1_5(mov, quietaElegida, totales);
    if (!modoDemo) {
      /* Las dos decisiones, cada una con su ítem e `intentos: 1`. */
      const orden = detalle.current.length;
      detalle.current.push(
        { item: `${h.id}:quieta`, ok: nuevo.quietaOk, intentos: 1, respuesta: nuevo.quietaOk ? null : quietaElegida, orden: orden + 1 },
        {
          item: `${h.id}:direccion`, ok: nuevo.direccionOk, intentos: 1, orden: orden + 2,
          respuesta: nuevo.direccionOk ? null : mov.mueven.map((p) => `${p}:${totales[p]}`).join(" "),
        },
      );
      setPuntos((xs) => [...xs, { id: h.id, quietaOk: nuevo.quietaOk, direccionOk: nuevo.direccionOk }]);
    }
    setR(nuevo);
    /* ¿Se ven las torres? Si no, se sube a ellas y se mueven al llegar. */
    const caja = cajaTorres.current?.getBoundingClientRect();
    const fuera = Boolean(caja) && (caja.top < 0 || caja.bottom > (globalThis.innerHeight ?? Infinity));
    clearTimeout(reloj.current);
    if (fuera && !modoDemo) {
      cajaTorres.current.scrollIntoView?.({ behavior: reducido ? "auto" : "smooth", block: "start" });
      setTorresAlDia(false);
      reloj.current = setTimeout(() => setTorresAlDia(true), reducido ? 0 : MS_SUBIR);
    } else {
      setTorresAlDia(true);
    }
  };

  const avanzar = () => {
    clearTimeout(reloj.current); setTorresAlDia(false);
    setR(null); setQuietaElegida(null); setTotales({});
    if (i + 1 < total) setI(i + 1);
    else setTerminado(true);
  };
  const reiniciar = () => {
    clearTimeout(reloj.current); setTorresAlDia(false);
    setI(0); setR(null); setQuietaElegida(null); setTotales({}); setPuntos([]); setTerminado(false);
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
  const enTorres = r && torresAlDia ? r.real : antes;
  const fantasma = r && !r.ok ? {
    izquierda: r.fantasma.izquierda ? r.elegido[ACTIVO] : null,
    derecha: r.fantasma.derecha ? r.elegido[PASIVO] + r.elegido[PATRIMONIO] : null,
  } : null;

  const marcaQuieta = (id) => {
    if (quietaElegida === null) return null;
    if (id === mov.quieta) return quietaElegida === id ? CORRECTA : REVELADA;
    return quietaElegida === id ? TACHADA : null;
  };
  const marcaTotal = (id, v) => {
    if (!r) return null;
    const correcto = mov.despues[id] === v;
    if (totales[id] === v) return correcto ? CORRECTA : TACHADA;
    return correcto ? REVELADA : null;
  };

  /*
   * La devolución del error (auditoría de Shoko al #496): si falló la parte
   * quieta, la C nueva nombra las dos partes; si no, A o B. Debajo, una línea
   * por cada parte de la decisión 2 que falló, según la cifra que marcó.
   */
  const textoError = r && !r.ok ? [
    r.quietaOk
      ? sinEmoji(r.texto)
      : TORRES_T1_5.errorQuieta.replace("{ELEGIDA}", parte(quietaElegida).idea).replace("{CORRECTA}", minuscula(parte(mov.quieta).idea)),
    ...mov.mueven.filter((p) => !r.totalesOk[p])
      .map((p) => TORRES_T1_5.devolucionTotal[claseDeTotalT1_5(mov, p, totales[p])].replace("{PARTE}", minuscula(parte(p).idea))),
  ].join(" ") : null;

  /* El acierto de cada hecho es de Futaba (24-oct); el ejemplo de «Así se juega» trae el suyo. */
  const textoAcierto = ejemplo ? ejemplo.acierto ?? null : ACIERTO_T1_5[h.id] ?? null;

  /* Una función y no un componente: definido aquí dentro, React lo volvería a montar en cada render y perdería el foco. */
  const renderParte = (id) => {
    const p = parte(id);
    const marca = marcaQuieta(id);
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
      </div>
    );
  };

  /*
   * La decisión 2 (P2 de Mai, 24-oct): debajo de las partes, un grupo por
   * cada parte que se mueve, a todo el ancho, con su rótulo y las cifras en
   * una fila de botones iguales. La que es el total de antes lleva debajo
   * «el total anterior, sin cambio». Tras anotar, si erró esa parte, la
   * devolución de Futaba según lo que marcó.
   */
  const renderTotales = (id) => {
    const p = parte(id);
    const ops = opcionesTotalT1_5(mov, id);
    return (
      <div key={id} data-grupo-total={id} style={{ marginTop: "12px" }}>
        <p style={{ margin: "0 0 6px", fontFamily: INTER, fontSize: "12px", fontWeight: 600, color: SECUNDARIO }}>
          {TORRES_T1_5.totalNuevo.replace("[PARTE]", p.idea)}
        </p>
        <div role="group" aria-label={p.idea} data-totales={id} style={{ display: "grid", gridTemplateColumns: `repeat(${ops.length}, minmax(0, 1fr))`, gap: "6px" }}>
          {ops.map((v) => {
            const m = marcaTotal(id, v);
            /* El rótulo «sin cambio» solo tras anotar y en la que eligió (Shoko): antes, era la única con rótulo y se descartaba sin pensar. */
            const sinCambio = Boolean(r) && totales[id] === v && claseDeTotalT1_5(mov, id, v) === "sinCambio";
            return (
              <button
                key={v}
                type="button"
                data-opcion-total={`${id}:${v}`}
                aria-pressed={totales[id] === v}
                disabled={Boolean(r)}
                onClick={() => setTotales((x) => ({ ...x, [id]: v }))}
                style={{
                  minWidth: 0, minHeight: "44px", padding: "6px 4px", borderRadius: "12px",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px",
                  fontFamily: INTER, fontSize: "13px", fontWeight: 600, color: TEXTO_B, cursor: r ? "default" : "pointer",
                  ...bordeDe({ elegido: !r && totales[id] === v, marca: m }),
                }}
              >
                <span style={{ ...CIFRA, whiteSpace: "nowrap" }}>{cifra(v)}</span>
                {sinCambio && (
                  <span data-rotulo-sin-cambio style={{ fontSize: "12px", fontWeight: 400, lineHeight: 1.3, color: SECUNDARIO, textAlign: "center" }}>
                    {TORRES_T1_5.sinCambio}
                  </span>
                )}
                {m && <Pastilla marca={m} valor={m === REVELADA ? cifra(v) : null} envuelve />}
              </button>
            );
          })}
        </div>
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

          <div ref={cajaTorres} data-caja-torres style={{ scrollMarginTop: "12px" }}>
            <Torres t={enTorres} fantasma={torresAlDia ? fantasma : null} />
          </div>
          <Leyenda />

          <p data-pregunta style={{
            margin: "14px 0 8px", minHeight: "39.2px", fontFamily: INTER, fontSize: "14px", fontWeight: 600, lineHeight: 1.4, color: TEXTO_B,
          }}>
            {quietaElegida === null ? conNegrilla(TORRES_T1_5.preguntaQuieta, TORRES_T1_5.negrillaQuieta) : TORRES_T1_5.preguntaDireccion}
          </p>

          {/* Las partes, alineadas con sus torres: lo que tiene a la izquierda; lo que debe y lo de los dueños a la derecha. */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", alignItems: "start" }}>
            {renderParte(ACTIVO)}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {renderParte(PASIVO)}
              {renderParte(PATRIMONIO)}
            </div>
          </div>
          {quietaElegida !== null && mov.mueven.map(renderTotales)}
        </div>

        <RegionViva>
          {r && <Mensaje ok={r.ok} texto={r.ok ? textoAcierto : textoError} />}
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
