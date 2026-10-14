/*
 * Banco de medida de T7-1: monta la vista del tema tal cual, con la hoja de
 * estilos del sitio (Inter y Sora incluidas), para que medir-t7-1-ap1.mjs la
 * recorra en Chromium. No es una página del sitio: Vite la sirve solo cuando
 * se mide.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import ContabilidadT7_1View from "../../../src/components/ContabilidadT7_1View.jsx";

createRoot(document.getElementById("root")).render(<ContabilidadT7_1View onBack={() => {}} />);
