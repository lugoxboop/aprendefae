import { useEffect, useId, useMemo, useRef, useState } from "react";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { SAN_CALIXTO_P3, SAN_MIGUEL_P3 } from "../../../../data/contabilidadTema3Pieza3.js";
import {
  estadoPasoP3, duracionPasoP3, PASOS_P3, ASIENTO, ESPEJO, MS_CASCADA,
} from "../../../../contabilidad/loQueYaPaso.js";
import DosLineas, { useReducido, ENTRADA } from "./DosLineas.jsx";
import AsientoTema3, { Espejo } from "./AsientoTema3.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 3 · CAPA 2 · «MÍRELO FUNCIONAR» — San Calixto y San Miguel, 9 pasos.
 *
 * Las dos líneas de la pieza 1, con el calendario de cinco días encima. El
 * escenario mide siempre 350 px —líneas, asiento o espejo—, así los botones
 * no se mueven al cambiar de modo.
 *
 * Los controles, los tiempos y las pausas son los de la pieza 1: nada arranca
 * solo; «Reproducir» es opcional y lleva «Pausa»; se pausa si el bloque queda
 * a menos del 30 % visible o si la pestaña se oculta; Anterior o Siguiente lo
 * pasan a manual. El estado sale del paso: «Anterior» recalcula.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const ESCENARIO = 350;

const botonBase = {
  flex: "1 1 0", minWidth: 0, height: "44px", borderRadius: "999px", fontFamily: SORA, fontSize: "14px", fontWeight: 600,
  cursor: "pointer", boxSizing: "border-box",
};
const DESACTIVADO = { background: "transparent", border: `2px solid ${COLOR.quieto}`, color: COLOR.apagado, cursor: "default" };

export default function LoQueYaPaso() {
  const reducido = useReducido();
  const [paso, setPaso] = useState(1);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [atras, setAtras] = useState(false);
  const desde = useRef(1);
  /* Memorizado por paso: DosLineas anima lo nuevo una vez y no lo corta si se vuelve a pintar. */
  const estado = useMemo(() => estadoPasoP3(paso), [paso]);
  const idAlt = useId();
  const bloque = useRef(null);
  const cruzando = paso === 6 && desde.current === 5 && !reducido;
  useEffect(() => { desde.current = paso; }, [paso]);

  /* El texto del paso cambia con un cruce de 150 ms, y la región viva lo anuncia (A6 de la pieza 1). */
  const [mostrado, setMostrado] = useState(paso);
  useEffect(() => {
    if (reducido) { setMostrado(paso); return undefined; }
    const t = setTimeout(() => setMostrado(paso), 150);
    return () => clearTimeout(t);
  }, [paso, reducido]);
  const textos = estadoPasoP3(mostrado).textos;

  useEffect(() => {
    if (!reproduciendo) return undefined;
    if (paso >= PASOS_P3) { setReproduciendo(false); return undefined; }
    const t = setTimeout(() => { setAtras(false); setPaso((p) => Math.min(PASOS_P3, p + 1)); }, duracionPasoP3(estado));
    return () => clearTimeout(t);
  }, [reproduciendo, paso]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setPaso(Math.min(PASOS_P3, Math.max(1, nuevo)));
  };

  const primero = paso === 1;
  const ultimo = paso === PASOS_P3;
  const etiquetaReproducir = ultimo ? "Ver de nuevo" : reproduciendo ? "Pausa" : "Reproducir";
  const cascada = (paso === 3 || paso === 7) && !atras;
  const msContador = atras ? 300 : cascada ? MS_CASCADA : 450;
  const fundido = reducido ? undefined : `fae-dl-fundido 250ms ${ENTRADA} both`;

  return (
    <div ref={bloque} data-capa2-p3>
      <div data-escenario style={{ height: `${ESCENARIO}px`, position: "relative" }}>
        {estado.modo === ESPEJO ? (
          <div key="espejo" data-modo={ESPEJO} style={{ padding: "0 8px", animation: fundido }}>
            <Espejo arriba={SAN_CALIXTO_P3} abajo={SAN_MIGUEL_P3} anima={!atras} reducido={reducido} />
          </div>
        ) : (
          <div key="lineas" data-modo={estado.modo}>
            <DosLineas
              estado={estado}
              empresa={estado.empresa}
              recienCambiada={estado.recienCambiada}
              cruzandoNombre={cruzando}
              descripcion={estado.alternativo}
              idDescripcion={idAlt}
              salidaMs={paso === 6 ? 200 : 160}
              msContador={msContador}
              calendario={estado.calendario}
              soloEncabezados={estado.modo === ASIENTO}
              pie={estado.modo === ASIENTO ? (
                <div key={estado.empresa.id} style={{ marginTop: "12px", animation: fundido }}>
                  <AsientoTema3 asiento={estado.asiento} anima={!atras} reducido={reducido} conPastilla />
                </div>
              ) : null}
            />
          </div>
        )}
      </div>

      {/* El texto del paso: reserva seis líneas, para que nada se mueva al cambiar. */}
      <div data-texto-paso aria-live="polite" aria-atomic="true" style={{ minHeight: "132px", margin: "4px 0 10px", padding: "0 8px" }}>
        <div key={mostrado} style={{ animation: reducido ? undefined : `fae-dl-fundido 150ms ${ENTRADA} both` }}>
          {textos.map((t) => (
            <p key={t} style={{ margin: 0, fontFamily: INTER, fontSize: "14px", lineHeight: 1.55, color: COLOR.blanco }}>{t}</p>
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
        <span data-paso-de style={{ fontFamily: INTER, fontSize: "12px", color: COLOR.apagado }}>Paso {paso} de {PASOS_P3}</span>
      </div>
    </div>
  );
}
