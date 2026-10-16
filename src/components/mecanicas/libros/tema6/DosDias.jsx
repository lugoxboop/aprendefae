import { ESCENA_T6_A2, PASOS_T6_A2, CIERRE_T6_A2 } from "../../../../data/contabilidadT6Pieza2.js";
import { estadoPasoT6A2, duracionPasoT6A2 } from "../../../../contabilidad/t6Pieza2.js";
import MaquinaPegada, { SORA, INTER, NODO, NAVY, TEXTO, SECUNDARIO, caja, aparicion, transicion, Anotacion as AnotacionBase } from "./MaquinaPegada.jsx";
import { ConCifras } from "./TanqueProvision.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 2 · CAPA 2 · «MÍRELO FUNCIONAR» — los libros de Dajema en
 * dos días (guía de Mai v1 con su cierre v1b, PASA de Shoko).
 *
 * El día de la venta, la venta a crédito a Nancy; el día del castigo, el
 * análisis, la deuda incobrable, el castigo y la anulación directa. La
 * misma cuenta de clientes se debita el primer día y se acredita el
 * segundo. Sin provisión dibujada (este método no la crea) y sin coral:
 * «incobrable» es un hecho contable, no un error.
 *
 * La fecha del castigo se puede resaltar sin moverse (lo hacía el paso 10,
 * que el lote C1-6 quitó):
 * borde de 2 px transparente y margen −6; resaltada, borde nodo y relleno
 * navy. Las fechas nunca se atenúan: llevan su color, no el del día (que sí
 * se atenúa); el monto, igual, para verse claro cuando lo resaltado es él. El bloque de control pegado vive en
 * MaquinaPegada.jsx. Ningún texto vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TODOS = [...PASOS_T6_A2, CIERRE_T6_A2];
const Anotacion = (props) => <AnotacionBase {...props} textos={ESCENA_T6_A2} />;
const LINEA_SORA = { fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3 };
const NOTA = { fontFamily: INTER, fontSize: "12px", lineHeight: 1.35 };

function Escena(estado, refDe, reducido) {
  const el = estado.elementos;
  const dia = (e) => ({ borderRadius: "12px", display: "flex", flexDirection: "column", gap: "6px", ...caja(e, [8, 10, 10], reducido, { conNavy: false }) });
  const marca = (id) => ({ ref: refDe(id), "data-elemento": id, "data-resaltado": el[id].resaltado ? "si" : "no" });
  const fecha = (id, texto) => (
    <span {...marca(id)} style={{
      alignSelf: "flex-start", margin: "0 -6px", padding: "0 6px", borderRadius: "8px", ...LINEA_SORA,
      border: `2px solid ${el[id].resaltado ? NODO : "transparent"}`, background: el[id].resaltado ? NAVY : "transparent",
      color: TEXTO, transition: transicion(reducido), ...aparicion(el[id], reducido),
    }}>
      {texto}
    </span>
  );
  const nota = (id, texto) => (
    <p {...marca(id)} style={{ margin: 0, borderRadius: "10px", ...NOTA, ...caja(el[id], [6, 8], reducido) }}>{texto}</p>
  );

  return (
    <div data-escena aria-hidden="true">
      <div {...marca("dia25")} style={dia(el.dia25)}>
        {fecha("fecha25", ESCENA_T6_A2.dia25)}
        <div {...marca("hecho25")} style={{ borderRadius: "10px", ...caja(el.hecho25, [6, 8], reducido) }}>
          <p style={{ margin: 0, ...LINEA_SORA, color: "inherit" }}>{ESCENA_T6_A2.venta}</p>
          <p {...marca("monto25")} style={{ margin: "2px 0 0", ...NOTA, color: el.monto25.atenuado ? SECUNDARIO : TEXTO, ...aparicion(el.monto25, reducido) }}><ConCifras texto={ESCENA_T6_A2.monto} /></p>
        </div>
        <Anotacion id="clientes25" e={el.clientes25} cuenta={ESCENA_T6_A2.clientes} movimiento={ESCENA_T6_A2.monto} lado="debe" reducido={reducido} refDe={refDe} />
        <Anotacion id="ingresos25" e={el.ingresos25} cuenta={ESCENA_T6_A2.ingresos} movimiento={ESCENA_T6_A2.monto} lado="haber" reducido={reducido} refDe={refDe} />
      </div>

      <div {...marca("dia31")} style={{ marginTop: "8px", ...dia(el.dia31) }}>
        {fecha("fecha31", ESCENA_T6_A2.dia31)}
        <div {...marca("hecho31")} style={{ borderRadius: "10px", ...LINEA_SORA, ...caja(el.hecho31, [6, 8], reducido) }}>{ESCENA_T6_A2.analiza}</div>
        {nota("nancy", ESCENA_T6_A2.nancy)}
        {nota("factura", ESCENA_T6_A2.factura)}
        <span {...marca("metodo")} style={{
          alignSelf: "flex-start", borderRadius: "999px", whiteSpace: "nowrap", ...NOTA, ...caja(el.metodo, [1, 8], reducido),
        }}>
          {ESCENA_T6_A2.metodo}
        </span>
        <Anotacion id="gasto" e={el.gasto} cuenta={ESCENA_T6_A2.gasto} movimiento={ESCENA_T6_A2.monto} lado="debe" reducido={reducido} refDe={refDe} partirNombre />
        <Anotacion id="clientes31" e={el.clientes31} cuenta={ESCENA_T6_A2.clientes} movimiento={ESCENA_T6_A2.aNombre} lado="haber" reducido={reducido} refDe={refDe} />
      </div>
    </div>
  );
}

export default function DosDias() {
  return <MaquinaPegada todos={TODOS} estadoPaso={estadoPasoT6A2} duracion={duracionPasoT6A2} escena={Escena} atributos={{ "data-capa2-t6-a2": true }} />;
}
