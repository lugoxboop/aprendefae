import { useEffect, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { DEBE, pesos, saldoDe, mayorizar, LAVADO_DE_AUTOS, CALEJA } from "../../../data/contabilidad.js";
import { SALDO_DE_LA_CUENTA, CAJA_DEL_CAPITULO } from "../../../data/contabilidadActividades.js";
import { Retro, Pulsos, Cierre } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { CampoCifra, ElegirLado, Responder, leerCifra, useTanda } from "./piezas.jsx";
import { CuentaDeValor, EstilosDeVerbos } from "./verbos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CU-5 · EL SALDO DE LA CUENTA — Aplicación · Medio.
 *
 * Una cuenta T con sus movimientos y dos preguntas: cuánto es el saldo y de
 * qué lado va. Seis cuentas por partida, dos decisiones cada una: doce.
 *
 * LAS CUENTAS NO SE COPIAN, SE DERIVAN. El banco solo dice de qué mayor sacar
 * cada una; los movimientos salen de mayorizar los asientos del caso. Así la
 * cuenta que ve el estudiante y la que usa El Ciclo Completo son literalmente
 * la misma, y no dos copias que pueden separarse.
 *
 * ═══════════ LAS DOS PREGUNTAS SE PUNTÚAN POR SEPARADO ═══════════
 *
 * Acertar la cifra y fallar el lado no es lo mismo que fallar las dos, y la
 * ficha tiene una explicación distinta para cada caso. Por eso cada cuenta
 * deja DOS entradas en el detalle del docente —`<cuenta>:saldo` y
 * `<cuenta>:lado`—: con una sola, el profesor vería «falló» sin saber si el
 * estudiante no sabe restar o no sabe dónde va el resultado, que son dos
 * problemas con dos remedios.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CASOS = { lavado: LAVADO_DE_AUTOS.transacciones, caleja: CALEJA.transacciones };

/** La cuenta T de un ítem del banco, con sus movimientos ya derivados. */
export function cuentaDelItem(item) {
  if (item.caso === "capitulo") return CAJA_DEL_CAPITULO;
  const encontrada = mayorizar(CASOS[item.caso]).find((c) => c.cuenta === item.cuenta);
  if (!encontrada) throw new Error(`${item.id}: «${item.cuenta}» no está en el mayor de ${item.caso}`);
  return encontrada;
}

/*
 * ═══════════ QUÉ SE LE DICE A QUIEN FALLA ═══════════
 *
 * La ficha trae cuatro explicaciones de error y esto las reparte. Dos casos
 * son inequívocos: sumar los dos movimientos en vez de restarlos, y acertar la
 * cifra pero ponerla del lado que no es.
 *
 * `restoAlReves` habla de un saldo negativo, que es exactamente lo que pasa
 * cuando alguien resta el mayor del menor. También lo uso para cualquier otra
 * cifra equivocada, porque es la única explicación de la ficha que habla de
 * CÓMO se calcula el saldo y dejar ese caso sin una palabra sería peor.
 * PENDIENTE DE GEN: esa segunda lectura es mía.
 */
export function retroDe(item, cuenta, cifra, lado) {
  const s = saldoDe(cuenta);
  const cifraOk = cifra === s.saldo;
  const ladoOk = lado === s.lado;
  const e = SALDO_DE_LA_CUENTA.errores;
  const rellenar = (texto) => texto
    .replace("{saldo}", pesos(s.saldo))
    .replace("{debito}", pesos(s.debito))
    .replace("{credito}", pesos(s.credito))
    .replace("{Lado}", s.lado === DEBE ? "Debe" : "Haber")
    .replace("{movimiento}", s.lado === DEBE ? "débito" : "crédito");

  const saldo = cifraOk
    ? rellenar(SALDO_DE_LA_CUENTA.aciertoSaldo)
    : cifra === s.debito + s.credito
      ? e.sumo
      : rellenar(e.restoAlReves);

  const ladoTexto = ladoOk
    ? rellenar(SALDO_DE_LA_CUENTA.aciertoLado)
    : cifraOk
      ? rellenar(e.ladoEquivocado)
      : rellenar(e.ladoMenor);

  return { saldo, lado: ladoTexto, cifraOk, ladoOk, real: s };
}

export default function SaldoDeLaCuenta({ Marco, rotulo, titulo, acento, onCompletar }) {
  const cuantos = SALDO_DE_LA_CUENTA.porPartida;
  const sortear = () => barajar(SALDO_DE_LA_CUENTA.items).slice(0, cuantos);
  const t = useTanda(sortear);

  const [cifra, setCifra] = useState("");
  const [lado, setLado] = useState(null);
  const [retro, setRetro] = useState(null);

  const item = t.items[t.i];
  const cuenta = item ? cuentaDelItem(item) : null;
  /* Doce decisiones por partida: la cifra y el lado de cada una de las seis. */
  const decisiones = t.items.length * 2;
  const pct = porcentaje(t.aciertos, decisiones);

  useEffect(() => {
    if (t.terminado) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);

  const responder = () => {
    if (retro) return;
    const valor = leerCifra(cifra);
    if (valor === null || !lado) return;
    const r = retroDe(item, cuenta, valor, lado);
    t.anotar(`${item.id}:saldo`, r.cifraOk, r.cifraOk ? null : String(valor));
    t.anotar(`${item.id}:lado`, r.ladoOk, r.ladoOk ? null : lado);
    t.setAciertos((n) => n + (r.cifraOk ? 1 : 0) + (r.ladoOk ? 1 : 0));
    setRetro(r);
  };

  const avanzar = () => {
    setRetro(null); setCifra(""); setLado(null);
    if (t.i + 1 < t.items.length) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => {
    t.reiniciar(); setRetro(null); setCifra(""); setLado(null);
  };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>{t.aciertos} de {decisiones} respuestas bien — cifra y lado de seis cuentas.</p>
        </Cierre>
      </Marco>
    );
  }

  const listo = leerCifra(cifra) !== null && lado !== null;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <EstilosDeVerbos />
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={t.items.length} hechos={t.i + (retro ? 1 : 0)} etiqueta="Cuenta" />
      </div>

      {/*
        LAS COLUMNAS DE VALOR, NO LA LISTA DE CIFRAS. Cada movimiento mide lo
        que vale, así que de un vistazo se ve cuál lado pesó más — que es la
        segunda pregunta— sin que se regale la primera: cuánto es el saldo
        sigue siendo una resta.

        Y LA CANCELACIÓN ESPERA AL RESPONDER. Consumir los dos lados antes de
        tiempo dejaría el saldo dibujado en pantalla y no habría nada que
        calcular; al responder, lo que queda en pie ES el saldo.
      */}
      <CuentaDeValor
        cuenta={cuenta.cuenta}
        debitos={cuenta.debitos}
        creditos={cuenta.creditos}
        cancelar={Boolean(retro)}
      />

      <p style={{
        margin: "16px 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
        fontWeight: 700, letterSpacing: "0.16em", color: acento,
      }}>
        ¿CUÁNTO ES EL SALDO?
      </p>
      <CampoCifra
        valor={cifra}
        onCambio={setCifra}
        onEnviar={responder}
        deshabilitado={Boolean(retro)}
        etiqueta={`Saldo de ${cuenta.cuenta}`}
        estado={retro ? (retro.cifraOk ? "correcta" : "incorrecta") : null}
        autoFoco
      />

      <p style={{
        margin: "16px 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
        fontWeight: 700, letterSpacing: "0.16em", color: acento,
      }}>
        ¿DE QUÉ LADO VA?
      </p>
      <ElegirLado
        elegido={lado}
        correcto={retro ? retro.real.lado : null}
        onElegir={setLado}
        deshabilitado={Boolean(retro)}
      />

      {retro && (
        <div style={{ marginTop: "6px" }}>
          <Retro texto={retro.saldo} />
          <Retro texto={retro.lado} />
        </div>
      )}

      {!retro
        ? <Responder onClick={responder} deshabilitado={!listo}>Responder</Responder>
        : (
          <Responder onClick={avanzar}>
            {t.i + 1 === t.items.length ? "Ver resultado" : "Siguiente cuenta"}
          </Responder>
        )}

      {!retro && !listo && (
        <p style={{ margin: "9px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.45)", textAlign: "center" }}>
          Escribe el saldo y elige de qué lado va.
        </p>
      )}
    </Marco>
  );
}
