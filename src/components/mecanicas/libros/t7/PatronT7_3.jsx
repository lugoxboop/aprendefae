/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · EL «PATRÓN T7-3» DE WATARI (Célula C).
 *
 * Tres piezas nuevas, todas en lectura (nada se coloca):
 *
 *   · Renglones   una cuenta hecha a mano, de arriba abajo: signo (−, ×, =),
 *                 nombre y cifra. El resultado lleva raya encima y negrita; una
 *                 cifra destacada sin raya (el menor, la parte que se rebajó),
 *                 solo negrita. Los lectores de pantalla oyen el signo en
 *                 palabras: «menos», «por», «igual a».
 *   · Plazos      la franja de 30 días de un descuento condicionado, con una
 *                 marca por condición y el pago, cuando se da.
 *   · FranjaNIC2  la frase fija de la NIC 2, primera cosa de cada pantalla de
 *                 A7, A8, H6 y H7, pegada arriba mientras se desplaza.
 *   · Barras      (recortes del lote 1) el saldo en libros contra el conteo
 *                 físico, una barra por valor, a la misma escala: se ve cuál
 *                 es mayor. Mismo estilo que los renglones.
 *
 * Reglas de Watari: en Hacer, la figura de un ítem aparece DESPUÉS de
 * responderlo (acierto o error), nunca antes; en Aprender, va con su texto si
 * el texto ya da la cifra, o después de la pregunta si la pantalla la
 * pregunta. Lo nuevo entra con un fundido de 120 ms (nada con movimiento
 * reducido). Con 560 px de caja o más (proyector), la cuenta crece.
 *
 * El CSS es el de Watari (t73.css), con `.act` cambiado por `.t73pt`: cada
 * figura va en su propia caja `.t73pt`, que define los tokens del patrón
 * tabular y es el contenedor de las consultas por ancho. La franja de la
 * NIC 2 no va en caja propia, para que pueda pegarse arriba de la pieza: la
 * pieza que la usa pone la clase `t73pt-pieza` en su raíz.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las cifras con el formato del libro: miles con punto. */
const miles = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
/* «12 %» nunca se parte: espacio que no se parte antes del signo. */
export const sinPartir = (s) => (typeof s === "string" ? s.replace(/(\d) %/g, "$1 %") : s);
const valor = (v) => (typeof v === "number" ? miles(v) : sinPartir(v));

const OP_SR = { "−": "menos ", "×": "por ", "=": "igual a " };

/*
 * filas: [{ op?: "−" | "×" | "=", rot, v (número o texto), res?, fuerte?, marca?, apila?, nuevo? }]
 */
export function Renglones({ titulo, filas, nota = null, nuevo = false }) {
  return (
    <div className="t73pt">
      <figure className={`rg${nuevo ? " rg-nuevo" : ""}`} role="table" aria-label={titulo} data-renglones={titulo}>
        <figcaption className="rg-tit">{titulo}</figcaption>
        {filas.map((f, k) => (
          <div key={k} role="row" data-renglon
            className={`rg-f${f.res ? " rg-res" : ""}${f.fuerte ? " rg-fuerte" : ""}${f.nuevo ? " rg-nuevo" : ""}${f.apila ? " rg-apila" : ""}`}>
            <span className="rg-op" aria-hidden="true">{f.op ?? ""}</span>
            <span className="rg-rot" role="rowheader">
              {f.op && <span className="sr">{OP_SR[f.op]}</span>}
              {sinPartir(f.rot)}
              {f.marca && <> <span className="rg-etq">{f.marca}</span></>}
            </span>
            <span className="rg-v" role="cell">{valor(f.v)}</span>
          </div>
        ))}
        {nota && <p className="rg-nota">{sinPartir(nota)}</p>}
      </figure>
    </div>
  );
}

/*
 * condiciones: [{ cond: "15/10", dia?: 10, lleva?: "15 %" }]; la que no tiene día (el descuento comercial) solo va en el título.
 * pago: { dia, fecha } o null.
 *
 * La forma de los recortes del lote 1 (A3 de T7-3), sin cambiar la de
 * siempre: `titulo` reemplaza el «Condiciones …» del título; `rotDia` da el
 * rótulo de cada marca («día 10»), y entonces el día 30 va como los demás;
 * `ocultarLleva` calla lo que lleva cada plazo (la pregunta lo pide), y sin
 * `venta` no se marca la venta.
 */
export function Plazos({ venta, condiciones, pago = null, nuevo = false, titulo = null, rotDia = null, ocultarLleva = false }) {
  const pos = (d) => `${(d / 30) * 100}%`;
  const conDia = condiciones.filter((c) => c.dia);
  const lleva = (c) => (ocultarLleva ? null : sinPartir(c.lleva));
  return (
    <div className="t73pt">
      <figure className="pz" aria-label="Plazos del descuento condicionado" data-plazos>
        <figcaption className="rg-tit">{titulo ? sinPartir(titulo) : `Condiciones ${condiciones.map((c) => sinPartir(c.cond)).join(", ")}`}</figcaption>
        <div className="pz-arriba" aria-hidden="true">
          {pago && <span className={`pz-pago${nuevo ? " rg-nuevo" : ""}`} style={{ left: pos(pago.dia) }} data-pago>Pago · {pago.fecha}</span>}
        </div>
        <div className="pz-barra" aria-hidden="true">
          <i className="pz-tick" style={{ left: 0 }} />
          {conDia.map((c) => <i key={c.dia} className="pz-tick" style={{ left: pos(c.dia) }} />)}
          {pago && <i className={`pz-mark${nuevo ? " rg-nuevo" : ""}`} style={{ left: pos(pago.dia) }} />}
        </div>
        {rotDia ? (
          <div className="pz-abajo" aria-hidden="true" data-plazos-dias>
            {venta && <span className="pz-et pz-ini" style={{ left: 0 }}><b>Venta</b>{venta}</span>}
            {conDia.map((c) => (c.dia < 30 ? (
              <span key={c.dia} className="pz-et" style={{ left: pos(c.dia) }} data-plazo={c.dia}>
                <b>{rotDia(c.dia)}</b>{lleva(c) && <span className={nuevo ? "rg-nuevo" : undefined} data-lleva>{lleva(c)}</span>}
              </span>
            ) : (
              /* El día 30 va pegado al borde derecho; lo que lleva, un renglón más abajo, para no tocar al plazo anterior. */
              <span key={c.dia} className="pz-et pz-fin-dia" style={{ left: "100%" }} data-plazo={c.dia}>
                <b>{rotDia(c.dia)}</b>
                {lleva(c) && <span className={`pz-lleva-baja${nuevo ? " rg-nuevo" : ""}`} data-lleva>{lleva(c)}</span>}
              </span>
            )))}
          </div>
        ) : (
          <div className="pz-abajo" aria-hidden="true">
            <span className="pz-et pz-ini" style={{ left: 0 }}><b>Venta</b>{venta}</span>
            {conDia.filter((c) => c.dia < 30).map((c) => <span key={c.dia} className="pz-et" style={{ left: pos(c.dia) }}><b>{c.dia} días</b>{sinPartir(c.lleva)}</span>)}
            {conDia.filter((c) => c.dia === 30).map((c) => <span key={c.dia} className="pz-et pz-fin" style={{ left: "100%" }}><b>30 días:</b> {sinPartir(c.lleva)}</span>)}
          </div>
        )}
        <ul className="sr">
          {venta && <li>Venta: {venta}</li>}
          {conDia.map((c) => <li key={c.dia}>A los {c.dia} días{lleva(c) ? `: ${lleva(c)}` : ""}</li>)}
          {pago && <li>Pago: {pago.fecha}, a los {pago.dia} días</li>}
        </ul>
      </figure>
    </div>
  );
}

/*
 * barras: [{ rot, v }], a la misma escala: la mayor llena la fila, o `escala`
 * si se da (para que varias figuras de una pieza se comparen entre sí). Cada
 * barra lleva su nombre arriba y su cifra al lado: la longitud no se lee sola.
 */
export function Barras({ titulo, barras, escala = null, nuevo = false }) {
  const max = escala ?? Math.max(...barras.map((b) => b.v));
  return (
    <div className="t73pt">
      <figure className={`br${nuevo ? " rg-nuevo" : ""}`} role="table" aria-label={titulo} data-barras={titulo}>
        <figcaption className="rg-tit">{titulo}</figcaption>
        {barras.map((b) => (
          <div key={b.rot} role="row" className="br-f" data-barra={b.rot}>
            <span className="br-rot" role="rowheader">{b.rot}</span>
            <span className="br-fila" role="cell">
              <span className="br-pista" aria-hidden="true"><i className="br-relleno" style={{ width: `${(b.v / max) * 100}%` }} /></span>
              <span className="br-v">{valor(b.v)}</span>
            </span>
          </div>
        ))}
      </figure>
    </div>
  );
}

/*
 * Las figuras de un Hacer: cada una aparece DESPUÉS de responder su ítem
 * (regla de Watari: antes, el signo daría media respuesta).
 *
 *   figuras: [{ tipo: "renglones" | "plazos", desde, hasta?, ...sus datos }]
 *     desde   el número de ítems respondidos con el que aparece (1 = el ítem 1)
 *     hasta   el último ítem en cuya pantalla se muestra (la de un caso se va
 *             cuando empieza otro caso, como en las muestras de Watari); nunca
 *             se va en el momento de responder
 *   una fila de renglones puede traer su propio `desde`: la cadena de H2 crece
 *   en la misma tarjeta, no se reemplaza.
 *
 * Lo que aparece con la respuesta de ahora entra con el fundido de 120 ms.
 */
export function FigurasHacer({ figuras, respondidos, listo }) {
  const ahora = listo ? respondidos : null;
  /* El ítem que está en pantalla: el que se acaba de responder, o el siguiente. */
  const actual = listo ? respondidos : respondidos + 1;
  const visibles = figuras.filter((f) => f.desde <= respondidos && (f.hasta == null || actual <= f.hasta));
  if (!visibles.length) return null;
  return (
    <div data-figuras>
      {visibles.map((f) => (f.tipo === "plazos"
        ? <Plazos key={f.clave ?? f.titulo ?? f.tipo} venta={f.venta} condiciones={f.condiciones} pago={f.pago} nuevo={f.desde === ahora} />
        : <Renglones key={f.clave ?? f.titulo ?? f.tipo} titulo={f.titulo} nota={f.nota ?? null} nuevo={f.desde === ahora}
            filas={f.filas.filter((x) => (x.desde ?? 0) <= respondidos).map((x) => ({ ...x, nuevo: x.desde != null && x.desde === ahora && f.desde !== ahora }))} />))}
    </div>
  );
}

/* La franja fija de la NIC 2. `data-aviso`: las pruebas de A7, A8, H6 y H7 la buscan así. */
export function FranjaNIC2({ texto }) {
  return <p className="t73pt-nic2" role="note" data-aviso>{texto}</p>;
}

export const CSS_T73_PATRON = `
/* ===== T7-3 · renglones, plazos y franja de la NIC 2 (Watari) =====
   Usa los tokens del patrón tabular. Ni coral ni teal ni ámbar: aquí no hay error, ni debe, ni haber. */
.t73pt, .t73pt-pieza {
  --p-fondo: #0E1B2E; --p-texto: #F8F9FA; --p-texto2: #A8B6C8; --p-borde: #B8C4D4;
  container: t73pt / inline-size;
}
.t73pt { min-width: 0; color: var(--p-texto); font-family: "Inter", system-ui, sans-serif; }
.t73pt * { box-sizing: border-box; }
.t73pt .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.t73pt .rg { margin: 0 0 12px; display: grid; grid-template-columns: minmax(0, 1fr); border: 1px solid var(--p-borde); border-radius: 10px; padding: 10px 12px; min-width: 0; }
.t73pt .rg-tit { font: 600 13px/1.3 "Sora", "Inter", sans-serif; color: var(--p-texto); padding-bottom: 6px; }
.t73pt .rg-f { display: grid; grid-template-columns: 14px minmax(0, 1fr) auto; column-gap: 6px; align-items: baseline; padding: 3px 0; }
.t73pt .rg-op { font: 500 15px/1.4 "Inter", sans-serif; color: var(--p-texto2); text-align: center; }
.t73pt .rg-rot { font-size: 14px; line-height: 1.35; color: var(--p-texto); overflow-wrap: break-word; hyphens: none; min-width: 0; }
.t73pt .rg-v { font: 500 15px/1.4 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; text-align: right; color: var(--p-texto); }
.t73pt .rg-apila .rg-rot { grid-column: 2 / 4; }
.t73pt .rg-apila .rg-v { grid-column: 2 / 4; }
.t73pt .rg-res .rg-v { font-weight: 700; border-top: 1px solid var(--p-borde); padding-top: 2px; }
.t73pt .rg-res .rg-rot { font-weight: 600; }
.t73pt .rg-fuerte .rg-v { font-weight: 700; }
.t73pt .rg-fuerte .rg-rot { font-weight: 600; }
.t73pt .rg-etq { font-size: 12px; font-weight: 600; letter-spacing: .02em; color: var(--p-texto2); white-space: nowrap; }
.t73pt .rg-nota { margin: 6px 0 0; font-size: 13px; color: var(--p-texto2); }
.t73pt .rg-nuevo { animation: rg-aparece .12s ease-out; }
@keyframes rg-aparece { from { opacity: 0; } to { opacity: 1; } }
.t73pt .pz { margin: 0 0 12px; border: 1px solid var(--p-borde); border-radius: 10px; padding: 10px 14px 12px; display: grid; gap: 6px; }
.t73pt .pz-arriba { position: relative; height: 20px; font-size: 12px; color: var(--p-texto2); }
.t73pt .pz-pago { position: absolute; top: 0; transform: translateX(-50%); white-space: nowrap; color: var(--p-texto); font-weight: 600; }
.t73pt .pz-barra { position: relative; height: 10px; border-radius: 5px; background: rgba(248,249,250,0.1); }
.t73pt .pz-tick { position: absolute; top: -4px; width: 2px; height: 18px; margin-left: -1px; background: var(--p-borde); }
.t73pt .pz-mark { position: absolute; top: -6px; width: 14px; height: 22px; margin-left: -7px; border: 2px solid var(--p-texto); border-radius: 4px; background: var(--p-fondo); }
.t73pt .pz-abajo { position: relative; height: 54px; }
.t73pt .pz-et { position: absolute; top: 0; transform: translateX(-50%); display: grid; text-align: center; font-size: 12px; line-height: 1.3; color: var(--p-texto2); white-space: nowrap; }
.t73pt .pz-et b { font-weight: 600; color: var(--p-texto); }
.t73pt .pz-et.pz-ini { transform: none; text-align: left; }
.t73pt .pz-et.pz-fin { top: 36px; transform: translateX(-100%); display: block; text-align: right; }
.t73pt .pz-et.pz-fin b { font-weight: 600; }
.t73pt .pz-et.pz-fin-dia { transform: translateX(-100%); text-align: right; }
.t73pt .pz-lleva-baja { position: absolute; right: 0; top: 34px; white-space: nowrap; }
/* Barras: libros contra conteo, a la misma escala. Neutras: ni debe ni haber. */
.t73pt .br { margin: 0 0 12px; display: grid; gap: 8px; border: 1px solid var(--p-borde); border-radius: 10px; padding: 10px 12px; min-width: 0; }
.t73pt .br .rg-tit { padding-bottom: 0; }
.t73pt .br-f { display: grid; gap: 2px; min-width: 0; }
.t73pt .br-rot { font-size: 14px; line-height: 1.35; overflow-wrap: break-word; }
.t73pt .br-fila { display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: 8px; align-items: center; }
.t73pt .br-pista { display: block; height: 14px; border-radius: 4px; background: rgba(248,249,250,0.08); overflow: hidden; }
.t73pt .br-relleno { display: block; height: 100%; border-radius: 4px; background: var(--p-texto2); }
.t73pt .br-v { font: 500 15px/1.4 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; text-align: right; }
/* La franja de la NIC 2: pegada arriba de la pieza mientras se desplaza, con fondo opaco. No se cierra. */
.t73pt-nic2 { position: sticky; top: var(--act-tope, 0px); z-index: 1; margin: 0 0 12px; padding: 8px 12px; border-left: 3px solid var(--p-borde, #B8C4D4); background: linear-gradient(rgba(248,249,250,0.06), rgba(248,249,250,0.06)), var(--p-fondo, #0E1B2E); border-radius: 0 8px 8px 0; font-size: 13px; line-height: 1.45; color: var(--p-texto2, #A8B6C8); overflow-wrap: anywhere; }
@container t73pt (min-width: 560px) {
  .t73pt .rg { max-width: 560px; padding: 14px 18px; }
  .t73pt .rg-tit { font-size: 17px; }
  .t73pt .rg-f { grid-template-columns: 22px minmax(0, 1fr) auto; column-gap: 10px; padding: 5px 0; }
  .t73pt .rg-apila .rg-rot { grid-column: 2; }
  .t73pt .rg-apila .rg-v { grid-column: 3; }
  .t73pt .rg-op, .t73pt .rg-v { font-size: 22px; }
  .t73pt .rg-rot { font-size: 19px; }
  .t73pt .rg-etq { font-size: 15px; }
  .t73pt .pz { max-width: 560px; padding: 14px 22px 16px; }
  .t73pt .br { max-width: 560px; padding: 14px 18px; }
  .t73pt .br-rot { font-size: 19px; }
  .t73pt .br-v { font-size: 22px; }
  .t73pt .br-pista { height: 20px; }
  .t73pt .pz-arriba, .t73pt .pz-et { font-size: 17px; }
  .t73pt .pz-arriba { height: 26px; }
  .t73pt .pz-barra { height: 14px; border-radius: 7px; }
  .t73pt .pz-tick { top: -5px; height: 24px; width: 3px; }
  .t73pt .pz-mark { top: -7px; height: 28px; width: 18px; margin-left: -9px; }
  .t73pt .pz-abajo { height: 78px; }
  .t73pt .pz-et.pz-fin { top: 52px; }
  .t73pt .pz-lleva-baja { top: 46px; }
  .t73pt-nic2 { font-size: 17px; padding: 10px 16px; }
}
@media (prefers-reduced-motion: reduce) { .t73pt .rg-nuevo { animation: none; } }
`;
