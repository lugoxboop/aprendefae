import { FAE } from "../../../../theme.js";
import { N7, BOTON_N7, FIGURA_N7, resumenN7 } from "../../../../data/contabilidadT5_n7.js";
import { prepararN7, evaluarN7, idLineaN7, puntuarN7, TOTAL_N7 } from "../../../../contabilidad/t5N7.js";
import { AsientoEnLineas, CuentaT } from "../piezas.jsx";
import PreguntasConAsientoT5 from "./PreguntasConAsientoT5.jsx";
import { CONSECUENCIA_C4 } from "../../../../contabilidad/c4/t5N7_c4.js";
import { pesos } from "../../../../data/contabilidad.js";
import { NotaC4 } from "./figurasC4T5.jsx";
import { LADOS_T7 } from "../t7/hacerT7.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N7 · ¿A QUÉ CUENTA VA? (Célula C) · versión 2
 *
 * La casilla del costo de la compra y los cuatro asientos con «Arma la
 * línea», todo con la escalera (C2) y «Vale el primer intento», en
 * PreguntasConAsientoT5.jsx, como N5. Arriba, la figura que crece (C8). Los
 * textos y las cifras, en data/contabilidadT5_n7.js; la lógica, en
 * contabilidad/t5N7.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * LA FIGURA, PROVISIONAL PARA WATARI: una versión funcional y sobria, con el
 * estilo de la figura de N5 (GanoOPerdio.jsx), el asiento con sus sumas y la
 * cuenta T de piezas.jsx, mientras Watari entrega su forma.
 *
 * El libro de Guayacán gana el asiento de un hecho cuando se cierra (acierto
 * o segundo error), nunca antes (E8). Al lado, la cuenta T de Inversiones –
 * títulos con lo que le mueven los asientos ya cerrados: la compra la sube;
 * el interés y el dividendo no la mueven. A lo ancho, el libro y la cuenta
 * van lado a lado; en un celular, uno debajo del otro.
 *
 * PATRÓN C4 (D9, contabilidad/c4/t5N7_c4.js): en la casilla del costo, la
 * cifra que se escribe entra en el acto al debe de la cuenta (con borde, no
 * con color: es provisional), y debajo se ve lo que pagó; el veredicto, 380
 * ms después, con la escalera de siempre. La frase de lo que implica la
 * mala, con ✕, sale con el veredicto.
 */
/* Lo que entra al debe de Inversiones – títulos, provisional hasta que se arme el asiento. */
export function EntraN7({ estado, vista }) {
  const cifra = estado.debe ?? vista.borrador ?? null;
  return (
    <div className={`t5c4${vista.anim ? " t5c4-anim" : ""}`} data-figura data-entra-n7 aria-live="polite" style={{ marginTop: "10px" }}>
      <p className="t5c4-linea" data-debe-n7>
        <span>{LADOS_T7.debe} </span>
        {/* C4-1: la cifra escrita se muestra; la consecuencia (y el coral), solo tras «Comprobar». */}
        {cifra == null ? "—" : <b className={`t5c4-num${estado.debe != null ? " t5c4-mov" : ""}${vista.veredicto && estado.falla ? " mal" : ""}`} data-cifra-n7>{pesos(cifra)}</b>}
      </p>
      <p className="t5c4-linea" data-pago-n7>{estado.pago}</p>
      <NotaC4 estado={estado} vista={vista} />
    </div>
  );
}

/* Para la prueba C5 (consecuencia-c): el objeto C4 con la forma del motor. */
export const PIEZA_C4 = { ...CONSECUENCIA_C4, Figura: EntraN7 };

export function FiguraN7({ items, i, listo, c4 = null }) {
  const cerrados = items.filter((x, k) => x.tipo === "asiento" && (k < i || (k === i && listo)));
  const enLaCuenta = (lado) => cerrados.flatMap((x) => x.lineas.filter((l) => l.cuenta === FIGURA_N7.cuenta && l.lado === lado).map((l) => ({ valor: l.valor })));
  const estado = c4?.estado ?? null;
  return (
    <section data-figura-n7 aria-label={FIGURA_N7.titulo} style={{
      margin: "0 0 14px", padding: "10px 12px", borderRadius: "11px", border: "1px solid rgba(248,249,250,0.12)",
      background: "rgba(10,20,34,0.35)",
    }}>
      <p data-titulo-figura style={{ margin: "0 0 8px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700, color: "#A8B6C8" }}>{FIGURA_N7.titulo}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "10px", alignItems: "start" }}>
        <ul data-libro style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", rowGap: "8px", minWidth: 0 }}>
          {cerrados.map((x) => (
            <li key={x.id} data-fila={x.id} className="fae-t7h-entra">
              <p data-rotulo-asiento style={{ margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, color: FAE.text }}>{FIGURA_N7.rotulo(x.hecho)}</p>
              <AsientoEnLineas lineas={x.lineas.map((l) => ({ cuenta: l.cuenta, lado: l.lado, valor: l.valor }))} totales />
            </li>
          ))}
        </ul>
        <div data-cuenta-inversiones style={{ minWidth: 0 }}>
          <CuentaT compacta cuenta={{ cuenta: FIGURA_N7.cuenta, debitos: enLaCuenta("debe"), creditos: enLaCuenta("haber") }} />
        </div>
      </div>
      {estado && <EntraN7 estado={estado} vista={c4.vista} />}
    </section>
  );
}

export const CONFIG_N7 = {
  datos: N7, botones: BOTON_N7, preparar: prepararN7, evaluar: evaluarN7, idLinea: idLineaN7,
  puntuar: puntuarN7, total: TOTAL_N7, resumen: resumenN7, marca: "t5-n7",
  escalera: true, Figura: FiguraN7,
  c4: CONSECUENCIA_C4,
};

export default function AQueCuentaVa(props) {
  return <PreguntasConAsientoT5 config={CONFIG_N7} {...props} />;
}
