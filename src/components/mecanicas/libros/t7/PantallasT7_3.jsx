import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { barajar, barajarDistinto } from "../../../../utils/barajar.js";
import { Panel } from "../../salaDeControl/marco.jsx";
import { BOTON, INTERFAZ, DEBE, HABER, PENDIENTE_DE_REVISION, FRASE_TARIFAS } from "../../../../data/contabilidadT7_3.js";
import { Renglones, Plazos, Barras, FranjaNIC2, CSS_T73_PATRON } from "./PatronT7_3.jsx";
import { Plegable } from "./plegable.jsx";
import { textosDelError, contarFallo } from "./escaleraAyuda.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · LAS PANTALLAS DE APRENDER (Célula C).
 *
 * Una pieza es una lista de pantallas, una a la vez, con las formas de las
 * piezas de Aprender de T7-2 (A3 a A6). Mientras llega el «Patrón T7-3» de
 * Watari, va con el patrón tabular v3.2. Tres tipos:
 *
 *   · portada / lectura / resumen   el objetivo, los textos, una ficha de
 *                cinco datos, lo que venga después, un asiento, cuentas T y el
 *                texto que los sigue (`tras`); el «Siguiente» del
 *                resumen; botón y pie. El resumen, que es la última pantalla,
 *                no lleva botón
 *   · eleccion   antes de la pregunta, lo que la pantalla traiga (textos,
 *                ficha, pasos); después, opciones barajadas en cada intento,
 *                «Confirmar», y «Incorrecto.» con «Probar otra» o «Correcto.»
 *                con «Seguir». Con el acierto se descubre lo que sigue: más
 *                texto, un asiento y otro texto
 *
 * Las figuras del «Patrón T7-3» de Watari (renglones y franja de plazos)
 * van con el texto de la pantalla (`figuras`) si el texto ya da la cifra, o
 * con el acierto (`acierto.figuras`) si la pantalla la pregunta.
 *
 * Los asientos van en el modo lectura del patrón tabular (DEBE en verde
 * azulado, HABER en ámbar, sangría en el haber) y, si la pieza lo pide, con
 * sus sumas debajo y el nombre de la empresa arriba. Un asiento sin fecha
 * (el libro pone «xxxx») no la muestra. Una cuenta T lleva su titular, el
 * nombre de la cuenta, y cada movimiento con su fecha en su lado.
 *
 * Una pieza puede traer un aviso fijo (`aviso`), a la vista en todas sus
 * pantallas: la frase de la NIC 2 en A7 y A8, con la franja del Patrón
 * T7-3 (pegada arriba mientras se desplaza). Una pantalla puede traer una
 * lista con viñetas (`lista`) después de sus textos.
 *
 * LOS RECORTES DEL LOTE 1 (Near, con las correcciones de Mello):
 *   · el acierto trae su «¿Por qué?» escrito aparte (`acierto.porque`), que
 *     va plegado detrás del texto visible. Si el plegado trae una condición
 *     que limita una regla (`acierto.porqueALaVista`), no se pliega: va a la
 *     vista, debajo, hasta que L decida (regla de L)
 *   · una figura puede crecer o cambiar al acertar (`alAcertar`, que se
 *     mezcla con la figura): la cadena suma sus renglones, los plazos
 *     muestran lo que lleva cada uno
 *   · una línea de asiento puede ir en blanco (`enBlanco`, «$?») hasta el
 *     acierto, y una cuenta puede abrir su definición al tocarla
 *     (`terminos`), una a la vez, como las utilidades de T7-1
 *   · cuentas T lado a lado (`cuentasTLado`) y barras de libros contra
 *     conteo (`Barras`, del patrón)
 *   · la frase de las tarifas va en el pie de la pantalla que las da
 *     (`pieTarifas`), debajo de la fuente
 *
 * Cada pantalla lleva su pie en todos sus estados. NO CALIFICA y no da FP:
 * es Aprender. Clases con el prefijo `t73p-`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const P = { fondo: "#0E1B2E", texto: "#F8F9FA", texto2: "#A8B6C8", borde: "#B8C4D4", debe: "#2A9D8F", haber: "#E9C46A", error: "#E76F51" };

/* Las cifras con el formato del libro: miles con punto. */
export const cifra = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export const CSS_T73P = `
.t73p { display: grid; gap: 12px; min-width: 0; color: ${P.texto}; font-family: "Inter", sans-serif; font-size: 15px; line-height: 1.4; }
.t73p * { box-sizing: border-box; }
.t73p-p { margin: 0; font-size: 15px; line-height: 1.5; overflow-wrap: anywhere; }
.t73p-nota { margin: 0; font-size: 14px; line-height: 1.45; color: ${P.texto2}; overflow-wrap: anywhere; }
.t73p-preg { font: 600 15px/1.45 "Sora", "Inter", sans-serif; }
.t73p-pie { margin: 4px 0 0; font-size: 12px; line-height: 1.4; color: ${P.texto2}; overflow-wrap: anywhere; }
.t73p-btn { appearance: none; min-height: 44px; width: 100%; border-radius: 8px; border: 1px solid ${P.texto}; background: ${P.texto}; color: ${P.fondo}; font: 600 15px "Inter", sans-serif; cursor: pointer; }
.t73p-btn[aria-disabled="true"] { background: transparent; color: ${P.texto2}; border-color: ${P.texto2}; cursor: default; }
.t73p-btn:focus-visible, .t73p-op:focus-visible { outline: 2px solid ${P.texto}; outline-offset: 2px; }
.t73p-ficha { margin: 0; display: grid; gap: 6px; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; }
.t73p-ficha dt { font: 500 12px/1.2 "Inter", sans-serif; color: ${P.texto2}; letter-spacing: .02em; }
.t73p-ficha dd { margin: 0 0 4px; font-size: 15px; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
.t73p-ops { display: grid; gap: 8px; }
.t73p-op { appearance: none; text-align: left; min-height: 44px; padding: 10px 14px; border: 1px solid ${P.borde}; border-radius: 12px; background: transparent; color: ${P.texto}; font: 400 15px/1.35 "Inter", sans-serif; cursor: pointer; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
.t73p-op[aria-pressed="true"] { background: ${P.texto}; color: ${P.fondo}; border-color: ${P.texto}; }
.t73p-op:disabled { cursor: default; }
.t73p-op-error { border-color: ${P.error}; box-shadow: inset 0 0 0 1px ${P.error}; }
.t73p-msg { display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 8px; align-items: start; padding: 10px 12px; border-radius: 8px; border: 1px solid; outline: none; }
.t73p-msg-error { border-color: ${P.error}; }
.t73p-msg-ok { border-color: ${P.borde}; }
.t73p-msg svg { margin-top: 2px; }
.t73p-msg-cuerpo { display: grid; gap: 6px; min-width: 0; }
.t73p-msg-palabra { font: 600 14px/1.35 "Inter", sans-serif; }
.t73p-msg-error .t73p-msg-palabra { color: ${P.error}; }
.t73p-msg p { margin: 0; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; }
/* asiento en lectura, con sumas */
.t73p-as { display: grid; grid-template-columns: minmax(0, 1fr); min-width: 0; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; }
.t73p-g2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.t73p-as-h { display: grid; gap: 6px; padding-bottom: 6px; font: 600 13px "Sora", "Inter", sans-serif; }
.t73p-as-h .t73p-g2 > span { font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; text-align: right; padding-inline: 9px; }
.t73p-d { color: ${P.debe}; } .t73p-hb { color: ${P.haber}; }
.t73p-as-r { display: grid; gap: 4px; padding-block: 8px; border-top: 1px solid ${P.borde}; }
.t73p-as-r > span:first-child { font-size: 14px; overflow-wrap: anywhere; min-width: 0; }
.t73p-as-r .t73p-g2 > span { text-align: right; padding-inline: 9px; font: 500 15px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; min-width: 0; }
.t73p-sangria { padding-left: 24px; }
.t73p-sumas { border-top: 2px solid ${P.borde}; }
.t73p-sumas > span:first-child { color: ${P.texto2}; }
.t73p-sumas .t73p-g2 > span { font-weight: 700; }
.t73p-sumas .t73p-g2 > span:first-child { color: ${P.debe}; }
.t73p-sumas .t73p-g2 > span:last-child { color: ${P.haber}; }
.t73p-titular { font: 600 13px/1.3 "Sora", "Inter", sans-serif; color: ${P.texto2}; padding-bottom: 4px; }
/* cuenta T: la cuenta arriba, debe a la izquierda y haber a la derecha, con la raya del medio */
.t73p-ts { display: grid; gap: 10px; }
.t73p-t { border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; min-width: 0; }
.t73p-t-cuenta { margin: 0; padding-bottom: 6px; border-bottom: 2px solid ${P.borde}; text-align: center; font-size: 14px; line-height: 1.35; overflow-wrap: anywhere; }
.t73p-t-lados { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.t73p-t-lado { display: grid; align-content: start; gap: 4px; padding: 6px 8px 0; min-width: 0; }
.t73p-t-lado + .t73p-t-lado { border-left: 2px solid ${P.borde}; }
.t73p-t-rot { font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; }
.t73p-t-mov { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 0 6px; }
.t73p-t-fecha { font-size: 12px; color: ${P.texto2}; font-variant-numeric: tabular-nums; }
.t73p-t-v { margin-left: auto; font: 500 15px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
/* cuentas T lado a lado (resumen de los dos libros) */
.t73p-ts-lado { margin: 0; display: grid; gap: 8px; }
.t73p-ts-lado > figcaption { font: 600 13px/1.3 "Sora", "Inter", sans-serif; }
.t73p-ts-lado-par { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.t73p-ts-lado .t73p-t { padding: 8px 4px; }
.t73p-ts-lado .t73p-t-lado { padding: 6px 2px 0; }
/* Lado a lado, cada lado mide la mitad de media caja (unos 58 px a 320): la cifra baja a 12 px, la letra mínima, para caber sin cruzar la raya. */
.t73p-ts-lado .t73p-t-v { font-size: 12px; }
/* una cuenta que se abre al tocarla: su definición debajo de la línea */
.t73p-termino { appearance: none; display: inline-flex; align-items: center; min-height: 44px; margin: 0; padding: 0; border: none; background: none; color: ${P.texto}; font: inherit; text-align: left; text-decoration: underline dotted; text-underline-offset: 3px; cursor: pointer; overflow-wrap: anywhere; }
.t73p-termino[aria-expanded="true"] { text-decoration-style: solid; font-weight: 600; }
.t73p-termino:focus-visible { outline: 2px solid ${P.texto}; outline-offset: 2px; border-radius: 4px; }
.t73p-def { margin: 0; padding: 8px 10px; display: grid; gap: 6px; border-left: 3px solid ${P.borde}; background: rgba(248,249,250,0.05); border-radius: 0 6px 6px 0; }
.t73p-def dt { font: 600 13px/1.3 "Inter", sans-serif; }
.t73p-def dd { margin: 0; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; }
.t73p-lista { margin: 0; padding-left: 22px; display: grid; gap: 6px; font-size: 15px; line-height: 1.45; }
/* La hoja global del sitio quita el estilo de lista: aquí vuelven las viñetas. */
.t73p-lista li { overflow-wrap: anywhere; list-style: disc; }
/* La fusión de la NIC 2: columnas, fichas y lo que se abre (provisional para Watari). */
.t73p-cols { margin: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.t73p-col { border: 1px solid ${P.borde}; border-radius: 10px; padding: 10px 12px; min-width: 0; display: grid; align-content: start; gap: 4px; }
.t73p-col-t { margin: 0; font: 600 13px/1.3 "Sora", "Inter", sans-serif; }
.t73p-col-x { margin: 0; font-size: 14px; line-height: 1.4; overflow-wrap: anywhere; }
.t73p-fichas { margin: 0; display: grid; gap: 8px; border: 1px solid ${P.borde}; border-radius: 10px; padding: 10px 12px; min-width: 0; }
.t73p-medida { margin: 0; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 2px 10px; font-size: 14px; line-height: 1.35; }
.t73p-medida span { overflow-wrap: anywhere; min-width: 0; }
.t73p-medida strong { font-weight: 700; }
.t73p-fichas-l { margin: 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 6px; }
.t73p-fichas-l li { list-style: none; border: 1px solid ${P.borde}; border-radius: 999px; padding: 4px 10px; font-size: 13px; line-height: 1.3; overflow-wrap: anywhere; }
.t73p-desp { display: grid; gap: 8px; }
.t73p-desp-b { appearance: none; min-height: 44px; width: 100%; text-align: left; padding: 10px 14px; border: 1px solid ${P.borde}; border-radius: 8px; background: transparent; color: ${P.texto}; font: 600 15px/1.35 "Inter", sans-serif; cursor: pointer; }
.t73p-desp-b[aria-expanded="true"] { border-color: ${P.texto}; }
.t73p-desp-b:focus-visible { outline: 2px solid ${P.texto}; outline-offset: 2px; }
.t73p-desp-c { display: grid; gap: 8px; }
.t73p-nueva { animation: t73p-aparece .12s ease-out; }
@keyframes t73p-aparece { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .t73p *, .t73p *::before, .t73p *::after { transition: none !important; animation: none !important; } }
`;

/*
 * El pie: la fuente y, en la pantalla que da las tarifas, la frase de las
 * tarifas debajo. Con `marca` (la fusión de la NIC 2, `pieMarca`), la marca
 * de un ejemplo construido, «Ejemplo que no es del libro», también debajo.
 */
function Pie({ texto, tarifas = false, marca = null }) {
  return (
    <>
      <p className="t73p-pie" data-pie>{texto}</p>
      {tarifas && <p className="t73p-pie" data-pie data-pie-tarifas>{FRASE_TARIFAS}</p>}
      {marca && <p className="t73p-pie" data-pie data-pie-marca>{marca}</p>}
    </>
  );
}

function Boton({ nombre, texto, onClick, inactivo = false }) {
  return (
    <button type="button" className="t73p-btn" data-boton={nombre} aria-disabled={inactivo ? "true" : undefined} onClick={inactivo ? undefined : onClick}>
      {texto}
    </button>
  );
}

/*
 * Con `enteros` (los recortes: `pieza.textosEnteros`), los textos del mensaje
 * se ven enteros, como los de la pantalla: el plegado automático no corta lo
 * que Near ya midió. Aciertos C7: el acierto de «no-operacional» trae tres
 * frases y su condición, y nada de él se pliega. El «¿Por qué?» escrito
 * aparte (`porque`) sigue igual.
 */
function Mensaje({ ok, textos, porque = null, porqueALaVista = false, enteros = false, refFoco }) {
  return (
    <div ref={refFoco} tabIndex={-1} role="status" className={`t73p-msg ${ok ? "t73p-msg-ok" : "t73p-msg-error"}`} data-mensaje={ok ? "acierto" : "error"}>
      {ok ? <Check size={16} color={P.texto} aria-hidden="true" /> : <X size={16} color={P.error} aria-hidden="true" />}
      <div className="t73p-msg-cuerpo">
        <span className="t73p-msg-palabra" data-palabra>{ok ? INTERFAZ.correcto : INTERFAZ.incorrecto}</span>
        {textos.map((t, i) => {
          const suPorque = i === 0 && !porqueALaVista ? porque : null;
          return <p key={t} data-texto>{enteros && !suPorque ? t : <Plegable texto={t} porque={suPorque} />}</p>;
        })}
        {porque && porqueALaVista && <p data-texto data-porque-a-la-vista><Plegable texto={porque} /></p>}
      </div>
    </div>
  );
}

/*
 * Los textos de los recortes (`pieza.textosEnteros`) ya vienen medidos por
 * Near para verse enteros: no pasan por el plegado automático, que es para
 * los textos largos de antes. Su «¿Por qué?» va escrito aparte.
 */
const Textos = ({ lista, clase = "t73p-p", nueva = false, enteros = false }) => (lista ?? []).map((t) => <p key={t} className={`${clase}${nueva ? " t73p-nueva" : ""}`} data-texto>{enteros ? t : <Plegable texto={t} />}</p>);

function Ficha({ ficha }) {
  return (
    <dl className="t73p-ficha" data-ficha>
      {ficha.map((f) => (
        <div key={f.dato} data-dato>
          <dt>{f.dato}</dt>
          <dd data-texto data-ficha-texto>{f.texto}</dd>
        </div>
      ))}
    </dl>
  );
}

/* Un asiento en lectura; con `sumas`, la fila de las sumas debajo. */
export function Asiento({ asiento, nuevo = false, revelar = false }) {
  const suma = (lado) => asiento.lineas.filter((l) => l.lado === lado).reduce((s, l) => s + l.monto, 0);
  /* La cuenta cuya definición está abierta: una a la vez. */
  const [abierta, setAbierta] = useState(null);
  const monto = (l) => (l.enBlanco && !revelar ? l.enBlanco : cifra(l.monto));
  return (
    <div className={`t73p-as${nuevo ? " t73p-nueva" : ""}`} data-figura role="table" aria-label={[asiento.titular, asiento.fecha ?? PENDIENTE_DE_REVISION.nombreAsiento].filter(Boolean).join(", ")} data-asiento={asiento.fecha ?? "sin-fecha"} data-revision="pendiente">
      {asiento.titular && <div className="t73p-titular" data-titular>{asiento.titular}</div>}
      <div className="t73p-as-h" role="row">
        {asiento.fecha && <span role="columnheader" data-fecha>{asiento.fecha}</span>}
        <span className="t73p-g2">
          <span className="t73p-d" role="columnheader">{INTERFAZ.debe}</span>
          <span className="t73p-hb" role="columnheader">{INTERFAZ.haber}</span>
        </span>
      </div>
      {asiento.lineas.map((l) => {
        const id = `t73p-def-${String(l.cuenta).replace(/\W+/g, "-")}`;
        const abierto = abierta === l.cuenta;
        return (
          <div key={l.cuenta} className="t73p-as-r" role="row" data-linea={l.cuenta} data-lado={l.lado} data-en-blanco={l.enBlanco && !revelar ? "" : undefined}>
            <span role="rowheader" className={l.lado === DEBE ? undefined : "t73p-sangria"}>
              {l.terminos
                ? <button type="button" className="t73p-termino" data-termino={l.cuenta} aria-expanded={abierto} aria-controls={abierto ? id : undefined} onClick={() => setAbierta(abierto ? null : l.cuenta)}>{l.cuenta}</button>
                : l.cuenta}
            </span>
            <span className="t73p-g2">
              <span role="cell">{l.lado === DEBE ? monto(l) : ""}</span>
              <span role="cell">{l.lado === HABER ? monto(l) : ""}</span>
            </span>
            {abierto && (
              <dl className="t73p-def t73p-nueva" id={id} data-definicion={l.cuenta}>
                {l.terminos.map((t) => (
                  <div key={t.termino} data-def-termino={t.termino}><dt>{t.termino}</dt><dd data-texto>{t.definicion}</dd></div>
                ))}
              </dl>
            )}
          </div>
        );
      })}
      {asiento.sumas && (
        <div className="t73p-as-r t73p-sumas" role="row" data-sumas>
          <span role="rowheader">{INTERFAZ.sumas}</span>
          <span className="t73p-g2">
            <span role="cell" data-suma={DEBE}>{cifra(suma(DEBE))}</span>
            <span role="cell" data-suma={HABER}>{cifra(suma(HABER))}</span>
          </span>
        </div>
      )}
    </div>
  );
}

/* Una cuenta T: su titular, el nombre de la cuenta y los movimientos de cada lado, con su fecha. */
function CuentaT({ t }) {
  const lado = (cual, movs, clase) => (
    <div className="t73p-t-lado" data-lado-t={cual}>
      <span className={`t73p-t-rot ${clase}`}>{cual === DEBE ? INTERFAZ.debe : INTERFAZ.haber}</span>
      {movs.map((m) => (
        <span key={`${m.fecha}-${m.monto}`} className="t73p-t-mov" data-mov-t>
          {m.fecha && <span className="t73p-t-fecha">{m.fecha}</span>}<span className="t73p-t-v">{cifra(m.monto)}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="t73p-t" data-cuenta-t={t.titular} role="group" aria-label={`${t.titular}, ${t.cuenta}`}>
      <div className="t73p-titular">{t.titular}</div>
      <p className="t73p-t-cuenta">{t.cuenta}</p>
      <div className="t73p-t-lados">
        {lado(DEBE, t.debe, "t73p-d")}
        {lado(HABER, t.haber, "t73p-hb")}
      </div>
    </div>
  );
}
/*
 * LA FUSIÓN DE LA NIC 2 (entrega 4 de Near): dos figuras más, en lectura.
 * PROVISIONALES PARA WATARI: todavía no entrega su forma; van sobrias, con
 * los tokens y el borde de los renglones, sin teal ni ámbar.
 *   · columnas   «Se suma» y «Se resta», una al lado de la otra
 *   · fichas     la medida («Costo o valor neto realizable» → «El menor de
 *                los dos») y las tres fórmulas como fichas
 */
function Columnas({ columnas, nuevo = false }) {
  return (
    <figure className={`t73p-cols${nuevo ? " t73p-nueva" : ""}`} data-figura data-columnas>
      {columnas.map((c) => (
        <div key={c.titulo} className="t73p-col" data-columna={c.titulo}>
          <p className="t73p-col-t">{c.titulo}</p>
          <p className="t73p-col-x">{c.texto}</p>
        </div>
      ))}
    </figure>
  );
}

function Fichas({ medida, fichas, nuevo = false }) {
  return (
    <figure className={`t73p-fichas${nuevo ? " t73p-nueva" : ""}`} data-figura data-fichas>
      <p className="t73p-medida" data-medida><span>{medida.rot}</span><strong>{medida.valor}</strong></p>
      <ul className="t73p-fichas-l">{fichas.map((t) => <li key={t} data-ficha-nic2>{t}</li>)}</ul>
    </figure>
  );
}

/* Las figuras del Patrón T7-3: { tipo: "renglones", titulo, filas, nota } o { tipo: "plazos", venta, condiciones, pago }. */
/* Con `acerto`, cada figura toma lo que trae para el acierto (`alAcertar`). */
const Figuras = ({ lista, nuevo = false, acerto = false }) => (lista ?? []).map((f0, k) => {
  const f = acerto && f0.alAcertar ? { ...f0, ...f0.alAcertar } : f0;
  if (f.tipo === "plazos") return <Plazos key={k} {...f} nuevo={nuevo || (acerto && Boolean(f0.alAcertar))} />;
  if (f.tipo === "barras") return <Barras key={k} titulo={f.titulo} barras={f.barras} escala={f.escala ?? null} nuevo={nuevo} />;
  if (f.tipo === "columnas") return <Columnas key={k} columnas={f.columnas} nuevo={nuevo} />;
  if (f.tipo === "fichas") return <Fichas key={k} medida={f.medida} fichas={f.fichas} nuevo={nuevo} />;
  return <Renglones key={k} titulo={f.titulo} filas={f.filas} nota={f.nota ?? null} nuevo={nuevo} />;
});

/*
 * Lo que se abre al tocar su botón (la fusión de la NIC 2: «Ver lo que la
 * norma pide informar», en el resumen). No es un botón de interfaz: lleva
 * `aria-expanded` y su contenido solo se pinta abierto.
 */
function Desplegable({ d }) {
  const [abierto, setAbierto] = useState(false);
  const id = "t73p-desplegable";
  return (
    <div className="t73p-desp" data-desplegable>
      <button type="button" className="t73p-desp-b" aria-expanded={abierto} aria-controls={abierto ? id : undefined} onClick={() => setAbierto((x) => !x)}>
        <span data-texto data-desplegable-boton>{d.boton}</span>
      </button>
      {abierto && (
        <div id={id} className="t73p-desp-c t73p-nueva" data-desplegado>
          <Textos lista={d.parrafos} enteros />
          {d.lista && <ul className="t73p-lista" data-lista>{d.lista.map((t) => <li key={t} data-texto>{t}</li>)}</ul>}
        </div>
      )}
    </div>
  );
}

const Asientos = ({ lista, nuevo = false, revelar = false }) => (lista ?? []).map((a, k) => <Asiento key={k} asiento={a} nuevo={nuevo} revelar={revelar} />);

/* Dos cuentas T, una al lado de la otra, con su rótulo arriba. */
const CuentasTLado = ({ fig }) => (
  <figure className="t73p-ts-lado" data-cuentas-t-lado data-figura>
    <figcaption>{fig.titulo}</figcaption>
    <div className="t73p-ts-lado-par">{fig.cuentas.map((t) => <CuentaT key={t.titular} t={t} />)}</div>
  </figure>
);

/* Lo que una pantalla trae antes de su pregunta o de su botón. */
function Cuerpo({ p, acerto = false, enteros = false }) {
  return (
    <>
      {p.objetivo && <p className="t73p-p" data-texto data-objetivo>{p.objetivo}</p>}
      <Textos lista={p.parrafos} enteros={enteros} />
      {p.lista && <ul className="t73p-lista" data-lista>{p.lista.map((t) => <li key={t} data-texto>{t}</li>)}</ul>}
      {p.ficha && <Ficha ficha={p.ficha} />}
      <Textos lista={p.despues} enteros={enteros} />
      <Figuras lista={p.figuras} acerto={acerto} />
      <Asientos lista={p.asientos} revelar={acerto} />
      {p.cuentasT && <div className="t73p-ts" data-cuentas-t data-figura>{p.cuentasT.map((t) => <CuentaT key={t.titular} t={t} />)}</div>}
      {p.cuentasTLado && <CuentasTLado fig={p.cuentasTLado} />}
      <Textos lista={p.tras} enteros={enteros} />
    </>
  );
}

/* ═══════════ ELECCIÓN ═══════════ */

/*
 * La escalera de ayuda (escaleraAyuda.js), con una variante de los recortes:
 * si la pantalla trae `errorPropio` (T7-3 A3 · `cual-le-toca`, paquete de
 * Near), desde el 2.º error se ve la devolución de la opción tocada, que ya
 * dice la respuesta y su porqué, en lugar de «La respuesta es…» y el acierto.
 * El 1.er error sigue dando la pista.
 */
export function textosDeErrorT73(pantalla, opcion, fallos) {
  if (pantalla.errorPropio && pantalla.pista && fallos >= 2 && opcion.devolucion) return [opcion.devolucion];
  return textosDelError(pantalla, opcion, fallos);
}

function Eleccion({ pantalla, onSeguir, enteros = false }) {
  const [orden, setOrden] = useState(() => barajar(pantalla.opciones));
  const [elegida, setElegida] = useState(null);
  const [confirmada, setConfirmada] = useState(null);
  /* Cuántas veces se ha fallado esta pregunta: la escalera de ayuda (escaleraAyuda.js). */
  const [fallos, setFallos] = useState(0);
  const ref = useRef(null);
  const opcion = confirmada ? pantalla.opciones.find((o) => o.id === confirmada) : null;
  const estado = !opcion ? "colocando" : opcion.correcta ? "acierto" : "error";
  useEffect(() => { if (estado !== "colocando") ref.current?.focus(); }, [estado]);
  const pie = estado === "colocando" ? pantalla.pie : estado === "error" ? pantalla.error.pie : pantalla.acierto.pie;
  const a = pantalla.acierto;

  return (
    <div className="t73p" data-eleccion={pantalla.id} data-estado={estado}>
      <Cuerpo p={pantalla} acerto={estado === "acierto"} enteros={enteros} />
      <p className="t73p-p t73p-preg" data-texto data-pregunta>{pantalla.pregunta}</p>
      <div className="t73p-ops" role="group" aria-label={pantalla.pregunta}>
        {orden.map((o) => {
          const esta = o.id === (confirmada ?? elegida);
          return (
            <button key={o.id} type="button" className={`t73p-op${estado === "error" && esta ? " t73p-op-error" : ""}`} data-opcion={o.id} aria-pressed={esta} disabled={Boolean(confirmada)} onClick={() => setElegida(o.id)}>
              {o.texto}
            </button>
          );
        })}
      </div>
      {estado === "colocando" && <Boton nombre="confirmar" texto={BOTON.confirmar} inactivo={!elegida} onClick={() => { contarFallo(pantalla, elegida, setFallos); setConfirmada(elegida); }} />}
      {estado === "error" && (
        <>
          <Mensaje ok={false} textos={textosDeErrorT73(pantalla, opcion, fallos)} enteros={enteros} refFoco={ref} />
          <Boton nombre="probar-otra" texto={BOTON.probarOtra} onClick={() => { setOrden((x) => barajarDistinto(pantalla.opciones, x, (o) => o.id)); setElegida(null); setConfirmada(null); }} />
        </>
      )}
      {estado === "acierto" && (
        <>
          <Mensaje ok textos={[a.texto]} porque={a.porque ?? null} porqueALaVista={Boolean(a.porqueALaVista)} enteros={enteros} refFoco={ref} />
          <Figuras lista={a.figuras} nuevo />
          <Textos lista={a.parrafos} nueva enteros={enteros} />
          <Asientos lista={a.asientos} nuevo />
          <Textos lista={a.despues} nueva enteros={enteros} />
          {onSeguir && <Boton nombre="seguir" texto={BOTON.seguir} onClick={onSeguir} />}
        </>
      )}
      <Pie texto={pie} tarifas={pantalla.pieTarifas} marca={pantalla.pieMarca} />
    </div>
  );
}

/* ═══════════ LA PIEZA ═══════════ */

export default function PantallasT7_3({ pieza, rotulo }) {
  const [k, setK] = useState(0);
  const p = pieza.pantallas[k];
  const ultima = k === pieza.pantallas.length - 1;
  const marco = useRef(null);
  const primera = useRef(true);
  const seguir = () => setK((x) => Math.min(x + 1, pieza.pantallas.length - 1));
  useEffect(() => { if (primera.current) { primera.current = false; return; } marco.current?.focus(); }, [k]);

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_T73P + CSS_T73_PATRON}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-pantalla={p.id} className={pieza.aviso ? "t73pt-pieza" : undefined} style={{ outline: "none" }}>
        {pieza.aviso && <FranjaNIC2 texto={pieza.aviso} />}
        {p.tipo === "eleccion" ? (
          <Eleccion key={p.id} pantalla={p} onSeguir={ultima ? null : seguir} enteros={Boolean(pieza.textosEnteros)} />
        ) : (
          <div className="t73p">
            <Cuerpo p={p} enteros={Boolean(pieza.textosEnteros)} />
            {p.desplegable && <Desplegable d={p.desplegable} />}
            {p.siguiente && <p className="t73p-nota" data-texto data-siguiente>{p.siguiente}</p>}
            {p.boton && !ultima && <Boton nombre={p.tipo === "portada" ? "empezar" : "seguir"} texto={p.boton} onClick={seguir} />}
            <Pie texto={p.pie} tarifas={p.pieTarifas} marca={p.pieMarca} />
          </div>
        )}
      </div>
    </Panel>
  );
}
