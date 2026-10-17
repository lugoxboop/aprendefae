import { DEBE, HABER } from "../../../../data/contabilidad.js";
import { CuentaDeValor, EstilosDeVerbos } from "../verbos.jsx";
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
 * La figura NO es nueva: es `CuentaDeValor`, la misma cuenta T que ya usan la
 * capa 2 y la capa 3 de estas piezas. Por eso una decisión se ve de verdad —
 * el saldo se mueve de lado, la cancelación aparece — en lugar de cambiar
 * solo una frase debajo.
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
 * Las figuras, por nombre. Una pieza elige la suya con `figura:` en sus datos;
 * sin nombre, la cuenta T. Las piezas de este tema no hablan todas del mismo
 * objeto —la partida doble se ve mejor en una balanza, el paso al mayor en dos
 * libros— y forzarlas todas a la cuenta T sería pintar la figura equivocada
 * para que el armazón no cambie.
 *
 * Para añadir una: una entrada aquí, y que `estado()` devuelva lo que esa
 * figura sabe pintar. La figura solo pinta `estado`; no decide nada.
 */
const FIGURAS = { cuenta: FiguraCuentaViva };

/* Una entrada por pieza registrada. `ESCENAS` las reparte a CuatroCapas. */
export const CAPA4_POR_PIEZA = Object.fromEntries(
  Object.entries(DECIDE_POR_PIEZA).map(([id, datos]) => [
    id,
    function Capa4Decide() {
      return <CapaCuatroDecide pieza={{ ...datos, Figura: FIGURAS[datos.figura ?? "cuenta"] }} />;
    },
  ]),
);
