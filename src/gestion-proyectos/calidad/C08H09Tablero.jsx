/*
 * C08 · H09 · El tablero de herramientas (gp26-eje-c08-h09-tablero, Medio, 25 FP × %).
 * El tablero perforado de taller con doce siluetas colgadas, cada una con su
 * nombre (3 columnas de 4; toque-toque para colgar). El practicante trae las
 * preguntas. Acierto: la herramienta se descuelga y muestra un ejemplo en
 * miniatura con datos de la línea de cápsulas.
 */
import { ScatterChart, BarChart3, Fish, Workflow, Boxes, Table, ClipboardList, ListChecks, Percent, MessageSquare, GitCompare, Network } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote4 } from "../comun/lote4.jsx";
import { GP_C8_H09 } from "./textos-c8.js";

export const ID = GP_C8_H09.id;

// imagen-pendiente: tablero-herramientas
const TABLERO = primero("tablero-herramientas", "caja-herramientas");

/* El ejemplo en miniatura que muestra cada herramienta al descolgarse (datos de la línea, diseño §0). */
const EJEMPLO = {
  dispersion: "Humedad de la sala frente a sellos malos: suben juntos.",
  histograma: "Sello 11 · peso 8 · abollada 5 · tapa 3 · filtro 2 · fecha 1.",
  causa: "Seis espinas hacia «cápsulas mal selladas».",
  flujo: "Llenar → tapar → sellar → pesar → empacar.",
  afinidad: "40 notas en 6 familias.",
  matricial: "5 causas × 3 objetivos, con fuerza de relación.",
  hoja: "Día 4: sello ||, peso ||, abollada |…",
  lista: "Arranque: 12 de 12 pasos ✓.",
  muestreo: "De 5.000 cápsulas, una muestra cada hora.",
  encuesta: "Compradores: satisfacción de 1 a 5.",
  comparativo: "La otra planta: 1 defecto por cada 1.000.",
  sipoc: "Proveedor → café y lámina → sellado → cápsulas → supermercado.",
};

function Miniatura({ paso, encaja }) {
  if (!encaja) return null;
  return <p className="gp2-caja gp2-entra" style={{ marginTop: 10 }} data-miniatura={encaja}><b>Ejemplo en la línea</b>{EJEMPLO[encaja]}</p>;
}

export const ESCENA = {
  nombre: "tablero", fondo: ["#2d2a24", "#0f0e0b"], acento: "#e9c46a", luz: "rgba(233,196,106,.16)",
  portada: TABLERO,
  mesa: "practicante",
  objeto: { id: TABLERO, alto: 64 },
  anim: "abre",
  disposicion: "tablero",
  antes: () => <EstiloLote4 />,
  encima: (e) => <Miniatura {...e} />,
  destinos: {
    dispersion: { icono: ScatterChart }, histograma: { icono: BarChart3 }, causa: { icono: Fish }, flujo: { icono: Workflow },
    afinidad: { icono: Boxes }, matricial: { icono: Table }, hoja: { icono: ClipboardList }, lista: { icono: ListChecks },
    muestreo: { icono: Percent }, encuesta: { icono: MessageSquare }, comparativo: { icono: GitCompare }, sipoc: { icono: Network },
  },
};

export default function C08H09Tablero({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C8_H09} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
