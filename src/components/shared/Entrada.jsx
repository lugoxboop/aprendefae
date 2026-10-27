import { useState } from "react";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ENTRADA — cómo aparece una pantalla de AprendeFAE.
 *
 * POR QUÉ EXISTE
 * Mateo lo dijo sin rodeos: «la página es demasiado estática, no tiene
 * apertura». Una pantalla que ya está toda ahí cuando llegas no te dice por
 * dónde empezar a mirar. Una que se arma delante de ti sí: lo que entra
 * primero es lo primero que importa.
 *
 * LOS TRES PRINCIPIOS QUE APLICA (de los 12 de Issara Willenskomer, los que
 * Mateo pidió)
 *
 *   · EASING. Nada se mueve a velocidad constante: arranca rápido y frena,
 *     con la curva que ya usa el proyecto —cubic-bezier(.3,.9,.4,1), la misma
 *     de IdentificadorDeTema, Balanza y el camino—. No se inventa otra: dos
 *     curvas en un sitio se notan como dos sitios.
 *
 *   · OFFSET & DELAY. Los hermanos no entran juntos, entran en fila, 80 ms
 *     uno detrás de otro. Es lo que convierte «todo apareció» en «esto,
 *     luego esto»: la fila es la jerarquía, contada en el tiempo.
 *
 *   · PARALLAX, en su versión honesta. Sin atar nada al scroll: lo que está
 *     más al fondo recorre más distancia al entrar (una tarjeta, 26 px; el
 *     titular, 18; el pie, 10). El ojo lee esa diferencia como profundidad,
 *     y no cuesta ni un oyente de scroll.
 *
 * LO QUE NO HACE
 * Solo `transform` y `opacity`: son las dos propiedades que el navegador
 * puede animar sin volver a calcular la página, así que no hay tirones ni en
 * un teléfono viejo. Nada se queda en bucle —esto es una entrada, no un
 * adorno—, y con movimiento reducido no hay desplazamiento ninguno: un
 * fundido corto y ya. Quien pide menos movimiento no pide «el mismo
 * movimiento más despacio».
 *
 * CÓMO SE USA
 * La forma preferida es la función `entrada()`, que no añade ni una etiqueta
 * al DOM: devuelve className y style para esparcir sobre lo que ya existe.
 *
 *   import { EstiloEntrada, entrada } from "./shared/Entrada.jsx";
 *
 *   <EstiloEntrada />                     ← una vez por pantalla
 *   <h1 {...entrada(1)}>…</h1>            ← el orden es la coreografía
 *   <div {...entrada(2, "crece")}>…</div>
 *
 * Cuando el hijo es un componente ajeno al que no se le pueden pasar estilos
 * (Hero, Footer), se envuelve con <Entrada orden={2}>…</Entrada>.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* La curva de la casa. Si algún día cambia, cambia aquí y en ningún otro sitio. */
export const CURVA = "cubic-bezier(.3,.9,.4,1)";

/* El hueco entre hermanos. 80 ms se lee como fila; 40 se lee como ruido y 160
 * como espera. Es el mismo escalón que ya usa el Aprender en secuencia. */
export const PASO = 80;

/* Lo que tarda cada pieza. 280 ms: por debajo de 200 no se percibe la curva y
 * por encima de 350 el estudiante ya quiere tocar y la página aún se mueve. */
export const DURACION = 280;

/*
 * Los modos. El número es cuánto recorre: cuanto más al fondo esté la pieza,
 * más viaja, y esa diferencia es toda la profundidad que hace falta.
 *
 *   baja   −10 px  lo que cuelga de arriba: marca, cabecera.
 *   sube    18 px  el cuerpo: titulares, texto, bloques.
 *   fondo   26 px  lo que va más atrás y entra desde más lejos.
 *   crece    8 px  + escala 0,965. Para lo que se toca: tarjetas y botones.
 *                  Un botón que además crece un pelo se lee como que tiene
 *                  bulto, que es justo lo que pidió Mateo del estilo Duolingo.
 *   pie     10 px  lo accesorio, que entra al final y casi sin moverse.
 */
export const MODOS = {
  baja: { y: -10, escala: 1 },
  sube: { y: 18, escala: 1 },
  fondo: { y: 26, escala: 1 },
  crece: { y: 8, escala: 0.965 },
  pie: { y: 10, escala: 1 },
};

export const CSS = `
.fae-ent {
  animation: fae-ent-entra var(--fae-ent-dur) ${CURVA} var(--fae-ent-esp) both;
}
@keyframes fae-ent-entra {
  from { opacity: 0; transform: translate3d(0, var(--fae-ent-y), 0) scale(var(--fae-ent-escala)); }
  to   { opacity: 1; transform: none; }
}
/*
 * Movimiento reducido: se cambia la animación entera, no se le baja el volumen.
 * Queda el fundido —que sigue contando el orden de entrada— y desaparece todo
 * desplazamiento y toda escala.
 */
@media (prefers-reduced-motion: reduce) {
  .fae-ent {
    animation-name: fae-ent-funde;
    animation-duration: 140ms;
  }
}
@keyframes fae-ent-funde {
  from { opacity: 0; }
  to   { opacity: 1; }
}
`;

/*
 * ═══════════ UNA VEZ POR VISITA ═══════════
 *
 * La idea es de la Célula A, del #552: la secuencia del inicio es la entrada
 * a la APLICACIÓN, no a la pantalla. Si el estudiante entra a una materia y
 * vuelve al inicio, el inicio ya está puesto: volver a armarlo delante de él
 * la tercera vez deja de ser una apertura y pasa a ser una espera.
 *
 * Se recuerda en memoria del módulo, que se olvida al recargar. No se guarda
 * nada en el navegador: no hay nada aquí que merezca sobrevivir a una
 * recarga, y sí hay un coste en guardarlo.
 *
 * Esto vale para la PORTADA. La pantalla de materia sí anima cada vez: entrar
 * a Contabilidad es llegar a un sitio nuevo, no volver al mismo.
 */
let yaEntro = false;

/** Verdadero solo en el primer montaje de la visita. */
export function usarEntradaUnaVez() {
  const [primera] = useState(() => {
    const esLaPrimera = !yaEntro;
    yaEntro = true;
    return esLaPrimera;
  });
  return primera;
}

/** Solo para las pruebas: vuelve al estado de primera visita. */
export function olvidarEntrada() {
  yaEntro = false;
}

/* El <style> de la entrada. Una vez por pantalla, arriba, antes que lo que anima. */
export function EstiloEntrada() {
  return <style>{CSS}</style>;
}

/*
 * entrada(orden, modo, opciones) → { className, style }
 *
 * `orden` es el puesto en la fila: 0 entra ya, 1 a los 80 ms, 2 a los 160.
 * `retardo` suma milisegundos sueltos cuando una pieza tiene que esperar algo
 * que no es un hermano suyo (p. ej. un fondo que tarda en pintar).
 */
export function entrada(orden = 0, modo = "sube", { retardo = 0, duracion = DURACION, activa = true } = {}) {
  /* Apagada no devuelve nada: la pieza se pinta donde va, sin clase y sin
     variables. Es lo que usa la portada cuando no es la primera visita. */
  if (!activa) return {};
  const m = MODOS[modo] || MODOS.sube;
  const espera = Math.max(0, Math.round(orden * PASO + retardo));
  return {
    className: "fae-ent",
    style: {
      "--fae-ent-y": `${m.y}px`,
      "--fae-ent-escala": String(m.escala),
      "--fae-ent-dur": `${duracion}ms`,
      "--fae-ent-esp": `${espera}ms`,
    },
  };
}

/*
 * El envoltorio, para cuando el hijo no acepta className ni style. Añade un
 * div, así que se usa solo cuando hace falta: `entrada()` no añade nada.
 *
 * `estira` pone el envoltorio en grid para que el hijo siga ocupando toda la
 * celda: sin eso, una tarjeta dentro de una rejilla se encoge al envolverla.
 */
export default function Entrada({
  orden = 0,
  modo = "sube",
  retardo = 0,
  duracion = DURACION,
  activa = true,
  estira = false,
  style,
  children,
  ...resto
}) {
  const e = entrada(orden, modo, { retardo, duracion, activa });
  return (
    <div
      {...resto}
      className={[e.className, resto.className].filter(Boolean).join(" ")}
      style={{ ...e.style, ...(estira ? { display: "grid" } : null), ...style }}
    >
      {children}
    </div>
  );
}
