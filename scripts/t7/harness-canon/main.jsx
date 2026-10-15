/*
 * Banco de medida de la barra de enganche (B1 y B2) para scripts/t7/canon-b1.mjs.
 * Monta UNA pantalla de una pieza de Aprender de la célula (la pieza desde esa
 * pantalla en adelante, como la prueba canon-enganche.test.mjs) o la apertura
 * de un Hacer, con la hoja de estilos del sitio. No es una página del sitio:
 * Vite la sirve solo cuando se mide.
 *
 *   #a/<pieza>/<pantalla>   Aprender: índice de la pieza y de la pantalla
 *   #h/<hacer>              la apertura del Hacer de ese índice
 *
 * Deja en window.canon las listas y la medida, para que el script las use.
 */
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";
import { MarcoLibros } from "../../../src/components/mecanicas/bloques/marcos.jsx";
import { APRENDER_CANON, HACER_CANON } from "../../../src/contabilidad/canonEnganchePiezas.js";
import * as C from "../../../src/contabilidad/canonEnganche.js";

const [clase, i, k] = location.hash.slice(1).split("/");
let el = null;
if (clase === "a") {
  const { pieza, Pieza } = APRENDER_CANON[Number(i)];
  el = <Pieza pieza={{ ...pieza, pantallas: pieza.pantallas.slice(Number(k)) }} rotulo="PIEZA 1 DE 1" />;
} else if (clase === "h") {
  const { Mecanica, titulo } = HACER_CANON[Number(i)];
  el = <Mecanica Marco={MarcoLibros} rotulo="FÁCIL" titulo={titulo} acento="#E9C46A" onCompletar={() => {}} />;
}

window.canon = {
  aprender: APRENDER_CANON.map(({ tema, pieza }) => ({ tema, id: pieza.id, pantallas: pieza.pantallas.map((p) => ({ id: p.id, estados: C.estadosDePantalla(p) })) })),
  hacer: HACER_CANON.map(({ tema, id }) => ({ tema, id })),
  medir() {
    const tarjeta = C.tarjetaDe(document.getElementById("root"));
    const r = C.medirTarjeta(tarjeta, window);
    const arriba = tarjeta.getBoundingClientRect().top;
    return { texto: r.texto, figura: r.figura, antes: r.antes, conAncla: Boolean(r.ancla), px: r.ancla ? Math.round(r.ancla.getBoundingClientRect().top - arriba) : null, ancho: innerWidth };
  },
};

createRoot(document.getElementById("root")).render(
  <AuthContext.Provider value={{ usuario: null, pedirCuenta: () => {} }}>{el}</AuthContext.Provider>,
);
