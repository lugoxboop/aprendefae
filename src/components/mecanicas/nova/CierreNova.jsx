import { FAE } from "../../../theme.js";
import {
  TITULO_CIERRE, ROTULO_SIN_COMITE, ROTULO_CON_COMITE, TEXTO_CIERRE,
} from "../../../data/nova.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CIERRE — "El año que sí pasó".
 *
 * La pantalla se parte en dos: a la izquierda el año que habría tenido NOVA
 * sin comité, a la derecha el que tuvo con las decisiones que se acaban de
 * tomar. Debajo, el texto de Gen, que es fijo y NO depende del puntaje.
 *
 * ═══════════ SIN TROFEO, SIN CORONA, SIN COFRE, SIN MEDALLA ═══════════
 *
 * Es un prerrequisito del Kit de Calidad, no una preferencia estética: la
 * comparación de los dos años ES la recompensa. Una corona encima diría que lo
 * importante fue ganar y no lo que se ve en las dos columnas. Si alguien añade
 * aquí iconografía de gamificación, está rompiendo el prerrequisito.
 *
 * ═══════════ LO QUE ESTA PANTALLA TODAVÍA NO PUEDE ENSEÑAR ═══════════
 *
 * La ficha pide que las dos columnas terminen en dos utilidades netas y que su
 * diferencia cuente hacia arriba. Para eso hacen falta magnitudes que la ficha
 * no trae —ver la nota larga al final de data/nova.js—, y ponerles cifras
 * inventadas a un caso que los estudiantes estudian para un parcial sería
 * peor que enseñar la comparación sin cifras.
 *
 * Así que hoy las dos columnas comparan DECISIONES, que es información real y
 * verificable: lo que hizo el Gobierno a un lado y lo que hizo el comité al
 * otro. En cuanto lleguen las magnitudes, cada columna cierra con su utilidad
 * neta y la diferencia cuenta: el hueco está acotado a un dato, no al diseño.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
.fae-ncierre { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media (min-width: 620px) { .fae-ncierre { grid-template-columns: 1fr 1fr; } }
`;

function Columna({ rotulo, acento, lineas, aria }) {
  return (
    <div
      data-columna={aria}
      style={{
        borderRadius: "16px", padding: "14px 15px",
        background: "rgba(248,249,250,0.04)",
        border: `1px solid ${acento}44`,
      }}
    >
      <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, lineHeight: 1.35, color: acento, margin: "0 0 10px" }}>
        {rotulo}
      </p>
      <ul style={{ margin: 0, padding: "0 0 0 17px", display: "flex", flexDirection: "column", gap: "7px" }}>
        {lineas.map((t, i) => (
          <li key={i} style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.76)" }}>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * @param {object} p
 * @param {{titulo:string, decisiones:Array}} p.escenario el que le tocó al comité
 * @param {Array<{pregunta:string, texto:string}>} p.elegidas lo que decidió, en orden
 */
export default function CierreNova({ escenario, elegidas = [] }) {
  /*
   * Lo que hizo el Gobierno sale del propio enunciado del escenario: es el
   * texto de Gen, partido por sus numerales. Nada se reescribe.
   */
  const delGobierno = (escenario?.caso ?? "")
    .split(/\(\d\)\s*/)
    .slice(1)
    .map((t) => t.replace(/[;.]\s*$/, "").trim())
    .filter(Boolean);

  return (
    <section data-cierre style={{ marginTop: "4px" }}>
      <style>{CSS}</style>

      <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(19px, 3vw, 24px)", letterSpacing: "-0.02em", color: FAE.text, margin: "0 0 14px", lineHeight: 1.2 }}>
        {TITULO_CIERRE}
      </h3>

      <div className="fae-ncierre">
        <Columna
          aria="sin-comite"
          rotulo={ROTULO_SIN_COMITE}
          acento="rgba(248,249,250,0.45)"
          lineas={delGobierno}
        />
        <Columna
          aria="con-comite"
          rotulo={ROTULO_CON_COMITE}
          acento={FAE.teal}
          lineas={elegidas.map((e) => e.texto)}
        />
      </div>

      <p data-texto-cierre style={{ fontSize: "14px", lineHeight: 1.65, color: "rgba(248,249,250,0.8)", margin: "16px 0 0" }}>
        {TEXTO_CIERRE}
      </p>
    </section>
  );
}
