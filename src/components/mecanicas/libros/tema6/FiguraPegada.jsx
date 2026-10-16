import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · LA FIGURA PEGADA DE LA CAPA 3 (§2b de Mai, enganche B1-B5).
 *
 * La figura pequeña de T5 · A1, T5 · A2, T6 · A1 y T6 · A2 va entre la
 * consigna y las cajas, y se queda pegada arriba de la capa mientras se
 * recorren las cajas: top = alto de la cabecera, fondo opaco.
 *
 * No es `position: sticky`: el fondo de la materia (FondoMateria) lleva
 * `overflow: hidden` y con eso sticky no se pega a nada (lo mismo que en
 * MismoHecho y en el bloque de MaquinaPegada). Se pega por script: cuando su
 * sitio sube por encima del tope, la figura pasa a `position: fixed` en el
 * tope, con el ancho y la izquierda de su sitio, y en su sitio queda un hueco
 * del mismo alto (la página no se mueve). Al acabarse la capa, sube con ella,
 * como sticky dentro de su contenedor. Se recalcula en scroll, en resize y
 * cuando la figura cambia de alto (al llenarse), una vez por cuadro.
 *
 * El tope es la variable CSS `--act-tope` del documento (la de PatronT7_3):
 * 0 si no hay cabecera fija. Con la cabecera de 56 de las medidas de Mai, 56.
 * Lleva 8 de fondo arriba y abajo (en su sitio, 4 de margen + 8 = los 12 de
 * siempre bajo la consigna): pegada, las cajas no rozan la figura.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const FONDO = FAE.bg;
const SEPARACION = 8;

/** El alto de la cabecera fija de la página (--act-tope), o 0. */
export function topeDeLaCabecera() {
  if (typeof document === "undefined") return 0;
  const v = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--act-tope"));
  return Number.isFinite(v) ? v : 0;
}

/*
 * Al decidir (§2b): la página se mueve lo justo para que se vea entera la
 * devolución (o el texto) y, arriba, la opción elegida debajo de la figura
 * pegada. Si no caben juntas, manda la opción: la figura y lo elegido arriba.
 */
export function asomarBajoLaFigura(figura, arriba, abajo, reducido) {
  if (!arriba || !abajo || typeof window === "undefined") return;
  const alto = figura?.getBoundingClientRect().height ?? 0;
  const limiteArriba = topeDeLaCabecera() + alto + SEPARACION;
  const limiteAbajo = window.innerHeight - SEPARACION;
  const a = arriba.getBoundingClientRect();
  const b = abajo.getBoundingClientRect();
  let delta = 0;
  if (b.bottom > limiteAbajo) delta = b.bottom - limiteAbajo;
  if (a.top - delta < limiteArriba) delta = a.top - limiteArriba;
  if (Math.abs(delta) > 0.5) window.scrollBy?.({ top: delta, behavior: reducido ? "auto" : "smooth" });
}

const FiguraPegada = forwardRef(function FiguraPegada({ contenedor, children }, ref) {
  const hueco = useRef(null);
  const figura = useRef(null);
  /* null en su sitio; { top, left, width, alto } cuando va fija. */
  const [fija, setFija] = useState(null);
  const poner = (n) => {
    figura.current = n;
    if (typeof ref === "function") ref(n);
    else if (ref) ref.current = n;
  };

  useLayoutEffect(() => {
    let cuadro = null;
    const calcular = () => {
      cuadro = null;
      const h = hueco.current; const f = figura.current; const c = contenedor?.current;
      if (!h || !f || !c) return;
      const tope = topeDeLaCabecera();
      const sitio = h.getBoundingClientRect();
      const alto = f.getBoundingClientRect().height;
      const fin = c.getBoundingClientRect().bottom;
      const va = sitio.top < tope && fin > tope && alto > 0;
      setFija((antes) => {
        if (!va) return antes === null ? antes : null;
        /* Al acabarse la capa, sube con ella. */
        const nuevo = { top: Math.min(tope, fin - alto), left: sitio.left, width: sitio.width, alto };
        return antes && ["top", "left", "width", "alto"].every((k) => Math.abs(antes[k] - nuevo[k]) < 0.5) ? antes : nuevo;
      });
    };
    const pedir = () => { if (cuadro === null) cuadro = requestAnimationFrame(calcular); };
    calcular();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    const ro = typeof ResizeObserver !== "undefined" && figura.current ? new ResizeObserver(pedir) : null;
    ro?.observe(figura.current);
    return () => {
      window.removeEventListener("scroll", pedir); window.removeEventListener("resize", pedir); ro?.disconnect();
      if (cuadro !== null) cancelAnimationFrame(cuadro);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={hueco} data-hueco-figura style={{ marginTop: "4px", height: fija ? `${fija.alto}px` : undefined }}>
      <div ref={poner} data-figura-capa3 data-pegada={fija ? "si" : "no"} style={{
        ...(fija ? { position: "fixed", top: `${fija.top}px`, left: `${fija.left}px`, width: `${fija.width}px` } : { position: "relative" }),
        zIndex: 15, boxSizing: "border-box", background: FONDO, padding: `${SEPARACION}px 0`,
      }}>
        {children}
      </div>
    </div>
  );
});

export default FiguraPegada;
