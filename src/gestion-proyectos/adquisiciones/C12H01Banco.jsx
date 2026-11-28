/*
 * C12 · H01 · El banco o el catálogo (gp26-pla-c12-h01-hacer-comprar, Medio, 25 × 2 FP × %).
 * A la izquierda, el banco de taller de Altamira con sus herramientas y el
 * gato (gerente de producción) detrás; a la derecha, el catálogo grueso del
 * proveedor. Hacer: el hámster pone la tarea sobre el banco; Comprar: la
 * tarjeta se vuelve una página del catálogo. Tras cada acierto aparece el
 * factor que decidió (nunca antes). Etapa 2: la libreta del gato, donde cada
 * cifra se escribe solo después de calcularla.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { colocados } from "../comun/lote2.jsx";
import { EstiloLote6, Lamina, resuelto } from "../comun/lote6.jsx";
import { GP_C12_H01, TOSTADORA_C12 } from "./textos-c12.js";

export const ID = GP_C12_H01.id;

// imagen-pendiente: banco-taller · catalogo-proveedor (libreta-anillada ya existe)
const BANCO = primero("banco-taller", "mesa-cajones", "caja-herramientas");
const CATALOGO = primero("catalogo-proveedor", "carpeta-abierta");
const LIBRETA = primero("libreta-anillada");

function Factores(estado) {
  if (!estado.paso.texto) return null;
  const puestas = colocados(estado);
  return (
    <div className="gp5-chips" style={{ marginTop: 8 }} data-factores={puestas.length}>
      {puestas.map((x) => <span key={x.id} className="gp5-chip" data-on="1">{x.destino === "hacer" ? "Hacer" : "Comprar"} · {x.paso.factor}</span>)}
    </div>
  );
}

function Libreta(estado) {
  if (estado.paso.texto) return null;
  const B = TOSTADORA_C12.base;
  const Rc = TOSTADORA_C12.recuperador;
  return (
    <Lamina titulo="La libreta del gerente" data-libreta>
      <small style={{ display: "block" }}>Ahorro si Altamira hace la base: {resuelto(estado, "c12h01-11") ? `$${B.ahorro} M` : "?"}</small>
      <small style={{ display: "block" }}>El recuperador se paga en: {resuelto(estado, "c12h01-12") ? `${Rc.meses} meses` : "?"}</small>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "banco", fondo: ["#33281c", "#100c08"], acento: "#f4a261", luz: "rgba(244,162,97,.16)",
  portada: BANCO,
  mesa: "equipo",
  objeto: { id: BANCO, alto: 64 },
  anim: "cae",
  antes: () => <EstiloLote6 />,
  encima: (e) => <><Factores {...e} /><Libreta {...e} /></>,
  destinos: { hacer: { objeto: BANCO, alto: 44 }, comprar: { objeto: CATALOGO, alto: 44 } },
  etapas: [{}, { mesa: "gerente", objeto: { id: LIBRETA, alto: 56 } }],
};

export default function C12H01Banco({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C12_H01} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
