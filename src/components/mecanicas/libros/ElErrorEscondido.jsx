import { useEffect, useMemo, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { FAE } from "../../../theme.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../data/contabilidad.js";
import { ERROR_ESCONDIDO } from "../../../data/contabilidadActividades.js";
import { montarCaso, sortearCasos, TIPOS_DE_ERROR } from "../../../contabilidad/siembra.js";
import { evaluarCuenta, evaluarTipo, puntuarErrorEscondido } from "../../../contabilidad/errorEscondido.js";
import { inclinacionDe } from "../../../contabilidad/balanza.js";
import { Opcion, Opciones, Retro, Pulsos, Cierre } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Responder, CuentaT, useTanda } from "./piezas.jsx";
import { Balanza, EstilosDeVerbos } from "./verbos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CU-12 · EL ERROR ESCONDIDO — Maestría · Experto.
 *
 * Tres casos por intento sobre el mayor completo de Lavado de Autos, cada uno
 * con un error sembrado. Dos preguntas: cuál cuenta, y qué le pasa.
 *
 * ═══════════ LA BALANZA ES EL INSTRUMENTO, Y TAMBIÉN LA LECCIÓN ═══════════
 *
 * Arriba de todo está la balanza de los dos totales del mayor, y es la
 * herramienta de trabajo: su inclinación dice que hay error y su rótulo dice
 * de cuánto, que es exactamente lo que la pista de la ficha manda a hacer.
 *
 * En los dos primeros casos funciona. En el tercero —que va siempre de
 * último, y siempre— la balanza está NIVELADA y sin embargo hay un error:
 * una cifra registrada en la cuenta equivocada no mueve ningún total. Ahí el
 * estudiante descubre solo que el instrumento tiene un punto ciego, y que el
 * mayor se contrasta contra el diario. Por eso el diario está a un toque
 * durante todo el juego y no aparece solo cuando hace falta: aparecer tarde
 * sería decirle cuándo mirarlo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ROTULO_PREGUNTA = {
  margin: "18px 0 9px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
  fontWeight: 700, letterSpacing: "0.16em",
};

const CIFRA = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontVariantNumeric: "tabular-nums",
};

/* El diario, consultable en cualquier momento. */
function LibroDiario({ transacciones, abierto, onAlternar }) {
  return (
    <div style={{ marginTop: "12px" }}>
      <button
        type="button"
        onClick={onAlternar}
        aria-expanded={abierto}
        style={{
          width: "100%", padding: "9px", borderRadius: "999px", cursor: "pointer",
          background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
          color: "rgba(248,249,250,0.72)", fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
        }}
      >
        {abierto ? "Cerrar el libro diario" : "Ver el libro diario"}
      </button>
      {abierto && (
        <div data-diario style={{
          marginTop: "9px", padding: "11px 12px", borderRadius: "12px",
          background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.14)",
        }}>
          {transacciones.map((t) => (
            <div key={t.id} data-asiento={t.id} style={{ padding: "6px 0", borderTop: "1px solid rgba(248,249,250,0.07)" }}>
              <p style={{
                margin: "0 0 3px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
                fontWeight: 700, letterSpacing: "0.1em", color: "rgba(248,249,250,0.5)",
              }}>
                {t.fecha}
              </p>
              {[[DEBE, t.asiento.debe], [HABER, t.asiento.haber]].map(([lado, renglones]) =>
                renglones.map(([cuenta, valor]) => (
                  <div key={`${lado}-${cuenta}-${valor}`} style={{
                    display: "flex", gap: "8px", alignItems: "baseline",
                    marginLeft: lado === HABER ? "16px" : 0,
                  }}>
                    <span style={{ flex: 1, minWidth: 0, fontSize: "12px", color: FAE.text }}>{cuenta}</span>
                    <span style={{ ...CIFRA, fontSize: "12px", color: COLOR_LADO[lado] }}>{pesos(valor)}</span>
                  </div>
                )),
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ElErrorEscondido({ Marco, rotulo, titulo, acento, onCompletar }) {
  const sortear = () => sortearCasos(ERROR_ESCONDIDO.casos, ERROR_ESCONDIDO.porPartida, barajar);
  const t = useTanda(sortear);

  const [señalada, setSeñalada] = useState(null);
  const [tipo, setTipo] = useState(null);
  const [retroCuenta, setRetroCuenta] = useState(null);
  const [retroTipo, setRetroTipo] = useState(null);
  const [diario, setDiario] = useState(false);
  const [respuestas, setRespuestas] = useState([]);

  const caso = t.items[t.i];
  const montado = useMemo(() => montarCaso(caso), [caso]);
  const { mayor, totales, descuadra } = montado;

  /* Las cuentas en el orden del mayor, barajado por intento como todo el sitio. */
  const cuentas = useMemo(() => barajar(mayor), [mayor]);

  const pct = puntuarErrorEscondido(respuestas);

  useEffect(() => {
    if (t.terminado) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);

  const responderCuenta = () => {
    if (retroCuenta || !señalada) return;
    const r = evaluarCuenta(caso, señalada, { descuadra });
    t.anotar(`${caso.id}:cuenta`, r.ok, r.ok ? null : señalada);
    setRetroCuenta(r);
  };

  const responderTipo = () => {
    if (retroTipo || !tipo) return;
    const r = evaluarTipo(caso, tipo);
    t.anotar(`${caso.id}:tipo`, r.ok, r.ok ? null : tipo);
    setRetroTipo(r);
    setRespuestas((xs) => [...xs, { cuentaOk: retroCuenta.ok, tipoOk: r.ok }]);
  };

  const avanzar = () => {
    setSeñalada(null); setTipo(null); setRetroCuenta(null); setRetroTipo(null); setDiario(false);
    if (t.i + 1 < t.items.length) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => {
    t.reiniciar();
    setSeñalada(null); setTipo(null); setRetroCuenta(null); setRetroTipo(null);
    setDiario(false); setRespuestas([]);
  };

  if (t.terminado) {
    const cuentasBien = respuestas.filter((r) => r.cuentaOk).length;
    const tiposBien = respuestas.filter((r) => r.tipoOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otros casos">
          <p style={TEXTO_CIERRE}>
            {cuentasBien} de {respuestas.length} cuentas señaladas bien, y {tiposBien} de {respuestas.length} diagnósticos correctos.
          </p>
        </Cierre>
      </Marco>
    );
  }

  const estadoCuenta = (nombre) => {
    if (!retroCuenta) return señalada === nombre ? "elegida" : null;
    if (nombre === caso.cuenta) return retroCuenta.ok ? "correcta" : "revelada";
    if (nombre === señalada) return "incorrecta";
    return null;
  };

  const bordeDe = (estado) => {
    /* B4: el acierto en Contabilidad va en neutro, nunca en teal (que es el DEBE). */
    if (estado === "correcta") return FAE.text;
    if (estado === "incorrecta") return FAE.coral;
    if (estado === "revelada") return FAE.ambar;
    if (estado === "elegida") return FAE.text;
    return "transparent";
  };

  const estadoTipo = (id) => {
    if (!retroTipo) return tipo === id ? "elegida" : null;
    if (id === caso.tipo) return retroTipo.ok ? "correcta" : "revelada";
    if (id === tipo) return "incorrecta";
    return null;
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <EstilosDeVerbos />
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={t.items.length} hechos={t.i + (retroTipo ? 1 : 0)} enCurso={t.i + 1} etiqueta="Caso" />
      </div>

      {/*
        La balanza de los dos totales del mayor. Es el instrumento: dice que
        hay error y de cuánto. En el caso mudo dice que todo está bien, y esa
        es la lección.
      */}
      <Balanza
        inclinacion={inclinacionDe(totales.debe, totales.haber)}
        izquierda={pesos(totales.debe)}
        derecha={pesos(totales.haber)}
        etiqueta={descuadra
          ? `El mayor está descuadrado por ${pesos(totales.descuadre)}`
          : "Los dos totales del mayor coinciden"}
      />
      <p data-veredicto style={{
        margin: "4px 0 0", textAlign: "center", fontSize: "12.5px",
        color: descuadra ? FAE.ambar : "rgba(248,249,250,0.6)",
      }}>
        {descuadra
          ? `El debe y el haber difieren en ${pesos(totales.descuadre)}.`
          : "Los dos totales coinciden. Aun así, hay un error."}
      </p>

      <p style={{ ...ROTULO_PREGUNTA, color: acento }}>¿CUÁL CUENTA NO CUADRA?</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
        {cuentas.map((c) => {
          const estado = estadoCuenta(c.cuenta);
          return (
            <button
              key={c.cuenta}
              type="button"
              data-cuenta={c.cuenta}
              data-estado={estado ?? ""}
              disabled={Boolean(retroCuenta)}
              aria-pressed={señalada === c.cuenta}
              onClick={() => setSeñalada(c.cuenta)}
              style={{
                display: "block", width: "100%", padding: 0, textAlign: "left",
                background: "transparent", borderRadius: "16px",
                border: `2px solid ${bordeDe(estado)}`,
                cursor: retroCuenta ? "default" : "pointer",
                opacity: retroCuenta && !estado ? 0.5 : 1,
                transition: "border-color 200ms ease, opacity 200ms ease",
              }}
            >
              <CuentaT cuenta={c} saldo={c} compacta />
            </button>
          );
        })}
      </div>

      <LibroDiario transacciones={montado.transacciones} abierto={diario} onAlternar={() => setDiario((x) => !x)} />

      {retroCuenta && <Retro texto={retroCuenta.texto} />}

      {!retroCuenta && (
        <Responder onClick={responderCuenta} deshabilitado={!señalada}>Señalar esta cuenta</Responder>
      )}

      {retroCuenta && (
        <>
          <p style={{ ...ROTULO_PREGUNTA, color: acento }}>
            ¿QUÉ LE PASA A «{caso.cuenta.toUpperCase()}»?
          </p>
          <Opciones columnas="repeat(auto-fit, minmax(150px, 1fr))">
            {TIPOS_DE_ERROR.map((x) => (
              <Opcion
                key={x.id}
                ancho
                deshabilitada={Boolean(retroTipo)}
                onClick={() => setTipo(x.id)}
                estado={estadoTipo(x.id)}
              >
                {x.nombre}
              </Opcion>
            ))}
          </Opciones>
          {retroTipo && <Retro texto={retroTipo.texto} />}
          {!retroTipo
            ? <Responder onClick={responderTipo} deshabilitado={!tipo}>Responder</Responder>
            : (
              <Responder onClick={avanzar}>
                {t.i + 1 === t.items.length ? "Ver resultado" : "Siguiente caso"}
              </Responder>
            )}
        </>
      )}
    </Marco>
  );
}
