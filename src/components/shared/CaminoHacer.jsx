import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FAE, ANCHO_ESTRECHO } from "../../theme.js";
import { iconoDe } from "./iconosActividad.jsx";
import DecoracionCamino from "./DecoracionCamino.jsx";
import PreviaActividad from "./previas/PreviaActividad.jsx";
import { bloquesDe } from "../../hacer/bloques.js";
import { registrarApertura } from "./contenidoNuevo.jsx";
import { conTransicion } from "../../estilo/movimiento.js";
import { identidadDeTema } from "./TarjetaTema.jsx";
import { SUBJECTS, temasVisibles, ubicacionDeActividad } from "../../data/subjects.js";

/*
 * Camino de actividades para la mitad "Hacer" de cualquier tema.
 *
 * NINGÚN NODO SE BLOQUEA, NUNCA. La inspiración visual es Duolingo, pero eso
 * de ahí no se copia: el camino ordena y sugiere un recorrido, no lo impone.
 * Se puede saltar del nodo 2 al 9 sin fricción, igual que en el resto del
 * sitio se puede entrar a cualquier tema en cualquier orden. Que un nodo esté
 * sin hacer cambia cómo se ve, jamás si se puede pulsar.
 *
 * EL PROBLEMA CENTRAL ES QUE SE VEA INTENCIONADO CON CUALQUIER NÚMERO DE
 * NODOS. Un tema con uno solo no puede parecer una página rota con hueco de
 * sobra, y uno con quince no puede salirse ni apelotonarse. Por eso aquí no
 * hay ni una medida fija: separación, radio, grosor y amplitud del serpenteo
 * salen todos del número de nodos, con topes por arriba y por abajo.
 *
 * ═══════════ EL TEXTO VA EN HTML, NO DENTRO DEL SVG ═══════════
 *
 * Los rótulos estaban dentro del SVG, en unidades del viewBox. El SVG ocupa el
 * 100% del ancho con un tope igual a su lienzo, así que por debajo de ese
 * ancho TODO el dibujo se escala junto, y el texto con él: no hay unidad que
 * se libre dentro de un viewBox. Medido a 375 px de ventana (327 px útiles):
 *
 *   · Iceberg, lienzo de 596 con el ramal del desafío: escala 0,55. Nombres
 *     a 7,4 px, «DESAFÍO» a 5,5 px, la marca de partida a medias a 6,6.
 *   · Los otros cuatro caminos, lienzo de 420: escala 0,78. Nombres a 10,5.
 *
 * Y subir los tamaños no arreglaba nada: 12 px a escala 0,55 son 22 unidades,
 * y a ese cuerpo los nombres ya no caben al lado de su nodo.
 *
 * Ahora el SVG dibuja solo lo que puede escalar —la línea, los círculos, los
 * números— y los rótulos son HTML con píxeles de verdad, colocados encima en
 * porcentajes del lienzo. El texto nunca baja de 12 px a ningún ancho y, si no
 * cabe, parte la línea en vez de encogerse. En escritorio, donde la escala es
 * 1, se ve como antes.
 *
 * ═══════════ EN EL TELÉFONO EL DESAFÍO SALE DEL RAMAL ═══════════
 *
 * Por debajo de ANCHO_ESTRECHO el ramal lateral es lo que hace el lienzo de
 * 596, y 596 metidos en 327 px deja los círculos de 30 px de diámetro. Así
 * que en móvil el desafío es una tarjeta ENCIMA del camino y el lienzo vuelve
 * a 420. Sigue fuera de la secuencia —no lleva número ni está en la línea—, y
 * arriba se ve sin desplazarse, que es lo mismo que buscaba el ramal.
 *
 * Las dos formas están en el DOM y una media query enseña una: la anchura se
 * decidió en CSS por lo mismo que en AccountControl —leerla con JavaScript
 * falló de tres maneras distintas en este proyecto—.
 *
 * ═══════════ POR BLOQUES DE DIFICULTAD (porBloques) ═══════════
 *
 * Política Económica, Demanda Agregada y Política Fiscal parten su camino en
 * Cimientos, Aplicación, Análisis y Maestría, por la dificultad del catálogo
 * (hacer/bloques.js), y siguen siendo UN recorrido: un solo lienzo y una
 * línea continua de punta a punta. Cada bloque se anuncia con su título —el
 * anillo de avance, el nombre y la dificultad— en una franja propia, del lado
 * por el que no pasa la línea (ver disposicionPorBloques). Hubo una línea
 * horizontal con una frase entre bloques y partía el camino en pedazos; se
 * quitó, y las frases quedan guardadas en hacer/bloques.js. Lo que no cambia
 * es lo de arriba: rótulos en HTML a px reales, nunca por debajo de 12.
 *
 * El radio, el grosor y la amplitud salen del camino entero, y entre nodos
 * del mismo bloque hay 100 unidades como mucho: el camino no crece de más en
 * el teléfono.
 *
 * En esta forma no hay doble forma: existía por el ramal del desafío, y aquí
 * el desafío —si un tema llega a tener— va siempre como tarjeta encima.
 *
 * Y cada nodo lleva el icono de su actividad (iconosActividad.jsx) en vez del
 * número; el que no tiene uno declarado sigue con su número.
 */

/* ---------------------------- medidas que respiran ---------------------------- */

const ANCHO = 420;                 // ancho del lienzo; la altura se calcula
const MARGEN_Y = 74;               // aire arriba y abajo, para que no roce el borde

/* Un valor que se mueve entre dos topes según cuántos nodos haya. */
const entre = (min, valor, max) => Math.max(min, Math.min(max, valor));

/*
 * Con pocos nodos el camino se estira para llenar la vista; con muchos se
 * comprime hasta un mínimo legible y a partir de ahí la página se desplaza,
 * que es preferible a apretar los nodos hasta que se toquen.
 */
export function medidas(n) {
  const separacion = n <= 1 ? 0 : entre(78, Math.round(760 / (n - 1)), 148);
  const radio = entre(17, Math.round(34 - Math.min(n, 12) * 0.9), 30);
  const grosor = entre(2, Math.round(5 - n * 0.15), 4.5);
  /* La amplitud del serpenteo se abre con pocos nodos y se cierra con muchos. */
  const amplitud = n <= 1 ? 0 : entre(52, Math.round(ANCHO * 0.30 - n * 1.6), 132);
  const alto = n <= 1 ? 232 : separacion * (n - 1) + MARGEN_Y * 2;
  return { separacion, radio, grosor, amplitud, alto };
}

/* Dónde cae cada nodo. Un seno da el serpenteo sin esquinas de videojuego. */
export function posiciones(n, m) {
  const centro = ANCHO / 2;
  if (n === 1) return [{ x: centro, y: m.alto / 2 }];
  /*
   * Los nodos alternan lado estrictamente, así el camino queda equilibrado
   * alrededor del centro con cualquier cantidad. El factor variable evita que
   * la alternancia se vea mecánica: cada nodo se aparta un poco distinto.
   *
   * Un seno simple no servía: con dos a cinco nodos se iba entero hacia la
   * derecha, que es justo el caso más común hoy.
   */
  return Array.from({ length: n }, (_, i) => ({
    x: centro + m.amplitud * Math.cos(i * Math.PI) * (0.72 + 0.28 * Math.sin(i * 1.3)),
    y: MARGEN_Y + i * m.separacion,
  }));
}

/* En un camino por bloques: lo más que se separan dos nodos del mismo bloque. */
const SEPARACION_BLOQUE = 100;
/*
 * La franja del título de un bloque y el aire a cada lado, en unidades del
 * lienzo. A 375 px de ventana el lienzo va a escala 0,78 y 64 unidades son
 * 50 px: cabe el anillo de 44. Los dos aires dejan libres los rótulos de los
 * nodos de antes y de después, que se extienden unos 35 unidades arriba y abajo.
 */
const BANDA = 64;
const AIRE_ANTES = 24;
const AIRE_DESPUES = 20;
const MARGEN_FINAL = 34;

/*
 * El camino por bloques entero, en un solo lienzo: dónde cae cada nodo y
 * dónde va el título de cada bloque.
 *
 * LA LÍNEA NO CRUZA NINGÚN TÍTULO, Y NO POR SUERTE. Dentro de un bloque los
 * nodos alternan de lado, como siempre; pero el primer nodo de un bloque se
 * queda del MISMO lado que el último del anterior. Así, entre bloque y
 * bloque, la línea baja por ese lado —la curva hasta se abre hacia fuera— y
 * el título ocupa la franja del lado contrario, que queda libre. Y el primer
 * bloque empieza del lado que haga que termine a la derecha: con los bloques
 * de hoy (2, 3 y 2 actividades) eso deja todos los títulos a la izquierda,
 * como estaban. Si otro reparto hiciera bajar la línea por la izquierda, ese
 * título se iría a la derecha en vez de quedar atravesado.
 */
export function disposicionPorBloques(bloques, nTotal) {
  const base = medidas(nTotal);
  const separacion = Math.min(base.separacion || SEPARACION_BLOQUE, SEPARACION_BLOQUE);
  const r = base.radio;
  const centro = ANCHO / 2;
  const puntos = [];
  const cabeceras = [];
  let lado = (bloques[0]?.nodos.length ?? 0) % 2 === 1 ? 1 : -1;
  let i = 0;

  bloques.forEach((b, k) => {
    const yCabecera = k === 0 ? 0 : puntos[puntos.length - 1].y + r + AIRE_ANTES;
    cabeceras.push({ id: b.id, y: yCabecera, lado: k === 0 ? -1 : -lado });
    let y = yCabecera + BANDA + r + AIRE_DESPUES;
    b.nodos.forEach((nodo, j) => {
      if (j > 0) {
        lado = -lado;
        y += separacion;
      }
      puntos.push({ x: centro + lado * base.amplitud * (0.72 + 0.28 * Math.sin(i * 1.3)), y, id: nodo.id });
      i += 1;
    });
  });

  const alto = (puntos[puntos.length - 1]?.y ?? 0) + r + MARGEN_FINAL;
  return { m: { ...base, separacion, alto }, puntos, cabeceras, banda: BANDA };
}

/*
 * Curva suave que pasa por todos los puntos (Catmull-Rom convertido a Bézier),
 * tramo a tramo. Se usa esto y no una polilínea porque el lenguaje de líneas
 * del sitio —la red de la portada, los flujos de Demanda Agregada— es curvo,
 * y un zigzag rígido cantaría a plantilla de otro producto.
 */
export function tramosDe(p) {
  return p.slice(0, -1).map((_, i) => {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    return {
      p1,
      c1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      c2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      p2,
    };
  });
}

const u = (v) => v.toFixed(1);
const curva = ({ c1, c2, p2 }) => `C ${u(c1.x)} ${u(c1.y)}, ${u(c2.x)} ${u(c2.y)}, ${u(p2.x)} ${u(p2.y)}`;

export function trazo(p) {
  if (p.length < 2) return "";
  return `M ${u(p[0].x)} ${u(p[0].y)} ${tramosDe(p).map(curva).join(" ")}`;
}

/* Un path por tramo: el recorrido se pinta de a un tramo, cada uno del tono de su bloque. */
const tramosSueltos = (p) => tramosDe(p).map((t) => `M ${u(t.p1.x)} ${u(t.p1.y)} ${curva(t)}`);

/*
 * Qué tramos de la línea van encendidos: los que unen dos hechas, y el que
 * lleva de una hecha al siguiente sugerido. Antes se encendía todo hasta el
 * sugerido, y si la primera seguía sin hacer no se encendía nada aunque
 * hubiera tres hechas más abajo: el avance real no se veía.
 */
export function tramosEncendidos(nodos, sugerido) {
  const lista = [];
  for (let i = 0; i < nodos.length - 1; i += 1) {
    if (nodos[i].completada && (nodos[i + 1].completada || i + 1 === sugerido)) lista.push(i);
  }
  return lista;
}

/* ------------------------------ el color del tema ------------------------------ */

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CAMINO LLEVA EL COLOR DE SU TEMA (Mateo, 18-nov: «dentro de los haceres,
 * los caminos se ven súper sosos»).
 *
 * Las tarjetas de temas estrenaron ese mismo día una identidad por tema: un
 * tono y un dibujo en pastilla (TarjetaTema.jsx). El camino era lo primero que
 * se veía al entrar a una de esas tarjetas, y seguía todo en teal: pulsabas
 * una tarjeta violeta y aterrizabas en un camino verde. Ahora el tono de la
 * tarjeta es el del camino, y entrar se siente como seguir en el mismo sitio.
 *
 * EL TONO SALE DE LOS NODOS, NO DE UNA PROP NUEVA. Cada nodo es una actividad
 * del catálogo, y el catálogo sabe en qué tema vive (ubicacionDeActividad).
 * Con eso se pide la identidad igual que la pide el índice —mismo tema, misma
 * posición entre los visibles—, así que la tarjeta y su camino no pueden
 * quedar de colores distintos, y las diecisiete vistas que pintan un camino no
 * tienen que cambiar ni una línea. Un camino cuyos nodos no estén en el
 * catálogo se queda con el teal de siempre.
 *
 * Los tonos de tema ya excluyen el coral (es «error») y el teal (es «correcto»):
 * esa regla viene heredada y no hay que vigilarla aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const TONO_RESPALDO = { base: "#2A9D8F", claro: "#7FD3C8", rgb: "42,157,143" };

export function tonoDelCamino(nodos = []) {
  for (const n of nodos) {
    const donde = ubicacionDeActividad(n?.id);
    const materia = donde && SUBJECTS[donde.materiaId];
    if (!materia) continue;
    const tema = materia.topics.find((t) => t.id === donde.temaId);
    let i = temasVisibles(materia).findIndex((t) => t.id === donde.temaId);
    if (i < 0) i = materia.topics.indexOf(tema);
    return identidadDeTema(donde.materiaId, tema, Math.max(0, i)).tono;
  }
  return TONO_RESPALDO;
}

/* Un hex del tono, oscurecido: la base del relieve de un nodo hecho. */
export function oscurecer(hex, f = 0.45) {
  const v = parseInt(hex.slice(1), 16);
  const c = (s) => Math.round(((v >> s) & 255) * (1 - f)).toString(16).padStart(2, "0");
  return `#${c(16)}${c(8)}${c(0)}`;
}
const alfa = (tono, a) => `rgba(${tono.rgb},${a})`;

/* ------------------------------ el nodo especial ------------------------------ */

/*
 * Un tema puede tener, además de su camino, UN nodo de desafío al lado. No es
 * una actividad más con otro color: está fuera de la secuencia numerada, tiene
 * su propio ramal, es más grande y respira con un halo ámbar.
 *
 * ESTÁ FUERA DEL CAMINO A PROPÓSITO. Meterlo dentro lo convertiría en "la
 * novena", y entonces no completar el tema por no haberlo hecho sería un
 * bloqueo encubierto. Colgado de un ramal se lee como lo que es: algo extra que
 * está ahí para quien quiera.
 *
 * Cuando no se pasa `especial`, nada de esto se dibuja y el lienzo mantiene su
 * ancho de siempre: los caminos de los demás temas no cambian ni un píxel.
 */
const ANCHO_RAMAL = 176;

const CSS_ESPECIAL = `
@keyframes fae-ch-halo {
  0%, 100% { opacity: .16; transform: scale(1); }
  50%      { opacity: .38; transform: scale(1.13); }
}
.fae-ch-halo { transform-box: fill-box; transform-origin: center; animation: fae-ch-halo 3.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .fae-ch-halo { animation: none !important; } }
`;

/* El aro del nodo que venía en la URL: late, para que se encuentre de un vistazo. */
const CSS_RESALTADO = `
@keyframes fae-ch-aqui { 0%, 100% { opacity: .95; } 50% { opacity: .35; } }
.fae-ch-aqui { animation: fae-ch-aqui 1.6s ease-in-out infinite; }
@keyframes fae-ch-aqui-caja {
  0%, 100% { box-shadow: 0 0 0 3px rgba(var(--tono-rgb, 42,157,143),0.95); }
  50%      { box-shadow: 0 0 0 3px rgba(var(--tono-rgb, 42,157,143),0.3); }
}
.fae-ch-aqui-caja { animation: fae-ch-aqui-caja 1.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .fae-ch-aqui, .fae-ch-aqui-caja { animation: none !important; } }
`;

/*
 * EL VOLUMEN DEL NODO (Mateo, 25-oct: «la UI se ve muy plana»).
 *
 * El truco es el de Duolingo y no lleva sombra: un disco gemelo CUATRO PÍXELES
 * MÁS ABAJO, del mismo color pero oscurecido. Sobre nuestro fondo oscuro una
 * sombra negra no se vería, y un `filter: drop-shadow` sobre decenas de nodos
 * cuesta en gama baja; un círculo de más no cuesta nada.
 *
 * Al pulsar, la cara baja esos 4 px y se come su propia base: el dedo siente
 * que hundió una ficha. Solo se mueve `transform`, como manda el canon, y con
 * movimiento reducido el nodo deja de hundirse pero conserva el relieve.
 */
/* Los dos tonos de la base: el teal de hecha y el azul del pendiente, oscurecidos. */
const BASE_HECHA = "#1C6B61";
const BASE_PENDIENTE = "rgba(5,11,20,0.95)";
const ALTURA_NODO = 4;
const CSS_VOLUMEN = `
.fae-ch-cara { transition: transform 90ms cubic-bezier(.3,.9,.4,1); }
[data-nodo]:active .fae-ch-cara, [data-nodo][data-hundido] .fae-ch-cara { transform: translateY(${ALTURA_NODO}px); }
@media (prefers-reduced-motion: reduce) {
  .fae-ch-cara { transition: none; }
  [data-nodo]:active .fae-ch-cara { transform: none; }
}
`;

/*
 * ═══════════ LA VIDA DEL CAMINO (18-nov) ═══════════
 *
 * El mismo lenguaje que las tarjetas de temas y la barra lateral, llevado al
 * nodo. Cada cosa dice algo; ninguna está solo de adorno:
 *
 *   · AL ENTRAR, los nodos aparecen uno tras otro con un pequeño rebote, de
 *     arriba abajo, al ritmo del trazo del camino (CSS_ENTRADA). El retardo
 *     se corta en el décimo: más abajo nadie lo está mirando todavía.
 *   · EL SIGUIENTE SUGERIDO respira: una onda de su color sale de él cada
 *     2,4 s, y su nombre lleva «Sigue aquí». Es la invitación, no una puerta.
 *   · LO RECORRIDO lleva un destello que lo cruza de vez en cuando, como el
 *     de las tarjetas al pasar el puntero: el avance brilla.
 *   · AL PASAR EL PUNTERO el nodo se levanta, crece un poco, se ilumina de
 *     su color y le sale un aro, igual que la pastilla de la tarjeta.
 *
 * Todo con transform y opacidad, salvo el destello, que mueve el desfase del
 * trazo de UNA línea. Con movimiento reducido no se mueve nada: queda el
 * dibujo quieto, con los tres estados igual de claros.
 */
const CSS_VIDA = `
.fae-ch-nodo { animation: fae-ch-pop 460ms cubic-bezier(.2,.9,.3,1.25) both; animation-delay: calc(var(--i, 0) * 70ms + 220ms); transform-box: fill-box; transform-origin: center; }
@keyframes fae-ch-pop { from { opacity: 0; transform: scale(.55); } }
.fae-ch-alza { transform-box: fill-box; transform-origin: center; transition: transform 240ms cubic-bezier(.2,.8,.3,1.2), filter 240ms ease; }
.fae-ch-aro { transform-box: fill-box; transform-origin: center; opacity: 0; transform: scale(.85); transition: opacity 240ms ease, transform 240ms cubic-bezier(.2,.8,.3,1); }
@media (hover: hover) {
  [data-nodo]:hover .fae-ch-alza, [data-nodo]:focus-visible .fae-ch-alza { transform: translateY(-3px) scale(1.07); filter: drop-shadow(0 8px 14px rgba(var(--tono-rgb),0.55)); }
  [data-nodo]:hover .fae-ch-aro, [data-nodo]:focus-visible .fae-ch-aro { opacity: 1; transform: scale(1); }
  .fae-ch-rotulo { transition: color 200ms ease; }
}
[data-nodo]:focus-visible { outline: none; }
.fae-ch-onda { transform-box: fill-box; transform-origin: center; animation: fae-ch-onda 2.4s cubic-bezier(.2,.6,.3,1) infinite; }
@keyframes fae-ch-onda { 0% { opacity: .6; transform: scale(.92); } 75%, 100% { opacity: 0; transform: scale(1.5); } }
.fae-ch-sigue { animation: fae-ch-flota 2.4s ease-in-out infinite; }
@keyframes fae-ch-flota { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
.fae-ch-destello { animation: fae-ch-destello 3.6s cubic-bezier(.45,.05,.35,1) 1.4s infinite; }
@keyframes fae-ch-destello { from { stroke-dashoffset: 1100; } 60%, to { stroke-dashoffset: -60; } }
.fae-ch-barra > span { transition: width 600ms cubic-bezier(.2,.8,.3,1); }
@media (max-width: ${ANCHO_ESTRECHO}px) { .fae-ch-sigue-abajo { display: none; } }
@media (prefers-reduced-motion: reduce) {
  .fae-ch-nodo, .fae-ch-onda, .fae-ch-sigue, .fae-ch-destello { animation: none !important; }
  .fae-ch-destello { display: none; }
  .fae-ch-alza, .fae-ch-aro { transition: none; }
}
`;

/* --------------------------------- el texto --------------------------------- */

/*
 * Qué forma se ve, y el cuerpo de los nombres. 13,5 px es el de siempre en
 * escritorio; en el teléfono sube a 14 porque se lee a la distancia del brazo.
 * Ningún texto del camino baja de 12 px.
 */
/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CAMINO SE TRAZA, NO APARECE (Mateo, 28-oct: «que al entrar al camino sea
 * una animación elegante e interesante»).
 *
 * El recorrido se revela de arriba abajo en 620 ms, como si alguien lo fuera
 * dibujando: primero el primer nodo, después la línea que baja hacia el
 * segundo, y así hasta el final. No hay que coreografiar nodo por nodo para
 * conseguirlo —y eso es lo bueno del truco—: se anima el BORDE INFERIOR del
 * recorte del contenedor, así que lo que entra en escena es exactamente lo
 * que está más arriba en el camino, y el orden sale solo de la geometría.
 *
 * POR QUÉ ASÍ Y NO NODO A NODO. El camino se pinta de cuatro maneras
 * distintas —normal y por bloques, cada una en su versión ancha y estrecha—,
 * y los nodos son `<g>` dentro de un SVG en unas y `<button>` en HTML en
 * otras. Una cascada por nodo necesitaría un retardo por elemento en los
 * cuatro sitios; esto es una regla y vale para los cuatro.
 *
 * `clip-path` no provoca recálculo de la página: el navegador recorta al
 * pintar. Y el recorte final lleva holgura (-60% abajo) para no cortarle nada
 * a lo que asoma fuera de la caja, que en el camino son los rótulos y la
 * decoración.
 *
 * 620 ms es largo para una entrada, y aquí está bien: lo que se está contando
 * es un recorrido, y un recorrido que se revela de golpe no se lee como
 * recorrido. Con movimiento reducido no hay recorte ninguno.
 * ═══════════════════════════════════════════════════════════════════════════
 */
/*
 * Va en su PROPIA hoja y no dentro de CSS_CAMINO, a propósito: la foto de
 * `camino-sin-cambios` recorta esta hoja entera antes de pesar el HTML, y
 * mezclarla con las reglas de verdad del camino obligaría a recortar también
 * esas —que son justo las que la foto tiene que vigilar—.
 */
/*
 * ═══════════ EL CAMINO SE DIBUJA; ANTES PARPADEABA ═══════════
 *
 * Mateo lo describió exacto: «es tan rápida que ni siquiera me entero, es como
 * un parpadeo». Había dos causas y la segunda es la que importa.
 *
 * LA CURVA. Estaba con la de la casa, cubic-bezier(.3,.9,.4,1), que es de
 * ATERRIZAJE: su segundo punto de control en .9 le hace recorrer el 90 % del
 * trayecto en el primer tercio del tiempo y dedicar el resto a frenar. Para
 * una tarjeta que cae en su sitio es perfecta; para el borde de un revelado,
 * no: cruza y nadie lo ve. Un barrido quiere velocidad pareja y salida suave,
 * que es cubic-bezier(.33,.08,.2,1).
 *
 * EL RECORRIDO, QUE ERA EL PROBLEMA DE VERDAD. El clip-path iba del 100 % al
 * -60 % de la ALTURA DEL CAMINO, y un camino mide cuatro o cinco pantallas.
 * El borde tenía que atravesarlas todas en la misma animación, así que la
 * única pantalla que el estudiante estaba mirando se revelaba en los primeros
 * cincuenta milisegundos. Alargar la duración no arreglaba nada: hacía más
 * lento el barrido de lo que ya no se ve.
 *
 * Así que el recorrido ahora se mide en PANTALLAS y no en porcentaje del
 * camino. La máscara avanza de 0 a 110vh —justo lo que se está mirando— y usa
 * el 70 % del tiempo en hacerlo; el 30 % restante termina de destapar el resto
 * de golpe, varias pantallas más abajo, donde nadie puede notarlo. El efecto
 * es el que se quería: el camino se dibuja de arriba abajo, a una velocidad
 * que el ojo sigue.
 *
 * Y entra DESPUÉS de la cabecera. Los 160 ms de espera no son adorno: sin
 * ellos el camino y el título se mueven a la vez, el ojo no sabe cuál mirar y
 * las dos animaciones se estorban. Primero dónde estás; después, lo que vas a
 * hacer.
 *
 * Por qué máscara y no clip-path: clip-path recorta por una forma, y aquí hace
 * falta que el corte avance en unidades de pantalla. mask-size se anima y
 * acepta vh. Donde no haya soporte de máscaras no hay animación y el camino
 * está ahí desde el primer fotograma, que es la degradación correcta.
 */
export const CSS_ENTRADA = `
.fae-ch-entra {
  -webkit-mask-image: linear-gradient(to bottom, #000 0 50%, transparent 50%);
  mask-image: linear-gradient(to bottom, #000 0 50%, transparent 50%);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  animation: fae-ch-trazo 1000ms cubic-bezier(.33, .08, .2, 1) 160ms both;
}
@keyframes fae-ch-trazo {
  from { -webkit-mask-size: 100% 0; mask-size: 100% 0; opacity: 0; }
  12%  { opacity: 1; }
  70%  { -webkit-mask-size: 100% 220vh; mask-size: 100% 220vh; }
  to   { -webkit-mask-size: 100% 4000vh; mask-size: 100% 4000vh; opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .fae-ch-entra { animation: none; -webkit-mask-image: none; mask-image: none; }
}
`;

const CSS_CAMINO = `
.fae-ch-estrecho { display: none; }
.fae-ch-rotulo { font-size: 13.5px; text-wrap: balance; }
@media (max-width: ${ANCHO_ESTRECHO}px) {
  .fae-ch-ancho { display: none; }
  .fae-ch-estrecho { display: block; }
  .fae-ch-rotulo { font-size: 14px; }
}
`;

/* Una medida del lienzo como porcentaje de su caja: así el HTML sigue al SVG al escalar. */
const pct = (v, total) => `${((v / total) * 100).toFixed(3)}%`;

/*
 * Cuando un rótulo parte línea, que las dos queden parejas: «Tienes una
 * partida / a medias» y no «Tienes una partida a / medias». Donde el navegador
 * no lo entiende, parte como siempre.
 */
const PAREJO = { textWrap: "balance" };

const MARCA = { display: "block", marginTop: "3px", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "12.5px", lineHeight: 1.3, color: FAE.ambar, ...PAREJO };
const ETIQUETA = { display: "block", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "0.12em", lineHeight: 1.3, color: FAE.ambar };

const alPulsar = (onAbrir, id) => ({
  onClick: () => onAbrir?.(id),
  onKeyDown: (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    onAbrir?.(id);
  },
});

/*
 * El color del rótulo de un nodo, por estado. El ícono de una actividad que
 * trae el suyo (`nodo.icono`, hoy solo Contabilidad) usa este mismo color.
 */
const colorDelRotulo = (nodo, sugerido = false, tono = null) =>
  nodo.completada ? FAE.text : sugerido && tono ? tono.claro : "rgba(248,249,250,0.72)";

/*
 * El contador del camino. Discreto a propósito: es una referencia, no un
 * marcador. Un número grande arriba convertiría el camino en una barra de
 * progreso, y lo que tiene que mirar el estudiante son los nodos.
 */
function Progreso({ texto, hechas = 0, total = 0, tono = TONO_RESPALDO }) {
  if (!texto) return null;
  /*
   * El texto, igual que antes, y debajo una barra fina del color del tema:
   * la misma cifra, dibujada. Sigue siendo discreta —4 px, sin número
   * grande—; lo que tiene que mirar el estudiante son los nodos.
   */
  const lleno = total > 0 ? Math.round((hechas / total) * 100) : 0;
  return (
    <div style={{ margin: "0 0 14px", maxWidth: "260px" }}>
      <p
        data-progreso-camino
        style={{
          margin: "0 0 7px",
          fontFamily: "Sora, sans-serif",
          fontSize: "12.5px",
          fontWeight: 600,
          letterSpacing: "0.04em",
          color: "rgba(248,249,250,0.6)",
        }}
      >
        {texto}
      </p>
      <span
        aria-hidden="true"
        className="fae-ch-barra"
        style={{ display: "block", height: "4px", borderRadius: "999px", background: "rgba(248,249,250,0.1)", overflow: "hidden" }}
      >
        <span
          style={{
            display: "block", height: "100%", width: `${lleno}%`, borderRadius: "inherit",
            background: `linear-gradient(90deg, ${alfa(tono, 0.7)}, ${tono.claro})`,
            boxShadow: `0 0 10px ${alfa(tono, 0.6)}`,
          }}
        />
      </span>
    </div>
  );
}

const etiquetaAria = (nodo, marcas, prefijo = "") =>
  `${prefijo}${nodo.nombre}${nodo.completada ? " · completada" : ""}${marcas?.[nodo.id] ? ` · ${marcas[nodo.id]}` : ""}`;

/* --------------------------------- la pieza --------------------------------- */

/**
 * @param {object} p
 * @param {Array<{id:string, nombre:string, completada:boolean}>} p.nodos
 * @param {(id:string) => void} p.onAbrir
 * @param {string} [p.vacio] qué decir cuando el tema todavía no tiene juegos
 * @param {{id:string, nombre:string, completada:boolean, etiqueta?:string}} [p.especial]
 *        nodo de desafío al lado del camino; sin él, nada cambia
 * @param {string} [p.resaltado] id del nodo que se resalta y se trae a la vista
 * @param {Object<string,string>} [p.marcas] texto corto junto a un nodo, por id
 *        —hoy solo «Tienes una partida a medias», en el Arca—
 * @param {boolean} [p.porBloques] partir el camino en bloques de dificultad; los
 *        nodos traen entonces su `dificultad` (nodosDe la pone)
 */
/*
 * `tema` elige los glifos de la materia que acompañan a la decoración de
 * fondo (una cuenta T en Contabilidad, unas barras en Macro). Sin él solo
 * sale la geometría, que vale para cualquier materia: así una vista nueva no
 * tiene que saber nada de esto para verse bien.
 */
export default function CaminoHacer({ nodos = [], onAbrir: alAbrir, vacio, especial = null, resaltado = null, marcas = null, porBloques = false, tema = null, mascotas = null }) {
  /* Abrir una actividad acerca la pantalla (sistema de movimiento: «abre»). */
  const onAbrir = alAbrir ? (id) => conTransicion(() => alAbrir(id), "abre") : undefined;
  const n = nodos.length;
  const caja = useRef(null);

  /*
   * EL NODO RESALTADO SE TRAE A LA VISTA. Es el que venía en la URL al
   * recargar dentro de un juego —ver useNodoEnRuta—: en un camino largo, un
   * aro que queda fuera de la pantalla no le dice nada a nadie.
   *
   * Cada nodo está dos veces en el DOM, una por forma, y la oculta no tiene
   * caja: se trae el que se ve.
   */
  useEffect(() => {
    if (!resaltado || !caja.current) return;
    const el = [...caja.current.querySelectorAll(`[data-nodo="${CSS.escape(resaltado)}"]`)]
      .find((x) => x.getClientRects().length > 0);
    el?.scrollIntoView?.({ block: "center", behavior: "auto" });
  }, [resaltado]);

  /*
   * Un tema sin juegos todavía. Se dice y ya: inventar nodos apagados de
   * relleno para que el camino "se vea" sería prometer contenido que no está.
   */
  if (n === 0) {
    return (
      <div
        style={{
          borderRadius: "18px",
          background: "rgba(248,249,250,0.04)",
          border: "1px dashed rgba(248,249,250,0.2)",
          padding: "clamp(24px, 4vw, 38px)",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.55)", margin: 0 }}>
          {vacio ?? "Los juegos de este tema están en construcción."}
        </p>
      </div>
    );
  }

  const tono = tonoDelCamino(nodos);
  const comunes = { nodos, onAbrir, resaltado, marcas, tema, tono };
  /* Las variables del tono, para las reglas de CSS_VIDA y el aro del resaltado. */
  const variables = { "--tono": tono.base, "--tono-claro": tono.claro, "--tono-rgb": tono.rgb };

  /*
   * CUÁNTO LLEVAS, QUE ES LO QUE SOSTIENE EL HÁBITO.
   *
   * Dentro de una actividad el estudiante sí sabe dónde está («Empresa 1 de
   * 6»), pero el camino entero no decía nada: se veía una columna de nodos sin
   * saber si eran tres o catorce ni cuántos faltaban. Es la cifra que hace
   * volver —ver un 7 de 9 pide terminar— y la que decide si abandonas al
   * tercer nodo creyendo que esto no se acaba nunca.
   *
   * Se cuenta de los nodos que ya se están pintando, así que no hay un dato
   * nuevo que mantener ni una llamada más: si un camino cambia de piezas, el
   * número cambia solo.
   */
  const hechas = nodos.filter((n) => n.completada).length;
  const progreso = nodos.length > 0
    ? (hechas === nodos.length
        ? `Las ${nodos.length} hechas`
        : `${hechas} de ${nodos.length} ${nodos.length === 1 ? "hecha" : "hechas"}`)
    : null;

  if (porBloques) {
    return (
      <div ref={caja} className="fae-ch-entra" style={variables}>
        <style>{CSS_ENTRADA}</style>
        <Progreso texto={progreso} hechas={hechas} total={nodos.length} tono={tono} />
        <style>{CSS_CAMINO}</style>
        <style>{CSS_VOLUMEN}</style>
        <style>{CSS_VIDA}</style>
        {especial && <style>{CSS_ESPECIAL}</style>}
        {resaltado && <style>{CSS_RESALTADO}</style>}
        <CaminoPorBloques {...comunes} especial={especial} />
      </div>
    );
  }

  return (
    <div ref={caja} className="fae-ch-entra" style={variables}>
      <style>{CSS_ENTRADA}</style>
      <Progreso texto={progreso} hechas={hechas} total={nodos.length} tono={tono} />
      <style>{CSS_CAMINO}</style>
      <style>{CSS_VOLUMEN}</style>
      <style>{CSS_VIDA}</style>
      {especial && <style>{CSS_ESPECIAL}</style>}
      {resaltado && <style>{CSS_RESALTADO}</style>}

      {/* Escritorio: el desafío cuelga de su ramal. */}
      <div className="fae-ch-ancho">
        <Lienzo {...comunes} especial={especial} mascotas={mascotas} />
      </div>

      {/* Teléfono: el desafío arriba, como tarjeta, y el camino a su ancho de siempre. */}
      <div className="fae-ch-estrecho">
        {especial && (
          <DesafioEnTarjeta especial={especial} onAbrir={onAbrir} resaltado={resaltado} marca={marcas?.[especial.id]} marcas={marcas} />
        )}
        <Lienzo {...comunes} especial={null} mascotas={mascotas} />
      </div>
    </div>
  );
}

/*
 * En qué lado del final del camino cabe Fae: en el CONTRARIO al último nodo.
 *
 * Medido a 320 px, que es donde se ve: bajo el último nodo quedan unos 38 px
 * libres —56 de margen menos el radio— y Fae mide 38. Puesta del lado
 * del nodo se le monta encima; puesta enfrente cae bajo el rótulo, que acaba
 * bastante más arriba, y no roza nada. A 375 las dos opciones se veían bien,
 * y por eso la primera versión pasó: a 375 casi todo cabe.
 *
 * Con un solo nodo el camino va centrado y su rótulo DEBAJO, así que no hay
 * lado contrario: Fae se va al centro, bajo todo.
 */
export function ladoLibreAlFinal(puntos, ancho = ANCHO) {
  if (!puntos?.length || puntos.length === 1) return "centro";
  const ultimo = puntos[puntos.length - 1];
  return ultimo.x < ancho / 2 ? "derecha" : "izquierda";
}

/* -------------------------------- el lienzo -------------------------------- */

function Lienzo({ nodos, onAbrir, especial, resaltado, marcas, tema = null, tono = TONO_RESPALDO, mascotas = null }) {
  const n = nodos.length;
  /* Con mascotas (opcional, ver MascotasCamino) el serpenteo deja sitio a los lados. */
  const conMascotas = Boolean(mascotas) && n > 1;
  const m = conMascotas ? medidasConMascotas(n, nodos.findIndex((x) => !x.completada)) : medidas(n);
  const p = conMascotas ? posicionesConMascotas(n, m) : posiciones(n, m);
  const d = trazo(p);
  /* El siguiente sugerido: el primero sin hacer. Sugerencia, no puerta. */
  const sugerido = nodos.findIndex((x) => !x.completada);
  const tramos = tramosSueltos(p);
  const encendidos = tramosEncendidos(nodos, n > 1 ? sugerido : -1);

  /*
   * El desafío cuelga de un ramal a la derecha, a la altura del tercio superior
   * del camino: lo bastante arriba para verse sin desplazarse y lo bastante
   * abajo para no competir con el primer nodo.
   */
  const anchoTotal = especial ? ANCHO + ANCHO_RAMAL : ANCHO;
  const radioEspecial = Math.round(m.radio * 1.45);
  const desdeIndice = Math.min(n - 1, Math.max(0, Math.round((n - 1) * 0.34)));
  const anclaje = p[desdeIndice];
  const esp = especial
    ? { x: ANCHO + ANCHO_RAMAL / 2 - 8, y: Math.max(anclaje.y, MARGEN_Y + radioEspecial) }
    : null;

  /*
   * Dónde va el rótulo de cada nodo, en porcentajes del lienzo.
   *
   * Al lado que quede libre: si el nodo se fue a la derecha, el rótulo va a su
   * izquierda, y al revés. Su ancho máximo es lo que queda hasta el borde del
   * camino —nunca el ramal—, y si el nombre no cabe parte la línea.
   *
   * Con un solo nodo va DEBAJO y centrado: a un lado le quedaban 168 unidades
   * y el nombre de Porter tiene 39 letras; en escritorio se salía del lienzo.
   */
  const lugarDelRotulo = (punto) => {
    if (n === 1) {
      return {
        left: pct(punto.x, anchoTotal), top: pct(punto.y + m.radio + 14, m.alto),
        width: pct(ANCHO - 60, anchoTotal), transform: "translateX(-50%)", textAlign: "center",
      };
    }
    return alLado(punto, m.radio, m.alto, anchoTotal);
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: `${anchoTotal}px`, margin: "0 auto" }}>
      {/*
        La decoración va la primera y en z-index 0; el recorrido se pone en
        relative con z-index 1 justo debajo. Sin esos dos números el adorno,
        que está en position absolute, se pintaría ENCIMA de los nodos: en el
        orden de pintado del navegador lo posicionado gana a lo que está en
        flujo, por tenue que sea.
      */}
      <DecoracionCamino tema={tema} ladoFae={ladoLibreAlFinal(p, ANCHO)} />
      <svg viewBox={`0 0 ${anchoTotal} ${m.alto}`} width="100%" style={{ display: "block", overflow: "visible", position: "relative", zIndex: 1 }}>
        {/* La línea del recorrido, por debajo de todo. */}
        {d && <LineaPendiente d={d} grosor={m.grosor} tono={tono} />}
        {/*
          El tramo ya recorrido, del color del tema encima de los puntos. Se
          dibuja hasta el siguiente sugerido: enseña avance real sin cerrarle
          el paso a nadie.
        */}
        {d && encendidos.length > 0 && (
          <LineaRecorrida d={encendidos.map((i) => tramos[i]).join(" ")} grosor={m.grosor} tono={tono}>
            <path
              d={encendidos.map((i) => tramos[i]).join(" ")}
              fill="none"
              stroke={tono.base}
              strokeWidth={m.grosor}
              strokeLinecap="round"
            />
          </LineaRecorrida>
        )}

        {nodos.map((nodo, i) => (
          <NodoSvg
            key={nodo.id}
            nodo={nodo}
            x={p[i].x}
            y={p[i].y}
            m={m}
            numero={i + 1}
            orden={i}
            sugerido={i === sugerido && n > 1}
            resaltado={resaltado}
            marcas={marcas}
            onAbrir={onAbrir}
            tono={tono}
          />
        ))}

        {/* ------------------------- el nodo de desafío ------------------------- */}
        {esp && (
          <g>
            {/* El ramal, discontinuo: sale del camino pero no es parte de él. */}
            <path
              d={`M ${anclaje.x} ${anclaje.y} C ${(anclaje.x + esp.x) / 2} ${anclaje.y}, ${(anclaje.x + esp.x) / 2} ${esp.y}, ${esp.x - radioEspecial} ${esp.y}`}
              fill="none"
              stroke={FAE.ambar}
              strokeWidth={m.grosor * 0.8}
              strokeLinecap="round"
              strokeDasharray="6 7"
              opacity="0.5"
            />

            <g
              data-nodo={especial.id}
              {...alPulsar(onAbrir, especial.id)}
              role="button"
              tabIndex={0}
              aria-label={etiquetaAria(especial, marcas, especial.etiqueta ? `${especial.etiqueta}: ` : "")}
              style={{ cursor: "pointer" }}
            >
              {resaltado === especial.id && (
                <circle className="fae-ch-aqui" cx={esp.x} cy={esp.y} r={radioEspecial + 20} fill="none" stroke={FAE.teal} strokeWidth="3" />
              )}
              <IconoDesafio cx={esp.x} cy={esp.y} r={radioEspecial} completada={especial.completada} Marca={especial.Marca} />
            </g>
          </g>
        )}
      </svg>

      {/* ------------------- los rótulos, en HTML y a px reales ------------------- */}
      {nodos.map((nodo, i) => (
        <span
          key={nodo.id}
          aria-hidden="true"
          className="fae-ch-rotulo"
          onClick={() => onAbrir?.(nodo.id)}
          style={{
            position: "absolute",
            ...lugarDelRotulo(p[i]),
            fontFamily: "Inter, sans-serif",
            fontWeight: i === sugerido && n > 1 ? 600 : 400,
            lineHeight: 1.3,
            color: colorDelRotulo(nodo, i === sugerido && n > 1, tono),
            cursor: "pointer",
          }}
        >
          {i === sugerido && n > 1 && <SigueAqui tono={tono} primero={!nodos.some((x) => x.completada)} />}
          {nodo.nombre}
          {marcas?.[nodo.id] && <span style={MARCA}>{marcas[nodo.id]}</span>}
        </span>
      ))}

      {esp && (
        <>
          {/* El rótulo del desafío, debajo; el nombre es largo y puede partirse. */}
          <span
            aria-hidden="true"
            onClick={() => onAbrir?.(especial.id)}
            style={{
              position: "absolute",
              left: pct(esp.x, anchoTotal),
              top: pct(esp.y + radioEspecial + 14, m.alto),
              width: pct(ANCHO_RAMAL - 12, anchoTotal),
              transform: "translateX(-50%)",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <span style={ETIQUETA}>{(especial.etiqueta ?? "Desafío").toUpperCase()}</span>
            <span className="fae-ch-rotulo" style={{ display: "block", marginTop: "3px", fontFamily: "Inter, sans-serif", lineHeight: 1.3, color: FAE.text }}>
              {especial.nombre}
            </span>
          </span>

          {/*
            La marca de partida a medias va ENCIMA del nodo: debajo están el
            rótulo y el nombre, y más abajo puede acabarse el lienzo.
          */}
          {marcas?.[especial.id] && (
            <span
              aria-hidden="true"
              onClick={() => onAbrir?.(especial.id)}
              style={{
                ...MARCA,
                position: "absolute",
                marginTop: 0,
                left: pct(esp.x, anchoTotal),
                top: pct(esp.y - radioEspecial - 20, m.alto),
                width: pct(ANCHO_RAMAL - 12, anchoTotal),
                transform: "translate(-50%, -100%)",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              {marcas[especial.id]}
            </span>
          )}
        </>
      )}

      {conMascotas && <MascotasCamino nodos={nodos} p={p} m={m} anchoTotal={anchoTotal} mascotas={mascotas} sugerido={sugerido} />}
    </div>
  );
}

/*
 * El rótulo de un nodo, al lado que quede libre: si el nodo se fue a la
 * derecha, el rótulo va a su izquierda, y al revés. Su ancho máximo es lo que
 * queda hasta el borde del camino —nunca el ramal—, y si el nombre no cabe
 * parte la línea.
 */
function alLado({ x, y }, radio, alto, anchoTotal = ANCHO) {
  const aLaDerecha = x < ANCHO / 2;
  const borde = aLaDerecha ? x + radio + 12 : x - radio - 12;
  const libre = (aLaDerecha ? ANCHO - borde : borde) - 6;
  return {
    ...(aLaDerecha ? { left: pct(borde, anchoTotal), textAlign: "left" } : { right: pct(anchoTotal - borde, anchoTotal), textAlign: "right" }),
    top: pct(y, alto), maxWidth: pct(libre, anchoTotal), transform: "translateY(-50%)",
  };
}

/*
 * LA LÍNEA PENDIENTE ES UNA HILERA DE PUNTOS, Y LA RECORRIDA ES SÓLIDA.
 *
 * Antes las dos eran trazos iguales que solo cambiaban de color, gris y teal:
 * de lejos se confundían. Ahora lo que falta es un rastro de puntos del tono
 * del tema, y lo hecho una línea entera y encendida, con un halo debajo y un
 * destello que la recorre. Se distinguen aunque no se vean los colores.
 */
function LineaPendiente({ d, grosor, tono }) {
  return (
    <path
      data-linea
      d={d}
      fill="none"
      stroke={alfa(tono, 0.42)}
      strokeWidth={grosor * 1.25}
      strokeLinecap="round"
      strokeDasharray={`0 ${(grosor * 3.2).toFixed(1)}`}
    />
  );
}

/*
 * Lo recorrido: un halo ancho y tenue (un trazo más, que es más barato que un
 * filtro de desenfoque), la línea —o los tramos, en el camino por bloques, que
 * llegan como hijos— y el destello. El destello normaliza la longitud con
 * pathLength para que cruce a la misma velocidad un tramo corto y uno largo.
 */
function LineaRecorrida({ d, grosor, tono, children }) {
  return (
    <g pointerEvents="none">
      <path d={d} fill="none" stroke={alfa(tono, 0.22)} strokeWidth={grosor * 3.4} strokeLinecap="round" />
      {children}
      <path
        className="fae-ch-destello"
        d={d}
        fill="none"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth={Math.max(1.5, grosor * 0.6)}
        strokeLinecap="round"
        pathLength="1000"
        strokeDasharray="60 1100"
        strokeDashoffset="1100"
      />
    </g>
  );
}

/*
 * «Sigue aquí», sobre el nombre del siguiente sugerido: una pastilla del color
 * del tema que flota despacio. Va DENTRO del rótulo y no encima del nodo
 * porque encima está, muchas veces, el título del bloque: medido a 1280, la
 * pastilla flotante pisaba «Fácil». Cuelga del rótulo hacia arriba, alineada
 * con él, y el nombre sigue centrado con su nodo. Si el nodo es el primero de
 * su bloque, el título del bloque queda justo encima —medido a 320, pisaba
 * «Medio»—, y entonces cuelga hacia abajo. En el teléfono, ahí abajo ya
 * empieza el nodo siguiente (a 320 lo rozaba), así que en ese caso no se
 * pone: el aro, la onda y el nombre en color ya dicen cuál es.
 * Dice cuál es la sugerencia sin cerrar ninguna otra: todos los nodos se
 * siguen pudiendo pulsar. Antes de hacer nada dice «Empieza aquí».
 */
function SigueAqui({ tono, primero = false, abajo = false }) {
  return (
    <span className={abajo ? "fae-ch-sigue-abajo" : undefined} style={{ position: "absolute", left: 0, right: 0, whiteSpace: "nowrap", pointerEvents: "none", ...(abajo ? { top: "100%", paddingTop: "6px" } : { bottom: "100%", paddingBottom: "6px" }) }}>
      <span
        data-sigue-aqui
        className="fae-ch-sigue"
        style={{
          display: "inline-block", padding: "3px 10px", borderRadius: "999px", whiteSpace: "nowrap",
          fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "0.04em", lineHeight: 1.35,
          color: "#0E1B2E", background: `linear-gradient(145deg, ${tono.claro}, ${tono.base})`,
          boxShadow: `0 6px 16px -4px ${alfa(tono, 0.8)}, inset 0 1px 0 rgba(255,255,255,0.45)`,
        }}
      >
        {primero ? "Empieza aquí" : "Sigue aquí"}
      </span>
    </span>
  );
}

/*
 * Un nodo del camino. Lo usan las dos formas: la de siempre y la de bloques.
 *
 * TRES ESTADOS QUE SE LEEN SIN COLOR (data-estado):
 *   · hecha: la pastilla llena con el degradado del tono, brillo arriba,
 *     ícono blanco y el ✓ en la esquina.
 *   · siguiente: oscura con aro grueso del tono, ícono del tono claro, una
 *     onda que sale de ella y «Sigue aquí» encima.
 *   · pendiente: oscura con aro tenue del tono y el ícono apagado. NO es un
 *     candado: se pulsa igual que las otras (ver la nota de arriba del todo).
 */
function NodoSvg({ nodo, x, y, m, numero, orden = 0, sugerido, resaltado, marcas, onAbrir, tono = TONO_RESPALDO, nivel = 1, bloqueId, prefijo = "" }) {
  const Icono = iconoDe(nodo.id);
  const lado = Math.round(m.radio * 1.1);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const hecha = nodo.completada;
  const estado = hecha ? "hecha" : sugerido ? "siguiente" : "pendiente";
  /* El ícono va con el color del rótulo de su nodo (colorDelRotulo). */
  const colorIcono = colorDelRotulo(nodo, sugerido, tono);
  return (
    <g
      data-nodo={nodo.id}
      data-estado={estado}
      data-bloque-de={bloqueId}
      className="fae-ch-nodo"
      {...alPulsar(onAbrir, nodo.id)}
      role="button"
      tabIndex={0}
      aria-label={etiquetaAria(nodo, marcas, prefijo)}
      style={{ cursor: "pointer", "--i": Math.min(orden, 10) }}
    >
      {hecha && (
        <defs>
          <linearGradient id={`fae-ch-g-${uid}`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor={tono.claro} />
            <stop offset="1" stopColor={tono.base} />
          </linearGradient>
        </defs>
      )}
      {/*
        * El siguiente sugerido: una onda de su color que sale de él, y un aro
        * fino y quieto. Acento, no candado; nunca coral, que es error.
        */}
      {sugerido && (
        <>
          <circle className="fae-ch-onda" cx={x} cy={y} r={m.radio + 4} fill={alfa(tono, 0.28)} opacity="0.35" pointerEvents="none" />
          <circle data-sugerido cx={x} cy={y} r={m.radio + 7} fill="none" stroke={tono.base} strokeWidth="2" opacity="0.8" />
        </>
      )}
      {resaltado === nodo.id && (
        <circle className="fae-ch-aqui" cx={x} cy={y} r={m.radio + 12} fill="none" stroke={tono.claro} strokeWidth="3" />
      )}

      <g className="fae-ch-alza">
        {/* El aro que aparece al pasar el puntero, como el de la pastilla de la tarjeta. */}
        <circle className="fae-ch-aro" cx={x} cy={y} r={m.radio + 5} fill="none" stroke={alfa(tono, 0.7)} strokeWidth="1.5" pointerEvents="none" />

        {/*
          La base del relieve: el mismo disco, 4 px más abajo y oscurecido. Va
          ANTES que la cara para quedar debajo, y no recibe el toque.
        */}
        <circle
          cx={x}
          cy={y + ALTURA_NODO}
          r={m.radio}
          fill={hecha ? oscurecer(tono.base) : BASE_PENDIENTE}
          pointerEvents="none"
        />

        <circle
          className="fae-ch-cara"
          cx={x}
          cy={y}
          r={m.radio}
          fill={hecha ? `url(#fae-ch-g-${uid})` : sugerido ? "#14243C" : "rgba(14,27,46,0.92)"}
          stroke={hecha ? alfa(tono, 0.9) : sugerido ? tono.base : alfa(tono, 0.25 + 0.3 * nivel)}
          strokeWidth={sugerido ? 3 : 2}
          style={nivel >= 1.2 && !hecha ? { filter: `drop-shadow(0 0 5px ${alfa(tono, 0.7)})` } : undefined}
        />
        {/* El brillo de arriba: lo que convierte el disco en pastilla. */}
        <ellipse
          className="fae-ch-cara"
          cx={x}
          cy={y - m.radio * 0.48}
          rx={m.radio * 0.62}
          ry={m.radio * 0.3}
          fill={hecha ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.06)"}
          pointerEvents="none"
        />

        {/*
          Dentro, el icono de la actividad; sin uno declarado, el número de
          siempre, que orienta sin ordenar. Los dos se quedan en el SVG porque
          aguantan la escala: a 320 px de ventana el número sigue en 16 px y el
          icono en unos 22.
        */}
        <g className="fae-ch-cara" pointerEvents="none">
          {nodo.icono ? (
            /* El ícono propio de la actividad (Contabilidad): el SVG de Xeno tal cual, en currentColor. */
            <g transform={`translate(${(x - lado / 2).toFixed(1)} ${(y - lado / 2).toFixed(1)})`} data-icono={nodo.id} data-icono-propio style={{ color: colorIcono }}>
              <nodo.icono size={lado} />
            </g>
          ) : Icono ? (
            <g transform={`translate(${(x - lado / 2).toFixed(1)} ${(y - lado / 2).toFixed(1)})`} data-icono={nodo.id}>
              <Icono size={lado} color={colorIcono} strokeWidth={2} aria-hidden="true" />
            </g>
          ) : (
            <text
              x={x}
              y={y + m.radio * 0.34}
              textAnchor="middle"
              fontFamily="Sora, sans-serif"
              fontWeight="700"
              fontSize={m.radio * 0.92}
              fill={colorIcono}
            >
              {numero}
            </text>
          )}
        </g>
        {hecha && <Hecha x={x + m.radio * 0.74} y={y - m.radio * 0.74} r={Math.max(7, m.radio * 0.36)} tono={tono} />}
      </g>
    </g>
  );
}

/* El ✓ de un nodo hecho: una marca que no depende del color. */
function Hecha({ x, y, r, tono = TONO_RESPALDO }) {
  return (
    <g pointerEvents="none" aria-hidden="true">
      <circle cx={x} cy={y} r={r} fill="#0E1B2E" stroke={tono.claro} strokeWidth="2" />
      <path
        d={`M ${x - r * 0.45} ${y + r * 0.02} L ${x - r * 0.1} ${y + r * 0.38} L ${x + r * 0.48} ${y - r * 0.34}`}
        fill="none" stroke={tono.claro} strokeWidth={Math.max(2, r * 0.26)} strokeLinecap="round" strokeLinejoin="round"
      />
    </g>
  );
}

/* ------------------------------ por bloques ------------------------------ */

/*
 * El tono del tema en cada bloque, de suave a encendido: Cimientos y
 * Aplicación suaves, Análisis más lleno, Maestría entero y con un brillo. Es
 * la escala que antes se hacía con el teal, ahora con el color del tema. NUNCA
 * CORAL: en el resto del sitio el coral es error, y los tonos de tema ya lo
 * excluyen. El color no dice el nivel solo: lo dicen el título del bloque y su
 * dificultad escritos.
 */
const NIVELES = { cimientos: 0.55, aplicacion: 0.7, analisis: 0.88, maestria: 1.2, otras: 0.55 };
export function tonoDeBloque(tono, bloqueId) {
  const nivel = NIVELES[bloqueId] ?? NIVELES.otras;
  const a = Math.min(1, nivel);
  return {
    nivel,
    acento: nivel >= 1 ? tono.base : alfa(tono, a),
    linea: nivel >= 1 ? tono.base : alfa(tono, Math.min(1, a + 0.15)),
    brillo: nivel > 1 ? `drop-shadow(0 0 6px ${alfa(tono, 0.75)})` : null,
  };
}

const OCULTO = { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap" };

function CaminoPorBloques({ nodos, onAbrir, especial, resaltado, marcas, tema = null, tono = TONO_RESPALDO }) {
  const bloques = bloquesDe(nodos);
  const orden = bloques.flatMap((b) => b.nodos);
  /*
   * Tocar un nodo abre su panel —con la previsualización— y «Empezar» abre la
   * actividad. Antes el toque entraba directo; el panel es lo que da un
   * sitio donde enseñar el gesto antes de entrar.
   */
  const [detalle, setDetalle] = useState(null);
  const nodoDetalle = detalle ? nodos.find((x) => x.id === detalle) : null;
  const bloqueDetalle = nodoDetalle ? bloques.find((b) => b.nodos.includes(nodoDetalle)) : null;

  return (
    <>
      {especial && (
        <DesafioEnTarjeta especial={especial} onAbrir={onAbrir} resaltado={resaltado} marca={marcas?.[especial.id]} marcas={marcas} />
      )}
      <LienzoPorBloques bloques={bloques} onAbrir={setDetalle} resaltado={resaltado} marcas={marcas} tema={tema} tono={tono} />
      {nodoDetalle && (
        <DetalleNodo
          key={nodoDetalle.id}
          nodo={nodoDetalle}
          bloque={bloqueDetalle}
          numero={orden.indexOf(nodoDetalle) + 1}
          tono={tono}
          onCerrar={() => setDetalle(null)}
          onEmpezar={() => {
            setDetalle(null);
            onAbrir?.(nodoDetalle.id);
            registrarApertura(nodoDetalle.id);
          }}
        />
      )}
    </>
  );
}

/*
 * EL CAMINO POR BLOQUES, EN UN SOLO LIENZO: una línea de punta a punta, sin
 * cortes entre bloques. Los títulos van en su franja, al lado contrario de por
 * donde baja la línea (ver disposicionPorBloques), en HTML y a px reales como
 * los rótulos. Al ancho del lienzo y centrado: en escritorio la columna mide
 * 860 y un título a su izquierda quedaría lejos del camino.
 *
 * Cada nodo lleva en su nombre accesible el bloque y la dificultad —el título
 * ya no lo envuelve en el DOM, así que un lector de pantalla lo oye ahí—.
 */
function LienzoPorBloques({ bloques, onAbrir, resaltado, marcas, tema = null, tono = TONO_RESPALDO }) {
  const orden = bloques.flatMap((b) => b.nodos);
  const { m, puntos, cabeceras } = disposicionPorBloques(bloques, orden.length);
  const bloqueDe = new Map(bloques.flatMap((b) => b.nodos.map((n) => [n.id, b])));
  const tonoDe = (id) => tonoDeBloque(tono, bloqueDe.get(id)?.id);
  /* El siguiente sugerido: el primero sin hacer en el orden del camino. */
  const sugerido = orden.findIndex((x) => !x.completada);
  /* Lo recorrido, cada tramo del tono del bloque al que entra. */
  const tramos = tramosSueltos(puntos);
  const encendidos = tramosEncendidos(orden, orden.length > 1 ? sugerido : -1);

  return (
    <div data-camino-bloques style={{ position: "relative", width: "100%", maxWidth: `${ANCHO}px`, margin: "0 auto" }}>
      <DecoracionCamino tema={tema} ladoFae={ladoLibreAlFinal(puntos, ANCHO)} />
      <svg viewBox={`0 0 ${ANCHO} ${m.alto}`} width="100%" style={{ display: "block", overflow: "visible", position: "relative", zIndex: 1 }}>
        {puntos.length > 1 && <LineaPendiente d={trazo(puntos)} grosor={m.grosor} tono={tono} />}
        {encendidos.length > 0 && (
          <LineaRecorrida d={encendidos.map((i) => tramos[i]).join(" ")} grosor={m.grosor} tono={tono}>
            {encendidos.map((i) => (
              <path key={i} data-recorrido d={tramos[i]} fill="none" stroke={tonoDe(orden[i + 1].id).linea} strokeWidth={m.grosor} strokeLinecap="round" />
            ))}
          </LineaRecorrida>
        )}
        {orden.map((nodo, i) => {
          const b = bloqueDe.get(nodo.id);
          return (
            <NodoSvg
              key={nodo.id}
              nodo={nodo}
              x={puntos[i].x}
              y={puntos[i].y}
              m={m}
              numero={i + 1}
              orden={i}
              sugerido={i === sugerido && orden.length > 1}
              resaltado={resaltado}
              marcas={marcas}
              onAbrir={onAbrir}
              tono={tono}
              nivel={tonoDe(nodo.id).nivel}
              bloqueId={b.id}
              prefijo={`${b.nombre}, ${b.etiqueta.toLowerCase()}: `}
            />
          );
        })}
      </svg>

      {cabeceras.map((c) => {
        const b = bloques.find((x) => x.id === c.id);
        return (
          <section
            key={c.id}
            data-bloque={c.id}
            data-lado={c.lado < 0 ? "izquierda" : "derecha"}
            aria-labelledby={`fae-cb-${c.id}`}
            style={{ position: "absolute", top: pct(c.y + 6, m.alto), maxWidth: "58%", ...(c.lado < 0 ? { left: 0 } : { right: 0 }) }}
          >
            <CabezaBloque bloque={b} tono={tono} tonoBloque={tonoDeBloque(tono, b.id)} alDerecha={c.lado > 0} />
          </section>
        );
      })}

      {orden.map((nodo, i) => (
        <span
          key={nodo.id}
          aria-hidden="true"
          className="fae-ch-rotulo"
          onClick={() => onAbrir?.(nodo.id)}
          style={{
            position: "absolute",
            ...alLado(puntos[i], m.radio, m.alto),
            fontFamily: "Inter, sans-serif",
            fontWeight: i === sugerido && orden.length > 1 ? 600 : 400,
            lineHeight: 1.3,
            color: colorDelRotulo(nodo, i === sugerido && orden.length > 1, tono),
            cursor: "pointer",
          }}
        >
          {i === sugerido && orden.length > 1 && (
            <SigueAqui tono={tono} primero={!orden.some((x) => x.completada)} abajo={bloqueDe.get(nodo.id)?.nodos[0] === nodo} />
          )}
          {nodo.nombre}
          {marcas?.[nodo.id] && <span style={MARCA}>{marcas[nodo.id]}</span>}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------ el panel del nodo ------------------------------ */

const CSS_DETALLE = `
.fae-dn-fondo { position: fixed; inset: 0; z-index: 65; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(6,12,22,0.62); animation: fae-dn-fundido 140ms ease-out backwards; }
/* La entrada solo rellena hacia atrás: al acabar no retiene el transform, y la hoja puede seguir al dedo y volver con su transición. */
.fae-dn { width: min(100%, 380px); box-sizing: border-box; border-radius: 22px; padding: 20px 20px 18px; text-align: center; color: ${FAE.text};
  background: linear-gradient(160deg, #1C3150, #13233B); border: 1px solid rgba(248,249,250,0.22); box-shadow: 0 18px 48px rgba(0,0,0,0.5);
  transition: transform 180ms ease; animation: fae-dn-subir 180ms cubic-bezier(.2,.8,.3,1) backwards; }
.fae-dn-agarre { display: none; }
.fae-dn-previa { width: 144px; height: 108px; margin: 0 auto 14px; border-radius: 16px; display: grid; place-items: center; overflow: hidden;
  background: radial-gradient(120% 90% at 50% 0%, rgba(var(--tono-rgb, 42,157,143),0.22), #13233B 70%); border: 1px solid rgba(var(--tono-rgb, 42,157,143),0.35); }
.fae-dn-bloque { margin: 0 0 4px; font-family: Sora, sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.12em; color: var(--tono-claro, rgba(248,249,250,0.72)); }
.fae-dn-titulo { margin: 0 0 6px; font-family: Sora, sans-serif; font-weight: 700; font-size: 19px; line-height: 1.25; letter-spacing: -0.01em; }
.fae-dn-hecha { margin: 0; font-size: 13.5px; color: rgba(248,249,250,0.85); }
.fae-dn-botones { display: flex; gap: 10px; margin-top: 16px; }
.fae-dn-botones button { flex: 1; font-family: Sora, sans-serif; font-weight: 600; font-size: 15px; padding: 13px 16px; border-radius: 999px; cursor: pointer; }
.fae-dn-empezar { background: linear-gradient(145deg, var(--tono-claro, ${FAE.teal}), var(--tono, ${FAE.teal})); border: none; color: #0E1B2E;
  box-shadow: 0 8px 20px -8px rgba(var(--tono-rgb, 42,157,143),0.9), inset 0 1px 0 rgba(255,255,255,0.35); transition: transform 160ms ease, box-shadow 160ms ease; }
@media (hover: hover) { .fae-dn-empezar:hover { transform: translateY(-1px); box-shadow: 0 12px 26px -8px rgba(var(--tono-rgb, 42,157,143),1), inset 0 1px 0 rgba(255,255,255,0.4); } }
.fae-dn-cerrar { background: transparent; border: 1px solid rgba(248,249,250,0.3); color: ${FAE.text}; }
@keyframes fae-dn-fundido { from { opacity: 0; } }
@keyframes fae-dn-subir { from { opacity: 0; transform: translateY(14px); } }
@media (max-width: ${ANCHO_ESTRECHO}px) {
  .fae-dn-fondo { align-items: flex-end; padding: 0; }
  /* Sin desplazamiento propio: el arrastre vertical es de la hoja, no de la página. */
  .fae-dn { width: 100%; border-radius: 22px 22px 0 0; padding-bottom: max(18px, env(safe-area-inset-bottom)); touch-action: none; }
  /* El asa: dice que la hoja se puede bajar. */
  .fae-dn-agarre { display: block; width: 40px; height: 4px; border-radius: 999px; margin: -8px auto 12px; background: rgba(248,249,250,0.35); }
}
@media (prefers-reduced-motion: reduce) { .fae-dn-fondo, .fae-dn { animation: none !important; } }
`;

/* El icono quieto, en grande: lo que se ve antes de la animación, y en lugar de ella. */
function IconoEstatico({ nodo, numero, tono = TONO_RESPALDO }) {
  const Icono = iconoDe(nodo.id);
  return (
    <span
      data-estatico
      style={{
        width: "72px", height: "72px", borderRadius: "50%", display: "grid", placeItems: "center",
        border: `2.5px solid ${tono.base}`, background: "rgba(14,27,46,0.85)", color: FAE.text,
        boxShadow: `0 0 0 6px ${alfa(tono, 0.12)}, 0 10px 24px -8px ${alfa(tono, 0.7)}`,
      }}
    >
      {nodo.icono ? (
        /* El ícono propio, del color del título de la ventana (FAE.text, heredado). */
        <nodo.icono size={36} />
      ) : Icono ? (
        <Icono size={36} color="rgba(248,249,250,0.92)" strokeWidth={1.8} aria-hidden="true" />
      ) : (
        <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "26px" }}>{numero}</span>
      )}
    </span>
  );
}

/*
 * EL PANEL PRIMERO, LA ANIMACIÓN DESPUÉS. El panel se pinta en el mismo toque
 * con el icono quieto; la previsualización se monta dos fotogramas más tarde,
 * cuando el panel ya está en pantalla, y su código se descarga la primera vez
 * (ver PreviaActividad). Una previsualización que hiciera sentir lento el
 * toque sería peor que ninguna.
 *
 * Solo existe mientras el panel está abierto: al cerrar o al empezar se
 * desmonta y el bucle se acaba. Con "reducir movimiento" no se monta nunca:
 * se queda el icono quieto, sin excepciones.
 */
function DetalleNodo({ nodo, bloque, numero, tono = TONO_RESPALDO, onCerrar, onEmpezar }) {
  const caja = useRef(null);
  const empezar = useRef(null);
  const cerrar = useRef(onCerrar);
  cerrar.current = onCerrar;
  const [animar, setAnimar] = useState(false);
  const reducir = typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);

  /*
   * DESLIZAR HACIA ABAJO CIERRA, en el teléfono: es lo que la gente intenta
   * con una hoja que sube desde abajo. La hoja sigue al dedo; si baja más de
   * 90 px —o se lanza rápido—, se cierra, y si no, vuelve a su sitio. Hasta
   * 8 px sigue siendo un toque, para no comerse los botones, y el clic que
   * llega después de un arrastre se descarta. En escritorio no hay hoja:
   * Escape y tocar fuera.
   */
  const arrastre = useRef(null);
  const tragarClic = useRef(false);
  const [bajada, setBajada] = useState(0);
  const alPresionar = (e) => {
    if (!window.matchMedia?.(`(max-width: ${ANCHO_ESTRECHO}px)`)?.matches) return;
    arrastre.current = { y0: e.clientY, t0: performance.now(), dy: 0, movido: false, id: e.pointerId, el: e.currentTarget };
  };
  const alMover = (e) => {
    const a = arrastre.current;
    if (!a) return;
    a.dy = Math.max(0, e.clientY - a.y0);
    if (!a.movido && a.dy > 8) {
      a.movido = true;
      try { if (a.id != null) a.el.setPointerCapture?.(a.id); } catch { /* sin captura, se sigue igual */ }
    }
    if (a.movido) setBajada(a.dy);
  };
  const alSoltar = () => {
    const a = arrastre.current;
    arrastre.current = null;
    if (!a) return;
    if (a.movido) tragarClic.current = true;
    const lanzada = a.dy > 40 && performance.now() - a.t0 < 250;
    if (a.dy > 90 || lanzada) cerrar.current();
    else setBajada(0);
  };

  useEffect(() => {
    const previo = document.activeElement;
    empezar.current?.focus();
    let segundo = null;
    const primero = requestAnimationFrame(() => {
      segundo = requestAnimationFrame(() => setAnimar(true));
    });
    const alPulsar = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cerrar.current();
        return;
      }
      /* El foco se queda dentro del panel mientras está abierto. */
      if (e.key === "Tab" && caja.current) {
        const botones = [...caja.current.querySelectorAll("button")];
        const [a, z] = [botones[0], botones[botones.length - 1]];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener("keydown", alPulsar);
    return () => {
      cancelAnimationFrame(primero);
      if (segundo !== null) cancelAnimationFrame(segundo);
      document.removeEventListener("keydown", alPulsar);
      if (previo?.isConnected) previo.focus?.();
    };
  }, []);

  const estatico = <IconoEstatico nodo={nodo} numero={numero} tono={tono} />;

  /*
   * ═══════════ POR QUÉ ESTE EMERGENTE VA EN UN PORTAL ═══════════
   *
   * El camino se revela con una máscara (`.fae-ch-entra`, CSS_ENTRADA). Una
   * máscara no recorta solo al elemento: recorta el PINTADO de todo lo que
   * cuelga de él, y la caja de la máscara es la del contenedor del camino,
   * que es una columna centrada. El velo de este panel es `position: fixed;
   * inset: 0` y de hecho MIDE toda la ventana —medido: 1320 × 620 en una
   * ventana de 1320 × 620—, pero se pintaba solo dentro de esa columna: a los
   * lados quedaban dos franjas sin oscurecer y el fondo se veía a medio
   * apagar. Lo cazó Mateo el 30 de octubre.
   *
   * Colgarlo del body lo saca de la máscara. No cambia nada de su aspecto ni
   * de su comportamiento: el velo ya era fijo y ya cubría la ventana entera;
   * lo único que cambia es quién puede recortarlo, que ahora no es nadie.
   *
   * Es el mismo arreglo que la hoja de opinión necesitó por otro motivo (allí
   * era un z-index encerrado en su contexto de apilamiento). Dos veces la
   * misma lección: un velo de pantalla completa no puede vivir dentro del
   * contenido al que tapa.
   */
  return createPortal((
    <div className="fae-dn-fondo" onClick={() => cerrar.current()} style={{ "--tono": tono.base, "--tono-claro": tono.claro, "--tono-rgb": tono.rgb }}>
      <style>{CSS_DETALLE}</style>
      <div
        ref={caja}
        className="fae-dn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fae-dn-titulo"
        onClick={(e) => e.stopPropagation()}
        onClickCapture={(e) => {
          if (!tragarClic.current) return;
          tragarClic.current = false;
          e.stopPropagation();
          e.preventDefault();
        }}
        onPointerDown={alPresionar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        style={bajada ? { transform: `translateY(${bajada}px)`, transition: "none" } : undefined}
      >
        <span className="fae-dn-agarre" aria-hidden="true" />
        <div className="fae-dn-previa" aria-hidden="true">
          {animar && !reducir ? <PreviaActividad actividadId={nodo.id} respaldo={estatico} /> : estatico}
        </div>
        {bloque && (
          <p className="fae-dn-bloque">
            {bloque.nombre.toUpperCase()} · {bloque.etiqueta.toUpperCase()}
          </p>
        )}
        <h3 id="fae-dn-titulo" className="fae-dn-titulo">{nodo.nombre}</h3>
        {nodo.completada && (
          <p className="fae-dn-hecha"><span aria-hidden="true">✓ </span>Ya la completaste</p>
        )}
        <div className="fae-dn-botones">
          <button type="button" className="fae-dn-cerrar" onClick={() => cerrar.current()}>Cerrar</button>
          <button ref={empezar} type="button" className="fae-dn-empezar" onClick={onEmpezar}>Empezar</button>
        </div>
      </div>
    </div>
  ), document.body);
}

/*
 * El título del bloque con su anillo: el arco dice cuánto va hecho y dentro va
 * la fracción escrita, «2/3», que es texto y no solo un dibujo. Se pone al día
 * sola al completar una actividad: los nodos vienen de useCompletadas, que
 * escucha el canal de FP.
 */
function CabezaBloque({ bloque, tono = TONO_RESPALDO, tonoBloque = tonoDeBloque(tono, bloque.id), alDerecha = false }) {
  const { hechas, total } = bloque;
  const completo = total > 0 && hechas === total;
  const R = 17;
  const L = 2 * Math.PI * R;
  return (
    <div
      data-cabeza-bloque={bloque.id}
      style={{ display: "flex", alignItems: "center", gap: "12px", flexDirection: alDerecha ? "row-reverse" : "row", textAlign: alDerecha ? "right" : "left" }}
    >
      <span
        role="img"
        aria-label={`${hechas} de ${total} ${total === 1 ? "completada" : "completadas"}`}
        style={{ position: "relative", width: "44px", height: "44px", flexShrink: 0 }}
      >
        <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true" style={{ display: "block", overflow: "visible", filter: tonoBloque.brillo ?? undefined }}>
          {/* Dentro del anillo, un disco del tono: el anillo es su pastilla. Lleno cuando el bloque está completo. */}
          <circle cx="22" cy="22" r={R - 3} fill={completo ? alfa(tono, 0.85) : alfa(tono, 0.13)} />
          <circle cx="22" cy="22" r={R} fill="none" stroke={alfa(tono, 0.18)} strokeWidth="3" />
          {hechas > 0 && (
            <circle
              cx="22" cy="22" r={R} fill="none" stroke={completo ? tono.claro : tonoBloque.acento} strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${((L * hechas) / total).toFixed(2)} ${L.toFixed(2)}`}
              transform="rotate(-90 22 22)"
              style={{ transition: "stroke-dasharray 500ms ease" }}
            />
          )}
        </svg>
        <span
          aria-hidden="true"
          data-fraccion
          style={{
            position: "absolute", inset: 0, display: "grid", placeItems: "center",
            fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "12px", color: completo ? "#0E1B2E" : FAE.text, fontVariantNumeric: "tabular-nums",
          }}
        >
          {hechas}/{total}
        </span>
      </span>
      <span style={{ minWidth: 0 }}>
        <h3 id={`fae-cb-${bloque.id}`} style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "16px", letterSpacing: "-0.01em", lineHeight: 1.2, color: FAE.text }}>
          {bloque.nombre}
        </h3>
        {/* La dificultad, en una pastilla del tono: la misma forma que «Tema n» en la tarjeta. */}
        <span
          style={{
            display: "inline-block", marginTop: "4px", padding: "1px 8px", borderRadius: "999px",
            fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "12px", letterSpacing: "0.03em", lineHeight: 1.3,
            color: tono.claro, background: alfa(tono, 0.14), border: `1px solid ${alfa(tono, 0.32)}`,
          }}
        >
          {bloque.etiqueta}
          <span style={OCULTO}>, {hechas} de {total} completadas</span>
        </span>
      </span>
    </div>
  );
}

/* El círculo del desafío: halo, aro y la ola del nivel del agua. Lo usan las dos formas. */
/*
 * EL DIBUJO DE DENTRO ES DEL TEMA, EL HALO ES DEL SITIO.
 *
 * El aro ámbar, el halo que respira y el relleno al completarlo son la forma de
 * «esto es un desafío» y valen para todos. Lo de dentro identifica a cada uno:
 * las olas son del Arca y la mesa de junta es del Comité de NOVA. Un desafío
 * que no pase su `Marca` se queda con las olas, que es lo que había antes de
 * que existiera el segundo.
 */
function MarcaOlas({ cx, cy, r, completada }) {
  const ola = (dy, opacity) => (
    <path
      d={`M ${cx - r * 0.52} ${cy + r * dy} q ${r * 0.26} ${-r * 0.3}, ${r * 0.52} 0 t ${r * 0.52} 0`}
      fill="none"
      stroke={completada ? FAE.bg : FAE.ambar}
      strokeWidth={Math.max(1.8, r * 0.062)}
      strokeLinecap="round"
      opacity={opacity}
      pointerEvents="none"
    />
  );
  return (
    <>
      {ola(0.16, 1)}
      {ola(0.5, 0.6)}
    </>
  );
}

function IconoDesafio({ cx, cy, r, completada, Marca = MarcaOlas }) {
  return (
    <>
      {/* El halo, que es lo que lo hace "legendario" sin gritar. */}
      <circle className="fae-ch-halo" cx={cx} cy={cy} r={r + r * 0.33} fill={FAE.ambar} />
      <circle cx={cx} cy={cy} r={r + r * 0.13} fill="none" stroke={FAE.ambar} strokeWidth="1.5" opacity="0.4" />
      <circle cx={cx} cy={cy} r={r} fill={completada ? FAE.ambar : "rgba(14,27,46,0.95)"} stroke={FAE.ambar} strokeWidth={Math.max(2.2, r * 0.077)} />
      <Marca cx={cx} cy={cy} r={r} completada={completada} />
    </>
  );
}

/*
 * El desafío en el teléfono: una tarjeta encima del camino. Mismo icono, mismo
 * ámbar, mismos datos que el nodo del ramal; solo cambia dónde está.
 */
function DesafioEnTarjeta({ especial, onAbrir, resaltado, marca, marcas }) {
  return (
    <button
      type="button"
      data-nodo={especial.id}
      onClick={() => onAbrir?.(especial.id)}
      aria-label={etiquetaAria(especial, marcas, especial.etiqueta ? `${especial.etiqueta}: ` : "")}
      className={resaltado === especial.id ? "fae-ch-aqui-caja" : undefined}
      style={{
        display: "flex", alignItems: "center", gap: "14px", width: "100%", textAlign: "left",
        padding: "14px 16px", margin: "0 0 26px", borderRadius: "18px", cursor: "pointer",
        background: "linear-gradient(155deg, rgba(233,196,106,0.10), rgba(10,20,34,0.55) 60%)",
        border: `1px solid ${FAE.ambar}66`, color: FAE.text,
      }}
    >
      <svg width="58" height="58" viewBox="0 0 58 58" aria-hidden="true" style={{ flexShrink: 0, overflow: "visible" }}>
        <IconoDesafio cx={29} cy={29} r={21} completada={especial.completada} Marca={especial.Marca} />
      </svg>
      <span style={{ minWidth: 0 }}>
        <span style={ETIQUETA}>{(especial.etiqueta ?? "Desafío").toUpperCase()}</span>
        <span style={{ display: "block", marginTop: "3px", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "16px", lineHeight: 1.3 }}>
          {especial.nombre}
        </span>
        {marca && <span style={{ ...MARCA, marginTop: "4px", fontSize: "13px" }}>{marca}</span>}
      </span>
    </button>
  );
}

/* ------------------------- las mascotas del camino ------------------------- */

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS MASCOTAS JUNTO AL CAMINO (Mateo, 24-nov: «que estén haciendo algo, como
 * los personajes de un camino de juego»). OPCIONAL: solo lo pide quien pasa
 * `mascotas` (hoy, los temas de Macro 2026). Sin esa propiedad el camino es
 * byte a byte el de siempre: ni geometría, ni estilos, ni nodos nuevos.
 *
 * `mascotas` = { [idNodo]: { src, w, h, id?, pose?, especie? } }: la figura
 * de cada nodo (la de su escena) con su tamaño natural.
 *
 * DÓNDE. Una mascota cada dos nodos, contados desde el que toca jugar, y en la
 * mitad libre: del lado del nodo, hacia el borde (el rótulo va al otro). Para
 * que haya sitio, con mascotas el serpenteo es más estrecho (±38) y los nodos
 * más separados (200): el rótulo de los vecinos queda por encima y por debajo
 * de la mascota, no a su lado.
 *
 * QUE NO PISE NADA, MEDIDO. Al montar y al cambiar de ancho se mide cada caja
 * contra los nodos (con su aro), los rótulos, «Sigue aquí», la línea de
 * puntos y los bordes del lienzo. Si no cabe, ese nodo se queda sin mascota:
 * nunca se encoge por debajo de 120. La del nodo que toca va a 150 (sin
 * globo: Mateo lo pidió quitar el 24-nov); si a 150 no cabe, prueba a 120.
 *
 * DECORATIVAS. aria-hidden, sin foco y sin rótulo de rol (alt vacío): el
 * nodo sigue siendo lo único que se pulsa para jugar. Tocarlas solo las
 * menea una vez.
 *
 * MOVIMIENTO, solo transform y opacity: flotan 3 px en 2,6 s, cada una con
 * su fase; la del nodo que toca da un saltito cada pocos segundos; las de
 * nodos hechos, quietas. Con «reducir movimiento», todo quieto.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const SEPARACION_MASCOTAS = 200;
const MARGEN_Y_MASCOTAS = 112;
/* Arriba, si el primer nodo es el que toca: su mascota va a 150. */
const MARGEN_Y_MASCOTA_ACTUAL = 176;
const AMPLITUD_MASCOTAS = 26;
export const ALTO_MASCOTA = 120;
export const ALTO_MASCOTA_ACTUAL = 150;
const AIRE_NODO = 9;           // unidades del centro del nodo más allá del radio: su aro y su onda
const SALTO = 12;              // px que sube como mucho al saltar
const FLOTE = 3;               // px que sube al flotar

export function medidasConMascotas(n, sugerido = -1) {
  const base = medidas(n);
  const arriba = sugerido === 0 ? MARGEN_Y_MASCOTA_ACTUAL : MARGEN_Y_MASCOTAS;
  return { ...base, separacion: SEPARACION_MASCOTAS, amplitud: AMPLITUD_MASCOTAS, arriba, alto: SEPARACION_MASCOTAS * (n - 1) + arriba + MARGEN_Y_MASCOTAS };
}

export function posicionesConMascotas(n, m) {
  return Array.from({ length: n }, (_, i) => ({
    x: ANCHO / 2 + m.amplitud * Math.cos(i * Math.PI),
    y: m.arriba + i * m.separacion,
  }));
}

/* Qué nodos llevan mascota: uno de cada dos, contando desde el que toca. */
export function nodosConMascota(nodos, mascotas, sugerido) {
  const paridad = sugerido >= 0 ? sugerido % 2 : 0;
  return nodos.map((nodo, i) => ({ nodo, i })).filter(({ nodo, i }) => i % 2 === paridad && mascotas?.[nodo.id]);
}

const punto = ({ p1, c1, c2, p2 }, t) => {
  const a = (1 - t) ** 3, b = 3 * (1 - t) ** 2 * t, c = 3 * (1 - t) * t ** 2, d = t ** 3;
  return { x: a * p1.x + b * c1.x + c * c2.x + d * p2.x, y: a * p1.y + b * c1.y + c * c2.y + d * p2.y };
};
const seCruzan = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
/* Hasta dónde llega un nodo: su aro; el que toca, su onda (r + 4, crece a 1,5). */
const alcanceNodo = (radio, actual) => (actual ? (radio + 4) * 1.5 : radio + AIRE_NODO);

/* La caja (px) que ocupa una mascota de alto `alto` junto al nodo `i`. */
export function cajasMascota({ x, y }, radio, fig, alto, k, actual, anchoPx) {
  const ancho = (alto * fig.w) / fig.h;
  const izquierda = x < ANCHO / 2;
  const aire = alcanceNodo(radio, actual) * k + 2;
  const left = izquierda ? x * k - aire - ancho : x * k + aire;
  const top = y * k - alto / 2;
  const cuerpo = { l: left, t: top - (actual ? SALTO : FLOTE), r: left + ancho, b: top + alto };
  return { left, top, ancho, cajas: [cuerpo] };
}

const CSS_MASCOTAS = `
.fae-ch-masc { position: absolute; z-index: 2; -webkit-tap-highlight-color: transparent; user-select: none; -webkit-user-select: none; }
.fae-ch-masc img { display: block; pointer-events: none; }
.fae-ch-masc-mueve { position: relative; animation: fae-ch-flota 1.3s ease-in-out infinite alternate; }
@keyframes fae-ch-flota { from { transform: translateY(0); } to { transform: translateY(-${FLOTE}px); } }
.fae-ch-masc[data-estado="hecha"] .fae-ch-masc-mueve { animation: none; }
.fae-ch-masc[data-estado="siguiente"] .fae-ch-masc-mueve { animation: fae-ch-salta 3.6s ease-in-out infinite; }
@keyframes fae-ch-salta {
  0%, 70%, 100% { transform: translateY(0); }
  77% { transform: translateY(-${SALTO - 2}px); }
  85% { transform: translateY(0); }
  90% { transform: translateY(-3px); }
  95% { transform: translateY(0); }
}
.fae-ch-masc-cuerpo { transform-origin: 50% 100%; }
.fae-ch-masc-cuerpo.fae-ch-menea { animation: fae-ch-menea 560ms ease-in-out 1; }
@keyframes fae-ch-menea {
  0%, 100% { transform: rotate(0); }
  20% { transform: rotate(-7deg); }
  45% { transform: rotate(6deg); }
  70% { transform: rotate(-3deg); }
}
@media (prefers-reduced-motion: reduce) {
  .fae-ch-masc-mueve, .fae-ch-masc-cuerpo.fae-ch-menea { animation: none !important; }
}
`;

function MascotasCamino({ nodos, p, m, anchoTotal, mascotas, sugerido }) {
  const capa = useRef(null);
  const [puestas, setPuestas] = useState(null);
  const slots = nodosConMascota(nodos, mascotas, sugerido);
  const clave = slots.map(({ nodo }) => `${nodo.id}:${mascotas[nodo.id].src}`).join("|") + `#${sugerido}#${p.length}`;

  useLayoutEffect(() => {
    const el = capa.current;
    if (!el) return undefined;
    const medir = () => {
      const anchoPx = el.clientWidth;
      const altoPx = el.clientHeight;
      if (!anchoPx || !altoPx) return;
      const k = anchoPx / anchoTotal;
      const base = el.getBoundingClientRect();
      const obst = [];
      el.parentElement.querySelectorAll(".fae-ch-rotulo, [data-sigue-aqui]").forEach((e) => {
        for (const r of e.getClientRects()) obst.push({ l: r.left - base.left, t: r.top - base.top, r: r.right - base.left, b: r.bottom - base.top });
      });
      p.forEach(({ x, y }, i) => {
        const rn = alcanceNodo(m.radio, i === sugerido) * k;
        obst.push({ l: x * k - rn, t: y * k - rn, r: x * k + rn, b: y * k + rn + ALTURA_NODO * k });
      });
      const g = (m.grosor * k) / 2 + 4;
      tramosDe(p).forEach((t) => {
        for (let s = 0; s <= 32; s += 1) {
          const q = punto(t, s / 32);
          obst.push({ l: q.x * k - g, t: q.y * k - g, r: q.x * k + g, b: q.y * k + g });
        }
      });
      const res = {};
      for (const { nodo, i } of slots) {
        const actual = i === sugerido;
        res[nodo.id] = null;
        for (const alto of actual ? [ALTO_MASCOTA_ACTUAL, ALTO_MASCOTA] : [ALTO_MASCOTA]) {
          const c = cajasMascota(p[i], m.radio, mascotas[nodo.id], alto, k, actual, anchoPx);
          const dentro = c.cajas.every((b) => b.l >= 0 && b.r <= anchoPx && b.t >= 0 && b.b <= altoPx);
          if (dentro && !c.cajas.some((b) => obst.some((o) => seCruzan(b, o)))) {
            res[nodo.id] = { alto, left: c.left, top: c.top, ancho: c.ancho };
            break;
          }
        }
      }
      setPuestas(res);
    };
    medir();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => medir());
    ro?.observe(el);
    let vivo = true;
    document.fonts?.ready?.then(() => { if (vivo) medir(); });
    return () => { vivo = false; ro?.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, anchoTotal]);

  const menea = (e) => {
    const cuerpo = e.currentTarget.querySelector(".fae-ch-masc-cuerpo");
    if (!cuerpo) return;
    cuerpo.classList.remove("fae-ch-menea");
    void cuerpo.getBoundingClientRect();
    cuerpo.classList.add("fae-ch-menea");
  };

  return (
    <div ref={capa} aria-hidden="true" data-mascotas-camino="" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <style>{CSS_MASCOTAS}</style>
      {slots.map(({ nodo, i }) => {
        const fig = mascotas[nodo.id];
        const sitio = puestas?.[nodo.id];
        const actual = i === sugerido;
        const estado = nodo.completada ? "hecha" : actual ? "siguiente" : "pendiente";
        const alto = sitio?.alto ?? (actual ? ALTO_MASCOTA_ACTUAL : ALTO_MASCOTA);
        const ancho = Math.round((alto * fig.w) / fig.h);
        return (
          <div
            key={nodo.id}
            className="fae-ch-masc"
            data-mascota-camino={nodo.id}
            data-mascota={fig.id}
            data-pose={fig.pose}
            data-especie={fig.especie}
            data-estado={estado}
            data-alto={sitio ? sitio.alto : undefined}
            hidden={!sitio}
            onClick={menea}
            onAnimationEnd={(e) => e.target.classList.remove("fae-ch-menea")}
            style={{ left: `${(sitio?.left ?? 0).toFixed(1)}px`, top: `${(sitio?.top ?? 0).toFixed(1)}px`, width: `${ancho}px`, height: `${alto}px`, pointerEvents: "auto" }}
          >
            <div className="fae-ch-masc-mueve" style={{ animationDelay: `-${((i * 0.83) % 2.6).toFixed(2)}s` }}>
              <img className="fae-ch-masc-cuerpo" src={fig.src} alt="" width={ancho} height={alto} loading={i >= 3 ? "lazy" : "eager"} decoding="async" draggable={false} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
