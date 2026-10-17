import { PIEZA_DEL_EFECTIVO, PAQUETES, FIGURA_CAPA_3 } from "../../../../data/contabilidadT5Pieza1.js";
import { PIEZA_TRES_MOMENTOS } from "../../../../data/contabilidadT5Pieza2.js";
import { CAJON_TEMPORAL, CAJON_NO_TEMPORAL, consecuenciaP1 } from "../../../../contabilidad/c4/t5P1_c4.js";
import { FIGURA_P2_C4, consecuenciaP2 } from "../../../../contabilidad/c4/t5P2_c4.js";
import { NotaC4, CSS_T5C4, ESPERA_C4 } from "../t5/figurasC4T5.jsx";
import { barajar } from "../../../../utils/barajar.js";
import DosPaquetes from "./DosPaquetes.jsx";
import DosVentas from "./DosVentas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · P1 Y P2 · LA CAPA 3 CON EL PATRÓN C4 (Célula C · «toda decisión se
 * pinta»; Watari, patron-enganche-c4-v1.html, #t5-p1 y #t5-p2).
 *
 * La capa 3 de main tal cual (DosPaquetes y DosVentas sobre
 * tema6/CajasQueRevelan.jsx: la escalera C2, sin puntaje, los textos de
 * Near), con la prop opcional `c4` de CajasQueRevelan. CuatroCapas no cambia:
 * su capa 3 es la `Exploracion` que le pasa la vista, y la vista le pasa
 * estas (EXPLORACION_C4_T5).
 *
 *   P1 · «Los dos cajones»: la figura pegada de main (Temporal / No temporal)
 *        recibe el paquete en el cajón que dice la opción tocada, con su
 *        razón pegada, en el acto. Lo correcto entra como siempre al
 *        cerrarse la caja; lo mal decidido se queda en su cajón equivocado y,
 *        con el veredicto, dice por qué (✕).
 *   P2 · «Las ventas y su diferencia»: dentro de la caja, bajo sus opciones,
 *        la venta con lo que recibe y lo que costó; Inversiones – títulos
 *        sale por el costo; la diferencia por título cae en la zona que dice
 *        la opción. Con el veredicto, ✓ o ✕ con lo que implica.
 * El veredicto (la marca, la pista, la devolución) llega ESPERA_C4 = 380 ms
 * después; con movimiento reducido, sin espera. Las consecuencias, puras, en
 * contabilidad/c4/t5P1_c4.js y t5P2_c4.js.
 *
 * PROVISIONAL PARA WATARI: la forma es la de su prototipo (.c4-zonas,
 * .c4-chip), sobria y sin teal ni ámbar, con los bordes de la figura de main.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
.t5p3c4 { --t5c4-texto: #F8F9FA; --t5c4-atenuado: #A8B6C8; --t5c4-neutro: #B8C4D4; --t5c4-coral: #E76F51; color: var(--t5c4-texto); font: 400 13px/1.4 "Inter", sans-serif; display: grid; gap: 8px; min-width: 0; }
.t5p3c4 * { box-sizing: border-box; }
.t5p3c4-zonas { display: grid; gap: 8px; }
.t5p3c4-zonas.dos { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.t5p3c4-zonas.tres { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.t5p3c4-zonas.tres .t5p3c4-zona { padding: 8px 4px; } .t5p3c4-zonas.tres .t5p3c4-zona.activa { padding: 7px 3px; }
.t5p3c4-zona { display: flex; flex-direction: column; gap: 6px; min-width: 0; padding: 8px; border-radius: 10px; border: 1px solid var(--t5c4-neutro); }
.t5p3c4-zona.activa { border: 2px solid var(--t5c4-texto); padding: 7px; }
.t5p3c4-zona.activa.mal { border-color: var(--t5c4-coral); }
.t5p3c4-rot { margin: 0; font: 400 12px/1.35 "Inter", sans-serif; color: #A8B6C8; text-align: center; overflow-wrap: break-word; hyphens: auto; }
.t5p3c4-hueco { min-height: 22px; display: flex; flex-direction: column; gap: 4px; }
.t5p3c4-entrada { margin: 0; padding: 2px 5px; border-radius: 6px; border: 1px solid var(--t5c4-neutro); font: 600 12px/1.35 "Inter", sans-serif; text-align: center; overflow-wrap: anywhere; }
.t5p3c4-chip { margin: 0; padding: 2px 5px; border-radius: 6px; border: 1px dashed var(--t5c4-texto); font: 600 12px/1.35 "Inter", sans-serif; overflow-wrap: anywhere; }
.t5p3c4-linea { margin: 0; font: 400 13px/1.4 "Inter", sans-serif; overflow-wrap: anywhere; }
.t5p3c4-tit { margin: 0; font: 600 13px/1.35 "Sora", "Inter", sans-serif; overflow-wrap: anywhere; }
.t5p3c4-num { font-family: "JetBrains Mono", ui-monospace, monospace; font-variant-numeric: tabular-nums; white-space: nowrap; }
.t5p3c4-anim .t5p3c4-chip { animation: t5p3c4-cae ${ESPERA_C4}ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes t5p3c4-cae { from { transform: translateY(-8px) scale(.96); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .t5p3c4 *, .t5p3c4 *::before, .t5p3c4 *::after { animation: none !important; transition: none !important; } }
.t5p3c4 .t5c4-falla, .t5p3c4 .t5c4-cuadra { margin: 0; display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 8px; align-items: start; padding: 8px 10px; border-radius: 10px; font: 500 13px/1.4 "Inter", sans-serif; overflow-wrap: anywhere; }
.t5p3c4 .t5c4-falla { border: 2px solid var(--t5c4-coral); }
.t5p3c4 .t5c4-cuadra { border: 2px solid var(--t5c4-texto); }
`;

/* ═══════════ P1 · LOS DOS CAJONES (la figura pegada) ═══════════ */

const CAJONES_P1 = [
  { id: CAJON_TEMPORAL, nombre: FIGURA_CAPA_3.temporal, temporal: true },
  { id: CAJON_NO_TEMPORAL, nombre: FIGURA_CAPA_3.noTemporal, temporal: false },
];

/**
 * decididas: las cajas cerradas (lo correcto entra como en main); pintado: { caja, opcion, estado } de la
 * última opción tocada; vista: { veredicto, anim, cerrado }.
 */
export function FiguraP1C4({ decididas, pintado = null, vista = null }) {
  const estado = pintado?.estado ?? null;
  /* El chip se queda mientras no esté ya en el registro: hasta el veredicto, o siempre si fue malo. */
  const conChip = Boolean(estado?.cajon) && !(vista?.veredicto && vista?.cerrado && !estado.falla);
  const mal = Boolean(estado?.falla) && vista?.veredicto;
  return (
    <div data-figura="t5-a1" data-figura-c4="t5-p1" className={`t5p3c4${vista?.anim ? " t5p3c4-anim" : ""}`} aria-live="polite">
      <div className="t5p3c4-zonas dos">
        {CAJONES_P1.map((c) => {
          const activa = conChip && estado.cajon === c.id;
          return (
            <div key={c.id} data-cajon={c.id} data-activa={activa ? "si" : "no"} className={`t5p3c4-zona${activa ? " activa" : ""}${activa && mal ? " mal" : ""}`}>
              <p className="t5p3c4-rot">{c.nombre}</p>
              <div className="t5p3c4-hueco">
                {decididas.map((id) => PAQUETES.find((p) => p.id === id)).filter((p) => p && (p.correcta === "si") === c.temporal)
                  .map((p) => <p key={p.id} data-entrada={p.id} className="t5p3c4-entrada">{p.nombre}</p>)}
                {activa && <p data-chip data-paquete={estado.paquete} className="t5p3c4-chip">{estado.chip}</p>}
              </div>
            </div>
          );
        })}
      </div>
      {estado && <NotaC4 estado={estado} vista={vista} />}
    </div>
  );
}

/* ═══════════ P2 · LAS VENTAS Y SU DIFERENCIA (dentro de la caja) ═══════════ */

const ZONAS_P2 = ["ganancia", "perdida", "ni-una"];
const Cifras = ({ texto }) => String(texto).split(/(\$[\d.]+)/).map((p, k) => (k % 2 ? <span key={k} className="t5p3c4-num">{p}</span> : p));

export function EnCajaP2C4({ caja, estado, vista }) {
  if (!estado) return null;
  const mal = Boolean(estado.falla) && vista?.veredicto;
  return (
    <section data-c4-venta={caja.id} lang="es" className={`t5p3c4${vista?.anim ? " t5p3c4-anim" : ""}`} aria-live="polite" style={{ marginTop: "10px" }}>
      <p className="t5p3c4-tit" data-linea-venta><Cifras texto={FIGURA_P2_C4.venta(caja.titulo, estado.recibe, estado.costo)} /></p>
      <p className="t5p3c4-linea" data-linea-sale><Cifras texto={FIGURA_P2_C4.sale(estado.costo)} /></p>
      <div className="t5p3c4-zonas tres">
        {ZONAS_P2.map((z) => {
          const activa = estado.zona === z;
          return (
            <div key={z} data-zona={z} data-activa={activa ? "si" : "no"} className={`t5p3c4-zona${activa ? " activa" : ""}${activa && mal ? " mal" : ""}`}>
              <p className="t5p3c4-rot">{FIGURA_P2_C4.zonas[z]}</p>
              <div className="t5p3c4-hueco">
                {activa && <p data-chip className="t5p3c4-chip"><Cifras texto={FIGURA_P2_C4.porTitulo(estado.diferencia)} /></p>}
              </div>
            </div>
          );
        })}
      </div>
      <NotaC4 estado={estado} vista={vista} />
    </section>
  );
}

/* ═══════════ LO QUE LA VISTA LE PASA A CUATROCAPAS ═══════════ */

export const C4_P1 = { consecuencia: consecuenciaP1, Figura: FiguraP1C4, espera: ESPERA_C4, css: CSS + CSS_T5C4 };
export const C4_P2 = { consecuencia: consecuenciaP2, EnCaja: EnCajaP2C4, espera: ESPERA_C4, css: CSS + CSS_T5C4 };

/* D8: las opciones de cada caja, barajadas una vez por intento (`mezclar`); inyectable en las pruebas. */
export function DosPaquetesC4({ mezclar = barajar }) { return <DosPaquetes c4={C4_P1} mezclar={mezclar} />; }
export function DosVentasC4({ mezclar = barajar }) { return <DosVentas c4={C4_P2} mezclar={mezclar} />; }

/* Por id de pieza: la capa 3 con C4. La vista la usa en vez de la de ESCENAS_TEMA5. */
export const EXPLORACION_C4_T5 = {
  [PIEZA_DEL_EFECTIVO.id]: DosPaquetesC4,
  [PIEZA_TRES_MOMENTOS.id]: DosVentasC4,
};
