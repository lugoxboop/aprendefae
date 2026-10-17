/*
 * Banco de medida de la segunda decisión de T3 (acts. 1 y 2): monta una pieza
 * con un solo ítem, en el marco y el ancho de la vista del tema, para que
 * medir-t3-segunda.mjs la recorra en Chromium. No es una página del sitio.
 *
 *   #a1:<id del hecho>   ¿Ingreso o cobro?
 *   #a2:<id del ítem>    ¿Cuándo se causa?
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import { MarcoLibros } from "../../../src/components/mecanicas/bloques/marcos.jsx";
import IngresoOCobro from "../../../src/components/mecanicas/libros/tema3/IngresoOCobro.jsx";
import CuandoSeCausa from "../../../src/components/mecanicas/libros/tema3/CuandoSeCausa.jsx";
import { HECHOS_ACT1_T3, ACT1_T3 } from "../../../src/data/contabilidadTema3Act1.js";
import { ITEMS_ACT2, ACT2_T3 } from "../../../src/data/contabilidadTema3Act2.js";
import { FAE } from "../../../src/theme.js";

const [cual, id] = location.hash.slice(1).split(":");
const Pieza = cual === "a1" ? IngresoOCobro : CuandoSeCausa;
const items = cual === "a1" ? HECHOS_ACT1_T3.filter((x) => x.id === id) : ITEMS_ACT2.filter((x) => x.id === id);
const titulo = cual === "a1" ? ACT1_T3.nombre : ACT2_T3.nombre;

createRoot(document.getElementById("root")).render(
  /* El envoltorio de ContabilidadTema3View, por valor. */
  <div style={{ maxWidth: "860px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) clamp(16px, 2vw, 24px) 56px" }}>
    <div data-pieza-t3={cual}>
      <Pieza Marco={MarcoLibros} items={items} titulo={titulo} rotulo="Tema 3" acento={FAE.ambar} onCompletar={() => {}} />
    </div>
  </div>,
);
