import { Fragment, useRef } from "react";
import { SORA, INTER, TEXTO, SECUNDARIO, NODO, NAVY, BORDES, ATENUADO, caja, aparicion, transicion, Anotacion, useSiluetasQueCaben } from "./MaquinaPegada.jsx";
import { RotuloSimulado } from "./FuentesT6A5.jsx";

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

/*
 * ═══════════ LA TABLA DEL EJEMPLO (T6 · A5, guía de Mai v1 §5.2) ═══════════
 * Borde 1 neutro, radio 10, relleno 6/8/8. Primera línea, el rótulo fijo, que
 * nunca se atenúa. Una fila por grupo, resaltable sin moverse (borde 2
 * transparente, relleno 3/4, −6 de margen), en dos líneas: el nombre; y lo
 * que suma a la izquierda, la pastilla del porcentaje y el resultado a la
 * derecha, sin partir. Con su fila resaltada, lo de dentro no se atenúa. La
 * pastilla se resalta sola (paso 3) con un contorno que no cambia su alto.
 * Al final, la suma bajo un filete neutro.
 */
const CIFRA = { ...NOMBRE, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };

function Pastilla({ texto, e, marca, id, reducido }) {
  return (
    <span {...marca(id)} style={{
      display: "inline-block", padding: "0 5px", borderRadius: "6px", whiteSpace: "nowrap",
      fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: 1.35,
      border: `1px solid ${e.resaltado ? NODO : e.atenuado ? ATENUADO : BORDES}`,
      boxShadow: e.resaltado ? `0 0 0 1px ${NODO}` : "none",
      background: e.resaltado ? NAVY : "transparent", color: e.atenuado ? SECUNDARIO : TEXTO,
      transition: transicion(reducido), ...aparicion(e, reducido),
    }}>
      {texto}
    </span>
  );
}

function FilaGrupo({ fila, el, marca, reducido }) {
  const f = el[fila.id];
  /* Con la fila resaltada, su suma y su resultado no se atenúan. */
  const de = (id) => (f.resaltado ? { ...el[id], atenuado: false } : el[id]);
  const color = (e) => (e.atenuado ? SECUNDARIO : TEXTO);
  const s = de(fila.suma.id);
  const r = de(fila.resultado.id);
  return (
    <div {...marca(fila.id)} data-fila-grupo style={{
      margin: "0 -6px", padding: "3px 4px", borderRadius: "8px",
      border: `2px solid ${f.resaltado ? NODO : "transparent"}`, background: f.resaltado ? NAVY : "transparent",
      color: color(f), transition: transicion(reducido), ...aparicion(f, reducido),
    }}>
      <p data-nombre-grupo style={{ margin: 0, ...NOMBRE, color: "inherit" }}>{fila.nombre}</p>
      <div style={{ marginTop: "2px", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
        <span {...marca(fila.suma.id)} style={{ ...CIFRA, color: color(s), transition: transicion(reducido), ...aparicion(s, reducido) }}>{fila.suma.texto}</span>
        <span style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
          {fila.porcentaje && <Pastilla texto={fila.porcentaje.texto} id={fila.porcentaje.id} e={el[fila.porcentaje.id]} marca={marca} reducido={reducido} />}
          <span {...marca(fila.resultado.id)} style={{
            fontFamily: INTER, fontSize: "12px", lineHeight: 1.35, whiteSpace: "nowrap", color: color(r),
            transition: transicion(reducido), ...aparicion(r, reducido),
          }}>{fila.resultado.texto}</span>
        </span>
      </div>
    </div>
  );
}

function Tabla({ pieza, el, marca, reducido }) {
  const t = el[pieza.id];
  const total = el[pieza.total.id];
  const borde = t.atenuado ? ATENUADO : BORDES;
  return (
    <div {...marca(pieza.id)} data-tabla-ejemplo style={{
      border: `1px solid ${borde}`, borderRadius: "10px", padding: "6px 8px 8px",
      display: "flex", flexDirection: "column", gap: "6px", transition: transicion(reducido), ...aparicion(t, reducido),
    }}>
      <div {...marca(pieza.rotulo.id)}><RotuloSimulado texto={pieza.rotulo.texto} /></div>
      {pieza.filas.map((f) => <FilaGrupo key={f.id} fila={f} el={el} marca={marca} reducido={reducido} />)}
      <div style={{ borderTop: `1px solid ${borde}`, paddingTop: "6px" }}>
        <div {...marca(pieza.total.id)} data-suma style={{
          display: "flex", justifyContent: "flex-end", margin: "0 -6px", padding: "2px 4px", borderRadius: "8px", ...CIFRA,
          border: `2px solid ${total.resaltado ? NODO : "transparent"}`, background: total.resaltado ? NAVY : "transparent",
          color: total.atenuado ? SECUNDARIO : TEXTO, transition: transicion(reducido), ...aparicion(total, reducido),
        }}>
          {pieza.total.texto}
        </div>
      </div>
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
    case "tabla":
      return <Tabla pieza={pieza} el={el} marca={marca} reducido={reducido} />;
    default:
      throw new Error(`pieza desconocida: ${pieza.tipo}`);
  }
}

/*
 * Un momento que todavía no llega (hoja 5 de Mai): su cabecera y su cuerpo en
 * silueta, en orden. Cada silueta lleva `data-silueta-futura`: la escena viva
 * quita las que no caben enteras en la reserva, empezando por la última. Sin
 * refs ni data-elemento: las piezas reales llegan después con los suyos.
 */
const PRESENTE_EN_SILUETA = { presente: true, visible: true, resaltado: false, atenuado: false };
function MomentoFuturo({ m, i, reducido, textos }) {
  const el = new Proxy({}, { get: () => PRESENTE_EN_SILUETA });
  const marca = (id) => ({ "data-silueta-de": id });
  return (
    <div data-momento={i} data-futuro="" data-silueta-futura="cabecera" style={{
      borderRadius: "12px", border: `1px solid ${BORDES}`, padding: "8px 10px 10px", display: "flex", flexDirection: "column", gap: "6px",
      ...aparicion({ visible: false }, reducido),
    }}>
      <div data-cabecera style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: "8px", rowGap: "2px" }}>
        <span style={{ margin: "0 -6px", padding: "0 6px", border: "2px solid transparent", ...LINEA_SORA }}>{m.fecha.texto}</span>
        {m.tipo && <span style={LINEA_INTER}>{m.tipo}</span>}
      </div>
      {m.piezas.map((p) => (
        <div key={p.id} data-silueta-futura="cuerpo">
          <Pieza pieza={p} el={el} marca={marca} reducido={reducido} refDe={() => undefined} textos={textos} prefijo="futuro-" />
        </div>
      ))}
    </div>
  );
}

/* Los momentos de un estado. `marcar` pone refs y data- (la escena viva); la reserva, no. */
export function Momentos({ estado, momentos, refDe, reducido, textos, prefijo = "", marcar = true }) {
  const el = estado.elementos;
  const viva = useRef(null);
  useSiluetasQueCaben(viva, [estado]);
  const marca = (id) => (marcar
    ? { ref: refDe(id), "data-elemento": id, "data-resaltado": el[id].resaltado ? "si" : "no" }
    : { "data-elemento": `${prefijo}${id}` });
  return (
    <div ref={viva} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {momentos.map((m, i) => {
        const h = estado.momentos[i];
        if (!h.mostrado) return marcar ? <MomentoFuturo key={m.fecha.id} m={m} i={i} reducido={reducido} textos={textos} /> : null;
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
