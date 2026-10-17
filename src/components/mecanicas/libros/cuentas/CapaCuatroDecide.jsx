import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import {
  Pastilla, Mensaje, RegionViva, CORRECTA, TACHADA, REVELADA,
  CSS_B5H, CLASE_B5H, TEXTO_B, CORAL_B, NEUTRO_B, REPOSO_B, ACIERTO_B, ERROR_B,
} from "../b5/Devolucion.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPA 4 QUE DECIDE · para las piezas de Aprender que montan sobre CuatroCapas.
 *
 * POR QUÉ EXISTE. La capa 4 de siempre hace una pregunta abierta y ofrece
 * «Ver la respuesta de referencia». Eso no califica nada, así que el Kit la
 * deja abajo por dos sitios:
 *   · D4 — el estudiante no toma decisiones distintas: avanzar pasos es una
 *     sola acción repetida. Lectura ESTRICTA (Miku, 17-oct): la misma
 *     pregunta sobre otro caso NO es una decisión distinta.
 *   · D6 — no hay ningún mensaje de error, porque no hay error posible.
 *
 * QUÉ HACE, ENTONCES. Dos decisiones de TIPO distinto sobre el mismo caso, y
 * una figura que se vuelve a pintar con cada una:
 *   1ª  de clasificación — de qué lado, de qué familia, a qué cuenta.
 *   2ª  de consecuencia  — qué le pasa al saldo, si cuadra, cuánto queda.
 * No son la misma pregunta dos veces: la segunda solo tiene sentido después
 * de la primera, y cada una mueve la figura a un estado que se ve distinto.
 * Eso es lo que pide D4 Avanzado: «decisiones distintas producen resultados
 * visibles distintos», y se comprueba mirando.
 *
 * Cada opción mala trae su propio `msg`, atado al error conceptual que
 * delata — confundir lado con efecto no es lo mismo que confundir la familia
 * de la cuenta. Dos mensajes distintos por error distinto: D6 Avanzado.
 *
 * CERO FP, Y ESO NO ES UN DESCUIDO. Estas piezas son material teórico: no
 * entran al catálogo del servidor y no llaman a registrar_fp. Calificar aquí
 * es para que el estudiante se vea pensar, no para puntuarlo. La prueba
 * capa4-decide.test.mjs comprueba que este módulo no importe nada de fp/.
 *
 * EL ORDEN IMPORTA: la consecuencia primero, el veredicto después (hallazgo
 * de la Célula C, «toda decisión se pinta»). Al tocar, la figura se mueve en
 * el acto; la pastilla y el mensaje llegan ESPERA ms más tarde. Así el
 * estudiante ve lo que hizo antes de que le digan si estuvo bien.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ESPERA = 380;
const conMovimientoReducido = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

const ROTULO = {
  margin: "0 0 8px", fontFamily: "Sora, sans-serif", fontSize: "12px",
  fontWeight: 600, letterSpacing: "0.08em", color: NEUTRO_B,
};

/*
 * El botón de una opción. 44 de alto como piso, porque se toca con el pulgar;
 * el borde es lo que marca el estado y el acierto va en blanco neutro, nunca
 * en verde: en Contabilidad el verde ya significa DEBE (B4).
 */
function Opcion({ texto, marca, elegida, bloqueada, onClick }) {
  const borde = marca === CORRECTA ? ACIERTO_B : marca === TACHADA ? ERROR_B : marca === REVELADA ? ACIERTO_B : REPOSO_B;
  return (
    <button
      type="button"
      data-opcion
      data-marca={marca ?? "reposo"}
      aria-pressed={elegida}
      disabled={bloqueada}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", width: "100%", minHeight: "44px",
        padding: "10px 14px", borderRadius: "12px", textAlign: "left",
        boxSizing: "border-box", cursor: bloqueada ? "default" : "pointer",
        background: elegida ? "rgba(184,196,212,0.1)" : "transparent",
        border: borde, color: TEXTO_B,
        fontFamily: "Inter, sans-serif", fontSize: "15px", lineHeight: 1.4, fontWeight: 500,
      }}
    >
      <span style={{ flex: 1 }}>{texto}</span>
      {marca && <span style={{ marginLeft: "8px", flexShrink: 0 }}><Pastilla marca={marca} /></span>}
    </button>
  );
}

/*
 * Una decisión. `escalera` es la de Aprender y no la de Hacer: al primer
 * fallo, la pista; al segundo, la correcta se revela en blanco. Nunca «Iba
 * aquí», que es el dialecto de Hacer, donde hay un solo intento.
 */
function Decision({ decision, numero, total, onResuelta, onPintar }) {
  const [elegida, setElegida] = useState(null);
  const [veredicto, setVeredicto] = useState(null);
  const [fallos, setFallos] = useState(0);
  const [resuelta, setResuelta] = useState(false);
  const reloj = useRef(null);

  useEffect(() => () => clearTimeout(reloj.current), []);

  const correcta = decision.opciones.find((o) => o.correcta);
  const revelada = fallos >= 2 && !resuelta;

  const tocar = (opcion) => {
    if (resuelta) return;
    setElegida(opcion.id);
    setVeredicto(null);
    /* 1. La consecuencia, ya: la figura se mueve antes del veredicto. */
    onPintar?.(decision.estado?.(opcion.id) ?? null);
    /* 2. El veredicto, después. */
    clearTimeout(reloj.current);
    const bien = Boolean(opcion.correcta);
    const pintar = () => {
      setVeredicto({ bien, texto: bien ? decision.porque : opcion.msg });
      if (bien) { setResuelta(true); onResuelta?.(); }
      else setFallos((n) => n + 1);
    };
    if (conMovimientoReducido()) pintar();
    else reloj.current = setTimeout(pintar, ESPERA);
  };

  const marcaDe = (opcion) => {
    if (revelada && opcion.correcta) return REVELADA;
    if (opcion.id !== elegida || !veredicto) return null;
    return veredicto.bien ? CORRECTA : TACHADA;
  };

  return (
    <div data-decision={decision.clave} style={{ marginTop: numero === 1 ? "14px" : "22px" }}>
      <p style={ROTULO}>DECISIÓN {numero} DE {total}</p>
      <p data-pregunta style={{
        margin: "0 0 10px", fontFamily: "Sora, sans-serif", fontSize: "15px",
        fontWeight: 700, lineHeight: 1.45, color: TEXTO_B,
      }}>{decision.pregunta}</p>
      <div style={{ display: "grid", gap: "8px" }}>
        {decision.opciones.map((o) => (
          <Opcion
            key={o.id}
            texto={o.t}
            marca={marcaDe(o)}
            elegida={o.id === elegida}
            bloqueada={resuelta}
            onClick={() => tocar(o)}
          />
        ))}
      </div>
      <RegionViva>
        {veredicto && <Mensaje ok={veredicto.bien} texto={veredicto.texto} />}
        {revelada && (
          <p data-revela style={{
            margin: "10px 0 0", fontSize: "14px", lineHeight: 1.55, color: TEXTO_B,
          }}>{decision.pista}</p>
        )}
      </RegionViva>
    </div>
  );
}

/*
 * `pieza` trae lo suyo y nada de React:
 *   { Figura, inicial, decisiones: [{ clave, pregunta, opciones, porque,
 *     pista, estado(eleccion) }], cierre }
 * `Figura({ estado })` solo pinta lo que recibe. `inicial` es el estado con
 * el que abre, antes de la primera decisión.
 */
export default function CapaCuatroDecide({ pieza }) {
  const [estado, setEstado] = useState(pieza.inicial ?? null);
  const [hechas, setHechas] = useState(0);
  const { Figura, decisiones } = pieza;
  const abiertas = Math.min(hechas + 1, decisiones.length);

  return (
    <div className={CLASE_B5H}>
      <style>{CSS_B5H}</style>
      {Figura && (
        <div data-figura-decide style={{
          borderRadius: "14px", background: "rgba(10,20,34,0.45)",
          border: "1px solid rgba(248,249,250,0.1)", padding: "10px",
        }}>
          <Figura estado={estado} />
        </div>
      )}
      {decisiones.slice(0, abiertas).map((d, i) => (
        <Decision
          key={d.clave}
          decision={d}
          numero={i + 1}
          total={decisiones.length}
          onPintar={setEstado}
          onResuelta={() => setHechas((n) => Math.max(n, i + 1))}
        />
      ))}
      {hechas === decisiones.length && pieza.cierre && (
        <p data-cierre style={{
          margin: "18px 0 0", padding: "12px 14px", borderRadius: "12px",
          fontSize: "14px", lineHeight: 1.55, color: TEXTO_B,
          background: "rgba(42,157,143,0.08)", borderLeft: `3px solid ${FAE.teal}`,
        }}>{pieza.cierre}</p>
      )}
    </div>
  );
}

export { CORAL_B };
