import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Children } from "react";
import { FAE } from "../../theme.js";
import {
  usaPantallaResumen, resumenDe,
  ROTULO_BIEN, ROTULO_PUNTOS, ROTULO_RESULTADO, NOTA_REPETICION,
  BOTON_VOLVER, BOTON_REPETIR, NOTA_REPETIR,
} from "../../hacer/pantallaResumen.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PANTALLA DE RESUMEN — el componente compartido.
 *
 * Cuando el interruptor de la materia está encendido, ocupa el sitio del
 * recuadro de resultado (`Cierre`, en corazon/juego.jsx) y el aviso de FP no
 * sale. La celebración de siempre se queda: esta pantalla espera a que acabe.
 *
 * SOLO MUESTRA. Los FP y la repetición son los de la fila que devolvió
 * registrar_fp; «bien a la primera» se cuenta sobre el detalle con el mismo
 * filtro con que el servidor lo guarda (ver hacer/pantallaResumen.js). Aquí no
 * se escribe nada.
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

  const registrar = useCallback(async ({ actividadId, clasificacion, pct, detalle }, registrarEnServidor) => {
    if (!usaPantallaResumen(materiaId, actividadId)) return registrarEnServidor();
    contador.current += 1;
    const id = contador.current;
    setPartida({ id, actividadId, clasificacion, pct, detalle, registro: null, listo: false });
    let resultado = null;
    try {
      resultado = await registrarEnServidor();
      return resultado;
    } finally {
      setPartida((p) => (p && p.id === id ? { ...p, registro: resultado?.registro ?? null, listo: true } : p));
    }
  }, [materiaId]);

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

/* ═══════════ LAS CIFRAS QUE CUENTAN DESDE 0 ═══════════ */

function movimientoReducido() {
  try { return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches); } catch { return false; }
}

function useConteo(objetivo) {
  const [valor, setValor] = useState(() => (movimientoReducido() ? objetivo : 0));
  useEffect(() => {
    if (movimientoReducido() || objetivo <= 0) { setValor(objetivo); return undefined; }
    let marco = null;
    const inicio = performance.now();
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / DURACION_CONTEO);
      /* Frena al final: el último número se lee quieto. */
      setValor(Math.round(objetivo * (1 - (1 - t) ** 3)));
      if (t < 1) marco = requestAnimationFrame(paso);
    };
    marco = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(marco);
  }, [objetivo]);
  return valor;
}

function Cifra({ rotulo, children, dato, centrada = false, nota = null }) {
  return (
    <div data-cifra={dato} style={{ flex: "1 1 140px", minWidth: 0, textAlign: centrada ? "center" : "left" }}>
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
export default function PantallaResumen({ texto = null, onRepetir = null }) {
  const ctx = useContextoResumen();
  const titulo = useRef(null);
  const caja = useRef(null);
  const partida = ctx.partida;
  const visible = Boolean(partida && partida.listo && !ctx.celebrando);

  useEffect(() => {
    if (!visible) return;
    try { caja.current?.scrollIntoView?.({ block: "start", behavior: movimientoReducido() ? "auto" : "smooth" }); } catch { /* sin scroll */ }
    titulo.current?.focus?.({ preventScroll: true });
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
        marginTop: "18px", padding: "20px 18px", borderRadius: "18px",
        background: "rgba(10,20,34,0.55)", border: "1px solid rgba(248,249,250,0.14)",
        display: "grid", gap: "18px",
      }}
    >
      <p role="status" data-lector style={SOLO_LECTOR}>{r.lector}</p>

      <h3
        id="fae-resumen-titulo"
        ref={titulo}
        tabIndex={-1}
        style={{ margin: 0, fontFamily: SORA, fontSize: "20px", fontWeight: 700, lineHeight: 1.25, color: BLANCO, outline: "none" }}
      >
        {r.titulo}
      </h3>

      <div aria-hidden="true" style={{ display: "flex", flexWrap: "wrap", gap: "16px 20px", justifyContent: r.exploratoria ? "center" : "flex-start" }}>
        {!r.exploratoria && (r.conteo ? (
          <Cifra rotulo={ROTULO_BIEN} dato="bien"><FiguraBien bien={r.conteo.bien} n={r.conteo.n} /></Cifra>
        ) : (
          <Cifra rotulo={ROTULO_RESULTADO} dato="resultado"><FiguraPorcentaje p={r.porcentaje} /></Cifra>
        ))}
        <Cifra rotulo={ROTULO_PUNTOS} dato="puntos" centrada={r.exploratoria} nota={notaRepeticion}>
          <FiguraPuntos fp={r.fp} />
        </Cifra>
      </div>

      <div
        data-recuadro
        style={{
          padding: "13px 15px", borderRadius: "12px", fontSize: "13.5px", lineHeight: 1.55, color: BLANCO,
          background: "rgba(248,249,250,0.05)", border: "1px solid rgba(248,249,250,0.12)",
        }}
      >
        {conTexto ? texto : <p style={{ margin: 0 }}>{r.mensaje}</p>}
      </div>

      <div style={{ display: "grid", gap: "10px" }}>
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
    </section>
  );
}
