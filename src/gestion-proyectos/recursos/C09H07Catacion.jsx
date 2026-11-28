/*
 * C09 · H07 · La hoja de catación de candidatos (gp26-eje-c09-h07-catacion, Difícil, 50 × 2 FP × %).
 * La hoja de catación de café convertida en matriz de decisión: filas =
 * criterios con su peso, columnas = A · interno, B · agencia, C ·
 * independiente, con su nota en cada celda. El estudiante escribe el total de
 * cada columna; los totales aparecen en la hoja solo cuando ya los calculó, y
 * los vasos de cata se llenan hasta cada puntaje solo después de elegir al
 * ganador (antes, la altura daría la respuesta). En el «predecir y revelar»,
 * la hoja muestra los pesos nuevos y los totales nuevos llegan al responder.
 * A 320 px la hoja va en cuatro columnas cortas (diseño: una por candidato).
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { BarraH, EstiloLote5, Lamina, resuelto } from "../comun/lote5.jsx";
import { FESTIVAL_C9, GP_C9_H07 } from "./textos-c9.js";

export const ID = GP_C9_H07.id;

// imagen-pendiente: hoja-catacion · vaso-cata · apreton-manos · videollamada · casco-obra (sobre-carta y casco-electricista ya existen)
const HOJA = primero("hoja-catacion", "portapapeles");
const SOBRE = primero("sobre-carta");
const VIDEO = primero("videollamada", "celular");
const CASCO = primero("casco-obra", "casco-electricista");
const MANOS = primero("apreton-manos", "puerta-oficina");
const pct = (v) => `${Math.round(v * 100)} %`;
const coma = (v) => v.toFixed(2).replace(".", ",");

function Hoja(estado) {
  const { paso } = estado;
  if (!paso.hoja) return null;
  const nuevos = paso.hoja === "pesos";
  const totales = resuelto(estado, "c9h07-01") || paso.hoja !== "totales";
  const vasos = resuelto(estado, "c9h07-02");
  const revelaNuevos = nuevos && estado.revelado;
  const T = revelaNuevos ? FESTIVAL_C9.totalesNuevos : FESTIVAL_C9.totales;
  return (
    <Lamina titulo="Hoja de catación · responsable de sonido" data-hoja-catacion={revelaNuevos ? "nuevos" : totales ? "totales" : "notas"}>
      <table className="gp5-tabla">
        <thead><tr><th style={{ width: "40%" }}>Criterio (peso)</th><th>A · int.</th><th>B · ag.</th><th>C · ind.</th></tr></thead>
        <tbody>
          {FESTIVAL_C9.criterios.map((c) => (
            <tr key={c.id}>
              <td>{c.nombre} ({nuevos ? `${pct(c.peso)} → ${pct(c.pesoNuevo)}` : pct(c.peso)})</td>
              {["a", "b", "c"].map((k) => <td key={k} className="gp5-mono">{c.notas[k]}</td>)}
            </tr>
          ))}
          <tr data-fila-total>
            <td><b>Total ponderado</b></td>
            {["a", "b", "c"].map((k) => <td key={k} className="gp5-mono" data-total={k}>{totales && (!nuevos || revelaNuevos) ? coma(T[k]) : "?"}</td>)}
          </tr>
        </tbody>
      </table>
      {vasos && (!nuevos || revelaNuevos) && (
        <div className="gp5-barras" style={{ marginTop: 8 }} data-vasos>
          {["a", "b", "c"].map((k) => <BarraH key={k} nombre={`Vaso ${k.toUpperCase()}`} valor={T[k]} max={5} texto={coma(T[k])} color="#c08552" />)}
        </div>
      )}
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "catacion", fondo: ["#33291f", "#110d09"], acento: "#e9c46a", luz: "rgba(233,196,106,.16)",
  portada: HOJA,
  mesa: "gerente",
  objeto: { id: HOJA, alto: 56 },
  anim: "sella",
  antes: () => <EstiloLote5 />,
  encima: (e) => <Hoja {...e} />,
  etapas: [{ disposicion: "fila3" }, {
    mesa: "tu",
    destinos: { negociar: { objeto: MANOS, alto: 36 }, preasignacion: { objeto: SOBRE, alto: 36 }, virtual: { objeto: VIDEO, alto: 36 }, alternativo: { objeto: CASCO, alto: 36 } },
  }],
};

export default function C09H07Catacion({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C9_H07} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
