/*
 * Banco de medida del Tema 3 de Contabilidad (Célula E): monta la vista del
 * tema tal cual, con la hoja de estilos del sitio, para que
 * scripts/t3/medir-t3.mjs la recorra en Chromium. No es una página del sitio:
 * Vite la sirve solo cuando se mide.
 *
 *   #aprender          las cuatro piezas de Aprender
 *   #hacer:<id>        el camino de Hacer con ese juego abierto
 *
 * Sin sesión: la vista pide un AuthContext y aquí basta uno vacío (no hay
 * cifras que dependan de la cuenta en estas pantallas).
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import ContabilidadTema3View from "../../../src/components/ContabilidadTema3View.jsx";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";
import { APRENDER, HACER } from "../../../src/data/subjects.js";

const [modo, id] = location.hash.slice(1).split(":");

createRoot(document.getElementById("root")).render(
  <AuthContext.Provider value={{ usuario: null, pedirCuenta: () => {} }}>
    <ContabilidadTema3View modo={modo === "hacer" ? HACER : APRENDER} nodoInicial={id ?? null} onBack={() => {}} />
  </AuthContext.Provider>,
);
