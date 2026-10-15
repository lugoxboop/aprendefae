import { useEffect, useState } from "react";
import { TONO_ROTULO } from "../debeHaber/piezasDebeHaber.jsx";
import { CUENTA_T_T6_A3 } from "../../../../data/contabilidadT6Pieza3.js";
import { OPCIONES_T6_ACT4, SE_ACREDITA_T6_ACT4 } from "../../../../data/contabilidadT6Act4.js";
import { SORA, INTER, TEXTO, SECUNDARIO, NODO, NAVY, BORDES } from "./MaquinaPegada.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * b5-t6-a4 «¿QUÉ SE DEBITA?» · EL ASIENTO MÍNIMO (hoja 4 de Mai, calidad).
 *
 * Entre el hecho y las opciones, un asiento de dos columnas, DEBE y HABER
 * (las palabras y el estilo de los colectores, como en T6 · A3), con una
 * ranura en cada una. Antes de elegir, la ranura del DEBE está encendida:
 * ahí va la respuesta.
 *
 * Al elegir:
 *   · la correcta entra al DEBE, y el HABER se llena con lo que se acredita en
 *     ese hecho, en texto secundario: se ve el asiento entero;
 *   · una incorrecta que en ese hecho se acredita entra al DEBE y a los 500 ms
 *     se pasa al HABER (en texto principal: es la que eligió); la correcta
 *     entra al DEBE;
 *   · una incorrecta que no está en el asiento entra al DEBE y se va (300 ms,
 *     opacidad y 6 px hacia arriba); entran la correcta y la contrapartida.
 * Con movimiento reducido, el asiento final de una vez.
 *
 * Las dos ranuras reservan el alto del nombre más largo que puede caer en
 * ellas: las opciones no se mueven al entrar un nombre de cuatro líneas.
 * Sin color: el lado lo dicen la palabra y la columna; el error se ve como
 * movimiento; lo elegido va en texto principal y lo que pone el asiento, en
 * secundario. Ningún texto vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const NOMBRE = { margin: 0, fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px" };
const ATENUADO = "rgba(184,196,212,.50)";
const nombreDe = (id) => OPCIONES_T6_ACT4.find((o) => o.id === id)?.nombre;
/* Todo lo que puede caer en una ranura: las cuatro opciones y las contrapartidas. */
const CANDIDATOS = [...new Set([...OPCIONES_T6_ACT4.map((o) => o.nombre), ...Object.values(SE_ACREDITA_T6_ACT4)])];

/* El asiento que se ve, según el hecho, lo elegido y la fase («entra» o «final»). */
export function asientoDe(hecho, elegida, fase) {
  const correcta = nombreDe(hecho.respuesta);
  const haber = SE_ACREDITA_T6_ACT4[hecho.id];
  if (!elegida) return { debe: null, haber: null, caso: null };
  const nombre = nombreDe(elegida);
  const caso = elegida === hecho.respuesta ? "correcta" : nombre === haber ? "al-haber" : "fuera";
  if (fase === "entra" && caso !== "correcta") return { debe: { nombre, propia: true, saliendo: caso === "fuera" }, haber: null, caso };
  if (caso === "correcta") return { debe: { nombre, propia: true }, haber: { nombre: haber, propia: false }, caso };
  if (caso === "al-haber") return { debe: { nombre: correcta, propia: false }, haber: { nombre, propia: true }, caso };
  return { debe: { nombre: correcta, propia: false }, haber: { nombre: haber, propia: false }, caso };
}

/* Lo que se anuncia: el asiento final. PARA SHOKO: «Debe: Caja. Haber: Cuentas por cobrar – clientes.» */
export function anuncioDe(a) {
  const lado = (l) => CUENTA_T_T6_A3[l].charAt(0) + CUENTA_T_T6_A3[l].slice(1).toLowerCase();
  return a.debe && a.haber ? `${lado("debe")}: ${a.debe.nombre}. ${lado("haber")}: ${a.haber.nombre}.` : "";
}

function Ranura({ lado, cuenta, encendida, reducido }) {
  return (
    <div data-ranura={lado} {...(encendida ? { "data-encendida": "" } : {})} style={{
      /* El borde de 2 se come 1 px del relleno: encendida o no, la ranura mide lo mismo. */
      display: "grid", minHeight: "44px", boxSizing: "border-box", padding: encendida ? "5px 7px" : "6px 8px", borderRadius: "10px",
      border: `${encendida ? 2 : 1}px solid ${encendida ? NODO : ATENUADO}`, background: encendida ? NAVY : "transparent",
      textAlign: lado === "debe" ? "left" : "right", alignItems: "center",
    }}>
      {/* La reserva: todos los nombres que pueden caer aquí, apilados e invisibles, dan el alto. */}
      {CANDIDATOS.map((n) => (
        <p key={n} aria-hidden="true" style={{ ...NOMBRE, gridArea: "1 / 1", visibility: "hidden" }}>{n}</p>
      ))}
      {cuenta && (
        <p key={`${cuenta.nombre}-${cuenta.propia}`} data-cuenta={cuenta.nombre} data-propia={cuenta.propia ? "si" : "no"} style={{
          ...NOMBRE, gridArea: "1 / 1", color: cuenta.propia ? TEXTO : SECUNDARIO,
          animation: reducido ? "none" : cuenta.saliendo ? "b5-se-va 300ms ease-in 200ms both" : "b5-entra 240ms ease-out both",
        }}>
          {cuenta.nombre}
        </p>
      )}
    </div>
  );
}

const PASA_AL_HABER = 500;

export default function AsientoMinimo({ hecho, elegida, reducido }) {
  /* La fase sale de lo elegido: un error empieza en «entra» y pasa a «final» a los 500 ms; la correcta, de una vez. */
  const clave = elegida ? `${hecho.id}/${elegida}` : null;
  const [llego, setLlego] = useState(null);
  const conTrayecto = Boolean(elegida) && !reducido && elegida !== hecho.respuesta;
  const fase = conTrayecto && llego !== clave ? "entra" : "final";
  useEffect(() => {
    if (!conTrayecto) return undefined;
    const reloj = setTimeout(() => setLlego(clave), PASA_AL_HABER);
    return () => clearTimeout(reloj);
  }, [clave, conTrayecto]);
  const a = asientoDe(hecho, elegida, fase);
  return (
    <div data-asiento-minimo data-caso={a.caso ?? ""} style={{ margin: "0 0 12px", padding: "8px 10px 10px", borderRadius: "12px", border: `1px solid ${BORDES}` }}>
      <style>{"@keyframes b5-entra { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } } @keyframes b5-se-va { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(-6px); } }"}</style>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "8px" }}>
        {["debe", "haber"].map((lado) => (
          <div key={lado} style={{ minWidth: 0 }}>
            <p style={{ margin: "0 0 4px", paddingBottom: "3px", borderBottom: `1px solid ${ATENUADO}`, textAlign: "center", fontFamily: SORA, fontSize: "9px", fontWeight: 700, lineHeight: 1.3, letterSpacing: "0.1em", color: TONO_ROTULO[lado] }}>
              {CUENTA_T_T6_A3[lado]}
            </p>
            <Ranura lado={lado} cuenta={a[lado]} encendida={lado === "debe" && !elegida} reducido={reducido} />
          </div>
        ))}
      </div>
      <p data-anuncio aria-live="polite" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", margin: 0 }}>
        {fase === "final" ? anuncioDe(a) : ""}
      </p>
    </div>
  );
}
