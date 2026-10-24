import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { ESTACIONES, NEUTRO, NAVY_DEL_CHIP } from "../../../../data/contabilidadIntro.js";
import {
  T1_1, ZONA_DENTRO, ZONA_FUERA, ROTULO_ZONA, ALT_T1_1, ALT_ANILLO_T1_1, ROTULO_FICHA_T1_1, SEGUNDA_T1_1,
} from "../../../../data/contabilidadTema1.js";
import {
  sortearT1_1, evaluarT1_1, puntuar, pesoDeCadaItem, sinEmoji,
  opcionesSegundaT1_1, correctaSegundaT1_1, porqueSegundaT1_1,
} from "../../../../contabilidad/tema1.js";
import { Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { useTanda } from "../piezas.jsx";
import { useMovimientoReducido, SOLO_LECTOR } from "../verbos.jsx";
import EncabezadoCompacto from "../b5/EncabezadoCompacto.jsx";
import {
  Pastilla, Mensaje, RegionViva, IconoCheck, IconoX, CORRECTA, TACHADA, REVELADA, CSS_B5H, CLASE_B5H,
} from "../b5/Devolucion.jsx";
import {
  SORA, INTER, SECUNDARIO, RIEL, REPOSO, ACIERTO, FANTASMA, estiloC2, contadorDe, Avance,
  CSS_REGISTRO, CLASE_ENTRA, CURVA,
} from "./registro.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-1 · ¿DESDE DÓNDE PREGUNTAN? — el anillo en fila, con la vuelta (P2 de
 * Mai, 23-oct; ajustes del 24-oct, §6; segunda decisión de Futaba, lote B §2,
 * con los rótulos de Shoko, lote C §1).
 *
 * Arriba, las cinco estaciones en fila sobre su riel, y encima la vuelta del
 * ciclo (del 5 al 1), tenue. Debajo, la franja del ciclo y, pegada a ella, la
 * zona «Adentro»; después de un blanco, «Afuera». Se distinguen por posición
 * y por palabra, no por color: si cada una tuviera su tono, la clasificación
 * estaría regalada.
 *
 * ═══════════ DOS SEÑALES QUE NO SIGNIFICAN LO MISMO ═══════════
 *
 * La zona dice si PERTENECE a la empresa. La vuelta dice si su decisión
 * CAMBIA lo que la empresa hace: solo los administradores. Un propietario
 * está adentro y no enciende la vuelta, y eso es lo que la pieza enseña.
 *
 * ═══════════ UN INTENTO, Y EL REGISTRO ═══════════
 *
 * Tocar una zona es responder. Se acierte o no, la ficha «la pregunta» entra
 * a su zona CORRECTA, y la vuelta se enciende si quien pregunta decide; la
 * zona tocada por error queda con el fantasma coral. R10: antes de responder,
 * nada encendido y la vuelta tenue.
 *
 * ═══════════ LA SEGUNDA DECISIÓN: QUÉ TIENE EN JUEGO ═══════════
 *
 * Cuatro opciones en una rejilla de 2×2, con su sitio reservado desde el
 * principio. No se deduce de la primera (cruza adentro y afuera) y no repite
 * a H2. Al elegir, lo que se juega queda escrito en la ficha. No puntúa.
 *
 * El veredicto lo pinta esta pieza (lucide, sin emoji); `Retro` y `Responder`
 * son compartidos y no se usan (#487).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* El sitio de la ficha en cada zona: medido a 320 con «la pregunta · algo que piensa hacer» (PR del lote 4). */
export const ALTO_FICHA = 40;

const CSS = `
.fae-t11-vuelta { transition: stroke 240ms ${CURVA}, stroke-width 240ms ${CURVA}, opacity 240ms ${CURVA}; }
@media (prefers-reduced-motion: reduce) { .fae-t11-vuelta { transition: none !important; } }
`;

/* La fila de estaciones con la vuelta encima. `vuelta`: tenue o encendida. */
function AnilloEnFila({ vuelta, alt }) {
  const n = ESTACIONES.length;
  /* Centros de los puntos en %, uno por columna. */
  const x = (i) => ((i + 0.5) / n) * 100;
  const encendida = vuelta === "encendida";
  return (
    <div data-anillo data-vuelta={vuelta} role="img" aria-label={alt}>
      {/* La vuelta: un arco del punto 5 al 1, por encima del riel. */}
      <svg data-vuelta-dibujo viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true" style={{ display: "block", width: "100%", height: "20px" }}>
        <path
          className="fae-t11-vuelta"
          d={`M ${x(n - 1)} 19 C ${x(n - 1)} 1, ${x(0)} 1, ${x(0)} 19`}
          fill="none"
          stroke={encendida ? FAE.text : "rgba(248,249,250,0.25)"}
          strokeWidth={encendida ? 2 : 1.5}
          strokeDasharray={encendida ? "none" : "4 4"}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div style={{ position: "relative" }}>
        {/* El riel, de centro a centro. */}
        <span aria-hidden="true" style={{
          position: "absolute", top: "7px", left: `${x(0)}%`, right: `${100 - x(n - 1)}%`, height: "2px", background: RIEL,
        }} />
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gap: "2px" }}>
          {ESTACIONES.map((e) => (
            <div key={e.n} data-estacion={e.n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", minWidth: 0 }}>
              <span aria-hidden="true" style={{
                position: "relative", width: "16px", height: "16px", borderRadius: "999px", boxSizing: "border-box",
                background: FAE.bg, border: `2px solid ${RIEL}`,
              }} />
              <span data-nombre-estacion style={{
                fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: 1.25, color: SECUNDARIO,
                textAlign: "center", overflowWrap: "normal", hyphens: "manual",
              }}>
                {e.nombre}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* La ficha que entra a su zona: «la pregunta», y lo que se juega cuando ya se eligió. */
function Ficha({ enJuego }) {
  return (
    <span data-ficha-pregunta className={CLASE_ENTRA} style={{
      display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: "2px 6px",
      padding: "3px 8px", borderRadius: "7px", background: NEUTRO, color: NAVY_DEL_CHIP,
      fontFamily: SORA, fontSize: "12px", fontWeight: 700, lineHeight: "16px",
    }}>
      {ROTULO_FICHA_T1_1}
      {enJuego && <span data-en-juego={enJuego.id} style={{ fontWeight: 600 }}>· {enJuego.texto.toLowerCase()}</span>}
    </span>
  );
}

/*
 * ═══════════ EL MODO DEMO DE «ASÍ SE JUEGA» ═══════════
 *
 * Es este mismo componente: `items` le da el ejemplo desde afuera y `modoDemo`
 * le quita el encabezado, la segunda decisión y el avance, y no llama a
 * `onCompletar`.
 */
export default function DesdeDondePreguntan({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false,
}) {
  useMovimientoReducido();
  const t = useTanda(() => items ?? sortearT1_1(barajar));

  const [r, setR] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [tocada, setTocada] = useState(null);
  const [segunda, setSegunda] = useState(null);
  const [colocadas, setColocadas] = useState([]);
  const zonaBoton = useRef(null);

  const u = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuar(respuestas, cuantas);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  useEffect(() => {
    if (r && !modoDemo && segunda) zonaBoton.current?.focus();
  }, [r, segunda]);

  /* La decisión 1: un intento. */
  const responder = (zona) => {
    if (r) return;
    const nuevo = evaluarT1_1(u, zona);
    t.anotar(u.id, nuevo.ok, nuevo.ok ? null : zona);
    setRespuestas((xs) => [...xs, { id: u.id, primeroOk: nuevo.ok }]);
    setColocadas((xs) => [...xs, { usuario: u, zona: u.zona }]);
    setTocada(zona);
    setR(nuevo);
  };

  const avanzar = () => {
    setR(null); setTocada(null); setSegunda(null);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    t.reiniciar(); setR(null); setRespuestas([]); setColocadas([]); setTocada(null); setSegunda(null);
  };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}{CSS_B5H}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantas} al primer intento. Cada pregunta valía {pesoDeCadaItem(cuantas).toFixed(2)} %.
          </p>
        </Cierre>
        <div style={{ marginTop: "14px" }}>
          <AnilloEnFila vuelta={colocadas.some((c) => c.usuario.cierraElCiclo) ? "encendida" : "tenue"} alt={ALT_T1_1} />
          <ul data-colocadas style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "5px" }}>
            {colocadas.map((c) => (
              <li key={c.usuario.id} data-colocada={c.zona} style={{ fontSize: "12px", color: SECUNDARIO }}>
                {c.usuario.nombre} — {ROTULO_ZONA[c.zona].toLowerCase()}
              </li>
            ))}
          </ul>
        </div>
      </Marco>
    );
  }

  const vuelta = r?.enciendeTrazo ? "encendida" : "tenue";
  const alt = [
    ALT_ANILLO_T1_1.base,
    r ? ALT_ANILLO_T1_1[u.zona] : null,
    r ? (r.enciendeTrazo ? ALT_ANILLO_T1_1.vueltaEncendida : ALT_ANILLO_T1_1.vueltaApagada) : null,
  ].filter(Boolean).join(" ");
  /* El ejemplo de «Así se juega» no es del banco y no lleva segunda decisión. */
  const opciones = modoDemo ? [] : opcionesSegundaT1_1(u);
  const correcta = modoDemo ? null : correctaSegundaT1_1(u);
  const elegida = opciones.find((o) => o.id === segunda) ?? null;

  const zona = (cual) => {
    const esDentro = cual === ZONA_DENTRO;
    const estado = !r ? REPOSO : cual === u.zona ? ACIERTO : cual === tocada ? FANTASMA : REPOSO;
    const marca = !r ? null : cual === u.zona ? (r.ok ? CORRECTA : REVELADA) : cual === tocada ? TACHADA : null;
    return (
      <button
        type="button"
        data-zona={cual}
        data-estado={estado}
        disabled={Boolean(r)}
        onClick={r ? undefined : () => responder(cual)}
        aria-label={ROTULO_ZONA[cual]}
        style={{
          display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px",
          width: "100%", minHeight: "48px", boxSizing: "border-box", textAlign: "left",
          padding: "6px 10px", borderRadius: esDentro ? "0 0 10px 10px" : "10px",
          cursor: r ? "default" : "pointer", color: FAE.text,
          ...estiloC2(estado),
          ...(estado === ACIERTO ? { background: "rgba(29,53,87,0.9)" } : {}),
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {marca === TACHADA && <IconoX />}
          {(marca === CORRECTA || marca === REVELADA) && <IconoCheck />}
          <span style={{ fontFamily: SORA, fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: SECUNDARIO }}>
            {ROTULO_ZONA[cual]}
          </span>
        </span>
        {/*
          La ficha entra a la zona correcta (el registro), se acierte o no. Su
          sitio está reservado en las dos zonas: dos renglones de 16, porque con
          lo que se juega («la pregunta · algo que piensa hacer») se parte a 320.
        */}
        <span data-sitio-ficha style={{ display: "flex", alignItems: "center", minHeight: `${ALTO_FICHA}px` }}>
          {r && cual === u.zona && <span data-asentada={u.id} style={{ display: "flex" }}><Ficha enJuego={elegida} /></span>}
        </span>
        {marca && <span style={SOLO_LECTOR}><Pastilla marca={marca} /></span>}
      </button>
    );
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}{CSS_B5H}{CSS_REGISTRO}</style>
      <div className={CLASE_B5H} data-t11>
        {!modoDemo && (
          <EncabezadoCompacto
            objetivo={T1_1.objetivo}
            contador={contadorDe("Pregunta", t.i + 1, cuantas)}
            consigna={T1_1.consigna}
          />
        )}

        {/*
          ═══════ AQUÍ DENTRO NO ENTRA EL VOCABULARIO DEL TEMA 2 ═══════
          Ni teal ni ámbar: todavía no significan debe ni haber. Hay una prueba
          que mira exactamente dentro de esta caja.
        */}
        <div data-contenido>
          <p data-pregunta={u.id} style={{
            margin: "0 0 10px", padding: "10px 12px", borderRadius: "11px",
            fontFamily: SORA, fontSize: "13px", fontWeight: 700, lineHeight: 1.4,
            color: FAE.text, background: "rgba(10,20,34,0.5)", border: "1px solid rgba(248,249,250,0.18)",
          }}>
            «{u.pregunta}»
          </p>

          <div data-escenario style={{ boxSizing: "border-box", padding: "10px", borderRadius: "12px", background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)" }}>
            <AnilloEnFila vuelta={vuelta} alt={alt} />
            {/* La franja del ciclo y, pegada a ella, «Adentro». Un blanco de 14 y «Afuera». */}
            <div data-franja-ciclo aria-hidden="true" style={{ height: "6px", marginTop: "10px", borderRadius: "3px 3px 0 0", background: "rgba(184,196,212,.35)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {zona(ZONA_DENTRO)}
              {zona(ZONA_FUERA)}
            </div>
            {/* El veredicto escrito, reservado: «Correcto» o «Iba aquí: Adentro». */}
            <div data-renglon style={{ minHeight: "28px", marginTop: "8px", display: "flex", alignItems: "center" }}>
              {r && <Pastilla marca={r.ok ? CORRECTA : REVELADA} valor={r.ok ? null : ROTULO_ZONA[u.zona]} />}
            </div>
          </div>
        </div>

        <RegionViva>
          {r && <Mensaje ok={r.ok} texto={sinEmoji(r.texto)} />}
        </RegionViva>

        {/*
          ═══════ LA SEGUNDA DECISIÓN (D4) ═══════
          Su sitio está desde el principio, en una rejilla de 2×2; se activa al
          responder la 1, se acierte o no. En la demo no sale.
        */}
        {!modoDemo && (
          <div data-segunda-decision data-activa={r && !segunda ? "si" : "no"} style={{ marginTop: "14px" }}>
            <p style={{ margin: "0 0 8px", fontFamily: SORA, fontSize: "14px", fontWeight: 600, lineHeight: 1.35, color: r ? FAE.text : SECUNDARIO }}>
              {SEGUNDA_T1_1.pregunta}
            </p>
            <div role="group" aria-label={SEGUNDA_T1_1.pregunta} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {opciones.map((o) => {
                const esta = segunda === o.id;
                const estado = !segunda ? REPOSO : o.id === correcta ? ACIERTO : esta ? FANTASMA : REPOSO;
                return (
                  <button
                    key={o.id}
                    type="button"
                    data-en-juego-opcion={o.id}
                    data-estado={estado}
                    aria-pressed={esta}
                    disabled={!r || Boolean(segunda)}
                    onClick={() => setSegunda(o.id)}
                    style={{
                      /* La rejilla cabe en los 96 px de Mai (Shoko): 44 + 6 + 44, con dos renglones de 12/1,2 dentro de 44. */
                      height: "44px", padding: "3px 8px", borderRadius: "10px", boxSizing: "border-box",
                      display: "flex", alignItems: "center", gap: "5px", textAlign: "left",
                      cursor: r && !segunda ? "pointer" : "default",
                      color: r ? FAE.text : SECUNDARIO, fontFamily: INTER, fontSize: "12px", lineHeight: 1.2,
                      ...estiloC2(estado),
                    }}
                  >
                    {segunda && o.id === correcta && <IconoCheck />}
                    {segunda && esta && o.id !== correcta && <IconoX />}
                    <span>{o.texto}</span>
                  </button>
                );
              })}
            </div>
            <RegionViva>
              {segunda && <Mensaje ok={segunda === correcta} texto={segunda === correcta ? porqueSegundaT1_1(u) : elegida?.msg ?? null} />}
            </RegionViva>
          </div>
        )}

        {r && !modoDemo && segunda && (
          <Avance onClick={avanzar} refBoton={zonaBoton}>
            {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente pregunta"}
          </Avance>
        )}

      </div>
    </Marco>
  );
}
