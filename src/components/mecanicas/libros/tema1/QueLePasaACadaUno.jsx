import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { NEUTRO, TEXTO_ATENUADO } from "../../../../data/contabilidadIntro.js";
import {
  T1_4, PARTES, CONTROLES, SUBE, BAJA, IGUAL, ALT_T1_4, SEGUNDA_T1_4,
} from "../../../../data/contabilidadTema1.js";
import {
  sortearT1_4, evaluarT1_4, puntuar, sinEmoji,
  opcionesSegundaT1_4, correctaSegundaT1_4, nombreDelCasoT1_4,
} from "../../../../contabilidad/tema1.js";
import { Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { useTanda } from "../piezas.jsx";
import { useMovimientoReducido, SOLO_LECTOR } from "../verbos.jsx";
import { IdeaConTermino } from "./encabezado.jsx";
import EncabezadoCompacto from "../b5/EncabezadoCompacto.jsx";
import {
  Pastilla, Mensaje, RegionViva, IconoCheck, IconoX, CORRECTA, REVELADA, CSS_B5H, CLASE_B5H,
} from "../b5/Devolucion.jsx";
import {
  SORA, INTER, SECUNDARIO, REPOSO, ACIERTO, FANTASMA, estiloC2, contadorDe, Avance, CSS_REGISTRO, CURVA, CLASE_APARECE,
} from "./registro.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-4 · ¿QUÉ LE PASA A CADA UNO? — las barras arriba, y el registro (P2 de
 * Mai, 23-oct; ajustes a la auditoría de Shoko, 24-oct, §4).
 *
 * Un hecho y las tres partes de la empresa. Para cada una: sube, baja o queda
 * igual. Con cada hecho se mueven DOS y la tercera se queda quieta, siempre.
 *
 * ═══════════ LAS BARRAS VAN PRIMERO ═══════════
 *
 * Justo bajo el hecho, cada una con su columna de controles debajo: lo que se
 * decide queda alineado con lo que se mueve. Antes estaban a 553 px a 320.
 *
 * ═══════════ UN ENVÍO, Y EL REGISTRO ═══════════
 *
 * Un solo «Anotar» cierra las dos decisiones (Shoko): las barras se mueven
 * DESPUÉS, como en t1-5, para que el caso no se lea en la pantalla antes de
 * elegirlo. Un intento. Las barras van a lo
 * CORRECTO, se acierte o no, y la que el estudiante movió mal deja su
 * fantasma —contorno coral discontinuo— a la altura que habría tomado. La
 * barra quieta da UN pulso de opacidad (1 → ,6 → 1, 480 ms) y no cambia de
 * alto: «queda igual» es una respuesta, no la ausencia de una.
 *
 * ═══════════ LA DECISIÓN 2: CUÁL DE LOS CUATRO CASOS ═══════════
 *
 * Los cuatro nombres de la p. 35, en columna, bajo las barras y antes de
 * «Anotar»: se eligen con las barras quietas. Tras anotar, el caso correcto
 * queda pegado a las barras en un renglón reservado (42 px, medido). La línea
 * «=» ya no se marca: la igualdad nunca se rompe, así que no distinguía nada.
 * No puntúa (está escrito en los datos por qué).
 *
 * ═══════════ NI UN ▲ ═══════════
 *
 * Subir se dice con ↑. El ▲ es del Tema 2. Tampoco hay marcador de saldo, ni
 * arcos, ni balanza, ni teal o ámbar con significado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-t14-pulso { 0%, 100% { opacity: 1; } 50% { opacity: .6; } }
.fae-t14-pulso { animation: fae-t14-pulso 480ms ${CURVA} 1; }
@media (prefers-reduced-motion: reduce) {
  .fae-t14-pulso { animation: none !important; }
}
`;

/* Los tres altos de la barra. El de «queda igual» es el mismo que el de reposo. */
const ALTO = { reposo: 44, [SUBE]: 62, [BAJA]: 26, [IGUAL]: 44 };
/*
 * El renglón del nombre del caso, pegado a las barras. Mai lo pide de 34
 * (ajustes, §4); medido a 320 con el peor caso —«Iba aquí: Disminución en
 * activo y en patrimonio», en dos renglones— pide 41. Va en 42.
 */
export const ALTO_RENGLON_CASO = 42;
/* Lo que se espera a que el desplazamiento suave llegue a las barras (el mismo de t1-5). */
export const MS_SUBIR_T1_4 = 420;

const palabraDe = (id) => CONTROLES.find((c) => c.id === id)?.palabra ?? "";
const signoDe = (id) => CONTROLES.find((c) => c.id === id)?.signo ?? "";

/*
 * Una columna: la barra en su carril de alto fijo, el signo, el rótulo y los
 * tres controles. `revelado` es lo que de verdad pasó; `fantasma`, la altura
 * que habría tomado con lo marcado, si difiere.
 */
function Columna({ parte, marcado, revelado, fantasma, activo, onMarcar, reducido }) {
  const alto = revelado ? ALTO[revelado] : ALTO.reposo;
  const quieta = revelado === IGUAL;
  return (
    <div data-parte={parte.id} data-revelado={revelado ?? undefined} style={{
      flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "stretch", gap: "6px",
    }}>
      {/* El carril de alto fijo: la barra crece o mengua DENTRO de él, y nada empuja a nada. */}
      <div style={{ position: "relative", height: `${ALTO[SUBE]}px`, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <div
          data-barra={parte.id}
          data-alto={alto}
          className={quieta && !reducido ? "fae-t14-pulso" : undefined}
          style={{
            width: "26px", height: `${alto}px`, borderRadius: "5px",
            background: NEUTRO, opacity: revelado ? 1 : 0.5,
            transition: reducido ? "none" : `height 420ms ${CURVA}, opacity 240ms ${CURVA}`,
          }}
        />
        {fantasma != null && (
          <div data-fantasma={parte.id} data-alto={ALTO[fantasma]} className={CLASE_APARECE} aria-hidden="true" style={{
            position: "absolute", bottom: 0, left: "50%", width: "32px", marginLeft: "-16px", boxSizing: "border-box",
            height: `${ALTO[fantasma]}px`, borderRadius: "6px", border: `2px dashed ${FAE.coral}`, pointerEvents: "none",
          }} />
        )}
      </div>
      <span data-signo={revelado ?? "sin"} style={{
        textAlign: "center", fontFamily: SORA, fontSize: "15px", fontWeight: 700, lineHeight: 1,
        color: revelado ? NEUTRO : TEXTO_ATENUADO,
      }}>
        {revelado ? signoDe(revelado) : "·"}
      </span>
      <span style={{ display: "flex", justifyContent: "center", textAlign: "center", minHeight: "48px" }}>
        <IdeaConTermino idea={parte.idea} termino={parte.termino} tamano={12} colorTermino={SECUNDARIO} />
      </span>
      <div role="group" aria-label={parte.idea} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {CONTROLES.map((c) => {
          const esta = marcado === c.id;
          /* C2 por fila: lo que de verdad pasó, en acierto; lo marcado mal, fantasma. */
          const estado = !revelado ? REPOSO : c.id === revelado ? ACIERTO : esta ? FANTASMA : REPOSO;
          const icono = !revelado ? null : c.id === revelado ? "ok" : esta ? "mal" : null;
          return (
            <button
              key={c.id}
              type="button"
              data-control={`${parte.id}-${c.id}`}
              data-marcada={esta ? "si" : "no"}
              data-estado={estado}
              disabled={!activo}
              onClick={activo ? () => onMarcar(parte.id, c.id) : undefined}
              aria-label={`${parte.idea} ${c.palabra}`}
              aria-pressed={esta}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "3px",
                minHeight: "44px", padding: "4px 3px", borderRadius: "9px", boxSizing: "border-box",
                cursor: activo ? "pointer" : "default", color: FAE.text,
                fontFamily: INTER, fontSize: "12px", fontWeight: esta ? 700 : 500, lineHeight: 1.2,
                ...estiloC2(estado),
                /* Antes de enviar, lo marcado se ve con el contorno de 2 px, sin relleno. */
                ...(!revelado && esta ? { border: `2px solid ${FAE.text}`, background: "rgba(184,196,212,0.14)", boxShadow: "none" } : {}),
              }}
            >
              {icono === "ok" && <IconoCheck />}
              {icono === "mal" && <IconoX />}
              <span>{c.signo} {c.palabra}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/*
 * ═══════════ EL MODO DEMO DE «ASÍ SE JUEGA» ═══════════
 *
 * Es este mismo componente: `items` le da el ejemplo desde afuera y `modoDemo`
 * le quita el encabezado, la decisión 2 y el avance, y no llama a `onCompletar`.
 */
export default function QueLePasaACadaUno({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false,
}) {
  const reducido = useMovimientoReducido();
  const t = useTanda(() => items ?? sortearT1_4(barajar));

  const [marcado, setMarcado] = useState({});
  const [r, setR] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [caso, setCaso] = useState(null);
  const zonaBoton = useRef(null);
  /*
   * Como en t1-5 (#531): «Anotar» queda bajo los cuatro casos, a 855 px a 320,
   * y las barras a 248. Al anotar, si no se ven, la pieza sube a ellas y las
   * mueve al llegar; el foco va a «Siguiente» sin desplazar la página.
   */
  const cajaBarras = useRef(null);
  const reloj = useRef(null);
  const [barrasAlDia, setBarrasAlDia] = useState(false);
  useEffect(() => () => clearTimeout(reloj.current), []);

  const h = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuar(respuestas, cuantas);
  /* Las tres marcas y, en la partida, el caso: las dos decisiones se cierran con un solo «Anotar». */
  const completo = PARTES.every((p) => marcado[p.id]) && (modoDemo || caso !== null);
  const correctaCaso = correctaSegundaT1_4(h);
  const opcionesCaso = opcionesSegundaT1_4(h);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  useEffect(() => {
    if (r && !modoDemo) zonaBoton.current?.focus({ preventScroll: true });
  }, [r]);

  const enviar = () => {
    if (!completo || r) return;
    const nuevo = evaluarT1_4(h, marcado);
    t.anotar(h.id, nuevo.ok, nuevo.ok ? null : PARTES.map((p) => `${p.id}:${marcado[p.id]}`).join(" "));
    setRespuestas((xs) => [...xs, { id: h.id, primeroOk: nuevo.ok }]);
    /* La decisión 2 no puntúa: solo se pinta. */
    setR(nuevo);
    const caja = cajaBarras.current?.getBoundingClientRect();
    const fuera = Boolean(caja) && (caja.top < 0 || caja.bottom > (globalThis.innerHeight ?? Infinity));
    clearTimeout(reloj.current);
    if (fuera && !modoDemo) {
      cajaBarras.current.scrollIntoView?.({ behavior: reducido ? "auto" : "smooth", block: "start" });
      setBarrasAlDia(false);
      reloj.current = setTimeout(() => setBarrasAlDia(true), reducido ? 0 : MS_SUBIR_T1_4);
    } else {
      setBarrasAlDia(true);
    }
  };

  const avanzar = () => {
    clearTimeout(reloj.current); setBarrasAlDia(false);
    setR(null); setMarcado({}); setCaso(null);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    clearTimeout(reloj.current); setBarrasAlDia(false);
    t.reiniciar(); setR(null); setRespuestas([]); setMarcado({}); setCaso(null);
  };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantas} al primer intento. Cada uno de los {cuantas} hechos vale lo mismo en tu resultado.
          </p>
        </Cierre>
      </Marco>
    );
  }

  /* El registro: tras enviar, lo que de verdad pasó; y el fantasma donde lo marcado difiere. */
  const revelado = r && barrasAlDia ? r.real : null;
  const fantasmaDe = (id) => (revelado && !r.ok && marcado[id] !== r.real[id] && ALTO[marcado[id]] !== ALTO[r.real[id]] ? marcado[id] : null);
  const opcionCaso = opcionesCaso.find((o) => o.id === caso) ?? null;
  const casoOk = caso === correctaCaso;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}{CSS_B5H}{CSS_REGISTRO}</style>
      <div className={CLASE_B5H} data-t14>
        {!modoDemo && (
          <EncabezadoCompacto
            objetivo={T1_4.objetivo}
            contador={contadorDe("Hecho", t.i + 1, cuantas)}
            consigna={T1_4.consigna}
          />
        )}

        {/* Aquí dentro no entra el vocabulario del Tema 2. Hay una prueba que mira esta caja. */}
        <div data-contenido>
          <p data-hecho={h.id} style={{
            margin: "0 0 12px", padding: "10px 12px", borderRadius: "11px",
            fontFamily: INTER, fontSize: "13px", lineHeight: 1.45, color: FAE.text,
            background: "rgba(10,20,34,0.5)", border: "1px solid rgba(248,249,250,0.16)",
          }}>
            {h.texto}
          </p>

          <div data-escenario ref={cajaBarras} style={{ scrollMarginTop: "12px" }}>
            {/* Las barras con sus controles debajo, alineados por arriba: todas parten del mismo suelo. */}
            <div data-barras style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
              {PARTES.map((p) => (
                <Columna
                  key={p.id}
                  parte={p}
                  marcado={marcado[p.id]}
                  revelado={revelado ? revelado[p.id] : null}
                  fantasma={fantasmaDe(p.id)}
                  activo={!r}
                  onMarcar={(parte, c) => setMarcado((m) => ({ ...m, [parte]: c }))}
                  reducido={reducido}
                />
              ))}
            </div>

            {/* El nombre del caso, pegado a las barras. Reservado desde el principio. */}
            <div data-renglon-caso style={{ minHeight: `${ALTO_RENGLON_CASO}px`, marginTop: "8px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 6px" }}>
              {/*
                El caso que ES, siempre (el registro): «Correcto: …» o «Iba
                aquí: …». El elegido por error queda como fantasma en su botón.
              */}
              {r && caso && (
                <span data-caso-elegido={caso} data-caso-correcto={correctaCaso}>
                  <Pastilla marca={casoOk ? CORRECTA : REVELADA} valor={nombreDelCasoT1_4(correctaCaso)} envuelve />
                </span>
              )}
            </div>
          </div>
        </div>

        {/*
          ═══════ LA DECISIÓN 2 (D4) ═══════
          Se toma ANTES de anotar, con las barras quietas (Shoko): si las barras
          ya mostraran lo correcto, el caso se leería en la pantalla. Un solo
          «Anotar» cierra las dos; después se mueven las barras y salen los dos
          veredictos. En la demo de «Así se juega» no sale.
        */}
        {!modoDemo && (
          <div data-segunda-decision data-activa={!r ? "si" : "no"} style={{ marginTop: "14px" }}>
            <p style={{ margin: "0 0 8px", fontFamily: SORA, fontSize: "14px", fontWeight: 600, lineHeight: 1.35, color: FAE.text }}>
              {SEGUNDA_T1_4.pregunta}
            </p>
            <div role="group" aria-label={SEGUNDA_T1_4.pregunta} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {opcionesCaso.map((o) => {
                const elegida = caso === o.id;
                const estado = !r ? REPOSO : o.id === correctaCaso ? ACIERTO : elegida ? FANTASMA : REPOSO;
                return (
                  <button
                    key={o.id}
                    type="button"
                    data-caso={o.id}
                    data-estado={estado}
                    aria-pressed={elegida}
                    disabled={Boolean(r)}
                    onClick={() => setCaso(o.id)}
                    style={{
                      minHeight: "44px", padding: "6px 10px", borderRadius: "10px", boxSizing: "border-box", textAlign: "left",
                      display: "flex", alignItems: "center", gap: "6px",
                      cursor: r ? "default" : "pointer",
                      color: FAE.text, fontFamily: INTER, fontSize: "13px", lineHeight: 1.3,
                      ...estiloC2(estado),
                      /* Antes de anotar, lo elegido con el contorno de 2 px, sin relleno (como los controles). */
                      ...(!r && elegida ? { border: `2px solid ${FAE.text}`, background: "rgba(184,196,212,0.14)", boxShadow: "none" } : {}),
                    }}
                  >
                    {r && o.id === correctaCaso && <IconoCheck />}
                    {r && elegida && o.id !== correctaCaso && <IconoX />}
                    <span>{o.texto}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!r && (
          <Avance onClick={enviar} deshabilitado={!completo}>
            {completo ? "Anotar" : modoDemo ? "Marca las tres" : "Marca las tres y el caso"}
          </Avance>
        )}

        <RegionViva>
          {r && <Mensaje ok={r.ok} texto={sinEmoji(r.texto)} />}
          {r && caso && <Mensaje ok={casoOk} texto={casoOk ? opcionCaso?.acierto ?? null : opcionCaso?.msg ?? null} />}
        </RegionViva>

        {r && !modoDemo && (
          <Avance onClick={avanzar} refBoton={zonaBoton}>
            {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente hecho"}
          </Avance>
        )}

        {!modoDemo && <p style={SOLO_LECTOR}>{ALT_T1_4}</p>}
        {revelado && (
          <p style={SOLO_LECTOR}>
            {PARTES.map((p) => `${p.idea}: ${palabraDe(revelado[p.id])}`).join(". ")}.
          </p>
        )}
      </div>
    </Marco>
  );
}
