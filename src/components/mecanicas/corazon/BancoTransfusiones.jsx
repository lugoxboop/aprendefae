import { useEffect, useMemo, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import {
  PASOS_TRANSFUSION, CASOS_TRANSFUSION, resolverTransfusion, distractoresTransfusion,
} from "../../../data/demandaAgregadaHacer.js";
import { Camaraseccion } from "./circulatorio.jsx";
import { CSS_JUEGO, Opcion, Opciones, Retro, Pulsos, Cierre } from "./juego.jsx";

/*
 * ACTIVIDAD 3 — "Banco de transfusiones". Aplicar · Difícil.
 *
 * Ejemplos que se desvanecen (Renkl & Atkinson): primero se ve el cálculo
 * entero resuelto, luego se hace con la fórmula delante, luego sin ella.
 *
 * ═══════════ LA RONDA 1 NO PUNTÚA, Y NO ES UN OLVIDO ═══════════
 *
 * Es el ejemplo trabajado: no hay nada que responder, así que no hay nada que
 * puntuar. Tampoco emite filas a fp_detalle — una fila con ok=true por leer
 * inflaría el acierto de la actividad en el panel del docente.
 *
 * ═══════════ EL DESVANECIMIENTO ESTÁ EN LA AYUDA, NO EN LOS PASOS ═══════════
 *
 * Las dos rondas que puntúan tienen los mismos cuatro pasos. Lo que se retira
 * entre la segunda y la tercera es la fórmula escrita. Quitar pasos en vez de
 * andamio mediría otra cosa —cuánto aguanta— y no es lo que se está enseñando.
 *
 * ═══════════ LOS DISTRACTORES SON ERRORES REALES ═══════════
 *
 * Cobrar impuesto sobre las transferencias, olvidar TR en la renta disponible,
 * aplicar la propensión a la renta bruta, olvidar el consumo autónomo. Están
 * en el banco, con su explicación. Un distractor inventado al azar se descarta
 * de un vistazo y la pregunta se vuelve gratis.
 *
 * ═══════════ LOS ids ═══════════
 *
 *   r2:T · r2:RD · r2:cRD · r2:C · r3:T · r3:RD · r3:cRD · r3:C
 *
 * Ocho, con la ronda delante: los cuatro pasos se llaman igual en las dos y sin
 * prefijo se sumarían, mezclando el paso hecho con ayuda y el hecho sin ella,
 * que es justo la comparación que esta actividad existe para poder hacer.
 *
 * La variante (A o B) NO entra en el id, a propósito: es el mismo paso con
 * otros números, y separarlas partiría cada fila del panel en dos mitades con
 * la mitad de los datos.
 */

const PESO_GUIADA = 40;
const PESO_SOLA = 60;

/* Dos decimales, coma decimal. 202,5 y no 202.50. */
function num(n) {
  const r = Math.round(n * 100) / 100;
  return String(r).replace(".", ",");
}

const redondear = (n) => Math.round(n * 100) / 100;

/* Las opciones de un paso: la correcta y sus dos errores clásicos, barajadas. */
function opcionesDe(caso, pasoId) {
  const correcto = redondear(resolverTransfusion(caso)[pasoId]);
  const vistos = new Set([correcto]);
  const opciones = [{ valor: correcto, ok: true }];
  for (const d of distractoresTransfusion(caso, pasoId)) {
    const v = redondear(d);
    /* Un distractor que coincida con la respuesta la regalaría dos veces. */
    if (vistos.has(v)) continue;
    vistos.add(v);
    opciones.push({ valor: v, ok: false });
  }
  return barajar(opciones);
}

function Datos({ caso }) {
  const filas = [
    ["C̄", caso.autonomo], ["c", caso.c], ["Y", caso.Y], ["TR", caso.TR], ["t", caso.t],
  ];
  return (
    <div
      style={{
        display: "flex", flexWrap: "wrap", gap: "8px",
        padding: "12px 14px", borderRadius: "14px",
        background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)",
      }}
    >
      {filas.map(([k, v]) => (
        <span
          key={k}
          style={{
            display: "inline-flex", alignItems: "baseline", gap: "6px",
            padding: "5px 10px", borderRadius: "8px", background: "rgba(248,249,250,0.05)",
          }}
        >
          <span style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, color: FAE.teal }}>{k}</span>
          <span style={{ fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700, color: FAE.text, fontVariantNumeric: "tabular-nums" }}>
            {num(v)}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function BancoTransfusiones({ onCompletar }) {
  const [casos, setCasos] = useState(() => ({
    ejemplo: barajar(CASOS_TRANSFUSION.ejemplo)[0],
    guiada: barajar(CASOS_TRANSFUSION.guiada)[0],
    sola: barajar(CASOS_TRANSFUSION.sola)[0],
  }));

  /* "ejemplo" | "guiada" | "sola" | "fin" */
  const [ronda, setRonda] = useState("ejemplo");
  const [paso, setPaso] = useState(0);
  const [elegido, setElegido] = useState(null);
  const [aciertos, setAciertos] = useState({ guiada: 0, sola: 0 });

  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const casoActual = ronda === "sola" ? casos.sola : casos.guiada;
  const pasoActual = PASOS_TRANSFUSION[paso];

  /* Las opciones se calculan una vez por paso, no en cada repintado. */
  const opciones = useMemo(
    () => (ronda === "guiada" || ronda === "sola" ? opcionesDe(casoActual, pasoActual.id) : []),
    [ronda, casoActual, pasoActual.id]
  );

  const pct = Math.round(
    (aciertos.guiada / PASOS_TRANSFUSION.length) * PESO_GUIADA +
      (aciertos.sola / PASOS_TRANSFUSION.length) * PESO_SOLA
  );

  useEffect(() => {
    if (ronda === "fin") onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [ronda]);

  const responder = (opcion) => {
    if (elegido !== null) return;
    setElegido(opcion.valor);
    if (opcion.ok) setAciertos((a) => ({ ...a, [ronda]: a[ronda] + 1 }));
    detalle.current.push({
      item: `${ronda === "guiada" ? "r2" : "r3"}:${pasoActual.id}`,
      ok: opcion.ok,
      intentos: 1,
      respuesta: opcion.ok ? null : String(opcion.valor),
      orden: detalle.current.length + 1,
    });
  };

  const avanzar = () => {
    setElegido(null);
    if (paso + 1 < PASOS_TRANSFUSION.length) return setPaso(paso + 1);
    setPaso(0);
    setRonda(ronda === "guiada" ? "sola" : "fin");
  };

  const reiniciar = () => {
    setCasos({
      ejemplo: barajar(CASOS_TRANSFUSION.ejemplo)[0],
      guiada: barajar(CASOS_TRANSFUSION.guiada)[0],
      sola: barajar(CASOS_TRANSFUSION.sola)[0],
    });
    setRonda("ejemplo"); setPaso(0); setElegido(null);
    setAciertos({ guiada: 0, sola: 0 });
    detalle.current = [];
    inicio.current = Date.now();
  };

  /* ─────────────────────────── ronda 1: el ejemplo ─────────────────────────── */

  if (ronda === "ejemplo") {
    const r = resolverTransfusion(casos.ejemplo);
    return (
      <Camaraseccion rotulo="RONDA 1 · EJEMPLO RESUELTO" titulo="Así se hace una transfusión" acento={FAE.teal}>
        <style>{CSS_JUEGO}</style>
        <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.66)", margin: "0 0 14px" }}>
          Esta ronda no puntúa: es el ejemplo. Míralo entero, porque las dos siguientes son el mismo
          cálculo con cada vez menos ayuda.
        </p>

        <Datos caso={casos.ejemplo} />

        <div style={{ display: "grid", gap: "8px", marginTop: "14px" }}>
          {PASOS_TRANSFUSION.map((p, k) => (
            <div
              key={p.id}
              style={{
                display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap",
                padding: "11px 14px", borderRadius: "12px",
                background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.1)",
              }}
            >
              <span style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(248,249,250,0.4)" }}>
                PASO {k + 1}
              </span>
              <span style={{ fontSize: "13px", color: "rgba(248,249,250,0.72)" }}>{p.formula}</span>
              <span style={{ marginLeft: "auto", fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700, color: FAE.teal, fontVariantNumeric: "tabular-nums" }}>
                {num(r[p.id])}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setRonda("guiada")}
          style={{
            marginTop: "16px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
            padding: "11px 18px", borderRadius: "999px", cursor: "pointer",
            background: FAE.teal, border: "none", color: FAE.bg,
          }}
        >
          Entendido, ahora yo
        </button>
      </Camaraseccion>
    );
  }

  /* ─────────────────────────── el cierre ─────────────────────────── */

  if (ronda === "fin") {
    return (
      <Camaraseccion rotulo="BANCO DE TRANSFUSIONES" titulo="Transfusión completa" acento={FAE.teal}>
        <style>{CSS_JUEGO}</style>
        <Cierre pct={pct} onReiniciar={reiniciar} textoReiniciar="Otro paciente">
          <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.55, color: "rgba(248,249,250,0.68)" }}>
            Con la fórmula delante: {aciertos.guiada} de {PASOS_TRANSFUSION.length} ({PESO_GUIADA}% del
            total). Sin ella: {aciertos.sola} de {PASOS_TRANSFUSION.length} ({PESO_SOLA}%). La ronda del
            ejemplo no puntúa.
          </p>
        </Cierre>
      </Camaraseccion>
    );
  }

  /* ─────────────────────────── rondas 2 y 3 ─────────────────────────── */

  const correcto = redondear(resolverTransfusion(casoActual)[pasoActual.id]);
  const acertado = elegido !== null && elegido === correcto;
  const retro = elegido === null
    ? null
    : acertado
      ? `✅ ${num(correcto)} — correcto.`
      : `❌ Revisa: ${pasoActual.formula} con los datos dados.`;

  return (
    <Camaraseccion
      rotulo={ronda === "guiada" ? "RONDA 2 · CON LA FÓRMULA" : "RONDA 3 · SIN AYUDA"}
      titulo={pasoActual.rotulo}
      acento={ronda === "guiada" ? FAE.ambar : FAE.teal}
    >
      <style>{CSS_JUEGO}</style>

      <div style={{ marginBottom: "14px" }}>
        <Pulsos
          total={PASOS_TRANSFUSION.length}
          hechos={paso + (elegido !== null ? 1 : 0)}
          etiqueta="Paso"
        />
      </div>

      <Datos caso={casoActual} />

      {/* El andamio de la ronda 2: la fórmula del paso. La 3 no la lleva. */}
      {ronda === "guiada" ? (
        <p style={{ margin: "14px 0 0", fontFamily: "Sora, sans-serif", fontSize: "16px", fontWeight: 700, color: FAE.ambar }}>
          {pasoActual.formula}
        </p>
      ) : (
        <p style={{ margin: "14px 0 0", fontSize: "13px", lineHeight: 1.5, color: "rgba(248,249,250,0.5)" }}>
          Sin la fórmula delante: este paso ya lo hiciste dos veces.
        </p>
      )}

      <Opciones columnas="repeat(auto-fit, minmax(140px, 1fr))">
        {opciones.map((o) => (
          <Opcion
            key={o.valor}
            ancho
            deshabilitada={elegido !== null}
            onClick={() => responder(o)}
            estado={
              elegido === null ? null
                : o.valor === elegido
                  ? (o.ok ? "correcta" : "incorrecta")
                  : (o.ok ? "revelada" : null)
            }
          >
            <span style={{ fontFamily: "Sora, sans-serif", fontSize: "16px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {num(o.valor)}
            </span>
          </Opcion>
        ))}
      </Opciones>

      <Retro texto={retro} />

      {elegido !== null && (
        <button
          type="button"
          onClick={avanzar}
          style={{
            marginTop: "14px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
            padding: "11px 18px", borderRadius: "999px", cursor: "pointer",
            background: FAE.teal, border: "none", color: FAE.bg,
          }}
        >
          {paso + 1 < PASOS_TRANSFUSION.length
            ? "Siguiente paso"
            : ronda === "guiada"
              ? "Ahora sin ayuda"
              : "Ver resultado"}
        </button>
      )}
    </Camaraseccion>
  );
}
