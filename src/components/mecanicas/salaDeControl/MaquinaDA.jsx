import { useState } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { FAE } from "../../../theme.js";
import {
  TERMINOS_DA, RAMAS, POSICIONES, APOYO,
} from "../../../data/politicaEconomica.js";
import { useEnPantalla } from "../../../utils/enPantalla.js";
import { CSS_SALA, Panel, Piloto, Grabado } from "./marco.jsx";

/*
 * PIEZA 3 — "La máquina de la Demanda Agregada y sus palancas".
 *
 * Material teórico: exploración libre, cualquier palanca en cualquier orden y
 * las veces que se quiera. Sin preguntas, sin término, sin FP.
 *
 * ═════════════ UN NIVEL POR ENCIMA DE T1, Y TIENE QUE VERSE ═════════════
 *
 * T1 —"El corazón de la economía"— deja manipular las sub-variables de DENTRO
 * de cada componente: C̄, t, c, TR, Ī, i, b, tc. Son los CAPILARES que llenan
 * cada arteria. Aquí las palancas son las RAMAS DE LA POLÍTICA ECONÓMICA, que
 * actúan sobre esos componentes. Misma máquina, otro nivel de mando.
 *
 * Decirlo en un rótulo no basta: tiene que percibirse. Tres decisiones lo
 * sostienen, y las tres son deliberadas:
 *
 *   1. EL DEPÓSITO ES VERTICAL Y DE NIVEL. La cámara de T1 es una tira
 *      horizontal de bandas que reparte la DA. Aquí el depósito SUBE y BAJA.
 *      Repartir y llenar son dos gestos distintos, y esa diferencia sola separa
 *      las dos pantallas de un vistazo.
 *
 *   2. EL NIVEL DE ABAJO SE VE, APAGADO. Bajo cada término aparecen en pequeño
 *      las sub-variables que T1 sí deja tocar, en gris y sin control. Así el
 *      "un nivel por encima" se ve —hay una capa debajo y desde aquí no se
 *      toca— en vez de leerse.
 *
 *   3. PALANCAS VERTICALES CON TOPE, NO SLIDERS. T1 usa deslizadores
 *      horizontales continuos. Aquí hay tres posiciones con tope. Otro gesto,
 *      otra pantalla — y además tres posiciones no invitan a leer una magnitud
 *      que no existe.
 *
 * ═════════════ LA REGLA DE NO INVENCIÓN, AQUÍ ═════════════
 *
 * Ni un multiplicador, ni un porcentaje, ni un "+2,3% de DA". La palanca
 * enciende su término y mueve el nivel del depósito: dirección y lugar de
 * efecto, nunca magnitud. Cada rama pesa lo mismo sobre el depósito a
 * propósito, porque decir que una pesa más que otra sería inventarse una
 * elasticidad. Eso se dice en pantalla, no se deja suponer.
 */

/* Colores de estado del depósito. Verde de marca para el nivel. */
const NEUTRO = "rgba(203,220,242,0.55)";

const CSS = `
${CSS_SALA}
@keyframes fae-mq-flujo {
  to { stroke-dashoffset: -26; }
}
.fae-mq-flujo { stroke-dasharray: 5 8; animation: fae-mq-flujo 1.1s linear infinite; }
@keyframes fae-mq-brillo {
  0%, 100% { opacity: .55; }
  50%      { opacity: 1; }
}
.fae-mq-brillo { animation: fae-mq-brillo 2.4s ease-in-out infinite; }
@keyframes fae-mq-transversal {
  0%, 100% { opacity: .12; }
  50%      { opacity: .3; }
}
.fae-mq-transversal { animation: fae-mq-transversal 3.2s ease-in-out infinite; }
/*
 * EN MÓVIL LA MÁQUINA SE APILA Y EL DEPÓSITO NO SE ESTIRA.
 *
 * Con la fórmula en una sola columna, un depósito con flex:1 crecía hasta más
 * de 500 px: un tubo finísimo de la altura de la pantalla. Aquí pasa a ser una
 * fila propia debajo, con altura fija y el rótulo al lado.
 *
 * Sigue siendo VERTICAL a propósito. Tumbarlo lo convertiría en una barra
 * horizontal, que es justo la forma que usa T1 y de la que esta pieza tiene
 * que distinguirse.
 */
@media (max-width: 560px) {
  .fae-mq-maquina { grid-template-columns: minmax(0, 1fr) !important; }
  .fae-mq-deposito { flex-direction: row !important; align-items: center; gap: 12px; }
  .fae-mq-tubo { flex: none !important; height: 150px; }
  .fae-mq-deposito > p { margin-bottom: 0 !important; }
}
@media (prefers-reduced-motion: reduce) {
  .fae-mq-flujo, .fae-mq-brillo, .fae-mq-transversal { animation: none !important; }
}
`;

/* ------------------------------ una palanca ------------------------------ */

/*
 * Recorrido corto y vertical, con tres topes. Se acciona tocando la posición o
 * con las flechas del teclado, que es lo que la hace utilizable sin ratón.
 */
function Palanca({ rama, posicion, onCambiar }) {
  const indice = POSICIONES.findIndex((p) => p.id === posicion);
  const activa = posicion !== "neutral";

  const mover = (delta) => {
    const siguiente = Math.max(0, Math.min(POSICIONES.length - 1, indice + delta));
    onCambiar(POSICIONES[siguiente].id);
  };

  return (
    <div
      style={{
        display: "flex", gap: "13px", padding: "13px 14px", borderRadius: "16px",
        background: activa ? `${rama.color}14` : "rgba(248,249,250,0.035)",
        border: `1px solid ${activa ? rama.color : "rgba(248,249,250,0.13)"}`,
        transition: "background 300ms ease, border-color 300ms ease",
      }}
    >
      {/* El carril con sus tres topes. */}
      <div
        role="group"
        aria-label={`${rama.nombre}: posición de la palanca`}
        style={{ display: "flex", flexDirection: "column", gap: "3px", flexShrink: 0, width: "40px" }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") { e.preventDefault(); mover(-1); }
          if (e.key === "ArrowDown") { e.preventDefault(); mover(1); }
        }}
      >
        {POSICIONES.map((p) => {
          const puesta = p.id === posicion;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onCambiar(p.id)}
              aria-pressed={puesta}
              aria-label={`${rama.nombre}: ${p.etiqueta}`}
              title={p.etiqueta}
              style={{
                height: "26px", borderRadius: "7px", cursor: "pointer",
                display: "grid", placeItems: "center",
                background: puesta ? rama.color : "rgba(248,249,250,0.06)",
                border: `1px solid ${puesta ? rama.color : "rgba(248,249,250,0.14)"}`,
                color: puesta ? "#08111d" : "rgba(248,249,250,0.4)",
                fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700, lineHeight: 1,
                transition: "background 220ms ease",
              }}
            >
              {p.signo > 0 ? "▲" : p.signo < 0 ? "▼" : "—"}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 700, color: FAE.text, margin: "0 0 4px", lineHeight: 1.3 }}>
          {rama.nombre}
        </p>
        {/*
          El color de la rama nunca va solo: al lado va escrito sobre qué
          término actúa y en qué posición está.
        */}
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.06em", color: rama.color, margin: "0 0 6px" }}>
          ACTÚA SOBRE {rama.terminos.join(" y ")} · {POSICIONES[indice].etiqueta.toUpperCase()}
        </p>
        <p style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.6)", margin: 0 }}>
          {rama.definicion}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ la máquina ------------------------------ */

export default function MaquinaDA() {
  const [ramas, setRamas] = useState({ fiscal: "neutral", monetaria: "neutral", cambiaria: "neutral" });
  const [apoyo, setApoyo] = useState({});
  const [cajonAbierto, setCajonAbierto] = useState(false);
  const [ref, enPantalla] = useEnPantalla();

  const signoDe = (ramaId) => POSICIONES.find((p) => p.id === ramas[ramaId])?.signo ?? 0;

  /* Qué rama toca cada término, y en qué dirección lo está empujando. */
  const estadoTermino = (id) => {
    const rama = RAMAS.find((r) => r.terminos.includes(id));
    return { rama, signo: rama ? signoDe(rama.id) : 0 };
  };

  /*
   * El nivel del depósito. Cada rama pesa lo mismo: decir que una pesa más que
   * otra sería inventarse una elasticidad que el material no da. Sin número en
   * pantalla — es altura, no medida.
   */
  const empuje = RAMAS.reduce((s, r) => s + signoDe(r.id), 0);
  const nivel = 50 + empuje * 13;
  const hayApoyo = Object.values(apoyo).some(Boolean);
  const algoMovido = empuje !== 0 || Object.values(ramas).some((p) => p !== "neutral") || hayApoyo;

  const reiniciar = () => {
    setRamas({ fiscal: "neutral", monetaria: "neutral", cambiaria: "neutral" });
    setApoyo({});
  };

  return (
    <div ref={ref}>
      <style>{CSS}</style>

      <Panel
        rotulo="PANEL 3 · LOS MANDOS"
        titulo="La máquina de la Demanda Agregada y sus palancas"
        acento={FAE.teal}
        style={{ marginBottom: "16px" }}
      >
        <p style={{ fontSize: "14px", lineHeight: 1.62, color: "rgba(248,249,250,0.72)", margin: "0 0 12px" }}>
          Esta es la misma máquina de «El corazón de la economía», operada un nivel más arriba.
          Allí se movían las piezas de dentro de cada componente; aquí las palancas son las <strong>ramas
          de la política económica</strong>, que actúan sobre esos componentes.
        </p>
        {/*
          La advertencia de magnitud, en pantalla y no escondida en un comentario.
          Es la parte de la regla de no invención que el estudiante tiene que ver.
        */}
        <p style={{ fontSize: "12.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.45)", margin: 0 }}>
          El tamaño del movimiento no está a escala. Lo que se muestra es la dirección y dónde actúa cada
          rama, no cuánto: eso depende de datos que este material no fija.
        </p>
      </Panel>

      {/* ═══════════════════════ la máquina ═══════════════════════ */}
      <div
        className="fae-sc-rejilla fae-mq-maquina"
        style={{
          position: "relative", overflow: "hidden",
          display: "grid", gridTemplateColumns: "minmax(0, 1fr) 92px", gap: "14px",
          padding: "clamp(13px, 2vw, 18px)", borderRadius: "20px",
          background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.1)",
        }}
      >
        {/*
          La banda transversal de las palancas de apoyo. Cruza la máquina ENTERA
          por detrás en vez de entrar en un término: es la forma de decir "estas
          actúan de otra manera" sin escribirlo.
        */}
        {hayApoyo && (
          <div
            aria-hidden="true"
            className={enPantalla ? "fae-mq-transversal" : undefined}
            style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: `repeating-linear-gradient(115deg, ${FAE.ambar}00 0 14px, ${FAE.ambar} 14px 16px)`,
              opacity: 0.16,
            }}
          />
        )}

        {/* ---------------------------- la fórmula ---------------------------- */}
        <div style={{ position: "relative" }}>
          <Grabado style={{ marginBottom: "10px" }}>DA = C + I + G + XN</Grabado>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {TERMINOS_DA.map((t, i) => {
              const { rama, signo } = estadoTermino(t.id);
              const encendido = signo !== 0;
              const color = encendido ? rama.color : NEUTRO;
              return (
                <div key={t.id} style={{ display: "flex", alignItems: "stretch", gap: "8px", flex: "1 1 120px" }}>
                  <div
                    style={{
                      flex: 1, minWidth: 0, padding: "11px 12px", borderRadius: "14px",
                      background: encendido ? `${rama.color}1f` : "rgba(248,249,250,0.03)",
                      border: `1px solid ${encendido ? rama.color : "rgba(248,249,250,0.12)"}`,
                      transition: "background 340ms ease, border-color 340ms ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "6px" }}>
                      <span
                        className={encendido && enPantalla ? "fae-mq-brillo" : undefined}
                        style={{ fontFamily: "Sora, sans-serif", fontSize: "20px", fontWeight: 700, color, lineHeight: 1 }}
                      >
                        {t.id}
                      </span>
                      {/* La dirección, escrita además de en color. */}
                      {encendido && (
                        <span style={{ fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700, color }}>
                          {signo > 0 ? "sube" : "baja"}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "11.5px", color: "rgba(248,249,250,0.6)", margin: "5px 0 0", lineHeight: 1.35 }}>
                      {t.nombre}
                    </p>

                    {/*
                      El nivel de abajo: lo que T1 sí deja tocar, aquí apagado y
                      sin control. Que C tenga cinco piezas y G una sola es la
                      asimetría que T1 enseña; borrarla aquí la desmentiría.
                    */}
                    <div style={{ marginTop: "9px", paddingTop: "8px", borderTop: "1px dashed rgba(248,249,250,0.14)" }}>
                    <p style={{ margin: "0 0 5px", fontFamily: "Sora, sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.16em", color: "rgba(248,249,250,0.28)" }}>
                      CAPILARES
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {t.subvariables.map((s) => (
                        <span
                          key={s}
                          style={{
                            padding: "2px 6px", borderRadius: "5px", fontSize: "10.5px",
                            fontFamily: "Sora, sans-serif", fontWeight: 600,
                            background: "rgba(248,249,250,0.05)", color: "rgba(248,249,250,0.32)",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    </div>
                  </div>

                  {i < TERMINOS_DA.length - 1 && (
                    <span aria-hidden="true" style={{ alignSelf: "center", color: "rgba(248,249,250,0.3)", fontFamily: "Sora, sans-serif", fontSize: "17px", fontWeight: 700 }}>
                      +
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: "11.5px", color: "rgba(248,249,250,0.35)", margin: "10px 0 0", lineHeight: 1.45 }}>
            Los capilares grises de cada término son las piezas que se manipulan en «El corazón de la
            economía». Desde este panel no se tocan: aquí se opera un nivel más arriba.
          </p>
        </div>

        {/* --------------------------- el depósito --------------------------- */}
        <div className="fae-mq-deposito" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Grabado style={{ marginBottom: "8px", textAlign: "center" }}>DA</Grabado>
          <div
            className="fae-mq-tubo"
            style={{
              position: "relative", flex: 1, width: "44px", minHeight: "160px",
              borderRadius: "10px", background: "rgba(248,249,250,0.05)",
              border: "1px solid rgba(248,249,250,0.16)", overflow: "hidden",
              display: "flex", alignItems: "flex-end",
            }}
            role="img"
            aria-label={`Demanda agregada: ${empuje > 0 ? "por encima" : empuje < 0 ? "por debajo" : "en"} su nivel de partida`}
          >
            {/* La marca del nivel de partida, para que el movimiento tenga contra qué leerse. */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute", left: 0, right: 0, bottom: "50%", height: "1px",
                background: "rgba(248,249,250,0.35)", zIndex: 2,
              }}
            />
            <div
              style={{
                width: "100%", height: `${nivel}%`,
                background:
                  empuje > 0
                    ? `linear-gradient(to top, ${FAE.teal}, ${FAE.teal}aa)`
                    : empuje < 0
                      ? `linear-gradient(to top, ${FAE.coral}, ${FAE.coral}aa)`
                      : `linear-gradient(to top, ${NEUTRO}, rgba(203,220,242,0.35))`,
                transition: "height 900ms cubic-bezier(.4,0,.2,1), background 500ms ease",
              }}
            />
          </div>
          <span style={{ marginTop: "7px", fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, textAlign: "center", lineHeight: 1.3, color: empuje > 0 ? FAE.teal : empuje < 0 ? FAE.coral : "rgba(248,249,250,0.5)" }}>
            {empuje > 0 ? "Sube" : empuje < 0 ? "Baja" : "En reposo"}
          </span>
        </div>
      </div>

      {/* ═══════════════════════ las tres ramas ═══════════════════════ */}
      <div style={{ marginTop: "16px" }}>
        <Grabado style={{ marginBottom: "10px" }}>LAS TRES RAMAS · CADA UNA TOCA LA MÁQUINA POR OTRO SITIO</Grabado>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(258px, 1fr))", gap: "10px" }}>
          {RAMAS.map((r) => (
            <Palanca
              key={r.id}
              rama={r}
              posicion={ramas[r.id]}
              onCambiar={(p) => setRamas((s) => ({ ...s, [r.id]: p }))}
            />
          ))}
        </div>
      </div>

      {/* ═══════════════════ el cajón de las palancas de apoyo ═══════════════════ */}
      {/*
        Compartimento aparte, y la separación es contenido. No hay conducto a la
        fórmula porque estas no entran por un término: cruzan la máquina entera.
        Por eso además el control es otro —interruptores, no palancas de tres
        posiciones— y el depósito no se mueve con ellas.
      */}
      <div style={{ marginTop: "26px", paddingTop: "20px", borderTop: "1px dashed rgba(248,249,250,0.2)" }}>
        <button
          type="button"
          onClick={() => setCajonAbierto(!cajonAbierto)}
          aria-expanded={cajonAbierto}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: "11px",
            padding: "13px 15px", borderRadius: "15px", cursor: "pointer", textAlign: "left",
            background: hayApoyo ? "rgba(233,196,106,0.09)" : "rgba(248,249,250,0.03)",
            border: `1px dashed ${hayApoyo ? FAE.ambar : "rgba(248,249,250,0.24)"}`,
            color: FAE.text, fontFamily: "Inter, sans-serif",
          }}
        >
          <ChevronDown
            size={17}
            color={FAE.ambar}
            style={{ flexShrink: 0, transform: cajonAbierto ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 260ms ease" }}
          />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 700, marginBottom: "3px" }}>
              Palancas de apoyo
            </span>
            <span style={{ display: "block", fontSize: "12.5px", color: "rgba(248,249,250,0.6)", lineHeight: 1.45 }}>
              No entran por un término de la fórmula: actúan de forma transversal sobre toda la máquina.
            </span>
          </span>
          {hayApoyo && <Piloto color={FAE.ambar} texto="Activas" late={enPantalla} tamano={7} />}
        </button>

        {cajonAbierto && (
          <div className="fae-sc-entrar" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px", marginTop: "10px" }}>
            {APOYO.map((a) => {
              const puesta = !!apoyo[a.id];
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setApoyo((s) => ({ ...s, [a.id]: !s[a.id] }))}
                  aria-pressed={puesta}
                  style={{
                    textAlign: "left", cursor: "pointer", padding: "13px 14px", borderRadius: "15px",
                    background: puesta ? "rgba(233,196,106,0.12)" : "rgba(248,249,250,0.03)",
                    border: `1px dashed ${puesta ? FAE.ambar : "rgba(248,249,250,0.18)"}`,
                    color: FAE.text, fontFamily: "Inter, sans-serif",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: a.ramas.length ? "9px" : 0 }}>
                    {/* Interruptor, no palanca de tres posiciones: otro gesto, otra clase de instrumento. */}
                    <span
                      aria-hidden="true"
                      style={{
                        position: "relative", width: "34px", height: "19px", flexShrink: 0, borderRadius: "999px",
                        background: puesta ? `${FAE.ambar}55` : "rgba(248,249,250,0.09)",
                        border: `1px solid ${puesta ? FAE.ambar : "rgba(248,249,250,0.24)"}`,
                        transition: "background 260ms ease",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute", top: "2px", left: puesta ? "17px" : "2px",
                          width: "13px", height: "13px", borderRadius: "999px",
                          background: puesta ? FAE.ambar : "rgba(248,249,250,0.5)",
                          transition: "left 260ms cubic-bezier(.4,0,.2,1), background 260ms ease",
                        }}
                      />
                    </span>
                    <span style={{ fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 700 }}>
                      {a.nombre}
                    </span>
                  </span>

                  {a.ramas.length > 0 && (
                    <span style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {a.ramas.map((r) => (
                        <span
                          key={r}
                          style={{
                            padding: "4px 9px", borderRadius: "999px", fontSize: "11.5px",
                            background: "rgba(248,249,250,0.05)",
                            border: "1px solid rgba(248,249,250,0.12)",
                            color: "rgba(248,249,250,0.7)",
                          }}
                        >
                          {r}
                        </span>
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {hayApoyo && (
          <p className="fae-sc-entrar" style={{ fontSize: "12.5px", lineHeight: 1.55, color: FAE.ambar, margin: "12px 0 0" }}>
            Fíjate en que el depósito no se movió. Estas palancas cruzan la máquina entera —se ve en la
            trama de fondo— y el material no fija por qué término entran ni cuánto pesan.
          </p>
        )}
      </div>

      {algoMovido && (
        <button
          type="button"
          onClick={reiniciar}
          style={{
            marginTop: "18px", display: "inline-flex", alignItems: "center", gap: "8px",
            fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
            padding: "10px 16px", borderRadius: "999px", cursor: "pointer",
            background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
            color: "rgba(248,249,250,0.7)",
          }}
        >
          <RotateCcw size={14} /> Todo a reposo
        </button>
      )}
    </div>
  );
}
