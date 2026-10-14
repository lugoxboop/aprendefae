/*
 * Banco de medida de T7-3: monta la vista del tema tal cual, con la hoja de
 * estilos del sitio (Inter y Sora incluidas), para que los scripts
 * medir-t7-3-*.mjs la recorran en Chromium. No es una página del sitio: Vite
 * la sirve solo cuando se mide. Va aparte de los bancos de T7-1 y T7-2 para
 * no tocarlos.
 *
 * Con #h1 a #h6 monta la vista en el modo Hacer, con ese juego abierto
 * (medir-t7-3-h1.mjs a medir-t7-3-h6.mjs). Sin sesión: la vista pide un
 * AuthContext y aquí basta uno vacío.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import ContabilidadT7_3View from "../../../src/components/ContabilidadT7_3View.jsx";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";

const ABIERTO = { "#h1": "t7-3-descuento-en-factura", "#h2": "t7-3-cadena-de-descuentos", "#h3": "t7-3-comercial-o-condicionado", "#h4": "t7-3-pago-a-tiempo", "#h5": "t7-3-ajuste-por-conteo", "#h6": "t7-3-que-entra-al-costo" };
const nodo = ABIERTO[location.hash] ?? null;

createRoot(document.getElementById("root")).render(
  <AuthContext.Provider value={{ usuario: null, pedirCuenta: () => {} }}>
    {nodo ? <ContabilidadT7_3View modo="hacer" nodoInicial={nodo} onBack={() => {}} /> : <ContabilidadT7_3View onBack={() => {}} />}
  </AuthContext.Provider>,
);
