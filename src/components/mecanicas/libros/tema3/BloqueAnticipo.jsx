import { useCallback, useEffect, useRef } from "react";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { MESES, POR_MES } from "../../../../data/contabilidadTema3Pieza4.js";
import { pesos } from "../../../../contabilidad/dosLineas.js";
import { useCifra, ENTRADA, CAMBIO } from "./DosLineas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 4 · EL BLOQUE DEL ANTICIPO, Y EL VUELO DE SUS FICHAS (Xeno, P2).
 *
 * Tres fichas de $5.000, una por mes, alineadas con las ranuras de mes del
 * calendario. En cada cierre, la ficha de ese mes sale del bloque, sube por
 * su columna y se vuelve la marca del gasto (o del ingreso): así el saldo de
 * $10.000 se ve quedar.
 *
 * San Calixto (lo que tiene): ficha sólida, «Por gastar». Arriendos de la
 * Costa (lo que debe cumplir): ficha de contorno discontinuo, «Por cumplir».
 * La diferencia no depende del color: forma, etiqueta y nombre de la cuenta.
 * Sin verde azulado ni ámbar.
 *
 * El nombre de la cuenta y el saldo son texto real; las fichas, aria-hidden.
 * El saldo siempre termina escrito en su valor (useCifra, con respaldo).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";

const CSS = `
@keyframes fae-p4-ficha { from { opacity: 0; transform: translateY(6px) scale(0.92); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .fae-p4-bloque * { animation: none !important; transition: none !important; } }
`;

function Ficha({ i, tipo, consumida, anima }) {
  const llena = tipo === "llena";
  return (
    <span
      data-ficha-mes={i}
      data-estado-ficha={consumida ? "consumida" : tipo}
      style={{
        position: "absolute", top: "4px", height: "40px", boxSizing: "border-box",
        left: `calc(${(i * 100) / MESES.length}% + 2px)`, width: `calc(${100 / MESES.length}% - 4px)`,
        borderRadius: "9px", display: "grid", placeItems: "center",
        fontFamily: INTER, fontSize: "13px", fontWeight: 700,
        background: consumida ? "transparent" : llena ? COLOR.neutro : "transparent",
        border: consumida ? `2px dashed ${COLOR.quieto}` : llena ? `2px solid ${COLOR.neutro}` : `2px dashed ${COLOR.neutro}`,
        color: llena ? COLOR.navy : COLOR.blanco,
        transition: `background 200ms ${CAMBIO}, border-color 200ms ${CAMBIO}`,
        animation: anima ? `fae-p4-ficha 300ms ${ENTRADA} ${i * 120}ms both` : undefined,
      }}
    >
      {consumida ? null : pesos(POR_MES)}
    </span>
  );
}

export default function BloqueAnticipo({ bloque, reducido = false, animaEntrada = false, msSaldo = 450 }) {
  const saldo = useCifra(bloque.saldo, { reducido, ms: msSaldo });
  return (
    <div className="fae-p4-bloque" data-bloque={bloque.empresa} style={{ marginTop: "12px" }}>
      <style>{CSS}</style>
      <p data-cuenta-bloque style={{ margin: "0 0 6px", fontFamily: INTER, fontSize: "12.5px", fontWeight: 600, lineHeight: 1.35, color: COLOR.blanco }}>
        {bloque.cuenta}
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", margin: "0 0 6px" }}>
        <span data-etiqueta-bloque style={{
          padding: "2px 9px", borderRadius: "999px", border: `1px solid ${COLOR.quieto}`,
          fontFamily: INTER, fontSize: "12px", fontWeight: 600, color: COLOR.blanco,
        }}>
          {bloque.etiqueta}
        </span>
        <span
          data-saldo
          data-final={pesos(bloque.saldo)}
          data-resaltado={bloque.resaltado ? "si" : "no"}
          style={{
            fontFamily: SORA, fontSize: "16px", fontWeight: 700, fontVariantNumeric: "tabular-nums",
            color: bloque.resaltado ? COLOR.navy : COLOR.blanco,
            background: bloque.resaltado ? COLOR.neutro : "transparent",
            padding: bloque.resaltado ? "1px 9px" : 0, borderRadius: "999px",
            transition: `background 200ms ${CAMBIO}, color 200ms ${CAMBIO}`,
          }}
        >
          {pesos(saldo)}
        </span>
      </div>
      <div aria-hidden="true" data-fichas style={{
        position: "relative", height: "50px", border: `1px solid ${COLOR.quieto}`, borderRadius: "13px", boxSizing: "border-box",
      }}>
        {MESES.map((m, i) => (
          <Ficha key={m} i={i} tipo={bloque.ficha} consumida={i < bloque.consumidas} anima={animaEntrada && !reducido} />
        ))}
      </div>
    </div>
  );
}

/*
 * ═══════════ EL VUELO (D5) ═══════════
 *
 * Una copia de la ficha sale de su lugar y viaja, encogiéndose, hasta la
 * cabeza de la marca (consumir) o al revés (regresar, en la capa 3). 700 ms.
 * Vive en una capa encima de todo, dentro del contenedor, y se borra sola al
 * terminar. Con movimiento reducido no hay vuelo: la ficha desaparece y la
 * marca aparece. Sin `Element.animate` (pruebas), tampoco.
 */
export function useVuelo(contenedor, { reducido, ms = 700 }) {
  const vivos = useRef([]);
  useEffect(() => () => { vivos.current.forEach((v) => v.remove()); vivos.current = []; }, []);
  return useCallback((viajes) => {
    const caja = contenedor.current;
    if (reducido || !caja || typeof caja.animate !== "function") return;
    const base = caja.getBoundingClientRect();
    for (const { desde, hasta, retraso = 0, relleno } of viajes) {
      if (!desde || !hasta) continue;
      const clon = document.createElement("span");
      clon.setAttribute("aria-hidden", "true");
      clon.setAttribute("data-ficha-en-vuelo", "");
      Object.assign(clon.style, {
        position: "absolute", left: `${desde.left - base.left}px`, top: `${desde.top - base.top}px`,
        width: `${desde.width}px`, height: `${desde.height}px`, boxSizing: "border-box", borderRadius: "9px",
        background: relleno === "llena" ? COLOR.neutro : "transparent",
        border: relleno === "llena" ? `2px solid ${COLOR.neutro}` : `2px dashed ${COLOR.neutro}`,
        pointerEvents: "none", zIndex: "5", transformOrigin: "center",
      });
      caja.appendChild(clon);
      vivos.current.push(clon);
      const dx = (hasta.left + hasta.width / 2) - (desde.left + desde.width / 2);
      const dy = (hasta.top + hasta.height / 2) - (desde.top + desde.height / 2);
      const escala = Math.max(0.12, Math.min(1, hasta.width / desde.width));
      const a = clon.animate(
        [
          { transform: "translate(0, 0) scale(1)", opacity: 1 },
          { transform: `translate(${dx * 0.15}px, ${dy * 0.35}px) scale(0.85)`, opacity: 1, offset: 0.35 },
          { transform: `translate(${dx}px, ${dy}px) scale(${escala})`, opacity: 0.4 },
        ],
        { duration: ms, delay: retraso, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "both" },
      );
      const fin = () => { clon.remove(); vivos.current = vivos.current.filter((x) => x !== clon); };
      a.onfinish = fin;
      a.oncancel = fin;
    }
  }, [contenedor, reducido, ms]);
}
