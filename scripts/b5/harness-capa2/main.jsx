/*
 * Banco de medida de la capa 2 larga (hoja 7 de Mai): monta la pieza que pide
 * el hash (t5a2, t6a3, t6a4, t6a5) con CuatroCapas, como la vista, para que el
 * bloque de control quede pegado de verdad (necesita su section[data-capa]), y
 * la hoja de estilos del sitio. medir-b5-capa2.mjs la recorre en Chromium.
 * No es una página del sitio: Vite la sirve solo cuando se mide.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import CuatroCapas from "../../../src/components/mecanicas/maquinas/CuatroCapas.jsx";
import { PIEZAS as PIEZAS_T5 } from "../../../src/components/ContabilidadTema5View.jsx";
import { PIEZAS as PIEZAS_T6 } from "../../../src/components/ContabilidadTema6View.jsx";
import { ESCENAS_TEMA5 } from "../../../src/components/mecanicas/libros/tema5/escenasTema5.jsx";
import { ESCENAS_TEMA6 } from "../../../src/components/mecanicas/libros/tema6/escenasTema6.jsx";

const [, tema, n] = window.location.hash.match(/^#t(\d)a(\d)$/) ?? [null, "6", "3"];
const piezas = tema === "5" ? PIEZAS_T5.filter((p) => ESCENAS_TEMA5[p.pieza.id]) : PIEZAS_T6;
const { pieza } = piezas[Number(n) - 1];
const { Capa2, Exploracion, Capa4 } = (tema === "5" ? ESCENAS_TEMA5 : ESCENAS_TEMA6)[pieza.id];

createRoot(document.getElementById("root")).render(
  <div style={{ padding: "16px" }}>
    <CuatroCapas pieza={pieza} Capa2={Capa2} Exploracion={Exploracion} Capa4={Capa4} rotulo="MEDIDA" />
  </div>,
);
