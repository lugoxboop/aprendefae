/*
 * C05 · H12 · El globo que se infla (gp26-moc-c05-h12-globo, Difícil, 50 FP × %).
 * El globo aerostático de Altamira atado al piso: la canasta lleva tres sacos
 * (Tiempo · Costo · Recursos) y la válvula «Control integrado de cambios».
 *   Agregarlo sin papeles → el globo se infla y los sacos no cambian: la
 *     canasta se ladea (corrupción del alcance que se ve).
 *   Solicitud de cambio → entra por la válvula; globo y sacos crecen juntos.
 *   Ya está en el alcance → nada cambia; el zorro señala el enunciado.
 * Si la decisión no es la mejor, se ve su consecuencia, la retro y se vuelve a
 * decidir sin puntaje. Micro final: predecir la tendencia de tres barras.
 * A 320 px el globo ocupa la mitad de arriba y los botones van en columna.
 */
import { Wind, FileText, CircleCheck, TrendingUp, TrendingDown } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { EstiloLote2 } from "../comun/lote2.jsx";
import { GP_C5_H12 } from "./textos-c5.js";

export const ID = GP_C5_H12.id;

/* Lo que hace la escena con cada acción (la elegida: acierto o la errada que se está viendo). */
const EFECTO = {
  sinpapeles: { globo: 1.18, sacos: 1, ladeo: 12, texto: "El globo se infla y los sacos no cambian: la canasta se ladea." },
  cambio: { globo: 1.12, sacos: 1.12, ladeo: 0, texto: "Entra por la válvula: globo y sacos crecen juntos." },
  yaesta: { globo: 1, sacos: 1, ladeo: 0, texto: "Nada cambia: el zorro señala el enunciado." },
};

function Globo({ paso, encaja, ultimo }) {
  if (paso.tendencia) {
    const [a, b, c] = paso.tendencia;
    return (
      <div className="gp2-caja" data-tendencia style={{ marginTop: 10 }}>
        <div className="gp2-fila" style={{ alignItems: "flex-end", height: 72 }} aria-hidden="true">
          {[a, b, c].map((v, k) => <span key={k} style={{ width: 28, height: v * 16, borderRadius: 4, background: "#f2c14e" }} />)}
          {encaja && <span className="gp2-entra"><TrendingUp size={28} /></span>}
        </div>
        <small>Semana 1 · 2 · 3: {a}, {b}, {c} cambios sin aprobar</small>
      </div>
    );
  }
  const accion = encaja ?? ultimo;
  const ef = EFECTO[accion] ?? { globo: 1, sacos: 1, ladeo: 0, texto: "El globo espera tu decisión." };
  return (
    <div className="gp2-caja" data-globo={accion ?? "quieto"} data-ladeo={ef.ladeo} style={{ marginTop: 10, textAlign: "center" }}>
      <span className="gp2-gira" style={{ display: "inline-block", transform: `scale(${ef.globo}) rotate(${ef.ladeo}deg)`, transformOrigin: "50% 100%" }}><Objeto id="globo-aerostatico" alto={110} /></span>
      <div className="gp2-fila">
        {["Tiempo", "Costo", "Recursos"].map((s) => (
          <span key={s} className="gp2-pieza"><span className="gp2-gira" style={{ display: "block", transform: `scale(${ef.sacos})` }}><Objeto id="saco-arena" alto={30} /></span><small>{s}</small></span>
        ))}
        <span className="gp2-pieza"><Objeto id="valvula" alto={30} /><small>Control integrado</small></span>
      </div>
      <small data-efecto>{ef.texto}</small>
    </div>
  );
}

export const ESCENA = {
  nombre: "globo", fondo: ["#1c3046", "#0a1420"], acento: "#ffb703", luz: "rgba(255,183,3,.2)",
  portada: "globo-aerostatico",
  anim: "cae",
  disposicion: "columna",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Globo {...e} />,
  destinos: { sinpapeles: { icono: Wind }, cambio: { icono: FileText }, yaesta: { icono: CircleCheck }, empeora: { icono: TrendingUp }, mejora: { icono: TrendingDown } },
  final: () => <p className="gp-escenita" data-final-globo><Objeto id="valvula" alto={30} /><small>Los pedidos pasan por la válvula y la canasta se nivela.</small></p>,
};

export default function C05H12Globo({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C5_H12} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
