/*
 * Banco de medida de b5-t6-a6 «Provisión por edades»: monta el juego tal
 * cual, con la hoja de estilos del sitio, para que medir-b5-t6-a6.mjs lo
 * recorra en Chromium. No es una página del sitio: Vite la sirve solo cuando
 * se mide.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import { MarcoLibros } from "../../../src/components/mecanicas/bloques/marcos.jsx";
import ProvisionPorEdades from "../../../src/components/mecanicas/libros/tema6/ProvisionPorEdades.jsx";
import { FAE } from "../../../src/theme.js";

createRoot(document.getElementById("root")).render(
  <div style={{ padding: "16px" }}>
    <ProvisionPorEdades Marco={MarcoLibros} rotulo="MEDIDA" titulo="Banco de medida" acento={FAE.ambar} onCompletar={() => {}} />
  </div>,
);
