import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Children } from "react";
import { FAE } from "../../theme.js";
import FiguraFacetada, { TAMANO as TAMANO_MAXIMO } from "./FiguraFacetada.jsx";
import { useAuthOpcional } from "../../auth/AuthProvider.jsx";
import { escucharFP } from "../../fp/aviso.js";
import {
  usaPantallaResumen, resumenDe, formatoDe, partidaValida, decidir, anunciarPartida,
  ROTULO_BIEN, ROTULO_PUNTOS, ROTULO_RESULTADO, NOTA_REPETICION,
  BOTON_VOLVER, BOTON_REPETIR, NOTA_REPETIR,
} from "../../hacer/pantallaResumen.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PANTALLA DE RESUMEN — el componente compartido.
 *
 * Cuando el interruptor de la materia está encendido, ocupa el sitio del
 * recuadro de resultado (`Cierre`, en corazon/juego.jsx, o el cierre propio
 * de una mecánica envuelto en `CierreConResumen`) y el aviso de FP no sale.
 * La celebración de siempre se queda: esta pantalla espera a que acabe.
 *
 * SOLO MUESTRA. Los puntos y la repetición son los del aviso de FP —el mismo
 * valor que «+N FP» y la misma marca que «Ya completada»—; «bien a la
 * primera» se cuenta sobre el detalle con el mismo filtro con que el servidor
 * lo guarda. Si algo no es un número que se pueda enseñar, sale el cierre de
 * siempre (ver la salvaguarda en hacer/pantallaResumen.js). Aquí no se
 * escribe nada.
 *
 * Sin trofeos, coronas, cofres, gemas ni confeti; sin coral. Las cifras van en
 * blanco: ni verde azulado ni ámbar. El texto atenuado es #A8B6C8.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ATENUADO = "#A8B6C8";
const BLANCO = FAE.text;
const SORA = "Sora, sans-serif";
const SOLO_LECTOR = {
  position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px",
  overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
};
const DURACION_CONTEO = 700;
/* Lo que la figura se queda corta del título y del recuadro, en px. */
const HOLGURA_FIGURA = 4;
/* Aire alrededor de las tarjetas, para que la figura se vea al crecer. */
const AIRE_TARJETAS = 30;

/* ═══════════ EL CONTEXTO QUE PONE CADA VISTA ═══════════ */

/*
 * `activa` en falso —o ningún proveedor, que es lo mismo— deja `Cierre`
 * exactamente como era. Es lo que ven Macroeconomía y cualquier vista que no
 * haya conectado la pantalla.
 */
export const ContextoResumen = createContext({ activa: false });

export const useContextoResumen = () => useContext(ContextoResumen);

/**
 * Para una vista: guarda la partida que se acaba de cerrar y lo que el servidor
 * devolvió al registrarla.
 *
 *   const resumen = useResumenDePartida(MATERIA, celebrando);
 *   const r = await resumen.registrar({ actividadId, clasificacion, pct, detalle },
 *                                     () => registrarActividadCompletada(...));
 *   <ContextoResumen.Provider value={resumen.contexto(juego.id, volver)}>…
 *
 * Con el interruptor apagado, `registrar` llama a la función y devuelve lo
 * mismo que ella, sin nada antes ni después, y `contexto` dice `activa: false`.
 */
export function useResumenDePartida(materiaId, celebrando = false) {
  const [partida, setPartida] = useState(null);
  const contador = useRef(0);
  const auth = useAuthOpcional();
  const conCuenta = Boolean(auth?.usuario);

  const registrar = useCallback(async ({ actividadId, clasificacion, pct, detalle }, registrarEnServidor) => {
    if (!usaPantallaResumen(materiaId, actividadId)) return registrarEnServidor();
    contador.current += 1;
    const id = contador.current;
    const base = { id, actividadId, clasificacion, formato: formatoDe(actividadId, clasificacion), pct, detalle, conCuenta };

    /* Lo que ya se sabe antes de registrar: si no vale, cierre de siempre desde ya. */
    const previa = partidaValida(base);
    if (!previa.valida) {
      setPartida({ ...base, registro: null, aviso: null, listo: true, valida: false, motivo: previa.motivo });
      return registrarEnServidor();
    }

    setPartida({ ...base, registro: null, aviso: null, listo: false });
    /* El aviso de FP pregunta por esta partida mientras se registra (ver anunciarPartida). */
    const soltar = anunciarPartida(actividadId, base);
    let aviso = null;
    const dejarDeEscuchar = escucharFP((d) => { if (d?.actividadId === actividadId) aviso = d; });
    let resultado = null;
    try {
      resultado = await registrarEnServidor();
      return resultado;
    } finally {
      dejarDeEscuchar();
      soltar();
      /* La misma decisión que tomó el aviso, con el mismo aviso. */
      const decision = decidir({ ...base, aviso });
      setPartida((p) => (p && p.id === id
        ? { ...p, registro: resultado?.registro ?? null, aviso, listo: true, valida: decision.valida, motivo: decision.motivo }
        : p));
    }
  }, [materiaId, conCuenta]);

  const limpiar = useCallback(() => setPartida(null), []);

  const contexto = (actividadId, onVolver) => ({
    activa: usaPantallaResumen(materiaId, actividadId),
    partida: partida && partida.actividadId === actividadId ? partida : null,
    celebrando,
    limpiar,
    onVolver: () => { limpiar(); onVolver?.(); },
  });

  return { registrar, limpiar, contexto };
}

/** ¿La partida cae al cierre de siempre? Solo cuando ya se decidió que no vale. */
export const caeAlCierreDeSiempre = (ctx) => Boolean(ctx?.partida?.listo && ctx.partida.valida === false);

/*
 * ═══════════ EL CIERRE, CON O SIN PANTALLA ═══════════
 *
 * Envuelve el cierre de siempre de una actividad. Sin contexto activo lo deja
 * tal cual —el mismo marcado, nada alrededor—. Con el contexto activo pinta la
 * pantalla de resumen, salvo que la salvaguarda diga que no: entonces vuelve
 * el cierre de siempre, sin cambios.
 *
 * El cierre propio nunca pierde nada (regla de Levi):
 *
 *   texto      un cierre que es solo un texto corto: ese texto va dentro del
 *              recuadro de la pantalla.
 *   completo   un cierre que trae más (listas, diagnóstico por ítem): se
 *              enseña entero, tal cual, y la pantalla va debajo, sin recuadro
 *              —su texto ya está arriba—.
 *
 * Y UNA SOLA CIFRA DE RESULTADO (regla de Levi): si el cierre propio ya
 * enseña su resultado —siempre con `completo`; con `texto`, cuando el texto
 * lo dice (`conResultado`)—, la pantalla no enseña ningún porcentaje ni
 * «X de N»: solo los puntos.
 *
 * Al desmontarse (la actividad vuelve a empezar, o se sale) olvida la partida,
 * para que la siguiente no herede la decisión de esta.
 */
function useOlvidarAlSalir(ctx) {
  const limpiar = useRef(null);
  limpiar.current = ctx.activa ? ctx.limpiar : null;
  useEffect(() => () => { limpiar.current?.(); }, []);
}

export function CierreConResumen({ texto = null, completo = false, conResultado = false, onReiniciar = null, children }) {
  const ctx = useContextoResumen();
  const cierrePropio = useRef(null);
  useOlvidarAlSalir(ctx);
  if (!ctx.activa || caeAlCierreDeSiempre(ctx)) return children;
  if (!completo) return <PantallaResumen texto={texto} onRepetir={onReiniciar} sinResultado={conResultado} />;
  return (
    <div ref={cierrePropio} data-cierre-propio style={{ scrollMarginTop: "88px" }}>
      {children}
      <PantallaResumen sinRecuadro sinResultado desplazarA={cierrePropio} onRepetir={onReiniciar} />
    </div>
  );
}

/**
 * Lo mismo que `completo`, para un cierre propio repartido por la actividad
 * (Explica la política: el resultado en el panel, el detalle frase por frase
 * y su botón debajo). Se pone al final de ese cierre; `desplazarA` es el
 * comienzo del cierre, adonde se lleva la vista.
 */
export function ResumenDebajo({ onReiniciar = null, desplazarA = null }) {
  const ctx = useContextoResumen();
  useOlvidarAlSalir(ctx);
  if (!ctx.activa || caeAlCierreDeSiempre(ctx)) return null;
  return <PantallaResumen sinRecuadro sinResultado desplazarA={desplazarA} onRepetir={onReiniciar} />;
}

/* ═══════════ LAS CIFRAS QUE CUENTAN DESDE 0 ═══════════ */

function movimientoReducido() {
  try { return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches); } catch { return false; }
}

/*
 * La cifra cuenta desde 0 hasta su valor, pero NUNCA se queda a medio camino.
 * Si el navegador no avanza la animación —pestaña en segundo plano, una
 * lectura de la página sin pintarla—, la tarjeta se quedaba en 0 mientras la
 * línea del lector ya decía el valor real: así se vio «0 %» en un Diagnóstico
 * en vivo de 90 %. Ahora:
 *   · con la pestaña oculta, sale directamente el valor final
 *   · y un reloj de respaldo pone el valor final al acabar el conteo, avance
 *     o no la animación.
 */
const pestanaOculta = () => {
  try { return document.visibilityState === "hidden"; } catch { return false; }
};

function useConteo(objetivo) {
  const [valor, setValor] = useState(() => (movimientoReducido() || pestanaOculta() ? objetivo : 0));
  useEffect(() => {
    if (movimientoReducido() || pestanaOculta() || objetivo <= 0) { setValor(objetivo); return undefined; }
    let marco = null;
    const inicio = performance.now();
    const paso = (ahora) => {
      const t = Math.min(1, Math.max(0, (ahora - inicio) / DURACION_CONTEO));
      /* Frena al final: el último número se lee quieto. */
      setValor(Math.round(objetivo * (1 - (1 - t) ** 3)));
      if (t < 1) marco = requestAnimationFrame(paso);
    };
    marco = requestAnimationFrame(paso);
    const respaldo = setTimeout(() => { cancelAnimationFrame(marco); setValor(objetivo); }, DURACION_CONTEO + 100);
    return () => { cancelAnimationFrame(marco); clearTimeout(respaldo); };
  }, [objetivo]);
  return valor;
}

/*
 * Cada cifra es una tarjeta con fondo sólido (≥92 % de opacidad). Es lo que
 * protege su texto de la figura que crece detrás de «Puntos ganados»: el
 * contraste no depende de cuánto brille la figura (especificación de Xeno).
 */
export const FONDO_TARJETA = "rgba(14,27,46,0.94)";

function Cifra({ rotulo, children, dato, centrada = false, nota = null, figura = null, refTarjeta = null }) {
  return (
    <div ref={refTarjeta} data-cifra={dato} style={{ position: "relative", flex: "1 1 130px", minWidth: 0, textAlign: centrada ? "center" : "left" }}>
      {figura}
      <div
        data-tarjeta
        style={{
          height: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: "14px",
          background: FONDO_TARJETA, border: "1px solid rgba(248,249,250,0.12)",
        }}
      >
      <p style={{ margin: "0 0 4px", fontSize: "13px", lineHeight: 1.3, color: ATENUADO }}>{rotulo}</p>
      <p
        data-valor
        style={{
          margin: 0, fontFamily: SORA, fontSize: "36px", fontWeight: 700, lineHeight: 1.05,
          color: BLANCO, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em",
        }}
      >
        {children}
      </p>
      {nota}
      </div>
    </div>
  );
}

function FiguraBien({ bien, n }) {
  const x = useConteo(bien);
  return <>{x} de {n}</>;
}

function FiguraPorcentaje({ p }) {
  const x = useConteo(p);
  return <>{x} %</>;
}

function FiguraPuntos({ fp }) {
  return <>{useConteo(fp)}</>;
}

/* ═══════════ LA PANTALLA ═══════════ */

/**
 * La pinta `Cierre` cuando el contexto está activo. `texto` es el texto de
 * cierre propio de la actividad (lo que antes iba dentro del recuadro) y
 * `onRepetir`, el reinicio de la actividad.
 */
export default function PantallaResumen({ texto = null, onRepetir = null, sinRecuadro = false, desplazarA = null, sinResultado = false }) {
  const ctx = useContextoResumen();
  const titulo = useRef(null);
  const caja = useRef(null);
  const recuadro = useRef(null);
  const tarjetaPuntos = useRef(null);
  const [tamanoFigura, setTamanoFigura] = useState(null);
  const partida = ctx.partida;
  const visible = Boolean(partida && partida.listo && partida.valida && !ctx.celebrando);

  useEffect(() => {
    if (!visible) return;
    /* Con el cierre propio encima, se lleva la vista a su comienzo: se lee de arriba abajo. */
    const destino = desplazarA?.current ?? caja.current;
    try { destino?.scrollIntoView?.({ block: "start", behavior: movimientoReducido() ? "auto" : "smooth" }); } catch { /* sin scroll */ }
    titulo.current?.focus?.({ preventScroll: true });
  }, [visible]);

  /*
   * El mayor diámetro de la figura que no toca ningún texto fuera de las
   * tarjetas: ni el título de arriba ni el recuadro de abajo. Se mide antes de
   * pintar, así que la figura nunca aparece más grande y luego encoge.
   */
  useLayoutEffect(() => {
    if (!visible) return;
    const t = tarjetaPuntos.current?.getBoundingClientRect();
    const arriba = titulo.current?.getBoundingClientRect();
    const abajo = recuadro.current?.getBoundingClientRect();
    /* Sin maquetación (un entorno sin pantalla, como las pruebas) no hay nada que medir. */
    if (!t || !arriba || !abajo || !t.height) { setTamanoFigura(TAMANO_MAXIMO); return; }
    const centro = t.top + t.height / 2;
    const radio = Math.min(centro - arriba.bottom, abajo.top - centro) - HOLGURA_FIGURA;
    setTamanoFigura(Math.max(0, Math.min(TAMANO_MAXIMO, Math.floor(radio * 2))));
  }, [visible]);

  /* Mientras suena la celebración, nada: la pantalla llega cuando termina. */
  if (!partida || ctx.celebrando) return null;
  if (!partida.listo) {
    return (
      <p data-resumen-esperando role="status" style={{ margin: "18px 0 0", fontSize: "13px", color: ATENUADO }}>
        Guardando el resultado…
      </p>
    );
  }

  const r = resumenDe(partida);
  const conTexto = Children.toArray(texto).length > 0;

  const notaRepeticion = r.repeticion ? (
    <p data-nota-repeticion style={{ margin: "6px 0 0", fontSize: "13px", lineHeight: 1.4, color: ATENUADO }}>
      {NOTA_REPETICION}
    </p>
  ) : null;

  return (
    <section
      ref={caja}
      data-pantalla-resumen
      data-franja={r.exploratoria ? "exploratoria" : r.franja}
      data-repeticion={r.repeticion ? "si" : "no"}
      aria-labelledby="fae-resumen-titulo"
      style={{
        position: "relative", overflow: "hidden",
        /* Al desplazarse hasta aquí, el título queda por debajo del control de cuenta fijo. */
        scrollMarginTop: "88px",
        marginTop: "18px", padding: "20px 18px", borderRadius: "18px",
        background: "rgba(10,20,34,0.55)", border: "1px solid rgba(248,249,250,0.14)",
      }}
    >
      <div style={{ position: "relative", zIndex: 1, display: "grid", gap: "18px" }}>
      <p role="status" data-lector style={SOLO_LECTOR}>{sinResultado ? r.lectorSoloPuntos : r.lector}</p>

      <h3
        id="fae-resumen-titulo"
        ref={titulo}
        tabIndex={-1}
        style={{ margin: 0, fontFamily: SORA, fontSize: "20px", fontWeight: 700, lineHeight: 1.25, color: BLANCO, outline: "none" }}
      >
        {r.titulo}
      </h3>

      {/*
        La figura crece detrás de la tarjeta «Puntos ganados», centrada en
        ella; la tarjeta tapa su centro con su fondo sólido. No toma el
        puntero y se va sola.
      */}
      <div aria-hidden="true" style={{
        display: "flex", flexWrap: "wrap", gap: "12px",
        justifyContent: r.exploratoria ? "center" : "flex-start",
        margin: r.figura ? `${AIRE_TARJETAS - 18}px 0` : 0,
      }}>
        {/* Una sola cifra de resultado: si ya la enseña el cierre propio, aquí no va. */}
        {!r.exploratoria && !sinResultado && (r.conteo ? (
          <Cifra rotulo={ROTULO_BIEN} dato="bien"><FiguraBien bien={r.conteo.bien} n={r.conteo.n} /></Cifra>
        ) : (
          <Cifra rotulo={ROTULO_RESULTADO} dato="resultado"><FiguraPorcentaje p={r.porcentaje} /></Cifra>
        ))}
        <Cifra
          rotulo={ROTULO_PUNTOS}
          dato="puntos"
          centrada={r.exploratoria}
          nota={notaRepeticion}
          refTarjeta={tarjetaPuntos}
          figura={tamanoFigura ? <FiguraFacetada key={partida.id} nivel={r.figura} tamano={tamanoFigura} /> : null}
        >
          <FiguraPuntos fp={r.fp} />
        </Cifra>
      </div>

      {!sinRecuadro && (
        <div
          ref={recuadro}
          data-recuadro
          style={{
            padding: "13px 15px", borderRadius: "12px", fontSize: "13.5px", lineHeight: 1.55, color: BLANCO,
            background: "rgba(248,249,250,0.05)", border: "1px solid rgba(248,249,250,0.12)",
          }}
        >
          {conTexto ? texto : <p style={{ margin: 0 }}>{r.mensaje}</p>}
        </div>
      )}

      {/* Sin recuadro, lo que queda debajo de la figura son los botones. */}
      <div ref={sinRecuadro ? recuadro : null} style={{ display: "grid", gap: "10px" }}>
        <button
          type="button"
          data-volver
          onClick={ctx.onVolver}
          style={{
            width: "100%", padding: "13px 18px", borderRadius: "999px", cursor: "pointer", border: "none",
            background: FAE.teal, color: "#06202A", fontFamily: SORA, fontSize: "14px", fontWeight: 700,
          }}
        >
          {BOTON_VOLVER}
        </button>
        {onRepetir && (
          <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
            <button
              type="button"
              data-repetir
              onClick={() => { ctx.limpiar?.(); onRepetir(); }}
              style={{
                width: "100%", padding: "12px 18px", borderRadius: "999px", cursor: "pointer",
                background: "transparent", border: "1px solid rgba(248,249,250,0.32)", color: BLANCO,
                fontFamily: SORA, fontSize: "14px", fontWeight: 600,
              }}
            >
              {BOTON_REPETIR}
            </button>
            <p data-nota-repetir style={{ margin: 0, fontSize: "12.5px", color: ATENUADO }}>{NOTA_REPETIR}</p>
          </div>
        )}
      </div>
      </div>
    </section>
  );
}
