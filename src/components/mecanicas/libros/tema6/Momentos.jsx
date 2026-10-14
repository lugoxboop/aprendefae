import { Fragment } from "react";
import { SORA, INTER, TEXTO, SECUNDARIO, NODO, NAVY, BORDES, ATENUADO, caja, aparicion, transicion, Anotacion } from "./MaquinaPegada.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · LA ESCENA DE MOMENTOS (Célula B) — lo que pintan T6 · A3 y A4.
 *
 * Cada momento es una tarjeta (la de los hechos de T5 · A2): la fecha y el
 * tipo arriba; abierto, todas sus piezas; pasado, solo las que conserva (su
 * asiento). La fecha se puede resaltar sin moverse (la de T6 · A2: borde de
 * 2 px transparente y margen −6). El estado sale de contabilidad/momentos.js.
 *
 * La escena reserva el alto del mayor de sus estados, calculado en vivo: los
 * estados de `reservas` van apilados en la misma celda, invisibles y sin
 * resaltar. Así el bloque de control no se mueve.
 *
 * Las piezas se describen con datos ({ id, tipo, … }); ningún texto vive
 * aquí: cada pieza trae el suyo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const LINEA_SORA = { fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3 };
const LINEA_INTER = { fontFamily: INTER, fontSize: "12px", lineHeight: 1.35 };
const NOMBRE = { fontFamily: SORA, fontSize: "12.5px", fontWeight: 600, lineHeight: 1.3 };

/* Una fila del bloque del estado de situación: nombre | valor; resaltable sin moverse. */
function Fila({ fila, e, marca, reducido }) {
  return (
    <div {...marca(fila.id)} style={{
      display: "grid", gridTemplateColumns: "1fr auto", columnGap: "8px", alignItems: "baseline",
      padding: "2px 6px", margin: "0 -6px", borderRadius: "8px", ...NOMBRE,
      border: `2px solid ${e.resaltado ? NODO : "transparent"}`, background: e.resaltado ? NAVY : "transparent",
      color: e.atenuado ? SECUNDARIO : TEXTO, transition: transicion(reducido), ...aparicion(e, reducido),
    }}>
      <span>{fila.nombre}</span>
      <span data-valor style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{fila.valor}</span>
    </div>
  );
}

function Pieza({ pieza, el, marca, reducido, refDe, textos, prefijo }) {
  const e = el[pieza.id];
  const estilo = (extra) => ({ borderRadius: "10px", ...extra, ...caja(e, [6, 8], reducido) });
  switch (pieza.tipo) {
    case "dosLineas":
      return (
        <div {...marca(pieza.id)} style={estilo()}>
          <p style={{ margin: 0, ...LINEA_SORA, color: "inherit" }}>{pieza.l1}</p>
          <p style={{ margin: "2px 0 0", ...LINEA_INTER, color: "inherit" }}>{pieza.l2}</p>
        </div>
      );
    case "hecho":
      return <div {...marca(pieza.id)} style={estilo(LINEA_SORA)}>{pieza.texto}</div>;
    case "nota":
      return <p {...marca(pieza.id)} style={estilo({ margin: 0, ...LINEA_INTER })}>{pieza.texto}</p>;
    case "etiqueta":
      /* Separa dos asientos de un momento; no se resalta ni se atenúa (T6 · A4 §3.2). */
      return (
        <p {...marca(pieza.id)} style={{ margin: "2px 0 0", ...LINEA_INTER, color: SECUNDARIO, ...aparicion(e, reducido) }}>{pieza.texto}</p>
      );
    case "anotacion":
      return (
        <Anotacion id={`${prefijo}${pieza.id}`} e={e} cuenta={pieza.cuenta} linea={pieza.linea} movimiento={pieza.movimiento} lado={pieza.lado}
          reducido={reducido} refDe={refDe} textos={textos} partirNombre />
      );
    case "bloque": {
      /* El estado de situación financiera: borde 1, radio 10, relleno 6/8/8; el neto, bajo un filete. */
      const b = el[pieza.id];
      return (
        <div {...marca(pieza.id)} style={{
          border: `1px solid ${b.atenuado ? ATENUADO : BORDES}`, borderRadius: "10px", padding: "6px 8px 8px",
          display: "flex", flexDirection: "column", gap: "6px", transition: transicion(reducido), ...aparicion(b, reducido),
        }}>
          <p style={{ margin: 0, ...LINEA_INTER, color: SECUNDARIO }}>{pieza.titulo}</p>
          {pieza.filas.map((f) => <Fila key={f.id} fila={f} e={el[f.id]} marca={marca} reducido={reducido} />)}
          <div style={{ borderTop: `1px solid ${b.atenuado ? ATENUADO : BORDES}`, paddingTop: "6px" }}>
            <Fila fila={pieza.neto} e={el[pieza.neto.id]} marca={marca} reducido={reducido} />
          </div>
        </div>
      );
    }
    default:
      throw new Error(`pieza desconocida: ${pieza.tipo}`);
  }
}

/* Los momentos de un estado. `marcar` pone refs y data- (la escena viva); la reserva, no. */
export function Momentos({ estado, momentos, refDe, reducido, textos, prefijo = "", marcar = true }) {
  const el = estado.elementos;
  const marca = (id) => (marcar
    ? { ref: refDe(id), "data-elemento": id, "data-resaltado": el[id].resaltado ? "si" : "no" }
    : { "data-elemento": `${prefijo}${id}` });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {momentos.map((m, i) => {
        const h = estado.momentos[i];
        if (!h.mostrado) return null;
        const apagado = h.atenuado;
        const f = el[m.fecha.id];
        return (
          <div key={m.fecha.id} data-momento={i} data-pasado={h.pasado ? "si" : "no"} style={{
            borderRadius: "12px", border: `1px solid ${apagado ? ATENUADO : BORDES}`, color: apagado ? SECUNDARIO : TEXTO,
            /* Pasado, con el relleno de un hecho plegado de T5 · A2 (8/10): Mai, T6 · A3 v1b. */
            padding: h.pasado ? "8px 10px" : "8px 10px 10px", display: "flex", flexDirection: "column", gap: "6px", transition: transicion(reducido),
          }}>
            <div data-cabecera style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: "8px", rowGap: "2px" }}>
              <span {...marca(m.fecha.id)} style={{
                margin: "0 -6px", padding: "0 6px", borderRadius: "8px", ...LINEA_SORA,
                border: `2px solid ${f.resaltado ? NODO : "transparent"}`, background: f.resaltado ? NAVY : "transparent",
                color: f.atenuado ? SECUNDARIO : TEXTO, transition: transicion(reducido),
              }}>
                {m.fecha.texto}
              </span>
              {m.tipo && <span style={{ ...LINEA_INTER, color: apagado ? SECUNDARIO : NODO }}>{m.tipo}</span>}
            </div>
            {m.piezas.filter((p) => el[p.id].presente).map((p) => (
              <Fragment key={p.id}>
                <Pieza pieza={p} el={el} marca={marca} reducido={reducido} refDe={marcar ? refDe : () => undefined} textos={textos} prefijo={prefijo} />
              </Fragment>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* Un estado de reserva: todo lo presente, visible, sin resaltar ni atenuar. */
function enReposo(e) {
  return {
    ...e,
    momentos: e.momentos.map((m) => ({ ...m, atenuado: false })),
    elementos: Object.fromEntries(Object.entries(e.elementos).map(([id, x]) => [id, { ...x, visible: x.presente, resaltado: false, atenuado: false }])),
  };
}

/** La escena para MaquinaPegada: la reserva de alto y, encima, el estado vivo. */
export function escenaDeMomentos({ momentos, estadoPaso, reservas, textos }) {
  const RESERVAS = reservas.map((p) => enReposo(estadoPaso(p)));
  return function Escena(estado, refDe, reducido) {
    return (
      <div data-escena aria-hidden="true" style={{ display: "grid" }}>
        {RESERVAS.map((r, k) => (
          <div key={k} data-reserva style={{ gridArea: "1 / 1", opacity: 0, pointerEvents: "none" }}>
            <Momentos estado={r} momentos={momentos} reducido textos={textos} prefijo={`reserva-${k}-`} marcar={false} refDe={() => undefined} />
          </div>
        ))}
        <div data-escena-viva style={{ gridArea: "1 / 1", alignSelf: "start" }}>
          <Momentos estado={estado} momentos={momentos} refDe={refDe} reducido={reducido} textos={textos} />
        </div>
      </div>
    );
  };
}
