/*
 * C10 · H08 · El tablero de salidas (gp26-pla-c10-h08-tablero, Difícil, 50 × 2 FP × %).
 * El tablero de salidas de la terminal de buses de Manizales, de letras que
 * giran, con una fila por interesado (Patrocinadora · Equipo · Cliente ·
 * Prensa de la costa). La ficha de la fila del turno se llena abajo (método,
 * frecuencia, quién comunica, quién autoriza lo confidencial); al
 * completarla, las letras giran y la fila queda con ✓ «a tiempo». Las filas
 * pendientes no adelantan nada. Etapa 2: el panel «Contenido del plan» y el
 * buzón lateral.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { colocados } from "../comun/lote2.jsx";
import { EstiloLote5, Lamina } from "../comun/lote5.jsx";
import { GP_C10_H08, SALIDAS_C10 } from "./textos-c10.js";

export const ID = GP_C10_H08.id;

// imagen-pendiente: buzon (pantalla-salidas ya existe)
const TABLERO = primero("pantalla-salidas");
const BUZON = primero("buzon", "sobre-carta");
const NOMBRE = { push: "Push", pull: "Pull", interactiva: "Interactiva", diaria: "Diaria", semanal: "Semanal", mensual: "Mensual", una: "Una vez" };

function Salidas(estado) {
  if (estado.paso.tipo !== "casillas") return null;
  const hechas = new Set((estado.etapa?.hechos ?? []).map((h) => h.paso.id));
  if (estado.revelado) hechas.add(estado.paso.id);
  return (
    <Lamina titulo="Salidas · plan de comunicaciones" data-salidas={hechas.size}>
      <table className="gp5-tabla">
        <thead><tr><th style={{ width: "38%" }}>Interesado</th><th>Método</th><th>Frec.</th><th>Estado</th></tr></thead>
        <tbody>
          {SALIDAS_C10.map((s) => {
            const lista = hechas.has(s.id);
            return (
              <tr key={s.id} data-salida={s.id} data-actual={s.id === estado.paso.id ? "1" : undefined}>
                <td>{s.interesado}</td>
                <td className="gp5-mono">{lista ? NOMBRE[s.clave.metodo] : "—"}</td>
                <td className="gp5-mono">{lista ? NOMBRE[s.clave.frecuencia] : "—"}</td>
                <td>{lista ? "✓ a tiempo" : s.id === estado.paso.id ? "abordando" : "en espera"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Lamina>
  );
}

function Panel(estado) {
  if (estado.paso.tipo === "casillas" || !estado.paso.texto) return null;
  const puestas = colocados(estado);
  const van = puestas.filter((x) => x.destino === "si");
  return (
    <Lamina titulo={`Contenido del plan · ${van.length} pegadas · buzón ${puestas.length - van.length}`} data-panel={`${van.length}-${puestas.length - van.length}`}>
      {van.length ? van.map((x) => <small key={x.id} style={{ display: "block" }}>✓ {x.texto}</small>) : <small>El panel está vacío.</small>}
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "salidas", fondo: ["#1b1f2a", "#08090d"], acento: "#ffd166", luz: "rgba(255,209,102,.16)",
  portada: TABLERO,
  mesa: "tu",
  objeto: { id: TABLERO, alto: 56 },
  anim: "abre",
  antes: () => <EstiloLote5 />,
  encima: (e) => <><Salidas {...e} /><Panel {...e} /></>,
  etapas: [{}, { destinos: { no: { objeto: BUZON, alto: 30 } } }],
};

export default function C10H08Tablero({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C10_H08} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
