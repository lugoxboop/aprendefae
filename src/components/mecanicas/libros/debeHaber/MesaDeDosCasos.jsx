import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../../data/contabilidad.js";
import { PIEZA_DEBE_Y_HABER } from "../../../../data/contabilidadDebeHaber.js";
import { MESA, contraejemplo, CAJA_DEL_SALDO, saldoDeLaCaja } from "../../../../contabilidad/debeHaber.js";
import { CuentaDeValor, EstilosDeVerbos, useMovimientoReducido, SOLO_LECTOR } from "../verbos.jsx";
import { TONO_ROTULO, PANEL, Triangulito, MarcadorDeSaldo, Barra } from "./piezasDebeHaber.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPA 2 · «LA MESA DE DOS CASOS».
 *
 * Cinco segmentos. Ninguno avanza solo: cada uno corre, se detiene, y espera.
 * Mientras corre, los dos botones están apagados — no por prudencia, sino
 * porque un «Siguiente» pulsable a media animación convierte la pieza en algo
 * que se salta.
 *
 * ═══════════ EL SEGMENTO 3 ES LA PIEZA ═══════════
 *
 * Dos transacciones reales del capítulo, las dos con un débito de $50.000, en
 * pantalla AL MISMO TIEMPO. Comparar dos casos lado a lado transfiere el
 * principio en un 48 % de los casos contra un 19 % estudiándolos por separado
 * (Gentner, Loewenstein & Thompson, 2003). Por eso los dos paneles no se
 * apilan nunca, ni siquiera a 375 px: apilarlos destruye el mecanismo.
 *
 * Y por eso las contrapartidas NO EXISTEN hasta el tiempo 4 — ni dibujadas,
 * ni atenuadas, ni con hueco reservado. Si el estudiante ve que falta algo
 * abajo, deduce que hay una segunda cuenta y se pone a razonar sobre el
 * asiento completo en vez de sobre el contraste.
 *
 * El panel tiene su altura final desde el tiempo 1, con la zona de la
 * contrapartida en fondo liso: nada se desplaza cuando aparece.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const P = PIEZA_DEBE_Y_HABER;
const TIEMPOS = P.tiempos;

const TEXTO = { margin: 0, fontSize: "14.5px", lineHeight: 1.6, color: FAE.text };
const NOTA = { margin: "8px 0 0", fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.6)" };

/* ═══════════════ SEGMENTOS 1 Y 2 · LA CUENTA NACE Y SE NOMBRA ═══════════════ */

function CuentaQueNace({ conRotulos, conFichas, reducido }) {
  return (
    <div style={{ ...PANEL, maxWidth: "260px", margin: "0 auto" }}>
      <p style={{
        margin: "0 0 7px", fontFamily: "Sora, sans-serif", fontWeight: 700,
        fontSize: "13px", color: FAE.text, textAlign: "center",
      }}>
        MAQUINARIA
      </p>
      <div style={{
        display: "flex", borderTop: "1px solid rgba(248,249,250,0.3)", paddingTop: "8px",
        minHeight: "76px",
      }}>
        {[DEBE, HABER].map((lado) => (
          <div key={lado} style={{
            flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
            gap: "5px", padding: "0 6px",
            borderLeft: lado === HABER ? "1px solid rgba(248,249,250,0.3)" : "none",
          }}>
            {conRotulos && (
              <span data-rotulo={lado} style={{
                fontFamily: "Sora, sans-serif", fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.14em", color: TONO_ROTULO[lado], textAlign: "center",
              }}>
                {lado === DEBE ? "← DEBE" : "HABER →"}
              </span>
            )}
            <span style={{ flex: 1 }} />
            {conFichas && (
              <span
                className={reducido ? undefined : "fae-cae"}
                data-ficha-simple={lado}
                style={{
                  height: "22px", borderRadius: "7px",
                  background: `${COLOR_LADO[lado]}22`, border: `1px solid ${COLOR_LADO[lado]}`,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ SEGMENTO 3 · LOS DOS PANELES ═══════════════ */

function PanelDeCaso({ panel, tiempo }) {
  const t = TIEMPOS[tiempo];
  const d = panel.debito;
  const c = panel.contrapartida;
  const valor = t.reaccion ? d.despues : d.antes;

  return (
    <div data-panel={panel.id} style={{ ...PANEL, flex: "1 1 0", minWidth: 0, padding: "9px 7px" }}>
      {/* La cuenta que recibe el débito: grande y arriba. */}
      <p style={{
        margin: "0 0 5px", fontFamily: "Sora, sans-serif", fontWeight: 700,
        fontSize: "12px", lineHeight: 1.2, color: FAE.text, textAlign: "center",
      }}>
        {d.cuenta}
      </p>
      <Triangulito lado={d.triangulo} />
      <Barra
        data-barra={d.cuenta}
        valor={valor}
        maximo={Math.max(d.antes, d.despues, d.monto)}
        lado={d.ladoDelSaldo ?? d.triangulo}
        signo={t.reaccion ? (d.sube ? "+" : "−") : null}
      />
      <div style={{ marginTop: "5px" }}>
        {/* La ficha del débito, siempre en el debe, siempre del mismo monto. */}
        <span data-ficha-debito={panel.id} className="fae-cae" style={{
          display: "block", padding: "3px 0", borderRadius: "7px", textAlign: "center",
          background: `${COLOR_LADO[DEBE]}22`, border: `1px solid ${COLOR_LADO[DEBE]}`,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          fontSize: "10.5px", fontWeight: 700, color: TONO_ROTULO[DEBE],
        }}>
          ← {pesos(d.monto)} al debe
        </span>
      </div>

      {/*
        LA ZONA DE LA CONTRAPARTIDA. Ocupa su altura desde el tiempo 1 y se ve
        como fondo liso: ni caja, ni punteado, ni hueco. Nada se mueve cuando
        la contrapartida entra.
      */}
      {/*
        72 px y no 58: medido a 375 px, «Obligaciones financieras» envuelve a
        dos líneas y su bloque ocupa 67. Con 58 reservados el panel crecía de
        222 a 231 al llegar el tiempo 4 — nueve píxeles de salto, que es
        exactamente la señal de «faltaba algo» que la regla prohíbe. Se vio
        midiendo el panel antes y después, no leyendo el código.

        La reserva está ajustada a las dos contrapartidas de esta pieza, que
        son dos y no cambian: Obligaciones financieras y Caja.
      */}
      <div data-zona-contrapartida={t.contrapartidas ? "llena" : "lisa"} style={{ minHeight: "72px", marginTop: "7px" }}>
        {t.contrapartidas && (
          <div className="fae-cae" data-contrapartida={c.cuenta}>
            <p style={{
              margin: "0 0 3px", fontFamily: "Sora, sans-serif", fontWeight: 600,
              fontSize: "10px", lineHeight: 1.2, color: "rgba(248,249,250,0.72)", textAlign: "center",
            }}>
              {c.cuenta}
            </p>
            <span style={{
              display: "block", padding: "3px 0", borderRadius: "7px", textAlign: "center",
              background: `${COLOR_LADO[HABER]}1C`, border: `1px solid ${COLOR_LADO[HABER]}88`,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              fontSize: "10px", fontWeight: 700, color: TONO_ROTULO[HABER],
            }}>
              {pesos(c.monto)} al haber →
            </span>
            <p style={{
              margin: "3px 0 0", fontSize: "9.5px", textAlign: "center",
              color: "rgba(248,249,250,0.55)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            }}>
              {pesos(c.antes)} → {pesos(c.despues)}
            </p>
          </div>
        )}
      </div>

      <div data-zona-enunciado={t.enunciados ? "llena" : "lisa"} style={{ minHeight: "54px", marginTop: "7px" }}>
        {t.enunciados && (
          <p className="fae-cae" data-enunciado={panel.id} style={{
            margin: 0, fontSize: "10.5px", lineHeight: 1.4, color: "rgba(248,249,250,0.8)",
          }}>
            {panel.enunciado}
          </p>
        )}
      </div>
    </div>
  );
}

function DosCasos({ tiempo, prediccion, onPredecir }) {
  return (
    <div>
      {/* Lado a lado SIEMPRE: apilarlos destruye la comparación simultánea. */}
      <div data-mesa-dos-casos style={{ display: "flex", gap: "12px", alignItems: "stretch" }}>
        {MESA.map((panel) => <PanelDeCaso key={panel.id} panel={panel} tiempo={tiempo} />)}
      </div>

      {tiempo === 1 && (
        <div data-prediccion style={{ marginTop: "12px" }}>
          <p style={{ ...TEXTO, fontSize: "14px" }}>{P.prediccion.texto}</p>
          <div style={{ display: "flex", gap: "8px", marginTop: "9px" }}>
            {P.prediccion.opciones.map((o) => (
              <button
                key={o.id}
                type="button"
                data-opcion-prediccion={o.id}
                aria-pressed={prediccion === o.id}
                onClick={() => onPredecir(o.id)}
                style={{
                  flex: 1, padding: "10px 6px", borderRadius: "11px", cursor: "pointer",
                  background: prediccion === o.id ? "rgba(248,249,250,0.08)" : "transparent",
                  border: `1px solid ${prediccion === o.id ? FAE.text : "rgba(248,249,250,0.26)"}`,
                  color: FAE.text, fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
                }}
              >
                {o.nombre}
              </button>
            ))}
          </div>
          {/* No se califica: no hay acierto ni fallo, solo compromiso. */}
          <p style={NOTA}>Elige una para seguir. No se califica.</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ SEGMENTO 4 · LA ECUACIÓN Y EL CONTRAEJEMPLO ═══════════════ */

function Ecuacion({ iluminar }) {
  const terminos = [
    { id: "activo", nombre: "ACTIVO", lado: DEBE },
    { id: "pasivo", nombre: "PASIVO", lado: HABER },
    { id: "patrimonio", nombre: "PATRIMONIO", lado: HABER },
  ];
  return (
    <div data-ecuacion style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
      flexWrap: "wrap", marginTop: "10px", padding: "9px 8px", borderRadius: "11px",
      background: "rgba(10,20,34,0.4)", border: "1px solid rgba(248,249,250,0.12)",
    }}>
      {terminos.map((t, k) => (
        <span key={t.id} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          {k === 1 && <span aria-hidden="true" style={{ color: "rgba(248,249,250,0.5)" }}>=</span>}
          {k === 2 && <span aria-hidden="true" style={{ color: "rgba(248,249,250,0.5)" }}>+</span>}
          <span data-termino={t.id} style={{
            fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
            padding: "3px 7px", borderRadius: "7px",
            color: iluminar ? TONO_ROTULO[t.lado] : "rgba(248,249,250,0.6)",
            background: iluminar ? `${COLOR_LADO[t.lado]}1A` : "transparent",
            border: `1px solid ${iluminar ? COLOR_LADO[t.lado] : "transparent"}`,
            transition: "color 300ms ease, background 300ms ease, border-color 300ms ease",
          }}>
            {t.nombre}
          </span>
        </span>
      ))}
    </div>
  );
}

function Contraejemplo() {
  const c = contraejemplo();
  return (
    <div data-contraejemplo>
      <div style={{ display: "flex", gap: "12px", alignItems: "stretch" }}>
        {[c.izquierda, c.derecha].map((x) => (
          <div key={x.cuenta} style={{ ...PANEL, flex: "1 1 0", minWidth: 0, padding: "9px 7px" }}>
            <p style={{
              margin: "0 0 5px", fontFamily: "Sora, sans-serif", fontWeight: 700,
              fontSize: "12px", lineHeight: 1.2, color: FAE.text, textAlign: "center",
            }}>
              {x.cuenta}
            </p>
            <Triangulito lado={x.triangulo} />
            <Barra valor={x.despues} maximo={Math.max(x.despues, c.izquierda.despues)} lado={x.triangulo} signo="+" />
            <p style={{
              margin: "5px 0 0", fontSize: "10px", textAlign: "center", color: "rgba(248,249,250,0.65)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            }}>
              {pesos(x.antes)} → {pesos(x.despues)}
            </p>
          </div>
        ))}
      </div>
      <p style={{ ...NOTA, textAlign: "center" }}>{c.enunciado}</p>
    </div>
  );
}

/* ═══════════════ SEGMENTO 5 · EL SALDO ═══════════════ */

function ElSaldo({ cancelado }) {
  const s = saldoDeLaCaja();
  return (
    <div>
      <CuentaDeValor
        cuenta="Caja"
        debitos={CAJA_DEL_CAPITULO_DEBITOS}
        creditos={CAJA_DEL_CAPITULO_CREDITOS}
        cancelar={cancelado}
        triangulo={DEBE}
        flechas
        tonoRotulo={TONO_ROTULO}
        alto={120}
      />
      <MarcadorDeSaldo lado={cancelado ? s.lado : null} cifra={s.saldo} />
    </div>
  );
}

const CAJA_DEL_CAPITULO_DEBITOS = CAJA_DEL_SALDO.debitos;
const CAJA_DEL_CAPITULO_CREDITOS = CAJA_DEL_SALDO.creditos;

/* ═══════════════════════ EL ORQUESTADOR DE LA CAPA 2 ═══════════════════════ */

export default function MesaDeDosCasos() {
  const reducido = useMovimientoReducido();
  const [segmento, setSegmento] = useState(0);
  /* Dentro del segmento 3, en cuál de los cinco tiempos va. */
  const [tiempo, setTiempo] = useState(0);
  const [prediccion, setPrediccion] = useState(null);
  const [corriendo, setCorriendo] = useState(false);
  const [parteB, setParteB] = useState(false);
  const reloj = useRef(null);

  const s = P.segmentos[segmento];
  const esDosCasos = s.id === "dos-casos";
  const esCausa = s.id === "causa";
  const esSaldo = s.id === "saldo";

  /*
   * ═══════════ NADA AVANZA SOLO, Y NADA SE PULSA A MEDIAS ═══════════
   *
   * Cada entrada en un segmento —o en un tiempo del segmento 3— arranca su
   * animación y apaga los botones hasta que termina. Con movimiento reducido
   * la duración es cero: el estado final es idéntico, nadie pierde
   * información por apagar la animación.
   */
  const animar = (ms) => {
    clearTimeout(reloj.current);
    if (reducido || ms <= 0) { setCorriendo(false); return; }
    setCorriendo(true);
    reloj.current = setTimeout(() => setCorriendo(false), ms);
  };

  useEffect(() => () => clearTimeout(reloj.current), []);

  const duracionDelSegmento = { nace: 500, lados: 700, causa: 600, saldo: 700 };

  const entrarEn = (k) => {
    setSegmento(k);
    setTiempo(0);
    setParteB(false);
    animar(P.segmentos[k].id === "dos-casos" ? TIEMPOS[0].ms : duracionDelSegmento[P.segmentos[k].id] ?? 0);
  };

  const repetir = () => {
    if (esDosCasos) { animar(TIEMPOS[tiempo].ms); return; }
    if (esCausa && parteB) { animar(700); return; }
    animar(duracionDelSegmento[s.id] ?? 0);
  };

  /*
   * La predicción se dice UNA vez. Escribirla también dentro de
   * `puedeAvanzarDentro` la ponía en dos sitios que podían separarse: quitarla
   * de allí no cambiaba nada, porque el botón ya estaba apagado — o sea que
   * ese trozo no defendía de nada y sí podía mentir.
   */
  const esperandoPrediccion = esDosCasos && tiempo === 1 && prediccion === null;

  /* Qué hace «Siguiente» depende de dónde esté: dentro del segmento o fuera. */
  const puedeAvanzarDentro = esDosCasos
    ? tiempo < TIEMPOS.length - 1
    : (esCausa && !parteB);

  const avanzar = () => {
    if (corriendo || esperandoPrediccion) return;
    if (esDosCasos && puedeAvanzarDentro) {
      const siguiente = tiempo + 1;
      setTiempo(siguiente);
      animar(TIEMPOS[siguiente].ms);
      return;
    }
    if (esCausa && !parteB) { setParteB(true); animar(700); return; }
    if (segmento < P.segmentos.length - 1) entrarEn(segmento + 1);
  };

  const atras = () => {
    if (corriendo || segmento === 0) return;
    entrarEn(segmento - 1);
  };

  const ultimo = segmento === P.segmentos.length - 1 && !puedeAvanzarDentro;

  /* El texto que acompaña: en el segmento 3 depende del tiempo. */
  const texto = (() => {
    if (esDosCasos) {
      if (tiempo <= 1) return P.notaDeVariable;
      if (tiempo === 4) return P.textoEnunciados;
      return s.texto;
    }
    if (esCausa && parteB) return s.contraejemplo.texto;
    return s.texto;
  })();

  const boton = (activo) => ({
    padding: "10px 16px", borderRadius: "999px", fontFamily: "Sora, sans-serif",
    fontSize: "13px", fontWeight: 600, cursor: activo ? "pointer" : "default",
    background: "transparent",
    border: `1px solid ${activo ? "rgba(248,249,250,0.3)" : "rgba(248,249,250,0.1)"}`,
    color: activo ? FAE.text : "rgba(248,249,250,0.35)",
  });

  return (
    <div data-capa2-debe-haber>
      <EstilosDeVerbos />
      <div style={{
        borderRadius: "14px", background: "rgba(10,20,34,0.45)",
        border: "1px solid rgba(248,249,250,0.1)", padding: "10px",
      }}>
        {s.id === "nace" && <CuentaQueNace conRotulos={false} conFichas={false} reducido={reducido} />}
        {s.id === "lados" && <CuentaQueNace conRotulos conFichas reducido={reducido} />}
        {esDosCasos && <DosCasos tiempo={tiempo} prediccion={prediccion} onPredecir={setPrediccion} />}
        {esCausa && !parteB && (
          <>
            <div style={{ display: "flex", gap: "12px", alignItems: "stretch" }}>
              {MESA.map((panel) => <PanelDeCaso key={panel.id} panel={panel} tiempo={3} />)}
            </div>
            <Ecuacion iluminar={!corriendo} />
          </>
        )}
        {esCausa && parteB && <Contraejemplo />}
        {esSaldo && <ElSaldo cancelado={!corriendo} />}
      </div>

      {/* La versión sin movimiento no pierde nada: el texto alternativo lo dice. */}
      <p style={SOLO_LECTOR}>
        {esCausa && parteB ? s.contraejemplo.alterno : s.alterno}
      </p>

      <p style={{
        margin: "12px 0 6px", fontFamily: "Sora, sans-serif", fontSize: "11.5px",
        fontWeight: 600, color: "rgba(248,249,250,0.55)",
      }}>
        Segmento {segmento + 1} de {P.segmentos.length}
        {esDosCasos ? ` · tiempo ${tiempo + 1} de ${TIEMPOS.length}` : ""}
        {esCausa ? ` · parte ${parteB ? "B" : "A"}` : ""}
      </p>
      <p data-texto-segmento aria-live="polite" style={TEXTO}>{texto}</p>

      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <button type="button" data-atras disabled={corriendo || segmento === 0} onClick={atras} style={boton(!corriendo && segmento > 0)}>
          Anterior
        </button>
        <button type="button" data-repetir disabled={corriendo} onClick={repetir} style={boton(!corriendo)}>
          Repetir
        </button>
        <button
          type="button"
          data-siguiente
          disabled={corriendo || ultimo || esperandoPrediccion}
          onClick={avanzar}
          style={boton(!corriendo && !ultimo && !esperandoPrediccion)}
        >
          Siguiente
        </button>
      </div>
      {esperandoPrediccion && (
        <p style={NOTA}>La animación no sigue hasta que elijas una de las dos.</p>
      )}
    </div>
  );
}
