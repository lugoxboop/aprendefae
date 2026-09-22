import { useCallback, useMemo, useRef, useState } from "react";
import { ChevronRight, RotateCcw, Presentation } from "lucide-react";
import { FAE } from "../../../theme.js";
import { ETAPAS, PUNTOS_POR_ETAPA, TOTAL_PUNTOS, puntuarDesafio } from "../../../nova/puntuacion.js";
import { VALORES_INICIALES, calcularEstado, aplicarEfecto } from "../../../nova/estado.js";
import EstadoResultados from "./EstadoResultados.jsx";
import EtapaComunicados from "./EtapaComunicados.jsx";
import EtapaLinea from "./EtapaLinea.jsx";
import EtapaIncidencia from "./EtapaIncidencia.jsx";
import EtapaComite from "./EtapaComite.jsx";
import CierreNova from "./CierreNova.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * "EL COMITÉ DE NOVA" — el desafío especial de Política Fiscal.
 *
 * Cuatro etapas encadenadas sobre un solo caso, igual de estructura que El
 * Proyecto del Arca y por la misma regla del Kit: un nodo de desafío vale su
 * base × sus etapas, con tope en cuatro (experto 90 × 4 = 360). Los puntos no
 * se calculan aquí —se calculan en nova/puntuacion.js, para poder medirlos sin
 * interfaz— y el número final lo vuelve a calcular el servidor.
 *
 * ═══════════ EL HILO: EL ESTADO DE RESULTADOS, SIEMPRE ARRIBA ═══════════
 *
 * Lo que el nivel del agua es al Arca, el estado de resultados es aquí. Vive
 * EN EL ORQUESTADOR y no dentro de las etapas, y esa es la única forma de que
 * no parpadee entre una y otra: si cada etapa montara el suyo, cambiar de
 * etapa lo desmontaría y volvería a montarlo, y el hilo se cortaría justo en
 * la costura.
 *
 * Las etapas lo mueven a través de `panel`, que mezcla lo que le manden con lo
 * que ya había. La Etapa 2 además le presta las manos: sus líneas se vuelven
 * botones mientras dura su pregunta.
 *
 * ═══════════ EL CASO NO SE REPRODUCE ═══════════
 *
 * Sale del preparcial «CEO por un día», que los estudiantes ya resolvieron en
 * papel. Aquí se toman la empresa, sus cifras y las medidas; las preguntas son
 * nuevas y la mecánica es otra. No se traduce el PDF a pantalla.
 *
 * ═══════════ SIN PARTIDA GUARDADA, A PROPÓSITO ═══════════
 *
 * El Arca la tiene (migración 0028) porque es la actividad más larga del sitio
 * y el piloto la perdía al recargar. Esa maquinaria es SOLO del Arca —el
 * catálogo del servidor lo hace cumplir con `guarda_progreso`— y montarla aquí
 * es una decisión aparte, con su propia migración, que nadie ha pedido. Este
 * desafío se juega de una sentada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-cn-entrar { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.fae-cn-entrar { animation: fae-cn-entrar 460ms cubic-bezier(.3,.9,.4,1) both; }
@media (prefers-reduced-motion: reduce) { .fae-cn-entrar { animation: none !important; } }
`;

/* El mes en el que arranca cada etapa: el año fiscal avanza y la 4 es diciembre. */
const MES_DE_ETAPA = [0, 4, 8, 11];

/*
 * El detalle por ítem del desafío, con el prefijo de su etapa.
 *
 * Mismo criterio que el Arca: hoy los ids no chocarían —c*, l*, m*:fase y
 * escenario:decisión no coinciden— pero son cuatro juegos dentro de una sola
 * actividad, y sin prefijo nada impide que añadir un ítem a una etapa colisione
 * en silencio con otra. Con él, además, la etapa se lee directa en el panel
 * docente sin conocer el catálogo.
 */
export function filasDelDesafio(porEtapa) {
  const filas = [];
  porEtapa.forEach((deEtapa, i) => {
    (deEtapa ?? []).forEach((f) => {
      filas.push({ ...f, item: `et${i + 1}:${f.item}`, orden: filas.length + 1 });
    });
  });
  return filas;
}

export default function ComiteNova({ onCompletar }) {
  /* null = portada. 0..3 = etapa en curso. 4 = cierre. */
  const [paso, setPaso] = useState(null);
  const [resultados, setResultados] = useState([null, null, null, null]);
  const detallePorEtapa = useRef([null, null, null, null]);
  const inicio = useRef(null);
  const yaAvisado = useRef(false);

  /* Lo que el comité decidió, para la pantalla partida del cierre. */
  const [escenario, setEscenario] = useState(null);
  const elegidas = useRef([]);

  /*
   * El estado de resultados y cómo se ve. `base` son las líneas que no son
   * restas; las dos utilidades salen de calcularEstado y nunca se fijan.
   */
  const [base, setBase] = useState(VALORES_INICIALES);
  const [vista, setVista] = useState({ movida: null, direccion: null, despierta: false, onTocar: null, erronea: null });
  const estado = useMemo(() => calcularEstado(base), [base]);

  const panel = useCallback((parcial) => {
    if (!parcial) return;
    const { aplicar, ...resto } = parcial;
    if (aplicar) setBase((b) => { const { operacional, neta, ...soloBase } = aplicarEfecto(calcularEstado(b), aplicar); return soloBase; });
    setVista((v) => ({ ...v, ...resto }));
  }, []);

  const empezar = () => {
    setResultados([null, null, null, null]);
    detallePorEtapa.current = [null, null, null, null];
    elegidas.current = [];
    setEscenario(null);
    setBase(VALORES_INICIALES);
    setVista({ movida: null, direccion: null, despierta: false, onTocar: null, erronea: null, mes: undefined });
    yaAvisado.current = false;
    inicio.current = Date.now();
    setPaso(0);
  };

  const cerrarDesafio = (finales) => {
    setPaso(ETAPAS.length);
    setVista((v) => ({ ...v, onTocar: null, erronea: null }));
    if (yaAvisado.current) return;
    yaAvisado.current = true;
    onCompletar?.(
      puntuarDesafio(finales).pct,
      Math.max(0, Date.now() - (inicio.current ?? Date.now())),
      filasDelDesafio(detallePorEtapa.current),
    );
  };

  const guardar = (indice, pct, filas = null) => {
    detallePorEtapa.current[indice] = filas ?? [];
    const siguientes = [...resultados];
    siguientes[indice] = pct;
    setResultados(siguientes);
  };

  const continuar = () => {
    if (paso < ETAPAS.length - 1) {
      setPaso(paso + 1);
      /*
       * `mes: undefined` DEVUELVE EL CALENDARIO AL MES DE LA ETAPA.
       *
       * La Etapa 2 fecha cada medida y para eso escribe `mes` en la vista. Sin
       * borrarlo al cambiar de etapa, ese mes se quedaba pegado y la Etapa 4
       * —que por ficha salta a DICIEMBRE— se abría en julio. Se vio jugando el
       * desafío entero en el teléfono, no leyendo el código.
       */
      setVista((v) => ({ ...v, movida: null, direccion: null, onTocar: null, erronea: null, mes: undefined }));
      return;
    }
    cerrarDesafio(resultados);
  };

  const total = useMemo(() => puntuarDesafio(resultados), [resultados]);

  /* --------------------------------- portada --------------------------------- */
  if (paso === null) {
    return (
      <div className="fae-cn-entrar">
        <style>{CSS}</style>
        <div
          style={{
            borderRadius: "22px", padding: "clamp(18px, 3vw, 28px)",
            background: "linear-gradient(155deg, rgba(233,196,106,0.09), rgba(10,20,34,0.6) 55%)",
            border: `1px solid ${FAE.ambar}55`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "12px" }}>
            <Presentation size={16} color={FAE.ambar} />
            <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: FAE.ambar, margin: 0 }}>
              DESAFÍO · 4 ETAPAS · {TOTAL_PUNTOS} FP
            </p>
          </div>

          <p style={{ fontSize: "15px", lineHeight: 1.65, color: "rgba(248,249,250,0.78)", margin: "0 0 8px" }}>
            Eres el comité directivo de NOVA. Durante un año el Gobierno va a cobrar, a gastar y a
            pedir prestado, y cada decisión suya mueve una línea del estado de resultados que tienes
            en la pantalla del fondo.
          </p>
          <p style={{ fontSize: "15px", lineHeight: 1.65, color: "rgba(248,249,250,0.78)", margin: "0 0 18px" }}>
            Cuatro etapas sobre la misma empresa. En diciembre te toca decidir a ti.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "9px", marginBottom: "20px" }}>
            {PUNTOS_POR_ETAPA.map((e) => (
              <div key={e.id} style={{ padding: "11px 13px", borderRadius: "13px", background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.12)" }}>
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.1em", color: FAE.teal, margin: "0 0 4px" }}>
                  ETAPA {e.id}
                </p>
                <p style={{ fontSize: "13px", lineHeight: 1.4, color: FAE.text, margin: "0 0 5px" }}>{e.nombre}</p>
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, color: "rgba(248,249,250,0.45)", margin: 0, fontVariantNumeric: "tabular-nums" }}>
                  {e.puntos} FP
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={empezar}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "13px 22px", borderRadius: "14px", cursor: "pointer",
              background: FAE.ambar, border: `1px solid ${FAE.ambar}`, color: "#08111d",
              fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 700,
            }}
          >
            Entrar a la sala de juntas <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  /* ---------------------------------- cierre ---------------------------------- */
  if (paso >= ETAPAS.length) {
    return (
      <div className="fae-cn-entrar">
        <style>{CSS}</style>

        {/* El estado sigue arriba: la ficha dice que no se oculta en ninguna transición. */}
        <div style={{ marginBottom: "16px" }}>
          <EstadoResultados estado={estado} despierta={vista.despierta} mes={11} />
        </div>

        <div style={{ borderRadius: "22px", padding: "clamp(16px, 3vw, 24px)", background: "rgba(248,249,250,0.04)", border: `1px solid ${FAE.ambar}44` }}>
          <CierreNova escenario={escenario} elegidas={elegidas.current} />

          {/*
            Los puntos, debajo y en números. No es iconografía de gamificación:
            es lo que el estudiante necesita saber para entender su FP. La
            recompensa sigue siendo la comparación de arriba.
          */}
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(248,249,250,0.12)" }}>
            <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(26px, 4vw, 34px)", color: FAE.text, margin: "0 0 4px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {total.puntos} <span style={{ fontSize: "0.5em", color: "rgba(248,249,250,0.45)" }}>/ {TOTAL_PUNTOS}</span>
            </p>
            <p style={{ fontSize: "13px", color: "rgba(248,249,250,0.55)", margin: "0 0 16px" }}>
              {total.pct}% del desafío · los FP los calcula el servidor con este porcentaje
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "18px" }}>
              {total.porEtapa.map((e) => (
                <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, color: "rgba(248,249,250,0.4)", width: "16px", flexShrink: 0 }}>
                    {e.id}
                  </span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: "12.5px", color: "rgba(248,249,250,0.75)" }}>
                    {e.nombre}
                  </span>
                  <span style={{ width: "72px", height: "6px", borderRadius: "999px", background: "rgba(248,249,250,0.08)", overflow: "hidden", flexShrink: 0 }}>
                    <span style={{ display: "block", height: "100%", width: `${e.pct ?? 0}%`, background: FAE.teal, borderRadius: "999px" }} />
                  </span>
                  <span style={{ fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700, color: FAE.text, width: "74px", textAlign: "right", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                    {Math.round(e.obtenidos)} / {e.puntos}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPaso(null)}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, padding: "10px 16px", borderRadius: "999px", cursor: "pointer", background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.7)" }}
            >
              <RotateCcw size={14} /> Volver a intentarlo
            </button>
            <p style={{ fontSize: "12px", color: "rgba(248,249,250,0.38)", margin: "10px 0 0" }}>
              Repetir sirve para repasar; los FP se otorgan una sola vez.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------- etapa ---------------------------------- */
  const ficha = PUNTOS_POR_ETAPA[paso];
  const hecha = typeof resultados[paso] === "number";

  const comunes = { onTerminar: (pct, filas, extra) => { guardar(paso, pct, filas); return extra; } };

  return (
    <div>
      <style>{CSS}</style>

      <div style={{ marginBottom: "16px" }}>
        <EstadoResultados
          estado={estado}
          movida={vista.movida}
          direccion={vista.direccion}
          despierta={vista.despierta}
          erronea={vista.erronea}
          onTocar={vista.onTocar}
          mes={vista.mes ?? MES_DE_ETAPA[paso]}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.14em", color: FAE.ambar, margin: "0 0 5px" }}>
          ETAPA {ficha.id} DE {ETAPAS.length} · {ficha.puntos} FP
        </p>
        <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(17px, 2.8vw, 23px)", letterSpacing: "-0.02em", color: FAE.text, margin: 0, lineHeight: 1.25 }}>
          {ficha.nombre}
        </h3>
      </div>

      {paso === 0 && <EtapaComunicados key="e1" {...comunes} />}
      {paso === 1 && <EtapaLinea key="e2" {...comunes} panel={panel} />}
      {paso === 2 && <EtapaIncidencia key="e3" {...comunes} />}
      {paso === 3 && (
        <EtapaComite
          key="e4"
          onEscenario={setEscenario}
          onTerminar={(pct, filas, extra) => {
            guardar(3, pct, filas);
            /* La etapa dice qué eligió y en qué orden; el cierre lo pinta tal cual. */
            elegidas.current = extra?.elegidas ?? [];
          }}
        />
      )}

      {hecha && (
        <button
          type="button"
          onClick={continuar}
          className="fae-cn-entrar"
          style={{
            marginTop: "20px", width: "100%", padding: "14px", borderRadius: "14px", cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
            background: FAE.ambar, border: `1px solid ${FAE.ambar}`, color: "#08111d",
            fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 700,
          }}
        >
          {paso < ETAPAS.length - 1 ? "Siguiente etapa" : "Ver el año que sí pasó"} <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
