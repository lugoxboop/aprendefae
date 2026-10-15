/*
 * Banco de medida del Repaso del capítulo 5 (Célula E): monta la vista del
 * tema tal cual, con la hoja de estilos del sitio (Inter y Sora incluidas),
 * para que scripts/e5/medir-r5-*.mjs la recorran en Chromium. No es una
 * página del sitio: Vite la sirve solo cuando se mide.
 *
 * Con #r5-1 monta la vista con r5-1 abierta. Sin sesión: la vista pide un
 * AuthContext y aquí basta uno vacío.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import RepasoCapitulo5View from "../../../src/components/RepasoCapitulo5View.jsx";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";

const nodo = location.hash ? location.hash.slice(1) : null;

createRoot(document.getElementById("root")).render(
  <AuthContext.Provider value={{ usuario: null, pedirCuenta: () => {} }}>
    <RepasoCapitulo5View nodoInicial={nodo} onBack={() => {}} />
  </AuthContext.Provider>,
);
