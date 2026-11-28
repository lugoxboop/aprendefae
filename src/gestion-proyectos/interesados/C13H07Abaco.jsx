/*
 * C13 · H07 · El ábaco del involucramiento (gp26-pla-c13-h07-matriz-evaluacion, Difícil, 50 × 2 FP × %).
 * El ábaco de madera en horizontal: cinco varillas (cinco interesados) y cinco
 * columnas (Desconocedor · Reticente · Neutral · De apoyo · Líder, abreviadas
 * para que quepan a 320 px). En cada varilla, la cuenta C (clara) y la D
 * (oscura) se distinguen por LETRA, no solo por tono. Etapa 1: la cuenta C
 * aparece en su columna solo cuando el estudiante la pone bien. Etapa 2: el
 * hámster (Equipo) trae las cuentas D (dato del escenario); la brecha de cada
 * varilla va en «?» hasta que el estudiante la mide, y el orden de la
 * comunicación se arma con las brechas que él escribió.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote7, Lamina, Rejilla, colocados, resuelto } from "../comun/lote7.jsx";
import { GP_C13_H07, NIVELES_C13, PLANTA_C13 } from "./textos-c13.js";

export const ID = GP_C13_H07.id;

// imagen-pendiente: abaco
const ABACO = primero("abaco", "sumadora");

const FILAS = [
  { id: "familias", nombre: "Familias" }, { id: "duena", nombre: "Dueña" }, { id: "autoridad", nombre: "Autoridad" },
  { id: "alcaldia", nombre: "Alcaldía" }, { id: "jac", nombre: "JAC" },
];
const COLUMNAS = NIVELES_C13.map((n) => ({ id: n.id, nombre: n.corto.replace(".", "") }));

function Abaco({ c = {}, d = false, brechas = false }) {
  const celda = (f, col) => {
    const v = PLANTA_C13.abaco.find((x) => x.id === f);
    const marcas = [c[f] === col ? "C" : null, d && v.d === col ? "D" : null].filter(Boolean);
    return marcas.length ? marcas.join("·") : null;
  };
  return (
    <Lamina titulo="El ábaco · C hoy · D deseado" data-abaco className="gp4-lamina gp7-abaco">
      <Rejilla filas={FILAS} columnas={COLUMNAS} celda={celda} nombre="Matriz de evaluación del involucramiento" />
      {d && (
        <div className="gp5-chips" style={{ marginTop: 6 }} data-brechas={brechas ? "medidas" : "por-medir"}>
          {FILAS.map((f) => <span key={f.id} className="gp5-chip" data-brecha={f.id}>{f.nombre} · brecha {brechas ? PLANTA_C13.abaco.find((x) => x.id === f.id).brecha : "?"}</span>)}
        </div>
      )}
    </Lamina>
  );
}

/* Etapa 2: las cuentas C quedaron donde el estudiante las puso en la etapa 1. */
const C_TODAS = Object.fromEntries(PLANTA_C13.abaco.map((v) => [v.id, v.c]));

export const ESCENA = {
  nombre: "abaco", fondo: ["#33261a", "#100b07"], acento: "#e9c46a", luz: "rgba(233,196,106,.16)",
  portada: ABACO,
  mesa: "tu",
  objeto: { id: ABACO, alto: 56 },
  anim: "cae",
  disposicion: "palancas",
  antes: () => <EstiloLote7 />,
  encima: (e) => <Abaco c={Object.fromEntries(colocados(e).map((x) => [x.paso.varilla, x.destino]))} />,
  etapas: [{}, {
    mesa: "equipo",
    encima: (e) => <Abaco c={C_TODAS} d brechas={resuelto(e, "c13h07-11")} />,
    /* Ordenar no monta `antes`: la hoja va con la lámina. */
    encimaOrden: () => <><EstiloLote7 /><Abaco c={C_TODAS} d brechas /></>,
  }],
};

export default function C13H07Abaco({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C13_H07} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
