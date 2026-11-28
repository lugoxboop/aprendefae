/*
 * C12 · H07 · El marcador de las propuestas (gp26-eje-c12-h07-puntajes, Difícil, 50 × 2 FP × %).
 * El marcador de madera de estadio antiguo, con filas A, B y C y columnas de
 * criterios; las notas son placas numeradas colgadas. La placa del total de
 * cada proveedor se cuelga solo después de calcularla (antes, «?»). Etapa 2:
 * el bombillo de la fila tocada; al responder si B gana por más o por menos,
 * los totales con los pesos nuevos se reacomodan (DESPUÉS de responder).
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote6, Lamina, miles } from "../comun/lote6.jsx";
import { GP_C12_H07, TOSTADORA_C12 } from "./textos-c12.js";

export const ID = GP_C12_H07.id;

// imagen-pendiente: marcador-estadio · bombillo · campanilla
const MARCADOR = primero("marcador-estadio", "letrero-luminoso", "pantalla-salidas");
const T = TOSTADORA_C12;
const total = (v) => miles(v, 2).replace(/0$/, "");

function Marcador(estado) {
  const hechos = new Set([...(estado.etapa?.hechos ?? []).map((h) => h.paso.id), ...(estado.revelado ? [estado.paso.id] : [])]);
  const enE2 = estado.paso.id?.startsWith("c12h07-") && !["c12h07-a", "c12h07-b", "c12h07-c", "c12h07-orden"].includes(estado.paso.id);
  const nuevos = enE2 && hechos.has("c12h07-pesos");
  return (
    <Lamina titulo={nuevos ? "El marcador · pesos nuevos (técnica 35 %, costo 30 %)" : "El marcador · nota de 1 a 10 y peso"} data-marcador={hechos.size}>
      <table className="gp5-tabla">
        <thead><tr><th style={{ width: "38%" }}>Criterio</th><th>Peso</th><th>A</th><th>B</th><th>C</th></tr></thead>
        <tbody>
          {T.criterios.map((c) => (
            <tr key={c.id}><td>{c.nombre}</td><td className="gp5-mono">{Math.round((nuevos ? c.pesoNuevo : c.peso) * 100)} %</td>
              {["a", "b", "c"].map((k) => <td key={k} className="gp5-mono">{c.notas[k]}</td>)}</tr>
          ))}
          <tr data-totales>
            <td><b style={{ display: "inline", textTransform: "none", letterSpacing: 0 }}>Ponderado</b></td><td />
            {["a", "b", "c"].map((k) => (
              <td key={k} className="gp5-mono" data-total={k}>
                {nuevos ? total(T.totalesNuevos[k]) : enE2 || hechos.has(`c12h07-${k}`) ? total(T.totales[k]) : "?"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "marcador", fondo: ["#2a2f22", "#0c0e09"], acento: "#e9c46a", luz: "rgba(233,196,106,.16)",
  portada: MARCADOR,
  mesa: "tu",
  objeto: { id: MARCADOR, alto: 56 },
  anim: "abre",
  disposicion: "fila3",
  antes: () => <EstiloLote6 />,
  encima: (e) => <Marcador {...e} />,
  etapas: [{ objetos: [MARCADOR].filter(Boolean), encimaOrden: () => <Marcador paso={{ id: "c12h07-orden" }} etapa={{ hechos: ["a", "b", "c"].map((k) => ({ paso: { id: `c12h07-${k}` } })) }} /> }, { mesa: "patrocinadora" }],
};

export default function C12H07Marcador({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C12_H07} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
