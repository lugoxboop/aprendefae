import { Fragment, useRef } from "react";
import { ESCENA_T5_A2, PASOS_T5_A2, CIERRE_T5_A2 } from "../../../../data/contabilidadT5Pieza2.js";
import { estadoPasoT5A2, duracionPasoT5A2, TRAMOS } from "../../../../contabilidad/t5Pieza2.js";
import MaquinaPegada, {
  SORA, INTER, TEXTO, SECUNDARIO, NODO, BORDES, ATENUADO, caja, aparicion, transicion, useSiluetasQueCaben, Anotacion as AnotacionBase,
} from "../tema6/MaquinaPegada.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · PIEZA 2 · CAPA 2 · «MÍRELO FUNCIONAR» — Santa Pacha y sus títulos
 * (guía de Mai v2, con los 21 pasos de la v2b).
 *
 * Cinco hechos en fila, uno abierto a la vez: fecha y tipo arriba; plegado,
 * el resultado a la derecha (si no cabe, baja a una segunda fila, 2 px más
 * abajo: las ventas plegadas a 320 miden 53,08). Plegar y
 * abrir no es interactivo ni se anima. Cada asiento muestra sus dos lados con
 * su cápsula. Ganancia y pérdida sin color: las distingue la palabra.
 *
 * La escena reserva el alto del mayor de sus estados, calculado en vivo: los
 * cinco hechos abiertos al final de su tramo van apilados en la misma celda,
 * invisibles y sin resaltar (v2 §4.2). Así el bloque de control no se mueve.
 *
 * La máquina, el bloque pegado y «Reproducir» son los de MaquinaPegada.jsx
 * (Tema 6). Las cuentas del texto del paso no se parten (v1 §2); en la
 * escena, el único corte va antes de «=». Ningún texto vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TODOS = [...PASOS_T5_A2, CIERRE_T5_A2];
const E = ESCENA_T5_A2;
const LINEA_SORA = { fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3 };
const LINEA_INTER = { fontFamily: INTER, fontSize: "12px", lineHeight: 1.35 };
const SIN_PARTIR = { whiteSpace: "nowrap" };

/* Las cuentas del libro (base × tasa × fracción = interés) van enteras en el texto del paso. */
const CUENTA = /\d[\d.]* × \d+,\d+ × \d+\/\d+ = \$\d[\d.]*\d/;
export function pintarCuentas(texto) {
  const m = texto.match(CUENTA);
  if (!m) return texto;
  return (
    <>
      {texto.slice(0, m.index)}
      <span data-cuenta style={SIN_PARTIR}>{m[0]}</span>
      {texto.slice(m.index + m[0].length)}
    </>
  );
}

/*
 * Las piezas de un hecho abierto. `marca` pone (o no, en la reserva) el ref y
 * los data- con los que el bloque pegado y las pruebas encuentran cada pieza.
 */
function piezasDelHecho(i, el, marca, reducido, refDe, prefijo) {
  const estilo = (id, extra) => ({ borderRadius: "10px", ...extra, ...caja(el[id], [6, 8], reducido) });
  const dosLineas = (id, l1, l2) => (
    <div {...marca(id)} style={estilo(id)}>
      <p style={{ margin: 0, ...LINEA_SORA, color: "inherit" }}>{l1}</p>
      <p style={{ margin: "2px 0 0", ...LINEA_INTER, color: "inherit" }}>{l2}</p>
    </div>
  );
  const unaLinea = (id, t) => <div {...marca(id)} style={estilo(id, LINEA_SORA)}>{t}</div>;
  const nota = (id, t) => <p {...marca(id)} style={estilo(id, { margin: 0, ...LINEA_INTER })}>{t}</p>;
  /* Un solo corte posible, antes de «=». */
  const cuenta = (id, [a, b]) => (
    <div {...marca(id)} style={estilo(id, LINEA_SORA)}>
      <span style={SIN_PARTIR}>{a}</span> <span style={SIN_PARTIR}>{b}</span>
    </div>
  );
  const anotacion = (id, cuentaNombre, movimiento, lado, partirNombre = false) => (
    <AnotacionBase id={`${prefijo}${id}`} e={el[id]} cuenta={cuentaNombre} movimiento={movimiento} lado={lado}
      reducido={reducido} refDe={refDe} textos={E} partirNombre={partirNombre} />
  );

  return [
    () => [
      dosLineas("efectivo", E.efectivo, E.compra),
      unaLinea("titulos", E.titulos),
      anotacion("inversiones1", E.inversiones, E.compra, "debe"),
      anotacion("bancos", E.bancos, E.compra, "haber"),
      nota("tasa", E.tasa),
    ],
    () => [
      unaLinea("primerInteres", E.primerInteres),
      cuenta("cuenta1", E.cuenta1),
      anotacion("caja1", E.caja, E.interes1, "debe"),
      anotacion("ingresos1", E.ingresos, E.interes1, "haber"),
    ],
    () => [
      unaLinea("vendidos", E.vendidos),
      dosLineas("precio1", E.precio1, E.recibe1),
      anotacion("caja2", E.caja, E.recibido1, "debe"),
      nota("sinInteres", E.sinInteres),
      nota("costo1", E.costo1),
      anotacion("inversiones2", E.inversiones, E.costado1, "haber"),
      anotacion("ganancia", E.ganancia, E.diferencia1, "haber", true),
    ],
    () => [
      unaLinea("quedan", E.quedan),
      cuenta("cuenta2", E.cuenta2),
      anotacion("caja3", E.caja, E.interes2, "debe"),
      anotacion("ingresos2", E.ingresos, E.interes2, "haber"),
    ],
    () => [
      unaLinea("precio2", E.precio2),
      unaLinea("recibe2", E.recibe2),
      nota("costo2", E.costo2),
      anotacion("caja4", E.caja, E.recibido2, "debe"),
      anotacion("inversiones3", E.inversiones, E.costado2, "haber"),
      anotacion("perdida", E.perdida, E.diferencia2, "debe", true),
    ],
  ][i]().map((n, k) => <Fragment key={k}>{n}</Fragment>);
}

/*
 * Un hecho que todavía no llega (hoja 5 de Mai): su cabecera y su cuerpo en
 * silueta; la escena viva quita las siluetas que no caben enteras en la
 * reserva, empezando por la última.
 */
const PRESENTE_EN_SILUETA = { presente: true, visible: true, resaltado: false, atenuado: false };
function HechoFuturo({ hecho, i, reducido }) {
  const el = new Proxy({}, { get: () => PRESENTE_EN_SILUETA });
  const marca = (id) => ({ "data-silueta-de": id });
  return (
    <div data-hecho-t5={i} data-futuro="" data-silueta-futura="cabecera" style={{
      borderRadius: "12px", border: `1px solid ${BORDES}`, padding: "8px 10px 10px", display: "flex", flexDirection: "column", gap: "6px",
      ...aparicion({ visible: false }, reducido),
    }}>
      <div data-cabecera style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: "8px", rowGap: "2px" }}>
        <span style={LINEA_SORA}>{hecho.fecha}</span>
        <span style={LINEA_INTER}>{hecho.tipo}</span>
      </div>
      {piezasDelHecho(i, el, marca, reducido, () => undefined, "futuro-").map((n, k) => <div key={k} data-silueta-futura="cuerpo">{n}</div>)}
    </div>
  );
}

/* Los cinco hechos de un estado. */
function Hechos({ estado, refDe, reducido, prefijo = "", marcar = true }) {
  const el = estado.elementos;
  const viva = useRef(null);
  useSiluetasQueCaben(viva, [estado]);
  const marca = (id) => (marcar
    ? { ref: refDe(id), "data-elemento": id, "data-resaltado": el[id].resaltado ? "si" : "no" }
    : { "data-elemento": `${prefijo}${id}` });
  return (
    <div ref={viva} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {E.hechos.map((hecho, i) => {
        const h = estado.hechos[i];
        if (!h.mostrado) return marcar ? <HechoFuturo key={hecho.fecha + hecho.tipo} hecho={hecho} i={i} reducido={reducido} /> : null;
        const apagado = h.atenuado;
        return (
          <div key={hecho.fecha + hecho.tipo} data-hecho-t5={i} data-plegado={h.plegado ? "si" : "no"} style={{
            borderRadius: "12px", border: `1px solid ${apagado ? ATENUADO : BORDES}`, color: apagado ? SECUNDARIO : TEXTO,
            padding: h.plegado ? "8px 10px" : "8px 10px 10px", display: "flex", flexDirection: "column", gap: "6px",
            transition: transicion(reducido),
          }}>
            <div data-cabecera style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: "8px", rowGap: "2px" }}>
              <span style={{ ...LINEA_SORA, color: "inherit" }}>{hecho.fecha}</span>
              <span style={{ ...LINEA_INTER, color: apagado ? SECUNDARIO : NODO }}>{hecho.tipo}</span>
              {h.plegado && <span data-resultado style={{ ...LINEA_INTER, fontWeight: 600, marginLeft: "auto", color: "inherit" }}>{hecho.plegado}</span>}
            </div>
            {!h.plegado && piezasDelHecho(i, el, marca, reducido, marcar ? refDe : () => undefined, prefijo)}
          </div>
        );
      })}
    </div>
  );
}

/* La reserva: cada hecho abierto al final de su tramo, con todo visible y nada resaltado. */
const RESERVAS = TRAMOS.map(([, fin]) => {
  const e = estadoPasoT5A2(fin);
  return {
    ...e,
    hechos: e.hechos.map((h) => ({ ...h, atenuado: false })),
    elementos: Object.fromEntries(Object.entries(e.elementos).map(([id, x]) => [id, { ...x, resaltado: false, atenuado: false }])),
  };
});

function Escena(estado, refDe, reducido) {
  return (
    <div data-escena aria-hidden="true" style={{ display: "grid" }}>
      {RESERVAS.map((r, k) => (
        <div key={k} data-reserva style={{ gridArea: "1 / 1", opacity: 0, pointerEvents: "none" }}>
          <Hechos estado={r} reducido prefijo={`reserva-${k}-`} marcar={false} refDe={() => undefined} />
        </div>
      ))}
      <div data-escena-viva style={{ gridArea: "1 / 1", alignSelf: "start" }}>
        <Hechos estado={estado} refDe={refDe} reducido={reducido} />
      </div>
    </div>
  );
}

export default function TresMomentos() {
  return (
    <MaquinaPegada todos={TODOS} estadoPaso={estadoPasoT5A2} duracion={duracionPasoT5A2} escena={Escena}
      pintar={pintarCuentas} atributos={{ "data-capa2-t5-a2": true }} />
  );
}
