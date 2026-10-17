import { FAE } from "../../../../theme.js";
import { CLIENTES as NOMBRE_CLIENTES } from "../../../../data/contabilidadT6Act2.js";
import { SEGUNDA_T6_ACT1 } from "../../../../data/contabilidadT6Act1.js";
import { TONO_ROTULO } from "../debeHaber/piezasDebeHaber.jsx";
import { PreguntaSegunda, marcaSegunda, fantasmaDe, FANTASMA } from "../b5/SegundaDecision.jsx";
import { estiloE4, TACHADA } from "../b5/MarcasE4.jsx";
import { Pastilla, claseDe, REPOSO_B } from "../b5/Devolucion.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * b5-t6-a1 · LA SEGUNDA DECISIÓN: «¿En qué lado de la T entra?» (lote 19,
 * P2 de Mai).
 *
 * La T pequeña «Cuentas por cobrar – clientes» (la de la capa 3 de T6 A1).
 * Sus dos columnas son los botones (88 px de alto como mínimo, con nombre
 * «DEBE» o «HABER»). La ficha entra como «Ficha N» del lado correcto; si hubo
 * error, su fantasma queda del lado tocado. Está a la vista toda la partida:
 * al final, la T muestra toda la historia. Entra con opacidad; con movimiento
 * reducido, al instante.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const LADOS = ["debe", "haber"];

function Chip({ texto, fantasma = false, reducido, nuevo = false }) {
  return (
    <span data-chip-ficha={fantasma ? "fantasma" : "ficha"} style={{
      display: "inline-block", padding: "2px 7px", borderRadius: "8px", fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, lineHeight: "16px",
      color: FAE.text, boxSizing: "border-box",
      ...(fantasma ? { border: FANTASMA, textDecoration: "line-through" } : { border: `1px solid ${nuevo ? FAE.node : "rgba(248,249,250,0.35)"}`, background: nuevo ? "#1D3557" : "transparent" }),
      animation: reducido || !nuevo ? "none" : "b5-funde 240ms linear both",
    }}>{texto}</span>
  );
}

export default function TDeClientes({ activa, elegidas, correcta, fin, onElegir, historial, numero, reducido }) {
  const S = SEGUNDA_T6_ACT1;
  const fantasma = fantasmaDe(elegidas, correcta, fin);
  const pasadas = historial.filter((h) => h.n !== numero);
  return (
    <div data-segunda-decision="lado" style={{ marginTop: "10px" }}>
      <style>{"@keyframes b5-funde { from { opacity: 0; } to { opacity: 1; } }"}</style>
      {activa || fin ? <PreguntaSegunda texto={S.pregunta} /> : null}
      <div data-t-clientes role="group" aria-label={NOMBRE_CLIENTES} style={{ borderRadius: "12px", background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)", padding: "8px 10px 10px" }}>
        <p style={{ margin: "0 0 6px", textAlign: "center", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, lineHeight: 1.3, color: FAE.text }}>{NOMBRE_CLIENTES}</p>
        <div style={{ borderTop: `2px solid ${FAE.node}`, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {LADOS.map((lado) => {
            const marca = activa || fin ? marcaSegunda(lado, elegidas, correcta, fin) : null;
            const puede = activa && !elegidas.includes(lado);
            const aqui = pasadas.filter((h) => h.correcta === lado);
            return (
              <button key={lado} type="button" data-lado-t={lado} aria-label={S[lado]} aria-pressed={elegidas.includes(lado)} disabled={!puede}
                onClick={puede ? () => onElegir(lado) : undefined} className={claseDe(marca)}
                style={{
                  minHeight: "88px", minWidth: 0, boxSizing: "border-box", margin: "6px 3px 0", padding: "6px", borderRadius: "10px", background: "transparent",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: puede ? "pointer" : "default", color: FAE.text,
                  ...estiloE4(marca, activa ? REPOSO_B : "1px solid transparent"),
                }}>
                <span aria-hidden="true" style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", color: TONO_ROTULO[lado], ...(marca === TACHADA ? { textDecoration: "line-through" } : null) }}>{S[lado]}</span>
                <Pastilla marca={marca} envuelve />
                <span style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px" }}>
                  {aqui.map((h) => <Chip key={h.n} texto={S.ficha(h.n)} reducido={reducido} />)}
                  {fin && correcta === lado && <Chip texto={S.ficha(numero)} reducido={reducido} nuevo />}
                  {fin && fantasma === lado && <Chip texto={S.ficha(numero)} reducido={reducido} fantasma />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <p aria-live="polite" data-anuncio-t style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
        {fin ? `${S[correcta]}: ${S.ficha(numero)}` : ""}
      </p>
    </div>
  );
}
