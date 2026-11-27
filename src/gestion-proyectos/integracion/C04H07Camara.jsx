/*
 * C04 · H07 · La cámara del viernes (gp26-moc-c04-h07-camara, Medio, 25 × 2 FP × %).
 * Etapa 1: la cámara antigua sobre trípode frente a la obra y, debajo, el
 * estuche con seis objetivos. La patrocinadora pregunta; montas el objetivo,
 * disparas y sale la foto con la respuesta (ícono y palabra). Etapa 2: el
 * cuarto de revelado: el informe se revela como foto y pasa al álbum; el dato
 * bruto queda como negativo; el otro documento se devuelve con su etiqueta.
 */
import { GitCompare, TrendingUp, TreePine, GitFork, Coins, CircleDot, Image, Film, Undo2 } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote2 } from "../comun/lote2.jsx";
import { GP_C4_H07 } from "./textos-c4.js";

export const ID = GP_C4_H07.id;
const CAMARA = primero("camara-tripode", "lupa");
const OBJETIVO = primero("objetivo-camara", "lupa-mango");
const CUBETA = primero("cubeta-revelado", "balde");

const REVELA = { informe: "Se revela: pasa al álbum", dato: "Queda como negativo: falta compararlo con el plan", otro: "Se devuelve con su etiqueta" };
function Foto({ paso, encaja }) {
  if (!encaja) return null;
  const d = paso.destinos.find((x) => x.id === encaja);
  return <p className="gp-escenita gp2-entra" data-foto={encaja}><span className="gp-chip-c">✓ {d?.nombre}</span><small>{REVELA[encaja] ?? "Foto lista"}</small></p>;
}

const ic = (o, objeto) => Object.fromEntries(Object.entries(o).map(([k, icono]) => [k, { icono, ...(objeto ? { objeto, alto: 30 } : {}) }]));
export const ESCENA = {
  nombre: "camara", fondo: ["#1f2533", "#0b0e15"], acento: "#a7bbff", luz: "rgba(167,187,255,.2)",
  portada: CAMARA,
  mesa: "patrocinadora",
  anim: "conecta",
  antes: () => <EstiloLote2 />,
  despues: (e) => <Foto {...e} />,
  etapas: [
    { objeto: { id: CAMARA, alto: 100 }, disposicion: "fila3",
      destinos: ic({ variacion: GitCompare, tendencias: TrendingUp, causa: TreePine, alternativas: GitFork, "costo-beneficio": Coins, "valor-ganado": CircleDot }, OBJETIVO) },
    { objeto: { id: CUBETA, alto: 72 }, mesa: "tu", disposicion: "fila3",
      destinos: { informe: { icono: Image }, dato: { icono: Film }, otro: { icono: Undo2 } } },
  ],
};

export default function C04H07Camara({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C4_H07} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
