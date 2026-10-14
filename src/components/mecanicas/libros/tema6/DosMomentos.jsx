import { ESCENA_T6, PASOS_T6, CIERRE_T6 } from "../../../../data/contabilidadT6Pieza1.js";
import { estadoPasoT6, duracionPasoT6 } from "../../../../contabilidad/t6Pieza1.js";
import MaquinaPegada, { SORA, INTER, SECUNDARIO, caja, Anotacion as AnotacionBase } from "./MaquinaPegada.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 1 · CAPA 2 · «MÍRELO FUNCIONAR» — los libros de
 * Comercializadora Santa Pacha en dos días (guía v2 de Mai, §4).
 *
 * La escena (decorativa: el texto del paso dice cada movimiento, incluidos
 * «se debita» y «se acredita»). El bloque de control pegado, «Reproducir» y
 * el desplazamiento viven en MaquinaPegada.jsx, que comparte con la pieza 2.
 *
 * Teal es Debe y ámbar es Haber, siempre en cápsula rellena con su palabra;
 * las cápsulas no se atenúan. Ningún texto vive aquí: todo sale del archivo
 * de datos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TODOS = [...PASOS_T6, CIERRE_T6];
const Anotacion = (props) => <AnotacionBase {...props} textos={ESCENA_T6} />;

function Escena(estado, refDe, reducido) {
  const el = estado.elementos;
  const dia = (id, e) => ({
    borderRadius: "12px", display: "flex", flexDirection: "column", gap: "6px",
    /* El recuadro resaltado lleva borde nodo SIN relleno navy (v2 §A), y compensa el borde. */
    ...caja(e, [8, 10, 10], reducido, { conNavy: false }),
  });

  return (
    <div data-escena aria-hidden="true">
      <p data-elemento="perspectiva" style={{ margin: "0 0 8px", fontFamily: INTER, fontSize: "12px", lineHeight: 1.35, color: SECUNDARIO }}>
        {ESCENA_T6.perspectiva}
      </p>

      <div ref={refDe("dia10")} data-elemento="dia10" data-resaltado={el.dia10.resaltado ? "si" : "no"} style={dia("dia10", el.dia10)}>
        <p style={{ margin: 0, fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, color: "inherit" }}>{ESCENA_T6.dia10}</p>
        <div ref={refDe("hecho10")} data-elemento="hecho10" data-resaltado={el.hecho10.resaltado ? "si" : "no"} style={{
          borderRadius: "10px", display: "flex", justifyContent: "space-between", gap: "8px",
          fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, ...caja(el.hecho10, [6, 8], reducido),
        }}>
          <span>{ESCENA_T6.venta}</span><span>{ESCENA_T6.monto}</span>
        </div>
        <span ref={refDe("plazo")} data-elemento="plazo" data-resaltado={el.plazo.resaltado ? "si" : "no"} style={{
          alignSelf: "flex-start", borderRadius: "999px", whiteSpace: "nowrap", fontFamily: INTER, fontSize: "12px", lineHeight: 1.35,
          ...caja(el.plazo, [1, 8], reducido),
        }}>
          {ESCENA_T6.plazo}
        </span>
        <Anotacion id="ingresos10" e={el.ingresos10} cuenta={ESCENA_T6.ingresos} movimiento={ESCENA_T6.monto} lado="haber" reducido={reducido} refDe={refDe} />
        <Anotacion id="clientes10" e={el.clientes10} cuenta={ESCENA_T6.clientes} movimiento={ESCENA_T6.sube} lado="debe" reducido={reducido} refDe={refDe} />
      </div>

      <div ref={refDe("dia25")} data-elemento="dia25" data-resaltado={el.dia25.resaltado ? "si" : "no"} style={{ marginTop: "8px", ...dia("dia25", el.dia25) }}>
        <p style={{ margin: 0, fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, color: "inherit" }}>{ESCENA_T6.dia25}</p>
        <div ref={refDe("hecho25")} data-elemento="hecho25" data-resaltado={el.hecho25.resaltado ? "si" : "no"} style={{
          borderRadius: "10px", fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, ...caja(el.hecho25, [6, 8], reducido),
        }}>
          {ESCENA_T6.pago}
        </div>
        <Anotacion id="caja25" e={el.caja25} cuenta={ESCENA_T6.caja} movimiento={ESCENA_T6.monto} lado="debe" reducido={reducido} refDe={refDe} />
        <Anotacion id="clientes25" e={el.clientes25} cuenta={ESCENA_T6.clientes} movimiento={ESCENA_T6.baja} lado="haber" reducido={reducido} refDe={refDe} />
      </div>
    </div>
  );
}

export default function DosMomentos() {
  return <MaquinaPegada todos={TODOS} estadoPaso={estadoPasoT6} duracion={duracionPasoT6} escena={Escena} atributos={{ "data-capa2-t6": true }} />;
}
