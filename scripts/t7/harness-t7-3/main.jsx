/*
 * Banco de medida de T7-3: monta la vista del tema tal cual, con la hoja de
 * estilos del sitio (Inter y Sora incluidas), para que los scripts
 * medir-t7-3-*.mjs la recorran en Chromium. No es una página del sitio: Vite
 * la sirve solo cuando se mide. Va aparte de los bancos de T7-1 y T7-2 para
 * no tocarlos.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import ContabilidadT7_3View from "../../../src/components/ContabilidadT7_3View.jsx";

createRoot(document.getElementById("root")).render(<ContabilidadT7_3View onBack={() => {}} />);
