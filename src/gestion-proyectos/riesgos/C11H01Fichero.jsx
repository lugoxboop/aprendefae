/*
 * C11 · H01 · El fichero del plan (gp26-pla-c11-h01-fichero, Medio, 25 × 2 FP × %).
 * El fichero giratorio de tarjetas (rolodex) de latón y madera; arriba, las
 * seis pestañas de las seis tarjetas sorteadas (2 filas de 3 a 320 px). El
 * perro (PMO) entrega cada tarjeta; al acertar, la tarjeta entra en su
 * pestaña con ✓ y la pestaña se marca; al errar, rebota. Etapa 2: el fichero
 * cerrado queda de fondo y llegan las cuatro microdecisiones.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { colocados } from "../comun/lote2.jsx";
import { EstiloLote6 } from "../comun/lote6.jsx";
import { GP_C11_H01 } from "./textos-c11.js";

export const ID = GP_C11_H01.id;

// imagen-pendiente: rolodex · tarjeta-rolodex (ficha-fichero ya existe)
const FICHERO = primero("rolodex", "ficha-fichero", "archivador-cajones");
const TARJETA = primero("tarjeta-rolodex", "ficha-fichero");

function Pestanas(estado) {
  if (!estado.paso.texto) return null;
  const puestas = new Set(colocados(estado).map((x) => x.destino));
  return (
    <div className="gp5-chips" style={{ marginTop: 8 }} data-pestanas={puestas.size}>
      {(estado.paso.destinos ?? []).map((d) => <span key={d.id} className="gp5-chip" data-on={puestas.has(d.id) ? "1" : undefined}>{puestas.has(d.id) ? "✓ " : ""}{d.nombre}</span>)}
    </div>
  );
}

export const ESCENA = {
  nombre: "fichero", fondo: ["#3a2a17", "#120c06"], acento: "#e9c46a", luz: "rgba(233,196,106,.18)",
  portada: FICHERO,
  mesa: "pmo",
  objeto: { id: FICHERO, alto: 72 },
  anim: "abre",
  disposicion: "tablero",
  antes: () => <EstiloLote6 />,
  encima: (e) => <Pestanas {...e} />,
  destinos: { "*": { objeto: TARJETA, alto: 26 } },
  etapas: [{}, { mesa: "tu", disposicion: "columna", destinos: {}, objeto: { id: FICHERO, alto: 64, lugar: "detras" } }],
};

export default function C11H01Fichero({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C11_H01} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
