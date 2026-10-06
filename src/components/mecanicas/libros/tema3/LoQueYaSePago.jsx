import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { SAN_CALIXTO_P4, ARRIENDOS_DE_LA_COSTA, MESES, CIERRE_DE } from "../../../../data/contabilidadTema3Pieza4.js";
import { pesos } from "../../../../contabilidad/dosLineas.js";
import {
  estadoPasoP4, duracionPasoP4, PASOS_P4, ASIENTO, ESPEJO, LINEAS, MS_VUELO,
} from "../../../../contabilidad/loQueYaSePago.js";
import DosLineas, { useReducido, ENTRADA } from "./DosLineas.jsx";
import AsientoTema3, { Espejo } from "./AsientoTema3.jsx";
import BloqueAnticipo, { useVuelo } from "./BloqueAnticipo.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 4 · CAPA 2 · «MÍRELO FUNCIONAR» — San Calixto y Arriendos de la
 * Costa, 10 pasos (Xeno, P2 §5).
 *
 * Las dos líneas de las piezas 1 y 3, con el calendario por meses encima y el
 * bloque del anticipo debajo. El escenario mide 490 px en líneas, asiento o
 * espejo, para que Anterior y Siguiente no se muevan.
 *
 * Los controles, los tiempos y las pausas son los de las piezas 1 y 3. El
 * estado sale del paso; «Anterior» recalcula.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const ESCENARIO = 490;
const SOLO_LECTOR = { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" };

const botonBase = {
  flex: "1 1 0", minWidth: 0, height: "44px", borderRadius: "999px", fontFamily: SORA, fontSize: "14px", fontWeight: 600,
  cursor: "pointer", boxSizing: "border-box",
};
const DESACTIVADO = { background: "transparent", border: `2px solid ${COLOR.quieto}`, color: COLOR.apagado, cursor: "default" };

/* El asiento como texto real, armado con las etiquetas (Xeno, §9). */
export const asientoEnTexto = (a) => `Debe: ${a.debe.cuenta}, ${pesos(a.debe.monto)}. Haber: ${a.haber.cuenta}, ${pesos(a.haber.monto)}.`;

/* La cabeza de una marca: el segundo elemento dentro de la marca. */
const cabezaDe = (caja, hecho) => caja?.querySelector(`[data-hecho="${hecho}"]`)?.children?.[1] ?? null;

export default function LoQueYaSePago() {
  const reducido = useReducido();
  const [paso, setPaso] = useState(1);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [atras, setAtras] = useState(false);
  /* De qué paso se llegó: se fija una vez por paso, y no cambia aunque la escena se vuelva a pintar. */
  const transicion = useRef({ paso: 1, desde: 1 });
  if (transicion.current.paso !== paso) transicion.current = { paso, desde: transicion.current.paso };
  const desde = transicion.current.desde;
  const idAlt = useId();
  const bloque = useRef(null);
  const escenario = useRef(null);
  const volar = useVuelo(escenario, { reducido, ms: MS_VUELO });

  /*
   * Al avanzar a un cierre (pasos 5 y 9) la ficha vuela antes de que aparezca
   * la marca: la marca de ese cierre entra con 560 ms de retraso. En el paso
   * 9 la escena se queda en líneas mientras vuela, y después pasa al asiento.
   */
  const llegaACierre = (paso === 5 && desde === 4) || (paso === 9 && desde === 8);
  const vuela = llegaACierre && !reducido;
  const [vueloEnCurso, setVueloEnCurso] = useState(false);
  const base = useMemo(() => estadoPasoP4(paso), [paso]);
  const estado = useMemo(() => (vuela
    ? { ...base, marcas: base.marcas.map((m) => (m.hecho.includes("-cierre-") ? { ...m, retraso: 560 } : m)) }
    : base), [base, vuela]);
  const modo = estado.modo === ASIENTO && estado.vueloAntesDelAsiento && vueloEnCurso ? LINEAS : estado.modo;
  const cruzando = paso === 8 && desde === 7 && !reducido;

  useLayoutEffect(() => {
    if (!vuela) { setVueloEnCurso(false); return undefined; }
    setVueloEnCurso(true);
    const t = setTimeout(() => setVueloEnCurso(false), MS_VUELO + 300);
    return () => clearTimeout(t);
  }, [paso]); // eslint-disable-line react-hooks/exhaustive-deps

  /* El vuelo de la ficha de junio: de su lugar en el bloque a la cabeza de su marca. */
  useLayoutEffect(() => {
    if (!vuela || !vueloEnCurso) return;
    const caja = escenario.current;
    const ficha = caja?.querySelector('[data-ficha-mes="0"]');
    const marca = cabezaDe(caja, `${estado.empresa.id}-cierre-0`);
    volar([{ desde: ficha?.getBoundingClientRect(), hasta: marca?.getBoundingClientRect(), relleno: estado.bloque?.ficha }]);
  }, [vueloEnCurso]); // eslint-disable-line react-hooks/exhaustive-deps

  /* El texto del paso cambia con un cruce de 150 ms y la región viva lo anuncia. */
  const [mostrado, setMostrado] = useState(paso);
  useEffect(() => {
    if (reducido) { setMostrado(paso); return undefined; }
    const t = setTimeout(() => setMostrado(paso), 150);
    return () => clearTimeout(t);
  }, [paso, reducido]);
  const textos = estadoPasoP4(mostrado).textos;

  useEffect(() => {
    if (!reproduciendo) return undefined;
    if (paso >= PASOS_P4) { setReproduciendo(false); return undefined; }
    const t = setTimeout(() => { setAtras(false); setPaso((p) => Math.min(PASOS_P4, p + 1)); }, duracionPasoP4(estado));
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
    setPaso(Math.min(PASOS_P4, Math.max(1, nuevo)));
  };

  const primero = paso === 1;
  const ultimo = paso === PASOS_P4;
  const etiquetaReproducir = ultimo ? "Ver de nuevo" : reproduciendo ? "Pausa" : "Reproducir";
  const fundido = reducido ? undefined : `fae-dl-fundido 250ms ${ENTRADA} both`;
  const enAsiento = modo === ASIENTO;

  return (
    <div ref={bloque} data-capa2-p4>
      <div ref={escenario} data-escenario style={{ minHeight: `${ESCENARIO}px`, position: "relative" }}>
        {modo === ESPEJO ? (
          <div key="espejo" data-modo={ESPEJO} style={{ padding: "0 8px", animation: fundido }}>
            <Espejo arriba={SAN_CALIXTO_P4} abajo={ARRIENDOS_DE_LA_COSTA} anima={!atras} reducido={reducido} altoCaja={162} lineas={4} />
            <div role="group" aria-label="Asiento" style={SOLO_LECTOR}>
              {[SAN_CALIXTO_P4, ARRIENDOS_DE_LA_COSTA].map((e) => <p key={e.id}>{`${e.nombre}. ${asientoEnTexto(e.asiento)}`}</p>)}
            </div>
          </div>
        ) : (
          <div key="lineas" data-modo={modo}>
            <DosLineas
              estado={estado}
              empresa={estado.empresa}
              recienCambiada={estado.recienCambiada}
              cruzandoNombre={cruzando}
              descripcion={estado.alternativo}
              idDescripcion={idAlt}
              salidaMs={paso === 8 ? 200 : 160}
              msContador={atras ? 300 : 450}
              calendario={estado.calendario}
              soloEncabezados={enAsiento}
              pie={(
                <>
                  {enAsiento && (
                    <div key={`asiento-${estado.empresa.id}`} style={{ marginTop: "10px", animation: fundido }}>
                      <AsientoTema3 asiento={estado.asiento} anima={!atras} reducido={reducido} conPastilla textoPastilla={CIERRE_DE(MESES[0])} alto={152} lineas={4} />
                      <div role="group" aria-label="Asiento" style={SOLO_LECTOR}><p>{asientoEnTexto(estado.asiento)}</p></div>
                    </div>
                  )}
                  {estado.bloque && (
                    <BloqueAnticipo
                      key={estado.bloque.empresa}
                      bloque={estado.bloque}
                      reducido={reducido}
                      animaEntrada={(paso === 4 && desde === 3) || (paso === 8 && desde === 7)}
                    />
                  )}
                </>
              )}
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
        <button type="button" data-anterior disabled={primero} onClick={() => ir(paso - 1)}
          style={{ ...botonBase, ...(primero ? DESACTIVADO : { background: "transparent", border: `2px solid ${COLOR.neutro}`, color: COLOR.blanco }) }}>
          Anterior
        </button>
        <button type="button" data-siguiente disabled={ultimo} onClick={() => ir(paso + 1)}
          style={{ ...botonBase, ...(ultimo ? DESACTIVADO : { background: COLOR.neutro, border: `2px solid ${COLOR.neutro}`, color: COLOR.navy }) }}>
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
        <span data-paso-de style={{ fontFamily: INTER, fontSize: "12px", color: COLOR.apagado }}>Paso {paso} de {PASOS_P4}</span>
      </div>
    </div>
  );
}
