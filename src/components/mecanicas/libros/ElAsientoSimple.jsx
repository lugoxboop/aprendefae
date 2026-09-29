import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { FAE } from "../../../theme.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../data/contabilidad.js";
import {
  OBJETIVO, ROTULO_TRANSACCION, ROTULO_BANCO, ROTULO_FICHAS,
  TEXTO_CONFIRMAR, SUBTEMA,
} from "../../../data/contabilidadArmaElAsiento.js";
import {
  ASIENTOS, POR_PARTIDA, bancoDe, evaluar, puntuar, decisionesDe, pesoDeCadaDecision,
} from "../../../contabilidad/armaElAsiento.js";
import { Retro, Pulsos, Cierre } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Responder, useTanda } from "./piezas.jsx";
import {
  Ficha, FichaEnVuelo, EstilosDeVerbos, useArrastre,
  useMovimientoReducido, SOLO_LECTOR,
} from "./verbos.jsx";
import { TONO_ROTULO } from "./debeHaber/piezasDebeHaber.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A6 · ARMA EL ASIENTO.
 *
 * La transacción arriba, dos cuentas T en blanco debajo, y un banco de
 * nombres. El estudiante nombra las dos cuentas, pone el valor de cada una en
 * un lado, y confirma.
 *
 * ═══════════ LAS TRES SEÑALES APARECEN SIEMPRE ═══════════
 *
 * Y esto es lo que hay que no romper. Cada señal dice EXACTAMENTE una cosa:
 *
 *   el arco        que el asiento cuadra
 *   el ▲ + flecha  por dónde crece la cuenta y hacia dónde la mueve esto
 *   el anclaje     que esa cuenta SE MUEVE en esta transacción
 *
 * Las tres se encienden al confirmar, acierte o falle. Si alguna apareciera
 * solo en el error, su sola presencia sería el veredicto, y el estudiante
 * dejaría de leer lo que dice para leer si está.
 *
 * ═══════════ EL ANCLAJE QUE NO ESTÁ DICE TANTO COMO EL QUE SÍ ═══════════
 *
 * «Cancelan $10.000 de la deuda por la compra del computador» nombra el
 * computador, y Equipo de computación no se mueve ahí: se compró antes. La
 * cuenta que el estudiante metió de más se queda SIN línea, y ese hueco es la
 * explicación.
 *
 * ═══════════ LA CURVA VA CONFINADA A LA BANDA ═══════════
 *
 * Sube recta desde el borde superior de la T, cruza en horizontal por la
 * franja vacía que hay entre el enunciado y la mesa, y baja al chip. Así
 * nunca pasa por encima de la otra cuenta ni le entra por el costado. Las
 * posiciones se MIDEN; no hay ninguna coordenada adivinada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-a6-traza { from { stroke-dashoffset: 260; } to { stroke-dashoffset: 0; } }
.fae-a6-ancla { stroke-dasharray: 260; animation: fae-a6-traza 500ms ease-out both; }
@keyframes fae-a6-cae { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: none; } }
.fae-a6-cae { animation: fae-a6-cae 400ms cubic-bezier(.26,.84,.38,1) both; }
@keyframes fae-a6-aparece { from { opacity: 0; } to { opacity: 1; } }
.fae-a6-aparece { animation: fae-a6-aparece 300ms ease-out 300ms both; }
@keyframes fae-a6-pulso { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
.fae-a6-pulso { animation: fae-a6-pulso 2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .fae-a6-ancla, .fae-a6-cae, .fae-a6-aparece, .fae-a6-pulso {
    animation: none !important; opacity: 1 !important; stroke-dashoffset: 0 !important; transform: none !important;
  }
}
`;

const SORA = "Sora, sans-serif";
const NEUTRO = "#B8C4D4";
const NAVY = "#1D3557";
/* La franja vacía entre el enunciado y la mesa, por donde van las curvas. */
const BANDA = 30;
/* Cuánto se queda la curva antes de desvanecerse. El chip no se va. */
const MS_ANCLAJE = 1400;

/* ═══════════════════ EL ENUNCIADO, CON SUS FRASES MARCADAS ═══════════════════ */

/** Parte un texto en trozos, marcando las frases pedidas. No las reescribe. */
export function partirPorFrases(texto, frases) {
  const marcas = frases
    .map((f) => ({ f, k: texto.indexOf(f) }))
    .filter((x) => x.k >= 0)
    .sort((a, b) => a.k - b.k);
  const trozos = [];
  let desde = 0;
  for (const { f, k } of marcas) {
    if (k < desde) continue;
    if (k > desde) trozos.push({ texto: texto.slice(desde, k), frase: null });
    trozos.push({ texto: texto.slice(k, k + f.length), frase: f });
    desde = k + f.length;
  }
  if (desde < texto.length) trozos.push({ texto: texto.slice(desde), frase: null });
  return trozos;
}

/* ═══════════════════ UNA CUENTA T DE LA MESA ═══════════════════ */

function CuentaT({
  indice, cuenta, valor, lado, creceP, sube, mostrarSenales, estado,
  destinoNombre, destinoLados, tomada, onSoltar, onTocar, refT,
}) {
  const columna = (cual) => {
    const conFicha = lado === cual;
    const activa = destinoLados && !lado;
    const triangulo = mostrarSenales && creceP === cual;
    return (
      <button
        key={cual}
        type="button"
        data-columna={cual}
        data-destino={activa ? `${indice}:${cual}` : undefined}
        disabled={!activa}
        onClick={activa ? () => onSoltar(`${indice}:${cual}`) : undefined}
        aria-label={`Poner el valor en el ${cual === DEBE ? "debe" : "haber"} de ${cuenta ?? "esta cuenta"}`}
        style={{
          flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
          justifyContent: "flex-end", gap: "3px", padding: "5px 4px",
          borderRadius: "9px", minHeight: "86px",
          background: activa && tomada != null ? `${COLOR_LADO[cual]}14` : "transparent",
          border: activa
            ? `1px dashed ${tomada != null ? COLOR_LADO[cual] : "rgba(248,249,250,0.18)"}`
            : "1px solid transparent",
          cursor: activa ? "pointer" : "default",
        }}
      >
        {/* Hueco reservado para el ▲ y su flecha, desde el primer instante. */}
        <span aria-hidden="true" style={{ height: "12px", lineHeight: "12px", fontSize: "10px", color: COLOR_LADO[cual] }}>
          {triangulo && <span data-triangulo={cual}>▲</span>}
          {triangulo && <span data-flecha={sube ? "sube" : "baja"}>{sube ? " ↑" : " ↓"}</span>}
        </span>
        {triangulo && (
          <span style={SOLO_LECTOR}>
            Esta cuenta crece por aquí, y esta transacción la hace {sube ? "crecer" : "decrecer"}.
          </span>
        )}
        <span data-rotulo={cual} style={{
          fontFamily: SORA, fontSize: "9px", fontWeight: 700,
          letterSpacing: "0.12em", color: TONO_ROTULO[cual], textAlign: "center",
        }}>
          {cual === DEBE ? "DEBE" : "HABER"}
        </span>
        <span style={{ flex: 1 }} />
        {conFicha
          ? (
            <span data-valor={cual} className="fae-a6-cae" style={{
              display: "block", padding: "8px 2px", borderRadius: "8px",
              background: `${COLOR_LADO[cual]}22`, border: `1px solid ${COLOR_LADO[cual]}`,
              fontFamily: "ui-monospace, Menlo, Consolas, monospace",
              fontSize: "12px", fontWeight: 700, color: FAE.text, textAlign: "center",
            }}>
              {pesos(valor)}
            </span>
          )
          : <span aria-hidden="true" style={{ display: "block", padding: "8px 2px", fontSize: "12px", color: "rgba(248,249,250,0.25)", textAlign: "center" }}>—</span>}
      </button>
    );
  };

  const borde = estado === "correcta" ? FAE.teal : estado === "incorrecta" ? FAE.coral : "rgba(248,249,250,0.12)";
  return (
    <div
      ref={refT}
      data-cuenta-t={indice}
      data-cuenta={cuenta ?? undefined}
      style={{
        flex: "1 1 0", minWidth: 0, padding: "9px 8px", borderRadius: "13px",
        background: "rgba(10,20,34,0.45)", border: `1px solid ${borde}`,
      }}
    >
      {cuenta
        ? (
          <p style={{
            margin: "0 0 7px", fontFamily: SORA, fontWeight: 700, fontSize: "11.5px",
            lineHeight: 1.2, color: FAE.text, textAlign: "center",
            /* Hasta dos líneas, nunca abreviado: el nombre exacto se aprende. */
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden", minHeight: "28px",
          }}>
            {cuenta}
          </p>
        )
        : (
          <button
            type="button"
            data-destino={destinoNombre ? `nombre:${indice}` : undefined}
            disabled={!destinoNombre}
            onClick={destinoNombre ? () => onTocar(`nombre:${indice}`) : undefined}
            aria-label={`Poner un nombre en la cuenta ${indice + 1}`}
            style={{
              display: "block", width: "100%", margin: "0 0 7px", minHeight: "28px",
              borderRadius: "8px", background: tomada != null ? "rgba(184,196,212,0.13)" : "transparent",
              border: `1px dashed ${tomada != null ? NEUTRO : "rgba(248,249,250,0.22)"}`,
              color: "rgba(248,249,250,0.4)", fontFamily: SORA, fontSize: "10.5px",
              cursor: destinoNombre ? "pointer" : "default",
            }}
          >
            sin nombre
          </button>
        )}
      <div style={{ display: "flex", gap: "6px", borderTop: "1px solid rgba(248,249,250,0.22)", paddingTop: "7px" }}>
        {columna(DEBE)}
        <div aria-hidden="true" style={{ width: "1px", background: "rgba(248,249,250,0.22)" }} />
        {columna(HABER)}
      </div>
    </div>
  );
}

/* ═══════════════════ LA MECÁNICA ═══════════════════ */

const vacia = () => ({ cuenta: null, lado: null });

export default function ElAsientoSimple({ Marco, rotulo, titulo, acento, onCompletar }) {
  const reducido = useMovimientoReducido();
  const t = useTanda(() => barajar(ASIENTOS).slice(0, POR_PARTIDA)
    .map((a) => ({ a, banco: bancoDe(a, barajar) })));

  const [filas, setFilas] = useState([vacia(), vacia()]);
  const [r, setR] = useState(null);
  const [intento, setIntento] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [curvas, setCurvas] = useState([]);
  const [curvasVivas, setCurvasVivas] = useState(false);
  /* Las frases ya resaltadas se quedan puestas el resto de la transacción. */
  const [frasesFijas, setFrasesFijas] = useState([]);
  const reloj = useRef(null);
  const zonaBoton = useRef(null);
  const lienzo = useRef(null);
  const refsT = [useRef(null), useRef(null)];
  const refsChip = useRef({});

  const actual = t.items[t.i];
  const a = actual?.a;
  const cuantas = t.items.length;
  const pct = puntuar(respuestas, cuantas);
  const esperandoReintento = Boolean(r && !r.perfecto && intento === 1);
  const puedeArmar = !r || esperandoReintento;

  useEffect(() => {
    if (t.terminado) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);

  useEffect(() => () => clearTimeout(reloj.current), []);

  useEffect(() => {
    if (r && !esperandoReintento) zonaBoton.current?.querySelector("button")?.focus();
  }, [r, esperandoReintento]);

  /*
   * ═══════════ LAS CURVAS SE MIDEN, NO SE ADIVINAN ═══════════
   *
   * Se leen las posiciones reales del chip y de la T y se dibuja una bézier
   * cuyos dos puntos de control están en la banda: así el tramo horizontal
   * ocurre SIEMPRE por encima de las dos cuentas, nunca sobre una de ellas.
   */
  useLayoutEffect(() => {
    if (!r) { setCurvas([]); return; }
    const caja = lienzo.current?.getBoundingClientRect();
    if (!caja) return;
    const trazos = [];
    filas.forEach((f, i) => {
      const frase = f.cuenta ? a.anclajes[f.cuenta] : null;
      const chip = frase ? refsChip.current[frase] : null;
      const t0 = refsT[i].current;
      if (!chip || !t0) return;
      const c = chip.getBoundingClientRect();
      const b = t0.getBoundingClientRect();
      trazos.push({
        cuenta: f.cuenta,
        x1: b.left + b.width / 2 - caja.left,
        y1: b.top - caja.top,
        x2: c.left + c.width / 2 - caja.left,
        y2: c.bottom - caja.top,
      });
    });
    setCurvas(trazos);
    setCurvasVivas(true);
    clearTimeout(reloj.current);
    reloj.current = setTimeout(() => setCurvasVivas(false), reducido ? 1 : MS_ANCLAJE);
  }, [r, filas, a, reducido]);

  const nombrar = (indice, cuenta) => {
    if (!puedeArmar || !cuenta || cuenta.includes(":")) return;
    setFilas((xs) => xs.map((f, i) => (i === indice ? { ...f, cuenta } : f)));
  };

  const colocar = (indice, lado) => {
    if (!puedeArmar) return;
    setFilas((xs) => xs.map((f, i) => (i === indice ? { ...f, lado } : f)));
  };

  const arrastre = useArrastre({
    onSoltar: (tomado, destino) => {
      if (!destino) return;
      if (destino.startsWith("nombre:")) { nombrar(Number(destino.split(":")[1]), tomado); return; }
      const [i, lado] = destino.split(":");
      /* Solo la ficha de esa misma cuenta puede caer en sus columnas. */
      if (tomado === `valor:${i}`) colocar(Number(i), lado);
    },
  });

  const completo = filas.every((f) => f.cuenta && f.lado);

  const confirmar = () => {
    if (!puedeArmar || !completo) return;
    const nuevo = evaluar(a, filas);
    setFrasesFijas((xs) => [...new Set([...xs, ...nuevo.frases])]);

    if (intento === 0) {
      t.anotar(a.id, nuevo.perfecto, nuevo.perfecto ? null : JSON.stringify(filas));
      const marca = (ok) => ({ primeroOk: ok });
      setRespuestas((xs) => [...xs,
        ...Array.from({ length: nuevo.cuentasOk }, () => marca(true)),
        ...Array.from({ length: nuevo.ladosOk }, () => marca(true))]);
      setR(nuevo);
      if (!nuevo.perfecto) setIntento(1);
      return;
    }
    /* El reintento solo puede sumar lo que faltaba, y a mitad de valor. */
    const faltaban = decisionesDe(1) - (r.cuentasOk + r.ladosOk);
    const ganadas = (nuevo.cuentasOk + nuevo.ladosOk) - (r.cuentasOk + r.ladosOk);
    setRespuestas((xs) => [...xs,
      ...Array.from({ length: Math.max(0, ganadas) }, () => ({ primeroOk: false, segundoOk: true })),
      ...Array.from({ length: Math.max(0, faltaban - Math.max(0, ganadas)) }, () => ({ primeroOk: false, segundoOk: false }))]);
    setIntento(2);
    setR(nuevo);
  };

  const avanzar = () => {
    setR(null); setIntento(0); setFilas([vacia(), vacia()]); setCurvas([]);
    setFrasesFijas([]); arrastre.limpiar(); clearTimeout(reloj.current);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => {
    t.reiniciar(); setR(null); setIntento(0); setFilas([vacia(), vacia()]);
    setRespuestas([]); setCurvas([]); setFrasesFijas([]); arrastre.limpiar();
  };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {bien} de {decisionesDe(cuantas)} al primer intento — dos cuentas y dos lados en cada uno
            de los {cuantas}. Cada decisión valía {pesoDeCadaDecision(cuantas).toFixed(2)} %.
          </p>
        </Cierre>
      </Marco>
    );
  }

  const senales = Boolean(r);
  const frasesVisibles = [...new Set([...frasesFijas, ...(r?.frases ?? [])])];
  const trozos = partirPorFrases(a.texto, frasesVisibles);
  const estadoDe = (f) => {
    if (!r || !f.cuenta) return null;
    const real = r.real.get(f.cuenta);
    return real && real === f.lado ? "correcta" : "incorrecta";
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <EstilosDeVerbos />
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={cuantas} hechos={t.i + (r && !esperandoReintento ? 1 : 0)} enCurso={t.i + 1} etiqueta="Transacción" />
      </div>

      <div ref={lienzo} style={{ position: "relative" }}>
        <p style={{
          margin: "0 0 5px", fontFamily: SORA, fontSize: "10px",
          fontWeight: 700, letterSpacing: "0.14em", color: acento,
        }}>
          {ROTULO_TRANSACCION}
        </p>
        <p data-enunciado style={{
          margin: 0, padding: "9px 11px", borderRadius: "12px", fontSize: "13px", lineHeight: 1.55,
          color: FAE.text, background: "rgba(10,20,34,0.4)", border: "1px solid rgba(248,249,250,0.12)",
        }}>
          {trozos.map((x, k) => (x.frase
            ? (
              <span
                key={`${x.frase}-${k}`}
                data-frase={x.frase}
                ref={(el) => { if (el) refsChip.current[x.frase] = el; }}
                style={{ padding: "1px 4px", borderRadius: "5px", background: NEUTRO, color: NAVY, fontWeight: 700 }}
              >
                {x.texto}
              </span>
            )
            : <span key={k}>{x.texto}</span>))}
        </p>

        {/* La franja por la que van las curvas. Vacía, y ahí está el punto. */}
        <div aria-hidden="true" style={{ height: `${BANDA}px` }} />

        <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
          {filas.map((f, i) => (
            <CuentaT
              key={i}
              indice={i}
              refT={refsT[i]}
              cuenta={f.cuenta}
              valor={a.valor}
              lado={f.lado}
              creceP={a.cuentas.find((c) => c.cuenta === f.cuenta)?.creceP ?? null}
              sube={a.cuentas.find((c) => c.cuenta === f.cuenta)?.sube ?? false}
              mostrarSenales={senales && Boolean(a.cuentas.find((c) => c.cuenta === f.cuenta))}
              estado={estadoDe(f)}
              destinoNombre={puedeArmar && !f.cuenta && arrastre.tomada != null && !arrastre.tomada.includes(":")}
              destinoLados={puedeArmar && Boolean(f.cuenta)}
              tomada={arrastre.tomada}
              onSoltar={(d) => (arrastre.tomada === `valor:${i}` ? arrastre.soltarEn(d) : colocar(i, d.split(":")[1]))}
              onTocar={(d) => arrastre.soltarEn(d)}
            />
          ))}
        </div>

        {/*
          ═══════════ LAS DOS SEÑALES DIBUJADAS ═══════════
          El arco entre las dos cuentas, y las curvas hacia el enunciado. Van
          en un lienzo que no recibe toques: son dibujo, no controles.
        */}
        {senales && (
          <svg
            aria-hidden="true"
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              pointerEvents: "none", overflow: "visible",
            }}
          >
            {curvasVivas && curvas.map((c) => (
              <path
                key={c.cuenta}
                data-ancla={c.cuenta}
                className={reducido ? undefined : "fae-a6-ancla"}
                d={`M ${c.x1} ${c.y1} C ${c.x1} ${c.y1 - BANDA * 0.7}, ${c.x2} ${c.y2 + BANDA * 0.7}, ${c.x2} ${c.y2}`}
                fill="none" stroke={NEUTRO} strokeWidth="1.4" strokeLinecap="round"
                style={{ opacity: curvasVivas ? 1 : 0, transition: "opacity 400ms ease" }}
              />
            ))}
          </svg>
        )}
      </div>

      {/* El arco del cuadre, debajo de la mesa: entre las dos cuentas. */}
      {senales && (
        <svg
          data-arco={r.cuadra ? "cerrado" : "abierto"}
          aria-hidden="true" viewBox="0 0 100 16" preserveAspectRatio="none"
          className="fae-a6-aparece"
          style={{ display: "block", width: "100%", height: "16px", marginTop: "4px", overflow: "visible" }}
        >
          <path
            d={r.cuadra ? "M 25 0 Q 50 16 75 0" : "M 25 0 Q 42 14 48 6"}
            fill="none" stroke={r.cuadra ? FAE.teal : FAE.coral} strokeWidth="1.1"
            strokeLinecap="round" strokeDasharray={r.cuadra ? undefined : "3 3"}
            vectorEffect="non-scaling-stroke"
          />
          {!r.cuadra && <path d="M 75 0 Q 58 14 52 6" fill="none" stroke={FAE.coral} strokeWidth="1.1" strokeLinecap="round" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
        </svg>
      )}
      {senales && (
        <p style={SOLO_LECTOR}>
          {r.cuadra
            ? `El asiento cuadra: ${pesos(r.totalDebe)} al debe contra ${pesos(r.totalHaber)} al haber.`
            : "El asiento no cuadra: el arco queda abierto."}
          {r.sinAncla && ` ${r.sinAncla} no tiene línea hacia el enunciado: no se mueve en esta transacción.`}
        </p>
      )}

      {puedeArmar && (
        <>
          <p style={{
            margin: "14px 0 8px", fontFamily: SORA, fontSize: "10.5px",
            fontWeight: 700, letterSpacing: "0.16em", color: acento,
          }}>
            {esperandoReintento
              ? "INTÉNTALO OTRA VEZ"
              : filas.every((f) => f.cuenta) ? ROTULO_FICHAS : ROTULO_BANCO}
          </p>

          {filas.every((f) => f.cuenta)
            ? (
              <div style={{ display: "flex", gap: "10px" }}>
                {filas.map((f, i) => (f.lado
                  ? (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFilas((xs) => xs.map((x, k) => (k === i ? { ...x, lado: null } : x)))}
                      style={{
                        flex: "1 1 0", padding: "11px 8px", borderRadius: "9px", cursor: "pointer",
                        background: "transparent", border: "1px dashed rgba(248,249,250,0.22)",
                        color: "rgba(248,249,250,0.5)", fontFamily: SORA, fontSize: "11px",
                      }}
                    >
                      {f.cuenta}: quitar del {f.lado === DEBE ? "debe" : "haber"}
                    </button>
                  )
                  : (
                    <div key={i} data-ficha-valor={i} className={arrastre.tomada ? undefined : "fae-a6-pulso"} style={{ flex: "1 1 0" }}>
                      <Ficha
                        valor={a.valor}
                        alto={38}
                        lado={DEBE}
                        color="rgba(248,249,250,0.5)"
                        tomada={arrastre.tomada === `valor:${i}`}
                        onClick={() => arrastre.tocar(`valor:${i}`)}
                        gestos={arrastre.gestos(`valor:${i}`)}
                        etiqueta={`Valor de ${f.cuenta}. Llévalo al debe o al haber de esa cuenta.`}
                      />
                    </div>
                  )))}
              </div>
            )
            : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                {actual.banco.map((c) => {
                  const puesta = filas.some((f) => f.cuenta === c);
                  return (
                    <Ficha
                      key={c}
                      valor={0}
                      texto={c}
                      lado={DEBE}
                      color="rgba(248,249,250,0.5)"
                      tomada={arrastre.tomada === c}
                      deshabilitada={puesta}
                      onClick={() => arrastre.tocar(c)}
                      gestos={puesta ? null : arrastre.gestos(c)}
                      etiqueta={`Poner ${c} en una cuenta`}
                    />
                  );
                })}
              </div>
            )}

          {filas.some((f) => f.cuenta) && !filas.every((f) => f.cuenta && f.lado) && (
            <p style={{ margin: "9px 0 0", fontSize: "12px", color: "rgba(248,249,250,0.45)", textAlign: "center" }}>
              {filas.every((f) => f.cuenta)
                ? "Toca el valor y después el lado de su cuenta."
                : "Toca un nombre y después la cuenta donde va."}
            </p>
          )}
        </>
      )}

      <FichaEnVuelo
        valor={0}
        texto={arrastre.tomada && !arrastre.tomada.includes(":") ? arrastre.tomada : null}
        lado={DEBE}
        puntero={arrastre.tomada && !arrastre.tomada.includes(":") ? arrastre.puntero : null}
      />

      {r && <Retro texto={r.texto} />}

      {puedeArmar
        ? <Responder onClick={confirmar} deshabilitado={!completo}>{TEXTO_CONFIRMAR}</Responder>
        : (
          <div ref={zonaBoton}>
            <Responder onClick={avanzar}>
              {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente transacción"}
            </Responder>
          </div>
        )}

      <p style={SOLO_LECTOR}>{OBJETIVO}</p>
    </Marco>
  );
}

export { SUBTEMA };
