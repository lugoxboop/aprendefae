import Llama from "../racha/Llama.jsx";

/*
 * Llama de la racha, en pequeño.
 *
 * Es fuego a propósito: Duolingo, Snapchat y media aplicación de hábitos usan
 * lo mismo, así que ya se entiende sin explicarlo.
 *
 * 25-nov (Mateo): deja de ser la llama facetada de tramos rectos —se leía como
 * una gema, la estética del plan piloto— y pasa a ser la llama redonda de
 * dibujo de racha/Llama.jsx, la misma del momento de racha y de la familia de
 * las mascotas. La API no cambia: tamano, encendida, brillo y colorApagado
 * (el gris del kit para el banner del Repaso sin racha).
 */
export default function IconoRacha({ tamano = 28, encendida = true, brillo = false, colorApagado = "rgba(248,249,250,0.32)" }) {
  return <Llama tamano={tamano} encendida={encendida} brillo={brillo} colorApagado={colorApagado} id="fae-llama" />;
}
