/*
 * C12 · H08 · La conferencia de oferentes (gp26-eje-c12-h08-conferencia, Medio, 25 FP × %).
 * La mesa larga de conferencias con tres placas (Proveedor A, B y C),
 * micrófonos de mesa y la cabecera de Compras (su voz en globo); el zorro a su
 * lado. Sobre cada placa, una lámpara: si una decisión favorece a un oferente,
 * SOLO su lámpara se enciende con el texto «trato desigual» (forma + texto, no
 * solo color), y Compras la objeta con la retro. Al final, la panda firma el
 * visto bueno de la alta dirección.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote6, Lamina } from "../comun/lote6.jsx";
import { GP_C12_H08 } from "./textos-c12.js";

export const ID = GP_C12_H08.id;

// imagen-pendiente: mesa-conferencias · placa-mesa · microfono-mesa · lampara-mesa
const MESA = primero("mesa-conferencias", "mesa-redonda");

function Lamparas(estado) {
  if (!estado.paso.texto) return null;
  const favorecido = estado.paso.favorece?.[estado.ultimo] ?? null;
  return (
    <Lamina titulo="La mesa · lámparas de los oferentes" data-lamparas={favorecido ?? "apagadas"}>
      <div className="gp5-chips">
        {["a", "b", "c"].map((k) => (
          <span key={k} className="gp5-chip" data-on={favorecido === k ? "1" : undefined} data-lampara={k}>
            Proveedor {k.toUpperCase()}{favorecido === k ? " · ✹ trato desigual" : " · apagada"}
          </span>
        ))}
      </div>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "conferencia", fondo: ["#232a33", "#0a0c0f"], acento: "#a7bbff", luz: "rgba(167,187,255,.16)",
  portada: MESA,
  mesa: "tu",
  objeto: { id: MESA, alto: 64 },
  anim: "abre",
  disposicion: "columna",
  antes: () => <EstiloLote6 />,
  encima: (e) => <Lamparas {...e} />,
};

export default function C12H08Conferencia({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C12_H08} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
