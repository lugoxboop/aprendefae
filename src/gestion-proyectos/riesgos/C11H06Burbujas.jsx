/*
 * C11 · H06 · Las burbujas del tanque (gp26-pla-c11-h06-burbujas, Medio, 25 × 2 FP × %).
 * El tanque de fermentación de acero con su gran ventana de vidrio; dentro
 * flotan las burbujas rotuladas con los parámetros de la partida. Al acertar,
 * la burbuja sube con ✓. Etapa 2: la ventana se vuelve la gráfica de burbujas
 * (x detectabilidad, y proximidad; tamaño = impacto): cada burbuja ubicada se
 * pinta con su letra y su tamaño; la del turno no se pinta hasta comprobar.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote6, Lamina, Rejilla } from "../comun/lote6.jsx";
import { GP_C11_H06, BURBUJAS_C11 } from "./textos-c11.js";

export const ID = GP_C11_H06.id;

// imagen-pendiente: tanque-fermentacion (burbujas: interfaz)
const TANQUE = primero("tanque-fermentacion", "tanque-beneficio");
const NIV = [{ id: "alta", nombre: "Alta" }, { id: "media", nombre: "Media" }, { id: "baja", nombre: "Baja" }];
const TAM = { pequena: "·", mediana: "●", grande: "⬤" };

function Ventana(estado) {
  if (!estado.paso.burbuja) return null;
  const hechas = (estado.etapa?.hechos ?? []).map((h) => h.paso.burbuja).filter(Boolean);
  if (estado.revelado) hechas.push(estado.paso.burbuja);
  const celda = (prox, det) => {
    const bs = BURBUJAS_C11.filter((b) => hechas.includes(b.id) && b.prox === prox && b.det === det);
    return bs.length ? bs.map((b) => `${TAM[b.tam]} ${b.id.toUpperCase()}`).join(" ") : null;
  };
  return (
    <Lamina titulo="La ventana del tanque · y proximidad, x detectabilidad" data-ventana={hechas.length}>
      <Rejilla nombre="burbujas" filas={NIV} columnas={[...NIV].reverse()} celda={celda} />
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "tanque", fondo: ["#1f3340", "#091117"], acento: "#a8dadc", luz: "rgba(168,218,220,.18)",
  portada: TANQUE,
  mesa: "patrocinadora",
  objeto: { id: TANQUE, alto: 80, lugar: "detras" },
  anim: "abre",
  disposicion: "tablero",
  antes: () => <EstiloLote6 />,
  encima: (e) => <Ventana {...e} />,
  etapas: [{}, { mesa: "tu", disposicion: "columna" }],
};

export default function C11H06Burbujas({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C11_H06} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
