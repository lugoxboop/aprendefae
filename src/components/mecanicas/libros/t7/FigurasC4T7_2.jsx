import { useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import { Opciones } from "../../corazon/juego.jsx";
import { OpcionC } from "./hacerT7.jsx";
import { ESPERA_C4 } from "./decisionC4.jsx";
import { reducidoAhora } from "./aprenderC3.jsx";
import { TEXTOS_C4_H2, pesosC4 } from "../../../../contabilidad/c4/t7_2_h2_c4.js";
import { TEXTOS_C4_H5 } from "../../../../contabilidad/c4/t7_2_h5_c4.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · «TODA DECISIÓN SE PINTA» EN LOS HACER DE T7-2 (H2 y H5). Célula C.
 * Patrón de enganche C4 de Watari (patron-enganche-c4-v1.html, secciones
 * «t72-h2» y «t72-h5»; f72.js), en React.
 *
 * Las figuras solo PINTAN el estado que devuelve la consecuencia pura
 * (contabilidad/c4/t7_2_h2_c4.js y t7_2_h5_c4.js). La pieza la llama con lo
 * tocado o con la cifra ya COMPROBADA, ANTES del veredicto. C4-1 de Mello:
 * mientras se escribe, la figura solo MUESTRA la cifra en su lugar
 * (`escrita`), sin nada que dependa del resultado (ni «Cuadra», ni
 * «Sobran»/«Faltan», ni coral, ni ✕).
 *
 * El veredicto llega ESPERA_C4 (380 ms) después, con useVeredictoC4; con
 * movimiento reducido, en el mismo toque. El primer (y único) intento se
 * anota en el toque, como en el motor (t7/decisionC4.jsx).
 *
 * Por qué no el motor entero: H2 y H5 puntúan por unidad (8 y 7, con cada
 * línea de los asientos), llevan enunciado, ficha, hecho y la figura
 * acumulada del lote 5. El motor puntúa por ítem y no tiene dónde ponerlos;
 * se reúsan su espera, sus reglas y sus piezas sin cambiarlo.
 *
 * Rótulos y textos de consecuencia: los de Watari ([W] pendiente de Near),
 * que viven junto a la consecuencia. Colores: ✕ y texto en coral para lo que
 * no cuadra; ✓ y neutro para lo que cuadra. Nada de teal ni ámbar.
 * Provisional para Watari: la forma es la de su prototipo, con las clases de
 * la casa (prefijo c4t72-).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CSS_C4_T72 = `
.c4t72 { --texto: #F8F9FA; --atenuado: #A8B6C8; --neutro: #B8C4D4; --coral: #E76F51; --coral-texto: #EE8266;
  margin: 0 0 12px; padding: 12px 14px; display: grid; gap: 8px; min-width: 0; color: var(--texto);
  background: rgba(10,20,34,.45); border: 1px solid rgba(248,249,250,.12); border-radius: 12px; font: 400 13px/1.4 "Inter", system-ui, sans-serif; }
.c4t72 * { box-sizing: border-box; }
.c4t72-dos { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); }
.c4t72-cara { display: grid; gap: 4px; align-content: start; min-width: 0; }
.c4t72-tit { margin: 0; font: 600 13px/1.3 "Sora", sans-serif; }
.c4t72-ren { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 8px; padding: 6px 8px; font-size: 13px; border-radius: 6px; min-width: 0; }
.c4t72-ren.activa { outline: 2px solid var(--texto); outline-offset: -2px; }
.c4t72-ren.activa.mal { outline-color: var(--coral); }
.c4t72-num { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-variant-numeric: tabular-nums; font-weight: 700; white-space: nowrap; }
.c4t72-mov { display: inline-block; animation: c4t72-entra ${ESPERA_C4}ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes c4t72-entra { from { transform: translateY(-10px) scale(.96); opacity: 0; } to { transform: none; opacity: 1; } }
.c4t72-linea { margin: 0; font-size: 13px; line-height: 1.4; overflow-wrap: anywhere; }
.c4t72-mapa { display: flex; flex-wrap: wrap; gap: 6px; }
.c4t72-nodo { flex: 1 1 auto; text-align: center; padding: 8px 6px; border-radius: 8px; border: 1px solid rgba(248,249,250,.35); font-size: 13px; }
.c4t72-nodo.activo { border: 2px solid var(--texto); }
.c4t72-nodo.yo { font-weight: 700; }
.c4t72-efecto { font-size: 12px; line-height: 1.35; color: var(--atenuado); }
.c4t72-chip { font-size: 13px; padding: 2px 6px; border-radius: 6px; border: 1px solid var(--texto); }
.c4t72-chip.mal { border: 2px solid var(--coral); }
.c4t72-falla, .c4t72-cuadra { margin: 0; display: flex; gap: 6px; align-items: flex-start; font-size: 13px; line-height: 1.4; overflow-wrap: anywhere; }
.c4t72-falla { color: var(--coral-texto); }
.c4t72-falla svg, .c4t72-cuadra svg { width: 16px; height: 16px; flex: none; margin-top: 1px; }
@media (prefers-reduced-motion: reduce) { .c4t72 *, .c4t72 *::before, .c4t72 *::after { animation: none !important; transition: none !important; } }
`;

/* El veredicto, ESPERA_C4 después del toque (con movimiento reducido, ya). Se cancela al desmontar o al pasar de ítem. */
export function useVeredictoC4() {
  const reloj = useRef(null);
  const cancelar = () => { if (reloj.current) { clearTimeout(reloj.current); reloj.current = null; } };
  useEffect(() => cancelar, []);
  const programar = (fn) => {
    cancelar();
    if (reducidoAhora()) { fn(); return; }
    reloj.current = setTimeout(() => { reloj.current = null; fn(); }, ESPERA_C4);
  };
  return { programar, cancelar };
}

/* Lo que implica lo elegido, con texto (nunca solo color). */
export function LineaC4({ estado }) {
  if (estado?.falla) return <p className="c4t72-falla" data-c4-linea="falla"><X aria-hidden="true" strokeWidth={2.5} /><span>{estado.falla}</span></p>;
  if (estado?.cuadra) return <p className="c4t72-cuadra" data-c4-linea="cuadra"><Check aria-hidden="true" strokeWidth={2.5} /><span>{estado.cuadra}</span></p>;
  return null;
}

const Num = ({ v, nuevo = false }) => (v == null
  ? <b className="c4t72-num" data-c4-valor="">$?</b>
  : <b key={v} className={`c4t72-num${nuevo ? " c4t72-mov" : ""}`} data-c4-valor={v}>{pesosC4(v)}</b>);

const Ren = ({ rot, v, activa = false, mal = false, dato }) => (
  <div className={`c4t72-ren${activa ? " activa" : ""}${activa && mal ? " mal" : ""}`} data-c4-ren={dato}>
    <span>{rot}</span><Num v={v} nuevo={activa} />
  </div>
);

/* ═══════════ H2 · LA VENTA POR SUS DOS CARAS ═══════════ */

export function FiguraVentaDosCaras({ estado, escrita = null }) {
  const T = TEXTOS_C4_H2;
  const { factura: f, bodega: b, activa } = estado;
  const mal = Boolean(estado.falla);
  return (
    <section className="c4t72" data-c4-figura="La venta por sus dos caras" aria-live="polite">
      <div className="c4t72-dos">
        <div className="c4t72-cara">
          <p className="c4t72-tit">{T.factura}</p>
          <Ren rot={T.venta} v={f.venta} dato="venta" />
          <Ren rot={T.iva} v={f.iva} dato="iva" />
          <Ren rot={T.retencion} v={f.retencion} dato="retencion" />
          <Ren rot={T.cliente} v={f.cliente ?? escrita} activa={activa === "cliente"} mal={mal} dato="cliente" />
        </div>
        <div className="c4t72-cara">
          <p className="c4t72-tit">{T.bodega}</p>
          <Ren rot={T.costo} v={b.costo} dato="costo" />
          <Ren rot={T.sale} v={b.sale} activa={activa === "sale"} mal={mal} dato="sale" />
        </div>
      </div>
      <LineaC4 estado={estado} />
    </section>
  );
}

/* El estado de una opción de un solo toque: «elegida» mientras llega el veredicto; luego correcta, incorrecta o revelada («Iba aquí»). */
export const estadoOpcionC4 = (v, elegida, r) => {
  if (!r) return v === elegida ? "elegida" : null;
  if (v === elegida) return r.ok ? "correcta" : "incorrecta";
  return v === r.correcta ? "revelada" : null;
};

/*
 * La elección de un solo toque de hacerT7 (Eleccion), con lo que pide la C4:
 * al tocar, todas se bloquean y la tocada queda marcada mientras llega el
 * veredicto. `contenido(o)` pinta lo que la opción lleva dentro (H5: el valor
 * que entra a la cuenta y lo que le pasa).
 */
export function EleccionC4({ opciones, r, elegida, onElegir, etiqueta, contenido = null }) {
  return (
    <div role="group" aria-label={etiqueta}>
      <Opciones columnas="minmax(0, 1fr)">
        {opciones.map((o) => (
          <span key={String(o.valor)} data-opcion={o.valor} style={{ display: "contents" }}>
            <OpcionC ancho deshabilitada={elegida != null} estado={estadoOpcionC4(o.valor, elegida, r)} onClick={() => onElegir(o.valor)}>
              {contenido ? contenido(o) : o.texto}
            </OpcionC>
          </span>
        ))}
      </Opciones>
    </div>
  );
}

/* ═══════════ H5 · EL MAPA DE MANGLE ═══════════ */

export function FiguraMapaDeMangle({ estado, item, escrita = null, children = null }) {
  const T = TEXTOS_C4_H5;
  const { de, a } = estado.mapa;
  return (
    <section className="c4t72" data-c4-figura="El mapa de Mangle" aria-live="polite">
      <div className="c4t72-mapa" data-c4-mapa>
        {T.nodos.map((n) => <span key={n} className={`c4t72-nodo${n === "Mangle" ? " yo" : ""}${n === de || n === a ? " activo" : ""}`} data-nodo={n}>{n}</span>)}
      </div>
      <p className="c4t72-linea" data-c4-flecha>{`${de} → ${a}`}</p>
      {item.tipo === "cifra" ? (
        <>
          <p className="c4t72-linea" data-c4-calculo>{estado.linea}</p>
          <p className="c4t72-linea" data-c4-tuya>{T.tuCifra} <Num v={estado.tuya ?? escrita} nuevo={estado.tuya != null} />{estado.retiene ? ` · ${estado.retiene}` : ""}</p>
        </>
      ) : (
        <>
          <p className="c4t72-tit">{T.libro}</p>
          {children}
        </>
      )}
      <LineaC4 estado={estado} />
    </section>
  );
}

/* Lo que lleva dentro una cuenta del libro de Mangle: su nombre y, si es la tocada, el valor que entra y lo que le pasa. */
export function CuentaDeMangle({ nombre, estado }) {
  const tocada = estado?.cuenta === nombre;
  return (
    <span style={{ display: "grid", gap: "6px", justifyItems: "start" }}>
      <span>{nombre}</span>
      {tocada && <b className={`c4t72-num c4t72-chip c4t72-mov${estado.falla ? " mal" : ""}`} data-c4-mov>{estado.mov}</b>}
      {tocada && <span className="c4t72-efecto" data-c4-efecto>{estado.efecto}</span>}
    </span>
  );
}
