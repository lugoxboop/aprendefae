/*
 * Banco de medida de T7-1: monta la vista del tema tal cual, con la hoja de
 * estilos del sitio (Inter y Sora incluidas), para que medir-t7-1-ap1.mjs la
 * recorra en Chromium. No es una página del sitio: Vite la sirve solo cuando
 * se mide.
 *
 * Con #h6 monta la vista en el modo Hacer, con H6 abierto (medir-t7-1-h6.mjs).
 *
 * Con #sonda monta en cambio dos figuras en el estado del acierto de la
 * pantalla 4, de anchos elegidos para que la línea de la compra mida 119 y
 * 123 px: a los dos lados del corte de 121 px de Mello. A 320 y 375 la línea
 * mide 103 y 130,5, y en ninguno de los dos se ve si el corte está bien puesto.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import ContabilidadT7_1View from "../../../src/components/ContabilidadT7_1View.jsx";
import FiguraDosColumnas from "../../../src/components/mecanicas/libros/t7/FiguraDosColumnas.jsx";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";

/* Columna = (ancho − 8) / 2; línea = columna − 20 de relleno − 2 de borde. */
const anchoParaLinea = (linea) => (linea + 22) * 2 + 8;

const raiz = createRoot(document.getElementById("root"));
if (location.hash === "#sonda") {
  raiz.render(
    <div style={{ padding: "16px", display: "grid", gap: "24px" }}>
      {[119, 123].map((linea) => (
        <div key={linea} data-sonda={linea} style={{ width: `${anchoParaLinea(linea)}px` }}>
          <FiguraDosColumnas estado="F4a" />
        </div>
      ))}
    </div>,
  );
} else if (location.hash === "#h6") {
  /*
   * H6 abierto en el modo Hacer, como lo abre #/inventarios-periodico/hacer/….
   * Sin sesión: la vista pide un AuthContext y aquí basta uno vacío.
   */
  raiz.render(
    <AuthContext.Provider value={{ usuario: null, pedirCuenta: () => {} }}>
      <ContabilidadT7_1View modo="hacer" nodoInicial="t7-1-devolucion-dos-libros" onBack={() => {}} />
    </AuthContext.Provider>,
  );
} else {
  /* Con o sin #a6, la vista entera: la medición de A6 busca su pieza dentro de ella. La vista pide un AuthContext. */
  raiz.render(
    <AuthContext.Provider value={{ usuario: null, pedirCuenta: () => {} }}>
      <ContabilidadT7_1View onBack={() => {}} />
    </AuthContext.Provider>,
  );
}
