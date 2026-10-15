/*
 * Banco de medida de T4 (Célula D): monta la vista del tema tal cual, con la
 * hoja de estilos del sitio (Inter y Sora incluidas), para que los scripts
 * medir-t4.mjs la recorran en Chromium. No es una página del sitio: Vite
 * la sirve solo cuando se mide. Sin sesión: la vista pide un AuthContext y
 * aquí basta uno vacío.
 *
 * Con #h1 a #h5 monta la vista en el modo Hacer, con ese juego abierto
 * (medir-t4-hacer.mjs).
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import ContabilidadT4View from "../../../src/components/ContabilidadT4View.jsx";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";

const ABIERTO = { "#h1": "t4-entra-o-sale-de-caja", "#h2": "t4-el-control-que-se-saltaron", "#h3": "t4-se-mueve-la-caja-menor", "#h4": "t4-el-arqueo-de-rosa", "#h5": "t4-al-empleado-o-al-gasto" };
const nodo = ABIERTO[location.hash] ?? null;

createRoot(document.getElementById("root")).render(
  <AuthContext.Provider value={{ usuario: null, pedirCuenta: () => {} }}>
    {nodo ? <ContabilidadT4View modo="hacer" nodoInicial={nodo} onBack={() => {}} /> : <ContabilidadT4View onBack={() => {}} />}
  </AuthContext.Provider>,
);
