import { DEBE, HABER, pesos } from "../../../../data/contabilidad.js";
import { inclinacionDe } from "../../../../contabilidad/balanza.js";
import { CuentaDeValor, Balanza, EstilosDeVerbos } from "../verbos.jsx";
import { EscenaFamilias } from "../familiasEnCajones.jsx";
import CapaCuatroDecide from "./CapaCuatroDecide.jsx";
import { DECIDE_POR_PIEZA } from "../../../../data/contabilidadAprenderDecide.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CAPA 4 QUE DECIDE, MONTADA EN LAS PIEZAS DE «LAS CUENTAS».
 *
 * Aquí vive lo único que necesita React: la figura. Las decisiones son datos
 * puros (contabilidadAprenderDecide.js) y el armazón es compartido
 * (CapaCuatroDecide.jsx). Esto solo las junta.
 *
 * NINGUNA FIGURA ES NUEVA, y eso es deliberado: son las mismas tres que el
 * estudiante ya vio en la capa 2 de su pieza —la cuenta T, los dos cajones y
 * la balanza—. Por eso una decisión se ve de verdad —el saldo se mueve de
 * lado, el cajón se vacía, la viga se cae— en lugar de cambiar solo una frase
 * debajo. Y por eso no hay nada que volver a aprender: la capa 4 pregunta
 * sobre el mismo dibujo que la capa 2 explicó.
 * ═══════════════════════════════════════════════════════════════════════════
 */

function FiguraCuentaViva({ estado }) {
  if (!estado) return null;
  return (
    <div>
      <EstilosDeVerbos />
      <CuentaDeValor
        cuenta={estado.cuenta}
        debitos={estado.debitos ?? []}
        creditos={estado.creditos ?? []}
        cancelar={Boolean(estado.cancelar)}
        resaltar={estado.lado === "debe" ? DEBE : estado.lado === "haber" ? HABER : null}
        alto={112}
      />
    </div>
  );
}

/*
 * Los dos cajones de «Las dos familias», tal como los pinta su capa 2. Aquí
 * no se decide nada: la escena ya sabe encender un cajón, apagar el otro o
 * vaciar las transitorias el 31 de diciembre, y el `estado` solo le dice cuál
 * de esos momentos mostrar. Vive en su propio archivo justamente para poder
 * usarla desde aquí sin que los imports se cierren en círculo.
 */
function FiguraFamiliasEnCajones({ estado }) {
  if (!estado) return null;
  return <EscenaFamilias resaltar={estado.resaltar} />;
}

/*
 * La balanza del asiento: los dos TOTALES, el del debe contra el del haber,
 * que es lo que el capítulo manda cuadrar. La inclinación no viene escrita en
 * los datos — se calcula de lo que cargan los platillos, igual que en la capa
 * 2— para que una cifra y un ángulo no puedan contradecirse.
 *
 * Y cada platillo lleva EL NOMBRE de la cuenta que lo cargó, no solo la cifra.
 * Sin el nombre, «$5.000 al haber de Acciones» y «$5.000 al haber de Bancos»
 * dibujarían exactamente la misma balanza nivelada, y el error que la pieza
 * quiere cazar —cuadrar usando dos veces la misma cuenta— se vería igual que
 * el acierto.
 */
function FiguraBalanzaDelAsiento({ estado }) {
  if (!estado) return null;
  const inclinacion = inclinacionDe(estado.debe, estado.haber);
  const sinEmpezar = estado.debe === 0 && estado.haber === 0;

  const platillo = (cuentas, monto, lado) => (
    <span style={{ display: "block", lineHeight: 1.35 }}>
      {/* 12 px: son nombres de cuenta, y el estudiante los está leyendo. */}
      {(cuentas?.length ? cuentas : ["—"]).map((nombre) => (
        <span key={nombre} style={{
          display: "block", fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600,
        }}>
          {nombre}
        </span>
      ))}
      <span data-peso={lado} style={{ display: "block", fontSize: "12px" }}>{pesos(monto)}</span>
    </span>
  );

  return (
    /*
     * El hueco de abajo no es margen de gusto: la viga de `Balanza` reserva
     * una altura fija y cuelga los platillos encima con posición absoluta, así
     * que un platillo de tres renglones —dos cuentas y el total, que es lo que
     * deja «dos débitos»— se sale por debajo y se le come la pregunta. Medido
     * a 320 px, no calculado. El hueco va aquí y no en `Balanza`, que la
     * comparten las capas 2 y 3 y no tienen este problema.
     */
    <div style={{ paddingBottom: "46px" }}>
      <EstilosDeVerbos />
      <Balanza
        inclinacion={inclinacion}
        izquierda={platillo(estado.cuentasDebe, estado.debe, DEBE)}
        derecha={platillo(estado.cuentasHaber, estado.haber, HABER)}
        /*
         * Un asiento sin renglones no «cuadra»: está sin empezar. Decir que
         * cuadra cuando no hay nada escrito le enseñaría al estudiante que el
         * cero es un asiento válido.
         */
        etiqueta={sinEmpezar
          ? "Todavía no hay nada registrado"
          : inclinacion === 0
            ? "Los dos totales coinciden: el asiento cuadra"
            : "El asiento no cuadra todavía"}
      />
    </div>
  );
}

/*
 * Las figuras, por nombre. Una pieza elige la suya con `figura:` en sus datos;
 * sin nombre, la cuenta T. Las piezas de este tema no hablan todas del mismo
 * objeto —la partida doble se ve mejor en una balanza, el paso al mayor en dos
 * libros— y forzarlas todas a la cuenta T sería pintar la figura equivocada
 * para que el armazón no cambie.
 *
 * Para añadir una: una entrada aquí, y que `estado()` devuelva lo que esa
 * figura sabe pintar. La figura solo pinta `estado`; no decide nada.
 */
const FIGURAS = {
  cuenta: FiguraCuentaViva,
  familias: FiguraFamiliasEnCajones,
  balanza: FiguraBalanzaDelAsiento,
};

/* Una entrada por pieza registrada. `ESCENAS` las reparte a CuatroCapas. */
export const CAPA4_POR_PIEZA = Object.fromEntries(
  Object.entries(DECIDE_POR_PIEZA).map(([id, datos]) => [
    id,
    function Capa4Decide() {
      return <CapaCuatroDecide pieza={{ ...datos, Figura: FIGURAS[datos.figura ?? "cuenta"] }} />;
    },
  ]),
);
