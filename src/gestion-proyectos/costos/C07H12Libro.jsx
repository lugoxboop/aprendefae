/*
 * C07 · H12 · El libro de costos del practicante (gp26-moc-c07-h12-libro, Difícil, 50 FP × %).
 * El libro de contabilidad de tapas duras abierto a doble página; el texto es
 * HTML encima (motor Memorando, con el membrete y el papel de esta pieza). El
 * practicante espera a un lado y la PMO al otro. Frase con error tocada: se
 * tacha y aparecen tres correcciones; la buena se escribe a mano. Frase
 * correcta tocada: se subraya en gris con su retro y cuenta en contra.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { GP_C7_H12 } from "./textos-c7.js";

export const ID = GP_C7_H12.id;

// imagen-pendiente: libro-contable (el motor usa ese papel en cuanto exista; mientras, el memorando)
const LIBRO = primero("libro-contable", "bitacora");

export const ESCENA = {
  nombre: "libro", fondo: ["#2e2418", "#100c07"], acento: "#e9c46a",
  portada: LIBRO,
};

export default function C07H12Libro({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C7_H12} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
