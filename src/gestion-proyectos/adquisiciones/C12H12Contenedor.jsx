/*
 * C12 · H12 · La ruta del contenedor (gp26-pla-c12-h12-taller, Difícil, 50 × 3 FP × %).
 * El barco portacontenedores sobre un mar sereno, con diez boyas numeradas
 * hasta la grúa del puerto. Etapa 1: los diez pasos se ordenan en la lista;
 * las boyas se encienden al comprobar (no antes: encenderlas una a una diría
 * cuáles van bien). Etapa 2: los dos carriles del muelle (Tú y el equipo ·
 * Compras y Legal). Etapa 3: la línea de tiempo de 18 meses; al elegir, el
 * barco zarpa y se ve en qué mes llega frente a la obra (mes 9).
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote6, Lamina, Boyas, BarraH } from "../comun/lote6.jsx";
import { GP_C12_H12, TOSTADORA_C12 } from "./textos-c12.js";

export const ID = GP_C12_H12.id;

// imagen-pendiente: portacontenedores · boya · grua-puerto · contenedor (grua de Macro ya existe)
const BARCO = primero("portacontenedores", "grua");
const P = TOSTADORA_C12.plazo;

function Linea(estado) {
  /* El barco zarpa con lo que se eligió (también si no fue lo mejor): la retro dice el mes. */
  if (estado.paso.id !== "c12h12-21" || !estado.ultimo) return null;
  const elegido = P.llegadas[estado.encaja ?? estado.ultimo];
  return (
    <Lamina titulo="La línea de tiempo · 18 meses" data-linea={elegido}>
      <div className="gp5-barras">
        <BarraH nombre="La obra termina" valor={P.obra} max={18} texto={`mes ${P.obra}`} color="#a7d8ff" />
        <BarraH nombre="Llega la tostadora" valor={elegido} max={18} texto={`mes ${elegido}`} marca={P.obra} />
      </div>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "contenedor", fondo: ["#1b3346", "#07111a"], acento: "#ffd166", luz: "rgba(255,209,102,.16)",
  portada: BARCO,
  mesa: "tu",
  objeto: { id: BARCO, alto: 64 },
  anim: "abre",
  antes: () => <EstiloLote6 />,
  encima: (e) => <Linea {...e} />,
  etapas: [
    { objetos: [BARCO].filter(Boolean), encimaOrden: ({ bien }) => <><EstiloLote6 /><Boyas n={10} encendidas={bien ? 10 : 0} /></> },
    { mesa: "equipo" },
    { disposicion: "columna" },
  ],
};

export default function C12H12Contenedor({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C12_H12} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
