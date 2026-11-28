/*
 * C09 · H05 · ¿Cuántas manos hacen falta? (gp26-pla-c09-h05-sumadora, Difícil, 50 × 2 FP × %).
 * La sumadora de mesa con rollo de papel: cada caso sale impreso en la tira y
 * cuatro teclas (Ascendente · Análoga · Paramétrica · Alternativas) esperan;
 * al acertar, la tira imprime «✓ + técnica». Etapa 2: con los datos a la
 * vista, el estudiante escribe la cantidad y, SOLO después de comprobar, la
 * tira imprime la operación completa.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote5, Lamina } from "../comun/lote5.jsx";
import { GP_C9_H05 } from "./textos-c9.js";

export const ID = GP_C9_H05.id;

const SUMADORA = primero("sumadora");

function Tira(estado) {
  const { paso } = estado;
  if (paso.tipo !== "casillas" && !paso.texto) return null;
  const nombre = paso.destinos?.find((d) => d.id === estado.encaja)?.nombre;
  const linea = paso.tipo === "casillas" ? (estado.revelado ? paso.tira : "…") : estado.encaja ? `✓ ${nombre}` : "…";
  return (
    <Lamina titulo="La tira de la sumadora" data-tira={estado.revelado ? "impresa" : "espera"}>
      <p className="da26-mono" style={{ margin: 0, padding: "6px 8px", borderRadius: 8, background: "#fbf7ee", color: "#121418", fontSize: 15 }}>{linea}</p>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "sumadora", fondo: ["#2d2b33", "#0e0d11"], acento: "#a7bbff", luz: "rgba(167,187,255,.16)",
  portada: SUMADORA,
  mesa: "tu",
  objeto: { id: SUMADORA, alto: 72 },
  anim: "sella",
  antes: () => <EstiloLote5 />,
  encima: (e) => <Tira {...e} />,
};

export default function C09H05Sumadora({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C9_H05} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
