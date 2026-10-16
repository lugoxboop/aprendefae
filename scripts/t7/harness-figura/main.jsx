/*
 * Banco de medida de la figura acumulada (lote 5 de L): monta la vista del
 * tema tal cual, en el modo Hacer, con la pieza del hash abierta
 * (#t7-1-cuanto-vale-lo-que-sobro, …), con la hoja de estilos del sitio.
 * Lo recorre scripts/t7/medir-figura-acumulada.mjs. No es una página del
 * sitio: Vite la sirve solo cuando se mide. Sin sesión: la vista pide un
 * AuthContext y aquí basta uno vacío.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import ContabilidadT7_1View from "../../../src/components/ContabilidadT7_1View.jsx";
import ContabilidadT7_2View from "../../../src/components/ContabilidadT7_2View.jsx";
import ContabilidadT7_3View from "../../../src/components/ContabilidadT7_3View.jsx";
import ContabilidadTema5View from "../../../src/components/ContabilidadTema5View.jsx";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";

const nodo = location.hash.slice(1);
const Vista = nodo.startsWith("t7-1-") ? ContabilidadT7_1View
  : nodo.startsWith("t7-2-") ? ContabilidadT7_2View
  : nodo.startsWith("t7-3-") ? ContabilidadT7_3View
  : ContabilidadTema5View;

createRoot(document.getElementById("root")).render(
  <AuthContext.Provider value={{ usuario: null, pedirCuenta: () => {} }}>
    <Vista modo="hacer" nodoInicial={nodo} onBack={() => {}} />
  </AuthContext.Provider>,
);
