/*
 * Banco de medida de T7-2: monta la vista del tema tal cual, con la hoja de
 * estilos del sitio (Inter y Sora incluidas), para que los scripts
 * medir-t7-2-*.mjs la recorran en Chromium. No es una página del sitio: Vite
 * la sirve solo cuando se mide. Va aparte del banco de T7-1 para no tocarlo.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import ContabilidadT7_2View from "../../../src/components/ContabilidadT7_2View.jsx";

createRoot(document.getElementById("root")).render(<ContabilidadT7_2View onBack={() => {}} />);
