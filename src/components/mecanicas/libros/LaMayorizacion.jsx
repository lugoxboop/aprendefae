import { useEffect, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import {
  DEBE, HABER, COLOR_LADO, pesos, mayorConSaldos, saldoDe,
  LAVADO_DE_AUTOS, CALEJA,
} from "../../../data/contabilidad.js";
import { MAYORIZACION } from "../../../data/contabilidadActividades.js";
import { Retro, Pulsos, Cierre } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import {
  Responder, useTanda, leerCifra, CampoCifra, ElegirLado, CuentaT,
} from "./piezas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CU-11 · LA MAYORIZACIÓN — Maestría · Experto.
 *
 * Un set entero por partida: el diario delante, y el mayor que hay que
 * construir renglón a renglón. Dos fases, porque el mayor no está hecho hasta
 * que tiene sus saldos:
 *
 *   1. MAYORIZAR   cada renglón del diario va a una cuenta y a un lado.
 *   2. LOS SALDOS  cada cuenta del mayor dice cuánto y de qué lado.
 *
 * ═══════════ ES LA ACTIVIDAD MÁS LARGA DEL TEMA, Y DE LEJOS ═══════════
 *
 * El Set A son 14 renglones y 10 cuentas: 24 pasos. El Set B, 19. La segunda
 * actividad más larga del sitio tiene 12. Es deliberado que sea la más grande
 * —es la única de 90 FP que trabaja un caso completo— pero es un número que
 * conviene mirar con el contenido delante, no descubrirlo en un teléfono.
 * Recortarla sería sortear una parte de las cuentas en la fase 2; la decisión
 * no es mía y queda reportada.
 *
 * ═══════════ EL SET A ESTÁ TRUNCADO A PROPÓSITO ═══════════
 *
 * Usa solo cinco asientos del mes, así que sus saldos NO coinciden con el
 * mayor completo del libro en cuatro cuentas. Es correcto: es el mayor de un
 * corte. El banco declara el corte como lista de ids y todo lo demás se
 * deriva, justo para que nadie pueda «corregirlo» contra la página del libro.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CASOS = { lavado: LAVADO_DE_AUTOS, caleja: CALEJA };

/** Las transacciones de un set: el corte si lo tiene, o las del caso entero. */
export function transaccionesDe(set) {
  const todas = CASOS[set.caso].transacciones;
  return set.transacciones ? todas.filter((t) => set.transacciones.includes(t.id)) : todas;
}

/**
 * Los renglones del diario en el orden en que se escribieron: primero los
 * debitados de cada asiento y después los acreditados, que es como los pone el
 * libro y lo que hace legible la sangría.
 */
export function renglonesDe(transacciones) {
  return transacciones.flatMap((t) => [
    ...t.asiento.debe.map(([cuenta, valor]) => ({ transaccion: t.id, fecha: t.fecha ?? t.id, cuenta, lado: DEBE, valor })),
    ...t.asiento.haber.map(([cuenta, valor]) => ({ transaccion: t.id, fecha: t.fecha ?? t.id, cuenta, lado: HABER, valor })),
  ]);
}

/*
 * ═══════════ PENDIENTE DE GEN — DOS TEXTOS QUE NO PUEDEN SALIR ═══════════
 *
 * `fechaDelTraslado` avisa de anotar en el mayor el día del traslado en vez de
 * la fecha del diario. Aquí no puede ocurrir: la fecha viaja con el valor,
 * porque mayorizar no la cambia — es justamente lo que enseña la actividad. El
 * texto se queda sin usar salvo que la mecánica pida escribir la fecha, que
 * sería teclear un dato que el propio ejercicio dice que no se toca.
 *
 * Y la ficha no trae texto de acierto para un saldo bien puesto: el `acierto`
 * que sí trae habla de mayorizar, no de sumar. El «✅ Correcto.» de la fase 2
 * es mío, igual que el de Arma el Asiento, y el saldo correcto se enseña
 * dentro de la cuenta T, que son datos.
 */
export const ACIERTO_SALDO = "✅ Correcto.";

export function evaluarRenglon(renglon, cuenta, lado) {
  const cuentaOk = cuenta === renglon.cuenta;
  const ladoOk = lado === renglon.lado;
  const e = MAYORIZACION.errores;

  let texto;
  if (cuentaOk && ladoOk) texto = MAYORIZACION.acierto;
  else if (!cuentaOk) texto = e.cuentaEquivocada.replace("{cuenta}", renglon.cuenta);
  else texto = e.ladoContrario;

  return { texto, cuentaOk, ladoOk };
}

export function evaluarSaldo(cuentaDelMayor, cifra, lado) {
  const s = saldoDe(cuentaDelMayor);
  const cifraOk = cifra === s.saldo;
  const ladoOk = lado === s.lado;
  const texto = cifraOk && ladoOk
    ? ACIERTO_SALDO
    : MAYORIZACION.errores.saldoMal
      .replace("{debito}", pesos(s.debito))
      .replace("{credito}", pesos(s.credito))
      .replace("{saldo}", pesos(s.saldo))
      .replace("{lado}", s.lado === DEBE ? "debe" : "haber");
  return { texto, cifraOk, ladoOk, real: s };
}

/*
 * El asiento como lo escribe el libro: la cuenta debitada al ras y la
 * acreditada corrida a la derecha, con sus columnas. Es distinto a
 * `AsientoEnLineas` a propósito — aquella es un resumen y esta es la página
 * del diario, y la sangría es justo lo que la ficha le pide leer al estudiante.
 */
function AsientoDeDiario({ transaccion, resaltado }) {
  const lineas = [
    ...transaccion.asiento.debe.map(([cuenta, valor]) => ({ cuenta, valor, lado: DEBE })),
    ...transaccion.asiento.haber.map(([cuenta, valor]) => ({ cuenta, valor, lado: HABER })),
  ];
  return (
    <div style={{
      padding: "12px 13px", borderRadius: "13px",
      background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)",
    }}>
      <p style={{
        margin: "0 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
        fontWeight: 700, letterSpacing: "0.14em", color: "rgba(248,249,250,0.55)",
      }}>
        {transaccion.fecha ?? transaccion.id}
      </p>
      {lineas.map((l, k) => {
        const es = resaltado === k;
        return (
          <div
            key={`${l.cuenta}-${l.lado}`}
            style={{
              display: "flex", gap: "8px", alignItems: "baseline",
              padding: "3px 6px", borderRadius: "7px",
              marginLeft: l.lado === HABER ? "18px" : 0,
              background: es ? `${COLOR_LADO[l.lado]}22` : "transparent",
              border: `1px solid ${es ? COLOR_LADO[l.lado] : "transparent"}`,
            }}
          >
            <span style={{
              flex: 1, minWidth: 0, fontSize: "12.5px", lineHeight: 1.35,
              color: es ? FAE.text : "rgba(248,249,250,0.72)",
            }}>
              {l.cuenta}
            </span>
            <span style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              fontVariantNumeric: "tabular-nums", fontSize: "12.5px",
              color: es ? COLOR_LADO[l.lado] : "rgba(248,249,250,0.6)",
            }}>
              {pesos(l.valor)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function LaMayorizacion({ Marco, rotulo, titulo, acento, onCompletar }) {
  const sortear = () => {
    const set = barajar(MAYORIZACION.sets)[0];
    const transacciones = transaccionesDe(set);
    return [{ set, transacciones, renglones: renglonesDe(transacciones), mayor: mayorConSaldos(transacciones) }];
  };

  const t = useTanda(sortear);
  const partida = t.items[0];

  const [fase, setFase] = useState("mayorizar");
  const [paso, setPaso] = useState(0);
  const [cuenta, setCuenta] = useState(null);
  const [lado, setLado] = useState(null);
  const [cifra, setCifra] = useState("");
  const [retro, setRetro] = useState(null);

  const renglones = partida.renglones;
  const mayor = partida.mayor;
  const pasos = renglones.length + mayor.length;
  const decisiones = pasos * 2;
  const pct = porcentaje(t.aciertos, decisiones);

  useEffect(() => {
    if (t.terminado) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);

  /* Las cuentas que se ofrecen son las del mayor del set: ni una de fuera. */
  const cuentasDelSet = mayor.map((c) => c.cuenta);

  const enMayorizar = fase === "mayorizar";
  const renglon = enMayorizar ? renglones[paso] : null;
  const cuentaActual = enMayorizar ? null : mayor[paso];
  const transaccion = renglon
    ? partida.transacciones.find((x) => x.id === renglon.transaccion)
    : null;
  const indiceEnAsiento = renglon
    ? renglonesDe([transaccion]).findIndex((l) => l.cuenta === renglon.cuenta && l.lado === renglon.lado)
    : -1;

  const listo = enMayorizar
    ? Boolean(cuenta && lado)
    : leerCifra(cifra) !== null && lado !== null;

  const responder = () => {
    if (retro || !listo) return;
    if (enMayorizar) {
      const r = evaluarRenglon(renglon, cuenta, lado);
      t.anotar(`${renglon.transaccion}:${renglon.cuenta}:cuenta`, r.cuentaOk, r.cuentaOk ? null : cuenta);
      t.anotar(`${renglon.transaccion}:${renglon.cuenta}:lado`, r.ladoOk, r.ladoOk ? null : lado);
      t.setAciertos((n) => n + (r.cuentaOk ? 1 : 0) + (r.ladoOk ? 1 : 0));
      setRetro(r);
    } else {
      const r = evaluarSaldo(cuentaActual, leerCifra(cifra), lado);
      t.anotar(`saldo:${cuentaActual.cuenta}:cifra`, r.cifraOk, r.cifraOk ? null : cifra);
      t.anotar(`saldo:${cuentaActual.cuenta}:lado`, r.ladoOk, r.ladoOk ? null : lado);
      t.setAciertos((n) => n + (r.cifraOk ? 1 : 0) + (r.ladoOk ? 1 : 0));
      setRetro(r);
    }
  };

  const avanzar = () => {
    setRetro(null); setCuenta(null); setLado(null); setCifra("");
    if (enMayorizar) {
      if (paso + 1 < renglones.length) setPaso(paso + 1);
      else { setFase("saldos"); setPaso(0); }
    } else if (paso + 1 < mayor.length) setPaso(paso + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => {
    t.reiniciar();
    setFase("mayorizar"); setPaso(0); setRetro(null);
    setCuenta(null); setLado(null); setCifra("");
  };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otro set">
          <p style={TEXTO_CIERRE}>
            {t.aciertos} de {decisiones} decisiones bien — {renglones.length} renglones mayorizados y {mayor.length} saldos, todo el mayor de {partida.set.nombre}.
          </p>
        </Cierre>
      </Marco>
    );
  }

  const rotuloPregunta = {
    margin: "16px 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
    fontWeight: 700, letterSpacing: "0.16em", color: acento,
  };

  const hechos = enMayorizar ? paso : renglones.length + paso;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={pasos} hechos={hechos + (retro ? 1 : 0)} etiqueta={enMayorizar ? "Renglón" : "Saldo"} />
      </div>

      <p style={{ margin: "0 0 10px", fontSize: "12.5px", color: "rgba(248,249,250,0.55)" }}>
        {partida.set.nombre}
      </p>

      {enMayorizar ? (
        <>
          <AsientoDeDiario transaccion={transaccion} resaltado={indiceEnAsiento} />
          <p style={rotuloPregunta}>¿A QUÉ CUENTA DEL MAYOR VA?</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {cuentasDelSet.map((c) => {
              const elegida = cuenta === c;
              const revelado = Boolean(retro);
              let borde = "rgba(248,249,250,0.22)";
              if (revelado && c === renglon.cuenta) borde = FAE.teal;
              else if (revelado && elegida) borde = FAE.coral;
              else if (elegida) borde = acento;
              return (
                <button
                  key={c}
                  type="button"
                  disabled={revelado}
                  onClick={() => setCuenta(c)}
                  style={{
                    padding: "9px 13px", borderRadius: "999px", cursor: revelado ? "default" : "pointer",
                    background: "rgba(14,27,46,0.6)", border: `1px solid ${borde}`,
                    color: FAE.text, fontSize: "12.5px", lineHeight: 1.3, textAlign: "left",
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
          <p style={rotuloPregunta}>¿DE QUÉ LADO?</p>
          <ElegirLado
            elegido={lado}
            correcto={retro ? renglon.lado : null}
            onElegir={setLado}
            deshabilitado={Boolean(retro)}
          />
        </>
      ) : (
        <>
          <CuentaT cuenta={cuentaActual} saldo={retro ? retro.real : null} />
          <p style={rotuloPregunta}>¿CUÁNTO ES EL SALDO?</p>
          <CampoCifra
            valor={cifra}
            onCambio={setCifra}
            onEnviar={responder}
            deshabilitado={Boolean(retro)}
            etiqueta={`Saldo de ${cuentaActual.cuenta}`}
            estado={retro ? (retro.cifraOk ? "correcta" : "incorrecta") : null}
            autoFoco
          />
          <p style={rotuloPregunta}>¿DE QUÉ LADO VA?</p>
          <ElegirLado
            elegido={lado}
            correcto={retro ? retro.real.lado : null}
            onElegir={setLado}
            deshabilitado={Boolean(retro)}
          />
        </>
      )}

      {retro && <Retro texto={retro.texto} />}

      {!retro
        ? <Responder onClick={responder} deshabilitado={!listo}>Responder</Responder>
        : (
          <Responder onClick={avanzar}>
            {hechos + 1 === pasos ? "Ver resultado" : (enMayorizar && paso + 1 === renglones.length ? "Ahora los saldos" : "Siguiente")}
          </Responder>
        )}

      {!retro && !listo && (
        <p style={{ margin: "9px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.45)", textAlign: "center" }}>
          {enMayorizar ? "Elige la cuenta y el lado del renglón resaltado." : "Escribe el saldo y elige de qué lado va."}
        </p>
      )}
    </Marco>
  );
}
