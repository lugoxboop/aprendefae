import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { DEBE, pesos } from "../../../../data/contabilidad.js";
import { CONSIGNAS_CUADRA, OBJETIVO_T2_NUEVAS } from "../../../../data/contabilidadT2HacerNuevas.js";
import {
  CUADRA, NO_CUADRA, anchoCifra, evaluarCuadra, figuraCuadra, prepararCuadra, puntuar, sumas,
} from "../../../../contabilidad/t2HacerNuevas.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, leerCifra, useRelojes, useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { RETARDO_IBA_MS } from "../tema3/segundaDecision.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Devolucion } from "../t7/hacerT7.jsx";
import {
  CORRECTA, IconoX, Pastilla, REVELADA, TACHADA, botonDeAvance, COMPROBAR_B,
} from "../b5/Devolucion.jsx";
import {
  CSS_T2_NUEVAS, CSS_T2_DELTA, Hecho, PAUSA_VEREDICTO_MS, Pie, RAIZ_T2, movimientoReducido,
} from "./comunT2.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · 8.º HACER · CUADRA POR VALOR (cu-cuadra-por-valor). Célula C.
 *
 * La forma es la de Watari, lote T2-4 (c-t2-4-watari-figuras.md §1), sobre la
 * auditoría de Mello (c-t2-3-mello-auditoria.md §1.1): el estudiante VE subir
 * las columnas del debe y del haber hasta su valor cuando comprueba o decide,
 * no mientras teclea. Tres tipos de caso, un intento cada uno:
 *   completar  la cifra escrita se ve solo en «Tu cifra». Antes de
 *              «Comprobar», el hueco es un tramo FIJO de 28 px con «?» (mide
 *              igual con cualquier cifra: prueba C5) y la suma de su lado dice «?».
 *   juzgar     «Cuadra» o «No cuadra». El asiento llega sin sumas ni columnas.
 *   encontrar  los renglones son botones de 44 px; se toca el que descuadra.
 *
 * Al decidir, a los 0 ms: las columnas (scaleY, 380 ms), la línea de nivel,
 * las sumas y la consecuencia («Faltan…» o «Sobran…»). A los 380 ms, el
 * veredicto: la pastilla, el retro de Near y «Siguiente». Si fue error, «Iba
 * aquí» llega 0,7 s después (RETARDO_IBA_MS de main; Mello, auditoría T2-5
 * §1, lote T2-6). Con movimiento reducido, consecuencia y veredicto a la vez;
 * la pausa de «Iba aquí» se mantiene.
 *
 * El ancho de la cifra sale de la cifra más larga del asiento (`--cifra`, en
 * ch); con millones (más de 8 caracteres) el asiento va `.apilado`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* El asiento en tabla (Watari): nombre, debe, haber; la fila de sumas cuando toca. */
function Asiento({ lineas, relleno = null, comprobado = false, sumasVisibles = false }) {
  const s = sumas(lineas, comprobado ? relleno : 0);
  const huecoLado = lineas.find((l) => l.monto == null)?.lado ?? null;
  const total = (ld) => (huecoLado === ld && !comprobado ? "?" : pesos(s[ld]));
  /* Sin comprobar, el ancho no mira lo tecleado: la tabla tampoco calcula al teclear. */
  const { cifra, apilado } = anchoCifra(lineas, comprobado && relleno != null ? [relleno, s.debe, s.haber] : [s.debe, s.haber]);
  const celda = (l, ld) => {
    if (l.lado !== ld) return "";
    if (l.monto != null) return pesos(l.monto);
    return comprobado ? pesos(relleno ?? 0) : <span className="hueco" data-hueco>$?</span>;
  };
  return (
    <table className={`asiento${apilado ? " apilado" : ""}`} style={{ "--cifra": cifra }} data-asiento data-apilado={apilado ? "true" : "false"}>
      <tbody>
        {lineas.map((l, k) => (
          <tr key={k} data-fila={k}>
            <td>{l.cuenta}</td>
            <td className="num td">{celda(l, "debe")}</td>
            <td className="num th">{celda(l, "haber")}</td>
          </tr>
        ))}
        {sumasVisibles && (
          <tr className="sum">
            <td>Sumas</td>
            <td className="num" data-total="debe">{total("debe")}</td>
            <td className="num" data-total="haber">{total("haber")}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

/* Las dos columnas (Watari §1), a partir de figuraCuadra: la geometría no depende de lo tecleado. */
function Columnas({ lineas, relleno = null, comprobado, entra = false, culpa = null, mal = false }) {
  const f = figuraCuadra(lineas, { relleno, comprobado });
  const tramo = (t, ld) => {
    if (t.fijo) return <span key={t.k} className="bar fijo" data-tramo={t.k} data-fijo="true" aria-hidden="true">?</span>;
    const cls = ["bar", t.tuya ? "tuya" : "", t.tuya && mal ? "mal" : "", culpa === t.k ? "culpa" : ""].filter(Boolean).join(" ");
    return (
      <span key={t.k} className={cls} data-tramo={t.k} data-lado={ld} style={{ height: `${t.alto}%` }} aria-hidden="true">
        {t.monto >= f.escala * 0.22 ? pesos(t.monto) : ""}
      </span>
    );
  };
  const suma = (ld) => (f[ld].some((t) => t.fijo) ? "?" : pesos(f.sumas[ld]));
  return (
    <div data-columnas>
      <div className={`columnas${entra ? " entra" : ""}${comprobado ? " comprobado" : ""}`}>
        {f.nivel && <span className={`nivel${f.nivel.igual ? " igual" : ""}`} data-nivel={f.nivel.igual ? "igual" : "desigual"} style={{ bottom: `${f.nivel.alto}%` }} />}
        <div className="col d"><div className="pila">{f.debe.map((t) => tramo(t, "debe"))}</div></div>
        <div className="col h"><div className="pila">{f.haber.map((t) => tramo(t, "haber"))}</div></div>
        {f.marca && <span className={`hueco-barra ${f.marca.lado === DEBE ? "d" : "h"}`} data-marca={f.marca.lado} style={{ bottom: `${f.marca.desde}%`, height: `${f.marca.alto}%` }} />}
      </div>
      <p className="conteo" style={{ marginTop: "4px" }}>
        <span data-conteo="debe">Debe · {suma("debe")}</span>
        <span data-conteo="haber">Haber · {suma("haber")}</span>
      </p>
    </div>
  );
}

function Falla({ texto }) {
  if (!texto) return null;
  return <p className="falla" data-consecuencia="error"><IconoX color="#EE8266" /><span>{texto}</span></p>;
}

const MARCA_DE = { correcta: CORRECTA, incorrecta: TACHADA, revelada: REVELADA };
const CLASE_DE = { elegida: "elegida", correcta: "bien", incorrecta: "malb", revelada: "pista" };

export default function CuadraPorValor({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null, pausado = false,
}) {
  const t = useTanda(() => items ?? prepararCuadra(barajar));
  const [cifra, setCifra] = useState("");
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  /* null mientras se pregunta; «consecuencia» a los 0 ms; «veredicto» a los 380 ms; «iba» a los 380 + 700 ms, solo en el error. */
  const [fase, setFase] = useState(null);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const campo = useRef(null);
  const { despues, limpiar } = useRelojes(pausado);

  const caso = t.items[t.i];
  const cuantos = t.items.length;
  const veredicto = fase === "veredicto" || fase === "iba";
  const revelar = fase === "iba";

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(puntuar(bien, cuantos), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (veredicto && !modoDemo) zonaBoton.current?.querySelector("button")?.focus(); }, [veredicto]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!r && !modoDemo) campo.current?.focus(); }, [t.i, r]); // eslint-disable-line react-hooks/exhaustive-deps

  /* UN intento: la primera respuesta es la que cuenta. */
  const responder = (respuesta) => {
    if (r || respuesta == null) return;
    const nuevo = evaluarCuadra(caso, respuesta);
    t.anotar(caso.id, nuevo.ok, String(respuesta));
    if (nuevo.ok) setBien((n) => n + 1);
    setElegida(respuesta);
    setR(nuevo);
    const alVeredicto = () => { setFase("veredicto"); if (!nuevo.ok) despues(RETARDO_IBA_MS, () => setFase("iba")); };
    if (movimientoReducido()) alVeredicto();
    else { setFase("consecuencia"); despues(PAUSA_VEREDICTO_MS, alVeredicto); }
  };

  const avanzar = () => {
    limpiar();
    setR(null); setElegida(null); setCifra(""); setFase(null);
    if (t.i + 1 < cuantos) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => { limpiar(); t.reiniciar(); setR(null); setElegida(null); setCifra(""); setBien(0); setFase(null); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(puntuar(bien, cuantos))} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p data-resumen style={TEXTO_CIERRE}>{bien} de {cuantos} asientos al primer intento.</p>
        </Cierre>
      </Marco>
    );
  }

  const falta = caso.lineas.findIndex((l) => l.monto == null);
  const escrita = leerCifra(cifra);
  const decidido = Boolean(r);
  const relleno = caso.tipo === "completar" && decidido ? elegida : null;

  /* El estado de una opción o un renglón: «elegida» a los 0 ms; el veredicto a los 380. */
  const estadoDe = (valor, esCorrecta) => {
    if (!r) return null;
    if (valor === elegida) return veredicto ? (r.ok ? "correcta" : "incorrecta") : "elegida";
    if (revelar && !r.ok && esCorrecta) return "revelada";
    return null;
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T2_NUEVAS}</style>
      <style>{CSS_T2_DELTA}</style>
      <div className={RAIZ_T2} data-t2-cuadra={caso.tipo} data-caso={caso.id} data-fase={fase ?? "pregunta"}>
        {!modoDemo && (
          <div>
            <Encabezado objetivo={OBJETIVO_T2_NUEVAS["cu-cuadra-por-valor"]} consigna={CONSIGNAS_CUADRA[caso.tipo]} onComoSeJuega={onComoSeJuega} />
            <Pulsos total={cuantos} hechos={t.i + (r ? 1 : 0)} enCurso={t.i + 1} etiqueta="Caso" />
          </div>
        )}

        {caso.tipo !== "completar" && <Hecho texto={caso.hecho} />}

        <section className="hund">
          {caso.tipo === "completar" && (
            <>
              <Asiento lineas={caso.lineas} relleno={relleno} comprobado={decidido} sumasVisibles />
              <Columnas lineas={caso.lineas} relleno={relleno} comprobado={decidido} mal={decidido && !r.ok} />
            </>
          )}
          {caso.tipo === "juzgar" && (
            <>
              <Asiento lineas={caso.lineas} sumasVisibles={decidido} comprobado />
              {decidido && <Columnas lineas={caso.lineas} comprobado entra />}
            </>
          )}
          {caso.tipo === "encontrar" && (
            <>
              <div className="renbs" role="group" aria-label="Los renglones del asiento">
                {caso.lineas.map((l, k) => {
                  const estado = estadoDe(k, caso.linea.includes(k));
                  return (
                    <span key={k} data-linea={k} style={{ display: "contents" }}>
                      <button type="button" className={`renb ${CLASE_DE[estado] ?? ""}`.trim()} data-estado={estado ?? "libre"}
                        disabled={decidido} onClick={() => responder(k)}>
                        <span className="c">{l.cuenta}</span>
                        <b className={`l ${l.lado === DEBE ? "td" : "th"}`}>{l.lado === DEBE ? "Debe" : "Haber"}</b>
                        <b className="m num">{pesos(l.monto)}</b>
                        {MARCA_DE[estado] && <span className="pas"><Pastilla marca={MARCA_DE[estado]} /></span>}
                      </button>
                    </span>
                  );
                })}
              </div>
              {decidido && (
                <p className="sumas-l" data-sumas>
                  <span>Sumas</span>
                  <b className="num td" data-total="debe">{pesos(r.sumas.debe)}</b>
                  <b className="num th" data-total="haber">{pesos(r.sumas.haber)}</b>
                </p>
              )}
              {decidido && <Columnas lineas={caso.lineas} comprobado entra culpa={veredicto && r.ok ? elegida : null} />}
            </>
          )}
          <Falla texto={r?.consecuencia} />
        </section>

        {caso.tipo === "completar" && (
          <div className="casilla">
            {!decidido ? (
              <form style={{ display: "contents" }} onSubmit={(e) => { e.preventDefault(); responder(escrita); }}>
                <label className="tucifra">
                  <span>Tu cifra</span>
                  <input ref={campo} type="text" inputMode="numeric" autoComplete="off" placeholder="$"
                    aria-label={`Valor de ${caso.lineas[falta].cuenta}`} value={cifra} onChange={(e) => setCifra(e.target.value)} />
                </label>
                <button type="submit" className="cmp" disabled={escrita == null}>{COMPROBAR_B}</button>
              </form>
            ) : (
              <>
                <p className={`escrito${veredicto ? (r.ok ? " bien" : " malb") : ""}`} data-escrito>
                  <span>Tu cifra</span><span className="num">{pesos(elegida)}</span>
                  {veredicto && <Pastilla marca={r.ok ? CORRECTA : TACHADA} />}
                </p>
                {revelar && (
                  <p className="escrito iba" data-iba>
                    <span>La cifra</span><span className="num">{pesos(r.correcta)}</span><Pastilla marca={REVELADA} />
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {caso.tipo === "juzgar" && (
          <div className="ops dos" role="group" aria-label={CONSIGNAS_CUADRA.juzgar}>
            {[[CUADRA, "Cuadra"], [NO_CUADRA, "No cuadra"]].map(([valor, texto]) => {
              const estado = estadoDe(valor, valor === r?.correcta);
              return (
                <span key={valor} data-opcion={valor} style={{ display: "contents" }}>
                  <button type="button" className={`op ${CLASE_DE[estado] ?? ""}`.trim()} data-estado={estado ?? "libre"}
                    disabled={decidido} onClick={() => responder(valor)}>
                    {texto}
                    {MARCA_DE[estado] && <Pastilla marca={MARCA_DE[estado]} />}
                  </button>
                </span>
              );
            })}
          </div>
        )}

        <Devolucion r={veredicto ? r : null} />
        <Pie texto={caso.pie} />
        {veredicto && (
          <p style={SOLO_LECTOR}>
            Debe {pesos(r.sumas.debe)}, haber {pesos(r.sumas.haber)}.
          </p>
        )}
      </div>
      {veredicto && !modoDemo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{botonDeAvance("Caso", t.i + 1 === cuantos)}</Responder>
        </div>
      )}
    </Marco>
  );
}
