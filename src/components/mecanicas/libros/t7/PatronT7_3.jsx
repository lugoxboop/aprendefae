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
 */
export function Plazos({ venta, condiciones, pago = null, nuevo = false }) {
  const pos = (d) => `${(d / 30) * 100}%`;
  const conDia = condiciones.filter((c) => c.dia);
  return (
    <div className="t73pt">
      <figure className="pz" aria-label="Plazos del descuento condicionado" data-plazos>
        <figcaption className="rg-tit">Condiciones {condiciones.map((c) => sinPartir(c.cond)).join(", ")}</figcaption>
        <div className="pz-arriba" aria-hidden="true">
          {pago && <span className={`pz-pago${nuevo ? " rg-nuevo" : ""}`} style={{ left: pos(pago.dia) }} data-pago>Pago · {pago.fecha}</span>}
        </div>
        <div className="pz-barra" aria-hidden="true">
          <i className="pz-tick" style={{ left: 0 }} />
          {conDia.map((c) => <i key={c.dia} className="pz-tick" style={{ left: pos(c.dia) }} />)}
          {pago && <i className={`pz-mark${nuevo ? " rg-nuevo" : ""}`} style={{ left: pos(pago.dia) }} />}
        </div>
        <div className="pz-abajo" aria-hidden="true">
          <span className="pz-et pz-ini" style={{ left: 0 }}><b>Venta</b>{venta}</span>
          {conDia.filter((c) => c.dia < 30).map((c) => <span key={c.dia} className="pz-et" style={{ left: pos(c.dia) }}><b>{c.dia} días</b>{sinPartir(c.lleva)}</span>)}
          {conDia.filter((c) => c.dia === 30).map((c) => <span key={c.dia} className="pz-et pz-fin" style={{ left: "100%" }}><b>30 días:</b> {sinPartir(c.lleva)}</span>)}
        </div>
        <ul className="sr">
          <li>Venta: {venta}</li>
          {conDia.map((c) => <li key={c.dia}>A los {c.dia} días: {sinPartir(c.lleva)}</li>)}
          {pago && <li>Pago: {pago.fecha}, a los {pago.dia} días</li>}
        </ul>
      </figure>
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
  .t73pt .pz-arriba, .t73pt .pz-et { font-size: 17px; }
  .t73pt .pz-arriba { height: 26px; }
  .t73pt .pz-barra { height: 14px; border-radius: 7px; }
  .t73pt .pz-tick { top: -5px; height: 24px; width: 3px; }
  .t73pt .pz-mark { top: -7px; height: 28px; width: 18px; margin-left: -9px; }
  .t73pt .pz-abajo { height: 78px; }
  .t73pt .pz-et.pz-fin { top: 52px; }
  .t73pt-nic2 { font-size: 17px; padding: 10px 16px; }
}
@media (prefers-reduced-motion: reduce) { .t73pt .rg-nuevo { animation: none; } }
`;
