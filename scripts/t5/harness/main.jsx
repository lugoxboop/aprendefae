/*
 * Banco de medida de los Hacer de la Célula C en T5: monta la vista del tema
 * tal cual, en el modo Hacer, con el juego del hash abierto (#n3), y la hoja
 * de estilos del sitio, para que medir-t5-n3.mjs la recorra en Chromium. No
 * es una página del sitio: Vite la sirve solo cuando se mide.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import ContabilidadTema5View from "../../../src/components/ContabilidadTema5View.jsx";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";

const JUEGOS = { "#n3": "t5-revision-que-falta" };

/* Sin sesión: la vista pide un AuthContext y aquí basta uno vacío. */
createRoot(document.getElementById("root")).render(
  <AuthContext.Provider value={{ usuario: null, pedirCuenta: () => {} }}>
    <ContabilidadTema5View modo="hacer" nodoInicial={JUEGOS[location.hash] ?? null} onBack={() => {}} />
  </AuthContext.Provider>,
);
