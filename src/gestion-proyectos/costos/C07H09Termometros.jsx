/*
 * C07 · H09 · Dos termómetros (gp26-moc-c07-h09-termometros, Difícil, 50 × 2 FP × %).
 * Dos termómetros de pared grandes, CPI y SPI, con la marca en 1,0 («en el
 * plan»), ▲ «mejor que el plan» arriba y ▼ «peor que el plan» abajo (forma y
 * texto, no solo color). Al escribir el valor, la columna sube o baja hasta
 * él. Etapa 2: los termómetros se acuestan y forman los ejes del tablero
 * 2 × 2; cada obra es una tarjeta con PV / EV / AC.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { colocados } from "../comun/lote2.jsx";
import { EstiloLote4, Termometro, numeroDeTexto } from "../comun/lote4.jsx";
import { GP_C7_H09 } from "./textos-c7.js";

export const ID = GP_C7_H09.id;

// imagen-pendiente: termometro-pared
const TERMOMETRO = primero("termometro-pared", "termometro-vidrio");

function Pared({ paso, encaja, valores, etapa }) {
  if (paso.tipo === "casillas" || paso.id === "c7h09-lee") {
    const hechos = (etapa?.hechos ?? []).map((h) => h.paso).filter((p) => p.indice);
    const de = (i) => {
      if (hechos.some((p) => p.indice === i) || (encaja && paso.indice === i)) return i === "cpi" ? 0.8 : 0.75;
      if (paso.indice === i) return numeroDeTexto(valores?.[i]);
      return null;
    };
    return (
      <div className="gp2-fila" style={{ justifyContent: "space-around", marginTop: 10 }} data-termometros>
        <Termometro nombre="CPI" valor={de("cpi")} />
        <Termometro nombre="SPI" valor={de("spi")} />
      </div>
    );
  }
  const n = colocados({ paso, encaja, etapa }).length;
  return (
    <div className="gp4-ejes" data-tablero-2x2={n}>
      <span>↔ SPI: atrasada · adelantada</span><span>↕ CPI</span>
    </div>
  );
}

export const ESCENA = {
  nombre: "termometros", fondo: ["#2b2630", "#0e0c11"], acento: "#ffb4a2", luz: "rgba(255,180,162,.16)",
  portada: TERMOMETRO,
  mesa: "pmo",
  objeto: { id: TERMOMETRO, alto: 72 },
  anim: "cae",
  antes: () => <EstiloLote4 />,
  encima: (e) => <Pared {...e} />,
  etapas: [{}, { disposicion: "cuadrantes", objeto: { id: TERMOMETRO, alto: 48 } }],
};

export default function C07H09Termometros({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C7_H09} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
