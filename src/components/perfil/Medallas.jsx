import { useEffect, useState } from "react";
import { FAE } from "../../theme.js";
import Medalla, { NIVELES, ETIQUETA_NIVEL } from "../shared/Medalla.jsx";
import { cargarLogros, conEstado } from "../../medallas/logros.js";

/*
 * Las medallas del perfil, ordenadas por nivel.
 *
 * La sección se diseñó en su día para los cuatro hitos de racha; ahora sostiene
 * las 24, en cuatro bloques. El criterio de siempre no cambia: las que faltan
 * salen atenuadas, nunca escondidas.
 *
 * El bloque de élite va sobre navy oscuro, como en el kit: es lo que lo reserva
 * visualmente para lo de arriba sin necesidad de decirlo.
 */

function Bloque({ nivel, medallas }) {
  const esElite = nivel === "elite";
  const ganadas = medallas.filter((m) => m.obtenida).length;

  return (
    <section
      style={{
        borderRadius: "18px",
        padding: "clamp(14px, 2.2vw, 20px)",
        marginBottom: "12px",
        background: esElite ? "rgba(10,20,34,0.72)" : "rgba(248,249,250,0.035)",
        border: `1px solid ${esElite ? "rgba(42,157,143,0.35)" : "rgba(248,249,250,0.1)"}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "10px", marginBottom: "14px" }}>
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.12em", color: esElite ? FAE.teal : "rgba(248,249,250,0.55)", margin: 0 }}>
          {ETIQUETA_NIVEL[nivel].toUpperCase()}
        </p>
        <span style={{ fontSize: "12px", color: "rgba(248,249,250,0.4)", fontVariantNumeric: "tabular-nums" }}>
          {ganadas} de {medallas.length}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))", gap: "14px" }}>
        {medallas.map((m) => (
          <div key={m.id} style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
              <Medalla nivel={m.nivel} icono={m.icono} numero={m.numero} obtenida={m.obtenida} tamano={72} />
            </div>
            <p
              style={{
                fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, lineHeight: 1.3,
                color: m.obtenida ? FAE.text : "rgba(248,249,250,0.42)", margin: "0 0 3px",
              }}
            >
              {m.titulo}
            </p>
            {/*
              Las que no tienen condición definida lo dicen. Es preferible a
              dejar al estudiante intentando ganar algo que nadie ha decidido
              todavía cómo se gana.
            */}
            <p style={{ fontSize: "10.5px", lineHeight: 1.4, color: m.ganable ? "rgba(248,249,250,0.35)" : FAE.ambar, margin: 0, opacity: m.ganable ? 1 : 0.75 }}>
              {m.ganable ? (m.obtenida ? "Conseguida" : "Por conseguir") : "Aún no disponible"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Medallas() {
  const [estado, setEstado] = useState({ cargando: true, medallas: [], disponible: false });

  useEffect(() => {
    let vivo = true;
    cargarLogros().then(({ ganadas, disponible }) => {
      if (vivo) setEstado({ cargando: false, medallas: conEstado(ganadas), disponible });
    });
    return () => { vivo = false; };
  }, []);

  if (estado.cargando) {
    return <p style={{ fontSize: "13.5px", color: "rgba(248,249,250,0.45)", margin: 0 }}>Cargando medallas…</p>;
  }

  const ganadas = estado.medallas.filter((m) => m.obtenida).length;
  const ganables = estado.medallas.filter((m) => m.ganable).length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "6px" }}>
        <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "16px", margin: 0, color: FAE.text }}>
          Medallas
        </h3>
        <span style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.45)", fontVariantNumeric: "tabular-nums" }}>
          {ganadas} de {ganables} que se pueden ganar hoy
        </span>
      </div>
      <p style={{ fontSize: "12.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.4)", margin: "0 0 14px" }}>
        Las {estado.medallas.length} están diseñadas; {estado.medallas.length - ganables} esperan a que se defina
        su condición y por eso todavía no se pueden conseguir.
      </p>

      {NIVELES.map((n) => (
        <Bloque key={n} nivel={n} medallas={estado.medallas.filter((m) => m.nivel === n)} />
      ))}
    </div>
  );
}
