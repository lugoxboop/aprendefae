import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { pesos } from "../../../../data/contabilidad.js";
import {
  CONSIGNA_T2_NUEVAS, LAS_QUE_VUELVEN_A_CERO,
} from "../../../../data/contabilidadT2HacerNuevas.js";
import {
  PASA_CON_SALDO, VUELVE_A_CERO, destinoCorrecto, evaluarCero, prepararCero, puntuar, utilidadDe,
} from "../../../../contabilidad/t2HacerNuevas.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { CuentaT, Responder, useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { useNumeroQueSube } from "../verbos.jsx";
import { Devolucion, Eleccion } from "../t7/hacerT7.jsx";
import { CORAL_B, Pastilla, TACHADA, botonDeAvance } from "../b5/Devolucion.jsx";
import { CSS_T2_NUEVAS, Consecuencia, ROTULO_T2 } from "./comunT2.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · 10.º HACER · LAS QUE VUELVEN A CERO (cu-las-que-vuelven-a-cero).
 * Célula C, lote T2-2. El último Hacer antes de «El Ciclo Completo».
 *
 * La línea del cierre, vertical para que quepa a 320 px: arriba el mes con sus
 * saldos, en medio la caja de Ganancias y pérdidas (CuentaT compacta), abajo
 * el mes siguiente. Binaria (OpcionC, por Eleccion): «Vuelve a cero en el
 * cierre» o «Pasa a {mes siguiente} con su saldo». La familia se nombra en el
 * retro, no en una segunda pregunta (L).
 *
 * Cada ítem lleva su `clase` (real / nominal): de ahí sale su subtema del
 * Repaso Diario (SUBTEMA_POR_CLASE).
 *
 * El error se queda a la vista en el mes siguiente: una real en $0 o una
 * nominal con el saldo del mes que cerró, con borde coral. Al clasificar la
 * última, el mes se cierra entero y la caja suma «= Utilidad del mes».
 *
 * ESQUELETO EN BORRADOR: el banco es de muestra (contabilidadT2HacerNuevas.js).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CIFRA = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontVariantNumeric: "tabular-nums" };
const CAJA = { padding: "10px 12px", borderRadius: "13px", background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)" };
const FILA = { display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "baseline", fontSize: "13px", lineHeight: 1.4, padding: "3px 6px", borderRadius: "8px" };

function Utilidad({ valor }) {
  const v = useNumeroQueSube(valor);
  return (
    <p data-utilidad={valor} className="fae-t2n-entra" style={{ ...FILA, margin: "8px 0 0", fontWeight: 700, color: FAE.text, borderTop: "1px solid rgba(248,249,250,0.3)", paddingTop: "8px" }}>
      <span>= Utilidad del mes</span><span style={CIFRA}>{pesos(v)}</span>
    </p>
  );
}

export default function LasQueVuelvenACero({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const { caso } = LAS_QUE_VUELVEN_A_CERO;
  const t = useTanda(() => items ?? prepararCero(barajar));
  /* id → lo que el estudiante decidió (para pintar el error) */
  const [decididas, setDecididas] = useState({});
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);

  const cuenta = t.items[t.i];
  const cuantas = t.items.length;
  const ultima = t.i + 1 === cuantas;

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(puntuar(bien, cuantas), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (r && !modoDemo) zonaBoton.current?.querySelector("button")?.focus(); }, [r]); // eslint-disable-line react-hooks/exhaustive-deps

  const responder = (eleccion) => {
    if (r) return;
    const nuevo = evaluarCero(cuenta, eleccion, caso);
    t.anotar(cuenta.id, nuevo.ok, eleccion);
    if (nuevo.ok) setBien((n) => n + 1);
    setElegida(eleccion);
    setDecididas((d) => ({ ...d, [cuenta.id]: eleccion }));
    setR(nuevo);
  };

  const avanzar = () => {
    setR(null); setElegida(null);
    if (!ultima) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => { t.reiniciar(); setR(null); setElegida(null); setBien(0); setDecididas({}); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(puntuar(bien, cuantas))} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p data-resumen style={TEXTO_CIERRE}>{bien} de {cuantas} cuentas al primer intento.</p>
        </Cierre>
      </Marco>
    );
  }

  /*
   * Lo que ya cruzó la línea: las cuentas de ítems anteriores, siempre en su
   * sitio correcto, y la de ahora donde la puso el estudiante (aunque sea mal).
   */
  const cruzadas = t.items.slice(0, t.i + (r ? 1 : 0));
  const destinoVisto = (c) => (c.id === cuenta.id && r ? elegida : destinoCorrecto(c));
  const enGyP = cruzadas.filter((c) => destinoVisto(c) === VUELVE_A_CERO);
  const gyp = {
    cuenta: "Ganancias y pérdidas",
    /* Las nominales cierran contra su saldo: gastos y costos al debe, ingresos al haber. */
    debitos: enGyP.filter((c) => c.familia !== "ingreso").map((c) => ({ valor: c.saldo })),
    creditos: enGyP.filter((c) => c.familia === "ingreso").map((c) => ({ valor: c.saldo })),
  };
  const mesCerrado = ultima && r;
  /* En el orden del caso, que no delata nada; en la demo, el del ejemplo. */
  const ordenFijo = items ?? caso.cuentas;

  const enAbril = (c) => {
    if (!cruzadas.includes(c)) return null;
    return destinoVisto(c) === VUELVE_A_CERO ? 0 : c.saldo;
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T2_NUEVAS}</style>
      <div data-t2-cero data-item={cuenta.id} data-clase={cuenta.clase}>
        {!modoDemo && (
          <>
            <Encabezado consigna={CONSIGNA_T2_NUEVAS["cu-las-que-vuelven-a-cero"]} onComoSeJuega={onComoSeJuega} />
            <div style={{ marginBottom: "12px" }}>
              <Pulsos total={cuantas} hechos={t.i + (r ? 1 : 0)} enCurso={t.i + 1} etiqueta="Cuenta" />
            </div>
          </>
        )}

        <p style={{ ...ROTULO_T2, marginTop: 0 }}>
          {mesCerrado ? "EL MES QUEDA CERRADO." : `LLEGA EL CIERRE DE ${caso.mes.toUpperCase()}. ¿QUÉ PASA CON ${cuenta.nombre.toUpperCase()}?`}
        </p>

        <div data-mes="antes" style={CAJA}>
          <p style={{ ...ROTULO_T2, margin: "0 0 6px" }}>31 DE {caso.mes.toUpperCase()} · ANTES DEL CIERRE</p>
          {ordenFijo.map((c) => (
            <p key={c.id} data-cuenta-mes={c.id} style={{
              ...FILA, margin: 0, color: FAE.text,
              background: c.id === cuenta.id && !mesCerrado ? "rgba(248,249,250,0.1)" : "transparent",
              outline: c.id === cuenta.id && !mesCerrado ? "1px solid rgba(248,249,250,0.6)" : "none",
            }}>
              <span>{c.nombre}</span><span style={CIFRA}>{pesos(c.saldo)}</span>
            </p>
          ))}
        </div>

        <div data-cierre style={{ margin: "10px 0" }}>
          <p style={{ ...ROTULO_T2, margin: "0 0 6px" }}>CIERRE · GANANCIAS Y PÉRDIDAS</p>
          <CuentaT cuenta={gyp} compacta />
          {mesCerrado && <Utilidad valor={utilidadDe(ordenFijo)} />}
        </div>

        <div data-mes="despues" style={CAJA}>
          <p style={{ ...ROTULO_T2, margin: "0 0 6px" }}>1 DE {caso.mesSiguiente.toUpperCase()} · DESPUÉS DEL CIERRE</p>
          {ordenFijo.map((c) => {
            const v = enAbril(c);
            const malo = r && !r.ok && c.id === cuenta.id;
            return (
              <p key={c.id} data-cuenta-siguiente={c.id} data-valor={v ?? ""} className={v != null ? "fae-t2n-entra" : undefined} style={{
                ...FILA, margin: "2px 0", color: v == null ? "rgba(248,249,250,0.6)" : FAE.text,
                border: malo ? `2px solid ${CORAL_B}` : "2px solid transparent", flexWrap: "wrap",
              }}>
                <span>{c.nombre}</span>
                <span style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                  <span style={CIFRA}>{v == null ? "—" : pesos(v)}</span>
                  {malo && <Pastilla marca={TACHADA} />}
                </span>
              </p>
            );
          })}
        </div>

        {/* Siguen a la vista al cerrar el mes: el veredicto de la última también se lee. */}
        {(
          <div style={{ marginTop: "12px" }}>
            <Eleccion
              opciones={[
                { valor: VUELVE_A_CERO, texto: "Vuelve a cero en el cierre" },
                { valor: PASA_CON_SALDO, texto: `Pasa a ${caso.mesSiguiente} con su saldo` },
              ]}
              r={r} elegida={elegida} onElegir={responder} etiqueta={`¿Qué pasa con ${cuenta.nombre}?`}
            />
          </div>
        )}

        <Consecuencia texto={r?.consecuencia} />
        <Devolucion r={r && (mesCerrado ? { ...r, textos: [...r.textos, LAS_QUE_VUELVEN_A_CERO.textoFinal] } : r)} />
      </div>
      {r && !modoDemo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{botonDeAvance("Cuenta", ultima)}</Responder>
        </div>
      )}
    </Marco>
  );
}
