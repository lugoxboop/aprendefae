/*
 * C11 · H02 · El móvil de las fuentes (gp26-pla-c11-h02-movil, Fácil, 10 × 2 FP × %).
 * El móvil colgante de madera que cuelga del techo de la planta: la barra de
 * arriba «Nivel 0 · Todas las fuentes de riesgo» y cuatro brazos con ícono y
 * nombre (Técnico, De gestión, Comercial, Externo). El hámster (Equipo) cuelga
 * cada ficha; al acertar, la ficha queda colgada y el brazo cuenta una más;
 * al errar, cae y vuelve. Etapa 2: del brazo bajan tres brazos menores.
 */
import { ClipboardList, Cog, Globe, Handshake } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote6, Lamina } from "../comun/lote6.jsx";
import { GP_C11_H02, BRAZOS_C11 } from "./textos-c11.js";

export const ID = GP_C11_H02.id;

const MOVIL = primero("barra-movil");
const FICHA = primero("ficha-colgante", "ficha-madera");

function Brazos(estado) {
  if (estado.paso.destinos?.length !== 4) return null;
  return (
    <Lamina titulo="Nivel 0 · Todas las fuentes de riesgo" data-brazos={BRAZOS_C11.map((b) => cuantos(estado, b.id)).join("-")}>
      <div className="gp5-chips">
        {BRAZOS_C11.map((b) => <span key={b.id} className="gp5-chip" data-on={cuantos(estado, b.id) ? "1" : undefined}>{b.nombre}: {cuantos(estado, b.id)}</span>)}
      </div>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "movil", fondo: ["#2f2416", "#0f0b07"], acento: "#d4a373", luz: "rgba(212,163,115,.18)",
  portada: MOVIL,
  mesa: "equipo",
  objeto: { id: MOVIL, alto: 80, lugar: "detras" },
  anim: "cae",
  disposicion: "rejilla",
  antes: () => <EstiloLote6 />,
  encima: (e) => <Brazos {...e} />,
  destinos: {
    tecnico: { icono: Cog, objeto: FICHA, alto: 28 },
    gestion: { icono: ClipboardList, objeto: FICHA, alto: 28 },
    comercial: { icono: Handshake, objeto: FICHA, alto: 28 },
    externo: { icono: Globe, objeto: FICHA, alto: 28 },
  },
  etapas: [{}, { disposicion: "columna", destinos: { "*": { objeto: FICHA, alto: 24 } } }],
};

export default function C11H02Movil({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C11_H02} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
