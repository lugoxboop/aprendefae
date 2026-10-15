import { useCallback, useEffect, useRef, useState } from "react";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL MOVIMIENTO DE r5-1 v2 (Célula E): lo que comparten las seis figuras.
 *
 *   · `useReducido`: prefers-reduced-motion. Con él no hay recoger, trasladar
 *     ni desplazamiento suave: el estado final va directo (§0 del paquete).
 *   · `useTemporizadores`: setTimeout que se limpian al desmontar.
 *   · `useCifra`: una cifra que cuenta del valor viejo al nuevo.
 *   · `terminarAnimaciones`: el «toque que salta» (v2.1, decisión 7). Lleva al
 *     final toda animación en curso dentro de un elemento, sean transiciones
 *     de CSS o animaciones de la API web, y las cifras que cuentan.
 *   · `llevarArriba` / `asomarAbajo`: el desplazamiento de la página, 300 ms.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * La ventana útil (§0). Itagaki supuso una barra del sitio de 56 px. Medido en
 * Chromium (build servido en local): la vista del tema no tiene barra, pero el
 * botón de cuenta va fijo arriba a la derecha y baja hasta 54 px a 320 y 56 a
 * 375. Los 56 se quedan: lo que se lleva arriba no queda debajo del botón.
 */
export const BARRA_DEL_SITIO = 56;
export const MARGEN_VENTANA = 16;

export function useReducido() {
  const [reducido] = useState(() => {
    try {
      return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    } catch {
      return false;
    }
  });
  return reducido;
}

export function useTemporizadores() {
  const ids = useRef([]);
  useEffect(() => () => { ids.current.forEach(clearTimeout); ids.current = []; }, []);
  const despues = useCallback((ms, fn) => {
    const id = setTimeout(() => { ids.current = ids.current.filter((x) => x !== id); fn(); }, ms);
    ids.current.push(id);
    return id;
  }, []);
  const cancelar = useCallback(() => { ids.current.forEach(clearTimeout); ids.current = []; }, []);
  return { despues, cancelar };
}

/*
 * Las cifras que cuentan se apuntan aquí para que el toque que salta las lleve
 * a su valor final. Un registro por página basta: solo una figura se mueve.
 */
const CIFRAS_EN_CURSO = new Set();

export function terminarAnimaciones(el) {
  if (el?.getAnimations) {
    for (const a of el.getAnimations({ subtree: true })) {
      try { a.finish(); } catch { /* una animación infinita no se termina: se deja */ }
    }
  }
  for (const fin of [...CIFRAS_EN_CURSO]) fin();
}

/*
 * Una cifra que va de `desde` a `valor` en `ms`. Con `ms` en 0 (o con
 * reduced-motion) salta. Devuelve el número que se pinta.
 */
export function useCifra(valor, ms, desde = valor) {
  const reducido = useReducido();
  const [pintado, setPintado] = useState(ms && !reducido ? desde : valor);
  useEffect(() => {
    if (!ms || reducido || typeof requestAnimationFrame !== "function") { setPintado(valor); return undefined; }
    const inicio = performance.now();
    let id = null;
    const fin = () => { if (id !== null) cancelAnimationFrame?.(id); id = null; CIFRAS_EN_CURSO.delete(fin); setPintado(valor); };
    const paso = (t) => {
      const x = Math.min(1, (t - inicio) / ms);
      const e = 1 - (1 - x) ** 3;
      if (x >= 1) { fin(); return; }
      setPintado(desde + (valor - desde) * e);
      id = requestAnimationFrame(paso);
    };
    CIFRAS_EN_CURSO.add(fin);
    id = requestAnimationFrame(paso);
    return () => { if (id !== null) cancelAnimationFrame?.(id); CIFRAS_EN_CURSO.delete(fin); };
  }, [valor, ms, desde, reducido]);
  return pintado;
}

/* El desplazamiento de la página, en 300 ms (o de golpe con reduced-motion). */
function desplazar(destino, reducido, ms = 300) {
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const fin = Math.max(0, Math.min(max, destino));
  const inicio = window.scrollY;
  if (reducido || Math.abs(fin - inicio) < 1 || typeof requestAnimationFrame !== "function") {
    window.scrollTo?.(0, fin);
    return;
  }
  const t0 = performance.now();
  const paso = (t) => {
    const x = Math.min(1, (t - t0) / ms);
    const e = 1 - (1 - x) ** 3;
    window.scrollTo(0, inicio + (fin - inicio) * e);
    if (x < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

/* Deja el borde superior de `el` a 16 px del de la ventana útil. */
export function llevarArriba(el, reducido) {
  if (!el?.getBoundingClientRect) return;
  const r = el.getBoundingClientRect();
  desplazar(window.scrollY + r.top - BARRA_DEL_SITIO - MARGEN_VENTANA, reducido);
}

/* Si el borde inferior de `el` se sale por abajo, desplaza lo justo para dejarlo a 16 px. */
export function asomarAbajo(el, reducido) {
  if (!el?.getBoundingClientRect) return;
  const r = el.getBoundingClientRect();
  const limite = window.innerHeight - MARGEN_VENTANA;
  if (r.bottom > limite) desplazar(window.scrollY + r.bottom - limite, reducido);
}

/*
 * FLIP: cuando un elemento cambia de sitio en el DOM, se anima desde donde
 * estaba. `antes` es su rectángulo de antes del cambio.
 */
export function volarDesde(el, antes, ms, { retraso = 0, reducido = false } = {}) {
  if (!el || !antes || reducido || typeof el.animate !== "function") return null;
  const ahora = el.getBoundingClientRect();
  const dx = antes.left - ahora.left;
  const dy = antes.top - ahora.top;
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return null;
  return el.animate(
    [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
    { duration: ms, delay: retraso, easing: "cubic-bezier(.2,.7,.2,1)", fill: "backwards" },
  );
}

/*
 * Una reproducción de figura: `clave` cambia cada vez que hay que reproducir
 * (null = la figura quieta, antes de responder). Fases: «quieta», «inicio»
 * (todo en su punto de partida, sin transición), «animando» (los valores
 * finales con sus transiciones y retrasos) y «final» (los valores finales sin
 * transición). `saltar` lleva a «final» al instante: es el toque que salta.
 * Con reduced-motion se va a «final» directo. `onTerminar` se llama una vez
 * por reproducción, al acabar o al saltar.
 */
export function useReproduccion(clave, duracion, onTerminar) {
  const reducido = useReducido();
  const [fase, setFase] = useState(clave === null ? "quieta" : reducido ? "final" : "inicio");
  const avisado = useRef(null);
  const terminar = useRef(onTerminar);
  terminar.current = onTerminar;
  const { despues, cancelar } = useTemporizadores();

  const acabar = useCallback(() => {
    cancelar();
    setFase("final");
    if (avisado.current !== clave) { avisado.current = clave; terminar.current?.(); }
  }, [clave, cancelar]);

  useEffect(() => {
    cancelar();
    if (clave === null) { setFase("quieta"); return undefined; }
    if (reducido || !duracion) { acabar(); return undefined; }
    setFase("inicio");
    let a = null;
    let b = null;
    const raf = typeof requestAnimationFrame === "function" ? requestAnimationFrame : (fn) => setTimeout(fn, 16);
    a = raf(() => { b = raf(() => { setFase("animando"); despues(duracion, acabar); }); });
    return () => {
      const caf = typeof cancelAnimationFrame === "function" ? cancelAnimationFrame : clearTimeout;
      if (a) caf(a);
      if (b) caf(b);
    };
  }, [clave]); // eslint-disable-line react-hooks/exhaustive-deps

  const saltar = useCallback(() => { if (fase === "inicio" || fase === "animando") acabar(); }, [fase, acabar]);
  return { fase, saltar, reducido };
}

/*
 * El estilo de un elemento según la fase: `desde` en «inicio»/«quieta», `hasta`
 * en «animando» y «final»; la transición, solo en «animando».
 */
export function enFase(fase, desde, hasta, { ms = 200, retraso = 0, propiedades = "transform, opacity" } = {}) {
  if (fase === "quieta" || fase === "inicio") return { ...desde, transition: "none" };
  if (fase === "final") return { ...hasta, transition: "none" };
  return {
    ...hasta,
    transitionProperty: propiedades,
    transitionDuration: `${ms}ms`,
    transitionDelay: `${retraso}ms`,
    transitionTimingFunction: "cubic-bezier(.2,.7,.2,1)",
  };
}
