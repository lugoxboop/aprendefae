import { useState } from "react";
import { FAE } from "../../../../theme.js";
import { pesos } from "../../../../data/contabilidad.js";
import { Opciones } from "../../corazon/juego.jsx";
/* Lote de dialecto C (R1): la pastilla, el contorno y el bloque de mensaje del estándar, de la Célula B sin cambios (L-3: visto bueno de Erwin). */
import {
  ACIERTO_B, ACIERTO_MENSAJE, CORAL_B, CORRECTA, CSS_B5H, ERROR_B, IconoCheck, IconoX, LECTOR_INCORRECTO, NEUTRO_B, Pastilla, REPOSO_B,
  REVELADA, TACHADA, TEXTO_B, claseDe,
} from "../b5/Devolucion.jsx";
import { AsientoEnLineas, ElegirLado, Responder } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Plegable } from "./plegable.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7 · LAS PIEZAS DE HACER QUE COMPARTEN H4 A H7 (Célula C).
 *
 * Las mismas formas que H1, H2 y H3 —la tarjeta de la pregunta, la ficha de
 * datos, la elección de un solo toque y su devolución—, más la que pide el
 * patrón v3.2 para los asientos: se elige el lado de cada línea, se puede
 * cambiar mientras no se comprueba, y «Comprobar» califica todas las líneas
 * UNA vez. Después, el asiento completo con sus sumas.
 *
 * Todo lo que se toca es de las piezas compartidas (Opciones,
 * ElegirLado, AsientoEnLineas, Responder), sin cambiarlas. Coral solo para el
 * error. Este archivo es el mismo en los PR de H4, H5, H6 y H7: si dos entran,
 * git ve el mismo contenido y no choca.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const INTER = "Inter, sans-serif";
export const APAGADO = "rgba(248,249,250,0.6)";
export const TEXTO = { margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: FAE.text };

export const CSS_T7_HACER = `
@keyframes fae-t7h-fundido { from { opacity: 0; } to { opacity: 1; } }
.fae-t7h-entra { animation: fae-t7h-fundido 150ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .fae-t7h-entra { animation: none !important; } }
${CSS_B5H}`;

export const BOTONES_T7 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen", comprobar: "Comprobar" };
export const LADOS_T7 = { debe: "Debe", haber: "Haber" };

/*
 * El encabezado de los Hacer de T5 y T7 (lote O de Mello): el `objetivo` de
 * los datos (una oración) arriba de la consigna, con el mismo marcado que H7
 * (EscaleraHacer → Encabezado, `p[data-objetivo]`). Sin `objetivo`, la
 * consigna va sola: aquí no se escribe ningún texto.
 */
export function EncabezadoHacer({ objetivo = null, consigna, onComoSeJuega = null }) {
  return <Encabezado objetivo={objetivo || null} consigna={consigna} onComoSeJuega={onComoSeJuega} />;
}

/* Un dato por renglón: el rótulo arriba y el dato debajo, que a 320 px se lee entero. */
export function Ficha({ filas }) {
  return (
    <dl data-ficha style={{
      margin: "0 0 14px", padding: "10px 12px", borderRadius: "11px", border: "1px solid rgba(248,249,250,0.12)",
      background: "rgba(10,20,34,0.35)", display: "grid", rowGap: "7px",
    }}>
      {filas.map(([dato, texto]) => (
        <div key={dato}>
          <dt style={{ fontFamily: INTER, fontSize: "12px", color: APAGADO }}>{dato}</dt>
          <dd style={{ margin: 0, fontFamily: INTER, fontSize: "14px", color: FAE.text, overflowWrap: "anywhere" }}>{texto}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Parrafos({ textos, dato = "enunciado" }) {
  return (
    <div {...{ [`data-${dato}`]: true }} style={{ margin: "0 0 10px" }}>
      {textos.map((p) => <p key={p} style={{ ...TEXTO, fontSize: "14px", lineHeight: "21px", margin: "0 0 6px" }}>{p}</p>)}
    </div>
  );
}

export function TarjetaPregunta({ id, encabezado = null, pregunta, pie, tarjetaRef }) {
  return (
    <div key={id} className="fae-t7h-entra" data-item={id} style={{
      margin: "0 0 12px", padding: "11px 13px", borderRadius: "11px",
      background: "rgba(184,196,212,0.12)", borderLeft: "3px solid #B8C4D4",
    }}>
      {encabezado && (
        <p data-encabezado-item style={{ margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", color: "#A8B6C8" }}>
          {encabezado.toUpperCase()}
        </p>
      )}
      <p ref={tarjetaRef} tabIndex={-1} data-pregunta style={{ ...TEXTO, outline: "none" }}>{pregunta}</p>
      {pie && <p data-pie style={{ margin: "4px 0 0", fontFamily: INTER, fontSize: "12px", color: APAGADO }}>{pie}</p>}
    </div>
  );
}

/*
 * La devolución: región viva con el bloque del estándar (lote de dialecto C,
 * R1): fondo rgba(184,196,212,.12) en los dos casos y raya de 3 px, neutra o
 * coral. Acierto: Check y «Correcto.»; error: X y, solo para el lector,
 * «Incorrecto.» (o el `lectorError` de la pieza, que ya empieza así).
 */
export function Devolucion({ r, lectorError = null }) {
  return (
    <div data-retro aria-live="polite" aria-atomic="true">
      {r && (
        <div className="fae-t7h-entra" data-panel={r.ok ? "acierto" : "error"} style={{
          display: "grid", gridTemplateColumns: "16px minmax(0, 1fr)", gap: "0 8px", alignItems: "start",
          marginTop: "12px", padding: "11px 13px", borderRadius: "11px",
          background: "rgba(184,196,212,0.12)", borderLeft: `3px solid ${r.ok ? NEUTRO_B : CORAL_B}`,
        }}>
          <span data-icono-retro style={{ display: "flex", height: "22px", alignItems: "center" }}>{r.ok ? <IconoCheck /> : <IconoX />}</span>
          <div style={{ minWidth: 0 }}>
            {r.ok && <b data-palabra style={{ ...TEXTO, display: "block", fontWeight: 700 }}>{ACIERTO_MENSAJE}</b>}
            {!r.ok && <span style={SOLO_LECTOR}>{lectorError ?? `${LECTOR_INCORRECTO} `}</span>}
            {r.textos.map((x, k) => <p key={k} data-texto-retro style={{ ...TEXTO, margin: k ? "6px 0 0" : 0 }}><Plegable texto={x} /></p>)}
          </div>
        </div>
      )}
    </div>
  );
}

/*
 * La opción del estándar (lote de dialecto C, R1), con la firma de Opcion de
 * corazon/juego.jsx, que pinta el acierto en teal y no se toca. Reposo
 * REPOSO_B; correcta ACIERTO_B y pastilla Check «Correcto»; incorrecta
 * ERROR_B y pastilla X «No va aquí»; revelada ACIERTO_B (a los 0,7 s) y
 * «Iba aquí». La palabra queda en el nombre accesible del botón.
 */
const MARCA_DE = { correcta: CORRECTA, incorrecta: TACHADA, revelada: REVELADA };
export function OpcionC({ children, onClick, estado = null, deshabilitada = false, ancho = false }) {
  const marca = MARCA_DE[estado] ?? null;
  const borde = estado === "correcta" ? ACIERTO_B : estado === "incorrecta" ? ERROR_B : estado === "elegida" ? `1px solid ${TEXTO_B}` : REPOSO_B;
  return (
    <button type="button" onClick={onClick} disabled={deshabilitada} data-estado={estado ?? "libre"} className={claseDe(marca)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px",
        width: ancho ? "100%" : undefined, minHeight: "44px", boxSizing: "border-box",
        textAlign: "left", padding: "12px 14px", borderRadius: "14px", border: borde,
        background: "rgba(248,249,250,0.055)", color: FAE.text, fontFamily: INTER, fontSize: "14px", lineHeight: 1.45,
        opacity: deshabilitada && !estado ? 0.62 : 1, cursor: deshabilitada ? "default" : "pointer",
      }}>
      <span style={{ minWidth: 0, maxWidth: "100%", overflowWrap: "break-word" }}>{children}</span>
      {marca && <Pastilla marca={marca} />}
    </button>
  );
}

/*
 * Una elección de un solo toque. `opciones`: [{ valor, texto }]. Al elegir,
 * todas se bloquean; la elegida queda en acierto o en error y, si falló, la
 * buena se enseña («Iba aquí»).
 */
export function Eleccion({ opciones, r, elegida, onElegir, etiqueta }) {
  const estadoDe = (v) => {
    if (!r) return null;
    if (v === elegida) return r.ok ? "correcta" : "incorrecta";
    if (v === r.correcta) return "revelada";
    return null;
  };
  return (
    <div role="group" aria-label={etiqueta}>
      <Opciones columnas="minmax(0, 1fr)">
        {opciones.map((o) => (
          <span key={String(o.valor)} data-opcion={o.valor} style={{ display: "contents" }}>
            <OpcionC ancho deshabilitada={Boolean(r)} estado={estadoDe(o.valor)} onClick={() => onElegir(o.valor)}>{o.texto}</OpcionC>
          </span>
        ))}
      </Opciones>
    </div>
  );
}

/*
 * Las líneas de un asiento con «Comprobar». `lineas`: [{ id, cuenta, valor,
 * lado, retro }] en el orden en que se muestran. Antes de comprobar, el lado
 * de cada línea se puede cambiar; «Comprobar» se activa con todas puestas y
 * califica cada línea UNA vez (onComprobar recibe [{ linea, elegido, ok }]).
 * Después: cada línea bloqueada con su lado bueno, el mensaje de las que
 * fallaron debajo de ellas y, si se pasa `asiento`, el asiento completo con
 * sus sumas, en su orden. Sin `asiento` (líneas sueltas, como las dos de
 * Inventario de mercancías en el cierre de H4) no se pintan sumas.
 */
export function LineasConComprobar({ lineas, asiento = null, onComprobar, comprobado, acento = "#A8B6C8" }) {
  const [elegidos, setElegidos] = useState({});
  const todas = lineas.every((l) => elegidos[l.id]);
  const comprobar = () => {
    if (comprobado || !todas) return;
    onComprobar(lineas.map((l) => ({ linea: l, elegido: elegidos[l.id], ok: elegidos[l.id] === l.lado })));
  };
  return (
    <>
      <div style={{ display: "grid", gap: "10px" }}>
        {lineas.map((l) => {
          const elegido = elegidos[l.id] ?? null;
          const mal = comprobado && elegido !== l.lado;
          return (
            <div key={l.id} data-linea={l.id} style={{ padding: "10px 12px", borderRadius: "11px", border: "1px solid rgba(248,249,250,0.12)" }}>
              <p style={{ ...TEXTO, margin: "0 0 8px", display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                <span data-cuenta>{l.cuenta}</span>
                <span data-valor style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{pesos(l.valor)}</span>
              </p>
              <div role="group" aria-label={`${l.cuenta}: Debe o Haber`}>
                <ElegirLado elegido={elegido} correcto={comprobado ? l.lado : null} deshabilitado={comprobado}
                  onElegir={(lado) => !comprobado && setElegidos((e) => ({ ...e, [l.id]: lado }))} nombres={LADOS_T7} />
              </div>
              <div data-retro-linea aria-live="polite">
                {mal && (
                  <div className="fae-t7h-entra" data-panel="error" style={{
                    marginTop: "10px", padding: "11px 13px", borderRadius: "11px",
                    background: "rgba(231,111,81,0.13)", borderLeft: `3px solid ${FAE.coral}`,
                  }}>
                    <span style={SOLO_LECTOR}>{`Incorrecto. Va al ${LADOS_T7[l.lado].toLowerCase()}. `}</span>
                    <p data-texto-retro style={TEXTO}><Plegable texto={l.retro} /></p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {!comprobado && <Responder onClick={comprobar} deshabilitado={!todas}>{BOTONES_T7.comprobar}</Responder>}
      {comprobado && asiento && (
        <div className="fae-t7h-entra" data-asiento-completo style={{ marginTop: "12px" }}>
          <AsientoEnLineas lineas={asiento.map((l) => ({ cuenta: l.cuenta, lado: l.lado, valor: l.valor }))} totales acento={acento} />
        </div>
      )}
    </>
  );
}
