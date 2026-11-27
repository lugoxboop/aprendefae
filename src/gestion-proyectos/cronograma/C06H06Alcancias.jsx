/*
 * C06 · H06 · Pintores y alcancías (gp26-pla-c06-h06-alcancias, Medio, 25 × 2 FP × %).
 * Etapa 1: la pared de ladrillo del local y el equipo con rodillo. El deslizador
 * «Pintores: 1 · 2 · 4 · 8» marca la apuesta; al revelar, se ve a los pintores
 * trabajar y el cartel de obra muestra los días (con 8 chocan y esperan turno).
 * A 320 px la pared va arriba y las opciones en una columna debajo.
 * Etapa 2: dos alcancías: Contingencia, dentro de la caja «Línea base del
 * cronograma»; Gestión, fuera, en manos de la patrocinadora. La tarjeta entra
 * por la ranura como una moneda.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote3 as EstiloLote2 } from "../comun/lote3.jsx";
import { GP_C6_H06, PINTORES_C6 } from "./textos-c6.js";

export const ID = GP_C6_H06.id;

function Pared({ paso, encaja }) {
  if (!paso.pintores) return null;
  const n = paso.pintores;
  return (
    <div className="gp2-caja" data-pared={n} style={{ marginTop: 10 }}>
      <div className="gp2-fila" style={{ justifyContent: "space-between" }}>
        <Objeto id="pared-ladrillo" alto={64} />
        <div className="gp2-fila" aria-hidden="true">
          {Array.from({ length: Math.min(n, 8) }, (_, k) => <span key={k} className={encaja ? "gp2-tambalea" : ""}><Objeto id="rodillo-pintura" alto={n > 4 ? 22 : 30} /></span>)}
        </div>
        <span className="gp2-pieza"><Objeto id="cartel-obra" alto={40} /><small className="da26-mono" data-dias>{encaja ? `${String(PINTORES_C6[n]).replace(".", ",")} días` : "¿? días"}</small></span>
      </div>
      <p className="da26-mono" style={{ margin: "6px 0 0" }} data-deslizador>Pintores: {[1, 2, 4, 8].map((k) => (k === n ? `[${k}]` : k)).join(" · ")}</p>
    </div>
  );
}

function Alcancias(estado) {
  const { paso } = estado;
  if (paso.clave !== "contingencia" && paso.clave !== "gestion") return null;
  if (!paso.texto) return null;
  return (
    <div className="gp2-rejilla" style={{ "--gp2-cols": 2 }} data-alcancias>
      <div className="gp2-caja" data-alcancia="contingencia"><b>Dentro de la línea base</b><div className="gp2-fila"><Objeto id="caja-fuerte" alto={36} /><Objeto id="alcancia" alto={36} /></div><small className="da26-mono">{cuantos(estado, "contingencia")} monedas</small></div>
      <div className="gp2-caja" data-alcancia="gestion"><b>Fuera · la patrocinadora</b><div className="gp2-fila"><Objeto id="alcancia" alto={36} /></div><small className="da26-mono">{cuantos(estado, "gestion")} monedas</small></div>
    </div>
  );
}

export const ESCENA = {
  nombre: "alcancias", fondo: ["#3a2420", "#150b09"], acento: "#f28482", luz: "rgba(242,132,130,.18)",
  portada: "rodillo-pintura",
  mesa: "equipo",
  anim: "cae",
  disposicion: "columna",
  antes: () => <EstiloLote2 />,
  encima: (e) => <><Pared {...e} /><Alcancias {...e} /></>,
  destinos: { contingencia: { objeto: "alcancia", alto: 30 }, gestion: { objeto: "alcancia", alto: 30 } },
  etapas: [{}, { mesa: "patrocinadora", disposicion: "rejilla" }],
};

export default function C06H06Alcancias({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C6_H06} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
