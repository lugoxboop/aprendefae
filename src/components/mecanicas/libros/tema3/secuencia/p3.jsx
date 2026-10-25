/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · P3 «Lo que ya pasó y no se ha pagado» en SecuenciaAprender · 8 pantallas.
 *
 * Paquete e3-t3-secuencias-aprender-v3.md §2 y §4 (se monta contra «Texto
 * clave»). Textos aprobados de contabilidadTema3Pieza3.js; nuevos de
 * t3SecuenciasTextos.js.
 *
 * Modelo (98): fila de días del 24 al 31 (14) · pista de gastos (28) ·
 * corchete «Retardo» (16) · pista de caja (28), con separaciones de 4.
 * (El paquete dice 5 px y total 98; 14 + 28 + 16 + 28 + 3 × 5 = 101, así que
 * van de 4 para quedar en 98. Anotado en el PR.)
 * ═══════════════════════════════════════════════════════════════════════════
 */
import {
  SEGMENTOS_P3, CIERRE_P3, ROTULO_CORTE, ROTULO_RETARDO, DIAS, POR_DIA, SAN_CALIXTO_P3, SAN_MIGUEL_P3,
  PIEZA_LO_QUE_YA_PASO,
} from "../../../../../data/contabilidadTema3Pieza3.js";
import { ROTULO_PISTA, RESULTADOS, CAJA, MARCAS } from "../../../../../data/contabilidadTema3.js";
import {
  TITULARES_P3, OPC_P3_1, OPC_SI_NO, OPC_P3_5, ERRORES_P3_1, ERROR_SI_NO_P3, ERRORES_P3_5, PISTAS,
  CUENTAS_ASIENTO_P3_SANCALIXTO, CUENTAS_ASIENTO_P3_SANMIGUEL, RAZON_HAZ_T3, RAZONES_HAZ_T3,
} from "../../../../../data/t3SecuenciasTextos.js";
import { hazResuelto } from "../../../../secuencia/secuencia.js";
import {
  Figura, PistaCompacta, Botones, ControlFlechas, HAZ_T3, elegir, zonaHaz, verDe, pesos, C, MONO,
  ALTO_FIGURA_T3, Asiento, ASIENTO_INICIAL, asientoResuelto, zonaAsiento, medirAsiento,
} from "./base.jsx";
import { frases, medirEleccion } from "./p1.jsx";

const FILA = [24, 25, 26, 27, 28, 29, 30, 31];
const xDia = (d) => `${((d - 24 + 0.5) / FILA.length) * 100}%`;
const bordeDia = (d) => `${((d - 24 + 1) / FILA.length) * 100}%`;
const termino = (t) => PIEZA_LO_QUE_YA_PASO.nombres.find((n) => n.termino === t).termino;

/**
 * empresa   SAN_CALIXTO_P3 o SAN_MIGUEL_P3 (su marca: gasto o ingreso)
 * marcas    si caen las cinco marcas de uso
 * nuevas    si caen ahora (cascada de 200 ms con 80 de desfase)
 * causa     si aparece «Se causa»
 * corte     el día del corte (o null); `cortePrevio` lo enseña sin confirmar
 * retardo   si aparece el corchete «Retardo»
 */
function ModeloP3({ empresa = SAN_CALIXTO_P3, marcas = false, nuevas = false, causa = false, corte = null, cortePrevio = null, retardo = false, rotuloArriba = null }) {
  const m = MARCAS[empresa.marca];
  const total = marcas ? DIAS.length * POR_DIA : 0;
  const nombreArriba = empresa.marca === "gasto" ? "Gastos" : "Ingresos";
  const linea = (d, firme) => (
    <span aria-hidden="true" data-corte={firme ? "firme" : "previo"} style={{
      position: "absolute", top: 0, bottom: 0, left: bordeDia(d), width: "2px", marginLeft: "-1px",
      background: firme ? C.texto : C.quieto, zIndex: 2,
    }} />
  );
  return (
    <div style={{ position: "relative", display: "grid", rowGap: "4px" }} data-modelo-p3={empresa.id}>
      <div style={{ display: "flex", height: "14px" }} data-fila-dias>
        {FILA.map((d) => (
          <span key={d} style={{ flex: "1 1 0", textAlign: "center", font: `400 12px/14px ${MONO}`, color: DIAS.includes(d) && marcas ? C.texto : C.apagado }}>{d}</span>
        ))}
      </div>
      <PistaCompacta
        data-pista={RESULTADOS}
        rotulo={(
          <span style={{ display: "flex", justifyContent: "space-between", gap: "6px" }}>
            <span style={{ minWidth: 0, overflow: "hidden" }}>{rotuloArriba ?? ROTULO_PISTA[RESULTADOS]}</span>
            {/* 6 px a la derecha: la raya del corte del 31 cae en el borde y no pisa la cifra. */}
            <span style={{ paddingRight: "6px" }}>{nombreArriba} <b style={{ font: `600 12px/16px ${MONO}`, color: C.texto }} data-monto>{pesos(total)}</b></span>
          </span>
        )}
        marcas={marcas ? DIAS.map((d, k) => ({ forma: m.forma, llena: m.llena, x: xDia(d), actual: true, nueva: nuevas, retraso: nuevas ? k * 80 : 0 })) : []}
      />
      <div style={{ position: "relative", height: "16px" }} data-retardo>
        {/* La fila del corchete: «Retardo» a la izquierda; a la derecha, «Se causa» y luego «Cierre del mes». */}
        {retardo && (
          <>
            <span aria-hidden="true" style={{ position: "absolute", left: `calc(${xDia(DIAS[0])} - 5px)`, right: `calc(100% - ${bordeDia(31)})`, top: "2px", height: "5px", border: `2px solid ${C.apagado}`, borderTop: "none" }} />
            <span className="t3s-rotulo" style={{ position: "absolute", left: 0, top: 0 }}>{ROTULO_RETARDO}</span>
          </>
        )}
        {corte !== null ? (
          <span className="t3s-rotulo" data-rotulo-corte style={{ position: "absolute", right: "4px", top: "4px", color: C.texto, background: C.fondo, paddingLeft: "4px" }}>{ROTULO_CORTE}</span>
        ) : causa ? (
          <span className="t3s-rotulo" data-se-causa style={{ position: "absolute", right: 0, top: 0, color: C.texto, fontWeight: 700 }}>{termino("Se causa")}</span>
        ) : null}
      </div>
      <PistaCompacta data-pista={CAJA} rotulo={ROTULO_PISTA[CAJA]} marcas={[]} />
      {cortePrevio !== null && corte === null && linea(cortePrevio, false)}
      {corte !== null && linea(corte, true)}
    </div>
  );
}

const NOMBRE_FIGURA = "La fila de días del 24 al 31, la línea de gastos y la de la caja";

function hazEleccion({ id, titular, opciones, correcta, antes, despues, pista, errores, modelo, nombre }) {
  const zonaDe = (estado) => zonaHaz(estado, { antes, despues, pista, porque: (el) => errores[el] ?? null });
  function F({ estado, setEstado }) {
    const e = estado ?? HAZ_T3;
    return (
      <Figura
        data-pantalla-t3={`p3-${id}`}
        ver={verDe(e)}
        modelo={modelo(hazResuelto(e), e)}
        control={<Botones nombre={nombre} opciones={opciones} estado={e} correcta={correcta} onElegir={(x) => setEstado((s) => elegir(s, x, correcta))} />}
        resuelta={hazResuelto(e)}
        recogido={<Botones nombre={nombre} opciones={opciones} estado={e} correcta={correcta} onElegir={(x) => setEstado((s) => elegir(s, x, correcta))} recoger />}
        zona={zonaDe(e)}
      />
    );
  }
  return {
    id, tipo: "haz", titular, Figura: F, nombreFigura: NOMBRE_FIGURA, estadoInicial: HAZ_T3,
    resuelta: hazResuelto, razon: RAZON_HAZ_T3, zonaDe, medir: medirEleccion(opciones, correcta),
  };
}

/* P3-4 · el corte con ‹ ›. Tocar el centro confirma el día. */
const CORTE_INICIAL = { ...HAZ_T3, indice: 0 };
function pantallaCorte() {
  const antes = [{ texto: frases(SEGMENTOS_P3[3])[0] }];
  const despues = [{ texto: SEGMENTOS_P3[3] }];
  const zonaDe = (estado) => zonaHaz(estado, { antes, despues, pista: PISTAS.p3.corte, porque: () => null });
  function F({ estado, setEstado }) {
    const e = estado ?? CORTE_INICIAL;
    const listo = hazResuelto(e);
    return (
      <Figura
        data-pantalla-t3="p3-corte"
        ver={verDe(e)}
        resuelta={listo}
        recogido={<ControlFlechas nombre="Mueve el corte" valores={FILA} indice={e.indice ?? 0} rotulo={(d) => `${d} de enero`} soloCentro />}
        modelo={<ModeloP3 marcas causa corte={listo ? 31 : null} cortePrevio={FILA[e.indice ?? 0]} retardo={listo} />}
        control={(
          <ControlFlechas
            nombre="Mueve el corte"
            valores={FILA}
            indice={e.indice ?? 0}
            apagado={listo}
            rotulo={(d) => `${d} de enero`}
            onMover={(i) => setEstado((s) => ({ ...(s ?? CORTE_INICIAL), indice: i }))}
            onConfirmar={(d) => setEstado((s) => ({ ...elegir(s ?? CORTE_INICIAL, String(d), "31"), indice: (s ?? CORTE_INICIAL).indice }))}
          />
        )}
        zona={zonaDe(e)}
      />
    );
  }
  const pon = (ids) => ids.reduce((e, d) => ({ ...elegir(e, d, "31"), indice: FILA.indexOf(Number(d)) }), CORTE_INICIAL);
  return {
    id: "corte", tipo: "haz", titular: TITULARES_P3.corte, Figura: F, nombreFigura: NOMBRE_FIGURA, estadoInicial: CORTE_INICIAL,
    resuelta: hazResuelto, razon: RAZONES_HAZ_T3.corte, zonaDe,
    medir: [
      { nombre: "sin-responder", estado: CORTE_INICIAL },
      { nombre: "pista", estado: pon(["28"]) },
      { nombre: "acierto", estado: pon(["31"]) },
      { nombre: "dos-errores", estado: pon(["28", "30"]) },
    ],
  };
}

/* P3-5 y P3-7 · el asiento con ‹ cuenta › (candidatas de Miyata, textos v3 §1). */
function pantallaAsiento({ id, titular, candidatas, empresa, despues, pista, rotulo }) {
  /* Arriba va la empresa; al resolver, aparece el nombre nuevo («Ajuste» o «Acumulado»). */
  const resuelta = asientoResuelto(candidatas);
  const zonaDe = (estado) => zonaAsiento(estado, candidatas, { antes: [], despues, pista });
  function F({ estado, setEstado }) {
    const e = estado ?? ASIENTO_INICIAL;
    const a = Asiento({ estado: e, setEstado, candidatas, monto: empresa.asiento.debe.monto, encima: resuelta(e) ? <b style={{ color: C.texto }}>{empresa.nombre} · {rotulo}</b> : empresa.nombre });
    return <Figura data-pantalla-t3={`p3-${id}`} ver={a.ver} resuelta={a.resuelta} recogido={a.recogido} modelo={a.modelo} control={a.control} zona={zonaDe(e)} />;
  }
  return {
    id, tipo: "haz", titular, Figura: F, nombreFigura: `El asiento de ${empresa.nombre}: la casilla Debe y la casilla Haber`,
    estadoInicial: ASIENTO_INICIAL, resuelta, razon: RAZONES_HAZ_T3.asiento, zonaDe,
    pendiente: candidatas ? null : `CUENTAS de Miyata para «${titular}»`,
    medir: medirAsiento(candidatas),
  };
}

export const SECUENCIA_P3 = {
  id: PIEZA_LO_QUE_YA_PASO.id,
  titulo: PIEZA_LO_QUE_YA_PASO.titulo,
  altoFigura: ALTO_FIGURA_T3,
  pantallas: [
    {
      id: "apertura", tipo: "apertura", titular: TITULARES_P3.apertura, nombreFigura: NOMBRE_FIGURA,
      Figura: () => <Figura data-pantalla-t3="p3-apertura" modelo={<ModeloP3 />} zona={[{ texto: SEGMENTOS_P3[0] }]} />,
      zonaDe: () => [{ texto: SEGMENTOS_P3[0] }], medir: [{ nombre: "apertura", estado: null }],
    },
    hazEleccion({
      id: "dias", titular: TITULARES_P3.dias, opciones: OPC_P3_1, correcta: "5", nombre: "¿Cuántos días de gasto?",
      antes: [{ texto: frases(SEGMENTOS_P3[1])[0] }], despues: [{ texto: SEGMENTOS_P3[1] }],
      pista: PISTAS.p3.dias, errores: ERRORES_P3_1,
      /* Sin marcas mientras elige; al acertar (o con el segundo error) caen las cinco. */
      modelo: (listo) => <ModeloP3 marcas={listo} nuevas={listo} />,
    }),
    hazEleccion({
      id: "caja", titular: TITULARES_P3.caja, opciones: OPC_SI_NO, correcta: "no", nombre: "¿La caja se mueve?",
      antes: [{ texto: frases(SEGMENTOS_P3[2])[0] }], despues: [{ texto: SEGMENTOS_P3[2] }],
      pista: PISTAS.p3.caja, errores: ERROR_SI_NO_P3,
      modelo: (listo) => <ModeloP3 marcas causa={listo} />,
    }),
    pantallaCorte(),
    pantallaAsiento({
      id: "ajuste-san-calixto", titular: TITULARES_P3.ajusteSanCalixto, candidatas: CUENTAS_ASIENTO_P3_SANCALIXTO.candidatas, empresa: SAN_CALIXTO_P3,
      despues: [{ texto: SEGMENTOS_P3[4] }], pista: PISTAS.p3.ajusteSanCalixto, rotulo: termino("Ajuste"),
    }),
    hazEleccion({
      id: "otro-lado", titular: TITULARES_P3.otroLado, opciones: OPC_P3_5, correcta: "ingreso", nombre: "¿Ingreso o gasto para San Miguel?",
      antes: [{ texto: SEGMENTOS_P3[5] }], despues: [{ texto: SEGMENTOS_P3[6] }],
      pista: PISTAS.p3.otroLado, errores: ERRORES_P3_5,
      modelo: (listo) => <ModeloP3 empresa={SAN_MIGUEL_P3} marcas={listo} nuevas={listo} rotuloArriba={SAN_MIGUEL_P3.nombre} />,
    }),
    /*
     * P3-7: el paquete pide 3 pasos (el asiento y, después, las citas de las
     * pp. 139 y 141 en la tarjeta de cita, con el titular «Esto se llama
     * acumulado»). SecuenciaAprender da los pasos ANTES de que un Haz espere su
     * respuesta, no después (#534): aquí va el asiento; la tarjeta (TarjetaCita)
     * está lista y medida, y entra cuando el componente lo permita.
     */
    pantallaAsiento({
      id: "ajuste-san-miguel", titular: TITULARES_P3.ajusteSanMiguel, candidatas: CUENTAS_ASIENTO_P3_SANMIGUEL.candidatas, empresa: SAN_MIGUEL_P3,
      despues: [{ texto: SEGMENTOS_P3[7] }], pista: PISTAS.p3.ajusteSanMiguel, rotulo: termino("Acumulado"),
    }),
    {
      id: "cierre", tipo: "cierre", titular: TITULARES_P3.cierre, nombreFigura: NOMBRE_FIGURA,
      Figura: () => <Figura data-pantalla-t3="p3-cierre" modelo={<ModeloP3 empresa={SAN_MIGUEL_P3} marcas rotuloArriba={SAN_MIGUEL_P3.nombre} corte={31} retardo />} zona={[{ texto: CIERRE_P3, fuerte: true }]} />,
      zonaDe: () => [{ texto: CIERRE_P3 }], medir: [{ nombre: "cierre", estado: null }],
    },
  ],
};
