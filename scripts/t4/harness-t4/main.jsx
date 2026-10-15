/*
 * Banco de medida de T4 (Célula D): monta la vista del tema tal cual, con la
 * hoja de estilos del sitio (Inter y Sora incluidas), para que los scripts
 * medir-t4.mjs la recorran en Chromium. No es una página del sitio: Vite
 * la sirve solo cuando se mide. Sin sesión: la vista pide un AuthContext y
 * aquí basta uno vacío.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import ContabilidadT4View from "../../../src/components/ContabilidadT4View.jsx";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";

createRoot(document.getElementById("root")).render(
  <AuthContext.Provider value={{ usuario: null, pedirCuenta: () => {} }}>
    <ContabilidadT4View onBack={() => {}} />
  </AuthContext.Provider>,
);
