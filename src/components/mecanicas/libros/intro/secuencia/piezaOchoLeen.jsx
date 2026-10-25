import { FileText } from "lucide-react";
import { FAE } from "../../../../../theme.js";
import { ID, USUARIOS, PREGUNTA_FINAL, VACIO_CAPA_3 } from "../../../../../data/contabilidadIntro.js";
import { OCHO_SEC, deFicha } from "../../../../../data/contabilidadT1Secuencia.js";
import { BALANCE } from "../../../../../contabilidad/recorridoDeUnHecho.js";
import { pesos } from "../../../../../data/contabilidad.js";
import {
  MarcoFigura, Escenario, Nota, SORA, INTER, SECUNDARIO, NAVY, paradaResuelta, figuraFrase,
} from "./figurasT1.jsx";
import { pick } from "./piezaRecorrido.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PIEZA NUEVA · OCHO LEEN LO MISMO — 4 pantallas (Mai §3.1 y medidas §7).
 *
 * Las pantallas 15 a 17 de la ficha de cu0-a1. Los ocho usuarios en dos
 * pasos de cuatro, mezclados (Futaba, lote C §3), en una rejilla de 2×2
 * (Mai §7). Al tocar a una persona se lee lo que le pregunta al informe; el
 * propósito textual del libro se lee entero en el lector de pantalla.
 *
 * La frase final es la capa 4 publicada, con la op1 de la auditoría de base.
 * ⛔ Excepción declarada (Mai, medidas §4): las cuatro frases no caben con la
 * reserva de la pieza a 320. Provisional hasta #558: la figura es una franja
 * de 44 px y las cuatro frases van enteras debajo, en flujo; se desplaza la
 * pantalla, no la lista (auditoría de Shoko del #559). Ver FiguraFrase.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const T = OCHO_SEC.pantallas;
const usuario = (id) => USUARIOS.find((u) => u.id === id);

const InformeChip = () => (
  <div data-informe-chip style={{ display: "flex", alignItems: "center", gap: "8px", minHeight: "28px", fontFamily: INTER, fontSize: "13px", color: FAE.text }}>
    <FileText aria-hidden="true" size={22} strokeWidth={1.75} color={SECUNDARIO} />
    Un mismo informe
  </div>
);

/* Una rejilla de 2×2 con cuatro personas; al tocar una se lee su pregunta. */
const figuraCuatro = (ids) => function FiguraCuatro({ estado, setEstado }) {
  const vistas = estado?.vistas ?? [];
  const ultima = estado?.ultima ?? null;
  const tocar = (id) => setEstado({ vistas: vistas.includes(id) ? vistas : [...vistas, id], ultima: id });
  return (
    <MarcoFigura>
      {/* Plano: la rejilla necesita el ancho entero para que «Administradores» entre con relleno de 8 (Mai §7.1). */}
      <Escenario plano>
        <InformeChip />
        <div role="group" aria-label="Cuatro personas" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
          {ids.map((id) => {
            const u = usuario(id);
            const on = ultima === id;
            return (
              <button key={id} type="button" data-persona={id} aria-pressed={on} aria-label={u.nombre} onClick={() => tocar(id)} style={{
                minWidth: 0, height: "44px", padding: "0 8px", borderRadius: "10px", boxSizing: "border-box", textAlign: "left",
                fontFamily: INTER, fontSize: "13px", fontWeight: 600, lineHeight: "16px", cursor: "pointer",
                color: on ? NAVY : FAE.text, background: on ? "#B8C4D4" : "transparent",
                border: `2px solid ${on ? "#B8C4D4" : vistas.includes(id) ? "rgba(248,249,250,.6)" : "rgba(248,249,250,.35)"}`,
              }}>
                {OCHO_SEC.corto[id]}
              </button>
            );
          })}
        </div>
        {ultima && (
          <Nota key={ultima} data-pregunta-de={ultima}>
            «{usuario(ultima).pregunta}»
            <span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>
              {` Lo usa para ${usuario(ultima).proposito}.`}
            </span>
          </Nota>
        )}
      </Escenario>
    </MarcoFigura>
  );
};

/* La capa 4 (excepción de Mai §4, en figurasT1.jsx): la franja lleva el informe, el modelo en su estado final. */
export const FICHA_FRASE_OCHO = deFicha(ID, 16);
const FiguraFrase = figuraFrase(FICHA_FRASE_OCHO, InformeChip);

/* El puente: el informe del paso cuatro, partido en sus dos lados. */
function FiguraPuente() {
  const lado = (titulo, total) => (
    <div style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "rgba(10,20,34,0.5)", border: "1px solid rgba(248,249,250,0.14)", textAlign: "center" }}>
      <p style={{ margin: 0, fontFamily: SORA, fontSize: "12px", fontWeight: 700, color: "#B8C4D4" }}>{titulo}</p>
      <p style={{ margin: "4px 0 0", fontFamily: INTER, fontSize: "14px", fontWeight: 700, color: FAE.text, fontVariantNumeric: "tabular-nums" }}>{pesos(total)}</p>
    </div>
  );
  return (
    <MarcoFigura>
      <Escenario centrado>
        <p style={{ margin: 0, fontFamily: SORA, fontSize: "12px", fontWeight: 700, color: FAE.text, textAlign: "center" }}>Estado de situación financiera</p>
        <div data-dos-lados style={{ display: "flex", gap: "8px" }}>
          {lado("Activos", BALANCE.activos)}
          {lado("Pasivos y Patrimonio", BALANCE.pasivosMasPatrimonio)}
        </div>
      </Escenario>
    </MarcoFigura>
  );
}

export const PIEZA_OCHO_LEEN = {
  id: OCHO_SEC.id,
  altoFigura: { a320: 184, a375: 184 },
  pantallas: [
    { id: "paso-1", tipo: "apertura", ...pick({ ...T.paso1, apoyo: VACIO_CAPA_3 }), Figura: figuraCuatro(T.paso1.personas) },
    { id: "paso-2", tipo: "miralo", ...pick({ ...T.paso2, apoyo: VACIO_CAPA_3 }), Figura: figuraCuatro(T.paso2.personas) },
    {
      id: "frase", tipo: "haz", ...pick({ ...T.frase, apoyo: PREGUNTA_FINAL }), resuelta: paradaResuelta, Figura: FiguraFrase,
    },
    { id: "puente", tipo: "cierre", ...pick(T.puente), Figura: FiguraPuente },
  ],
};
