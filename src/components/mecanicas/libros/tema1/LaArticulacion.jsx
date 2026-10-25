import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP } from "../../../../data/contabilidadIntro.js";
import {
  T1_7, FLECHAS, CIERRE_T1_7, INVERSO_T1_7, ALT_T1_7, BANCO_T1_7,
} from "../../../../data/contabilidadTema1.js";
import {
  evaluarT1_7, lineaPorId, lineasDe, informeQueRecibe, puntuar, pesoDeCadaItem, sinEmoji,
} from "../../../../contabilidad/tema1.js";
import { Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { useTanda } from "../piezas.jsx";
import { useMovimientoReducido, SOLO_LECTOR } from "../verbos.jsx";
import { IdeaConTermino } from "./encabezado.jsx";
import EncabezadoCompacto from "../b5/EncabezadoCompacto.jsx";
import {
  Mensaje, RegionViva, IconoCheck, IconoX, CSS_B5H, CLASE_B5H,
} from "../b5/Devolucion.jsx";
import {
  SORA, INTER, SECUNDARIO, REPOSO, ACIERTO, FANTASMA, estiloC2, contadorDe, Avance, CSS_REGISTRO, CURVA,
} from "./registro.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-7 · LA ARTICULACIÓN — lo que llega se queda (P2 de Mai, 23-oct).
 *
 * Tres informes y cinco flechas. Todas llegan al mismo y de ese no sale
 * ninguna — y eso es lo que la actividad enseña, así que no puede estar
 * dibujado de entrada.
 *
 * ═══════════ UN INTENTO, Y EL REGISTRO ═══════════
 *
 * Origen y destino, y eso es la respuesta. Se acierte o no, se dibuja el hilo
 * CORRECTO (el registro); si erró, el suyo va al lado como fantasma —coral,
 * discontinuo y tachado—. Los dos hilos se van a los 1.200 ms.
 *
 * Lo que se QUEDA es la marca de llegada: un punto lleno de 8 px al final de
 * la línea a donde llegó la flecha correcta. No dice de dónde vino —así no
 * ayuda a descartar orígenes—, pero flecha a flecha deja ver que todas las
 * marcas caen en el mismo informe. La regla llega con lo que el estudiante
 * hace, no antes.
 *
 * ═══════════ LOS NODOS SON TODOS IGUALES ═══════════
 *
 * Mismo punto y mismo #B8C4D4 en las diez líneas: si los de origen fueran de
 * un tono y los de destino de otro, la regla estaría contestada de entrada.
 *
 * El veredicto lo pinta esta pieza (lucide, sin emoji); `Retro` y `Responder`
 * son compartidos y no se usan (#487).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Lo que duran los dos hilos en pantalla. */
export const MS_HILO = 1200;
/*
 * El sitio de los dos hilos y de «Iba aquí» se ajusta a cada flecha (Shoko,
 * #535): reservar el peor caso (149,8 px a 320) dejaba unos 200 px vacíos
 * entre el último bloque y la devolución. Ahora la zona toma el alto de lo
 * que esta flecha dibuja en el momento de responder —que es cuando aparece la
 * devolución debajo, así que nada de lo que ya estaba a la vista se mueve— y
 * lo guarda cuando los hilos se van: la devolución no sube a los 1.200 ms.
 * Antes de responder no hay nada debajo de la zona que pueda saltar.
 */

const CSS = `
@keyframes fae-t17-hilo { 0% { opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; } }
.fae-t17-hilo { animation: fae-t17-hilo ${MS_HILO}ms ${CURVA} both; }
/* En la demo el hilo se queda: entra y ahí sigue. */
@keyframes fae-t17-entra { from { opacity: 0; } to { opacity: 1; } }
.fae-t17-hilo-fijo { animation: fae-t17-entra 600ms ${CURVA} both; }
.fae-t17-cierre { animation: fae-t17-entra 600ms ${CURVA} both; }
@media (prefers-reduced-motion: reduce) {
  .fae-t17-hilo, .fae-t17-cierre, .fae-t17-hilo-fijo { animation: none !important; opacity: 1 !important; }
}
`;

/* El nodo. Uno solo, y el mismo para todas: no distingue origen de destino. */
function Nodo({ encendido }) {
  return (
    <span
      /* `data-nodo-linea` y no `data-nodo`: la línea de avance ya usa `data-nodo`. */
      data-nodo-linea
      aria-hidden="true"
      style={{
        flex: "none", width: "9px", height: "9px", borderRadius: "999px",
        background: encendido ? NEUTRO : "transparent",
        border: `1.5px solid ${NEUTRO}`,
      }}
    />
  );
}

/*
 * Una línea. `estado`: "desde" mientras se elige el origen; tras responder,
 * ACIERTO en las dos de la flecha correcta y FANTASMA en las tocadas que no
 * lo eran. `marca`: el icono de C2 en el destino (✓ o ✕), con su hueco
 * reservado. `llegada`: la marca que se queda.
 */
function Linea({ linea, estado, marca, llegada, onTocar, activo }) {
  const elegida = estado === "desde";
  const c2 = estado === ACIERTO || estado === FANTASMA ? estado : REPOSO;
  return (
    <button
      type="button"
      data-linea={linea.id}
      data-estado={estado ?? undefined}
      data-llegada={llegada ? "si" : undefined}
      aria-pressed={elegida}
      aria-label={`${linea.nombre}${llegada ? ", aquí llegó una flecha" : ""}`}
      disabled={!activo}
      onClick={activo ? () => onTocar(linea.id) : undefined}
      style={{
        display: "flex", alignItems: "center", gap: "7px", width: "100%", minHeight: "44px", boxSizing: "border-box",
        textAlign: "left", padding: "6px 9px", borderRadius: "9px",
        cursor: activo ? "pointer" : "default", color: FAE.text,
        fontFamily: INTER, fontSize: "12px", lineHeight: 1.3,
        ...estiloC2(c2),
        ...(elegida ? { border: `2px solid ${NEUTRO}`, background: "rgba(184,196,212,0.14)", boxShadow: "none" } : {}),
        ...(c2 === REPOSO && !elegida ? { background: "rgba(10,20,34,0.4)" } : {}),
        /* Tras responder, lo que no está en juego se atenúa (igual en la demo que en la partida). */
        opacity: activo || estado ? 1 : 0.55,
      }}
    >
      <Nodo encendido={elegida || c2 === ACIERTO} />
      <span style={{ flex: 1, minWidth: 0 }}>{linea.nombre}</span>
      <span aria-hidden="true" style={{ flex: "none", width: "16px", display: "flex", justifyContent: "center" }}>
        {marca === "ok" && <IconoCheck />}
        {marca === "mal" && <IconoX />}
      </span>
      {/* La marca de llegada: un punto lleno de 8 px al final de la línea. Hueco reservado. */}
      <span data-marca-llegada={llegada ? "si" : "no"} aria-hidden="true" style={{
        flex: "none", width: "8px", height: "8px", borderRadius: "999px",
        background: llegada ? FAE.text : "transparent",
      }} />
    </button>
  );
}

/* Un hilo: la pareja escrita, «origen → destino». El fantasma va tachado, en coral discontinuo. */
function Hilo({ desde, hasta, b, fantasma = false, fijo, sello }) {
  return (
    <p
      key={sello}
      data-hilo={fantasma ? undefined : ""}
      data-hilo-fantasma={fantasma ? "" : undefined}
      className="fae-t17-hilo-fijo"
      style={{
        margin: 0, padding: "6px 10px", borderRadius: "10px", boxSizing: "border-box",
        fontFamily: SORA, fontSize: "12px", fontWeight: 700, lineHeight: 1.35, textAlign: "center",
        ...(fantasma
          ? { color: FAE.text, background: "transparent", border: `2px dashed ${FAE.coral}`, textDecoration: "line-through" }
          : { color: NAVY_DEL_CHIP, background: NEUTRO, border: `2px solid ${NEUTRO}` }),
      }}
    >
      {lineaPorId(desde, b).nombre} → {lineaPorId(hasta, b).nombre}
    </p>
  );
}

/*
 * Cuál es la flecha «correcta» para enseñar cuando el estudiante falla: la
 * que sale de su origen; si su origen no es de los que mandan, la que llega a
 * su destino; si tampoco, la que une sus dos líneas al revés. Entre las que
 * sirvan, primero las que aún no ha dibujado. Si nada sirve, la primera que
 * le falta.
 */
export function flechaParaEnsenar(desdeId, hastaId, dibujadas, banco = BANCO_T1_7) {
  const pendientes = banco.flechas.filter((f) => !dibujadas.includes(f.id));
  const orden = [...pendientes, ...banco.flechas.filter((f) => dibujadas.includes(f.id))];
  return orden.find((f) => f.desde === desdeId)
    ?? orden.find((f) => f.hasta === hastaId)
    ?? orden.find((f) => f.desde === hastaId || f.hasta === desdeId)
    ?? orden[0];
}

/*
 * ═══════════ EL MODO DEMO DE «ASÍ SE JUEGA» ═══════════
 *
 * Es este mismo componente. `banco` le da las dos hojas de la panadería e
 * `items` la flecha del ejemplo; `modoDemo` le quita el encabezado y el
 * avance y no llama a `onCompletar`. En la demo el hilo no se va: la demo
 * termina justo en él.
 */
export default function LaArticulacion({
  Marco, rotulo, titulo, acento, onCompletar,
  items = null, banco = null, modoDemo = false,
}) {
  const reducido = useMovimientoReducido();
  const b = banco ?? BANCO_T1_7;
  const t = useTanda(() => items ?? [...b.flechas]);

  const [desde, setDesde] = useState(null);
  const [r, setR] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [hilo, setHilo] = useState(null);
  /* Las líneas a donde ya llegó una flecha (siempre la correcta): la marca que se queda. */
  const [llegadas, setLlegadas] = useState([]);
  const [dibujadas, setDibujadas] = useState([]);
  const [inverso, setInverso] = useState(null);
  const reloj = useRef(null);
  const zonaBoton = useRef(null);

  const cuantas = t.items.length;
  const pct = puntuar(respuestas, cuantas);
  const receptor = informeQueRecibe(b);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (r && !modoDemo) zonaBoton.current?.focus();
  }, [r]);

  const tocar = (id) => {
    if (r) return;
    if (!desde) { setDesde(id); return; }
    if (desde === id) { setDesde(null); return; }

    const nuevo = evaluarT1_7(desde, id, b);
    const buena = nuevo.ok ? nuevo.flecha : flechaParaEnsenar(desde, id, dibujadas, b);
    t.anotar(`${desde}>${id}`, nuevo.ok, nuevo.ok ? null : `${desde}>${id}`);
    setRespuestas((xs) => [...xs, { id: nuevo.ok ? nuevo.flecha.id : `i${t.i}`, primeroOk: nuevo.ok }]);
    setDibujadas((xs) => (xs.includes(buena.id) ? xs : [...xs, buena.id]));
    setLlegadas((xs) => (xs.includes(buena.hasta) ? xs : [...xs, buena.hasta]));
    setHilo({ buena, tocado: { desde, hasta: id }, sello: Date.now() });
    clearTimeout(reloj.current);
    /*
     * Los hilos se quedan hasta la flecha siguiente (Shoko, #535 b): la flecha
     * correcta se ve completa, con sus dos extremos, y el error tachado al lado.
     */
    setR({ ...nuevo, buena, tocado: { desde, hasta: id } });
    setDesde(null);
  };

  const avanzar = () => {
    clearTimeout(reloj.current);
    setR(null); setDesde(null); setHilo(null);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    t.reiniciar(); setR(null); setRespuestas([]);
    setDesde(null); setHilo(null); setLlegadas([]); setDibujadas([]); setInverso(null);
  };

  /* ═══════════ EL CIERRE: LAS CINCO A LA VEZ, Y EL MODO INVERSO ═══════════ */
  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}{CSS_B5H}</style>
        <div className={CLASE_B5H}>
          <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra vez">
            <p style={TEXTO_CIERRE}>
              {bien} de {cuantas} al primer intento. Cada flecha valía {pesoDeCadaItem(cuantas).toFixed(2)} %.
            </p>
          </Cierre>

          <div data-cierre-flechas className="fae-t17-cierre" style={{ marginTop: "14px" }}>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "5px" }}>
              {FLECHAS.map((f) => (
                <li key={f.id} data-flecha-cierre={f.id} style={{
                  display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 6px",
                  fontSize: "12px", color: "rgba(248,249,250,0.72)",
                }}>
                  <Nodo encendido />
                  <span>{lineaPorId(f.desde).nombre}</span>
                  <span aria-hidden="true" style={{ color: NEUTRO }}>→</span>
                  <span>{lineaPorId(f.hasta).nombre}</span>
                </li>
              ))}
            </ul>
            <p data-cierre-texto style={{
              margin: "11px 0 0", padding: "9px 11px", borderRadius: "11px",
              fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.82)",
              background: "rgba(184,196,212,0.1)", borderLeft: `3px solid ${NEUTRO}`,
            }}>
              {CIERRE_T1_7}
            </p>
          </div>

          {/* ═══════════ EL MODO INVERSO: TRES PREGUNTAS, SIN FP ═══════════ */}
          <div data-inverso style={{ marginTop: "16px" }}>
            <p data-rotulo-seccion style={{
              margin: "0 0 4px", fontFamily: SORA, fontSize: "12px",
              fontWeight: 700, letterSpacing: "0.12em", color: acento,
            }}>
              AHORA AL REVÉS
            </p>
            <p data-sin-fp style={{ margin: "0 0 9px", fontSize: "12px", color: SECUNDARIO }}>
              Estas tres no dan FP. Son para mirar la regla desde el otro lado.
            </p>
            {INVERSO_T1_7.map((q) => {
              const elegida = inverso?.[q.id] ?? null;
              const op = q.opciones.find((o) => o.id === elegida) ?? null;
              return (
                <div key={q.id} data-pregunta-inversa={q.id} style={{ marginBottom: "13px" }}>
                  <p style={{
                    margin: "0 0 6px", fontFamily: SORA, fontSize: "12.5px", fontWeight: 700,
                    lineHeight: 1.35, color: FAE.text,
                  }}>
                    {q.pregunta}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {q.opciones.map((o) => {
                      const esta = elegida === o.id;
                      return (
                        <button
                          key={o.id}
                          type="button"
                          data-opcion={o.id}
                          data-elegida={esta ? "si" : "no"}
                          disabled={Boolean(elegida)}
                          onClick={elegida ? undefined : () => setInverso((x) => ({ ...(x ?? {}), [q.id]: o.id }))}
                          style={{
                            textAlign: "left", minHeight: "44px", padding: "8px 10px", borderRadius: "9px",
                            cursor: elegida ? "default" : "pointer",
                            background: esta ? "rgba(184,196,212,0.12)" : "rgba(10,20,34,0.4)",
                            border: `1px solid ${esta ? NEUTRO : "rgba(248,249,250,0.16)"}`,
                            color: FAE.text, fontSize: "12px", lineHeight: 1.35,
                            opacity: elegida && !esta ? 0.5 : 1,
                          }}
                        >
                          {o.texto}
                        </button>
                      );
                    })}
                  </div>
                  {/* El veredicto ya lo dice el mensaje: se quitan el emoji y el «Correcto.» repetido. */}
                  {op && <Mensaje ok={op.correcta} texto={sinEmoji(op.feedback).replace(/^Correcto\.\s*/, "")} />}
                </div>
              );
            })}
          </div>
        </div>
      </Marco>
    );
  }

  /* Estado de cada línea según la fase. */
  const estadoDe = (id) => {
    if (desde === id) return "desde";
    if (!hilo) return null;
    if (id === hilo.buena.desde || id === hilo.buena.hasta) return ACIERTO;
    if (!r?.ok && (id === hilo.tocado.desde || id === hilo.tocado.hasta)) return FANTASMA;
    return null;
  };
  /*
   * El icono de C2 en los dos extremos (Shoko, #535 b): ✓ en el origen y el
   * destino de la flecha correcta; ✕ en lo que tocó y no era, como en las
   * otras cinco piezas.
   */
  const marcaDe = (id) => {
    if (!r) return null;
    if (id === r.buena.desde || id === r.buena.hasta) return "ok";
    if (!r.ok && (id === r.tocado.desde || id === r.tocado.hasta)) return "mal";
    return null;
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}{CSS_B5H}{CSS_REGISTRO}</style>
      <div className={CLASE_B5H} data-t17>
        {!modoDemo && (
          <EncabezadoCompacto
            objetivo={T1_7.objetivo}
            contador={contadorDe("Flecha", t.i + 1, cuantas)}
            consigna={T1_7.consigna}
          />
        )}

        {/* Aquí dentro no entra el vocabulario del Tema 2. */}
        <div data-contenido>
          <div data-escenario>
            <div data-informes style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              {b.informes.map((inf) => (
                <div key={inf.id} data-informe={inf.id} style={{
                  padding: "9px 10px", borderRadius: "11px",
                  background: "rgba(10,20,34,0.3)", border: "1px solid rgba(248,249,250,0.12)",
                }}>
                  <span style={{ display: "block", marginBottom: "2px" }}>
                    <IdeaConTermino idea={inf.idea} termino={inf.termino} tamano={12} colorTermino={SECUNDARIO} />
                  </span>
                  {inf.cuando ? (
                    <p style={{ margin: "0 0 7px", fontSize: "12px", color: SECUNDARIO }}>
                      {inf.cuando}
                    </p>
                  ) : <span style={{ display: "block", height: "5px" }} />}
                  {(() => {
                    const lineas = lineasDe(inf.id, b);
                    const llave = lineas.find((l) => l.llave);
                    const resto = lineas.filter((l) => !l.llave);
                    const linea = (l) => (
                      <Linea key={l.id} linea={l} estado={estadoDe(l.id)} marca={marcaDe(l.id)}
                        llegada={llegadas.includes(l.id)} onTocar={tocar} activo={!r} />
                    );
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {/* La llave de activos y pasivos (Gráfico 2.6): arriba, y abarca las demás líneas del bloque. */}
                        {llave && linea(llave)}
                        <div data-llave-abarca={llave ? "si" : undefined} style={llave
                          ? { display: "flex", flexDirection: "column", gap: "4px", marginLeft: "8px", paddingLeft: "8px", borderLeft: `2px solid ${NEUTRO}` }
                          : { display: "flex", flexDirection: "column", gap: "4px" }}>
                          {resto.map(linea)}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>

            {/* Los hilos: la flecha correcta completa y, si erró, la suya tachada. Se quedan; no hay banda vacía. */}
            <div data-zona-hilo style={{ marginTop: "9px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {hilo && <Hilo desde={hilo.buena.desde} hasta={hilo.buena.hasta} b={b} fijo={modoDemo} sello={hilo.sello} />}
              {hilo && !r?.ok && <Hilo desde={hilo.tocado.desde} hasta={hilo.tocado.hasta} b={b} fantasma fijo={modoDemo} sello={`${hilo.sello}f`} />}
            </div>
          </div>
        </div>

        <RegionViva>
          {r && <Mensaje ok={r.ok} texto={sinEmoji(r.texto)} />}
        </RegionViva>

        {r && !modoDemo && (
          <Avance onClick={avanzar} refBoton={zonaBoton}>
            {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente flecha"}
          </Avance>
        )}

        {!modoDemo && (
          <>
            <p style={SOLO_LECTOR}>{ALT_T1_7}</p>
            <p style={SOLO_LECTOR}>
              Las cinco flechas llegan a: {b.informes.find((x) => x.id === receptor).idea}.
            </p>
          </>
        )}
      </div>
    </Marco>
  );
}
