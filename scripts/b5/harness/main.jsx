/*
 * Banco de medida de la Célula B: monta un juego tal cual, con la hoja de
 * estilos del sitio (Inter y Sora incluidas), para que medir-b5-calidad-1.mjs
 * lo recorra en Chromium. No es una página del sitio: Vite la sirve solo
 * cuando se mide.
 *
 *   #mesa-2 · el cierre de Santa Pacha (b5-t5-a2) en su parte 2, la de «1.725.000»
 *   #a6     · «Provisión por edades» (b5-t6-a6) entera
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import { MarcoLibros } from "../../../src/components/mecanicas/bloques/marcos.jsx";
import CierreSantaPacha from "../../../src/components/mecanicas/libros/tema5/CierreSantaPacha.jsx";
import ProvisionPorEdades from "../../../src/components/mecanicas/libros/tema6/ProvisionPorEdades.jsx";
import { PARTES_T5_ACT2 } from "../../../src/data/contabilidadT5Act2.js";
import { FAE } from "../../../src/theme.js";

const props = { Marco: MarcoLibros, rotulo: "MEDIDA", titulo: "Banco de medida", acento: FAE.ambar, onCompletar: () => {} };
const raiz = createRoot(document.getElementById("root"));
const envolver = (hijo) => <div style={{ padding: "16px" }}>{hijo}</div>;
if (location.hash === "#mesa-2") raiz.render(envolver(<CierreSantaPacha {...props} items={[PARTES_T5_ACT2[1]]} />));
else if (location.hash === "#a6") raiz.render(envolver(<ProvisionPorEdades {...props} />));
