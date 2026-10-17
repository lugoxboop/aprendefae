import { pesos } from "../../../../contabilidad/c4/t73.js";
import { TEXTOS_C4_H1 } from "../../../../contabilidad/c4/t73h1_c4.js";
import { TEXTOS_C4_H2 } from "../../../../contabilidad/c4/t73h2_c4.js";
import { TEXTOS_C4_H4, zonaH4 } from "../../../../contabilidad/c4/t73h4_c4.js";
import { TEXTOS_C4_H5 } from "../../../../contabilidad/c4/t73h5_c4.js";
import { LineaC4 } from "./FigurasC4T7_2.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · «TODA DECISIÓN SE PINTA» EN LOS HACER DE T7-3 (H1, H2, H4 y H5).
 * Célula C. Patrón de enganche C4 de Watari (patron-enganche-c4-v1.html,
 * secciones «t73-h1», «t73-h2», «t73-h4» y «t73-h5»; f73.js), en React, con
 * el precedente de T7-2 (#424, FigurasC4T7_2.jsx: su espera del veredicto,
 * su elección de un toque, su línea de consecuencia y su hoja c4t72-).
 *
 * Las figuras solo PINTAN el estado de la consecuencia pura
 * (contabilidad/c4/t73h*_c4.js), que la pieza calcula con lo tocado o con la
 * cifra ya COMPROBADA, antes del veredicto. C4-1 de Mello: mientras se
 * escribe, la figura solo MUESTRA la cifra en su lugar (`escrita`), sin nada
 * que dependa del resultado.
 *
 * Por qué no el motor: estas cuatro puntúan por unidad (con cada línea de
 * los asientos) y H2 y H4 llevan la figura acumulada del lote 5 arriba del
 * contador.
 *
 * Rótulos y textos: los de Watari ([W] pendiente de Near), junto a cada
 * consecuencia. Provisional para Watari: la forma es la de su prototipo,
 * con las clases de la casa (c4t72- de T7-2 y c4t73h- de aquí).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CSS_C4_T73H = `
.c4t73h-escalera { display: grid; gap: 4px; }
.c4t73h-escalon { width: calc(var(--w) * 100%); min-width: min(100%, 170px); max-width: 100%; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 6px; padding: 6px 8px; border-radius: 6px; background: rgba(184,196,212,.14); font-size: 13px; }
.c4t73h-escalon.activa { outline: 2px solid var(--texto); outline-offset: -2px; }
.c4t73h-escalon.activa.mal { outline-color: var(--coral); }
.c4t73h-cal { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 3px; }
.c4t73h-dia { min-height: 30px; display: grid; place-items: center; align-content: center; gap: 2px; border-radius: 4px; font: 500 12px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: var(--atenuado); }
.c4t73h-dia.z1 { background: rgba(184,196,212,.30); color: var(--texto); }
.c4t73h-dia.z2 { background: rgba(184,196,212,.18); color: var(--texto); }
.c4t73h-dia.z3 { background: rgba(184,196,212,.08); }
.c4t73h-dia.venta { outline: 1px dashed var(--texto); }
.c4t73h-dia.pago { outline: 2px solid var(--texto); padding: 2px 0; }
.c4t73h-dia.pago.mal { outline-color: var(--coral); }
.c4t73h-dia small { font: 600 12px/1 "Inter", sans-serif; }
.c4t73h-balanza { position: relative; height: 96px; display: grid; place-items: center; }
.c4t73h-balanza > i { position: absolute; bottom: 0; width: 2px; height: 56px; background: var(--neutro); }
.c4t73h-brazo { position: relative; z-index: 1; width: 92%; display: flex; justify-content: space-between; gap: 6px; border-top: 3px solid var(--neutro); padding-top: 6px; transition: transform .45s cubic-bezier(.3,.9,.4,1); }
.c4t73h-brazo span { font: 600 12px/1.2 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; padding: 4px 6px; border-radius: 6px; border: 1px solid var(--neutro); background: #1F2D3D; }
@media (prefers-reduced-motion: reduce) { .c4t73h-brazo { transition: none !important; } }
`;

const Num = ({ v, nuevo = false }) => (v == null
  ? <b className="c4t72-num" data-c4-valor="">$?</b>
  : <b key={v} className={`c4t72-num${nuevo ? " c4t72-mov" : ""}`} data-c4-valor={v}>{pesos(v)}</b>);

const Ren = ({ rot, v, activa = false, mal = false, dato }) => (
  <div className={`c4t72-ren${activa ? " activa" : ""}${activa && mal ? " mal" : ""}`} data-c4-ren={dato}>
    <span>{rot}</span><Num v={v} nuevo={activa} />
  </div>
);

/* ═══════════ H1 · LA FACTURA DE GUADUA ═══════════ */

const RENGLON_H1 = { "valor-a-facturar": 2, iva: 3, "debe-el-cliente": 5 };
export function FiguraFacturaGuadua({ estado, item, escrita = null }) {
  const mal = Boolean(estado.falla);
  const aqui = RENGLON_H1[item.id];
  return (
    <section className="c4t72" data-c4-figura="La factura de Guadua" aria-live="polite">
      <p className="c4t72-tit">{TEXTOS_C4_H1.titulo}</p>
      {estado.filas.map((f, k) => <Ren key={f.rot} rot={f.rot} v={f.v ?? (k === aqui ? escrita : null)} activa={Boolean(f.activa)} mal={mal} dato={k} />)}
      <LineaC4 estado={estado} />
    </section>
  );
}

/* ═══════════ H2 · LA ESCALERA DE LA CADENA ═══════════ */

export function FiguraEscaleraPalma({ estado }) {
  const mal = Boolean(estado.falla);
  const lista = estado.escalones[0].v;
  return (
    <section className="c4t72" data-c4-figura="La escalera de la cadena" aria-live="polite">
      <p className="c4t72-tit">{TEXTOS_C4_H2.titulo}</p>
      <div className="c4t73h-escalera">
        {estado.escalones.map((e, i) => (
          <div key={e.rot} className={`c4t73h-escalon${e.activa ? " activa" : ""}${e.activa && mal ? " mal" : ""}`} style={{ "--w": e.v / lista }} data-c4-escalon={i}>
            <span>{e.rot}</span><Num v={e.v} nuevo={Boolean(e.activa)} />
          </div>
        ))}
      </div>
      <LineaC4 estado={estado} />
    </section>
  );
}

/* ═══════════ H4 · EL CALENDARIO DEL PAGO ═══════════ */

const DIAS = Array.from({ length: 31 }, (_, i) => i + 1);
export function FiguraCalendarioPago({ estado, item, escrita = null }) {
  const mal = Boolean(estado.falla);
  return (
    <section className="c4t72" data-c4-figura="El calendario del pago" aria-live="polite">
      <p className="c4t72-tit">{TEXTOS_C4_H4.titulo}</p>
      <div className="c4t73h-cal" aria-hidden="true">
        {DIAS.map((d) => (
          <span key={d} className={`c4t73h-dia ${zonaH4(d)}${d === 3 ? " venta" : ""}${d === 23 && estado.pago ? ` pago${mal ? " mal" : ""}` : ""}`} data-dia={d}>
            {d}{d === 23 && estado.pago && <small className="c4t72-mov" data-c4-pago>{estado.pago}</small>}
          </span>
        ))}
      </div>
      <p className="c4t72-linea">{TEXTOS_C4_H4.linea}</p>
      {/* C4-2 de Mello: «Tu cifra» solo en los ítems de cifra. */}
      {item.tipo === "cifra" && <p className="c4t72-linea" data-c4-tuya>{TEXTOS_C4_H4.tuCifra} <Num v={estado.tuya ?? escrita} nuevo={estado.tuya != null} /></p>}
      <LineaC4 estado={estado} />
    </section>
  );
}

/* ═══════════ H5 · LA BALANZA DEL CONTEO ═══════════ */

export function FiguraBalanzaConteo({ estado, item, escrita = null, children = null }) {
  const T = TEXTOS_C4_H5;
  if (item.id === "estimar-provision") {
    return (
      <section className="c4t72" data-c4-figura="La balanza del conteo" aria-live="polite">
        <p className="c4t72-tit">{T.pino}</p>
        {children}
        <LineaC4 estado={estado} />
      </section>
    );
  }
  const ang = Math.max(-12, Math.min(12, (estado.conteo - estado.libros) / 4000));
  return (
    <section className="c4t72" data-c4-figura="La balanza del conteo" aria-live="polite">
      <p className="c4t72-tit">{T.olmo(estado.caso)}</p>
      <div className="c4t73h-balanza">
        <div className="c4t73h-brazo" style={{ transform: `rotate(${ang}deg)` }} data-c4-angulo={ang}>
          <span data-c4-libros>{T.libros} {pesos(estado.libros)}</span>
          <span data-c4-conteo>{T.conteo} {pesos(estado.conteo)}</span>
        </div>
        <i />
      </div>
      {estado.cmv && <p className={`c4t72-linea c4t72-chip${estado.falla ? " mal" : ""}`} data-c4-cmv>{T.cmv} {estado.cmv}</p>}
      {item.tipo === "cifra" && <p className="c4t72-linea" data-c4-tuya>{T.tuCifra} <Num v={estado.tuya ?? escrita} nuevo={estado.tuya != null} /></p>}
      <LineaC4 estado={estado} />
    </section>
  );
}

/* Lo que lleva una cuenta de Pino (las opciones de `estimar-provision`): su nombre y, si es la tocada, los $460.000 que recibe. */
export function CuentaDePino({ nombre, estado }) {
  const tocada = estado?.cuenta === nombre;
  return (
    <span style={{ display: "grid", gap: "6px", justifyItems: "start" }}>
      <span>{nombre}</span>
      {tocada && <b className={`c4t72-num c4t72-chip c4t72-mov${estado.falla ? " mal" : ""}`} data-c4-mov>{estado.mov}</b>}
    </span>
  );
}
