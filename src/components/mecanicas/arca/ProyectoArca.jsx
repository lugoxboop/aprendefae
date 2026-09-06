import { useMemo, useRef, useState } from "react";
import { Download, Waves, ChevronRight, RotateCcw } from "lucide-react";
import { FAE } from "../../../theme.js";
import { PDF_CASO } from "../../../data/arca.js";
import {
  ETAPAS, PUNTOS_POR_ETAPA, TOTAL_PUNTOS, puntuarDesafio, nivelDelAgua,
} from "../../../arca/puntuacion.js";
import NivelDelAgua from "./NivelDelAgua.jsx";
import EtapaExpediente from "./EtapaExpediente.jsx";
import EtapaIcebergArca from "./EtapaIcebergArca.jsx";
import EtapaDecision from "./EtapaDecision.jsx";
import EtapaDiluvio from "./EtapaDiluvio.jsx";

/*
 * "El Proyecto del Arca" — el desafío legendario del Modelo del Iceberg.
 *
 * Cuatro etapas encadenadas sobre un solo caso, con un reloj compartido a la
 * vista. Es el nodo especial del tema, no una de sus ocho actividades: vale
 * base × etapas (90 × 4 = 360) por la regla del Kit para desafíos compuestos,
 * y esa regla vive en el motor y en el catálogo del servidor, no aquí.
 *
 * LO QUE ESTE COMPONENTE HACE Y LO QUE NO. Aquí se guarda el resultado de cada
 * etapa, se calcula el nivel del agua y, al terminar las cuatro, se llama UNA
 * vez al motor central con el porcentaje combinado. Los puntos no se calculan
 * aquí: se calculan en arca/puntuacion.js —para poder medirlos sin interfaz— y
 * el número final lo vuelve a calcular el servidor, que es quien manda.
 *
 * EL CASO NO SE REPRODUCE. Se lee antes de clase en papel; el PDF queda
 * descargable en la portada y nada más. Lo que se evalúa es la aplicación del
 * modelo, no la lectura.
 */

const CSS = `
@keyframes fae-pa-entrar { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.fae-pa-entrar { animation: fae-pa-entrar 480ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes fae-pa-latido {
  0%,100% { box-shadow: 0 0 0 0 rgba(233,196,106,0.34), 0 0 30px rgba(233,196,106,0.1); }
  50%     { box-shadow: 0 0 0 7px rgba(233,196,106,0), 0 0 42px rgba(233,196,106,0.22); }
}
.fae-pa-latido { animation: fae-pa-latido 3.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .fae-pa-entrar, .fae-pa-latido { animation: none !important; } }
`;

const COMPONENTES = [EtapaExpediente, EtapaIcebergArca, EtapaDecision, EtapaDiluvio];

export default function ProyectoArca({ onCompletar }) {
  /* null = portada. 0..3 = etapa en curso. 4 = balance final. */
  const [paso, setPaso] = useState(null);
  const [resultados, setResultados] = useState([null, null, null, null]);
  const inicio = useRef(null);
  const yaAvisado = useRef(false);

  const hechas = resultados.filter((r) => typeof r === "number");
  const promedio = hechas.length ? hechas.reduce((s, r) => s + r, 0) / hechas.length : null;
  const agua = nivelDelAgua(hechas.length, promedio);
  const total = useMemo(() => puntuarDesafio(resultados), [resultados]);

  const empezar = () => {
    setResultados([null, null, null, null]);
    yaAvisado.current = false;
    inicio.current = Date.now();
    setPaso(0);
  };

  const guardar = (indice, pct) =>
    setResultados((r) => {
      const copia = [...r];
      copia[indice] = pct;
      return copia;
    });

  const continuar = () => {
    if (paso < ETAPAS.length - 1) {
      setPaso(paso + 1);
      return;
    }
    /* Última etapa: se cierra el desafío y se avisa al motor una sola vez. */
    setPaso(ETAPAS.length);
    if (!yaAvisado.current) {
      yaAvisado.current = true;
      onCompletar?.(puntuarDesafio(resultados).pct, Date.now() - (inicio.current ?? Date.now()));
    }
  };

  /* --------------------------------- portada --------------------------------- */
  if (paso === null) {
    return (
      <div className="fae-pa-entrar">
        <style>{CSS}</style>
        <div
          style={{
            borderRadius: "22px", padding: "clamp(18px, 3vw, 28px)",
            background: "linear-gradient(155deg, rgba(233,196,106,0.09), rgba(10,20,34,0.6) 55%)",
            border: `1px solid ${FAE.ambar}55`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "12px" }}>
            <Waves size={16} color={FAE.ambar} />
            <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: FAE.ambar, margin: 0 }}>
              DESAFÍO LEGENDARIO · 4 ETAPAS · {TOTAL_PUNTOS} FP
            </p>
          </div>

          <p style={{ fontSize: "15px", lineHeight: 1.65, color: "rgba(248,249,250,0.78)", margin: "0 0 8px" }}>
            Absalón tiene cuatro meses, 1200 personas y el encargo de construir un arca. Tiene también
            un ingeniero naval al que ascendió a «elemento técnico» y seis gerencias para vigilarlo.
          </p>
          <p style={{ fontSize: "15px", lineHeight: 1.65, color: "rgba(248,249,250,0.78)", margin: "0 0 18px" }}>
            Cuatro etapas sobre un solo caso. El agua sube mientras respondes, y sube más rápido si
            fallas: el plazo corre igual que en el caso.
          </p>

          {/* Las etapas, de un vistazo. */}
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

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
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
              Empezar el desafío <ChevronRight size={16} />
            </button>

            {/*
              El caso completo. Se lee en papel antes de clase; el enlace está
              para quien lo perdió o quiere volver a mirarlo a mitad de una etapa.
            */}
            <a
              href={PDF_CASO}
              download="caso_el_proyecto_del_arca.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "12px 18px", borderRadius: "14px", textDecoration: "none",
                background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
                color: "rgba(248,249,250,0.78)", fontFamily: "Sora, sans-serif",
                fontSize: "13.5px", fontWeight: 600,
              }}
            >
              <Download size={15} /> Descargar el caso (PDF)
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------- balance --------------------------------- */
  if (paso >= ETAPAS.length) {
    return (
      <div className="fae-pa-entrar">
        <style>{CSS}</style>
        <div style={{ borderRadius: "22px", padding: "clamp(18px, 3vw, 26px)", background: "rgba(248,249,250,0.04)", border: `1px solid ${FAE.ambar}44` }}>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: FAE.ambar, margin: "0 0 10px" }}>
            DESAFÍO COMPLETADO
          </p>
          <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(30px, 5vw, 42px)", color: FAE.text, margin: "0 0 4px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {total.puntos} <span style={{ fontSize: "0.5em", color: "rgba(248,249,250,0.45)" }}>/ {TOTAL_PUNTOS}</span>
          </p>
          <p style={{ fontSize: "13.5px", color: "rgba(248,249,250,0.55)", margin: "0 0 20px" }}>
            {total.pct}% del desafío · los FP los calcula el servidor con este porcentaje
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "20px" }}>
            {total.porEtapa.map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, color: "rgba(248,249,250,0.4)", width: "16px", flexShrink: 0 }}>
                  {e.id}
                </span>
                <span style={{ flex: 1, minWidth: 0, fontSize: "13px", color: "rgba(248,249,250,0.75)" }}>
                  {e.nombre}
                </span>
                <span style={{ width: "84px", height: "6px", borderRadius: "999px", background: "rgba(248,249,250,0.08)", overflow: "hidden", flexShrink: 0 }}>
                  <span style={{ display: "block", height: "100%", width: `${e.pct ?? 0}%`, background: FAE.teal, borderRadius: "999px" }} />
                </span>
                <span style={{ fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700, color: FAE.text, width: "76px", textAlign: "right", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
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
    );
  }

  /* --------------------------------- etapa --------------------------------- */
  const Etapa = COMPONENTES[paso];
  const ficha = PUNTOS_POR_ETAPA[paso];
  const resultado = resultados[paso];
  const hecha = typeof resultado === "number";

  return (
    <div>
      <style>{CSS}</style>

      {/* Cabecera de la etapa, con el agua siempre a la vista. */}
      <div
        style={{
          display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center",
          justifyContent: "space-between", marginBottom: "18px",
        }}
      >
        <div style={{ minWidth: "180px", flex: 1 }}>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.14em", color: FAE.ambar, margin: "0 0 5px" }}>
            ETAPA {ficha.id} DE {ETAPAS.length} · {ficha.puntos} FP
          </p>
          <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.8vw, 23px)", letterSpacing: "-0.02em", color: FAE.text, margin: 0, lineHeight: 1.2 }}>
            {ficha.nombre}
          </h3>
        </div>
        <NivelDelAgua
          altura={agua}
          etapa={ficha.id}
          total={ETAPAS.length}
          apremia={typeof promedio === "number" && promedio < 60}
        />
      </div>

      <Etapa key={paso} onTerminar={(pct) => guardar(paso, pct)} />

      {hecha && (
        <button
          type="button"
          onClick={continuar}
          className="fae-pa-entrar"
          style={{
            marginTop: "20px", width: "100%", padding: "14px", borderRadius: "14px", cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
            background: FAE.ambar, border: `1px solid ${FAE.ambar}`, color: "#08111d",
            fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 700,
          }}
        >
          {paso < ETAPAS.length - 1 ? "Siguiente etapa" : "Ver el balance"} <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
