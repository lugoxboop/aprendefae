import { FAE } from "../../../../theme.js";

/*
 * El foco visible de las máquinas del Tema 5 (guía de Mai v3, §4.5): contorno
 * de 2 px en color texto, separado 2 px. Vive aquí y no en un CSS global
 * porque solo lo usan estas dos capas.
 */
export const CLASE_T5 = "b5-t5";

/*
 * Las siluetas de la capa 2 (hoja 5 de Mai): lo marcado con `--b5-silueta`
 * pierde el texto y el fondo; cada renglón queda como una barra del largo de
 * sus palabras (un subrayado grueso subido sobre el texto transparente: no
 * cambia ningún alto). Las cápsulas, vacías, con contorno interior de 1 px y
 * sin color de lado. La opacidad de 0,3 la pone la pieza (MaquinaPegada).
 */
const SILUETAS = `
.${CLASE_T5} [style*="--b5-silueta"], .${CLASE_T5} [style*="--b5-silueta"] * {
  color: transparent !important; background-color: transparent !important;
  text-decoration-line: underline !important; text-decoration-style: solid !important;
  text-decoration-color: rgba(184,196,212,0.47) !important; text-decoration-thickness: 0.8em !important;
  text-underline-offset: -0.68em !important; text-decoration-skip-ink: none !important;
}
.${CLASE_T5} [style*="--b5-silueta"] [data-lado] { box-shadow: inset 0 0 0 1px #B8C4D4 !important; }
`;

export default function EstilosT5() {
  return (
    <style>{`.${CLASE_T5} button:focus-visible, .${CLASE_T5} [tabindex]:focus-visible { outline: 2px solid ${FAE.text}; outline-offset: 2px; }${SILUETAS}`}</style>
  );
}
