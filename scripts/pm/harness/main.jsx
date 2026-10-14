/*
 * Banco de medida de Política Monetaria · Aprender: monta la vista del tema
 * tal cual, en el modo Aprender, con la hoja de estilos del sitio (Inter y
 * Sora incluidas). No es una página del sitio: Vite la sirve solo cuando se
 * mide. Sin sesión: la vista pide un AuthContext y aquí basta uno vacío.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";
import PoliticaMonetariaView from "../../../src/components/PoliticaMonetariaView.jsx";

createRoot(document.getElementById("root")).render(
  <AuthContext.Provider value={{ usuario: null, pedirCuenta: () => {} }}>
    <PoliticaMonetariaView modo="aprender" onBack={() => {}} />
  </AuthContext.Provider>,
);
