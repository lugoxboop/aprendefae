/*
 * C11 · H08 · El tablero de los mil granos (gp26-pla-c11-h08-galton, Difícil, 50 × 2 FP × %).
 * El tablero de Galton de madera: la tolva suelta granos que rebotan en los
 * clavos y caen en ocho probetas por rango de costo (cada grano = un resultado
 * simulado del costo). Primero se apuesta sin puntaje; las probetas se llenan
 * DESPUÉS de la apuesta. Luego la curva S con su cursor: el % se lee donde el
 * estudiante pone el cursor (empieza en $2.900). Etapa 2: el tornado.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote6, Lamina, Barras, BarraH, CurvaCursor, resuelto } from "../comun/lote6.jsx";
import { GP_C11_H08, AMPLIACION_C11, cifra } from "./textos-c11.js";

export const ID = GP_C11_H08.id;

// imagen-pendiente: tablero-galton · probeta · granos-cafe
const GALTON = primero("tablero-galton", "frasco-contador");
const PROBETA = primero("probeta", "frasco-etiqueta");
const C = AMPLIACION_C11.curva;

/* Las ocho probetas: lo que cae entre un punto de la curva y el siguiente (el primero, hasta $2.900). */
const PROBETAS = C.map(([x, y], k) => ({ id: `b${x}`, corto: cifra((x / 1000).toFixed(x % 100 ? 2 : 1)), valor: k === 0 ? y : y - C[k - 1][1], color: "#c8a26b" }));

function Tablero(estado) {
  const lleno = estado.paso.id !== "c11h08-apuesta" || resuelto(estado, "c11h08-apuesta");
  return (
    <>
      <Lamina titulo={lleno ? "Las probetas · % de las 5.000 corridas por rango (miles)" : "La tolva, cerrada · 5.000 granos"} data-probetas={lleno ? "llenas" : "vacias"}>
        {lleno ? <Barras barras={PROBETAS} max={25} alto={130} /> : <small>Cada grano = un resultado simulado del costo.</small>}
      </Lamina>
      {estado.paso.curva && (
        <Lamina titulo="La curva S · mueve el cursor y lee el %">
          <CurvaCursor curva={C} meta={AMPLIACION_C11.meta} />
        </Lamina>
      )}
    </>
  );
}

function Tornado() {
  return (
    <Lamina titulo="El tornado · correlación con el costo" data-tornado>
      <div className="gp5-barras">
        {AMPLIACION_C11.tornado.map((b) => <BarraH key={b.id} nombre={b.texto} valor={Math.abs(b.r)} max={0.6} texto={cifra(b.r.toFixed(2))} color={b.r < 0 ? "#a7d8ff" : "#ffc978"} />)}
      </div>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "galton", fondo: ["#33261b", "#110c08"], acento: "#e9c46a", luz: "rgba(233,196,106,.16)",
  portada: GALTON,
  mesa: "tu",
  objeto: { id: GALTON, alto: 72 },
  anim: "cae",
  disposicion: "fila3",
  antes: () => <EstiloLote6 />,
  encima: (e) => <Tablero {...e} />,
  destinos: { "*": { objeto: PROBETA, alto: 28 } },
  etapas: [{}, { objetos: [GALTON].filter(Boolean), destinos: {}, disposicion: "columna", encima: (e) => (e.paso.id === "c11h08-04" ? <Tornado /> : null) }],
};

export default function C11H08Galton({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C11_H08} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
