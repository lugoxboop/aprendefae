/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · LO COMÚN A LAS PIEZAS DE APRENDER DEL REDISEÑO (A2-A5) (Hanayama).
 *
 * Carril de la Célula D; no es compartido. Portado del prototipo congelado
 * (scratchpad hanayama/sitio/src/components/t4r/aprender.jsx). La pantalla
 * misma (antes, figura, después, «Seguir» y pie) es PantallasT4 de la vista,
 * la de A0 y A1; aquí queda lo que dibujan A2-A5:
 *   · Fig: la figura de una pantalla, con su texto alternativo para el lector
 *   · Sobre y Cheque: el sobre de Rosa («LO QUE TIENE ROSA») con su solapa, y
 *     el cheque que sale de Bancos, que es un botón
 *   · Rotulo: los rótulos de sección («LO QUE DICE EL LIBRO»)
 *   · Chips: opciones de Aprender. Se puede volver a elegir (reintento) y, en
 *     el error, solo se marca la elegida: nada delata la correcta. La marca
 *     lleva palabra («✓ Correcto», «✗ No va aquí», las de MARCA: canon E3, en
 *     blanco y negro se sabe cuál falló; prompt maestro §4.2)
 *   · LectorError: «Incorrecto.» solo para el lector, en una región viva, en
 *     los juegos de mandar a un lado (A4 P2, A5 P1 y P2), que no llevan
 *     mensaje de error a la vista (Katsumi, decisión 3)
 *   · useReducido: si el movimiento está reducido
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useId, useState } from "react";
import { useNumeroQueSube } from "../mecanicas/libros/verbos.jsx";
import { C, cifra, LineaMarcas } from "./comun.jsx";
import { LECTOR_ERROR, MARCA } from "../../data/contabilidadT4.js";

export const CSS_APRENDER = `
.t4sb-rot { margin: 2px 0 0; font: 500 12px/1.3 "Inter", sans-serif; letter-spacing: .04em; color: ${C.texto2}; }
.t4sb { display: grid; gap: 2px; border: 1px solid ${C.neutro}; border-top: none; border-radius: 0 0 10px 10px; padding: 4px 12px 8px; }
.t4sb[data-luz] { border-color: ${C.texto}; }
.t4sb-f { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; font-size: 13px; line-height: 1.5; color: ${C.texto2}; }
.t4sb-f > span { white-space: nowrap; }
.t4sb-f > span:last-child { font: 500 15px/1.4 "Inter", sans-serif; font-variant-numeric: tabular-nums; color: ${C.texto}; }
.t4sb-f.s { border-top: 1px solid rgba(248,249,250,0.22); padding-top: 2px; color: ${C.texto}; }
.t4sb-f[data-luz] > span:first-child { color: ${C.texto}; font-weight: 600; }
.t4ch { display: flex; justify-content: space-between; align-items: center; gap: 8px; width: 100%; border: 1px solid ${C.texto}; border-radius: 8px; padding: 6px 12px; background: transparent; color: ${C.texto}; text-align: left; font: inherit; min-height: 44px; cursor: pointer; }
.t4ch:disabled { cursor: default; border-color: ${C.neutro}; }
.t4ch > span:first-child { display: grid; }
.t4ch > span:first-child > span { white-space: nowrap; font: 600 13px/1.3 "Sora", "Inter", sans-serif; }
.t4ch > span:first-child > span + span { font: 500 12px/1.3 "Inter", sans-serif; color: ${C.texto2}; }
.t4ch > span:last-child { font: 600 15px/1.2 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
.t4op-g { display: grid; gap: 6px; }
.t4op { display: grid; place-items: center; align-content: center; gap: 2px; min-height: 48px; border-radius: 8px; padding: 2px 4px; white-space: nowrap; cursor: pointer; border: 1px solid ${C.reposo}; background: transparent; color: ${C.texto}; font: 600 14px/20px "Inter", sans-serif; font-variant-numeric: tabular-nums; min-width: 0; }
/* Lote B (A5 P0): las opciones con palabras, no cifras, parten en dos renglones si no caben a 320 («ninguno todavía»). */
.t4op-g[data-palabras] .t4op { white-space: normal; text-align: center; text-wrap: balance; }
.t4op:disabled { cursor: default; }
.t4op[data-marca] { border-width: 2px; border-color: ${C.texto}; padding: 1px 3px; }
.t4op[data-marca="mal"] { border-color: ${C.error}; }
.t4r-tab { appearance: none; min-height: 44px; border-radius: 8px; border: 1px solid ${C.neutro}; background: transparent; color: ${C.texto}; font: 600 15px "Sora", "Inter", sans-serif; cursor: pointer; padding: 0; }
.t4r-tab[aria-pressed="true"] { background: ${C.texto}; color: ${C.fondo}; border-color: ${C.texto}; }
.t4r-tab:focus-visible, .t4op:focus-visible, .t4ch:focus-visible { outline: 2px solid ${C.texto}; outline-offset: 2px; }
.t4r-par2 { display: flex; gap: 8px; }
.t4r-par2 > button { flex: 1; min-width: 0; padding: 0 6px; }
`;

/* La figura de una pantalla: `data-figura` con su nombre y el texto alternativo solo para el lector. */
export function Fig({ nombre, alt, gap = 8, children }) {
  const id = useId();
  return (
    <figure className="t4r" style={{ margin: 0, gap: `${gap}px` }} data-figura={nombre} aria-describedby={id}>
      {children}
      <figcaption id={id} className="t4f-sr">{alt}</figcaption>
    </figure>
  );
}

function Cifra({ v }) { const x = useNumeroQueSube(v); return <>{cifra(x)}</>; }

export const Rotulo = ({ children }) => <p className="t4sb-rot">{children}</p>;

/* filas: [{ id, r: rótulo, v: número | texto, suma?, luz?, oculta? }] */
export function Sobre({ rotulo, filas, luz = false }) {
  return (
    <div style={{ display: "grid", gap: "2px" }} data-sobre>
      <Rotulo>{rotulo}</Rotulo>
      <svg aria-hidden="true" viewBox="0 0 100 18" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "18px", margin: "2px 0 -2px" }}>
        <path d="M0 18 L0 1 L100 1 L100 18 M0 1 L50 17 L100 1" fill="none" stroke={luz ? C.texto : C.neutro} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="t4sb" data-luz={luz ? "" : undefined}>
        {filas.map((f) => (
          <div key={f.id} className={`t4sb-f${f.suma ? " s" : ""}`} data-fila-sobre={f.id} data-valor={typeof f.v === "number" && !f.oculta ? f.v : undefined} data-luz={f.luz ? "" : undefined} style={{ visibility: f.oculta ? "hidden" : "visible" }}>
            <span>{f.r}</span><span>{typeof f.v === "number" ? <Cifra v={f.v} /> : f.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* El cheque que sale de Bancos: un botón con su cifra. Hecho, deja su sitio (el sobre no salta). */
export function Cheque({ monto, onClick = null, hecho = false, renglones }) {
  return (
    <button type="button" className="t4ch" data-cheque data-accion="cheque" disabled={!onClick || hecho} aria-hidden={hecho ? "true" : undefined} onClick={onClick ?? undefined} style={{ visibility: hecho ? "hidden" : "visible" }}>
      <span>{renglones.map((t) => <span key={t}>{t}</span>)}</span>
      <span>{cifra(monto)}</span>
    </button>
  );
}

/*
 * Las opciones de una pregunta de Aprender. Tras el error siguen activas
 * (reintento) y solo se marca la elegida: nada delata la correcta. Con el
 * acierto se bloquean. La opción es angosta para su pastilla, así que la
 * pastilla va en la línea de marcas, debajo del grupo (P2 de Hanayama, §2.3-3).
 * El lector oye la marca en el nombre de la opción.
 */
export function Chips({ opciones, elegida, correcta, onElegir, rotulo = (o) => cifra(o), etiqueta, palabras = false }) {
  const marca = (o) => (o === elegida ? (o === correcta ? "bien" : "mal") : null);
  const marcas = Object.fromEntries(opciones.map((o, k) => [k, marca(o) ? { marca: marca(o) } : null]));
  return (
    <>
      <div className="t4op-g" data-palabras={palabras ? "" : undefined} style={{ gridTemplateColumns: `repeat(${opciones.length}, minmax(0, 1fr))` }} role="group" aria-label={etiqueta}>
        {opciones.map((o) => {
          const m = marca(o);
          const r = rotulo(o);
          return (
            <button key={o} type="button" className="t4op" data-opcion={o} data-marca={m ?? undefined} aria-pressed={o === elegida}
              aria-label={m ? `${r}: ${MARCA[m]}` : undefined}
              disabled={elegida === correcta} onClick={() => onElegir(o)}>
              <span>{r}</span>
            </button>
          );
        })}
      </div>
      <LineaMarcas columnas={opciones.length} marcas={marcas} gap={6} />
    </>
  );
}

/* «Incorrecto.» solo para el lector, en una región viva. `clave` cambia con cada error, para que se vuelva a oír. */
export function LectorError({ error, clave }) {
  return <p className="t4f-sr" aria-live="assertive" data-lector-error={error ? "" : undefined}>{error ? <span key={clave}>{LECTOR_ERROR}</span> : null}</p>;
}

/* Si el movimiento está reducido (para lo que se anima con temporizadores). */
export function useReducido() {
  const q = () => globalThis.matchMedia?.("(prefers-reduced-motion: reduce)");
  const [r, setR] = useState(() => Boolean(q()?.matches));
  useEffect(() => {
    const m = q();
    if (!m) return undefined;
    const f = () => setR(Boolean(m.matches));
    f();
    m.addEventListener?.("change", f);
    return () => m.removeEventListener?.("change", f);
  }, []);
  return r;
}
