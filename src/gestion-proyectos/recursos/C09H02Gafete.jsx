/*
 * C09 · H02 · El gafete de la ingeniera (gp26-pla-c09-h02-gafete, Medio, 25 × 2 FP × %).
 * Un gafete colgante grande con cuatro casillas escritas: Rol · Autoridad ·
 * Responsabilidad · Competencia. El hámster «Equipo · sonido» lo sostiene.
 * Cada frase acertada se imprime dentro de su casilla (solo las ya puestas:
 * la lámina no adelanta ninguna respuesta). Etapa 2: el gafete queda a la
 * vista y cada caso enciende la casilla afectada.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { colocados } from "../comun/lote2.jsx";
import { EstiloLote5, Lamina } from "../comun/lote5.jsx";
import { GP_C9_H02 } from "./textos-c9.js";

export const ID = GP_C9_H02.id;

// imagen-pendiente: credencial (gafete colgante con cinta de Altamira)
const GAFETE = primero("credencial", "ficha-colgante");
const CASILLAS = [["rol", "Rol"], ["autoridad", "Autoridad"], ["responsabilidad", "Responsabilidad"], ["competencia", "Competencia"]];

function Gafete(estado) {
  const puestas = estado.paso.tipo === "casillas" || !estado.paso.texto ? [] : colocados(estado);
  const enciende = estado.paso.enciende ?? "";
  return (
    <Lamina titulo="Gafete · Equipo · sonido" data-gafete={puestas.length}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Objeto id={GAFETE} alto={64} />
        <div className="gp2-rejilla" style={{ "--gp2-cols": 2, marginTop: 0, flex: 1 }}>
          {CASILLAS.map(([id, nombre]) => (
            <div key={id} className="gp2-caja" data-casilla-gafete={id} data-lleno={enciende.includes(id) ? "1" : undefined}>
              <b>{nombre}</b>
              {puestas.filter((x) => x.destino === id).map((x) => <small key={x.id} style={{ display: "block" }}>{x.texto}</small>)}
            </div>
          ))}
        </div>
      </div>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "gafete", fondo: ["#2a2f3d", "#0c0e14"], acento: "#a7d8ff", luz: "rgba(167,216,255,.16)",
  portada: GAFETE,
  mesa: "equipo",
  anim: "sella",
  antes: () => <EstiloLote5 />,
  encima: (e) => <Gafete {...e} />,
};

export default function C09H02Gafete({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C9_H02} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
