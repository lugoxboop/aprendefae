import { Panel } from "../../salaDeControl/marco.jsx";
import { IconoCheck, IconoX } from "../b5/Devolucion.jsx";
import { TEXTOS_C4_H6 } from "../../../../contabilidad/c4/t71h6_c4.js";
import { TEXTOS_C4_H4 } from "../../../../contabilidad/c4/t71h4_c4.js";
import { pesosC4 as pesosT71 } from "../../../../contabilidad/c4/t71Comun.js";
import { Ficha, Parrafos } from "./hacerT7.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-1 — lo que comparten las figuras de A7, H1, H3, H4, H5, H6 y H7
 * sobre el motor de la célula (decisionC4.jsx). Las figuras son de Watari
 * (patrón de enganche C4, codigo-f71); las clases van con el prefijo `t71-`
 * para no chocar con las de T7-2, T7-3 y T5, que viven en la misma página.
 * Colores: los del motor (texto, neutro, coral solo para la falla). Ni teal
 * ni ámbar: son el debe y el haber.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CSS_T71C4 = `
.t71-obj { margin: 0; padding: 12px 14px; display: grid; gap: 8px; min-width: 0; border-radius: 12px; background: rgba(10,20,34,.45); border: 1px solid rgba(248,249,250,.12); }
.t71-tit { margin: 0; font: 600 13px/1.3 "Sora", "Inter", sans-serif; }
.t71-linea { margin: 0; font-size: 13px; line-height: 1.4; overflow-wrap: anywhere; }
.t71-num { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-variant-numeric: tabular-nums; font-weight: 600; white-space: nowrap; }
.t71-cuadra { margin: 0; display: flex; gap: 6px; align-items: flex-start; font-size: 13px; line-height: 1.4; }
.t71-cuadra svg { flex: none; margin-top: 2px; }
.t71-mal { border-color: var(--coral) !important; }
.t71-contexto { display: grid; gap: 0; }
`;

/* Lo que sí cuadra: un ✓ y su frase. Solo con el veredicto (la falla la pinta el motor). */
export function Cuadra({ estado, vista }) {
  if (!estado?.cuadra || !vista.veredicto || !vista.ok) return null;
  return <p className="t71-cuadra c4-cuadra" data-cuadra><IconoCheck /><span>{estado.cuadra}</span></p>;
}

/*
 * El Marco de los Hacer con caso: envuelve el Marco de la vista y pone el caso
 * de Near (párrafos y ficha), como en main, arriba de la actividad. En el
 * cierre (un solo hijo: Cierre) no va. Se crea una vez por Marco (useMemo en
 * la pieza): un tipo nuevo en cada render volvería a montar el motor.
 */
export function marcoConCaso(Marco = Panel, { parrafos = null, entrada = null, ficha = null }) {
  return function MarcoCaso({ rotulo, titulo, acento, children }) {
    const jugando = Array.isArray(children);
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        {jugando && (
          <div className="t71-contexto" data-caso>
            {entrada && <Parrafos textos={[entrada]} dato="entrada" />}
            {parrafos && <Parrafos textos={parrafos} />}
            {ficha && <Ficha filas={ficha} />}
          </div>
        )}
        {children}
      </Marco>
    );
  };
}

/* ═══════════ FIGURAS DE LOS HACER QUE NO MONTAN EL MOTOR (H4 y H6, precedente de #424) ═══════════ */

/*
 * La línea de la consecuencia, dentro de la figura: la falla en coral con ✕
 * (texto, nunca solo color) o lo que cuadra con ✓. En estas piezas no hay
 * motor que pinte la falla aparte.
 */
export function LineaC4T71({ estado }) {
  if (estado?.falla) return <p className="t71-falla c4-falla" data-c4-linea="falla"><IconoX /><span>{estado.falla}</span></p>;
  if (estado?.cuadra) return <p className="t71-cuadra c4-cuadra" data-c4-linea="cuadra"><IconoCheck /><span>{estado.cuadra}</span></p>;
  return null;
}

export const CSS_T71_FUERA = `
.t71-fuera { --texto: #F8F9FA; --atenuado: #A8B6C8; --neutro: #B8C4D4; --coral: #E76F51; --coral-texto: #EE8266;
  margin: 0 0 12px; color: var(--texto); font: 400 13px/1.4 "Inter", system-ui, sans-serif; }
.t71-fuera * { box-sizing: border-box; }
.t71-falla { margin: 0; display: flex; gap: 6px; align-items: flex-start; font-size: 13px; line-height: 1.4; color: var(--coral-texto); overflow-wrap: anywhere; }
.t71-falla svg { flex: none; margin-top: 2px; }
.t71-ren { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 8px; padding: 6px 8px; font-size: 13px; border-radius: 6px; min-width: 0; }
.t71-ren small { display: block; font-size: 12px; color: var(--atenuado); }
.t71-ren.activa { outline: 2px solid var(--texto); outline-offset: -2px; }
.t71-ren.activa.mal { outline-color: var(--coral); }
.t71-nota { border-style: dashed; }
.t71-entra { display: inline-block; animation: t71-entra 380ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes t71-entra { from { transform: translateY(-10px) scale(.96); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .t71-fuera *, .t71-fuera *::before, .t71-fuera *::after { animation: none !important; transition: none !important; } }
`;

/* H6 · la nota crédito de El Nogal: cada cifra en su renglón; la del ítem, marcada y con qué parte de lo devuelto es. */
export function FiguraNotaCredito({ estado }) {
  const mal = Boolean(estado.falla);
  const num = (v, nuevo) => (v == null ? <b className="t71-num" data-c4-valor="">$?</b> : <b key={v} className={`t71-num${nuevo ? " t71-entra" : ""}`} data-c4-valor={v}>{pesosT71(v)}</b>);
  return (
    <section className="t71-fuera" data-c4-figura="La nota crédito de El Nogal" aria-live="polite">
      <div className="t71-obj t71-nota">
        <p className="t71-tit">{estado.titulo}</p>
        <div className="t71-ren" data-c4-ren="devuelta"><span>{TEXTOS_C4_H6.devuelta}</span>{num(estado.devuelta)}</div>
        {estado.renglones.map((r) => (
          <div key={r.id} className={`t71-ren${r.activa ? ` activa${mal ? " mal" : ""}` : ""}`} data-c4-ren={r.id}>
            <span>{r.rotulo}{r.parte && <small data-c4-parte>{r.parte}</small>}</span>{num(r.valor, r.activa)}
          </div>
        ))}
        <LineaC4T71 estado={estado} />
      </div>
    </section>
  );
}

/* H4 · el estado de resultados en cascada de un método, desde la cifra que quedó en su inventario final. */
export function FiguraCascada({ estado }) {
  const T = TEXTOS_C4_H4;
  const filas = ["disponible", "final", "cmv", "ventas", "bruta", "operacional"];
  return (
    <section className="t71-fuera" data-c4-figura="El estado de resultados en cascada" data-c4-metodo={estado.metodo} aria-live="polite">
      <div className="t71-obj">
        <p className="t71-tit">{estado.titulo}</p>
        {filas.map((f) => {
          const v = estado.cifras?.[f] ?? null;
          return (
            <div key={f} className={`t71-ren${f === estado.fila ? ` activa${estado.falla || estado.mal ? " mal" : ""}` : ""}`} data-c4-ren={f}>
              <span>{T.filas[f]}</span>
              {v == null ? <b className="t71-num" data-c4-valor="">$?</b> : <b className="t71-num" data-c4-valor={v}>{pesosT71(v)}</b>}
            </div>
          );
        })}
        <LineaC4T71 estado={estado} />
      </div>
    </section>
  );
}
