/*
 * Banco de medida de la capa 2 de las siete piezas de Aprender de la Célula B
 * (T5 · A1 y A2, T6 · A1 a A5), con las siluetas (hoja 5 de Mai): monta la
 * escena del hash tal cual, dentro de un Panel de 16 px de margen, con la hoja
 * de estilos del sitio, para que medir-b5-siluetas.mjs la recorra en Chromium.
 * No es una página del sitio.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import EfectivoDeSobra from "../../../src/components/mecanicas/libros/tema5/EfectivoDeSobra.jsx";
import TresMomentos from "../../../src/components/mecanicas/libros/tema5/TresMomentos.jsx";
import DosMomentos from "../../../src/components/mecanicas/libros/tema6/DosMomentos.jsx";
import DosDias from "../../../src/components/mecanicas/libros/tema6/DosDias.jsx";
import LaProvision from "../../../src/components/mecanicas/libros/tema6/LaProvision.jsx";
import SiPaga from "../../../src/components/mecanicas/libros/tema6/SiPaga.jsx";
import LaTablaDelEjemplo from "../../../src/components/mecanicas/libros/tema6/LaTablaDelEjemplo.jsx";

const PIEZAS = { "#t5a1": EfectivoDeSobra, "#t5a2": TresMomentos, "#t6a1": DosMomentos, "#t6a2": DosDias, "#t6a3": LaProvision, "#t6a4": SiPaga, "#t6a5": LaTablaDelEjemplo };
const Pieza = PIEZAS[location.hash] ?? LaProvision;
createRoot(document.getElementById("root")).render(
  <div style={{ padding: "16px", minHeight: "200vh" }}>
    <div style={{ border: "1px solid rgba(248,249,250,0.14)", borderRadius: "16px", padding: "16px" }}><Pieza /></div>
  </div>,
);
