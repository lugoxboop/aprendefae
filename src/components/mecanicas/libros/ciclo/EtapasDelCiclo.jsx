import { useEffect, useMemo, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../../data/contabilidad.js";
import { SECCIONES_CON_CUENTAS, ENCABEZADO_ESTADO } from "../../../../data/contabilidadDesafio.js";
import {
  TRANSACCIONES, MOVIMIENTOS, MAYOR,
  evaluarAsiento, evaluarMovimiento, evaluarSaldo, evaluarUbicacion, pctDeItems, balanceDe,
} from "../../../../contabilidad/desafio.js";
import { Opcion, Opciones, Retro, Pulsos } from "../../corazon/juego.jsx";
import { Responder, CampoCifra, leerCifra, ElegirLado } from "../piezas.jsx";
import ConstructorAsiento, { filaVacia, asientoDe } from "../ConstructorAsiento.jsx";
import { Superficie, HojaDelDiario, CuadriculaDelMayor, HojaDelEstado } from "./Escritorio.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS CUATRO ETAPAS DE «EL CICLO COMPLETO».
 *
 * Cada una trabaja sobre una superficie del escritorio y deja detrás lo que
 * llenó. Ninguna guarda la solución: todas la piden a contabilidad/desafio.js,
 * que la calcula de las nueve transacciones del capítulo.
 *
 * Las cuatro tienen la misma forma —`{ onTerminar, hilo }`—: `onTerminar`
 * devuelve el porcentaje y las filas del detalle por ítem, y `hilo` mueve la
 * balanza del escritorio, que vive fuera para no desmontarse entre etapas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ROTULO = {
  margin: "16px 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
  fontWeight: 700, letterSpacing: "0.16em", color: FAE.ambar,
};

const CIFRA = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontVariantNumeric: "tabular-nums",
};

/*
 * La paleta de la etapa 1. Las once del caso MÁS las dos que la ficha nombra
 * en sus devoluciones: sin «Aportes sociales» en la mesa, el estudiante no
 * puede cometer el error del patrimonio de una S.A. y esa explicación no la
 * lee nadie; sin una cuenta de ingresos, tampoco la de la consignación.
 */
const PALETA = [
  "Caja", "Bancos", "Terrenos", "Construcciones y edificaciones",
  "Flota y equipo de transporte", "Equipo de computación", "Muebles y enseres",
  "Cuentas por pagar", "Letras por pagar", "Hipoteca por pagar",
  "Acciones", "Aportes sociales", "Ingresos por servicios",
];

/* ═══════════════════════ ETAPA 1 · EL LIBRO DIARIO ═══════════════════════ */

export function EtapaDiario({ onTerminar, hilo }) {
  const [i, setI] = useState(0);
  const [filas, setFilas] = useState([filaVacia(), filaVacia()]);
  const [retro, setRetro] = useState(null);
  const [hechos, setHechos] = useState([]);
  const detalle = useRef([]);

  const t = TRANSACCIONES[i];

  /*
   * La balanza lleva TODO lo registrado hasta ahora, no solo el asiento en
   * curso: es la ecuación del negocio, no la de una línea. Los asientos que
   * quedaron mal entran tal como el estudiante los dejó — el libro no se
   * corrige solo.
   */
  useEffect(() => {
    const sumar = (lado) => hechos.reduce((s, h) => s + h.asiento[lado].reduce((a, [, v]) => a + v, 0), 0);
    hilo({ izquierda: sumar("debe"), derecha: sumar("haber"), rotuloIzq: "DEBE", rotuloDer: "HABER" });
  }, [hechos, hilo]);

  const responder = () => {
    if (retro) return;
    const armado = asientoDe(filas);
    const r = evaluarAsiento(t, armado);
    detalle.current.push({ item: t.id, ok: r.ok, intentos: 1, respuesta: r.ok ? null : (r.confusion ?? "otro") });
    setHechos((xs) => [...xs, { id: t.id, transaccion: t.id, fecha: t.fecha, asiento: armado, ok: r.ok }]);
    setRetro(r);
  };

  const avanzar = () => {
    setRetro(null);
    setFilas([filaVacia(), filaVacia()]);
    if (i + 1 < TRANSACCIONES.length) setI(i + 1);
    else {
      /*
       * El diario que se lleva a las etapas siguientes es EL QUE ESCRIBIÓ EL
       * ESTUDIANTE, con sus errores dentro: el capítulo prohíbe corregir un
       * asiento ya registrado, y enseñarle el diario bueno en la etapa 2
       * sería corregírselo por detrás.
       */
      onTerminar(
        pctDeItems(detalle.current.filter((d) => d.ok).length, TRANSACCIONES.length),
        detalle.current,
        hechos,
      );
    }
  };

  const b = balanceDe(asientoDe(filas));
  const listo = filas.some((f) => f.cuenta && f.lado) && b.debe > 0 && b.haber > 0;

  return (
    <div>
      <Pulsos total={TRANSACCIONES.length} hechos={i + (retro ? 1 : 0)} etiqueta="Asiento" />

      <Superficie
        id="diario"
        titulo="LIBRO DIARIO"
        activa
        resumen={`${hechos.length} de ${TRANSACCIONES.length}`}
      >
        <HojaDelDiario asientos={hechos} />
        <div style={{
          marginTop: hechos.length ? "10px" : 0, padding: "10px 11px", borderRadius: "12px",
          background: "rgba(233,196,106,0.07)", border: `1px solid ${FAE.ambar}44`,
        }}>
          <p style={{ margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", color: FAE.ambar }}>
            {t.fecha.toUpperCase()}
          </p>
          <p style={{ margin: 0, fontSize: "13.5px", lineHeight: 1.5, color: FAE.text }}>{t.texto}</p>
        </div>
      </Superficie>

      <ConstructorAsiento
        filas={filas}
        cuentas={PALETA}
        conCifras
        deshabilitado={Boolean(retro)}
        acento={FAE.ambar}
        onFilas={setFilas}
        maximo={4}
      />

      {retro && <Retro texto={retro.texto} />}
      {!retro
        ? <Responder onClick={responder} deshabilitado={!listo}>Registrar el asiento</Responder>
        : (
          <Responder onClick={avanzar}>
            {i + 1 === TRANSACCIONES.length ? "Pasar al mayor" : "Siguiente transacción"}
          </Responder>
        )}
      {!retro && !listo && (
        <p style={{ margin: "9px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.45)", textAlign: "center" }}>
          Necesita al menos una cuenta al debe y una al haber, con su cifra.
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════ ETAPA 2 · LA MAYORIZACIÓN ═══════════════════════ */

export function EtapaMayor({ onTerminar, hilo, diario }) {
  const [i, setI] = useState(0);
  const [cuenta, setCuenta] = useState(null);
  const [lado, setLado] = useState(null);
  const [retro, setRetro] = useState(null);
  const [abiertas, setAbiertas] = useState([]);
  const detalle = useRef([]);

  const m = MOVIMIENTOS[i];
  /* Las once del caso, barajadas una vez por intento. */
  const opciones = useMemo(() => barajar(MAYOR.map((c) => c.cuenta)), []);

  useEffect(() => {
    const sumar = (cual) => abiertas.reduce((s, c) => s + c[cual].reduce((a, x) => a + x.valor, 0), 0);
    hilo({ izquierda: sumar("debitos"), derecha: sumar("creditos"), rotuloIzq: "DEBE", rotuloDer: "HABER" });
  }, [abiertas, hilo]);

  const responder = () => {
    if (retro || !cuenta || !lado) return;
    const r = evaluarMovimiento(m, { cuenta, lado });
    detalle.current.push({ item: `${m.id}:${m.lado}`, ok: r.ok, intentos: 1, respuesta: r.ok ? null : `${cuenta}/${lado}` });
    /* Lo mayorizado entra donde VA, no donde lo pusieron: el mayor de la etapa
       siguiente tiene que ser el del capítulo o las dos últimas no se pueden jugar. */
    setAbiertas((xs) => {
      const otras = xs.filter((c) => c.cuenta !== m.cuenta);
      const ya = xs.find((c) => c.cuenta === m.cuenta) ?? { cuenta: m.cuenta, debitos: [], creditos: [] };
      const cual = m.lado === DEBE ? "debitos" : "creditos";
      return [...otras, { ...ya, [cual]: [...ya[cual], { valor: m.valor, fecha: m.fecha }] }];
    });
    setRetro(r);
  };

  const avanzar = () => {
    setRetro(null); setCuenta(null); setLado(null);
    if (i + 1 < MOVIMIENTOS.length) setI(i + 1);
    else onTerminar(pctDeItems(detalle.current.filter((d) => d.ok).length, MOVIMIENTOS.length), detalle.current);
  };

  return (
    <div>
      <Pulsos total={MOVIMIENTOS.length} hechos={i + (retro ? 1 : 0)} etiqueta="Valor" />

      <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "12px" }}>
        {/* El renglón mayorizado NO se va del diario: recibe su marca y se queda.
            Es la regla del capítulo y la misma que enseña la pieza 4 de Aprender. */}
        <Superficie id="diario" titulo="LIBRO DIARIO" resumen={`${diario.length} asientos`}>
          <HojaDelDiario asientos={diario} marcar={MOVIMIENTOS.slice(0, i).map((x) => x.transaccion)} />
        </Superficie>
        <Superficie id="mayor" titulo="LIBRO MAYOR" activa resumen={`${abiertas.length} cuentas`}>
          <CuadriculaDelMayor cuentas={abiertas} resaltar={retro?.ok ? m.cuenta : null} />
        </Superficie>
      </div>

      <div style={{
        marginTop: "12px", padding: "10px 11px", borderRadius: "12px",
        background: "rgba(233,196,106,0.07)", border: `1px solid ${FAE.ambar}44`,
      }}>
        <p style={{ margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", color: FAE.ambar }}>
          {m.fecha.toUpperCase()} · AL {m.lado === DEBE ? "DEBE" : "HABER"} DEL DIARIO
        </p>
        <p style={{ margin: 0, fontSize: "14px", color: FAE.text }}>
          <span style={CIFRA}>{pesos(m.valor)}</span> — {m.cuenta}
        </p>
      </div>

      <p style={ROTULO}>¿A QUÉ CUENTA DEL MAYOR VA?</p>
      <Opciones columnas="repeat(auto-fit, minmax(150px, 1fr))">
        {opciones.map((c) => (
          <Opcion
            key={c}
            ancho
            deshabilitada={Boolean(retro)}
            onClick={() => setCuenta(c)}
            estado={!retro ? (cuenta === c ? "elegida" : null)
              : c === m.cuenta ? (cuenta === c ? "correcta" : "revelada")
                : c === cuenta ? "incorrecta" : null}
          >
            {c}
          </Opcion>
        ))}
      </Opciones>

      <p style={ROTULO}>¿Y DE QUÉ LADO?</p>
      <ElegirLado
        elegido={lado}
        correcto={retro ? m.lado : null}
        onElegir={setLado}
        deshabilitado={Boolean(retro)}
      />

      {retro && <Retro texto={retro.texto} />}
      {!retro
        ? <Responder onClick={responder} deshabilitado={!cuenta || !lado}>Mayorizar</Responder>
        : (
          <Responder onClick={avanzar}>
            {i + 1 === MOVIMIENTOS.length ? "Pasar a los saldos" : "Siguiente valor"}
          </Responder>
        )}
    </div>
  );
}

/* ═══════════════════════ ETAPA 3 · LOS SALDOS ═══════════════════════ */

export function EtapaSaldos({ onTerminar, hilo, diario }) {
  const [i, setI] = useState(0);
  const [cifra, setCifra] = useState("");
  const [lado, setLado] = useState(null);
  const [retro, setRetro] = useState(null);
  const [saldadas, setSaldadas] = useState([]);
  const detalle = useRef([]);

  const cuentas = useMemo(() => barajar(MAYOR), []);
  const c = cuentas[i];

  useEffect(() => {
    const suma = (l) => saldadas.filter((x) => x.lado === l).reduce((s, x) => s + x.saldo, 0);
    hilo({ izquierda: suma(DEBE), derecha: suma(HABER), rotuloIzq: "SALDOS AL DEBE", rotuloDer: "SALDOS AL HABER" });
  }, [saldadas, hilo]);

  const responder = () => {
    if (retro || !lado) return;
    const r = evaluarSaldo(c, { cifra: leerCifra(cifra), lado });
    detalle.current.push({ item: `saldo:${c.cuenta}:cifra`, ok: r.cifraOk, intentos: 1, respuesta: r.cifraOk ? null : String(leerCifra(cifra) ?? "") });
    detalle.current.push({ item: `saldo:${c.cuenta}:lado`, ok: r.ladoOk, intentos: 1, respuesta: r.ladoOk ? null : lado });
    setSaldadas((xs) => [...xs, c]);
    setRetro(r);
  };

  const avanzar = () => {
    setRetro(null); setCifra(""); setLado(null);
    if (i + 1 < cuentas.length) setI(i + 1);
    else onTerminar(pctDeItems(detalle.current.filter((d) => d.ok).length, detalle.current.length), detalle.current);
  };

  return (
    <div>
      <Pulsos total={cuentas.length} hechos={i + (retro ? 1 : 0)} etiqueta="Cuenta" />

      <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "12px" }}>
        <Superficie id="diario" titulo="LIBRO DIARIO" resumen={`${diario.length} asientos`}>
          <HojaDelDiario asientos={diario} />
        </Superficie>
        <Superficie id="mayor" titulo="LIBRO MAYOR" activa resumen={`${saldadas.length} de ${cuentas.length} saldadas`}>
          <CuadriculaDelMayor cuentas={[c]} conSaldo={Boolean(retro)} resaltar={c.cuenta} />
          {saldadas.length > 0 && (
            <div style={{ marginTop: "9px", opacity: 0.7 }}>
              <CuadriculaDelMayor cuentas={saldadas} conSaldo />
            </div>
          )}
        </Superficie>
      </div>

      <p style={ROTULO}>¿CUÁNTO ES EL SALDO DE «{c.cuenta.toUpperCase()}»?</p>
      <CampoCifra
        valor={cifra}
        onCambio={setCifra}
        onEnviar={responder}
        deshabilitado={Boolean(retro)}
        etiqueta={`Saldo de ${c.cuenta}`}
        estado={retro ? (retro.cifraOk ? "correcta" : "incorrecta") : null}
        autoFoco
      />

      <p style={ROTULO}>¿Y DE QUÉ LADO VA?</p>
      <ElegirLado elegido={lado} correcto={retro ? c.lado : null} onElegir={setLado} deshabilitado={Boolean(retro)} />

      {retro && <Retro texto={retro.texto} />}
      {!retro
        ? <Responder onClick={responder} deshabilitado={leerCifra(cifra) === null || !lado}>Responder</Responder>
        : (
          <Responder onClick={avanzar}>
            {i + 1 === cuentas.length ? "Pasar al estado" : "Siguiente cuenta"}
          </Responder>
        )}
    </div>
  );
}

/* ═══════ ETAPA 4 · EL ESTADO DE SITUACIÓN FINANCIERA ═══════ */

export function EtapaEstado({ onTerminar, hilo, diario }) {
  const [i, setI] = useState(0);
  const [seccion, setSeccion] = useState(null);
  const [retro, setRetro] = useState(null);
  const [ubicadas, setUbicadas] = useState([]);
  const detalle = useRef([]);

  const cuentas = useMemo(() => barajar(MAYOR), []);
  const c = cuentas[i];

  /* Las secciones tal como se van llenando: siempre con la ubicación CORRECTA,
     porque el estado que se construye es el del capítulo. Lo que se califica
     es haberla acertado, no dónde quedó la ficha. */
  const secciones = useMemo(() => SECCIONES_CON_CUENTAS.map((s) => {
    const lineas = ubicadas.filter((x) => s.cuentas.includes(x.cuenta)).map((x) => ({ cuenta: x.cuenta, valor: x.saldo }));
    return { ...s, lineas, total: lineas.reduce((a, l) => a + l.valor, 0) };
  }), [ubicadas]);

  const activos = secciones.filter((s) => s.id.startsWith("activo")).reduce((a, s) => a + s.total, 0);
  const pasivosMasPatrimonio = secciones.filter((s) => !s.id.startsWith("activo")).reduce((a, s) => a + s.total, 0);

  useEffect(() => {
    hilo({ izquierda: activos, derecha: pasivosMasPatrimonio, rotuloIzq: "ACTIVO", rotuloDer: "PASIVO + PATRIM." });
  }, [activos, pasivosMasPatrimonio, hilo]);

  const responder = () => {
    if (retro || !seccion) return;
    const r = evaluarUbicacion(c.cuenta, seccion);
    detalle.current.push({ item: `esf:${c.cuenta}`, ok: r.ok, intentos: 1, respuesta: r.ok ? null : seccion });
    setUbicadas((xs) => [...xs, c]);
    setRetro(r);
  };

  const avanzar = () => {
    setRetro(null); setSeccion(null);
    if (i + 1 < cuentas.length) setI(i + 1);
    else onTerminar(pctDeItems(detalle.current.filter((d) => d.ok).length, cuentas.length), detalle.current);
  };

  const cuadra = activos === pasivosMasPatrimonio && activos > 0;

  return (
    <div>
      <Pulsos total={cuentas.length} hechos={i + (retro ? 1 : 0)} etiqueta="Cuenta" />

      <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "12px" }}>
        <Superficie id="diario" titulo="LIBRO DIARIO" resumen={`${diario.length} asientos`}>
          <HojaDelDiario asientos={diario} />
        </Superficie>
        <Superficie id="mayor" titulo="LIBRO MAYOR" resumen={`${MAYOR.length} cuentas`}>
          <CuadriculaDelMayor cuentas={MAYOR} conSaldo />
        </Superficie>
        <Superficie id="estado" titulo="ESTADO DE SITUACIÓN FINANCIERA" activa resumen={`${ubicadas.length} de ${cuentas.length}`}>
          <HojaDelEstado
            encabezado={ENCABEZADO_ESTADO}
            secciones={secciones}
            activos={activos}
            pasivosMasPatrimonio={pasivosMasPatrimonio}
            cuadra={cuadra}
          />
        </Superficie>
      </div>

      <div style={{
        marginTop: "12px", padding: "10px 11px", borderRadius: "12px",
        background: "rgba(233,196,106,0.07)", border: `1px solid ${FAE.ambar}44`,
      }}>
        <p style={{ margin: 0, fontSize: "14px", color: FAE.text }}>
          {c.cuenta} — <span style={{ ...CIFRA, color: COLOR_LADO[c.lado] }}>{pesos(c.saldo)}</span>
        </p>
      </div>

      <p style={ROTULO}>¿DÓNDE VA EN EL ESTADO?</p>
      <Opciones columnas="repeat(auto-fit, minmax(150px, 1fr))">
        {SECCIONES_CON_CUENTAS.map((s) => (
          <Opcion
            key={s.id}
            ancho
            deshabilitada={Boolean(retro)}
            onClick={() => setSeccion(s.id)}
            estado={!retro ? (seccion === s.id ? "elegida" : null)
              : s.cuentas.includes(c.cuenta) ? (seccion === s.id ? "correcta" : "revelada")
                : s.id === seccion ? "incorrecta" : null}
          >
            {s.nombre}
          </Opcion>
        ))}
      </Opciones>

      {retro && <Retro texto={retro.texto} />}
      {!retro
        ? <Responder onClick={responder} deshabilitado={!seccion}>Ubicarla</Responder>
        : (
          <Responder onClick={avanzar}>
            {i + 1 === cuentas.length ? "Cerrar el ciclo" : "Siguiente cuenta"}
          </Responder>
        )}
    </div>
  );
}
