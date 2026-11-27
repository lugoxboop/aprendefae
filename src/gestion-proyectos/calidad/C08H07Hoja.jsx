/*
 * C08 · H07 · La hoja de anotaciones (gp26-moc-c08-h07-hoja, Medio, 25 × 2 FP × %).
 * La mesa de inspección con lámpara de brazo y, encima, la hoja de
 * verificación grande (filas: los 6 defectos; columnas Día 1 a Día 4 y
 * Total; días 1 a 3 ya llenos y plegables, para que a 320 px se vean Día 4 y
 * Total). Las cápsulas ruedan una a una con el defecto visible y escrito;
 * tocar una fila dibuja un palito en el Día 4. Etapa 2: el bloc cuadriculado
 * con las seis barras, que se ordenan de la más frecuente a la menos.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote4, Barras } from "../comun/lote4.jsx";
import { CAPSULAS_C8, GP_C8_H07 } from "./textos-c8.js";

export const ID = GP_C8_H07.id;

// imagen-pendiente: mesa-inspeccion · bandeja-capsulas · bloc-cuadriculado (memorando-clip ya existe)
const MESA = primero("mesa-inspeccion", "escritorio-madera");
const BANDEJA = primero("bandeja-capsulas", "bandeja-madera");
const BLOC = primero("bloc-cuadriculado", "libreta-anillada");
const HOJA = primero("memorando-clip");
const CORTO = { sello: "Sello", peso: "Peso", abollada: "Abol.", tapa: "Tapa", filtro: "Filtro", fecha: "Fecha" };
const palitos = (n) => (n ? "|".repeat(n) : "—");

function Hoja(estado) {
  const { paso } = estado;
  return (
    <div className="gp4-lamina" data-hoja>
      <b><span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}><Objeto id={HOJA} alto={20} /></span>Hoja de verificación · línea de cápsulas</b>
      <table className="da26-mono" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead><tr><th style={{ textAlign: "left" }}>Defecto</th><th>Día 4</th><th>Total</th></tr></thead>
        <tbody>
          {CAPSULAS_C8.defectos.map((d) => {
            const hoy = paso.totales ? d.dias[3] : cuantos(estado, d.id);
            return (
              <tr key={d.id} data-fila={d.id} style={{ borderTop: "1px solid rgba(244,245,247,.2)" }}>
                <td style={{ fontFamily: "var(--planck-font-sans, system-ui, sans-serif)", padding: "3px 0" }}>{d.nombre}</td>
                <td style={{ textAlign: "center" }} data-hoy={hoy}>{palitos(hoy)}</td>
                <td style={{ textAlign: "center" }}>{paso.totales && estado.encaja ? d.total : "?"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <details style={{ marginTop: 6 }}>
        <summary style={{ cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center" }}>Días 1 a 3 (ya anotados)</summary>
        <small className="da26-mono" style={{ display: "block" }}>{CAPSULAS_C8.defectos.map((d) => `${d.nombre}: ${d.dias.slice(0, 3).join(" · ")}`).join(" | ")}</small>
      </details>
    </div>
  );
}

function Bloc({ puestas, bien, paso }) {
  const orden = bien ? paso.items.map((x) => x.id) : puestas;
  const barras = orden.map((id) => { const d = CAPSULAS_C8.defectos.find((x) => x.id === id); return { id, valor: d.total, corto: CORTO[id] }; });
  return (
    <div className="gp4-lamina" data-bloc={orden.length}>
      <b><span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}><Objeto id={BLOC} alto={20} /></span>Histograma de causas · 30 defectos</b>
      {barras.length ? <Barras barras={barras} max={12} /> : <small>Toca los defectos en orden: las barras se dibujan aquí.</small>}
    </div>
  );
}

export const ESCENA = {
  nombre: "hoja", fondo: ["#2b2a26", "#0e0d0b"], acento: "#ffc978", luz: "rgba(255,201,120,.2)",
  portada: MESA,
  mesa: "equipo",
  objeto: { id: BANDEJA, alto: 56 },
  objetos: [BLOC],
  encimaOrden: (e) => <Bloc {...e} />,
  anim: "cae",
  disposicion: "rejilla",
  antes: () => <EstiloLote4 />,
  encima: (e) => <Hoja {...e} />,
  etapas: [{}, { mesa: "practicante", encima: null }],
};

export default function C08H07Hoja({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C8_H07} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
