/*
 * Banco de medida de T5 (Célula C): monta la vista del tema tal cual, con la
 * hoja de estilos del sitio, para que scripts/t5/medir-*.mjs la recorran en
 * Chromium. No es una página del sitio: Vite la sirve solo cuando se mide.
 *
 * Con #n5 (o #n4, #n7) monta la vista en el modo Hacer con esa pieza abierta. Sin sesión: la vista
 * pide un AuthContext y aquí basta uno vacío.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import ContabilidadTema5View from "../../../src/components/ContabilidadTema5View.jsx";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";

const ABIERTO = { "#n4": "t5-el-interes-del-periodo", "#n5": "t5-gano-o-perdio", "#n7": "t5-a-que-cuenta-va" };
const nodo = ABIERTO[location.hash] ?? null;

createRoot(document.getElementById("root")).render(
  <AuthContext.Provider value={{ usuario: null, pedirCuenta: () => {} }}>
    {nodo ? <ContabilidadTema5View modo="hacer" nodoInicial={nodo} onBack={() => {}} /> : <ContabilidadTema5View onBack={() => {}} />}
  </AuthContext.Provider>,
);
