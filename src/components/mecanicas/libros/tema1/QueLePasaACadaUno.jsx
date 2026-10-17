import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP, TEXTO_ATENUADO } from "../../../../data/contabilidadIntro.js";
import {
  T1_4, PARTES, CONTROLES, SUBE, BAJA, IGUAL, ALT_T1_4, SEGUNDA_T1_4,
} from "../../../../data/contabilidadTema1.js";
import {
  sortearT1_4, evaluarT1_4, puntuar,
  opcionesSegundaT1_4, escenaSegundaT1_4, porqueSegundaT1_4, CORRECTA_SEGUNDA_T1_4,
} from "../../../../contabilidad/tema1.js";
import SegundaDecisionT1 from "./segundaDecision.jsx";
import { Retro, Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { useMovimientoReducido, SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado, IdeaConTermino } from "./encabezado.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-4 · ¿QUÉ LE PASA A CADA UNO?
 *
 * Un hecho y las tres partes de la empresa. Para cada una: sube, baja o queda
 * igual. Con cada hecho se mueven DOS y la tercera se queda quieta, siempre.
 *
 * ═══════════ LA QUE NO SE MUEVE TIENE QUE VERSE NO MOVIÉNDOSE ═══════════
 *
 * «Queda igual» no es la ausencia de respuesta: es una respuesta. Si la barra
 * quieta no hiciera nada al revelar, sería indistinguible de una barra que
 * todavía no ha contestado. Así que late —cambia de brillo— sin cambiar de
 * alto ni un pixel. Moverla aunque fuera poco diría lo contrario de lo que
 * pasó.
 *
 * ═══════════ NI UN ▲ ═══════════
 *
 * Subir se dice con ↑. El ▲ es del Tema 2 y ahí significa otra cosa; gastarlo
 * aquí lo dejaría sin significado cuando llegue. Tampoco hay marcador de
 * saldo, ni arcos, ni balanza, ni teal o ámbar con significado.
 *
 * ═══════════ LA PRIORIDAD A > B ═══════════
 *
 * Quien marca «uno sube y el otro baja» cree que la ecuación es un balancín.
 * Esa es la creencia que hay que romper, y se le dice esa aunque además haya
 * movido la parte quieta. La lógica vive en `evaluarT1_4`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-t14-late {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}
.fae-t14-late { animation: fae-t14-late 900ms ease-in-out 2; }
@keyframes fae-t14-aparece { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.fae-t14-aparece { animation: fae-t14-aparece 320ms ease-out both; }
@keyframes fae-t14-rebota {
  0% { transform: translateX(0); } 30% { transform: translateX(-4px); }
  60% { transform: translateX(3px); } 100% { transform: translateX(0); }
}
.fae-t14-rebota { animation: fae-t14-rebota 400ms ease-out 1; }
@media (prefers-reduced-motion: reduce) {
  .fae-t14-late, .fae-t14-aparece, .fae-t14-rebota {
    animation: none !important; opacity: 1 !important; transform: none !important;
  }
}
`;

const SORA = "Sora, sans-serif";

/* Los tres altos de la barra. El de «queda igual» es el mismo que el de reposo. */
const ALTO = { reposo: 44, [SUBE]: 62, [BAJA]: 26, [IGUAL]: 44 };

const signoDe = (id) => CONTROLES.find((c) => c.id === id)?.signo ?? "";
const palabraDe = (id) => CONTROLES.find((c) => c.id === id)?.palabra ?? "";

function Barra({ parte, marcado, revelado, resaltada, reducido }) {
  /* Antes de revelar, la barra no se mueve: la elección se lee en los botones. */
  const estado = revelado ? revelado : null;
  const alto = estado ? ALTO[estado] : ALTO.reposo;
  const quieta = estado === IGUAL;

  return (
    <div
      data-parte={parte.id}
      data-revelado={estado ?? undefined}
      data-resaltada={resaltada ? "si" : undefined}
      style={{
        flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column",
        alignItems: "center", gap: "5px",
        padding: "7px 4px", borderRadius: "10px",
        background: resaltada ? "rgba(184,196,212,0.12)" : "transparent",
        border: `1px solid ${resaltada ? NEUTRO : "transparent"}`,
      }}
    >
      {/* El carril de alto fijo: la barra crece o mengua DENTRO de él, así que
          ninguna columna empuja a las otras al revelar. */}
      <div style={{ height: `${ALTO[SUBE]}px`, display: "flex", alignItems: "flex-end" }}>
        <div
          data-barra={parte.id}
          data-alto={alto}
          className={quieta && !reducido ? "fae-t14-late" : undefined}
          style={{
            width: "26px", height: `${alto}px`, borderRadius: "5px",
            background: NEUTRO, opacity: estado ? 1 : 0.5,
            transition: reducido ? "none" : "height 420ms cubic-bezier(.26,.84,.38,1), opacity 300ms ease",
          }}
        />
      </div>
      <span data-signo={estado ?? "sin"} style={{
        fontFamily: SORA, fontSize: "15px", fontWeight: 700, lineHeight: 1,
        color: estado ? NEUTRO : TEXTO_ATENUADO,
      }}>
        {estado ? signoDe(estado) : "·"}
      </span>
      {/*
        La ficha de lo marcado va ANTES del rótulo, no después. El rótulo del
        patrimonio ocupa tres renglones a 375 px y los otros dos, dos: con la
        ficha debajo, las tres quedaban a alturas distintas y parecían tres
        cosas de tres clases. Encima del rótulo se alinean solas, porque lo que
        tienen encima —carril y signo— sí mide siempre lo mismo.
      */}
      <span data-marcado={marcado ?? undefined} style={{
        minHeight: "15px", display: "flex", alignItems: "center",
        padding: marcado && !revelado ? "1px 6px" : 0, borderRadius: "6px",
        background: marcado && !revelado ? NEUTRO : "transparent", color: NAVY_DEL_CHIP,
        fontFamily: SORA, fontSize: "9.5px", fontWeight: 700,
      }}>
        {marcado && !revelado ? palabraDe(marcado) : ""}
      </span>
      <span style={{ textAlign: "center" }}>
        <IdeaConTermino idea={parte.idea} termino={parte.termino} tamano={11} />
      </span>
    </div>
  );
}

/*
 * ═══════════ EL MODO DEMO DE «ASÍ SE JUEGA» ═══════════
 *
 * Es este mismo componente, no una copia dibujada: `items` le da el ejemplo
 * desde afuera en vez de sortearlo del banco, y `modoDemo` le quita lo que no
 * es la zona de juego —el encabezado, el avance, el botón de seguir— y le
 * corta la salida: no llama a `onCompletar`, así que no hay FP, ni intentos,
 * ni progreso. Cómo se juega no cambia en nada; eso es lo que se enseña.
 */
export default function QueLePasaACadaUno({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const reducido = useMovimientoReducido();
  const t = useTanda(() => items ?? sortearT1_4(barajar));

  const [marcado, setMarcado] = useState({});
  const [r, setR] = useState(null);
  const [intento, setIntento] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [rebotando, setRebotando] = useState(false);
  /* La segunda decisión (D4): su escena para las tres barras. No puntúa. */
  const [escenaSegunda, setEscenaSegunda] = useState(null);
  const [segundaHecha, setSegundaHecha] = useState(false);
  const reloj = useRef(null);
  const zonaBoton = useRef(null);

  const h = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuar(respuestas, cuantas);
  const esperandoReintento = Boolean(r && !r.ok && intento === 1);
  const puedeResponder = !r || esperandoReintento;
  const completo = PARTES.every((p) => marcado[p.id]);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (r && !esperandoReintento && !modoDemo && segundaHecha) zonaBoton.current?.querySelector("button")?.focus();
  }, [r, esperandoReintento, segundaHecha]);

  const enviar = () => {
    if (!completo || (r && !esperandoReintento)) return;
    const nuevo = evaluarT1_4(h, marcado);

    if (!nuevo.ok) {
      setRebotando(true);
      clearTimeout(reloj.current);
      reloj.current = setTimeout(() => setRebotando(false), 420);
    }

    if (intento === 0) {
      t.anotar(h.id, nuevo.ok, nuevo.ok ? null : PARTES.map((p) => `${p.id}:${marcado[p.id]}`).join(" "));
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
    setR(null); setIntento(0); setMarcado({}); setRebotando(false);
    setEscenaSegunda(null); setSegundaHecha(false);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    t.reiniciar(); setR(null); setIntento(0); setRespuestas([]); setMarcado({}); setRebotando(false);
    setEscenaSegunda(null); setSegundaHecha(false);
  };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantas} al primer intento. Cada uno de los {cuantas} hechos vale lo mismo en tu resultado.
          </p>
        </Cierre>
      </Marco>
    );
  }

  /*
   * Solo se revela cuando la respuesta está cerrada. Con el reintento abierto,
   * enseñar el movimiento real sería darle la respuesta antes del segundo tiro.
   */
  /*
   * Mientras no haya segunda decisión, las barras enseñan lo que de verdad
   * pasó. Cuando la hay, manda ella: cada opción REPINTA las barras con lo que
   * esa opción afirma, así que quien dice que la igualdad se rompió ve las
   * barras rotas y lo que ve contradice lo que acabó de ver.
   */
  const esc = escenaSegunda;
  const revelado = esc ? esc.barras : r && !esperandoReintento ? r.real : null;
  const resaltadas = esc ? esc.resaltar : r && !r.ok && !esperandoReintento ? (r.resaltar ?? []) : [];

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      {!modoDemo && (
        <>
          <Encabezado objetivo={T1_4.objetivo} consigna={T1_4.consigna} onComoSeJuega={onComoSeJuega} />
          <div style={{ marginBottom: "12px" }}>
            <Pulsos total={cuantas} hechos={t.i + (r && !esperandoReintento ? 1 : 0)} enCurso={t.i + 1} etiqueta="Hecho" />
          </div>
        </>
      )}

      {/* Aquí dentro no entra el vocabulario del Tema 2. Hay una prueba que mira
          exactamente dentro de esta caja. */}
      <div data-contenido>
        <p data-hecho={h.id} style={{
          margin: "0 0 12px", padding: "10px 12px", borderRadius: "11px",
          fontSize: "13px", lineHeight: 1.45, color: FAE.text,
          background: "rgba(10,20,34,0.5)", border: "1px solid rgba(248,249,250,0.16)",
        }}>
          {h.texto}
        </p>

        <div
          data-barras
          className={rebotando ? "fae-t14-rebota" : undefined}
          /*
           * Alineadas por ARRIBA, no por abajo. Con `flex-end`, la columna del
           * patrimonio —cuyo rótulo ocupa dos renglones a 375 px— empujaba su
           * barra hacia arriba y las tres dejaban de partir del mismo suelo:
           * comparar alturas era comparar dos cosas que no arrancaban igual.
           * Lo cazó una captura.
           */
          style={{ display: "flex", gap: "5px", alignItems: "flex-start" }}
        >
          {PARTES.map((p) => (
            <Barra
              key={p.id}
              parte={p}
              marcado={marcado[p.id]}
              revelado={revelado ? revelado[p.id] : null}
              resaltada={resaltadas.includes(p.id)}
              reducido={reducido}
            />
          ))}
        </div>

        <p data-rotulo-seccion style={{
          margin: "14px 0 8px", fontFamily: SORA, fontSize: "10.5px",
          fontWeight: 700, letterSpacing: "0.16em", color: acento,
        }}>
          {esperandoReintento ? "INTÉNTALO OTRA VEZ" : "QUÉ LE PASA A CADA UNA"}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          {PARTES.map((p) => (
            <div key={p.id} data-fila={p.id} style={{
              display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px",
            }}>
              <span style={{ flex: "1 1 120px", minWidth: 0 }}>
                <IdeaConTermino idea={p.idea} termino={p.termino} tamano={11.5} />
              </span>
              <span style={{ display: "flex", gap: "4px", flex: "0 0 auto" }}>
                {CONTROLES.map((c) => {
                  const esta = marcado[p.id] === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      data-control={`${p.id}-${c.id}`}
                      data-marcada={esta ? "si" : "no"}
                      disabled={!puedeResponder}
                      onClick={puedeResponder ? () => setMarcado((m) => ({ ...m, [p.id]: c.id })) : undefined}
                      aria-label={`${p.idea} ${c.palabra}`}
                      aria-pressed={esta}
                      style={{
                        padding: "6px 9px", borderRadius: "9px",
                        cursor: puedeResponder ? "pointer" : "default",
                        background: esta ? NEUTRO : "rgba(10,20,34,0.45)",
                        color: esta ? NAVY_DEL_CHIP : FAE.text,
                        border: `${esta ? 2 : 1}px solid ${esta ? NEUTRO : "rgba(248,249,250,0.18)"}`,
                        fontFamily: SORA, fontSize: "11px", fontWeight: esta ? 700 : 500,
                        opacity: !puedeResponder && !esta ? 0.5 : 1,
                      }}
                    >
                      {c.signo} {c.palabra}
                    </button>
                  );
                })}
              </span>
            </div>
          ))}
        </div>

        {esperandoReintento && (
          <p data-fallo style={{
            margin: "9px 0 0", padding: "7px 10px", borderRadius: "10px",
            fontSize: "12px", textAlign: "center", color: "rgba(248,249,250,0.75)",
            border: `1px dashed ${FAE.coral}`,
          }}>
            Las barras no se movieron: vuelve a marcar.
          </p>
        )}
      </div>

      {r && <Retro texto={r.texto} />}

      {puedeResponder && (
        <Responder onClick={enviar} deshabilitado={!completo} colorApagado={TEXTO_ATENUADO}>
          {completo ? "Ver qué pasó" : "Marca las tres"}
        </Responder>
      )}
      {/*
        ═══════ LA SEGUNDA DECISIÓN (D4) ═══════

        La primera mira las tres partes una por una —sube, baja, queda igual—;
        esta mira los DOS LADOS juntos y pregunta qué le pasó a la igualdad.
        No es la misma pregunta en otro formato: solo se puede responder
        después de haber mirado las partes, y cada opción repinta las barras.
      */}
      {r && !esperandoReintento && !modoDemo && (
        <SegundaDecisionT1
          pregunta={SEGUNDA_T1_4.pregunta}
          opciones={opcionesSegundaT1_4()}
          correcta={CORRECTA_SEGUNDA_T1_4}
          porque={porqueSegundaT1_4(h)}
          escenaDe={(id) => escenaSegundaT1_4(h, id)}
          onPintar={setEscenaSegunda}
          onResuelta={() => setSegundaHecha(true)}
        />
      )}
      {r && !esperandoReintento && !modoDemo && segundaHecha && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>
            {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente hecho"}
          </Responder>
        </div>
      )}

      {!modoDemo && <p style={SOLO_LECTOR}>{ALT_T1_4}</p>}
      {revelado && (
        <p style={SOLO_LECTOR}>
          {PARTES.map((p) => `${p.idea}: ${palabraDe(revelado[p.id])}`).join(". ")}.
        </p>
      )}
    </Marco>
  );
}
