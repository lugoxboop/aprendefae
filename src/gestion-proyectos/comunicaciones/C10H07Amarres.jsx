/*
 * C10 · H07 · Los amarres del muelle (gp26-pla-c10-h07-amarres, Medio, 25 FP × %).
 * El muelle de madera con un bolardo por persona o grupo; tres carretes de
 * soga: Uno a uno (una soga entre dos bolardos) · Uno a muchos (abanico desde
 * uno) · Muchos a muchos (red entre todos). La FORMA de la soga distingue el
 * tipo, no solo el color, y se tiende solo después de acertar. En el
 * «predecir y revelar» final aparecen los bolardos nuevos (de 4 a 10) y el
 * muelle se llena de sogas posibles, al responder.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote5, Lamina } from "../comun/lote5.jsx";
import { GP_C10_H07 } from "./textos-c10.js";

export const ID = GP_C10_H07.id;

// imagen-pendiente: muelle-madera (la cuerda de Macro ya existe)
const MUELLE = primero("muelle-madera", "puente-tablones");
const CUERDA = primero("cuerda");

/* n bolardos en arco; las sogas según el tipo que ya se amarró. */
function Muelle({ n, tipos }) {
  const pts = Array.from({ length: n }, (_, k) => [20 + (k * 260) / Math.max(1, n - 1), 70 - Math.sin((k / Math.max(1, n - 1)) * Math.PI) * 40]);
  const sogas = [];
  if (tipos.has("uno-uno")) sogas.push([pts[0], pts[1], "uu"]);
  if (tipos.has("uno-muchos")) pts.slice(1).forEach((p, k) => sogas.push([pts[0], p, `um${k}`]));
  if (tipos.has("muchos-muchos")) pts.forEach((a, i) => pts.slice(i + 1).forEach((b, j) => sogas.push([a, b, `mm${i}-${j}`])));
  return (
    <svg className="gp4-svg" viewBox="0 0 300 90" role="img" aria-label={`Muelle con ${n} bolardos`} data-bolardos={n} data-sogas={sogas.length}>
      {sogas.map(([a, b, k]) => <line key={k} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#e9c46a" strokeWidth="1.6" strokeDasharray={k.startsWith("mm") ? "3 3" : undefined} />)}
      {pts.map(([x, y], k) => <circle key={k} cx={x} cy={y} r="7" fill="#3a2a1a" stroke="#f4f5f7" strokeWidth="2" />)}
    </svg>
  );
}

function Amarres(estado) {
  const tipos = new Set(["uno-uno", "uno-muchos", "muchos-muchos"].filter((t) => cuantos(estado, t) > 0));
  const crece = estado.paso.crece && estado.encaja;
  if (crece) ["uno-uno", "uno-muchos", "muchos-muchos"].forEach((t) => tipos.add(t));
  return (
    <Lamina titulo={crece ? "El muelle con diez personas" : "El muelle del equipo · cuatro personas"} data-muelle={crece ? "10" : "4"}>
      <Muelle n={crece ? 10 : 4} tipos={tipos} />
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "amarres", fondo: ["#1e3340", "#0a1218"], acento: "#e9c46a", luz: "rgba(233,196,106,.14)",
  portada: MUELLE,
  mesa: "tu",
  objeto: { id: MUELLE, alto: 60 },
  anim: "cae",
  /* A 320 px «fila3» pasa a fila con la cuerda y la pista al lado y se salía (medido): una columna. */
  disposicion: "columna",
  antes: () => <EstiloLote5 />,
  encima: (e) => <Amarres {...e} />,
  destinos: { "*": { objeto: CUERDA, alto: 28 } },
};

export default function C10H07Amarres({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C10_H07} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
