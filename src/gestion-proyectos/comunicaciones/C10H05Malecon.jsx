/*
 * C10 · H05 · El malecón de los cinco escenarios (gp26-pla-c10-h05-malecon, Fácil, 10 FP × %).
 * El malecón de Barranquilla, de izquierda a derecha, con cinco escenarios que
 * crecen: mesa de café para dos (Interpersonal) · mesa redonda (Pequeño
 * grupo) · tarima con atril (Pública) · torre de radio (Masiva) · celular
 * gigante (Redes). A 320 px el malecón se desplaza en horizontal DENTRO del
 * visual (disposición «aro»), con los cinco nombres siempre escritos. El
 * zorro camina al escenario solo después de acertar.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote5 } from "../comun/lote5.jsx";
import { GP_C10_H05 } from "./textos-c10.js";

export const ID = GP_C10_H05.id;

// imagen-pendiente: malecon · mesa-cafe-dos · tarima-atril · torre-radio (mesa-redonda y celular ya existen)
const MALECON = primero("malecon", "puente-nuevo");
const DOS = primero("mesa-cafe-dos", "taza-latte");
const REDONDA = primero("mesa-redonda");
const ATRIL = primero("tarima-atril", "foco-teatro");
const TORRE = primero("torre-radio", "dial-radio");
const CELULAR = primero("celular");

function Zorro(estado) {
  const nombre = estado.paso.destinos.find((d) => d.id === estado.encaja)?.nombre;
  return <p className="gp2-pista" data-zorro-en={estado.encaja ?? "camina"}>{estado.encaja ? `El zorro llegó a: ${nombre}. El escenario se llena.` : "Desliza el malecón y toca el escenario."}</p>;
}

export const ESCENA = {
  nombre: "malecon", fondo: ["#1d3b47", "#08141a"], acento: "#ffd166", luz: "rgba(255,209,102,.16)",
  portada: MALECON,
  mesa: "tu",
  objeto: { id: MALECON, alto: 64 },
  anim: "abre",
  disposicion: "aro",
  antes: () => <EstiloLote5 />,
  encima: (e) => <Zorro {...e} />,
  destinos: {
    interpersonal: { objeto: DOS, alto: 36 }, grupo: { objeto: REDONDA, alto: 42 }, publica: { objeto: ATRIL, alto: 48 },
    masiva: { objeto: TORRE, alto: 54 }, redes: { objeto: CELULAR, alto: 60 },
  },
};

export default function C10H05Malecon({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C10_H05} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
