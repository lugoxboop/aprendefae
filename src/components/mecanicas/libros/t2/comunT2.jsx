import { FAE } from "../../../../theme.js";
import { CORAL_B, CSS_B5H } from "../b5/Devolucion.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · LO QUE COMPARTEN LAS TRES HACER NUEVAS (Célula C, lote T2-2).
 *
 * Solo la frase de consecuencia y el CSS. Todo lo demás son piezas que ya
 * están en main, sin cambiarlas: CuentaT, AsientoEnLineas, CampoCifra,
 * CuentaDeValor, OpcionC, Devolucion, Pastilla, Encabezado, Pulsos, Cierre.
 *
 * LA CONSECUENCIA VA ANTES QUE EL VEREDICTO (regla C4 de Watari): primero se
 * lee lo que pasaría, después «Correcto» o «No va aquí».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CSS_T2_NUEVAS = `
@keyframes fae-t2n-entra { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: none; } }
.fae-t2n-entra { animation: fae-t2n-entra 220ms ease-out both; }
.fae-t2n-mueve { transition: transform 260ms ease, opacity 220ms ease; }
@media (prefers-reduced-motion: reduce) {
  .fae-t2n-entra { animation: none !important; }
  .fae-t2n-mueve { transition: none !important; }
}
${CSS_B5H}`;

/*
 * La forma del lote T2-4 de Watari (c-t2-4-watari-figuras.md, «CSS del delta
 * (para Misa)»), con el prefijo `.mq` de la maqueta cambiado por la raíz
 * `.fae-t2n`, y la base de hacer.css que esas reglas suponen. Lo único que no
 * es de Watari va marcado [Misa]. Sin componente compartido nuevo.
 */
export const RAIZ_T2 = "fae-t2n";
export const CSS_T2_DELTA = `
.fae-t2n { --texto:#F8F9FA; --aten:#A8B6C8; --neutro:#B8C4D4; --teal:#2A9D8F; --teal-t:#3FA69A; --ambar:#E9C46A; --coral:#E76F51; --coral-t:#EE8266;
  color:var(--texto); font:400 14px/1.45 Inter, system-ui, sans-serif; display:grid; gap:10px; min-width:0; }
.fae-t2n * { box-sizing:border-box; }
.fae-t2n p { margin:0; }
.fae-t2n .hund { background:rgba(10,20,34,.45); border:1px solid rgba(248,249,250,.12); border-radius:12px; padding:10px 12px; display:grid; gap:8px; min-width:0; }
.fae-t2n .tit { font:600 13px/1.3 Sora, Inter, sans-serif; }
.fae-t2n .num { font-family:"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-variant-numeric:tabular-nums; font-weight:600; font-size:13px; white-space:nowrap; }
.fae-t2n .td { color:var(--teal-t); } .fae-t2n .th { color:var(--ambar); }
.fae-t2n svg { width:16px; height:16px; flex:none; }
.fae-t2n .falla, .fae-t2n .cuadra { display:flex; gap:6px; align-items:flex-start; font-size:13px; line-height:1.4; } .fae-t2n .falla { color:var(--coral-t); }
/* c · el asiento y las columnas */
.fae-t2n .asiento { width:100%; min-width:0; border-collapse:collapse; font-size:13px; table-layout:fixed; } .fae-t2n .asiento td { padding:4px 2px; border-bottom:0; vertical-align:middle; text-align:left; } .fae-t2n .asiento td.num { text-align:right; }
.fae-t2n .asiento tr.sum td { border-top:1px solid rgba(248,249,250,.35); font-weight:600; } .fae-t2n .hueco { border:1px dashed var(--neutro); border-radius:4px; padding:0 6px; }
.fae-t2n .columnas { position:relative; display:grid; grid-template-columns:1fr 1fr; gap:16px; height:150px; padding:0 8px; border-bottom:2px solid var(--neutro); }
.fae-t2n .col { display:flex; align-items:flex-end; min-width:0; } .fae-t2n .pila { width:100%; height:100%; display:flex; flex-direction:column-reverse; gap:2px; }
.fae-t2n .bar { display:grid; place-items:center; border-radius:3px; font:600 12px/1 "JetBrains Mono", ui-monospace, monospace; color:#0E1B2E; overflow:hidden; }
.fae-t2n .col.d .bar { background:var(--teal); } .fae-t2n .col.h .bar { background:var(--ambar); }
.fae-t2n .nivel { position:absolute; left:0; right:0; border-top:2px dashed var(--neutro); } .fae-t2n .nivel.igual { border-top-style:solid; border-top-color:var(--texto); }
.fae-t2n .hueco-barra { position:absolute; right:8px; width:calc(50% - 16px); border:2px dashed var(--coral); border-bottom:0; border-radius:3px 3px 0 0; }
.fae-t2n .conteo { display:grid; grid-template-columns:1fr 1fr; gap:16px; font-size:12px; color:var(--aten); text-align:center; }
.fae-t2n .casilla { display:flex; flex-wrap:wrap; gap:8px; }
.fae-t2n .cmp { min-height:44px; padding:0 14px; border-radius:12px; border:2px solid var(--neutro); background:transparent; color:var(--texto); font:600 14px Inter, sans-serif; cursor:pointer; } .fae-t2n .cmp:disabled { opacity:.5; cursor:default; }
.fae-t2n .escrito { flex:1 1 100%; min-height:44px; display:flex; flex-wrap:wrap; align-items:center; gap:4px 10px; padding:8px 12px; border-radius:10px; border:2px solid var(--texto); } .fae-t2n .escrito.malb { border-color:var(--coral); outline:0; } .fae-t2n .escrito.iba { border-style:dashed; }
.fae-t2n .ops { display:grid; gap:8px; }
.fae-t2n .op { min-height:44px; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:4px 8px; padding:10px 12px; border-radius:12px; border:1px solid rgba(248,249,250,.35); background:transparent; color:var(--texto); font:500 14px Inter, sans-serif; text-align:left; cursor:pointer; }
.fae-t2n .op:disabled, .fae-t2n .renb:disabled, .fae-t2n .lnb:disabled { cursor:default; color:var(--texto); }
.fae-t2n .op.bien, .fae-t2n .op.pista { border:2px solid var(--texto); padding:9px 11px; } .fae-t2n .op.pista { border-style:dashed; } .fae-t2n .op.malb { border:2px solid var(--coral); outline:0; padding:9px 11px; }
/* a · el diario y el mayor */
.fae-t2n .ctas { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:8px; }
.fae-t2n .cta { min-height:88px; display:grid; align-content:start; gap:4px; padding:8px; border-radius:10px; border:1px solid rgba(248,249,250,.35); background:transparent; color:var(--texto); font:inherit; text-align:left; min-width:0; }
.fae-t2n .cta-tit { font-weight:600; font-size:13px; overflow-wrap:break-word; hyphens:auto; }
.fae-t2n .cta-t { display:grid; grid-template-columns:1fr 1fr; border-top:2px solid var(--neutro); min-height:30px; }
.fae-t2n .cta-t > span { display:grid; align-content:start; gap:2px; padding:4px 2px 0; min-width:0; } .fae-t2n .cta-t > span:first-child { border-right:2px solid var(--neutro); }
/* T2-4 · lo nuevo sobre hacer.css */
.fae-t2n .reloj { font:500 12px/1.4 "JetBrains Mono", monospace; color:var(--aten); border:1px dashed rgba(248,249,250,.25); border-radius:8px; padding:6px 8px; }
/* Cuadra por valor */
/* [Misa] Con «.col» delante: «.col.h .bar» (4 clases) le ganaba y pintaba el «?» sobre ámbar (medido 1,59:1). En la maqueta pasa igual. */
.fae-t2n .col .bar.fijo { height:28px; flex:none; border:2px dashed var(--neutro); background:transparent; color:var(--texto); font:600 13px/1 "JetBrains Mono", monospace; }
.fae-t2n .col.h .bar.tuya, .fae-t2n .col.d .bar.tuya { box-shadow:inset 0 0 0 2px var(--texto); }
.fae-t2n .col .bar.tuya.mal { box-shadow:none; outline:2px solid var(--coral); outline-offset:1px; }
.fae-t2n .bar.culpa { outline:2px solid var(--texto); outline-offset:1px; }
.fae-t2n .hueco-barra.d { left:8px; right:auto; }
.fae-t2n .columnas.entra .pila .bar { transform-origin:bottom; animation:fae-t2n-sube 380ms cubic-bezier(.3,.9,.4,1) both; }
/* [Misa] En completar sube solo el tramo del hueco: «pasa a la altura de la cifra con scaleY» (Watari §1). */
.fae-t2n .columnas.comprobado .pila .bar.tuya { transform-origin:bottom; animation:fae-t2n-sube 380ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes fae-t2n-sube { from { transform:scaleY(0); opacity:0; } to { transform:none; opacity:1; } }
.fae-t2n .tucifra { flex:1 1 140px; display:grid; gap:4px; font:500 12px Inter, sans-serif; color:var(--aten); }
.fae-t2n .tucifra input { min-width:0; min-height:44px; border-radius:10px; border:1px solid rgba(248,249,250,.35); background:rgba(10,20,34,.45); color:var(--texto); font:600 16px "JetBrains Mono", ui-monospace, monospace; padding:0 12px; }
.fae-t2n .casilla { align-items:end; }
.fae-t2n .escrito > span:first-child { font:500 12px Inter, sans-serif; color:var(--aten); }
.fae-t2n .ops.dos { grid-template-columns:repeat(auto-fit, minmax(110px, 1fr)); }
.fae-t2n .op.elegida { border:2px solid var(--texto); padding:9px 11px; }
.fae-t2n .renbs { display:grid; gap:6px; }
.fae-t2n .renb { min-height:44px; display:grid; grid-template-columns:minmax(0,1fr) auto; grid-template-areas:"c c" "l m" "p p"; gap:2px 8px; align-items:center; padding:6px 10px; border-radius:10px; border:1px solid rgba(248,249,250,.35); background:transparent; color:var(--texto); font:500 13px/1.3 Inter, sans-serif; text-align:left; cursor:pointer; }
.fae-t2n .renb .c { grid-area:c; } .fae-t2n .renb .l { grid-area:l; font-size:12px; } .fae-t2n .renb .m { grid-area:m; } .fae-t2n .renb .pas { grid-area:p; justify-self:start; }
.fae-t2n .renb.elegida, .fae-t2n .renb.bien, .fae-t2n .renb.pista { border:2px solid var(--texto); padding:5px 9px; } .fae-t2n .renb.pista { border-style:dashed; }
.fae-t2n .renb.malb { border:2px solid var(--coral); outline:0; padding:5px 9px; }
.fae-t2n .sumas-l { display:grid; grid-template-columns:minmax(0,1fr) auto auto; gap:12px; font-size:13px; font-weight:600; border-top:1px solid rgba(248,249,250,.35); padding-top:6px; }
/* Del diario al mayor · revisar */
.fae-t2n .cta.tr { min-height:0; padding:6px; gap:4px; }
.fae-t2n .cta.tr .cta-t > span { padding:4px 0 0; gap:4px; } .fae-t2n .cta.tr .cta-t > span:first-child { padding-right:3px; } .fae-t2n .cta.tr .cta-t > span:last-child { padding-left:3px; }
.fae-t2n .lnb { min-height:44px; min-width:0; width:100%; display:grid; align-content:center; justify-items:start; gap:1px; padding:3px 4px; border-radius:6px; border:1px solid rgba(248,249,250,.3); background:transparent; color:var(--texto); text-align:left; cursor:pointer; font:inherit; }
.fae-t2n .lnb small { font:500 12px/1.15 Inter, sans-serif; color:var(--aten); } .fae-t2n .lnb .num { font-size:12px; line-height:1.2; }
.fae-t2n .lnb.bien { border:2px solid var(--texto); padding:2px 3px; background:rgba(184,196,212,.16); }
.fae-t2n .lnb.malb { border:2px solid var(--coral); outline:0; padding:2px 3px; }
.fae-t2n .lnb.pista { border:2px dashed var(--texto); padding:2px 3px; }
.fae-t2n .cotejo { display:grid; gap:2px; padding:8px; border-radius:8px; background:rgba(184,196,212,.10); }
.fae-t2n .cot { display:grid; grid-template-columns:3.6em minmax(0,1fr) 1.2em minmax(0,1fr); gap:4px; align-items:start; font-size:13px; padding:3px 4px; border-radius:6px; overflow-wrap:anywhere; }
.fae-t2n .cot.cab { font-size:12px; color:var(--aten); padding-bottom:0; } .fae-t2n .cot .k { font-size:12px; color:var(--aten); } .fae-t2n .cot .s { text-align:center; font-weight:700; }
.fae-t2n .cot.distinto { outline:2px solid var(--texto); outline-offset:-2px; font-weight:600; }
.fae-t2n .veredicto-l { display:grid; gap:6px; } .fae-t2n .estado-l { display:flex; flex-wrap:wrap; gap:6px; }
/* [Misa] La pastilla «Iba en la línea punteada» (Watari §2, .pas.iba de la maqueta): en la fila de estado, no dentro del botón. */
.fae-t2n .pas-iba { display:inline-flex; align-items:center; padding:2px 8px; border-radius:999px; border:1px dashed var(--texto); font:600 12px/1.2 Inter, sans-serif; white-space:nowrap; }
/* [Misa] Aquí «Iba aquí» ya llega a los 0,7 s por estado (RETARDO_IBA_MS); la demora de CSS de la pastilla compartida se sumaría otra vez. */
.fae-t2n .fae-b5h-revela { animation-delay: 0ms; }
@media (prefers-reduced-motion: reduce) { .fae-t2n .columnas.entra .pila .bar, .fae-t2n .columnas.comprobado .pila .bar.tuya { animation:none; } }

/* Cuadra por valor · la columna de cifra mide la cifra más larga; el nombre se parte por palabras y, si una no cabe, con guion */
.fae-t2n .asiento td:nth-child(2), .fae-t2n .asiento td:nth-child(3) { width:calc(var(--cifra, 10) * 1ch + 6px); }
.fae-t2n .asiento td:first-child { overflow-wrap:break-word; hyphens:auto; }
/* Con cifras de millones (más de 8 caracteres) el nombre va en su propia línea y las cifras debajo, en sus columnas */
.fae-t2n .asiento.apilado, .fae-t2n .asiento.apilado tbody { display:grid; }
.fae-t2n .asiento.apilado tr { display:grid; grid-template-columns:minmax(0,1fr) calc(var(--cifra) * 1ch + 6px) calc(var(--cifra) * 1ch + 6px); }
.fae-t2n .asiento.apilado td { width:auto !important; } .fae-t2n .asiento.apilado td:first-child { grid-column:1 / -1; padding-bottom:0; }
.fae-t2n .asiento.apilado td:nth-child(2) { grid-column:2; } .fae-t2n .asiento.apilado td:nth-child(3) { grid-column:3; }
.fae-t2n .asiento.apilado tr.sum td:first-child { grid-column:1; padding-bottom:4px; } .fae-t2n .asiento.apilado tr.sum { border-top:1px solid rgba(248,249,250,.35); } .fae-t2n .asiento.apilado tr.sum td { border-top:0; }
`;

/*
 * La pausa de Watari (§1): primero la consecuencia (0 ms) y, a los 380 ms, el
 * veredicto. Con movimiento reducido, todo a la vez.
 */
export const PAUSA_VEREDICTO_MS = 380;
export const movimientoReducido = () => {
  try { return Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches); } catch { return false; }
};

export function Consecuencia({ texto, error = true }) {
  if (!texto) return null;
  return (
    <p data-consecuencia={error ? "error" : "acierto"} className="fae-t2n-entra" style={{
      margin: "12px 0 0", padding: "9px 12px", borderRadius: "10px",
      fontSize: "14px", lineHeight: 1.45, color: FAE.text,
      background: "rgba(10,20,34,0.4)",
      border: error ? `1px dashed ${CORAL_B}` : "1px solid rgba(248,249,250,0.22)",
    }}>
      {texto}
    </p>
  );
}

export const ROTULO_T2 = {
  margin: "14px 0 8px", fontFamily: "Sora, sans-serif", fontSize: "12px",
  fontWeight: 700, letterSpacing: "0.12em", color: "rgba(248,249,250,0.7)",
};

/* El hecho que se lee antes del asiento (Near, H3): con él solo se resuelve. */
export function Hecho({ texto }) {
  if (!texto) return null;
  return (
    <p data-hecho style={{ margin: "0 0 10px", fontSize: "14px", lineHeight: 1.45, color: FAE.text }}>{texto}</p>
  );
}

/* El pie de fuente (H2): «Basado en el libro…». */
export function Pie({ texto }) {
  if (!texto) return null;
  return (
    <p data-pie style={{ margin: "10px 0 0", fontSize: "12px", lineHeight: 1.4, color: "rgba(248,249,250,0.7)" }}>{texto}</p>
  );
}
