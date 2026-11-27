/*
 * C07 · H06 · La polea del presupuesto (gp26-pla-c07-h06-polea, Difícil, 50 × 2 FP × %).
 * La polea de obra con gancho y cuerda, colgada de una viga, sube bloques de
 * madera con rótulo a una torre de niveles que se llena DE ABAJO HACIA ARRIBA
 * (el hueco 1 es el de abajo); los dos bloques delgados de reserva se meten
 * entre niveles. Etapa 2: el bloque activo se ilumina con sus datos y, al
 * acertar, se fija con su cifra; la torre muestra los ya calculados.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote4, miles } from "../comun/lote4.jsx";
import { GP_C7_H06 } from "./textos-c7.js";

export const ID = GP_C7_H06.id;

// imagen-pendiente: polea-obra (bloque-madera ya existe)
const POLEA = primero("polea-obra", "grua-torre", "grua");
const BLOQUE = primero("bloque-madera");

function Gancho({ puestas, bien, paso }) {
  return (
    <div className="gp-escenita" data-polea={puestas.length}>
      <span className="gp2-gira" style={{ display: "block", transform: `translateY(${bien ? -6 : 0}px)` }}><Objeto id={POLEA} alto={72} /></span>
      <small>{bien ? "Torre armada: del costo de cada actividad al presupuesto." : `${puestas.length} de ${paso.items.length} niveles enganchados`}</small>
    </div>
  );
}

function Torre({ paso, encaja, etapa }) {
  if (paso.tipo !== "casillas") return null;
  const hechos = (etapa?.hechos ?? []).filter((h) => h.paso.tipo === "casillas").map((h) => h.paso);
  const lista = encaja ? [...hechos, paso] : hechos;
  return (
    <div className="gp2-caja" style={{ marginTop: 10 }} data-torre={lista.length}>
      <b>La torre</b>
      <div style={{ display: "flex", flexDirection: "column-reverse", gap: 4 }}>
        {lista.map((p) => (
          <span key={p.id} className="gp2-fila gp2-entra" style={{ justifyContent: "space-between", flexWrap: "nowrap" }} data-bloque-fijo={p.id}>
            <span className="gp2-fila" style={{ flexWrap: "nowrap", gap: 6 }}><Objeto id={BLOQUE} alto={22} /><small>{p.bloque}</small></span>
            <span className="da26-mono">{miles(p.casillas[0].clave)}</span>
          </span>
        ))}
        {!encaja && <span className="gp-chip-c" data-bloque-activo>{paso.bloque}: {paso.texto}</span>}
      </div>
    </div>
  );
}

export const ESCENA = {
  nombre: "polea", fondo: ["#30291f", "#110e0a"], acento: "#e9c46a", luz: "rgba(233,196,106,.2)",
  portada: POLEA,
  mesa: "equipo",
  objetos: [POLEA],
  objetoTarjeta: BLOQUE,
  deAbajo: true,
  rotuloHueco: (k) => (k === 0 ? "Abajo: toca la base" : k === 6 ? "Arriba del todo" : "Toca el que sigue hacia arriba"),
  encimaOrden: (e) => <Gancho {...e} />,
  objeto: { id: POLEA, alto: 70 },
  anim: "cae",
  antes: () => <EstiloLote4 />,
  encima: (e) => <Torre {...e} />,
  etapas: [{}, { mesa: "patrocinadora" }],
};

export default function C07H06Polea({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C7_H06} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
