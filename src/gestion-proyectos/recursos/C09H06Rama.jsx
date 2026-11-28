/*
 * C09 · H06 · La rama de los recursos (gp26-pla-c09-h06-rama, Medio, 25 × 2 FP × %).
 * La rama de cafeto que sale del tronco «Festival»: tres ramas (Personal ·
 * Materiales · Equipos) con sus ramitas (tipos). Cada recurso es una cereza
 * que se cuelga en dos toques: la rama y luego la ramita. Al acertar, la
 * cereza madura (verde → roja) con ✓ en su ramita; las que faltan no se
 * adelantan. Etapa 2: tres ramas pequeñas (A, B, C) a nombrar EDT, OBS o RBS.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote5, Lamina } from "../comun/lote5.jsx";
import { GP_C9_H06, RAMAS_C9 } from "./textos-c9.js";

export const ID = GP_C9_H06.id;

// imagen-pendiente: rama-cafeto · cereza-roja · cereza-verde
const RAMA = primero("rama-cafeto", "arbol-raices");

function Rama(estado) {
  if (estado.paso.tipo !== "casillas") return null;
  const hechas = [...(estado.etapa?.hechos ?? []).map((h) => h.paso), ...(estado.revelado ? [estado.paso] : [])];
  return (
    <Lamina titulo="Festival · estructura de desglose de recursos" data-cerezas={hechas.length}>
      <div className="gp2-rejilla" style={{ marginTop: 0 }}>
        {RAMAS_C9.map((r) => (
          <div key={r.id} className="gp2-caja" data-rama={r.id}>
            <b>{r.nombre}</b>
            {r.ramitas.map((m) => {
              const n = hechas.filter((p) => p.ramita === m.id).length;
              return <small key={m.id} style={{ display: "block" }} data-ramita={m.id}>{n ? "● ✓ " : "○ "}{m.nombre}</small>;
            })}
          </div>
        ))}
      </div>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "rama", fondo: ["#22331f", "#0a1209"], acento: "#ffc978", luz: "rgba(155,229,155,.14)",
  portada: RAMA,
  mesa: "tu",
  objeto: { id: RAMA, alto: 64 },
  anim: "cae",
  antes: () => <EstiloLote5 />,
  encima: (e) => <Rama {...e} />,
  etapas: [{}, { disposicion: "fila3" }],
};

export default function C09H06Rama({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C9_H06} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
