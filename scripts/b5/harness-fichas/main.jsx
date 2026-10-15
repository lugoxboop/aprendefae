/*
 * Banco de medida de las tres de fichas de la Célula B (b5-t5-a1, b5-t6-a1 y
 * b5-t6-a7), con el estante de cajones: monta el juego del hash (#t5a1,
 * #t6a1, #t6a7) tal cual, con la hoja de estilos del sitio, para que
 * medir-b5-fichas.mjs lo recorra en Chromium. No es una página del sitio.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import { MarcoLibros } from "../../../src/components/mecanicas/bloques/marcos.jsx";
import QueRentaDa from "../../../src/components/mecanicas/libros/tema5/QueRentaDa.jsx";
import ClientesOOtra from "../../../src/components/mecanicas/libros/tema6/ClientesOOtra.jsx";
import QueMetodoYCuando from "../../../src/components/mecanicas/libros/tema6/QueMetodoYCuando.jsx";
import { FAE } from "../../../src/theme.js";

const JUEGOS = { "#t5a1": QueRentaDa, "#t6a1": ClientesOOtra, "#t6a7": QueMetodoYCuando };
const Juego = JUEGOS[location.hash] ?? QueRentaDa;
createRoot(document.getElementById("root")).render(
  <div style={{ padding: "16px" }}>
    <Juego Marco={MarcoLibros} rotulo="MEDIDA" titulo="Banco de medida" acento={FAE.ambar} onCompletar={() => {}} />
  </div>,
);
