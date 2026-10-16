import { useLayoutEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { AsientoEnLineas } from "../piezas.jsx";
import { Plazos, CSS_T73_PATRON, sinPartir } from "./PatronT7_3.jsx";
import { topeDeLaCabecera } from "../tema6/FiguraPegada.jsx";
import { visiblesDeFigura } from "../../../../contabilidad/figuraAcumulada.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA FIGURA ACUMULADA (Célula C · lote 5 de L): la figura que crece y se queda.
 *
 * Un solo patrón para los Hacer donde la figura se completa con cada
 * respuesta, como «Llena el kárdex»: T7-1 H3, H4 y H6, T7-2 H5, T7-3 H2 y
 * H4, y T5 N4. Las filas las pone cada pieza desde sus datos
 * (contabilidad/figuraAcumulada.js); aquí solo se pintan y se sostienen.
 *
 *   · Va arriba del ítem (entre lo fijo de la pieza y el contador).
 *   · Gana su parte al CERRARSE cada ítem, nunca antes (E8): la pieza le pasa
 *     `cerrados` (ítems ya cerrados, contando el de ahora si ya se cerró) y
 *     `listo`. Lo nuevo entra con el fundido de 120 ms; con movimiento
 *     reducido, sin fundido, en el mismo momento.
 *   · Se queda arriba mientras se responde: cuando su sitio sube por encima
 *     del tope de la página, se pega ahí (position: fixed, como FiguraPegada
 *     de T6: el fondo de la materia lleva overflow: hidden y sticky no pega),
 *     hasta que se acaba la tarjeta de la pieza. Pegada, mide como mucho el
 *     40 % del alto de la ventana: si es más alta, se desplaza por dentro y
 *     enseña lo último que ganó. Así el ítem sigue alcanzable debajo.
 *   · Si algo recibe el foco debajo de la figura pegada (la pregunta, el
 *     mensaje, «Siguiente ítem»), la página se mueve lo justo para que se vea.
 *
 * FORMA PROVISIONAL PARA WATARI: sobria, con las clases del Patrón T7-3
 * (renglones, `.t73pt`) y el asiento con sus sumas de piezas.jsx. Ni teal ni
 * ámbar para marcar nada: solo los rótulos DEBE y HABER llevan su color.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const FRACCION_PEGADA = 0.4;
const SEPARACION = 8;
const OP_SR = { "+": "más ", "−": "menos ", "×": "por ", "=": "igual a " };
const miles = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const valor = (v) => (typeof v === "number" ? miles(v) : sinPartir(v));

export const CSS_FIGURA_ACUMULADA = `
.t7fa { margin: 0 0 12px; }
.t7fa-caja { box-sizing: border-box; background: ${FAE.bg}; }
.t7fa-caja[data-pegada="si"] { padding: ${SEPARACION}px 0; overflow-y: auto; overscroll-behavior: contain; border-bottom: 1px solid rgba(248,249,250,0.14); }
.t7fa .t73pt .rg:last-child, .t7fa .t7fa-bloque:last-child { margin-bottom: 0; }
.t7fa-bloque { margin: 0 0 12px; }
.t7fa .rg-sub { padding: 6px 0 2px; font: 600 13px/1.3 "Sora", "Inter", sans-serif; color: var(--p-texto2); }
.t7fa .rg-sub:first-of-type { padding-top: 0; }
.t7fa .rg-texto .rg-rot { grid-column: 2 / 4; }
.t7fa .rg-texto .rg-v { grid-column: 2 / 4; white-space: normal; text-align: left; overflow-wrap: break-word; font-size: 14px; }
.t7fa-tit { margin: 0 0 6px; font: 600 13px/1.3 "Sora", "Inter", sans-serif; color: #F8F9FA; }
.t7fa-tabla { container: t7fa-tabla / inline-size; border: 1px solid #B8C4D4; border-radius: 10px; padding: 10px 12px; }
.t7fa-rejilla { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 8px; row-gap: 2px; font-family: "Inter", sans-serif; color: #F8F9FA; }
.t7fa-rejilla > * { min-width: 0; }
.t7fa-col { font: 600 12px/1.3 "Inter", sans-serif; color: #A8B6C8; text-align: right; overflow-wrap: break-word; padding-bottom: 4px; }
.t7fa-vacia { display: none; }
.t7fa-rot { grid-column: 1 / -1; font-size: 13px; line-height: 1.35; color: #F8F9FA; padding-top: 4px; }
.t7fa-v { font-size: 13px; line-height: 1.4; font-variant-numeric: tabular-nums; white-space: nowrap; text-align: right; }
.t7fa-res .t7fa-v { font-weight: 700; border-top: 1px solid #B8C4D4; padding-top: 2px; }
.t7fa-res.t7fa-rot { font-weight: 600; }
@container t7fa-tabla (min-width: 420px) {
  .t7fa-rejilla { grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 1fr)); align-items: baseline; }
  .t7fa-vacia { display: block; }
  .t7fa-rot { grid-column: auto; padding-top: 2px; }
}
.t7fa-entra { animation: t7fa-aparece .12s ease-out; }
@keyframes t7fa-aparece { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .t7fa-entra, .t7fa .rg-nuevo { animation: none !important; } }
`;

/*
 * Dónde va la figura: null en su sitio; pegada, { top, left, width, max }.
 * Se pega cuando su sitio sube por encima del tope y la tarjeta sigue debajo;
 * al acabarse la tarjeta, sube con ella. `alto` es lo que mide entera.
 */
export function posicionPegada({ sitio, fin, alto, tope, ventana }) {
  if (!(alto > 0) || !(sitio.top < tope) || !(fin > tope)) return null;
  const max = Math.min(alto + 2 * SEPARACION, Math.max(0, Math.floor(ventana * FRACCION_PEGADA)));
  return { top: Math.min(tope, fin - max), left: sitio.left, width: sitio.width, max };
}

function Renglones({ b }) {
  return (
    <div className="t73pt">
      <figure className={`rg${b.nuevo ? " rg-nuevo" : ""}`} role="table" aria-label={b.titulo ?? undefined} data-renglones={b.titulo ?? ""} data-bloque={b.clave}>
        {b.titulo && <figcaption className="rg-tit">{b.titulo}</figcaption>}
        {b.filas.map((f, k) => (f.tit ? (
          <div key={k} role="row" className={`rg-sub${f.nuevo ? " rg-nuevo" : ""}`} data-subtitulo>
            <span role="rowheader">{sinPartir(f.tit)}</span>
          </div>
        ) : (
          <div key={k} role="row" data-renglon
            className={`rg-f${f.res ? " rg-res" : ""}${f.fuerte ? " rg-fuerte" : ""}${f.nuevo ? " rg-nuevo" : ""}${f.texto ? " rg-texto" : ""}`}>
            <span className="rg-op" aria-hidden="true">{f.op ?? ""}</span>
            <span className="rg-rot" role="rowheader">
              {f.op && <span className="sr">{OP_SR[f.op]}</span>}
              {sinPartir(f.rot)}
            </span>
            <span className="rg-v" role="cell">{valor(f.v)}</span>
          </div>
        )))}
        {b.nota && <p className="rg-nota">{sinPartir(b.nota)}</p>}
      </figure>
    </div>
  );
}

function Asiento({ b }) {
  return (
    <figure className={`t7fa-bloque${b.nuevo ? " t7fa-entra" : ""}`} data-bloque={b.clave} data-asiento-figura>
      {b.titulo && <figcaption className="t7fa-tit">{b.titulo}</figcaption>}
      <AsientoEnLineas lineas={b.lineas} totales={Boolean(b.totales)} />
    </figure>
  );
}

function Tabla({ b }) {
  return (
    <figure className={`t7fa-bloque t7fa-tabla${b.nuevo ? " t7fa-entra" : ""}`} role="table" data-bloque={b.clave} data-tabla-figura>
      <div className="t7fa-rejilla">
        <div role="row" style={{ display: "contents" }}>
          <span className="t7fa-vacia" aria-hidden="true" />
          {b.columnas.map((c) => <span key={c} className="t7fa-col" role="columnheader">{c}</span>)}
        </div>
        {b.filas.map((f) => (
          <div key={f.rot} role="row" className={f.res ? "t7fa-res" : undefined} style={{ display: "contents" }} data-fila-tabla={f.rot}>
            <span className={`t7fa-rot${f.res ? " t7fa-res" : ""}`} role="rowheader">{f.rot}</span>
            {f.valores.map((v, k) => <span key={k} className="t7fa-v" role="cell">{valor(v)}</span>)}
          </div>
        ))}
      </div>
    </figure>
  );
}

function Bloque({ b }) {
  if (b.tipo === "asiento") return <Asiento b={b} />;
  if (b.tipo === "tabla") return <Tabla b={b} />;
  if (b.tipo === "plazos") return <Plazos venta={b.venta} condiciones={b.condiciones} pago={b.pago} nuevo={b.nuevo} />;
  return <Renglones b={b} />;
}

/*
 * figura: los bloques (contabilidad/figuraAcumulada.js); cerrados: los ítems
 * cerrados; listo: el de ahora ya se cerró. Sin nada cerrado no ocupa sitio.
 */
export default function FiguraAcumulada({ figura, cerrados, listo = false }) {
  const visibles = visiblesDeFigura(figura.map((b, k) => ({ ...b, clave: `${b.tipo}-${k}` })), cerrados, listo);
  const hueco = useRef(null);
  const caja = useRef(null);
  const contenido = useRef(null);
  const [pegada, setPegada] = useState(null);
  const [alto, setAlto] = useState(0);
  const hay = visibles.length > 0;

  useLayoutEffect(() => {
    if (!hay) return undefined;
    let cuadro = null;
    const tarjeta = () => hueco.current?.closest("section") ?? hueco.current?.parentElement ?? null;
    const calcular = () => {
      cuadro = null;
      const h = hueco.current; const c = contenido.current; const t = tarjeta();
      if (!h || !c || !t) return;
      const natural = c.getBoundingClientRect().height;
      setAlto((a) => (Math.abs(a - natural) < 0.5 ? a : natural));
      const nueva = posicionPegada({ sitio: h.getBoundingClientRect(), fin: t.getBoundingClientRect().bottom, alto: natural, tope: topeDeLaCabecera(), ventana: window.innerHeight });
      setPegada((antes) => {
        if (!nueva) return antes === null ? antes : null;
        return antes && ["top", "left", "width", "max"].every((k) => Math.abs(antes[k] - nueva[k]) < 0.5) ? antes : nueva;
      });
    };
    const pedir = () => { if (cuadro === null) cuadro = requestAnimationFrame(calcular); };
    /* Lo que recibe el foco debajo de la figura pegada se asoma: la página se mueve lo justo. */
    const alFoco = (e) => {
      const f = caja.current; const t = tarjeta();
      if (!f || !t || f.dataset.pegada !== "si" || !t.contains(e.target) || f.contains(e.target)) return;
      const bajo = f.getBoundingClientRect().bottom + SEPARACION;
      const r = e.target.getBoundingClientRect();
      if (r.top < bajo) window.scrollBy?.({ top: r.top - bajo, behavior: "auto" });
    };
    calcular();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    document.addEventListener("focusin", alFoco);
    const ro = typeof ResizeObserver !== "undefined" && contenido.current ? new ResizeObserver(pedir) : null;
    ro?.observe(contenido.current);
    return () => {
      window.removeEventListener("scroll", pedir); window.removeEventListener("resize", pedir);
      document.removeEventListener("focusin", alFoco); ro?.disconnect();
      if (cuadro !== null) cancelAnimationFrame(cuadro);
    };
  }, [hay]);

  /* Pegada y más alta que su tope: se ve lo último que ganó. */
  useLayoutEffect(() => {
    const f = caja.current;
    if (f && pegada) f.scrollTop = f.scrollHeight;
  }, [pegada, cerrados]);

  if (!hay) return null;
  return (
    <div ref={hueco} className="t7fa" data-figura-acumulada data-cerrados={cerrados} style={{ height: pegada ? `${alto}px` : undefined }}>
      <style>{CSS_T73_PATRON + CSS_FIGURA_ACUMULADA}</style>
      <div ref={caja} className="t7fa-caja" data-pegada={pegada ? "si" : "no"} style={pegada
        ? { position: "fixed", zIndex: 15, top: `${pegada.top}px`, left: `${pegada.left}px`, width: `${pegada.width}px`, maxHeight: `${pegada.max}px` }
        : { position: "relative" }}>
        <div ref={contenido} data-figura-contenido>
          {visibles.map((b) => <Bloque key={b.clave} b={b} />)}
        </div>
      </div>
    </div>
  );
}
