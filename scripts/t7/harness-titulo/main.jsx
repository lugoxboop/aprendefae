/*
 * Banco de medida del título del tema (scripts/t7/medir-titulo-320.mjs).
 * Monta la vista del hash (#t7-1, #t7-2, #t7-3, #t5) con la hoja del sitio y
 * la hoja de la cabecera compacta compartida, que inyecta AccountControl
 * (con la sesión «cargando», solo pinta su estilo). No es una página del
 * sitio: Vite la sirve solo cuando se mide.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";
import AccountControl from "../../../src/components/auth/AccountControl.jsx";
import ContabilidadT7_1View from "../../../src/components/ContabilidadT7_1View.jsx";
import ContabilidadT7_2View from "../../../src/components/ContabilidadT7_2View.jsx";
import ContabilidadT7_3View from "../../../src/components/ContabilidadT7_3View.jsx";
import ContabilidadTema5View from "../../../src/components/ContabilidadTema5View.jsx";

const VISTAS = { "#t7-1": ContabilidadT7_1View, "#t7-2": ContabilidadT7_2View, "#t7-3": ContabilidadT7_3View, "#t5": ContabilidadTema5View };
const Vista = VISTAS[location.hash] ?? ContabilidadT7_3View;

createRoot(document.getElementById("root")).render(
  <AuthContext.Provider value={{ disponible: true, cargando: true, usuario: null, pedirCuenta: () => {} }}>
    <AccountControl />
    <Vista onBack={() => {}} />
  </AuthContext.Provider>,
);
