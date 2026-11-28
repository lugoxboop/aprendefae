/*
 * C04 · H10 · Los canales del beneficiadero (gp26-cie-c04-h10-beneficiadero, Difícil, 50 × 3 FP × %).
 * El beneficiadero de café de la finca con siete tanques, uno por proceso
 * (4.1 a 4.7). Etapa 1: cada tanque recibe sus dos placas, Grupo y Ritmo.
 * Etapa 2: de cada tanque sale un canal con su salida; se conecta a la boca
 * del tanque que la recibe y el agua con café corre (el canal de datos pasa
 * por la compuerta «Comparar con el plan»). Etapa 3: tres microdesafíos.
 */
import { Droplets } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote2, colocados } from "../comun/lote2.jsx";
import { GP_C4_H10, TANQUES } from "./textos-c4.js";

export const ID = GP_C4_H10.id;
const BENEFICIADERO = primero("tolva", "tanque-estado");
const TANQUE = primero("tanque-beneficio", "tanque-estado");
const DESPULPADORA = primero("despulpadora");
const CANAL = primero("canal-madera");
const COMPUERTA = primero("compuerta");

function Tanques(estado) {
  const puestos = colocados(estado);
  const placas = (t) => puestos.filter((x) => x.paso.tanque === t.id).map((x) => x.paso.destinos.find((d) => d.id === x.destino)?.nombre);
  const enEtapa1 = Boolean(estado.paso.tanque);
  const conectados = enEtapa1 ? [] : puestos.filter((x) => x.paso.sale);
  return (
    <div className="gp2-pila" data-tanques>
      {TANQUES.map((t) => {
        const activo = enEtapa1 ? estado.paso.tanque === t.id : false;
        const entra = conectados.filter((x) => x.destino === t.id);
        return (
          <div key={t.id} className="gp2-caja" data-tanque={t.id} data-lleno={activo || entra.length ? "1" : undefined}
            style={{ display: "grid", gridTemplateColumns: "32px minmax(0,1fr)", gap: 8, alignItems: "center" }}>
            <Objeto id={TANQUE} alto={28} />
            <span><b style={{ margin: 0 }}>{t.id.replace("-", ".")} · {t.nombre}</b>
              {enEtapa1 && placas(t).map((p) => <span key={p} className="gp-chip-c gp2-entra" style={{ marginRight: 4 }}>{p}</span>)}
              {entra.map((x) => <small key={x.id} className="gp2-entra" style={{ display: "block" }}>← {x.paso.texto}</small>)}
            </span>
          </div>
        );
      })}
      {!enEtapa1 && estado.paso.sale && <small>Los entregables llegan al cierre ya aceptados (cap. 5).</small>}
    </div>
  );
}

function Canal({ paso, encaja }) {
  if (!paso.sale) return null;
  return (
    <p className="gp-escenita" data-canal={paso.id}>
      <Objeto id={CANAL} alto={32} />
      <span>Sale de {paso.sale}</span>
      {paso.compuerta && <span className="gp2-fila"><Objeto id={COMPUERTA} alto={32} /><span className="gp-chip-c">Comparar con el plan</span></span>}
      <span aria-hidden="true" style={{ display: "inline-flex", opacity: encaja ? 1 : 0.35, transition: "opacity 300ms" }}><Droplets size={20} /></span>
    </p>
  );
}

export const ESCENA = {
  nombre: "beneficiadero", fondo: ["#22311f", "#0d140b"], acento: "#a3d65c", luz: "rgba(163,214,92,.2)",
  portada: BENEFICIADERO,
  objeto: { id: BENEFICIADERO, alto: 84, lugar: "detras" },
  anim: "gotea",
  antes: () => <EstiloLote2 />,
  etapas: [
    { disposicion: "rejilla", encima: (e) => <><div className="gp2-fila" aria-hidden="true"><Objeto id={DESPULPADORA} alto={56} /></div><Tanques {...e} /></> },
    { disposicion: "columna", destinos: { "*": { forma: "clavija" } }, encima: (e) => <><Canal {...e} /><Tanques {...e} /></> },
    { disposicion: "columna" },
  ],
};

export default function C04H10Beneficiadero({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C4_H10} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
