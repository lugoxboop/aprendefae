import { useCallback, useMemo, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { DESAFIO } from "../../../../data/contabilidadActividades.js";
import { ENCABEZADO_ESTADO } from "../../../../data/contabilidadDesafio.js";
import {
  TOTAL_PUNTOS, PUNTOS_POR_ETAPA, puntuarDesafio, TRANSACCIONES, MAYOR, ESTADO,
} from "../../../../contabilidad/desafio.js";
import { EstilosDeVerbos } from "../verbos.jsx";
import {
  HiloDeLaBalanza, Superficie, HojaDelDiario, CuadriculaDelMayor, HojaDelEstado,
} from "./Escritorio.jsx";
import { EtapaDiario, EtapaMayor, EtapaSaldos, EtapaEstado } from "./EtapasDelCiclo.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «EL CICLO COMPLETO» — el desafío de Las cuentas, el debe y el haber.
 *
 * Cuatro etapas sobre un solo caso, misma estructura que El Proyecto del Arca
 * y El Comité de NOVA, y la misma regla del Kit: base × etapas con tope en
 * cuatro, experto (90) × 4 = 360. Los puntos se calculan en
 * contabilidad/desafio.js —para poder medirlos sin interfaz— y el servidor
 * los vuelve a calcular.
 *
 * ═══════════ EL HILO, Y POR QUÉ VIVE AQUÍ ═══════════
 *
 * La balanza de la ecuación cruza las cuatro etapas y vive EN EL ORQUESTADOR,
 * no dentro de las etapas. Si cada etapa montara la suya, cambiar de etapa la
 * desmontaría y la volvería a montar, y el hilo se cortaría justo en la
 * costura. Las etapas la mueven a través de `hilo`.
 *
 * Lo que la balanza pesa cambia de nombre y no de naturaleza: en el diario y
 * el mayor son el debe y el haber de lo registrado; en los saldos, los saldos
 * de cada lado; en el estado, el activo contra el pasivo más el patrimonio.
 * Son la misma cosa mirada cuatro veces, y ese es el argumento del capítulo.
 *
 * ═══════════ EL CIERRE NO LLEVA TROFEO ═══════════
 *
 * Lo pide la ficha y lo exige el prerrequisito del Kit: la balanza nivelada ES
 * la recompensa. Ni medalla, ni cofre, ni confeti. Las tres superficies se
 * encienden en secuencia y se dice la frase, y eso es todo.
 *
 * ═══════════ SIN PARTIDA GUARDADA, COMO NOVA ═══════════
 *
 * La maquinaria de guardar progreso es solo del Arca —el catálogo del
 * servidor lo hace cumplir con `guarda_progreso`— y montarla aquí sería una
 * decisión aparte con su propia migración. Este desafío es largo; conviene
 * decirlo en vez de descubrirlo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-cc-entrar { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.fae-cc-entrar { animation: fae-cc-entrar 460ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes fae-cc-encender {
  from { opacity: 0.35; border-color: rgba(248,249,250,0.1); }
  to { opacity: 1; border-color: ${FAE.teal}; }
}
.fae-cc-encender { animation: fae-cc-encender 700ms ease both; }
@media (prefers-reduced-motion: reduce) {
  .fae-cc-entrar, .fae-cc-encender { animation: none !important; }
}
`;

const ETAPAS = [EtapaDiario, EtapaMayor, EtapaSaldos, EtapaEstado];

/*
 * El detalle por ítem lleva el prefijo de su etapa, igual que el Arca y NOVA:
 * son cuatro juegos dentro de una sola actividad y sin prefijo nada impide que
 * añadir un ítem a una etapa choque en silencio con otra.
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

export default function ElCicloCompleto({ onCompletar }) {
  /* null = portada. 0..3 = etapa. 4 = cierre. */
  const [paso, setPaso] = useState(null);
  const [resultados, setResultados] = useState([null, null, null, null]);
  const [hilo, setHilo] = useState({ izquierda: 0, derecha: 0, rotuloIzq: "DEBE", rotuloDer: "HABER" });
  const detallePorEtapa = useRef([null, null, null, null]);
  const inicio = useRef(null);
  const yaAvisado = useRef(false);

  /* El diario tal como el estudiante lo escribió: el cierre lo enseña entero. */
  const [diario, setDiario] = useState([]);

  const moverHilo = useCallback((parcial) => {
    if (parcial) setHilo((h) => ({ ...h, ...parcial }));
  }, []);

  const empezar = () => {
    setResultados([null, null, null, null]);
    detallePorEtapa.current = [null, null, null, null];
    setDiario([]);
    setHilo({ izquierda: 0, derecha: 0, rotuloIzq: "DEBE", rotuloDer: "HABER" });
    yaAvisado.current = false;
    inicio.current = Date.now();
    setPaso(0);
  };

  const terminarEtapa = (indice) => (pct, filas) => {
    detallePorEtapa.current[indice] = filas ?? [];
    const siguientes = [...resultados];
    siguientes[indice] = pct;
    setResultados(siguientes);

    if (indice < ETAPAS.length - 1) { setPaso(indice + 1); return; }

    setPaso(ETAPAS.length);
    /*
     * El cierre nivela la balanza por última vez con las cifras del capítulo,
     * no con lo que el estudiante dejó: el estado que se acaba de construir es
     * el del libro, cuadre o no su camino hasta él.
     */
    setHilo({ izquierda: ESTADO.activos, derecha: ESTADO.pasivosMasPatrimonio, rotuloIzq: "ACTIVO", rotuloDer: "PASIVO + PATRIM." });
    if (yaAvisado.current) return;
    yaAvisado.current = true;
    onCompletar?.(
      puntuarDesafio(siguientes).pct,
      Math.max(0, Date.now() - (inicio.current ?? Date.now())),
      filasDelDesafio(detallePorEtapa.current),
    );
  };

  const total = useMemo(() => puntuarDesafio(resultados), [resultados]);

  /* --------------------------------- portada --------------------------------- */
  if (paso === null) {
    return (
      <div className="fae-cc-entrar">
        <style>{CSS}</style>
        <div style={{
          borderRadius: "22px", padding: "clamp(18px, 3vw, 28px)",
          background: "linear-gradient(155deg, rgba(233,196,106,0.09), rgba(10,20,34,0.6) 55%)",
          border: `1px solid ${FAE.ambar}55`,
        }}>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: FAE.ambar, margin: "0 0 12px" }}>
            DESAFÍO · {DESAFIO.etapas} ETAPAS · {TOTAL_PUNTOS} FP
          </p>
          <p style={{ fontSize: "15px", lineHeight: 1.65, color: "rgba(248,249,250,0.78)", margin: "0 0 8px" }}>
            {ENCABEZADO_ESTADO.empresa} abrió en enero. Tiene sobre el escritorio las nueve
            transacciones del mes, el libro diario en blanco, el mayor vacío y una hoja de estado
            de situación financiera sin una sola línea.
          </p>
          <p style={{ fontSize: "15px", lineHeight: 1.65, color: "rgba(248,249,250,0.78)", margin: "0 0 18px" }}>
            En el borde del escritorio hay una balanza. Mientras registre bien, se mantiene
            nivelada.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "9px", marginBottom: "20px" }}>
            {PUNTOS_POR_ETAPA.map((e) => (
              <div key={e.id} style={{ padding: "11px 13px", borderRadius: "13px", background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.12)" }}>
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.1em", color: FAE.teal, margin: "0 0 4px" }}>
                  ETAPA {e.id}
                </p>
                <p style={{ fontSize: "13px", lineHeight: 1.4, color: FAE.text, margin: "0 0 3px" }}>{e.nombre}</p>
                <p style={{ fontSize: "12px", lineHeight: 1.35, color: "#A8B6C8", margin: "0 0 5px" }}>{e.subtema}</p>
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, color: "#A8B6C8", margin: 0, fontVariantNumeric: "tabular-nums" }}>
                  {e.puntos} FP
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={empezar}
            style={{
              width: "100%", padding: "13px", borderRadius: "999px", cursor: "pointer",
              background: FAE.teal, border: "none", color: "#06202A",
              fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700,
            }}
          >
            Sentarse al escritorio
          </button>
        </div>
      </div>
    );
  }

  /* --------------------------------- cierre --------------------------------- */
  if (paso === ETAPAS.length) {
    return (
      <div className="fae-cc-entrar">
        <style>{CSS}</style>
        <EstilosDeVerbos />
        <HiloDeLaBalanza {...hilo} />

        <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
          {[
            ["diario", "LIBRO DIARIO", `${diario.length || TRANSACCIONES.length} asientos`,
              <HojaDelDiario key="d" asientos={diario.length ? diario : TRANSACCIONES.map((t) => ({ id: t.id, fecha: t.fecha, asiento: t.asiento }))} />],
            ["mayor", "LIBRO MAYOR", `${MAYOR.length} cuentas`, <CuadriculaDelMayor key="m" cuentas={MAYOR} conSaldo />],
            ["estado", "ESTADO DE SITUACIÓN FINANCIERA", "cuadrado",
              <HojaDelEstado key="e" encabezado={ENCABEZADO_ESTADO}
                secciones={Object.values(ESTADO.secciones)} activos={ESTADO.activos}
                pasivosMasPatrimonio={ESTADO.pasivosMasPatrimonio} cuadra />],
          ].map(([id, titulo, resumen, contenido], k) => (
            /* Se encienden en secuencia: diario → mayor → estado. */
            <div key={id} className="fae-cc-encender" style={{ animationDelay: `${k * 380}ms`, borderRadius: "14px" }}>
              <Superficie id={id} titulo={titulo} resumen={resumen}>{contenido}</Superficie>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: "18px", padding: "16px 18px", borderRadius: "16px",
          background: "rgba(42,157,143,0.09)", border: `1px solid ${FAE.teal}55`,
        }}>
          <p style={{ margin: "0 0 10px", fontSize: "14.5px", lineHeight: 1.6, color: FAE.text }}>
            {DESAFIO.cierre}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
            {total.porEtapa.map((e) => (
              <div key={e.id} style={{ padding: "9px 11px", borderRadius: "12px", background: "rgba(248,249,250,0.04)" }}>
                <p style={{ margin: "0 0 3px", fontFamily: "Sora, sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: FAE.teal }}>
                  ETAPA {e.id}
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "rgba(248,249,250,0.7)" }}>{e.nombre}</p>
                <p style={{ margin: "3px 0 0", fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, color: FAE.text, fontVariantNumeric: "tabular-nums" }}>
                  {Math.round(e.obtenidos)} / {e.puntos} FP
                </p>
              </div>
            ))}
          </div>
          <p data-total-desafio style={{
            margin: "12px 0 0", fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700,
            color: FAE.text, textAlign: "center", fontVariantNumeric: "tabular-nums",
          }}>
            {total.puntos} de {TOTAL_PUNTOS} FP
          </p>
        </div>
      </div>
    );
  }

  /* --------------------------------- etapa --------------------------------- */
  const Etapa = ETAPAS[paso];
  return (
    <div>
      <style>{CSS}</style>
      <EstilosDeVerbos />
      <HiloDeLaBalanza {...hilo} />
      <div style={{ display: "flex", alignItems: "center", gap: "9px", margin: "0 0 10px" }}>
        <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.14em", color: FAE.ambar }}>
          ETAPA {paso + 1} DE {ETAPAS.length}
        </p>
        <span aria-hidden="true" style={{ flex: 1, height: "1px", background: "rgba(248,249,250,0.14)" }} />
        <p style={{ margin: 0, fontSize: "11.5px", color: "rgba(248,249,250,0.5)" }}>{PUNTOS_POR_ETAPA[paso].subtema}</p>
      </div>
      <h3 style={{ margin: "0 0 12px", fontFamily: "Sora, sans-serif", fontSize: "18px", fontWeight: 700, color: FAE.text }}>
        {PUNTOS_POR_ETAPA[paso].nombre}
      </h3>
      <div className="fae-cc-entrar" key={paso}>
        <Etapa
          onTerminar={(pct, filas, escrito) => {
            if (escrito) setDiario(escrito);
            terminarEtapa(paso)(pct, filas);
          }}
          hilo={moverHilo}
          diario={diario.length ? diario : TRANSACCIONES.map((t) => ({ id: t.id, fecha: t.fecha, asiento: t.asiento }))}
        />
      </div>
    </div>
  );
}
