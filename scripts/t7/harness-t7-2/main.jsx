/*
 * Banco de medida de T7-2: monta la vista del tema tal cual, con la hoja de
 * estilos del sitio (Inter y Sora incluidas), para que los scripts
 * medir-t7-2-*.mjs la recorran en Chromium. No es una página del sitio: Vite
 * la sirve solo cuando se mide. Va aparte del banco de T7-1 para no tocarlo.
 *
 * Con #h1 a #h4 monta la vista en el modo Hacer, con ese juego abierto
 * (medir-t7-2-h1.mjs, medir-t7-2-h2.mjs, medir-t7-2-h3.mjs, medir-t7-2-h4.mjs).
 * Sin sesión: la vista pide un AuthContext y aquí basta uno vacío.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import ContabilidadT7_2View from "../../../src/components/ContabilidadT7_2View.jsx";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";

const ABIERTO = { "#h1": "t7-2-debe-o-haber", "#h2": "t7-2-dos-asientos", "#h3": "t7-2-llena-el-kardex", "#h4": "t7-2-periodico-o-permanente" };
const nodo = ABIERTO[location.hash] ?? null;

createRoot(document.getElementById("root")).render(
  <AuthContext.Provider value={{ usuario: null, pedirCuenta: () => {} }}>
    {nodo ? <ContabilidadT7_2View modo="hacer" nodoInicial={nodo} onBack={() => {}} /> : <ContabilidadT7_2View onBack={() => {}} />}
  </AuthContext.Provider>,
);
