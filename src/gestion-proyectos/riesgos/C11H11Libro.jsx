/*
 * C11 · H11 · La fila del registro (gp26-pla-c11-h11-libro, Difícil, 50 × 2 FP × %).
 * El libro de registro de cuero, abierto, con sus columnas: es el registro de
 * riesgos. La fila R-07 trae el enunciado escrito; cada pieza acertada se
 * escribe a mano en su casilla (las demás en «—»); al completar, el gato
 * firma como dueño. Etapa 2: la página siguiente con A, B y C y la franja de
 * cálculo; cada cifra aparece solo después de calcularla.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { colocados } from "../comun/lote2.jsx";
import { EstiloLote6, Lamina } from "../comun/lote6.jsx";
import { GP_C11_H11, AMPLIACION_C11, COLUMNAS_C11, cifra } from "./textos-c11.js";

export const ID = GP_C11_H11.id;

// imagen-pendiente: libro-registro (bitacora ya existe)
const LIBRO = primero("libro-registro", "bitacora");
const ENUNCIADO = "Debido a que el tambor viaja por barco, podría demorarse en el puerto, y el arranque quedaría después de la cosecha.";

function Fila(estado) {
  if (!estado.paso.texto || estado.paso.tipo === "casillas") return null;
  const puestas = colocados(estado);
  const firmada = puestas.filter((x) => x.destino !== "nova").length === 7;
  return (
    <Lamina titulo="Registro de riesgos · fila R-07" data-fila={puestas.length}>
      <small style={{ display: "block", marginBottom: 4 }}>{ENUNCIADO}</small>
      {COLUMNAS_C11.filter((c) => c.id !== "nova").map((c) => {
        const x = puestas.find((p) => p.destino === c.id);
        return <small key={c.id} style={{ display: "block" }} data-columna={c.id}><b style={{ display: "inline", textTransform: "none", letterSpacing: 0 }}>{c.nombre}:</b> {x ? x.texto.replace(/^«|»$/g, "") : "—"}</small>;
      })}
      {firmada && <small style={{ display: "block", marginTop: 4 }} data-firma>✓ Firmado por el dueño</small>}
    </Lamina>
  );
}

function Pagina(estado) {
  if (estado.paso.tipo !== "casillas" && estado.paso.id !== "c11h11-elige") return null;
  const hechos = new Set([...(estado.etapa?.hechos ?? []).map((h) => h.paso.id), ...(estado.revelado && estado.paso.tipo === "casillas" ? [estado.paso.id] : [])]);
  const B = AMPLIACION_C11.barco;
  return (
    <Lamina titulo="Página siguiente · costo-beneficio" data-pagina={hechos.size}>
      <small style={{ display: "block", marginBottom: 4 }}>Sin respuesta: probabilidad {Math.round(B.p * 100)} %, impacto {cifra(B.impacto)} → VME {cifra(B.vme)}.</small>
      <table className="gp5-tabla">
        <thead><tr><th>Opción</th><th>Costo</th><th>VME después</th><th>Rentab.</th></tr></thead>
        <tbody>
          {AMPLIACION_C11.opciones.map((o) => (
            <tr key={o.id} data-opcion-fila={o.id} data-actual={estado.paso.opcion === o.id ? "1" : undefined}>
              <td>{o.id.toUpperCase()}</td>
              <td className="gp5-mono">${o.costo}</td>
              <td className="gp5-mono">{hechos.has(`c11h11-${o.id}-vme`) ? cifra(o.vme) : "?"}</td>
              <td className="gp5-mono">{hechos.has(`c11h11-${o.id}-rent`) ? (o.id === "b" ? "≈ 1,2" : cifra(o.rent)) : "?"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "libro", fondo: ["#3a2318", "#130a07"], acento: "#e9c46a", luz: "rgba(233,196,106,.16)",
  portada: LIBRO,
  mesa: "gerente",
  objeto: { id: LIBRO, alto: 64 },
  anim: "abre",
  disposicion: "tablero",
  antes: () => <EstiloLote6 />,
  encima: (e) => <><Fila {...e} /><Pagina {...e} /></>,
  etapas: [{}, { mesa: "tu", disposicion: "columna" }],
};

export default function C11H11Libro({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C11_H11} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
