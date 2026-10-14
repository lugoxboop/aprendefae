import { useState } from "react";
import { FAE } from "../../../../theme.js";
import { pesos } from "../../../../data/contabilidad.js";
import { Opcion, Opciones } from "../../corazon/juego.jsx";
import { AsientoEnLineas, ElegirLado, Responder } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";

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
 * Todo lo que se toca es de las piezas compartidas (Opcion, Opciones,
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
`;

export const BOTONES_T7 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen", comprobar: "Comprobar" };
export const LADOS_T7 = { debe: "Debe", haber: "Haber" };

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
        <p data-encabezado-item style={{ margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: FAE.ambar }}>
          {encabezado.toUpperCase()}
        </p>
      )}
      <p ref={tarjetaRef} tabIndex={-1} data-pregunta style={{ ...TEXTO, outline: "none" }}>{pregunta}</p>
      {pie && <p data-pie style={{ margin: "4px 0 0", fontFamily: INTER, fontSize: "12px", color: APAGADO }}>{pie}</p>}
    </div>
  );
}

/* La devolución: región viva; acierto en gris azulado, error en coral. */
export function Devolucion({ r, lectorError = null }) {
  return (
    <div data-retro aria-live="polite" aria-atomic="true">
      {r && (
        <div className="fae-t7h-entra" data-panel={r.ok ? "acierto" : "error"} style={{
          marginTop: "12px", padding: "11px 13px", borderRadius: "11px",
          background: r.ok ? "rgba(184,196,212,0.13)" : "rgba(231,111,81,0.13)",
          borderLeft: `3px solid ${r.ok ? "#B8C4D4" : FAE.coral}`,
        }}>
          {!r.ok && lectorError && <span style={SOLO_LECTOR}>{lectorError}</span>}
          {r.textos.map((x, k) => <p key={k} data-texto-retro style={{ ...TEXTO, margin: k ? "6px 0 0" : 0 }}>{x}</p>)}
        </div>
      )}
    </div>
  );
}

/*
 * Una elección de un solo toque. `opciones`: [{ valor, texto }]. Al elegir,
 * todas se bloquean; la elegida queda en acierto o en error y, si falló, la
 * buena se enseña («era esta»).
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
            <Opcion ancho deshabilitada={Boolean(r)} estado={estadoDe(o.valor)} onClick={() => onElegir(o.valor)}>{o.texto}</Opcion>
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
export function LineasConComprobar({ lineas, asiento = null, onComprobar, comprobado, acento = FAE.ambar }) {
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
                    <p data-texto-retro style={TEXTO}>{l.retro}</p>
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
