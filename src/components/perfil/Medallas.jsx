import { useEffect, useState } from "react";
import { FAE } from "../../theme.js";
import { cargarMedallas, RAREZAS } from "../../medallas/medallas.js";

/*
 * Rejilla de medallas del perfil.
 *
 * Las no ganadas se ven apagadas, nunca escondidas: saber qué falta es la mitad
 * de para qué sirven. Cuando la medalla tiene meta se muestra el avance, así la
 * apagada dice "vas 2 de 3" en vez de solo "no la tienes".
 *
 * Las formas son geométricas y del kit: nada de trofeos, coronas ni cintas.
 */

const COLOR_RAREZA = {
  "baja-media": "rgba(248,249,250,0.55)",
  media: FAE.teal,
  alta: FAE.ambar,
  "muy-alta": FAE.coral,
};

/* Marca de rareza: un rombo, la misma familia de formas que las válvulas. */
function Marca({ rareza, apagada }) {
  const color = apagada ? "rgba(248,249,250,0.22)" : COLOR_RAREZA[rareza] ?? FAE.teal;
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <polygon points="12,2 22,12 12,22 2,12" fill="none" stroke={color} strokeWidth="1.8" />
      {!apagada && <polygon points="12,7 17,12 12,17 7,12" fill={color} />}
    </svg>
  );
}

function Medalla({ m }) {
  const apagada = !m.obtenida;
  const conMeta = m.meta > 0 && !m.obtenida;

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "13px 14px",
        borderRadius: "14px",
        background: apagada ? "rgba(248,249,250,0.03)" : "rgba(248,249,250,0.06)",
        border: `1px solid ${apagada ? "rgba(248,249,250,0.08)" : "rgba(248,249,250,0.16)"}`,
      }}
    >
      <Marca rareza={m.rareza} apagada={apagada} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <p
          style={{
            fontFamily: "Sora, sans-serif",
            fontWeight: 700,
            fontSize: "13.5px",
            margin: "0 0 3px",
            color: apagada ? "rgba(248,249,250,0.45)" : FAE.text,
          }}
        >
          {m.titulo}
        </p>
        <p style={{ fontSize: "12px", lineHeight: 1.5, margin: 0, color: apagada ? "rgba(248,249,250,0.32)" : "rgba(248,249,250,0.6)" }}>
          {m.descripcion}
        </p>

        {conMeta && (
          <div style={{ marginTop: "8px" }}>
            <div style={{ height: "4px", borderRadius: "999px", background: "rgba(248,249,250,0.1)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(100, (m.progreso / m.meta) * 100)}%`,
                  height: "100%",
                  background: COLOR_RAREZA[m.rareza] ?? FAE.teal,
                  opacity: 0.6,
                  borderRadius: "999px",
                }}
              />
            </div>
            <p style={{ fontSize: "11px", color: "rgba(248,249,250,0.4)", margin: "5px 0 0", fontVariantNumeric: "tabular-nums" }}>
              {m.progreso} de {m.meta}
            </p>
          </div>
        )}

        {m.obtenida && (
          <p style={{ fontSize: "11px", color: COLOR_RAREZA[m.rareza] ?? FAE.teal, margin: "7px 0 0", fontWeight: 600 }}>
            Rareza {RAREZAS[m.rareza]?.etiqueta ?? m.rareza}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Medallas() {
  const [estado, setEstado] = useState({ cargando: true, medallas: [], error: null });

  useEffect(() => {
    let vivo = true;
    cargarMedallas().then((r) => {
      if (vivo) setEstado({ cargando: false, medallas: r.medallas, error: r.error });
    });
    return () => { vivo = false; };
  }, []);

  if (estado.cargando) {
    return <p style={{ fontSize: "13.5px", color: "rgba(248,249,250,0.45)", margin: 0 }}>Cargando medallas…</p>;
  }
  if (estado.error) {
    return <p style={{ fontSize: "13.5px", color: FAE.coral, margin: 0 }}>No se pudieron cargar las medallas.</p>;
  }

  const ganadas = estado.medallas.filter((m) => m.obtenida).length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
        <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "16px", margin: 0, color: FAE.text }}>
          Medallas
        </h3>
        <span style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.45)", fontVariantNumeric: "tabular-nums" }}>
          {ganadas} de {estado.medallas.length}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "10px" }}>
        {estado.medallas.map((m) => (
          <Medalla key={m.codigo} m={m} />
        ))}
      </div>
    </div>
  );
}
