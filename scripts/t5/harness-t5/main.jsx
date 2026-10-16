/*
 * Banco de medida de T5 (Célula C): monta la vista del tema tal cual, en
 * Aprender, con la hoja de estilos del sitio (Inter y Sora incluidas), para
 * que scripts/t5/medir-t5-*.mjs la recorran en Chromium. No es una página del
 * sitio: Vite la sirve solo cuando se mide. Sin sesión: la vista pide un
 * AuthContext y aquí basta uno vacío.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import ContabilidadTema5View from "../../../src/components/ContabilidadTema5View.jsx";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";

createRoot(document.getElementById("root")).render(
  <AuthContext.Provider value={{ usuario: null, pedirCuenta: () => {} }}>
    <ContabilidadTema5View onBack={() => {}} />
  </AuthContext.Provider>,
);
