import { ChevronRight } from "lucide-react";
import { FAE } from "../../theme.js";
import { NIVEL } from "../../docente/alertas.js";
import { PALABRA_RIESGO } from "../../docente/panelV1.js";
import MarcaNivel, { NIVEL_MARCA } from "./MarcaNivel.jsx";
import { V1, tarjetaV1, tituloBloque, notaV1, enlaceV1 } from "./estiloV1.js";

/*
 * B2 · «Necesitan atención» (Ukyo §4): ¿a quién miro? Como mucho tres filas,
 * una por estudiante, con su nivel en palabra y en forma (▲ Alto, ◆ Medio,
 * ● Bajo) y el motivo en seis palabras o menos. Sin coral (P6): el nivel alto
 * lo carga la forma, en blanco; el ámbar es el punto medio de la escala.
 *
 * Al pie, «Ver los N» (el panel completo de alertas, con lo que no se mide) y
 * la línea de Destacados, que dejó de ser un bloque propio.
 */

export const TOPE_ATENCION = 3;

const MARCA = { [NIVEL.URGENTE]: NIVEL_MARCA.URGENTE, [NIVEL.ATENCION]: NIVEL_MARCA.ATENCION, [NIVEL.INFO]: NIVEL_MARCA.INFO };
const COLOR = { [NIVEL.URGENTE]: FAE.text, [NIVEL.ATENCION]: FAE.ambar, [NIVEL.INFO]: V1.tealTexto };

export function FilaAtencion({ a, onAbrir }) {
  const e = a.estudiante;
  const nombre = e.full_name || e.nickname;
  return (
    <button
      type="button"
      onClick={() => onAbrir(e.user_id)}
      data-atencion={e.user_id}
      data-nivel={a.nivel}
      aria-label={`${nombre}. Riesgo ${PALABRA_RIESGO[a.nivel].toLowerCase()}: ${a.motivo}. Ver detalle`}
      title={nombre}
      style={{
        display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", alignItems: "center", gap: "10px",
        width: "100%", minHeight: "56px", padding: "8px 10px", borderRadius: "10px", textAlign: "left",
        background: "rgba(248,249,250,0.03)", border: V1.borde, color: "inherit", cursor: "pointer", font: "inherit",
      }}
    >
      <span style={{ display: "grid", justifyItems: "center", gap: "2px", minWidth: "44px" }}>
        <MarcaNivel nivel={MARCA[a.nivel]} tamano={14} />
        <span style={{ fontSize: "12px", fontWeight: 600, color: COLOR[a.nivel] }}>{PALABRA_RIESGO[a.nivel]}</span>
      </span>
      <span style={{ display: "grid", minWidth: 0 }}>
        <span className="pd1-nombre" style={{ fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600, color: FAE.text }}>{nombre}</span>
        <span className="pd1-dos" style={{ fontSize: "13px", lineHeight: 1.35, color: V1.texto2 }} data-motivo>{a.motivo}</span>
      </span>
      <ChevronRight size={18} aria-hidden="true" color={V1.texto2} />
    </button>
  );
}

export default function AtencionAhora({ atencion, nDestacados, singular, onVerTodos, onAbrir }) {
  const visibles = atencion.slice(0, TOPE_ATENCION);
  return (
    <section className="pd1-entrar" style={{ ...tarjetaV1, animationDelay: "80ms" }} data-bloque="b2" aria-labelledby="pd1-b2">
      <h2 id="pd1-b2" style={tituloBloque}>Necesitan atención</h2>
      {visibles.length > 0 ? (
        <div style={{ display: "grid", gap: "8px" }}>
          {visibles.map((a) => <FilaAtencion key={a.estudiante.user_id} a={a} onAbrir={onAbrir} />)}
        </div>
      ) : (
        /* Sin ícono de riesgo (decisión de Yujiro): ● Bajo es siempre un aviso, nunca «todo bien». */
        <p style={{ ...notaV1, color: FAE.text }} data-nadie>
          {singular ? "Tu estudiante no necesita atención hoy" : "Nadie necesita atención hoy"}
        </p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0 16px", marginTop: "4px" }}>
        <button type="button" style={enlaceV1} onClick={onVerTodos} data-ver-atencion>
          {atencion.length > TOPE_ATENCION ? `Ver los ${atencion.length}` : "Ver todas las alertas"}
        </button>
        {/* Destacados, en una línea (Ukyo §4): sin número, para no sumar cifras a la primera pantalla (P5). */}
        {nDestacados > 0 && (
          <button type="button" style={enlaceV1} onClick={onVerTodos} data-ver-destacados>
            Ver quiénes van muy bien
          </button>
        )}
      </div>
    </section>
  );
}
