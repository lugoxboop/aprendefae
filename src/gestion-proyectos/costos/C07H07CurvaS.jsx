/*
 * C07 · H07 · La curva S y los escalones (gp26-pla-c07-h07-curva-s, Difícil, 50 × 2 FP × %).
 * La lámina de papel milimetrado clavada en la caseta de obra, con ejes
 * «Meses» y «Costo acumulado» (la curva y los puntos van dibujados a mano con
 * los datos exactos, encima de la lámina). Abajo, las doce columnitas del
 * gasto de cada mes. Etapa 1: cada punto se lleva a su acumulado; al ponerlos
 * todos, la línea une los puntos y se ve la S. Etapa 2: cuatro escalones de
 * madera que suben y quedan por encima de la curva; el banco habla en globo.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote4, Grafica, numeroDeTexto } from "../comun/lote4.jsx";
import { BODEGA_C7, ACUMULADO_C7, GP_C7_H07 } from "./textos-c7.js";

export const ID = GP_C7_H07.id;

// imagen-pendiente: papel-milimetrado · escalones-madera · edificio-banco (caseta-obra ya existe)
const LAMINA = primero("papel-milimetrado", "caseta-obra");
const ESCALONES = primero("escalones-madera", "escalera");
const BANCO = primero("edificio-banco", "edificio-oficinas");

/* Con el límite del banco (620 al cierre de T2), 80 del mes 6 pasan al mes 7. */
const CONCILIADO = (() => { const m = [...BODEGA_C7.mensual]; m[5] -= 80; m[6] += 80; return m.reduce((a, v) => [...a, (a.at(-1) ?? 0) + v], []); })();

function Lamina({ paso, encaja, valores, etapa }) {
  const hechos = (etapa?.hechos ?? []).map((h) => h.paso);
  const puestos = new Set([...hechos.filter((p) => p.mes).map((p) => p.mes), ...(encaja && paso.mes ? [paso.mes] : [])]);
  const enEtapa2 = !paso.mes;
  const completa = enEtapa2 || puestos.size === 6;
  const marcas = [];
  if (!enEtapa2) {
    for (const mes of puestos) marcas.push({ id: `m${mes}`, x: mes, y: ACUMULADO_C7[mes - 1], texto: String(ACUMULADO_C7[mes - 1]).replace(/\B(?=(\d{3})+(?!\d))/g, ".") });
    if (!encaja && paso.mes) {
      const v = numeroDeTexto(valores?.v);
      if (v != null) marcas.push({ id: "moviendo", x: paso.mes, y: Math.max(0, Math.min(1300, v)), lleno: false, texto: `mes ${paso.mes}` });
    }
  }
  const tri = [];
  const listos = [...hechos.filter((p) => p.trimestre), ...(encaja && paso.trimestre ? [paso] : [])];
  for (const p of listos) tri.push({ x0: (p.trimestre - 1) * 3, x1: p.trimestre * 3, y: p.casillas[0].clave });
  if (paso.trimestre && !encaja) {
    const v = numeroDeTexto(valores?.v);
    if (v != null) tri.push({ x0: (paso.trimestre - 1) * 3, x1: paso.trimestre * 3, y: Math.max(0, Math.min(1400, v)) });
  }
  const concilia = paso.limite && encaja;
  const curva = (concilia ? CONCILIADO : ACUMULADO_C7).map((y, k) => [k + 1, y]);
  return (
    <div className="gp4-lamina" data-lamina={completa ? "curva-s" : puestos.size}>
      <b>Costo acumulado (millones) · meses 0 a 12</b>
      <Grafica titulo="Curva S de la bodega" xMax={12} yMax={1400} etiquetasX={[0, 2, 4, 6, 8, 10, 12]} etiquetasY={[0, 400, 800, 1200]}
        escalones={enEtapa2 ? tri : []}
        series={[{ id: "curva", puntos: [[0, 0], ...curva], trazo: "continua", nombre: completa ? "PV" : null, visible: completa }]}
        marcas={marcas} />
      <div className="gp2-fila" style={{ gap: 2, alignItems: "flex-end", height: 34, justifyContent: "space-between", marginTop: 4 }} aria-label="Gasto planeado de cada mes" data-columnitas>
        {BODEGA_C7.mensual.map((v, k) => <span key={k} title={`Mes ${k + 1}: ${v}`} style={{ flex: "1 1 0", height: `${(v / 180) * 30}px`, background: "#a7bbff", borderRadius: 2 }} />)}
      </div>
      <small style={{ display: "block", marginTop: 2 }} className="da26-mono">Gasto por mes: {BODEGA_C7.mensual.join(" · ")}</small>
    </div>
  );
}

function Banco({ paso }) {
  if (!paso.trimestre && !paso.limite) return null;
  return (
    <div className="gp-escenita" data-banco>
      <Objeto id={BANCO} alto={44} />
      <small>{paso.limite ? "Banco: «En T2 desembolso hasta 620 acumulados»." : "Banco: «Pido un escalón por trimestre, siempre por encima de la curva»."}</small>
      <Objeto id={ESCALONES} alto={40} />
    </div>
  );
}

export const ESCENA = {
  nombre: "curva-s", fondo: ["#1f2b33", "#0a1014"], acento: "#e9c46a", luz: "rgba(233,196,106,.16)",
  portada: LAMINA,
  mesa: "tu",
  objeto: { id: LAMINA, alto: 60 },
  anim: "cae",
  antes: () => <EstiloLote4 />,
  encima: (e) => <><Banco {...e} /><Lamina {...e} /></>,
  etapas: [{}, { mesa: "patrocinadora" }],
};

export default function C07H07CurvaS({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C7_H07} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
