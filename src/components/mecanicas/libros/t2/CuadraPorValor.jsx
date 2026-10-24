import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../../data/contabilidad.js";
import { CONSIGNAS_CUADRA, OBJETIVO_T2_NUEVAS } from "../../../../data/contabilidadT2HacerNuevas.js";
import {
  CUADRA, NO_CUADRA, conteo, evaluarCuadra, prepararCuadra, puntuar, sumas,
} from "../../../../contabilidad/t2HacerNuevas.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { AsientoEnLineas, CampoCifra, Responder, leerCifra, useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { CuentaDeValor, EstilosDeVerbos, SOLO_LECTOR } from "../verbos.jsx";
import { Devolucion, Eleccion, OpcionC } from "../t7/hacerT7.jsx";
import { Pastilla, REVELADA, botonDeAvance, COMPROBAR_B } from "../b5/Devolucion.jsx";
import { CSS_T2_NUEVAS, Consecuencia, Hecho, Pie, ROTULO_T2 } from "./comunT2.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · 8.º HACER · CUADRA POR VALOR (cu-cuadra-por-valor). Célula C, lote T2-2.
 *
 * El objeto propio son las dos columnas del asiento, con una altura por VALOR
 * y no por número de líneas (CuentaDeValor, verbo 2, sin cancelar). Tres
 * tipos de caso, un intento cada uno:
 *   completar  falta un monto; la columna crece con cada número que se escribe
 *   juzgar     «Cuadra» o «No cuadra»
 *   encontrar  las líneas son botones; se toca la que descuadra (en el
 *              duplicado se acepta cualquiera de las dos repetidas)
 *
 * Debajo de las columnas, el nivel (sólido si cuadran, discontinuo si no) y
 * los conteos «3 cuentas · $1.000». En juzgar y encontrar las columnas y las
 * sumas salen al responder: antes, la altura sería la respuesta.
 *
 * El banco es el de Near (lote T2-2, §1.1): 8 casos. En juzgar y encontrar
 * el hecho va arriba, para que se resuelva solo con lo que dice (H3).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ALTO = 150;
const cuentas = (n) => (n === 1 ? "1 cuenta" : `${n} cuentas`);

function Nivel({ lineas, relleno }) {
  const s = sumas(lineas, relleno);
  const igual = s.debe === s.haber;
  return (
    <div data-nivel={igual ? "igual" : "desigual"} style={{
      display: "flex", justifyContent: "space-between", gap: "8px", marginTop: "6px", paddingTop: "6px",
      borderTop: `2px ${igual ? "solid" : "dashed"} rgba(248,249,250,${igual ? 0.7 : 0.4})`,
      fontSize: "12px", lineHeight: 1.4, color: "rgba(248,249,250,0.88)",
    }}>
      {/* El color del lado va en el filete, no en la letra: a 12 px el ámbar del haber no llega a 4,5:1 (medido: 3,72). */}
      <span data-conteo={DEBE} style={{ borderLeft: `3px solid ${COLOR_LADO[DEBE]}`, paddingLeft: "6px" }}>{cuentas(conteo(lineas, DEBE))} · {pesos(s.debe)}</span>
      <span data-conteo={HABER} style={{ borderRight: `3px solid ${COLOR_LADO[HABER]}`, paddingRight: "6px", textAlign: "right" }}>{cuentas(conteo(lineas, HABER))} · {pesos(s.haber)}</span>
    </div>
  );
}

function Columnas({ lineas, relleno }) {
  const valores = (lado) => lineas.filter((l) => l.lado === lado)
    .map((l) => l.monto ?? relleno).filter((v) => v != null && v > 0).map((valor) => ({ valor }));
  return (
    <div data-columnas className="fae-t2n-entra" style={{ marginTop: "12px" }}>
      <CuentaDeValor cuenta="Las dos columnas del asiento" debitos={valores(DEBE)} creditos={valores(HABER)} alto={ALTO} />
      <Nivel lineas={lineas} relleno={relleno} />
    </div>
  );
}

export default function CuadraPorValor({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const t = useTanda(() => items ?? prepararCuadra(barajar));
  const [cifra, setCifra] = useState("");
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);

  const caso = t.items[t.i];
  const cuantos = t.items.length;

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(puntuar(bien, cuantos), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (r && !modoDemo) zonaBoton.current?.querySelector("button")?.focus(); }, [r]); // eslint-disable-line react-hooks/exhaustive-deps

  /* UN intento: la primera respuesta es la que cuenta. */
  const responder = (respuesta) => {
    if (r || respuesta == null) return;
    const nuevo = evaluarCuadra(caso, respuesta);
    t.anotar(caso.id, nuevo.ok, String(respuesta));
    if (nuevo.ok) setBien((n) => n + 1);
    setElegida(respuesta);
    setR(nuevo);
  };

  const avanzar = () => {
    setR(null); setElegida(null); setCifra("");
    if (t.i + 1 < cuantos) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => { t.reiniciar(); setR(null); setElegida(null); setCifra(""); setBien(0); };

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
  /* En completar, la columna crece con lo que se escribe; al responder, con lo respondido. */
  const relleno = caso.tipo === "completar" ? (r ? elegida : escrita) : null;
  const verColumnas = caso.tipo === "completar" || Boolean(r);
  const lineaVisible = caso.lineas.map((l) => ({ cuenta: l.cuenta, lado: l.lado, valor: l.monto ?? 0 }));

  const estadoLinea = (k) => {
    if (!r) return null;
    if (k === elegida) return r.ok ? "correcta" : "incorrecta";
    if (r.correcta.includes(k)) return "revelada";
    return null;
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T2_NUEVAS}</style>
      <EstilosDeVerbos />
      <div data-t2-cuadra={caso.tipo} data-caso={caso.id}>
        {!modoDemo && (
          <>
            <Encabezado objetivo={OBJETIVO_T2_NUEVAS["cu-cuadra-por-valor"]} consigna={CONSIGNAS_CUADRA[caso.tipo]} onComoSeJuega={onComoSeJuega} />
            <div style={{ marginBottom: "12px" }}>
              <Pulsos total={cuantos} hechos={t.i + (r ? 1 : 0)} enCurso={t.i + 1} etiqueta="Caso" />
            </div>
          </>
        )}

        {caso.tipo === "completar" && (
          <>
            <AsientoEnLineas lineas={lineaVisible.filter((_, k) => k !== falta)} />
            <p style={{ ...ROTULO_T2, margin: "10px 0 6px", color: COLOR_LADO[caso.lineas[falta].lado] }}>
              {caso.lineas[falta].lado === DEBE ? "DEBE" : "HABER"} · {caso.lineas[falta].cuenta}
            </p>
            <CampoCifra
              valor={cifra} onCambio={setCifra} onEnviar={() => responder(escrita)}
              deshabilitado={Boolean(r)} etiqueta={`Monto de ${caso.lineas[falta].cuenta}`}
              estado={r ? (r.ok ? "correcta" : "incorrecta") : null} autoFoco={!modoDemo}
            />
            {r && !r.ok && (
              <p data-iba style={{ margin: "8px 0 0" }}><Pastilla marca={REVELADA} valor={pesos(r.correcta)} /></p>
            )}
            {!r && <Responder onClick={() => responder(escrita)} deshabilitado={escrita == null}>{COMPROBAR_B}</Responder>}
          </>
        )}

        {caso.tipo === "juzgar" && (
          <>
            <Hecho texto={caso.hecho} />
            <AsientoEnLineas lineas={lineaVisible} totales={Boolean(r)} />
            <div style={{ marginTop: "12px" }}>
              <Eleccion
                opciones={[{ valor: CUADRA, texto: "Cuadra" }, { valor: NO_CUADRA, texto: "No cuadra" }]}
                r={r} elegida={elegida} onElegir={responder} etiqueta={CONSIGNAS_CUADRA.juzgar}
              />
            </div>
          </>
        )}

        {caso.tipo === "encontrar" && (
          <>
            <Hecho texto={caso.hecho} />
            <div role="group" aria-label="Las líneas del asiento" style={{ display: "grid", gap: "8px" }}>
              {caso.lineas.map((l, k) => (
                <span key={k} data-linea={k} style={{ display: "contents" }}>
                  <OpcionC ancho deshabilitada={Boolean(r)} estado={estadoLinea(k)} onClick={() => responder(k)}>
                    <span style={{ color: COLOR_LADO[l.lado], fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em" }}>
                      {l.lado === DEBE ? "DEBE" : "HABER"}
                    </span>{" "}
                    {l.cuenta} · {pesos(l.monto)}
                  </OpcionC>
                </span>
              ))}
            </div>
            {r && <div style={{ marginTop: "10px" }}><AsientoEnLineas lineas={lineaVisible} totales /></div>}
          </>
        )}

        {verColumnas && <Columnas lineas={caso.lineas} relleno={relleno} />}

        <Consecuencia texto={r?.consecuencia} error={r ? !r.ok : true} />
        <Devolucion r={r} />
        <Pie texto={caso.pie} />
        {r && (
          <p style={SOLO_LECTOR}>
            Debe {pesos(r.sumas.debe)}, haber {pesos(r.sumas.haber)}.
          </p>
        )}
      </div>
      {r && !modoDemo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{botonDeAvance("Caso", t.i + 1 === cuantos)}</Responder>
        </div>
      )}
    </Marco>
  );
}
