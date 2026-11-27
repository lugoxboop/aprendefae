/*
 * C04 · H01 · El acta de Barranquilla (gp26-ini-c04-h01-acta, Difícil, 50 × 2 FP × %).
 * Etapa 1: el acta de constitución (pliego con membrete y sello de lacre aún
 * sin estampar) con nueve secciones vacías; a un lado, la carpeta «Después,
 * en el plan». Cada dato se escribe en su sección; con las nueve llenas, la
 * patrocinadora estampa el lacre: «El proyecto existe». Etapa 2: cuatro
 * microdesafíos con el acta sellada en escena.
 */
import { Target, ListChecks, Ruler, AlertTriangle, Flag, Wallet, Users, DoorClosed, UserCheck, FolderClosed } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote2, colocados } from "../comun/lote2.jsx";
import { GP_C4_H01, SECCIONES_ACTA } from "./textos-c4.js";

export const ID = GP_C4_H01.id;
const ACTA = primero("acta-lacre", "carpeta-documento");
const CARPETA = primero("carpeta-lateral", "carpeta-abierta");
const ICONOS = { proposito: Target, objetivos: ListChecks, requisitos: Ruler, riesgo: AlertTriangle, hitos: Flag, recursos: Wallet, interesados: Users, salida: DoorClosed, director: UserCheck, plan: FolderClosed };

function Pliego(estado) {
  const puestos = colocados(estado);
  const llenas = SECCIONES_ACTA.filter((s) => puestos.some((x) => x.destino === s.id)).length;
  const sellada = llenas === SECCIONES_ACTA.length;
  return (
    <div className="gp2-caja" style={{ marginTop: 10, background: "rgba(251,247,238,.1)" }} data-acta={llenas}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <b style={{ margin: 0 }}>Acta de constitución · {llenas}/9</b>
        {sellada && <span className="gp-chip-c gp2-entra" data-lacre>● El proyecto existe</span>}
      </div>
      <div className="gp2-rejilla" style={{ "--gp2-cols": 3 }}>
        {SECCIONES_ACTA.map((s) => {
          const x = puestos.find((p) => p.destino === s.id);
          return <small key={s.id} className={x ? "gp2-entra" : ""} style={{ opacity: x ? 1 : 0.45 }} data-seccion={s.id}>{x ? "✓ " : ""}{s.nombre}</small>;
        })}
      </div>
    </div>
  );
}

export const ESCENA = {
  nombre: "acta", fondo: ["#3a1f1f", "#170c0c"], acento: "#e76f51", luz: "rgba(244,162,97,.2)",
  portada: ACTA,
  mesa: "patrocinadora",
  objeto: { id: ACTA, alto: 96 },
  anim: "sella",
  antes: () => <EstiloLote2 />,
  etapas: [
    { disposicion: "rejilla", encima: (e) => <Pliego {...e} />,
      destinos: { ...Object.fromEntries(Object.entries(ICONOS).map(([k, icono]) => [k, { icono }])), plan: { icono: FolderClosed, objeto: CARPETA, alto: 36 } } },
    { mesa: "tu", disposicion: "columna", despues: () => <div className="gp-escenita"><Objeto id={ACTA} alto={48} /><span>Acta sellada por la patrocinadora.</span></div> },
  ],
};

export default function C04H01Acta({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C4_H01} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
