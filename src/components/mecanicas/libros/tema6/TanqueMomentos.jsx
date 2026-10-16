import { useEffect, useRef, useState } from "react";
import {
  CONSIGNA_CAPA_3_T6_A3, MOMENTOS_T6_A3, CUENTA_T_T6_A3, FINAL_CAPA_3_T6_A3, TANQUE_T6_A3,
} from "../../../../data/contabilidadT6Pieza3.js";
import { NIVEL_OPCION_T6_A3, REGISTRO_OPCION_T6_A3, NIVEL_MOMENTO_T6_A3 } from "../../../../contabilidad/t6Pieza3.js";
import { FAE } from "../../../../theme.js";
import { useReducido } from "../tema3/DosLineas.jsx";
import { escalera, elegir } from "./escaleraB5.js";
import { LECTURA, PIE } from "./CajasQueRevelan.jsx";
import TanqueProvision, { MONO, HUNDIDO } from "./TanqueProvision.jsx";
import { Ficha } from "./LaProvision.jsx";
import {
  Pastilla, Mensaje, RegionViva, CORRECTA, TACHADA, REPOSO_B, ACIERTO_B, ERROR_B, CSS_B5H, CLASE_B5H,
} from "../b5/Devolucion.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 3 · CAPA 3 · «AHORA PRUEBE USTED» SOBRE EL TANQUE (lote 7,
 * §3.3 de Mai con la decisión (a) de Sakuta). Reemplaza a CuentaT.
 *
 * Arriba, la figura: la T y el tanque en el estado de cada momento. No va
 * pegada: la tarjeta sigue justo debajo y la figura del momento 2 mide más
 * de media pantalla (pegada, sus opciones se salían por arriba al acabarse
 * la capa); al elegir, la página se mueve lo justo para ver el mensaje. Las opciones SON partes del modelo, con la misma
 * forma entre ellas:
 *   · momento 1: las dos columnas de la T son botones; la tercera opción de
 *     Futaba (la de «es solo un cálculo») va bajo la T, con el mismo
 *     contorno y alto (la hoja la dejaba fuera; el texto aprobado manda);
 *   · momento 2: tres marcas del saldo, ordenadas por su nivel, junto al tanque;
 *   · momento 3: tres fichas de gasto con las palabras de Futaba («Mayor»,
 *     «Igual», «Menor»): se tocan o se arrastran al tanque. La hoja pedía
 *     cifras y otra pregunta, sin devoluciones aprobadas: manda Futaba.
 * Debajo, la tarjeta del momento: «Momento n de 3», su nombre, la pregunta y
 * el mensaje.
 *
 * La escalera de ayuda (C2, escaleraB5.js), decisión (a):
 *   · primer error: la opción con 2 px coral y «No va aquí»; el mensaje con la
 *     PISTA; el modelo responde (momento 2: el nivel va a la marca 600 ms y
 *     vuelve; momento 3: el relleno sube lo que registra la ficha, no llega a
 *     la línea y vuelve). Sin cifra nueva en pantalla;
 *   · segundo error: el mensaje con la devolución de Futaba (la respuesta con
 *     su porqué); el modelo pasa al estado correcto. Nunca «Iba aquí»;
 *   · acierto: 2 px #F8F9FA y «Correcto»; el modelo se mueve; el mensaje con
 *     el texto que se revela y su pie (B5: solo lo lee quien acierta).
 * El botón de avance (el Siguiente secundario) lleva al que sigue; en el
 * último, el texto final queda bajo el tanque. Ningún texto vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const T = TANQUE_T6_A3;
const INTER = "Inter, sans-serif";
const BLANCO = FAE.text;
const SECUNDARIO = "#A8B6C8";
const NEUTRO = "#B8C4D4";
const DEBE = "#3FA69A";
const TONO = { debe: DEBE, haber: FAE.ambar };
const VA_Y_VUELVE = 600;

const decideDe = (m) => ({ pregunta: m.pregunta, opciones: m.opciones, correcta: m.correcta, falla: m.falla, pista: m.pista });
/* La marca de una opción: correcta si se acertó con ella; tachada si se eligió mal. */
const marcaDe = (esc, id, correcta) => (esc.intentos.includes(id) ? (id === correcta ? CORRECTA : TACHADA) : null);
const bordeDe = (marca) => (marca === CORRECTA ? ACIERTO_B : marca === TACHADA ? ERROR_B : REPOSO_B);

/* Una opción con forma de botón de 44: la tercera del momento 1 y las marcas del momento 2. */
function OpcionDelModelo({ o, marca, activa, onElegir, children = null, estilo = null }) {
  const d = marca ? 1 : 0;
  return (
    <button type="button" data-opcion={o.id} data-marca={marca ?? ""} aria-disabled={!activa || undefined} aria-pressed={Boolean(marca)}
      onClick={() => { if (activa) onElegir(o.id); }} style={{
        display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px", width: "100%", minHeight: "44px", boxSizing: "border-box",
        margin: 0, padding: `${8 - d}px ${10 - d}px`, borderRadius: "10px", border: bordeDe(marca), background: FAE.bg, color: BLANCO,
        fontFamily: INTER, fontSize: "13px", lineHeight: "18px", textAlign: "left", cursor: activa ? "pointer" : "default", ...estilo,
      }}>
      {children ?? <span data-texto-opcion>{o.texto}</span>}
      {marca && <Pastilla marca={marca} />}
    </button>
  );
}

/* La T de la provisión: lo ya decidido, con su monto y la fecha del momento. En el momento 1, cada columna es una opción. */
function CuentaT({ hechos, columnas }) {
  const columna = (lado) => {
    const filas = hechos.filter((m) => m.lado === lado);
    const op = columnas?.opciones.find((o) => o.id === lado);
    const marca = op ? marcaDe(columnas.esc, op.id, columnas.correcta) : null;
    const activa = Boolean(op) && !columnas.esc.resuelta && !marca;
    const Etiqueta = op ? "button" : "div";
    const d = marca ? 1 : 0;
    return (
      <Etiqueta key={lado} data-columna={lado} {...(op ? {
        /* La marca va en su pastilla, no en la columna: la columna lleva el color de su lado (ámbar el HABER). */
        type: "button", "data-opcion": op.id, "data-calificada": marca ?? "", "aria-label": op.texto, "aria-disabled": !activa || undefined,
        "aria-pressed": Boolean(marca), onClick: () => { if (activa) columnas.onElegir(op.id); },
      } : {})} style={{
        display: "block", minHeight: "44px", minWidth: 0, boxSizing: "border-box", margin: 0, font: "inherit", color: "inherit", textAlign: "right",
        padding: op ? `${4 - d}px ${4 - d}px` : "4px", borderRadius: op ? "8px" : 0, background: "transparent",
        border: op ? bordeDe(marca) : "none", ...(lado === "haber" && !op ? { borderLeft: `1px solid ${NEUTRO}` } : {}),
        cursor: activa ? "pointer" : "default",
      }}>
        <span style={{ display: "block", textAlign: "center", fontFamily: INTER, fontSize: "12px", fontWeight: 700, lineHeight: "16px", color: TONO[lado] }}>
          {CUENTA_T_T6_A3[lado]}
        </span>
        {marca && <span style={{ display: "flex", justifyContent: "center", marginTop: "2px" }}><Pastilla marca={marca} envuelve /></span>}
        {filas.map((m) => (
          <span key={m.id} data-movimiento={m.id} style={{ display: "block", marginTop: "4px" }}>
            <span style={{ display: "block", fontFamily: MONO, fontSize: "12.5px", fontWeight: 700, lineHeight: "16px", color: BLANCO, whiteSpace: "nowrap" }}>{m.monto}</span>
            <span style={{ display: "block", fontFamily: INTER, fontSize: "12px", lineHeight: "15px", color: SECUNDARIO }}>{m.nombre}</span>
          </span>
        ))}
      </Etiqueta>
    );
  };
  return (
    <div data-cuenta-t style={{ padding: "8px 5px 6px", borderRadius: "12px", ...HUNDIDO }}>
      <p style={{ margin: 0, textAlign: "center", fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: BLANCO }}>{CUENTA_T_T6_A3.nombre}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: columnas ? "4px" : 0, marginTop: "6px", borderTop: `1px solid ${NEUTRO}`, paddingTop: "4px" }}>
        {columna("debe")}
        {columna("haber")}
      </div>
    </div>
  );
}

export default function TanqueMomentos() {
  const reducido = useReducido();
  const [n, setN] = useState(0);
  const [elecciones, setElecciones] = useState(() => ({}));
  /* El nivel que muestra el modelo mientras responde a un error (va y vuelve). */
  const [vistazo, setVistazo] = useState(null);
  const capa = useRef(null);
  const tanque = useRef(null);
  const total = MOMENTOS_T6_A3.length;
  const m = MOMENTOS_T6_A3[n];
  const decide = decideDe(m);
  const esc = escalera(decide, elecciones[m.id] ?? []);
  const ultimo = n === total - 1;
  /* Decidido el último momento, el final queda bajo el tanque en su estado final. */
  const terminado = ultimo && esc.resuelta;
  const hechos = MOMENTOS_T6_A3.slice(0, n + (esc.resuelta ? 1 : 0));
  const nivel = hechos.length ? NIVEL_MOMENTO_T6_A3[hechos.length - 1] : 0;

  useEffect(() => {
    if (vistazo === null) return undefined;
    const t = setTimeout(() => setVistazo(null), VA_Y_VUELVE);
    return () => clearTimeout(t);
  }, [vistazo]);

  /* Al elegir, lo justo para ver el mensaje (y el botón de avance). */
  const tarjeta = useRef(null);
  useEffect(() => {
    if (esc.ultima) tarjeta.current?.scrollIntoView?.({ block: "nearest", behavior: reducido ? "auto" : "smooth" });
  }, [esc.intentos.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const responder = (id) => {
    if (esc.resuelta || esc.intentos.includes(id)) return;
    const siguientes = elegir(decide, esc.intentos, id);
    setElecciones((e) => ({ ...e, [m.id]: siguientes }));
    /* El modelo responde al error antes de calificarlo (solo en el primero: en el segundo pasa al estado correcto). */
    if (id !== m.correcta && siguientes.length < 2 && !reducido) {
      if (m.id === "marzo") setVistazo(NIVEL_OPCION_T6_A3[id]);
      if (m.id === "diciembre-siguiente") setVistazo(NIVEL_MOMENTO_T6_A3[1] + REGISTRO_OPCION_T6_A3[id]);
    }
  };
  const activa = (id) => !esc.resuelta && !esc.intentos.includes(id);
  const opcion = (id) => m.opciones.find((o) => o.id === id);

  /* El mensaje: pista, devolución o el texto que se revela con su pie. */
  const mensaje = !esc.ultima ? null
    : esc.acerto ? <Mensaje ok texto={m.revela}><p data-pie style={{ ...PIE, gridColumn: "2", margin: 0 }}>{m.pie}</p></Mensaje>
      : <Mensaje ok={false} texto={esc.pista ?? esc.falla} />;

  return (
    <div ref={capa} data-capa3-t6-a3 data-capa3-tanque className={CLASE_B5H}>
      <style>{CSS_B5H}</style>
      <p style={{ ...LECTURA, fontFamily: "Sora, sans-serif" }}>{CONSIGNA_CAPA_3_T6_A3}</p>
      {/* El momento abierto: figura y tarjeta juntas (la sonda y el lector lo leen como una caja). */}
      <div data-hecho={m.id} data-decidida={esc.resuelta ? "si" : "no"}>
        <div data-figura-capa3>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 84px", columnGap: "10px" }}>
            <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Momento 2: las tres marcas del saldo, de la más alta a la más baja. */}
              {m.id === "marzo" && (
                <div role="group" aria-label={m.pregunta} data-opciones-momento style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {Object.entries(NIVEL_OPCION_T6_A3).sort((a, b) => b[1] - a[1]).map(([id]) => (
                    <OpcionDelModelo key={id} o={opcion(id)} marca={marcaDe(esc, id, m.correcta)} activa={activa(id)} onElegir={responder} />
                  ))}
                </div>
              )}
              {/* Momento 3: tres fichas de gasto iguales que se llevan al tanque. */}
              {m.id === "diciembre-siguiente" && (
                <div role="group" aria-label={m.pregunta} data-opciones-momento style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {m.opciones.map((o) => {
                    const marca = marcaDe(esc, o.id, m.correcta);
                    return (
                      <div key={o.id} data-opcion-ficha={o.id}>
                        <Ficha id={`ficha-${o.id}`} refDe={() => () => {}} arriba={null} cifra={o.texto} nombre={o.texto} activa={activa(o.id)}
                          resaltada={false} destino={tanque} alColocar={() => responder(o.id)} reducido={reducido}
                          contorno={bordeDe(marca)} cifraEstilo={{ fontFamily: INTER, fontWeight: 600 }} opcion={o.id} />
                        {marca && <span style={{ display: "flex", marginTop: "4px" }}><Pastilla marca={marca} /></span>}
                      </div>
                    );
                  })}
                </div>
              )}
              <CuentaT hechos={hechos} columnas={m.id === "diciembre-2007"
                ? { opciones: m.opciones, esc, correcta: m.correcta, onElegir: responder } : null} />
              {/* Momento 1: la tercera opción de Futaba, bajo la T, con la misma forma. */}
              {m.id === "diciembre-2007" && m.opciones.filter((o) => o.id !== "debe" && o.id !== "haber").map((o) => (
                <OpcionDelModelo key={o.id} o={o} marca={marcaDe(esc, o.id, m.correcta)} activa={activa(o.id)} onElegir={responder} />
              ))}
            </div>
            <div>
              <p style={{ margin: "0 0 4px", fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: SECUNDARIO }}>{T.saldo}</p>
              <TanqueProvision ref={tanque} nivel={vistazo ?? nivel} textos={T} reducido={reducido}
                analisis={m.id === "diciembre-siguiente" || terminado ? "cifra" : null}
                soltar={m.id === "diciembre-siguiente" && !esc.resuelta} />
              {hechos.length > 0 && (
                <p data-saldo={hechos.at(-1).saldo.enContra ? "en-contra" : "normal"} style={{ margin: "6px 0 0", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: BLANCO }}>
                  {hechos.at(-1).saldo.texto}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* La tarjeta del momento, o el texto final bajo el tanque en su estado final. */}
        <div ref={tarjeta} data-tarjeta-momento style={{ marginTop: "8px" }}>
            <p data-contador style={{ margin: 0, fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: SECUNDARIO }}>{`${T.momento} ${n + 1} de ${total}`}</p>
            <p style={{ ...LECTURA, margin: "4px 0 0", fontFamily: "Sora, sans-serif", fontWeight: 600 }}>{m.caja}</p>
            <p data-pregunta style={{ ...LECTURA, margin: "4px 0 0" }}>{m.pregunta}</p>
            <RegionViva>{mensaje}</RegionViva>
            {esc.resuelta && !ultimo && (
              <button type="button" data-siguiente-momento onClick={() => { setVistazo(null); setN((k) => k + 1); }} style={{
                width: "100%", height: "44px", marginTop: "12px", borderRadius: "999px", border: `2px solid ${NEUTRO}`, background: NEUTRO, color: FAE.navy,
                fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600, cursor: "pointer",
              }}>
                {T.siguienteMomento}
              </button>
            )}
        </div>
        <div data-final aria-live="polite">
          {terminado && (
            <div style={{ marginTop: "12px" }}>
              <p style={LECTURA}>{FINAL_CAPA_3_T6_A3.texto}</p>
              <p data-pie style={PIE}>{FINAL_CAPA_3_T6_A3.pie}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
