import { useEffect, useId, useRef, useState } from "react";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { estadoPaso, duracionPaso, PASOS } from "../../../../contabilidad/dosLineas.js";
import DosLineas, { useReducido, ENTRADA } from "./DosLineas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPA 2 · «MÍRELO FUNCIONAR» — San Calixto, paso a paso.
 *
 * El estado es una función del paso (contabilidad/dosLineas.js): «Anterior»
 * recalcula, no deshace. Se maneja a mano; la reproducción automática solo
 * arranca si el estudiante la pide, lleva «Pausa», y se pausa sola si el
 * bloque queda a menos del 30 % visible o si la pestaña se oculta. Cualquier
 * toque en Anterior o Siguiente la pasa a manual.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";

/* La tarjeta del hecho: el patrón de nota ya aprobado. Reserva su alto, para que nada salte. */
function Tarjeta({ estado }) {
  const h = estado.hecho;
  return (
    <div data-tarjeta-hecho style={{ minHeight: "92px", marginBottom: "10px" }}>
      {h && (
        <div key={h.id} style={{
          padding: "9px 12px", borderRadius: "10px", background: "rgba(184,196,212,0.12)",
          borderLeft: `3px solid ${COLOR.neutro}`,
        }}>
          <p style={{ margin: "0 0 3px", fontFamily: SORA, fontSize: "13px", fontWeight: 700, color: COLOR.blanco }}>Hecho {estado.numeroHecho}</p>
          <p style={{ margin: 0, fontFamily: INTER, fontSize: "14px", lineHeight: 1.4, color: COLOR.blanco }}>{h.titulo}</p>
          {h.fecha && <p style={{ margin: "2px 0 0", fontFamily: INTER, fontSize: "12px", color: COLOR.apagado }}>{h.fecha}</p>}
          <p style={{ margin: "2px 0 0", fontFamily: INTER, fontSize: "12px", color: COLOR.apagado }}>{h.fuente}</p>
        </div>
      )}
    </div>
  );
}

const botonBase = {
  flex: "1 1 0", minWidth: 0, height: "44px", borderRadius: "999px", fontFamily: SORA, fontSize: "14px", fontWeight: 600,
  cursor: "pointer", boxSizing: "border-box",
};
const DESACTIVADO = { background: "transparent", border: `2px solid ${COLOR.quieto}`, color: COLOR.apagado, cursor: "default" };

export default function MiraloFuncionar() {
  const reducido = useReducido();
  const [paso, setPaso] = useState(1);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [atras, setAtras] = useState(false);
  const estado = estadoPaso(paso);
  const idAlt = useId();
  const bloque = useRef(null);

  /*
   * A6: el texto del paso cambia con un cruce de 150 ms, y la región viva se
   * actualiza 150 ms después del cambio (así la reproducción automática
   * también se anuncia). Con movimiento reducido, al instante.
   */
  const [mostrado, setMostrado] = useState(paso);
  useEffect(() => {
    if (reducido) { setMostrado(paso); return undefined; }
    const t = setTimeout(() => setMostrado(paso), 150);
    return () => clearTimeout(t);
  }, [paso, reducido]);
  const textos = estadoPaso(mostrado).textos;

  /* La reproducción automática: 3 000 ms + 450 ms por palabra; el paso 6 no avanza. */
  useEffect(() => {
    if (!reproduciendo) return undefined;
    if (paso >= PASOS) { setReproduciendo(false); return undefined; }
    const t = setTimeout(() => { setAtras(false); setPaso((p) => Math.min(PASOS, p + 1)); }, duracionPaso(estado));
    return () => clearTimeout(t);
  }, [reproduciendo, paso]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Se pausa sola: el bloque a menos del 30 % visible, o la pestaña oculta. */
  useEffect(() => {
    if (!reproduciendo) return undefined;
    const alOcultar = () => { if (document.visibilityState === "hidden") setReproduciendo(false); };
    document.addEventListener("visibilitychange", alOcultar);
    let io = null;
    if (typeof IntersectionObserver !== "undefined" && bloque.current) {
      io = new IntersectionObserver((es) => { if (es.some((e) => e.intersectionRatio < 0.3)) setReproduciendo(false); }, { threshold: [0, 0.3] });
      io.observe(bloque.current);
    }
    return () => { document.removeEventListener("visibilitychange", alOcultar); io?.disconnect(); };
  }, [reproduciendo]);

  const ir = (nuevo) => {
    setReproduciendo(false);
    setAtras(nuevo < paso);
    setPaso(Math.min(PASOS, Math.max(1, nuevo)));
  };

  const primero = paso === 1;
  const ultimo = paso === PASOS;
  const etiquetaReproducir = ultimo ? "Ver de nuevo" : reproduciendo ? "Pausa" : "Reproducir";

  return (
    <div ref={bloque} data-capa2-dos-lineas>
      <DosLineas
        estado={estado}
        empresa={estado.empresa}
        encabezado={<Tarjeta estado={estado} />}
        descripcion={estado.alternativo}
        idDescripcion={idAlt}
        salidaMs={160}
        msContador={atras ? 300 : 450}
      />

      {/* El texto del paso: reserva cinco líneas, para que nada se mueva al cambiar. */}
      <div
        data-texto-paso
        aria-live="polite"
        aria-atomic="true"
        style={{ minHeight: "110px", margin: "4px 0 10px", padding: "0 8px" }}
      >
        <div key={mostrado} style={{ animation: reducido ? undefined : `fae-dl-fundido 150ms ${ENTRADA} both` }}>
          {textos.map((t) => (
            <p key={t} style={{ margin: "0 0 6px", fontFamily: INTER, fontSize: "14px", lineHeight: 1.55, color: COLOR.blanco }}>{t}</p>
          ))}
        </div>
      </div>

      <div className="fae-dl" style={{ display: "flex", gap: "9px" }}>
        <button
          type="button"
          data-anterior
          disabled={primero}
          onClick={() => ir(paso - 1)}
          style={{ ...botonBase, ...(primero ? DESACTIVADO : { background: "transparent", border: `2px solid ${COLOR.neutro}`, color: COLOR.blanco }) }}
        >
          Anterior
        </button>
        <button
          type="button"
          data-siguiente
          disabled={ultimo}
          onClick={() => ir(paso + 1)}
          style={{ ...botonBase, ...(ultimo ? DESACTIVADO : { background: COLOR.neutro, border: `2px solid ${COLOR.neutro}`, color: COLOR.navy }) }}
        >
          Siguiente
        </button>
      </div>
      <div className="fae-dl" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "44px", marginTop: "4px" }}>
        <button
          type="button"
          data-reproducir
          aria-pressed={ultimo ? undefined : reproduciendo}
          onClick={() => {
            if (ultimo) { ir(1); return; }
            setAtras(false);
            setReproduciendo((r) => !r);
          }}
          style={{
            minHeight: "44px", padding: "0 4px", background: "transparent", border: "none", cursor: "pointer",
            fontFamily: SORA, fontSize: "13px", fontWeight: 600, color: COLOR.blanco, textDecoration: "underline", textUnderlineOffset: "3px",
          }}
        >
          {etiquetaReproducir}
        </button>
        <span data-paso-de style={{ fontFamily: INTER, fontSize: "12px", color: COLOR.apagado }}>Paso {paso} de {PASOS}</span>
      </div>
    </div>
  );
}
