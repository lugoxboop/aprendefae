/*
 * C13 · H04 · El patio de la escuela (gp26-ini-c13-h04-poder-interes, Medio, 25 × 2 FP × %).
 * El patio de cemento de la escuela veredal visto desde arriba, con la
 * cuadrícula 2 × 2 pintada en el piso: eje vertical Poder (autoridad), eje
 * horizontal Interés (inquietud por los resultados). Las fichas son piedras
 * de río pintadas; la panda (Patrocinadora) sostiene el balde de pintura. La
 * piedra aparece en la cuadrícula SOLO cuando cae en su cuadrante. En la
 * etapa 2, la cuadrícula ya pintada por el estudiante sirve para priorizar.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote7, Lamina, Rejilla, colocados } from "../comun/lote7.jsx";
import { GP_C13_H04, FICHAS_C13 } from "./textos-c13.js";

export const ID = GP_C13_H04.id;

// imagen-pendiente: patio-cuadricula · balde-pintura (piedra ya existe)
const PATIO = primero("patio-cuadricula", "baldosa");
const PIEDRA = primero("piedra");
const BALDE = primero("balde-pintura", "rodillo-pintura");

const FILAS = [{ id: "alto", nombre: "Poder alto" }, { id: "bajo", nombre: "Poder bajo" }];
const COLUMNAS = [{ id: "bajo", nombre: "Interés bajo" }, { id: "alto", nombre: "Interés alto" }];
const nombreFicha = (id) => FICHAS_C13.find((f) => f.id === id)?.nombre ?? id;

function Cuadricula({ puestas }) {
  const celda = (f, c) => {
    const en = puestas.filter((x) => x.destino === `${f}-${c}`).map((x) => nombreFicha(x.paso.ficha));
    return en.length ? en.join(" · ") : null;
  };
  return (
    <Lamina titulo="El patio · Poder ↑ · Interés →">
      <Rejilla filas={FILAS} columnas={COLUMNAS} celda={celda} nombre="Cuadrícula de poder e interés" />
    </Lamina>
  );
}

/* Etapa 2: la cuadrícula que el estudiante ya pintó (todas las piedras en su cuadrante). */
const PINTADA = GP_C13_H04.etapas[0].banco.map((x) => ({ destino: x.clave, paso: x }));

export const ESCENA = {
  nombre: "patio", fondo: ["#2f3236", "#0e0f11"], acento: "#ffd166", luz: "rgba(255,209,102,.14)",
  portada: PATIO,
  mesa: "patrocinadora",
  objeto: { id: PIEDRA, alto: 48 },
  objetos: [BALDE],
  anim: "cae",
  antes: () => <EstiloLote7 />,
  encima: (e) => <Cuadricula puestas={colocados(e)} />,
  etapas: [{}, { encima: () => <Cuadricula puestas={PINTADA} />, objeto: { id: BALDE, alto: 56 } }],
};

export default function C13H04Patio({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C13_H04} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
