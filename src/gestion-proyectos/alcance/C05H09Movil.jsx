/*
 * C05 · H09 · El móvil de la EDT (gp26-pla-c05-h09-movil, Difícil, 50 × 3 FP × %).
 * El móvil colgante de madera: la barra «1 App de pedidos v2» siempre arriba y
 * de ella las cuatro ramas de nivel 2. LA BARRA SE INCLINA si a su rama le
 * falta o le sobra peso y queda horizontal cuando está completa: la regla del
 * 100 % se ve. A 320 px se muestra una rama a la vez (la de la pieza en juego)
 * con la caneca fija abajo. Etapa 2: cada ficha con sus horas; al acertar la
 * barra se nivela. Etapa 3: códigos y niveles.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote3 as EstiloLote2 } from "../comun/lote3.jsx";
import { GP_C5_H09, RAMAS_C5 } from "./textos-c5.js";

export const ID = GP_C5_H09.id;
const ESPERADAS = { r11: 2, r12: 2, r13: 2, r14: 2 };

function Barra({ nombre, inclina, children }) {
  return (
    <div className="gp2-pieza" data-barra={nombre} data-nivelada={inclina === 0 ? "1" : undefined}>
      <span className="gp2-gira" style={{ display: "block", transform: `rotate(${inclina}deg)` }}><Objeto id="barra-movil" alto={30} /></span>
      <small>{nombre}</small>
      {children}
    </div>
  );
}

function Movil(estado) {
  const { paso, encaja } = estado;
  if (paso.rama) {
    const { padre, hijos } = paso.rama;
    const nivelada = Boolean(encaja);
    return (
      <div className="gp2-caja" data-rama-horas style={{ marginTop: 10 }}>
        <Barra nombre={`${paso.rama.nombre} · ${padre ?? (nivelada ? "✓" : "?")} h`} inclina={nivelada ? 0 : 9} />
        <div className="gp2-fila">
          {hijos.map((h, k) => (
            <span key={k} className="gp2-pieza"><Objeto id="ficha-colgante" alto={36} /><small className="da26-mono">{h ?? (nivelada ? "✓" : "?")} h</small></span>
          ))}
        </div>
      </div>
    );
  }
  if (!paso.texto) return null;
  const enJuego = encaja && encaja !== "caneca" ? encaja : paso.clave !== "caneca" ? paso.clave : null;
  return (
    <div className="gp2-caja" data-movil style={{ marginTop: 10 }}>
      <Barra nombre="1 App de pedidos v2" inclina={0} />
      <div className="gp2-rejilla" style={{ "--gp2-cols": 4 }}>
        {RAMAS_C5.map((r) => {
          const n = cuantos(estado, r.id);
          return (
            <div key={r.id} data-rama={r.id} data-activa={enJuego === r.id ? "1" : undefined} style={{ opacity: enJuego && enJuego !== r.id ? 0.55 : 1 }}>
              <Barra nombre={r.nombre.split(" ")[0]} inclina={n >= ESPERADAS[r.id] ? 0 : -12 + n * 6}>
                <small className="da26-mono">{n} / 2</small>
              </Barra>
            </div>
          );
        })}
      </div>
      <div className="gp2-fila" style={{ marginTop: 6 }}><Objeto id="caneca" alto={34} /><small>No es entregable · {cuantos(estado, "caneca")}</small></div>
    </div>
  );
}

export const ESCENA = {
  nombre: "movil", fondo: ["#2b2a1c", "#100f07"], acento: "#e9d38a", luz: "rgba(233,211,138,.22)",
  portada: "barra-movil",
  mesa: "equipo",
  objetoDe: (paso) => (paso.rama ? null : { id: "escalera", alto: 64, lugar: "detras" }),
  anim: "cae",
  disposicion: "rejilla",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Movil {...e} />,
  destinos: { r11: { objeto: "ficha-colgante", alto: 28 }, r12: { objeto: "ficha-colgante", alto: 28 }, r13: { objeto: "ficha-colgante", alto: 28 }, r14: { objeto: "ficha-colgante", alto: 28 }, caneca: { objeto: "caneca", alto: 28 } },
  etapas: [{}, {}, { destinos: {} }],
};

export default function C05H09Movil({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C5_H09} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
