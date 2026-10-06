import { useEffect, useState } from "react";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { DEBE, HABER, COLOR_LADO } from "../../../../data/contabilidad.js";
import { TONO_ROTULO } from "../debeHaber/piezasDebeHaber.jsx";
import { pesos } from "../../../../contabilidad/dosLineas.js";
import { useCifra, ENTRADA } from "./DosLineas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ASIENTO DE LA PIEZA 3, Y EL ESPEJO (Xeno, A3; cuentas de Levi).
 *
 * Es el ÚNICO lugar del Tema 3 donde aparecen el verde azulado y el ámbar:
 * el borde de cada mitad y la palabra «Debe» / «Haber». Las líneas siguen
 * neutras. El color nunca va solo: cada mitad lleva su palabra.
 *
 * El color del texto de «Debe» y «Haber» es el que el Tema 2 ya tiene en
 * producción (TONO_ROTULO: #52C4B0 y #E9C46A), y el del borde, COLOR_LADO.
 * No se copian: se importan, para que los dos temas no se separen.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const CIFRAS = { fontVariantNumeric: "tabular-nums" };
const FONDO_TARJETA = "#294061";

const CSS = `
@keyframes fae-p3-revela { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@media (prefers-reduced-motion: reduce) { .fae-p3-asiento * { animation: none !important; } }
`;

/*
 * `partidas` y `montoAbajo` existen para «Cerrar el periodo»: el segundo
 * asiento lleva cinco gastos en el haber, cada uno con su monto, y el debe
 * deja su monto abajo para igualar el alto. Sin ellos, la mitad es la de
 * siempre.
 */
function Mitad({ lado, cuenta, monto, compacto, anima, retraso, reducido, lineas = 2, partidas = null, montoAbajo = false }) {
  /* El monto cuenta desde $0 mientras su mitad se revela; el valor final queda siempre escrito. */
  const [objetivo, setObjetivo] = useState(anima ? 0 : monto);
  useEffect(() => {
    if (!anima) { setObjetivo(monto); return undefined; }
    const t = setTimeout(() => setObjetivo(monto), retraso);
    return () => clearTimeout(t);
  }, [monto, anima, retraso]);
  const v = useCifra(objetivo, { reducido, ms: 300 });
  return (
    <div data-mitad={lado} style={{
      flex: "1 1 0", minWidth: 0, boxSizing: "border-box",
      background: FONDO_TARJETA, borderTop: `3px solid ${COLOR_LADO[lado]}`, borderRadius: "10px",
      padding: compacto ? "7px 9px" : "10px 11px", display: "flex", flexDirection: "column", gap: compacto ? "2px" : "4px",
      animation: anima ? `fae-p3-revela 300ms ${ENTRADA} ${retraso}ms both` : undefined,
    }}>
      <span data-lado style={{ fontFamily: SORA, fontSize: "13px", fontWeight: 700, color: TONO_ROTULO[lado] }}>
        {lado === DEBE ? "Debe" : "Haber"}
      </span>
      {partidas ? (
        <ul data-partidas style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
          {partidas.map((p) => (
            <li key={p.cuenta} data-partida={p.cuenta} style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span data-cuenta style={{ fontFamily: INTER, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, color: COLOR.blanco }}>{p.cuenta}</span>
              <span data-monto-partida style={{ fontFamily: SORA, fontSize: "14px", fontWeight: 700, color: COLOR.blanco, ...CIFRAS }}>{pesos(p.monto)}</span>
            </li>
          ))}
        </ul>
      ) : (<>
      <span data-cuenta style={{
        fontFamily: INTER, fontSize: compacto ? "13px" : "14px", fontWeight: 600, lineHeight: 1.3, color: COLOR.blanco,
        display: "-webkit-box", WebkitLineClamp: lineas, WebkitBoxOrient: "vertical", overflow: "hidden",
        minHeight: compacto ? undefined : "36px",
      }}>
        {cuenta}
      </span>
      <span data-monto-asiento data-final={pesos(monto)} style={{
        fontFamily: SORA, fontSize: compacto ? "18px" : "22px", fontWeight: 700, color: COLOR.blanco, ...CIFRAS,
        ...(montoAbajo ? { marginTop: "auto" } : {}),
      }}>
        {pesos(v)}
      </span>
      </>)}
    </div>
  );
}

/**
 * La tarjeta del asiento: Debe a la izquierda, Haber a la derecha, 6 px entre
 * las dos. Cada mitad se revela de izquierda a derecha en 300 ms; el Haber,
 * 400 ms después (B6). Con movimiento reducido, completa de una vez.
 */
/*
 * `alto` y `lineas` existen para la pieza 4, cuyas cuentas son más largas
 * («Arriendos pagados por anticipado» ocupa 4 líneas a 320 px). Por defecto,
 * los de la pieza 3: 128 px y 2 líneas.
 */
export default function AsientoTema3({ asiento, compacto = false, anima = false, reducido = false, conPastilla = false, textoPastilla = "Cierre del mes", alto = 128, lineas = 2 }) {
  const a = anima && !reducido;
  return (
    <div className="fae-p3-asiento" aria-hidden="true" data-asiento>
      <style>{CSS}</style>
      <div style={{ display: "flex", gap: "6px", minHeight: compacto ? undefined : `${alto}px` }}>
        <Mitad lado={DEBE} {...asiento.debe} compacto={compacto} anima={a} retraso={0} reducido={reducido} lineas={lineas} />
        <Mitad lado={HABER} {...asiento.haber} compacto={compacto} anima={a} retraso={400} reducido={reducido} lineas={lineas} />
      </div>
      {conPastilla && (
        <p style={{ margin: "8px 0 0", textAlign: "center" }}>
          <span data-pastilla-cierre style={{
            display: "inline-block", padding: "2px 10px", borderRadius: "999px",
            background: COLOR.neutro, color: COLOR.navy, fontFamily: INTER, fontSize: "12px", fontWeight: 700,
          }}>
            {textoPastilla}
          </span>
        </p>
      )}
    </div>
  );
}

function CajaEspejo({ empresa, anima, reducido, altoCaja = 144, lineas = 2 }) {
  return (
    <div data-espejo-empresa={empresa.id} style={{
      border: `1px solid ${COLOR.quieto}`, borderRadius: "16px", padding: "9px 10px", minHeight: `${altoCaja}px`, boxSizing: "border-box",
      animation: anima ? `fae-dl-fundido 200ms ${ENTRADA} both` : undefined,
    }}>
      <p style={{ margin: "0 0 7px", fontFamily: SORA, fontSize: "13px", fontWeight: 700, color: COLOR.blanco }}>{empresa.nombre}</p>
      <AsientoTema3 asiento={empresa.asiento} compacto reducido={reducido} lineas={lineas} />
    </div>
  );
}

/**
 * El espejo del paso 9: San Calixto arriba, San Miguel abajo, y entre los
 * dos una X que une el Debe de uno con el Haber del otro (B7).
 */
export function Espejo({ arriba, abajo, anima = false, reducido = false, altoCaja = 144, lineas = 2 }) {
  const a = anima && !reducido;
  return (
    <div data-espejo aria-hidden="true">
      <style>{`@keyframes fae-p3-x { from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 0 0 0); } }`}</style>
      <CajaEspejo empresa={arriba} anima={a} reducido={reducido} altoCaja={altoCaja} lineas={lineas} />
      {/* La X: Debe de arriba con Haber de abajo, y Haber de arriba con Debe de abajo. */}
      <div data-x style={{ position: "relative", height: "40px", animation: a ? `fae-p3-x 400ms ${ENTRADA} 200ms both` : undefined }}>
        <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
          {[[25, 75], [75, 25]].map(([x1, x2]) => (
            <line key={x1} x1={x1} y1="5" x2={x2} y2="35" stroke={COLOR.neutro} strokeWidth="2" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        {/* Los puntos de 9 px en los cuatro extremos, fuera del svg para que no se deformen. */}
        {[["25%", 5], ["75%", 5], ["25%", 35], ["75%", 35]].map(([x, y]) => (
          <span key={`${x}${y}`} style={{
            position: "absolute", left: `calc(${x} - 4.5px)`, top: `${y - 4.5}px`,
            width: "9px", height: "9px", borderRadius: "50%", background: COLOR.neutro,
          }} />
        ))}
      </div>
      <CajaEspejo empresa={abajo} anima={a} reducido={reducido} altoCaja={altoCaja} lineas={lineas} />
    </div>
  );
}
