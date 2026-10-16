import { DoorOpen, Flame, Boxes, FileText, CalendarDays, Truck } from "lucide-react";
import { CASOS_H7 } from "../../../../data/contabilidadT7_1_h7.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H7 · EL PLANO DE LA BODEGA (la figura que se llena, C8).
 *
 * PROVISIONAL PARA WATARI: la forma visual es suya y todavía no llega. Esta
 * es una versión funcional y sobria, con los tonos de las figuras vecinas
 * (el kárdex de T7-2): navy, texto claro y gris azulado. Sin teal ni ámbar.
 *
 * Seis puntos de riesgo, uno por caso, cada uno en su sitio fijo del plano
 * (la D de Near: la puerta, el fuego, los estantes, la hoja archivada, el
 * calendario y el muelle de llegada).
 *
 *   · mientras el caso está abierto, el punto es un MARCADOR NUMERADO, sin
 *     ícono ni nombre (Mello, H7-3: dibujar la puerta o el muelle sería
 *     emparejar con dibujos). El número es el del caso en la partida; todos
 *     empiezan encendidos y el del caso en curso lleva un anillo
 *   · al resolver el caso, el punto queda en neutro con ✓, su ícono y su
 *     nombre corto
 *   · al final, la bodega aparece cuidada entera
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Dónde va cada punto en el plano (tres por fila) y su ícono, que solo se ve al resolver. */
const SITIOS = ["sin-puerta", "falta-mercancia", "incendio", "sin-informe", "quinientas", "mismo-dia"];
const ICONOS = { "sin-puerta": DoorOpen, incendio: Flame, "falta-mercancia": Boxes, quinientas: FileText, "mismo-dia": CalendarDays, "sin-informe": Truck };

/* [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: el nombre accesible del plano (la D dice «el plano de una bodega»). */
const NOMBRE_PLANO = "Plano de la bodega";

const P = { fondo: "#0E1B2E", texto: "#F8F9FA", texto2: "#A8B6C8", borde: "#B8C4D4" };

const CSS = `
.h7pl { margin: 0; padding: 10px; border: 2px solid rgba(184,196,212,0.45); border-radius: 6px; background: rgba(10,20,34,0.35); }
.h7pl ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.h7pl li { min-width: 0; min-height: 64px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 6px 4px; border-radius: 8px; border: 1px dashed rgba(184,196,212,0.28); text-align: center; }
.h7pl-num { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: ${P.texto}; color: ${P.fondo}; font: 700 14px/1 "Inter", sans-serif; font-variant-numeric: tabular-nums; }
.h7pl li[aria-current="step"] .h7pl-num { box-shadow: 0 0 0 3px ${P.fondo}, 0 0 0 5px ${P.texto}; }
.h7pl li[data-resuelto="si"] { border-style: solid; border-color: rgba(184,196,212,0.4); }
.h7pl-hecho { display: flex; align-items: center; gap: 4px; color: ${P.texto2}; }
.h7pl-hecho b { font: 700 13px/1 "Inter", sans-serif; color: ${P.texto}; }
.h7pl-nombre { display: block; font: 500 12px/1.3 "Inter", sans-serif; color: ${P.texto2}; overflow-wrap: anywhere; }
.h7pl-nombre::first-letter { text-transform: uppercase; }
`;

const nombreDe = (id) => CASOS_H7.find((c) => c.id === id)?.punto ?? "";

/** items: los casos en el orden de la partida; i: el caso en curso; resueltos: los ids ya resueltos. */
export default function PlanoBodegaH7({ items, i, resueltos }) {
  const numero = (id) => items.findIndex((c) => c.id === id) + 1;
  const actual = items[i]?.id ?? null;
  return (
    <figure className="h7pl" aria-label={NOMBRE_PLANO} data-plano-h7>
      <style>{CSS}</style>
      <ul>
        {SITIOS.map((id) => {
          const hecho = resueltos.includes(id);
          const Icono = ICONOS[id];
          return (
            <li key={id} data-punto={id} data-resuelto={hecho ? "si" : "no"} aria-current={!hecho && id === actual ? "step" : undefined}>
              {hecho ? (
                <>
                  <span className="h7pl-hecho"><Icono size={20} strokeWidth={1.75} aria-hidden="true" data-icono /><b>✓</b></span>
                  <span className="h7pl-nombre" data-nombre-punto>{nombreDe(id)}</span>
                </>
              ) : (
                <span className="h7pl-num" data-numero>{numero(id)}</span>
              )}
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
