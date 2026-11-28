/*
 * C09 · H03 · La matriz RACI de la tarima (gp26-pla-c09-h03-raci, Difícil, 50 × 2 FP × %).
 * El tablero magnético de pared con la cuadrícula de 4 filas × 5 columnas; a
 * la izquierda de cada fila, la nota adhesiva (la tarjeta del paso). Cada fila
 * se llena con las fichas R · A · C · I (o vacía); las filas ya resueltas
 * quedan en el tablero y la del turno se ve con «?» (nunca su clave antes de
 * comprobar). A 320 px la fila va como tarjeta de 5 celdas (diseño H03).
 * Etapa 2: las cuatro filas del practicante, cada una con su corrección.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote5, Lamina } from "../comun/lote5.jsx";
import { GP_C9_H03, RACI_COLUMNAS } from "./textos-c9.js";

export const ID = GP_C9_H03.id;

// imagen-pendiente: tablero-magnetico · ficha-iman · nota-adhesiva
const TABLERO = primero("tablero-magnetico", "tablero-corcho");
const NOTA = primero("nota-adhesiva", "ficha-fichero");
const CORTO = { tu: "Tú", patrocinadora: "Patro.", gerente: "Gerente", logistica: "Logíst.", sonido: "Sonido" };
const FILAS = GP_C9_H03.etapas[0].pasos;

function Tablero(estado) {
  if (estado.paso.tipo !== "casillas") return null;
  const hechas = new Set((estado.etapa?.hechos ?? []).map((h) => h.paso.id));
  if (estado.revelado) hechas.add(estado.paso.id);
  return (
    <Lamina titulo="Tablero RACI · tarima" data-raci={hechas.size}>
      <table className="gp5-tabla">
        <thead><tr><th style={{ width: "26%" }}>Tarea</th>{RACI_COLUMNAS.map((c) => <th key={c.id}>{CORTO[c.id]}</th>)}</tr></thead>
        <tbody>
          {FILAS.map((f) => {
            const lista = hechas.has(f.id);
            const actual = f.id === estado.paso.id;
            return (
              <tr key={f.id} data-fila-raci={f.id} data-actual={actual ? "1" : undefined}>
                <td>{f.actividad}</td>
                {RACI_COLUMNAS.map((c) => <td key={c.id} className="gp5-mono" data-celda={`${f.id}-${c.id}`}>{lista ? (f.raci[c.id] ?? "·") : actual ? "?" : ""}</td>)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "raci", fondo: ["#2b3138", "#0d0f12"], acento: "#ffc978", luz: "rgba(255,201,120,.14)",
  portada: TABLERO,
  mesa: "tu",
  objeto: { id: NOTA, alto: 44 },
  anim: "sella",
  antes: () => <EstiloLote5 />,
  encima: (e) => <Tablero {...e} />,
  etapas: [{}, { mesa: "practicante", objeto: { id: TABLERO, alto: 64 }, disposicion: "rejilla" }],
};

export default function C09H03Raci({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C9_H03} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
