import { createRoot } from "react-dom/client";
import { MarcoLibros } from "../../../src/components/mecanicas/bloques/marcos.jsx";
import * as A from "../../../src/components/mecanicas/libros/actividades.jsx";
import GastoOPago from "../../../src/components/mecanicas/libros/tema3/GastoOPago.jsx";
import DondeSeRompio from "../../../src/components/mecanicas/libros/tema1/DondeSeRompio.jsx";
import ElArqueo from "../../../src/components/t4/ElArqueo.jsx";

/*
 * Banco de B1 para el encabezado de Hacer (#542). Monta una pieza por cada
 * célula en la columna del tema (padding 16, tope 560) y deja que
 * scripts/hacer/medir-b1.mjs mida dónde empieza la primera interacción.
 * ?pieza=<nombre> elige cuál.
 */
const nada = () => {};
const comun = { Marco: MarcoLibros, acento: "#E9C46A", onCompletar: nada, onComoSeJuega: nada };
const PIEZAS = {
  "C·DebitaOAcredita": () => <A.DebitaOAcredita onCompletar={nada} onComoSeJuega={nada} />,
  "C·ElSaldoDeLaCuenta": () => <A.ElSaldoDeLaCuenta onCompletar={nada} onComoSeJuega={nada} />,
  "C·CuadroDinamicas": () => <A.CuadroDinamicas onCompletar={nada} onComoSeJuega={nada} />,
  "E·GastoOPago": () => <GastoOPago {...comun} rotulo="APLICACIÓN" titulo="¿Gasto o pago?" />,
  "B·DondeSeRompio": () => <DondeSeRompio {...comun} rotulo="APLICACIÓN" titulo="¿Dónde se rompió la ecuación?" />,
  "D·ElArqueo": () => <ElArqueo {...comun} rotulo="APLICACIÓN" titulo="El arqueo de la caja menor" />,
};
const pieza = new URLSearchParams(location.search).get("pieza");
const P = PIEZAS[pieza];
window.__PIEZAS = Object.keys(PIEZAS);
createRoot(document.getElementById("raiz")).render(
  <div data-columna style={{ padding: "16px", maxWidth: "560px", boxSizing: "border-box" }}>
    {P ? <P /> : <p>Elige ?pieza=</p>}
  </div>
);
