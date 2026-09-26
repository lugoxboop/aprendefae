import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { FAE } from "../../../theme.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../data/contabilidad.js";
import {
  OBJETIVO, ROTULO_TRANSACCION, ROTULO_ESTANTE, COLECTOR,
  TEXTO_CONFIRMAR, TEXTO_DIFERENCIA, SUBTEMA,
} from "../../../data/contabilidadAsientoCompuesto.js";
import {
  ASIENTOS, POR_PARTIDA, sortearEstratificado, estanteDe, evaluar,
  notaDelAsiento, puntuar, pesoDeCadaAsiento,
} from "../../../contabilidad/asientoCompuesto.js";
import { Retro, Pulsos, Cierre } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { CampoCifra, Responder, leerCifra, useTanda } from "./piezas.jsx";
import { EstilosDeVerbos, useNumeroQueSube, useMovimientoReducido, SOLO_LECTOR } from "./verbos.jsx";
import { TONO_ROTULO } from "./debeHaber/piezasDebeHaber.jsx";
import { partirPorFrases } from "./ElAsientoSimple.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A7 · EL ASIENTO COMPUESTO.
 *
 * Aquí no hay arcos de una cuenta a otra, y esa ausencia es la lección: en un
 * asiento compuesto no hay parejas. Todas las cuentas del debe vierten en un
 * COLECTOR, todas las del haber en otro, y un único CONECTOR entre los dos
 * cierra cuando las sumas coinciden. Lo que cuadra son los totales.
 *
 * ═══════════ DOS COLUMNAS FIJAS, PASE LO QUE PASE ═══════════
 *
 * A 375 px la mesa son dos columnas y no se negocia. Una cuenta nueva se
 * añade como FILA NUEVA dentro de su columna: no encoge a las que ya están ni
 * las mueve de sitio. Con dos cuentas hay una fila en cada columna; con
 * cuatro, dos filas en cada una, y las dos primeras siguen donde estaban.
 *
 * ═══════════ LA T CON DOS LÍNEAS ES EL ERROR, NO EL ADORNO ═══════════
 *
 * Si el estudiante funde dos activos en una sola cuenta, esa T recibe DOS
 * anclajes: está reclamando dos cosas a la vez. Ese doble anclaje ES la
 * señal, y por eso se calcula con una regla aritmética exacta y no con una
 * corazonada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-a7-traza { from { stroke-dashoffset: 320; } to { stroke-dashoffset: 0; } }
.fae-a7-ancla { stroke-dasharray: 320; animation: fae-a7-traza 500ms ease-out both; }
@keyframes fae-a7-entra { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
.fae-a7-entra { animation: fae-a7-entra 300ms cubic-bezier(.26,.84,.38,1) both; }
@media (prefers-reduced-motion: reduce) {
  .fae-a7-ancla, .fae-a7-entra { animation: none !important; opacity: 1 !important; stroke-dashoffset: 0 !important; transform: none !important; }
}
`;

const SORA = "Sora, sans-serif";
const NEUTRO = "#B8C4D4";
const NAVY = "#1D3557";
const BANDA = 30;
const MS_ANCLAJE = 1500;
const CIFRA = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontVariantNumeric: "tabular-nums",
};

/* El colector de una columna: fijo en su encabezado, contando hacia arriba. */
function Colector({ lado, total }) {
  const visible = useNumeroQueSube(total, 300);
  return (
    <div data-colector={lado} style={{
      position: "sticky", top: 0, zIndex: 2, padding: "7px 6px", borderRadius: "10px",
      background: `${COLOR_LADO[lado]}1A`, border: `1px solid ${COLOR_LADO[lado]}`, textAlign: "center",
    }}>
      <p style={{
        margin: 0, fontFamily: SORA, fontSize: "8.5px", fontWeight: 700,
        letterSpacing: "0.1em", color: TONO_ROTULO[lado],
      }}>
        {lado === DEBE ? COLECTOR.debe : COLECTOR.haber}
      </p>
      <p data-total={lado} style={{ margin: "2px 0 0", ...CIFRA, fontSize: "12.5px", fontWeight: 700, color: FAE.text }}>
        {pesos(visible)}
      </p>
    </div>
  );
}

/* Una cuenta en la mesa: su nombre, su campo de valor y su ▲ al confirmar. */
function CuentaEnLaMesa({
  puesta, indice, lado, senales, creceP, sube, suelta, onCifra, onQuitar, deshabilitado, refT,
}) {
  return (
    <div
      ref={refT}
      data-en-mesa={puesta.cuenta}
      data-lado={lado}
      className="fae-a7-entra"
      style={{
        padding: "7px 6px", borderRadius: "11px",
        background: "rgba(10,20,34,0.45)",
        border: `1px ${suelta ? "dashed" : "solid"} ${suelta ? FAE.coral : "rgba(248,249,250,0.14)"}`,
      }}
    >
      <p style={{
        margin: "0 0 4px", fontFamily: SORA, fontWeight: 700, fontSize: "10.5px",
        lineHeight: 1.2, color: FAE.text, textAlign: "center",
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        overflow: "hidden", minHeight: "25px",
      }}>
        {puesta.cuenta}
      </p>
      <span aria-hidden="true" style={{
        display: "block", height: "12px", lineHeight: "12px", fontSize: "10px",
        textAlign: "center", color: COLOR_LADO[creceP ?? lado],
      }}>
        {senales && creceP && <span data-triangulo={creceP}>▲</span>}
        {senales && creceP && <span data-flecha={sube ? "sube" : "baja"}>{sube ? " ↑" : " ↓"}</span>}
      </span>
      <CampoCifra
        valor={puesta.texto}
        onCambio={(v) => onCifra(indice, v)}
        deshabilitado={deshabilitado}
        etiqueta={`Valor de ${puesta.cuenta}`}
      />
      {!deshabilitado && (
        <button
          type="button"
          data-devolver={puesta.cuenta}
          onClick={() => onQuitar(indice)}
          style={{
            display: "block", width: "100%", marginTop: "4px", padding: "3px",
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(248,249,250,0.45)", fontFamily: SORA, fontSize: "9.5px",
          }}
        >
          devolver al estante
        </button>
      )}
    </div>
  );
}

export default function ElAsientoCompuestoNuevo({ Marco, rotulo, titulo, acento, onCompletar }) {
  const reducido = useMovimientoReducido();
  const t = useTanda(() => sortearEstratificado(barajar).map((a) => ({ a, estante: estanteDe(a, barajar) })));

  /* Lo que hay en la mesa: [{ cuenta, lado, texto }]. */
  const [mesa, setMesa] = useState([]);
  const [r, setR] = useState(null);
  const [notas, setNotas] = useState([]);
  const [curvas, setCurvas] = useState([]);
  const [curvasVivas, setCurvasVivas] = useState(false);
  const [frasesFijas, setFrasesFijas] = useState([]);
  const reloj = useRef(null);
  const zonaBoton = useRef(null);
  const lienzo = useRef(null);
  const refsT = useRef({});
  const refsChip = useRef({});

  const actual = t.items[t.i];
  const a = actual?.a;
  const cuantos = t.items.length;
  const pct = puntuar(notas, cuantos);

  useEffect(() => {
    if (t.terminado) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);

  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => { if (r) zonaBoton.current?.querySelector("button")?.focus(); }, [r]);

  const conValor = mesa.map((m) => ({ ...m, valor: leerCifra(m.texto) }));
  const totalDe = (lado) => conValor
    .filter((m) => m.lado === lado && m.valor != null)
    .reduce((s, m) => s + m.valor, 0);
  const totalDebe = totalDe(DEBE);
  const totalHaber = totalDe(HABER);
  const cierra = totalDebe > 0 && totalDebe === totalHaber;

  /* Las curvas se miden, igual que en A6: nada de coordenadas adivinadas. */
  useLayoutEffect(() => {
    if (!r) { setCurvas([]); return; }
    const caja = lienzo.current?.getBoundingClientRect();
    if (!caja) return;
    const trazos = [];
    for (const m of mesa) {
      const t0 = refsT.current[m.cuenta];
      if (!t0) continue;
      for (const frase of r.anclasDe(m.cuenta)) {
        const chip = refsChip.current[frase];
        if (!chip) continue;
        const c = chip.getBoundingClientRect();
        const b = t0.getBoundingClientRect();
        trazos.push({
          clave: `${m.cuenta}::${frase}`,
          cuenta: m.cuenta,
          x1: b.left + b.width / 2 - caja.left,
          y1: b.top - caja.top,
          x2: c.left + c.width / 2 - caja.left,
          y2: c.bottom - caja.top,
        });
      }
    }
    setCurvas(trazos);
    setCurvasVivas(true);
    clearTimeout(reloj.current);
    reloj.current = setTimeout(() => setCurvasVivas(false), reducido ? 1 : MS_ANCLAJE);
  }, [r, mesa, reducido]);

  const sacar = (cuenta, lado) => {
    if (r || mesa.some((m) => m.cuenta === cuenta)) return;
    setMesa((xs) => [...xs, { cuenta, lado, texto: "" }]);
  };
  const quitar = (indice) => { if (!r) setMesa((xs) => xs.filter((_, i) => i !== indice)); };
  const escribir = (indice, texto) => {
    if (r) return;
    setMesa((xs) => xs.map((m, i) => (i === indice ? { ...m, texto } : m)));
  };

  const listo = mesa.length >= 3 && conValor.every((m) => m.valor != null && m.valor > 0);

  const confirmar = () => {
    if (r || !listo) return;
    const nuevo = evaluar(a, conValor);
    t.anotar(a.id, nuevo.perfecto, nuevo.perfecto ? null : JSON.stringify(conValor));
    setNotas((xs) => [...xs, notaDelAsiento(nuevo)]);
    setFrasesFijas((xs) => [...new Set([...xs, ...mesa.flatMap((m) => nuevo.anclasDe(m.cuenta))])]);
    setR(nuevo);
  };

  const avanzar = () => {
    setR(null); setMesa([]); setCurvas([]); setFrasesFijas([]);
    refsT.current = {}; clearTimeout(reloj.current);
    if (t.i + 1 < cuantos) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => {
    t.reiniciar(); setR(null); setMesa([]); setNotas([]); setCurvas([]); setFrasesFijas([]);
    refsT.current = {};
  };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {cuantos} asientos compuestos, {pesoDeCadaAsiento(cuantos).toFixed(2)} % cada uno —
            y dentro de cada uno, cuatro cuartas partes: cuántas cuentas y en qué columna, los
            nombres, los lados y los valores.
          </p>
        </Cierre>
      </Marco>
    );
  }

  const frasesVisibles = [...new Set([...frasesFijas, ...(r ? mesa.flatMap((m) => r.anclasDe(m.cuenta)) : [])])];
  const trozos = partirPorFrases(a.texto, frasesVisibles);
  const enEstante = actual.estante.filter((c) => !mesa.some((m) => m.cuenta === c));

  const columna = (lado) => (
    <div style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: "7px" }}>
      <Colector lado={lado} total={lado === DEBE ? totalDebe : totalHaber} />
      {mesa.map((m, i) => (m.lado === lado
        ? (
          <CuentaEnLaMesa
            key={m.cuenta}
            puesta={m}
            indice={i}
            lado={lado}
            senales={Boolean(r)}
            creceP={a.cuentas.find((c) => c.cuenta === m.cuenta)?.creceP ?? null}
            sube={a.cuentas.find((c) => c.cuenta === m.cuenta)?.sube ?? false}
            suelta={Boolean(r) && r.sinAncla === m.cuenta}
            onCifra={escribir}
            onQuitar={quitar}
            deshabilitado={Boolean(r)}
            refT={(el) => { if (el) refsT.current[m.cuenta] = el; }}
          />
        )
        : null))}
      {mesa.filter((m) => m.lado === lado).length === 0 && (
        <p style={{ margin: 0, padding: "14px 4px", textAlign: "center", fontSize: "10.5px", color: "rgba(248,249,250,0.3)" }}>
          — vacía —
        </p>
      )}
    </div>
  );

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <EstilosDeVerbos />
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={cuantos} hechos={t.i + (r ? 1 : 0)} etiqueta="Asiento" />
      </div>

      <div ref={lienzo} style={{ position: "relative" }}>
        <p style={{
          margin: "0 0 5px", fontFamily: SORA, fontSize: "10px",
          fontWeight: 700, letterSpacing: "0.14em", color: acento,
        }}>
          {ROTULO_TRANSACCION}
        </p>
        <p data-enunciado style={{
          margin: 0, padding: "9px 11px", borderRadius: "12px", fontSize: "12.5px", lineHeight: 1.55,
          color: FAE.text, background: "rgba(10,20,34,0.4)", border: "1px solid rgba(248,249,250,0.12)",
        }}>
          {trozos.map((x, k) => (x.frase
            ? (
              <span
                key={`${x.frase}-${k}`}
                data-frase={x.frase}
                ref={(el) => { if (el) refsChip.current[x.frase] = el; }}
                style={{ padding: "1px 4px", borderRadius: "5px", background: NEUTRO, color: NAVY, fontWeight: 700 }}
              >
                {x.texto}
              </span>
            )
            : <span key={k}>{x.texto}</span>))}
        </p>

        <div aria-hidden="true" style={{ height: `${BANDA}px` }} />

        {/* LA MESA: dos columnas fijas. Una cuenta nueva abre fila en la suya. */}
        <div data-mesa style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
          {columna(DEBE)}
          {columna(HABER)}
        </div>

        {r && (
          <svg
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}
          >
            {curvasVivas && curvas.map((c) => (
              <path
                key={c.clave}
                data-ancla={c.cuenta}
                className={reducido ? undefined : "fae-a7-ancla"}
                d={`M ${c.x1} ${c.y1} C ${c.x1} ${c.y1 - BANDA * 0.7}, ${c.x2} ${c.y2 + BANDA * 0.7}, ${c.x2} ${c.y2}`}
                fill="none" stroke={NEUTRO} strokeWidth="1.4" strokeLinecap="round"
              />
            ))}
          </svg>
        )}
      </div>

      {/* EL CONECTOR: uno solo, entre los dos colectores. */}
      <div data-conector={cierra ? "cerrado" : "abierto"} style={{ margin: "10px 0 0", textAlign: "center" }}>
        <svg aria-hidden="true" viewBox="0 0 100 10" preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: "10px" }}>
          <line
            x1="18" y1="5" x2="82" y2="5"
            stroke={cierra ? FAE.teal : "rgba(248,249,250,0.35)"}
            strokeWidth="1.4" strokeLinecap="round"
            strokeDasharray={cierra ? undefined : "4 4"}
            vectorEffect="non-scaling-stroke"
          />
          {cierra && <circle cx="50" cy="5" r="2" fill={FAE.teal} vectorEffect="non-scaling-stroke" />}
        </svg>
        {!cierra && (totalDebe > 0 || totalHaber > 0) && (
          <p data-diferencia={Math.abs(totalDebe - totalHaber)} style={{
            margin: "4px 0 0", ...CIFRA, fontSize: "11.5px", color: "rgba(248,249,250,0.6)",
          }}>
            {TEXTO_DIFERENCIA}: {pesos(Math.abs(totalDebe - totalHaber))}
          </p>
        )}
      </div>
      <p style={SOLO_LECTOR}>
        {cierra
          ? `El conector está cerrado: ${pesos(totalDebe)} al debe contra ${pesos(totalHaber)} al haber.`
          : `El conector está abierto. Debe ${pesos(totalDebe)}, haber ${pesos(totalHaber)}.`}
      </p>

      {!r && (
        <>
          <p style={{
            margin: "14px 0 8px", fontFamily: SORA, fontSize: "10.5px",
            fontWeight: 700, letterSpacing: "0.16em", color: acento,
          }}>
            {ROTULO_ESTANTE}
          </p>
          <div data-estante style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {enEstante.map((c) => (
              <div key={c} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span style={{ flex: 1, minWidth: 0, fontSize: "11.5px", color: FAE.text }}>{c}</span>
                {[DEBE, HABER].map((lado) => (
                  <button
                    key={lado}
                    type="button"
                    data-sacar={`${c}:${lado}`}
                    onClick={() => sacar(c, lado)}
                    style={{
                      flex: "none", padding: "5px 9px", borderRadius: "8px", cursor: "pointer",
                      background: `${COLOR_LADO[lado]}14`, border: `1px solid ${COLOR_LADO[lado]}66`,
                      color: TONO_ROTULO[lado], fontFamily: SORA, fontSize: "9.5px", fontWeight: 700,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {lado === DEBE ? "AL DEBE" : "AL HABER"}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {r && <Retro texto={r.texto} />}

      {!r
        ? <Responder onClick={confirmar} deshabilitado={!listo}>{TEXTO_CONFIRMAR}</Responder>
        : (
          <div ref={zonaBoton}>
            <Responder onClick={avanzar}>
              {t.i + 1 === cuantos ? "Ver el resultado" : "Siguiente asiento"}
            </Responder>
          </div>
        )}

      {!r && !listo && (
        <p style={{ margin: "9px 0 0", fontSize: "12px", color: "rgba(248,249,250,0.45)", textAlign: "center" }}>
          Saca del estante las cuentas que se mueven, ponlas en su columna y escribe cada valor.
        </p>
      )}

      <p style={SOLO_LECTOR}>{OBJETIVO}</p>
    </Marco>
  );
}

export { SUBTEMA };
