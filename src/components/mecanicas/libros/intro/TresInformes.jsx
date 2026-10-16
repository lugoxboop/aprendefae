import { FAE } from "../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP } from "../../../../data/contabilidadIntro.js";
import { INFORMES_P4, LINEAS_P4, FLECHAS_P4 } from "../../../../data/contabilidadPiezas234.js";
import { lineaP4, modoDeFlecha } from "../../../../contabilidad/aprenderTema1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS TRES INFORMES Y LAS FLECHAS — la figura de la pieza 4.
 *
 * ═══════════ CERO CIFRAS ═══════════
 *
 * El Gráfico 2.6 escribe «xxxxx» en todas sus líneas: no trae un solo número.
 * Aquí se pintan SOLO los nombres de las líneas. Ni la ficha que viaja ni los
 * extremos que se encienden llevan valor — si algo llevara cifra, estaría
 * inventada.
 *
 * ═══════════ DOS FORMAS DE MARCAR, PORQUE SON DOS COSAS ═══════════
 *
 * Solo una de las cinco repite la misma cifra. Esa lleva una ficha que VIAJA
 * del origen al destino. Las otras cuatro no repiten nada: explican una línea,
 * y sus dos extremos se ENCIENDEN A LA VEZ sin que viaje nada. Una sola
 * animación para las dos cosas afirmaría algo falso en cuatro de cinco casos.
 *
 * ═══════════ EL TRAZO ES MOMENTÁNEO, SALVO AL CERRAR ═══════════
 *
 * Una flecha a la vez mientras se exploran. Las cinco juntas solo al cerrar y
 * en la capa 3 completa, porque ahí la convergencia ES la lección.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";

/* El nodo de un extremo: permanente, discreto y el mismo en los dos lados. */
function Extremo({ encendido }) {
  return (
    <span
      data-extremo
      aria-hidden="true"
      style={{
        flex: "none", width: "8px", height: "8px", borderRadius: "999px",
        background: encendido ? NEUTRO : "transparent",
        border: `1.5px solid ${encendido ? NEUTRO : "rgba(184,196,212,0.55)"}`,
      }}
    />
  );
}

/**
 * activas   ids de flecha que se están enseñando ahora mismo
 * viajando  id de la flecha cuya ficha está viajando, o null
 * resaltar  id de informe a resaltar entero (el que recibe, al cerrar)
 */
export default function TresInformes({
  activas = [], viajando = null, resaltar = null, onTocarFlecha = null, reducido = false,
}) {
  const extremosActivos = new Set();
  for (const id of activas) {
    const f = FLECHAS_P4.find((x) => x.id === id);
    if (f) { extremosActivos.add(f.desde); extremosActivos.add(f.hasta); }
  }
  /* La primera conexión el gráfico la dibuja de bloque a bloque, no de línea
     a línea: cuando está activa, el informe entero se marca como origen. */
  const bloquesActivos = new Set(
    activas.filter((id) => modoDeFlecha(id).deBloque).map((id) => lineaP4(FLECHAS_P4.find((x) => x.id === id).desde).informe),
  );

  return (
    <div data-tres-informes style={{ display: "flex", gap: "7px", alignItems: "stretch" }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        {INFORMES_P4.map((inf) => {
          const comoBloque = bloquesActivos.has(inf.id);
          const resaltado = resaltar === inf.id;
          return (
            <div
              key={inf.id}
              data-informe={inf.id}
              data-resaltado={resaltado ? "si" : undefined}
              data-como-bloque={comoBloque ? "si" : undefined}
              style={{
                padding: "8px 10px", borderRadius: "11px",
                background: resaltado || comoBloque ? "rgba(184,196,212,0.12)" : "rgba(10,20,34,0.3)",
                border: `${resaltado || comoBloque ? 2 : 1}px solid ${resaltado || comoBloque ? NEUTRO : "rgba(248,249,250,0.14)"}`,
                transition: reducido ? "none" : "background 300ms ease, border-color 300ms ease",
              }}
            >
              <p style={{
                margin: "0 0 6px", fontFamily: SORA, fontSize: "12px", fontWeight: 700, color: FAE.text,
              }}>
                {inf.nombre}
                <span style={{ marginLeft: "6px", fontSize: "12px", fontWeight: 500, color: "rgba(248,249,250,0.5)" }}>
                  {inf.corto}
                </span>
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                {LINEAS_P4.filter((l) => l.informe === inf.id).map((l) => {
                  const encendida = extremosActivos.has(l.id);
                  const conFicha = viajando && FLECHAS_P4.find((x) => x.id === viajando)?.hasta === l.id;
                  return (
                    <span
                      key={l.id}
                      data-linea={l.id}
                      data-encendida={encendida ? "si" : undefined}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "4px 6px", borderRadius: "7px",
                        background: encendida ? "rgba(184,196,212,0.14)" : "transparent",
                        fontSize: "12px", lineHeight: 1.3,
                        color: encendida ? FAE.text : "rgba(248,249,250,0.62)",
                        transition: reducido ? "none" : "background 260ms ease, color 260ms ease",
                      }}
                    >
                      <Extremo encendido={encendida} />
                      <span style={{ minWidth: 0 }}>{l.nombre}</span>
                      {conFicha && (
                        <span data-ficha className={reducido ? undefined : "fae-p4-viaja"} style={{
                          marginLeft: "auto", padding: "1px 6px", borderRadius: "6px",
                          background: NEUTRO, color: NAVY_DEL_CHIP,
                          fontFamily: SORA, fontSize: "9px", fontWeight: 700, whiteSpace: "nowrap",
                        }}>
                          la misma
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/*
        Las flechas, por el costado derecho. Se dibujan como trazos verticales
        con su punta: no hay un solo número en ninguna, y cuando se enseñan
        varias a la vez es porque la convergencia es lo que se está enseñando.
      */}
      <div data-costado style={{ flex: "none", width: "34px", position: "relative" }}>
        {FLECHAS_P4.map((f, k) => {
          const activa = activas.includes(f.id);
          const m = modoDeFlecha(f.id);
          const boton = Boolean(onTocarFlecha);
          const Etiqueta = boton ? "button" : "span";
          return (
            <Etiqueta
              key={f.id}
              {...(boton ? { type: "button", onClick: () => onTocarFlecha(f.id), "aria-label": `Flecha ${k + 1}: ${lineaP4(f.desde).nombre} explica ${lineaP4(f.hasta).nombre}` } : {})}
              data-flecha={f.id}
              data-activa={activa ? "si" : "no"}
              data-modo={m.viaja ? "viaja" : "explica"}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "100%", height: `${100 / FLECHAS_P4.length}%`,
                background: "transparent", border: "none", padding: 0,
                cursor: boton ? "pointer" : "default",
                color: activa ? NEUTRO : "rgba(184,196,212,0.35)",
                fontFamily: SORA, fontSize: "15px", fontWeight: 700,
                transition: reducido ? "none" : "color 260ms ease, opacity 260ms ease",
                opacity: activa || activas.length === 0 ? 1 : 0.35,
              }}
            >
              <span aria-hidden="true">↑</span>
            </Etiqueta>
          );
        })}
      </div>
    </div>
  );
}
