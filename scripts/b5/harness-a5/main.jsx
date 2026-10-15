/*
 * Banco de medida de b5-t6-a5 «La cuenta de la provisión»: monta el juego tal
 * cual, con la hoja de estilos del sitio, para que medir-b5-t6-a5.mjs lo
 * recorra en Chromium. No es una página del sitio: Vite la sirve solo cuando
 * se mide.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import { MarcoLibros } from "../../../src/components/mecanicas/bloques/marcos.jsx";
import LaCuentaDeLaProvision from "../../../src/components/mecanicas/libros/tema6/LaCuentaDeLaProvision.jsx";
import { FAE } from "../../../src/theme.js";

createRoot(document.getElementById("root")).render(
  <div style={{ padding: "16px" }}>
    <LaCuentaDeLaProvision Marco={MarcoLibros} rotulo="MEDIDA" titulo="Banco de medida" acento={FAE.ambar} onCompletar={() => {}} />
  </div>,
);
