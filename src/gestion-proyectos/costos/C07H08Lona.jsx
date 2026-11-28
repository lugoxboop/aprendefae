/*
 * C07 · H08 · Tres líneas en la lona (gp26-moc-c07-h08-lona, Medio, 25 FP × %).
 * La fachada de la bodega en obra con una lona grande colgada; sobre la lona,
 * la gráfica a mano con tres curvas SIN NOMBRE que se distinguen por trazo
 * (continua, guiones, puntos) y la línea vertical «Fecha de corte». Cuando
 * el estudiante cuelga las etiquetas de tela PV, EV y AC, cada curva lleva su
 * nombre. Al acertar la apuesta final, la lona avanza al mes 12 y PV y EV se
 * juntan en 1.200.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote4, Grafica } from "../comun/lote4.jsx";
import { ACUMULADO_C7, GP_C7_H08 } from "./textos-c7.js";

export const ID = GP_C7_H08.id;

// imagen-pendiente: bodega-lona · etiqueta-tela
const FACHADA = primero("bodega-lona", "bodega");
const ETIQUETA = primero("etiqueta-tela", "ficha-colgante");

/* Lo ganado y lo gastado hasta el corte del mes 4 (300 y 375, diseño §0); el tramo es del escenario. */
const EV = [[0, 0], [1, 30], [2, 90], [3, 180], [4, 300]];
const AC = [[0, 0], [1, 40], [2, 110], [3, 220], [4, 375]];
const PV = [[0, 0], ...ACUMULADO_C7.map((y, k) => [k + 1, y])];

function Lona({ paso, encaja, etapa }) {
  const yaNombradas = (etapa?.hechos ?? []).some((h) => h.paso.lona === "nombres") || (paso.lona === "nombres" && encaja);
  const final = paso.lona === "final" && encaja;
  const ev = final ? [...EV, ...PV.slice(5)] : EV;
  /* El 300 es la respuesta del paso 2: no se muestra hasta resolverlo. */
  const evOculto = paso.id === "c7h08-01" || (paso.id === "c7h08-02" && !encaja);
  const rot = (sigla, n) => (yaNombradas ? `${sigla} ${n}` : n);
  return (
    <div className="gp4-lamina" data-lona={final ? "mes-12" : "corte"}>
      <b>La lona · millones acumulados</b>
      <Grafica titulo="Valor ganado de la bodega" xMax={12} yMax={1300} corte={final ? null : 4} etiquetasX={[0, 2, 4, 6, 8, 10, 12]} etiquetasY={[0, 400, 800, 1200]}
        series={[
          { id: "pv", puntos: PV, trazo: "continua", nombre: yaNombradas ? "PV" : null },
          { id: "ev", puntos: ev, trazo: "guiones", nombre: final ? "EV" : null, dy: 14, color: "#ffc978" },
          { id: "ac", puntos: AC, trazo: "puntos", nombre: final ? "AC" : null, ancho: 4, color: "#a7d8ff" },
        ]}
        marcas={final ? [] : [{ x: 4, y: 400, texto: "400", dx: -16 }, { x: 4, y: 375, r: 4, texto: rot("AC", "375"), dx: 22, dy: -4 }, { x: 4, y: 300, r: 4, texto: evOculto ? rot("EV", "?") : rot("EV", "300"), dx: 22, dy: 18 }]} />
      <div className="gp2-fila" style={{ justifyContent: "flex-start", marginTop: 4 }}>
        <small>Trazos: continua · guiones · puntos</small>
        {yaNombradas && <span className="gp2-fila" style={{ gap: 4 }}><Objeto id={ETIQUETA} alto={22} /><small>Curvas con nombre</small></span>}
      </div>
    </div>
  );
}

export const ESCENA = {
  nombre: "lona", fondo: ["#2a2f36", "#0c0e11"], acento: "#ffc978", luz: "rgba(255,201,120,.16)",
  portada: FACHADA,
  mesa: "tu",
  objeto: { id: FACHADA, alto: 64 },
  anim: "cae",
  antes: () => <EstiloLote4 />,
  encima: (e) => <Lona {...e} />,
};

export default function C07H08Lona({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C7_H08} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
