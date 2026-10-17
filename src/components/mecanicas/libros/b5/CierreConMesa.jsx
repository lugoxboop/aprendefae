import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../../data/contabilidad.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { ROTULO_ESTANTE, COLECTOR, TEXTO_DIFERENCIA, AVISO_UN_INTENTO } from "../../../../data/contabilidadAsientoCompuesto.js";
import { totalesDe, puntuar } from "../../../../contabilidad/cierreConMesa.js";
import { formatearCifra, leerCifra } from "../../../../contabilidad/elCierreCompleto.js";
import { Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import EncabezadoCompacto from "./EncabezadoCompacto.jsx";
import { TONO_ROTULO } from "../debeHaber/piezasDebeHaber.jsx";
import { estiloE4, CORRECTA, TACHADA, REVELADA, TACHADO } from "./MarcasE4.jsx";
import {
  Pastilla, Mensaje, RegionViva, IconoCheck, CSS_B5H, CLASE_B5H, COMPROBAR_B, VER_MI_RESUMEN, siguienteDe,
  PALABRA_B, REPOSO_B, ACIERTO_B, HUNDIDO_B, TEXTO_B,
} from "./Devolucion.jsx";
import { useReducido } from "../tema3/DosLineas.jsx";
import { evaluarPregunta, formatearRespuesta, leerRespuesta } from "../../../../contabilidad/t6Act2.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA MESA DE ASIENTOS DE LA CÉLULA B — la mecánica del cierre de Santa Pacha
 * (T5 · Hacer 2), generalizada para los Hacer del Tema 6.
 *
 * La mecánica de t3-cierre-completo (tema3/ElCierreCompleto.jsx), replicada
 * en un componente de la célula para no tocar el del Tema 3: el estante, la
 * mesa de dos columnas con sus colectores y un campo de valor por cuenta, el
 * conector que cierra cuando los totales coinciden, «Confirmar asiento», un
 * intento por parte, el error con prioridad D > C > A > B y el asiento
 * correcto revelado; al acertar, solo la marca junto al rótulo. Un caso, una
 * parte por pantalla; contador «Asiento»; «Siguiente asiento» / «Ver mi
 * resumen». El estante va sin montos.
 *
 * Lo propio de cada actividad llega en `config`: { actividad (objetivo y
 * consigna), partes, estante, resumen, alt, evaluar, atributos }.
 *
 * Avisa hacia fuera cada parte comprobada (`onParteComprobada`) y cada
 * reinicio (`onReiniciar`): con eso, el libro diario de encima crece (la
 * variante 1 de la guía de Mai). El diario llega por `encima` y se pinta
 * entre el encabezado y el contador.
 *
 * PASOS CON PREGUNTAS (lote 6b, la fusión de a5 en a2): una parte con
 * `tipo: "pregunta"` no lleva mesa: su enunciado, un campo de cifra escrita,
 * «Comprobar» y un solo intento (contabilidad/t6Act2.js). Si falla, su cifra
 * queda tachada y debajo, la correcta (E4). Lo propio de la actividad
 * llega en `config`: `textos` (la etiqueta del contador, «Siguiente»,
 * «Comprobar», el nombre del campo), `visual` (lo que va entre el contador y
 * el paso, que no se mueve: en a2, la cuenta T) y `bloques` (lo que una
 * pregunta lleva encima de su campo). Las partes de asiento siguen igual, y
 * solo ellas llegan al diario.
 *
 * ENGANCHE B1-B5 (lote 6c, hoja de Mai, parte Hacer):
 *   · el encabezado compacto de la célula (EncabezadoCompacto.jsx): el
 *     objetivo y, en una fila de 44, el contador y «¿Cómo se juega?», que
 *     despliega la consigna, los pasos (`config.reglas`) y la regla fija;
 *     la regla sigue también junto al botón que la usa;
 *   · el ejemplo resuelto (`config.ejemplo`) es su propio paso, antes del
 *     primero: primero la figura (el asiento), después el enunciado y la
 *     explicación, y abajo «Empezar». No cuenta en el contador;
 *   · el libro diario (`encima`, el nombre de siempre) baja al final de la
 *     tarjeta, debajo de «Siguiente»;
 *   · la instrucción de cada asiento sale de la pantalla y la lee el lector
 *     de pantalla (aria-describedby); el rótulo del estante lleva 8 arriba y
 *     6 abajo.
 *
 * LOTE 6d (estándar único de Hacer, Devolucion.jsx):
 *   · «Comprobar» en vez de «Confirmar asiento» (la constante compartida
 *     sigue igual: la usan las mesas del Tema 3; esta es COMPROBAR_B);
 *   · las tarjetas de la mesa, en el hundido de Cuentas; los campos, sin
 *     relleno y con el contorno de reposo de 1 px .35;
 *   · al comprobar con error: la cuenta que sobra o está en la columna
 *     equivocada, 2 px coral y «No va aquí»; el valor equivocado, igual en su
 *     campo, y debajo «Iba aquí: $180.000»; la cuenta que faltaba, al final de
 *     su columna con «Iba aquí» y 2 px #F8F9FA. Lo revelado llega 0,7 s
 *     después; en una mesa hay un solo intento, así que siempre se revela;
 *   · la pregunta acertada: su cifra con 2 px #F8F9FA y «Correcto»;
 *   · el bloque de mensaje, el del modelo T4, con el veredicto del estado
 *     (`resultado.ok`): Check y «Correcto.», o X y «Incorrecto.» al lector;
 *   · el avance sigue al contador: «Siguiente asiento» / «Siguiente paso», y
 *     «Ver mi resumen» al final.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const CIFRA = { fontFamily: SORA, fontVariantNumeric: "tabular-nums" };

const CSS = `
@keyframes fae-b5k-entra { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
.fae-b5k button { -webkit-tap-highlight-color: transparent; }
.fae-b5k button:focus-visible, .fae-b5k input:focus-visible { outline: 2px solid ${FAE.text}; outline-offset: 2px; }
.fae-b5k input::placeholder { color: ${COLOR.apagado}; }
@media (prefers-reduced-motion: reduce) { .fae-b5k * { animation: none !important; transition: none !important; } }
`;

/* El acierto junto al rótulo de la parte: el Check de lucide (lote 6d), sin círculo. */
function Visto() {
  return (
    <span aria-hidden="true" data-visto-parte style={{ display: "inline-flex", height: "20px", alignItems: "center", flex: "none" }}>
      <IconoCheck />
    </span>
  );
}

/* Un campo de cifra: «$», punto de miles, sin decimales, hasta 8 dígitos. */
/* `tachado` (E4): el valor que escribió el estudiante y no era, tachado y con 2 px coral (lote 6d); la pastilla va debajo. */
/* `acertado` (E4, lote 6c): la cifra de una pregunta acertada, con 2 px #F8F9FA (lote 6d); la pastilla va debajo. */
function Campo({ id, valor, onCambio, bloqueado, etiqueta, tachado = false, acertado = false, formatear = formatearCifra }) {
  const marca = tachado ? TACHADA : acertado ? CORRECTA : null;
  return (
    <div data-caja-campo={id} data-marca={marca ?? ""} style={{
      display: "flex", alignItems: "center", gap: "3px", height: "44px", boxSizing: "border-box", padding: marca ? "0 7px" : "0 8px", borderRadius: "10px",
      background: "transparent", ...estiloE4(marca, REPOSO_B),
    }}>
      <span aria-hidden="true" data-signo style={{ fontFamily: SORA, fontSize: "14px", fontWeight: 700, color: COLOR.apagado, marginRight: "3px" }}>$</span>
      <input
        data-campo-cifra={id}
        value={valor}
        onChange={(e) => onCambio(formatear(e.target.value))}
        readOnly={bloqueado}
        inputMode="numeric"
        autoComplete="off"
        placeholder="0"
        aria-label={etiqueta}
        style={{
          flex: "1 1 auto", minWidth: 0, width: "100%", height: "100%", padding: 0, border: "none", outline: "none",
          background: "transparent", color: COLOR.blanco, fontSize: "14px", fontWeight: 700, ...CIFRA, ...(tachado ? TACHADO : null),
        }}
      />
    </div>
  );
}

function Colector({ lado, total }) {
  return (
    <div data-colector={lado} style={{
      padding: "7px 6px", borderRadius: "10px", textAlign: "center",
      background: `${COLOR_LADO[lado]}1A`, border: `1px solid ${COLOR_LADO[lado]}`,
    }}>
      <p style={{ margin: 0, fontFamily: SORA, fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", color: TONO_ROTULO[lado] }}>
        {lado === DEBE ? COLECTOR.debe : COLECTOR.haber}
      </p>
      <p data-total={lado} style={{ margin: "2px 0 0", ...CIFRA, fontSize: "13px", fontWeight: 700, color: COLOR.blanco, whiteSpace: "nowrap" }}>
        {pesos(total)}
      </p>
    </div>
  );
}

/*
 * EL ESTANTE, FILA POR FILA (hoja de Mai, lote 3 · A). Cada fila va como siempre: el nombre a la
 * izquierda y «AL DEBE» y «AL HABER» a la derecha. Si el nombre pasa de 3 renglones al lado de los
 * botones, esa fila pasa a «abajo»: el nombre a todo el ancho y, 4 px debajo, los mismos botones, del
 * mismo tamaño y en la misma columna que los de las demás filas; la fila queda a 10 px de sus vecinas
 * (los 6 del estante y 4 más) y entre su nombre y sus botones hay 4: el aire dice a qué nombre pertenecen. Se mide en vivo y por fila, no se fija por cuenta: a 320 bajan una o dos filas, y a 375 ninguna.
 * Se mide antes de pintar (useLayoutEffect), otra vez cuando cargan las fuentes y cada vez que cambia
 * el ancho del estante. El orden en el DOM no cambia (nombre, «AL DEBE», «AL HABER»): el lector de
 * pantalla y el tabulador no notan la diferencia. Sin animación: es un cambio de ancho, no un evento.
 */
const NOMBRE_ESTANTE = { fontFamily: INTER, fontSize: "12.5px", fontWeight: 600, lineHeight: 1.25 };
const RENGLONES_AL_LADO = 3;
const HUECO_ESTANTE = 8;
const ENTRE_FILAS = 6;
const AIRE_ABAJO = 10;

function useFilasAbajo(ref, cuentas) {
  const [abajo, setAbajo] = useState(() => new Set());
  const clave = cuentas.join("|");
  useLayoutEffect(() => {
    const estante = ref.current;
    if (!estante) return undefined;
    const medir = () => {
      const bajan = [];
      for (const fila of estante.querySelectorAll("[data-en-estante]")) {
        const nombre = fila.querySelector("[data-nombre-estante]");
        const botones = [...fila.querySelectorAll("[data-sacar]")];
        /* El ancho que tendría el nombre al lado de los botones, esté como esté ahora la fila. */
        const ancho = fila.getBoundingClientRect().width - botones.reduce((t, b) => t + b.getBoundingClientRect().width + HUECO_ESTANTE, 0);
        const renglon = parseFloat(getComputedStyle(nombre).lineHeight);
        if (!(ancho > 0) || !(renglon > 0)) continue;
        const copia = nombre.cloneNode(true);
        copia.removeAttribute("data-nombre-estante");
        copia.setAttribute("aria-hidden", "true");
        Object.assign(copia.style, { position: "absolute", visibility: "hidden", left: "0", top: "0", width: `${ancho}px`, gridColumn: "auto" });
        estante.appendChild(copia);
        const alto = copia.getBoundingClientRect().height;
        copia.remove();
        if (alto > renglon * RENGLONES_AL_LADO + 0.5) bajan.push(fila.dataset.enEstante);
      }
      setAbajo((antes) => (bajan.join("|") === [...antes].join("|") ? antes : new Set(bajan)));
    };
    medir();
    let vivo = true;
    document.fonts?.ready?.then(() => { if (vivo) medir(); });
    const observador = typeof ResizeObserver === "function" ? new ResizeObserver(medir) : null;
    observador?.observe(estante);
    return () => { vivo = false; observador?.disconnect(); };
  }, [clave]); // eslint-disable-line react-hooks/exhaustive-deps
  return abajo;
}

function Estante({ cuentas, onSacar }) {
  const ref = useRef(null);
  const abajo = useFilasAbajo(ref, cuentas);
  return (
    <div ref={ref} data-estante style={{ position: "relative", display: "flex", flexDirection: "column", gap: `${ENTRE_FILAS}px` }}>
      {cuentas.map((c, i) => {
        const baja = abajo.has(c);
        const aire = `${AIRE_ABAJO - ENTRE_FILAS}px`;
        return (
          <div key={c} data-en-estante={c} data-forma={baja ? "abajo" : "al lado"} style={{
            display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto auto", columnGap: `${HUECO_ESTANTE}px`, rowGap: "4px",
            alignItems: "center",
            marginTop: baja && i > 0 ? aire : 0, marginBottom: baja && i < cuentas.length - 1 ? aire : 0,
          }}>
            <span data-nombre-estante style={{ ...NOMBRE_ESTANTE, minWidth: 0, gridColumn: baja ? "1 / -1" : "1", color: COLOR.blanco }}>{c}</span>
            {[DEBE, HABER].map((lado, k) => (
              <button key={lado} type="button" data-sacar={`${c}:${lado}`} onClick={() => onSacar(c, lado)}
                aria-label={`${c} ${lado === DEBE ? "al debe" : "al haber"}`}
                style={{
                  gridColumn: String(k + 2), gridRow: baja ? "2" : "1",
                  minHeight: "44px", padding: "5px 8px", borderRadius: "8px", cursor: "pointer",
                  background: `${COLOR_LADO[lado]}14`, border: `1px solid ${COLOR_LADO[lado]}66`,
                  color: TONO_ROTULO[lado], fontFamily: SORA, fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em",
                }}>
                {lado === DEBE ? "AL DEBE" : "AL HABER"}
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* La mesa de dos columnas, su conector y (si está activa) el estante, sin montos. */
/*
 * E4 en la mesa (hoja de fusiones de Mai, §3): al confirmar con error, la mesa del estudiante se queda
 * como la armó, y lo correcto aparece junto, sin reemplazarla:
 *   · cuenta que sobra o que está en la columna equivocada: su tarjeta queda marcada, con el nombre y el
 *     valor tachados;
 *   · valor equivocado: el valor queda tachado dentro del campo y, debajo, en la misma tarjeta,
 *     el valor correcto (desde el lote 6d, «Iba aquí: $180.000»);
 *   · cuenta que faltaba: al final de su columna, una tarjeta con el valor correcto («Iba aquí»).
 * Los totales y la diferencia se quedan como los dejó el estudiante: son su asiento. El diario recibe
 * el asiento correcto. Sin coral: el coral sigue solo en la devolución.
 */
const BORDE_TARJETA = HUNDIDO_B.border;
const TARJETA = { padding: "7px 6px", borderRadius: "11px", background: HUNDIDO_B.background };
/* Lo que se revela (lote 6d): sin ícono, 2 px #F8F9FA, 0,7 s después del error. */
const REVELA = "fae-b5h-revela";
const NOMBRE_MESA = { margin: "0 0 5px", fontFamily: SORA, fontWeight: 700, fontSize: "12px", lineHeight: 1.25, color: COLOR.blanco, textAlign: "center" };

/* La cifra que iba: «Iba aquí: $180.000», sobre la pieza donde iba, 0,7 s después del error. */
function ValorCorrecto({ cuenta, valor }) {
  return (
    <p data-valor-correcto={cuenta} data-pastilla={REVELADA} className={REVELA} style={{
      display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "center", gap: "0 4px", margin: "5px 0 0", padding: "5px 6px", borderRadius: "10px",
      border: ACIERTO_B, color: COLOR.blanco, textAlign: "center",
    }}>
      <span data-palabra style={{ fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px", whiteSpace: "nowrap" }}>{`${PALABRA_B.ibaAqui}:`}</span>
      <span style={{ ...CIFRA, fontSize: "14px", fontWeight: 700, whiteSpace: "nowrap" }}>{pesos(valor)}</span>
    </p>
  );
}

function Mesa({ mesa, onSacar, onCifra, onDevolver, activa, resultado, enEstante, entre = null }) {
  const conValor = mesa.map((m) => ({ ...m, valor: leerCifra(m.texto) }));
  const t = totalesDe(conValor);
  const cierra = t.debe > 0 && t.debe === t.haber;
  const juzgada = Boolean(resultado) && !resultado.ok;
  const esperado = resultado?.esperado ?? [];
  /* «cuenta»: sobra o está en la columna equivocada; «valor»: va, pero con otro valor. */
  const errorDe = (m) => {
    if (!juzgada) return null;
    const e = esperado.find((x) => x.cuenta === m.cuenta);
    if (!e || e.lado !== m.lado) return "cuenta";
    return leerCifra(m.texto) !== e.valor ? "valor" : null;
  };
  const faltan = juzgada ? esperado.filter((e) => !mesa.some((m) => m.cuenta === e.cuenta && m.lado === e.lado)) : [];
  const columna = (lado) => (
    <div data-columna={lado} style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: "7px" }}>
      <Colector lado={lado} total={lado === DEBE ? t.debe : t.haber} />
      {mesa.filter((m) => m.lado === lado).map((m) => {
        const error = errorDe(m);
        return (
        <div key={m.cuenta} data-en-mesa={m.cuenta} data-marca={error === "cuenta" ? TACHADA : ""} style={{
          ...TARJETA, ...estiloE4(error === "cuenta" ? TACHADA : null, BORDE_TARJETA),
          animation: "fae-b5k-entra 200ms ease-out both",
        }}>
          <p data-nombre-mesa style={{ ...NOMBRE_MESA, ...(error === "cuenta" ? TACHADO : null) }}>
            <span>{m.cuenta}</span>
          </p>
          {error === "cuenta" && <p style={{ margin: "0 0 5px", display: "flex", justifyContent: "center" }}><Pastilla marca={TACHADA} envuelve /></p>}
          <Campo id={m.cuenta} valor={m.texto} onCambio={(v) => onCifra(m.cuenta, v)} bloqueado={!activa}
            etiqueta={`Valor de ${m.cuenta}`} tachado={error !== null} />
          {error === "valor" && <p style={{ margin: "5px 0 0", display: "flex", justifyContent: "center" }}><Pastilla marca={TACHADA} envuelve /></p>}
          {error === "valor" && <ValorCorrecto cuenta={m.cuenta} valor={esperado.find((x) => x.cuenta === m.cuenta).valor} />}
          {activa && (
            <button type="button" data-devolver={m.cuenta} onClick={() => onDevolver(m.cuenta)} style={{
              display: "block", width: "100%", minHeight: "44px", marginTop: "3px", background: "none", border: "none", cursor: "pointer",
              color: COLOR.apagado, fontFamily: SORA, fontSize: "12px",
            }}>
              devolver al estante
            </button>
          )}
        </div>
        );
      })}
      {/* La cuenta que faltaba: al final de su columna, «Iba aquí» con el valor correcto, 0,7 s después. */}
      {faltan.filter((e) => e.lado === lado).map((e) => (
        <div key={`falta-${e.cuenta}`} data-faltaba={e.cuenta} data-marca={REVELADA} className={REVELA} style={{ ...TARJETA, border: ACIERTO_B }}>
          <p style={{ margin: "0 0 5px", display: "flex", justifyContent: "center" }}><Pastilla marca={REVELADA} envuelve /></p>
          <p style={NOMBRE_MESA}>
            <span>{e.cuenta}</span>
          </p>
          <p style={{ margin: 0, ...CIFRA, fontSize: "14px", fontWeight: 700, color: COLOR.blanco, textAlign: "center" }}>{pesos(e.valor)}</p>
        </div>
      ))}
    </div>
  );
  return (
    <>
      <div data-mesa style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
        {columna(DEBE)}
        {columna(HABER)}
      </div>
      <div data-conector={cierra ? "cerrado" : "abierto"} style={{ margin: "10px 0 0", textAlign: "center" }}>
        <svg aria-hidden="true" viewBox="0 0 100 10" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "10px" }}>
          {/* Lote 14: cerrado es neutro (2 px sólido #F8F9FA, §5.2: el acierto no va en teal). */}
          <line x1="18" y1="5" x2="82" y2="5" stroke={cierra ? TEXTO_B : "rgba(248,249,250,0.35)"} strokeWidth={cierra ? 2 : 1.4} strokeLinecap="round"
            strokeDasharray={cierra ? undefined : "4 4"} vectorEffect="non-scaling-stroke" />
        </svg>
        {!cierra && (t.debe > 0 || t.haber > 0) && (
          <p data-diferencia={Math.abs(t.debe - t.haber)} style={{ margin: "4px 0 0", ...CIFRA, fontSize: "12px", color: COLOR.apagado }}>
            {TEXTO_DIFERENCIA}: {pesos(Math.abs(t.debe - t.haber))}
          </p>
        )}
      </div>
      <p style={SOLO_LECTOR}>
        {cierra
          ? `El conector está cerrado: ${pesos(t.debe)} al debe contra ${pesos(t.haber)} al haber.`
          : `El conector está abierto. Debe ${pesos(t.debe)}, haber ${pesos(t.haber)}.`}
      </p>
      {/* Lote 6c (B1): el hecho del asiento va entre la mesa y el estante; la mesa, que es la figura, arriba. */}
      {entre && <div data-entre-mesa-y-estante style={{ margin: "12px 0 0" }}>{entre}</div>}
      {activa && (
        <>
          <p data-rotulo-estante style={{ margin: "8px 0 6px", fontFamily: SORA, fontSize: "12px", fontWeight: 700, letterSpacing: "0.16em", color: COLOR.apagado }}>
            {ROTULO_ESTANTE}
          </p>
          <Estante cuentas={enEstante} onSacar={onSacar} />
        </>
      )}
    </>
  );
}

/* La devolución (lote 6d): el bloque de mensaje del modelo T4; el veredicto es `resultado.ok`, nunca el texto. */
function Retro({ resultado }) {
  return (
    <div data-retro>
      <RegionViva>
        {resultado && (
          <div data-panel={resultado.ok ? "acierto" : "error"} data-error={resultado.error ?? "ninguno"}>
            <Mensaje ok={resultado.ok} texto={resultado.texto || null} />
          </div>
        )}
      </RegionViva>
    </div>
  );
}

const vacio = () => ({ mesa: [], resultado: null, texto: "" });

/*
 * Una pregunta de cifra escrita: lo que lleva encima (si lo lleva), el campo y, si falló, la cifra
 * correcta. Lote 6c (E4 en todo Hacer): si acertó, su propia cifra queda marcada; las tres preguntas
 * llevan marca de acierto y de error (lote 6d: «Correcto», «No va aquí» e «Iba aquí: {valor}»).
 */
function Pregunta({ parte, texto, onTexto, resultado, Bloque, reducido, etiqueta }) {
  const fallo = Boolean(resultado) && !resultado.ok;
  return (
    <>
      {Bloque && <Bloque comprobada={Boolean(resultado)} reducido={reducido} texto={texto} />}
      <div data-pregunta={parte.id} style={{ marginTop: "12px" }}>
        <Campo id={parte.id} valor={texto} onCambio={onTexto} bloqueado={Boolean(resultado)} etiqueta={etiqueta}
          tachado={fallo} acertado={Boolean(resultado?.ok)} formatear={formatearRespuesta} />
        {resultado && <p style={{ margin: "5px 0 0", display: "flex", justifyContent: "center" }}><Pastilla marca={fallo ? TACHADA : CORRECTA} /></p>}
        {fallo && <ValorCorrecto cuenta={parte.id} valor={resultado.correcta} />}
      </div>
    </>
  );
}

export default function CierreConMesa({
  config, Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
  encima = null, onParteComprobada = null, onReiniciar = null, onAvanzar = null,
  /*
   * D8 (Célula C, opcional; sin ella, el estante va en el orden de `config.estante`, como siempre):
   * `mezclar(cuentas)` → las mismas cuentas en otro orden. Se baraja una vez al montar y otra con
   * «Otra vez»: el orden no cambia dentro de una partida y cambia en la siguiente.
   */
  mezclar = null,
}) {
  const t = useTanda(() => items ?? config.partes);
  const [barajado, setBarajado] = useState(() => (mezclar ? { base: config.estante, orden: mezclar(config.estante) } : null));
  /* Si la partida cambia de estante (otra vuelta con otras cuentas), se baraja ese. */
  const ordenEstante = !mezclar ? config.estante
    : barajado?.base === config.estante ? barajado.orden : mezclar(config.estante);
  if (mezclar && barajado?.base !== config.estante) setBarajado({ base: config.estante, orden: ordenEstante });
  const reducido = useReducido();
  const textos = config.textos ?? {};
  /* El ejemplo resuelto, su propio paso antes del primero (lote 6c): solo en la partida entera, no en «Así se juega» ni con `items`. */
  const [enEjemplo, setEnEjemplo] = useState(() => Boolean(config.ejemplo) && !modoDemo && !items);
  /*
   * Lote 20 (D9, P2 de Mai): un elemento visual propio de la actividad, opcional; sin él, nada cambia. Va
   * entre la devolución y «Siguiente asiento» (y en el ejemplo resuelto, bajo su explicación). Recibe las
   * partes y cuántas están confirmadas: lo que entra es siempre lo correcto (el registro), nunca la mesa.
   */
  const ElementoPropio = (!modoDemo && config.elementoPropio) || null;
  const idInstruccion = useId();
  const [s, setS] = useState(vacio);
  const [todos, setTodos] = useState([]);
  const tarjeta = useRef(null);
  const primeraVez = useRef(true);
  const parte = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuar(todos, cuantas);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (primeraVez.current) { primeraVez.current = false; return; }
    if (!modoDemo && !enEjemplo) tarjeta.current?.focus({ preventScroll: false });
  }, [t.i, enEjemplo]); // eslint-disable-line react-hooks/exhaustive-deps

  if (t.terminado) {
    const bien = todos.filter((x) => x.ok).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={() => {
          t.reiniciar(); setS(vacio()); setTodos([]); onReiniciar?.();
          if (mezclar) setBarajado({ base: config.estante, orden: mezclar(config.estante) });
        }} textoReiniciar="Otra vez">
          <p data-resumen-cierre style={TEXTO_CIERRE}>{config.resumen(bien, cuantas)}</p>
        </Cierre>
        {encima}
      </Marco>
    );
  }

  const encabezado = (contador) => (
    <EncabezadoCompacto objetivo={config.actividad.objetivo} consigna={config.actividad.consigna}
      pasos={config.reglas ?? []} regla={AVISO_UN_INTENTO} contador={contador} />
  );

  /* El ejemplo resuelto: la figura (el asiento ya hecho), el enunciado y la explicación, y «Empezar». */
  if (enEjemplo) {
    const e = config.ejemplo;
    const mesaEjemplo = e.asiento.map((m) => ({ cuenta: m.cuenta, lado: m.lado, texto: formatearCifra(String(m.valor)) }));
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS + CSS_B5H}</style>
        <div className={CLASE_B5H}>
        <div className="fae-b5k" data-ejemplo-resuelto {...config.atributos}>
          {encabezado(textos.ejemplo ?? "Ejemplo resuelto")}
          <Mesa mesa={mesaEjemplo} activa={false} resultado={null} enEstante={[]} onSacar={() => {}} onCifra={() => {}} onDevolver={() => {}} />
          <div data-tarjeta-parte={e.id} style={{ marginTop: "14px", padding: "11px 13px", borderRadius: "11px", background: "rgba(184,196,212,0.12)", borderLeft: `3px solid ${COLOR.neutro}` }}>
            <p data-hecho style={{ margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: COLOR.blanco }}>{e.hecho}</p>
          </div>
          {e.resolucion && (
            <div data-resolucion style={{ margin: "12px 0 0" }}>
              {e.resolucion.map((linea) => (
                <p key={linea} style={{ margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: COLOR.blanco }}>{linea}</p>
              ))}
            </div>
          )}
          {ElementoPropio && <ElementoPropio partes={t.items} hechas={0} ejemplo={e} actual={null} reducido={reducido} />}
        </div>
        <div data-boton-empezar>
          <Responder onClick={() => setEnEjemplo(false)}>{textos.empezar ?? "Empezar"}</Responder>
        </div>
        {encima && <div data-diario-al-final style={{ marginTop: "14px" }}>{encima}</div>}
        </div>
      </Marco>
    );
  }

  const comprobada = Boolean(s.resultado);
  const esPregunta = parte.tipo === "pregunta";
  const Visual = config.visual ?? null;
  /* Lote 17 (a2): lo que va a la izquierda de una pregunta (el tanque), con la cifra que se escribe. */
  const Lado = esPregunta ? config.lados?.[parte.lado] ?? null : null;
  const enEstante = ordenEstante.filter((c) => !s.mesa.some((m) => m.cuenta === c));
  const sacar = (cuenta, lado) => setS((x) => (x.mesa.some((m) => m.cuenta === cuenta) ? x : { ...x, mesa: [...x.mesa, { cuenta, lado, texto: "" }] }));
  const cifra = (cuenta, texto) => setS((x) => ({ ...x, mesa: x.mesa.map((m) => (m.cuenta === cuenta ? { ...m, texto } : m)) }));
  const devolver = (cuenta) => setS((x) => ({ ...x, mesa: x.mesa.filter((m) => m.cuenta !== cuenta) }));

  const confirmar = () => {
    if (esPregunta) {
      const r = evaluarPregunta(parte, s.texto);
      t.anotar(parte.id, r.ok, r.ok ? null : r.error);
      setTodos((xs) => [...xs, { id: parte.id, ok: r.ok }]);
      setS({ ...s, resultado: r });
      return;
    }
    const puestas = s.mesa.map((m) => ({ cuenta: m.cuenta, lado: m.lado, valor: leerCifra(m.texto) }));
    const r = config.evaluar(parte, puestas);
    t.anotar(parte.id, r.ok, r.ok ? null : r.error);
    setTodos((xs) => [...xs, { id: parte.id, ok: r.ok }]);
    /* Si falla, la mesa del estudiante se queda como la armó y lo correcto aparece junto (E4, en Mesa). */
    setS({ mesa: s.mesa, resultado: r });
    onParteComprobada?.(parte, r);
  };
  const avanzar = () => {
    setS(vacio());
    /* Nada dos veces (lote 6c): al empezar el siguiente, el diario se pliega; en el resumen se queda como está. */
    if (t.i + 1 < cuantas) onAvanzar?.();
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const hechoCard = (
    <div key={parte.id} data-tarjeta-parte={parte.id} style={{ padding: "11px 13px", borderRadius: "11px", background: "rgba(184,196,212,0.12)", borderLeft: `3px solid ${COLOR.neutro}` }}>
      <p ref={tarjeta} tabIndex={-1} data-hecho style={{ margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: COLOR.blanco }}>{esPregunta ? parte.enunciado : parte.hecho}</p>
    </div>
  );
  const rotuloParte = (parte.rotulo || s.resultado?.ok) ? (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", margin: "0 0 8px" }}>
      {s.resultado?.ok && <Visto />}
      {parte.rotulo && (
        <div>
          <p data-rotulo-parte style={{ margin: 0, fontFamily: SORA, fontSize: "14px", fontWeight: 700, color: COLOR.blanco }}>{parte.rotulo}</p>
          {/* La instrucción sale de la pantalla (lote 6c): la lee el lector, por aria-describedby de la parte. */}
          {parte.instruccion && <p id={idInstruccion} data-instruccion style={SOLO_LECTOR}>{parte.instruccion}</p>}
        </div>
      )}
    </div>
  ) : null;
  const listo = esPregunta ? leerRespuesta(s.texto) !== null : s.mesa.length > 0 && s.mesa.every((m) => leerCifra(m.texto) !== null);
  /* La parte: su rótulo y su pregunta (o su mesa), la devolución si `conRetro` y «Comprobar». */
  const seccion = (conRetro) => (
    <section key={`${parte.id}-parte`} data-parte={parte.id} data-estado-parte={comprobada ? "comprobada" : "activa"}
      aria-describedby={parte.instruccion ? idInstruccion : undefined}
      style={{
        /*
         * Sin borde y sin relleno lateral (hoja de Mai, calidad 1): un borde nunca toca el texto, y con
         * relleno «1.725.000» no cabe a 320. Lo que agrupaba el borde lo agrupan 16 px de aire.
         */
        margin: esPregunta ? "16px 0 0" : 0, padding: 0,
      }}>
      {esPregunta && rotuloParte}
      {esPregunta ? (
        <Pregunta parte={parte} texto={s.texto} onTexto={(texto) => setS((x) => ({ ...x, texto }))} resultado={s.resultado}
          Bloque={config.bloques?.[parte.bloque] ?? null} reducido={reducido} etiqueta={textos.campo} />
      ) : (
        <Mesa mesa={s.mesa} activa={!comprobada} resultado={s.resultado} enEstante={enEstante}
          onSacar={sacar} onCifra={cifra} onDevolver={devolver} entre={<>{rotuloParte}{hechoCard}</>} />
      )}
      {conRetro && <Retro resultado={s.resultado} />}
      {!comprobada && (
        <>
          <BotonConfirmar deshabilitado={!listo} onClick={confirmar}>{esPregunta ? textos.comprobar ?? COMPROBAR_B : COMPROBAR_B}</BotonConfirmar>
          {!modoDemo && !esPregunta && (
            <p data-un-intento style={{ margin: "9px 0 0", fontSize: "12px", lineHeight: 1.45, color: COLOR.apagado, textAlign: "center" }}>{AVISO_UN_INTENTO}</p>
          )}
        </>
      )}
    </section>
  );

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS + CSS_B5H}</style>
      <div className={CLASE_B5H}>
      <div className="fae-b5k" {...config.atributos}>
        {!modoDemo && encabezado(`${textos.etiqueta ?? "Asiento"} ${t.i + 1} de ${cuantas}`)}
        {Visual && !modoDemo && <Visual paso={t.i} comprobada={comprobada} reducido={reducido} texto={esPregunta ? s.texto : ""} />}

        {esPregunta && !Lado && hechoCard}

        {Lado ? (
          <>
            <div data-fila-lado style={{ display: "grid", gridTemplateColumns: "84px minmax(0, 1fr)", columnGap: "10px", alignItems: "start" }}>
              <Lado parte={parte} texto={s.texto} resultado={s.resultado} reducido={reducido} />
              <div style={{ minWidth: 0 }}>{hechoCard}{seccion(false)}</div>
            </div>
            <Retro resultado={s.resultado} />
          </>
        ) : seccion(true)}

        {ElementoPropio && (
          <ElementoPropio partes={t.items} hechas={t.i + (comprobada ? 1 : 0)} ejemplo={config.ejemplo} actual={comprobada ? parte : null} reducido={reducido} />
        )}

        {/* El ejemplo de «Así se juega» termina con su explicación. */}
        {comprobada && parte.resolucion && (
          <div data-resolucion style={{ margin: "14px 0 0", padding: "11px 13px", borderRadius: "11px", background: "rgba(184,196,212,0.13)", borderLeft: `3px solid ${COLOR.neutro}` }}>
            {parte.resolucion.map((linea) => (
              <p key={linea} style={{ margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: COLOR.blanco }}>{linea}</p>
            ))}
          </div>
        )}
      </div>

      {comprobada && !modoDemo && (
        <div data-boton-avanzar>
          <Responder onClick={avanzar}>{t.i + 1 === cuantas ? VER_MI_RESUMEN : siguienteDe(textos.etiqueta ?? "Asiento")}</Responder>
        </div>
      )}

      {/* El libro diario, al final de la tarjeta, debajo de «Siguiente» (lote 6c). */}
      {encima && <div data-diario-al-final style={{ marginTop: "14px" }}>{encima}</div>}

      {!modoDemo && <p style={SOLO_LECTOR}>{config.alt}</p>}
      </div>
    </Marco>
  );
}

/* El botón de siempre, con su marca para el guion del tutorial. */
function BotonConfirmar({ deshabilitado, onClick, children }) {
  const caja = useRef(null);
  useLayoutEffect(() => { caja.current?.querySelector("button")?.setAttribute("data-confirmar-parte", "1"); });
  return <div ref={caja} data-confirmar-caja><Responder onClick={onClick} deshabilitado={deshabilitado}>{children}</Responder></div>;
}
