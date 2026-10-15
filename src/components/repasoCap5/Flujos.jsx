import { useLayoutEffect, useRef, useState } from "react";
import { C, INTER } from "./comun.jsx";
import { INTERFAZ_R5_1 } from "../../data/repasoCap5Cruzado.js";
import { useReproduccion, enFase } from "./movimiento.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PANTALLA 1 · C.3 «Los flujos del título» (Itagaki, §a; v2.1, decisión 5).
 *
 * Figura de 140 px: un eje de 2 px sobre una zona de dibujo de 96 px, con HOY
 * a la izquierda y VENCIMIENTO a la derecha, y cuatro marcas de periodo. Cada
 * opción reproduce cómo te pagan:
 *
 *   (a) y (d)  pagas 56; cobras 12 en los periodos 1 a 3; en VENCIMIENTO,
 *              12 + 56 apiladas: los intereses y el capital (1,06 s)
 *   (b)        pagas 56; 32, 64, 24 y 48; VENCIMIENTO se desvanece (0,94 s)
 *   (c)        pagas 56; raya de punta a punta; recibes 80; llave entre 56 y
 *              80 con «Tu ganancia» (1,1 s)
 *
 * Las barras crecen desde el eje. Un toque en la figura mientras se reproduce
 * la lleva a su estado final.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ZONA = 96;
const BARRA = 20;
const PAGAS_MS = 300;
const PASO_MS = 80;
const BARRA_MS = 200;

/* El guion de un flujo: cuándo entra cada pieza, en ms desde el toque. */
export function guionDeFlujo(flujo) {
  const g = { pagas: 0, periodos: [], vence: null, recibes: null, raya: null, llave: null, finVence: null, total: 0 };
  if (flujo.ganancia) {
    g.raya = PAGAS_MS;
    g.periodos = [null, null, null, PAGAS_MS + 300];
    g.recibes = PAGAS_MS + 300;
    g.llave = PAGAS_MS + 600;
    g.total = PAGAS_MS + 600 + 200;
    return g;
  }
  if (!flujo.vence) {
    g.periodos = flujo.periodos.map((_, k) => PAGAS_MS + k * PASO_MS);
    g.finVence = PAGAS_MS + 3 * PASO_MS + BARRA_MS;
    g.total = g.finVence + 200;
    return g;
  }
  /* (a) y (d): las tres de intereses con desfase; luego la apilada; luego «Recibes». */
  const tres = PAGAS_MS + 2 * PASO_MS + BARRA_MS;
  g.periodos = [0, 1, 2].map((k) => PAGAS_MS + k * PASO_MS).concat(tres);
  g.recibes = tres + 300;
  g.total = tres + 300 + 100;
  return g;
}

export const duracionDeFlujo = (flujo) => (flujo ? guionDeFlujo(flujo).total : 0);

const RECIBIDO = (flujo) => flujo.periodos.flat().reduce((t, x) => t + x, 0);
export { RECIBIDO as recibidoDeFlujo };

function Rotulo({ children, estilo }) {
  return (
    <span style={{ position: "absolute", fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", color: C.texto, whiteSpace: "nowrap", ...estilo }}>
      {children}
    </span>
  );
}

export function Flujos({ flujo, clave, onTerminar }) {
  const caja = useRef(null);
  const [ancho, setAncho] = useState(264);
  useLayoutEffect(() => {
    const w = caja.current?.clientWidth;
    if (w) setAncho(w);
  }, []);
  const g = flujo ? guionDeFlujo(flujo) : null;
  const { fase, saltar } = useReproduccion(flujo ? clave : null, g?.total ?? 0, onTerminar);

  /* Cinco posiciones: HOY y las cuatro marcas; la cuarta es VENCIMIENTO. */
  const paso = (ancho - BARRA) / 4;
  const x = (k) => k * paso;
  const crece = (retraso, ms = BARRA_MS) => enFase(fase, { transform: "scaleY(0)" }, { transform: "scaleY(1)" }, { ms, retraso });
  const aparece = (retraso, ms = 200) => enFase(fase, { opacity: 0 }, { opacity: 1 }, { ms, retraso, propiedades: "opacity" });
  const barra = (k, alto, abajo, extra) => ({
    position: "absolute", left: `${x(k)}px`, bottom: `${abajo}px`, width: `${BARRA}px`, height: `${alto}px`,
    boxSizing: "border-box", borderRadius: "2px 2px 0 0", transformOrigin: "bottom", ...extra,
  });
  const vence = !flujo || flujo.vence;

  return (
    <div
      ref={caja}
      data-figura="flujos"
      data-fase={fase}
      data-flujo={flujo ? (flujo.ganancia ? "descuento" : flujo.vence ? "interes" : "variable") : "ninguno"}
      onClick={saltar}
      aria-hidden="true"
      style={{ position: "relative", height: "116px" }}
    >
      <div style={{ position: "relative", height: `${ZONA}px` }}>
        {/* El eje y las cuatro marcas de periodo. */}
        <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "2px", background: C.atenuado }} />
        {[1, 2, 3, 4].map((k) => (
          <span key={k} data-marca-periodo={k} style={{ position: "absolute", left: `${x(k) + BARRA / 2 - 1}px`, bottom: "-3px", width: "2px", height: "8px", background: C.atenuado }} />
        ))}
        {flujo && (
          <>
            {/* HOY: lo que pagas, solo con contorno. */}
            <span data-barra="pagas" style={{ ...barra(0, flujo.pagas, 2, { border: `2px solid ${C.atenuado}` }), ...crece(g.pagas, PAGAS_MS) }} />
            <Rotulo estilo={{ left: 0, bottom: `${flujo.pagas + 4}px`, ...aparece(g.pagas, PAGAS_MS) }}>{INTERFAZ_R5_1.pagas}</Rotulo>
            {/* Lo que recibes en cada periodo; en VENCIMIENTO puede ir apilado. */}
            {flujo.periodos.map((partes, k) => {
              if (!partes.length) return null;
              const alto = partes.reduce((t, x2) => t + x2, 0);
              const ms = k === 3 && (partes.length > 1 || flujo.ganancia) ? 300 : BARRA_MS;
              return (
                <span key={k} data-barra={`periodo-${k + 1}`} data-alto={alto} style={{ ...barra(k + 1, alto, 2, { display: "flex", flexDirection: "column-reverse", overflow: "hidden" }), ...crece(g.periodos[k], ms) }}>
                  {partes.map((a2, j) => (
                    <span key={j} data-segmento={a2} style={{ display: "block", height: `${a2}px`, flexShrink: 0, boxSizing: "border-box", background: C.hecho, borderBottom: j ? `1px solid ${C.navy}` : "none" }} />
                  ))}
                </span>
              );
            })}
            {g.recibes !== null && (
              <Rotulo estilo={{ right: `${ancho - x(4) - BARRA}px`, bottom: `${flujo.periodos[3].reduce((t, a) => t + a, 0) + 4}px`, ...aparece(g.recibes, flujo.ganancia ? 300 : 100) }}>
                {INTERFAZ_R5_1.recibes}
              </Rotulo>
            )}
            {flujo.ganancia && (
              <>
                {/* La raya de lo que pagaste, de punta a punta. */}
                <span data-raya-pago style={{ position: "absolute", left: 0, width: `${x(4) + BARRA}px`, bottom: `${flujo.pagas + 2}px`, height: 0, borderTop: `1px dashed ${C.texto}`, transformOrigin: "left", ...enFase(fase, { transform: "scaleX(0)" }, { transform: "scaleX(1)" }, { ms: 300, retraso: g.raya }) }} />
                {/* La llave entre 56 y 80, y «Tu ganancia» a su izquierda. */}
                <span data-llave style={{ position: "absolute", left: `${x(4) - 8}px`, bottom: `${flujo.pagas + 2}px`, width: "6px", height: `${flujo.periodos[3][0] - flujo.pagas}px`, boxSizing: "border-box", border: `2px solid ${C.texto}`, borderRight: "none", ...aparece(g.llave) }} />
                <span data-tu-ganancia style={{ position: "absolute", right: `${ancho - x(4) + 12}px`, bottom: `${flujo.pagas + 6}px`, fontFamily: INTER, fontSize: "13px", fontWeight: 600, lineHeight: "16px", color: C.texto, whiteSpace: "nowrap", ...aparece(g.llave) }}>
                  {INTERFAZ_R5_1.tuGanancia}
                </span>
              </>
            )}
          </>
        )}
      </div>
      {/* HOY y VENCIMIENTO; la renta variable no vence. */}
      <div style={{ position: "relative", height: "16px", marginTop: "4px" }}>
        <Rotulo estilo={{ left: 0, top: 0, fontWeight: 700, color: C.atenuado }}>{INTERFAZ_R5_1.hoy}</Rotulo>
        <Rotulo estilo={{ right: 0, top: 0, fontWeight: 700, color: C.atenuado, ...(vence ? {} : enFase(fase, { opacity: 1 }, { opacity: 0 }, { ms: 200, retraso: g.finVence, propiedades: "opacity" })) }}>
          <span data-rotulo-vencimiento={vence ? "visible" : "desvanecido"}>{INTERFAZ_R5_1.vencimiento}</span>
        </Rotulo>
      </div>
    </div>
  );
}
