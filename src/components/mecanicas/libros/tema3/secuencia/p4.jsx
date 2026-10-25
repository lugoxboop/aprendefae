/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · P4 «Lo que ya se pagó y no ha pasado» en SecuenciaAprender · 10 pantallas.
 *
 * Paquete e3-t3-secuencias-aprender-v3.md §2 y §4 (contra «Texto clave»).
 * Textos aprobados de contabilidadTema3Pieza4.js; nuevos de t3SecuenciasTextos.js.
 *
 * Modelo (98): pista de gastos (28) · pista de caja (28) · fila del bloque:
 * 3 fichas de 80 × 30 («Junio», «Julio», «Agosto», con su cifra en mono 12),
 * separaciones de 6.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import {
  SEGMENTOS_P4, CIERRE_P4, MESES, POR_MES, ANTICIPO, SAN_CALIXTO_P4, ARRIENDOS_DE_LA_COSTA, CIERRE_DE,
  PIEZA_LO_QUE_YA_SE_PAGO,
} from "../../../../../data/contabilidadTema3Pieza4.js";
import { ROTULO_PISTA, RESULTADOS, CAJA, MARCAS } from "../../../../../data/contabilidadTema3.js";
import {
  TITULARES_P4, OPC_PREDICE, OPC_SI_NO, OPC_P4_3, OPC_P4_6, OPC_P4_7, ERRORES_PREDICE, ERROR_SI_NO_P4,
  ERRORES_P4_3, ERRORES_P4_6, ERRORES_P4_7, PISTAS, CUENTAS_ASIENTO_P4_JUNIO, CUENTAS_ASIENTO_P4_COSTA, PIE_ASIENTO_P4_JUNIO, RAZON_HAZ_T3,
} from "../../../../../data/t3SecuenciasTextos.js";
import { hazResuelto } from "../../../../secuencia/secuencia.js";
import {
  Figura, PistaCompacta, Botones, ControlFlechas, HAZ_T3, elegir, zonaHaz, verDe, pesos, C, MONO,
  ALTO_FIGURA_T3, Asiento, ASIENTO_INICIAL, asientoResuelto, zonaAsiento, medirAsiento,
} from "./base.jsx";
import { frases, medirEleccion } from "./p1.jsx";

const nombre = (t) => PIEZA_LO_QUE_YA_SE_PAGO.nombres.find((n) => n.termino === t).termino;
const xMes = (k) => `${((k + 0.5) / MESES.length) * 100}%`;

/**
 * empresa     SAN_CALIXTO_P4 o ARRIENDOS_DE_LA_COSTA
 * pago        si se ve la marca de caja del 1 de junio
 * bloque      "no" · "lleno" (3 fichas) · "tapado" (E8) · "junio-gastado"
 * cierres     cuántos cierres de mes ya causaron su marca arriba
 * rotuloBloque  el nombre que aparece sobre el bloque
 */
function ModeloP4({ empresa = SAN_CALIXTO_P4, pago = false, pagoNuevo = false, bloque = "no", cierres = 0, cierreNuevo = false, corte = null, cortePrevio = null, rotuloBloque = null, quedan = null }) {
  const caja = MARCAS[empresa.marcaCaja];
  const arriba = MARCAS[empresa.marcaCierre];
  const contorno = empresa.bloque.ficha === "contorno";
  const consumidas = bloque === "junio-gastado" || bloque === "tapado" ? 1 : 0;
  const ficha = (mes, k) => {
    const gastada = k < consumidas;
    const oculta = bloque === "tapado" && !gastada;
    return (
      <span key={mes} data-ficha-mes={mes} data-gastada={gastada ? "si" : "no"} style={{
        flex: "1 1 0", maxWidth: "80px", minWidth: 0, height: "30px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
        border: `2px ${gastada ? "dashed" : "solid"} ${gastada ? C.quieto : C.neutro}`,
        background: !gastada && !contorno && !oculta ? "rgba(184,196,212,0.18)" : "transparent",
        visibility: oculta ? "hidden" : "visible",
        font: "400 12px/16px Inter, sans-serif", color: gastada ? C.apagado : C.texto, whiteSpace: "nowrap",
      }}>
        {mes} <b style={{ font: `600 12px/16px ${MONO}` }}>{pesos(POR_MES)}</b>
      </span>
    );
  };
  const linea = (k, firme) => (
    <span aria-hidden="true" data-corte={firme ? "firme" : "previo"} style={{
      position: "absolute", top: 0, bottom: 0, left: `${((k + 1) / MESES.length) * 100}%`, width: "2px", marginLeft: "-1px",
      background: firme ? C.texto : C.quieto, zIndex: 2,
    }} />
  );
  return (
    <div style={{ position: "relative", display: "grid", rowGap: "6px" }} data-modelo-p4={empresa.id}>
      <PistaCompacta
        data-pista={RESULTADOS}
        rotulo={ROTULO_PISTA[RESULTADOS]}
        marcas={Array.from({ length: cierres }, (_, k) => ({ forma: arriba.forma, llena: arriba.llena, x: xMes(k), actual: true, nueva: cierreNuevo && k === cierres - 1 }))}
      />
      <PistaCompacta
        data-pista={CAJA}
        rotulo={(
          <span>{ROTULO_PISTA[CAJA]}</span>
        )}
        marcas={pago ? [{ forma: caja.forma, llena: caja.llena, x: "5px", actual: true, nueva: pagoNuevo }] : []}
      />
      <div style={{ display: "flex", gap: "8px", justifyContent: "space-between", height: "30px", position: "relative" }} data-bloque={bloque} aria-label={rotuloBloque ?? undefined}>
        {bloque === "no" ? null : MESES.map(ficha)}
        {bloque === "tapado" && quedan === null && <span aria-hidden="true" style={{ position: "absolute", inset: "0 0 0 88px", border: `2px solid ${C.quieto}`, borderRadius: "6px" }} />}
        {quedan !== null && <span data-quedan style={{ position: "absolute", right: 0, top: "-20px", font: `700 12px/16px ${MONO}`, color: C.texto }}>{pesos(quedan)}</span>}
      </div>
      {cortePrevio !== null && corte === null && linea(cortePrevio, false)}
      {corte !== null && linea(corte, true)}
    </div>
  );
}

const NOMBRE_FIGURA = "La línea de gastos, la de la caja y el bloque de tres meses de arriendo";

function hazEleccion({ id, titular, opciones, correcta, antes, despues, pista, porque, modelo, nombreControl }) {
  const zonaDe = (estado) => zonaHaz(estado, { antes, despues, pista, porque });
  function F({ estado, setEstado }) {
    const e = estado ?? HAZ_T3;
    return (
      <Figura
        data-pantalla-t3={`p4-${id}`}
        ver={verDe(e)}
        modelo={modelo(hazResuelto(e))}
        control={<Botones nombre={nombreControl} opciones={opciones} estado={e} correcta={correcta} onElegir={(x) => setEstado((s) => elegir(s, x, correcta))} />}
        zona={zonaDe(e)}
      />
    );
  }
  return {
    id, tipo: "haz", titular, Figura: F, nombreFigura: NOMBRE_FIGURA, estadoInicial: HAZ_T3,
    resuelta: hazResuelto, razon: RAZON_HAZ_T3, zonaDe, medir: medirEleccion(opciones, correcta),
  };
}

/* P4-5 · el corte de junio con ‹ ›, sobre las fichas de los meses. */
const CORTE_INICIAL = { ...HAZ_T3, indice: 1 };
function pantallaCorte() {
  const antes = [{ texto: frases(SEGMENTOS_P4[4])[0] }];
  const despues = [{ texto: SEGMENTOS_P4[4] }];
  const zonaDe = (estado) => zonaHaz(estado, { antes, despues, pista: PISTAS.p4.corte, porque: () => null });
  function F({ estado, setEstado }) {
    const e = estado ?? CORTE_INICIAL;
    const listo = hazResuelto(e);
    return (
      <Figura
        data-pantalla-t3="p4-corte"
        ver={verDe(e)}
        modelo={<ModeloP4 pago bloque={listo ? "junio-gastado" : "lleno"} cierres={listo ? 1 : 0} cierreNuevo={listo} corte={listo ? 0 : null} cortePrevio={e.indice ?? 1} rotuloBloque={nombre("Pagado por anticipado")} />}
        control={(
          <ControlFlechas
            nombre="Mueve el corte"
            valores={MESES}
            indice={e.indice ?? 1}
            apagado={listo}
            rotulo={CIERRE_DE}
            onMover={(i) => setEstado((s) => ({ ...(s ?? CORTE_INICIAL), indice: i }))}
            onConfirmar={(mes) => setEstado((s) => ({ ...elegir(s ?? CORTE_INICIAL, mes, MESES[0]), indice: (s ?? CORTE_INICIAL).indice }))}
          />
        )}
        zona={zonaDe(e)}
      />
    );
  }
  const pon = (ids) => ids.reduce((e, m) => ({ ...elegir(e, m, MESES[0]), indice: MESES.indexOf(m) }), CORTE_INICIAL);
  return {
    id: "corte", tipo: "haz", titular: TITULARES_P4.corte, Figura: F, nombreFigura: NOMBRE_FIGURA, estadoInicial: CORTE_INICIAL,
    resuelta: hazResuelto, razon: RAZON_HAZ_T3, zonaDe,
    medir: [
      { nombre: "sin-responder", estado: CORTE_INICIAL },
      { nombre: "pista", estado: pon(["Julio"]) },
      { nombre: "acierto", estado: pon(["Junio"]) },
      { nombre: "dos-errores", estado: pon(["Julio", "Agosto"]) },
    ],
  };
}

function pantallaAsiento({ id, titular, candidatas, empresa, despues, pista, pie = null }) {
  const resuelta = asientoResuelto(candidatas);
  const zonaDe = (estado) => [...zonaAsiento(estado, candidatas, { antes: [], despues, pista }), ...(pie ? [{ pie }] : [])];
  function F({ estado, setEstado }) {
    const e = estado ?? ASIENTO_INICIAL;
    const a = Asiento({ estado: e, setEstado, candidatas, monto: empresa.asiento.debe.monto, encima: empresa.nombre });
    return <Figura data-pantalla-t3={`p4-${id}`} ver={a.ver} modelo={a.modelo} control={a.control} zona={zonaDe(e)} />;
  }
  return {
    id, tipo: "haz", titular, Figura: F, nombreFigura: `El asiento de ${empresa.nombre}: la casilla Debe y la casilla Haber`,
    estadoInicial: ASIENTO_INICIAL, resuelta, razon: RAZON_HAZ_T3, zonaDe,
    pendiente: candidatas ? null : `CUENTAS de Miyata para «${titular}»`,
    medir: medirAsiento(candidatas),
  };
}

/* La predicción del pago: OPC_PREDICE con su error genérico (los demás son de hechos de P1). */
const porquePago = (el) => (el === "caja" ? null : ERRORES_PREDICE.generico);

/* P4-10 · el Cierre en 2 partes, por frase (152 caracteres, 5 líneas a 320). */
const [CIERRE_1, ...CIERRE_RESTO] = frases(CIERRE_P4);
const CIERRE_2 = CIERRE_RESTO.join(" ");

export const SECUENCIA_P4 = {
  id: PIEZA_LO_QUE_YA_SE_PAGO.id,
  titulo: PIEZA_LO_QUE_YA_SE_PAGO.titulo,
  altoFigura: ALTO_FIGURA_T3,
  pantallas: [
    {
      id: "apertura", tipo: "apertura", titular: TITULARES_P4.apertura, nombreFigura: NOMBRE_FIGURA,
      Figura: () => <Figura data-pantalla-t3="p4-apertura" modelo={<ModeloP4 />} zona={[{ texto: SEGMENTOS_P4[0] }]} />,
      zonaDe: () => [{ texto: SEGMENTOS_P4[0] }], medir: [{ nombre: "apertura", estado: null }],
    },
    hazEleccion({
      id: "predecir", titular: TITULARES_P4.predecir, opciones: OPC_PREDICE, correcta: "caja", nombreControl: "¿Qué línea se mueve?",
      antes: [{ texto: frases(SEGMENTOS_P4[1])[0] }], despues: [{ texto: SEGMENTOS_P4[1] }],
      pista: PISTAS.p4.predecir, porque: porquePago,
      modelo: (listo) => <ModeloP4 pago={listo} pagoNuevo={listo} />,
    }),
    hazEleccion({
      id: "ya-hubo-gasto", titular: TITULARES_P4.yaHuboGasto, opciones: OPC_SI_NO, correcta: "no", nombreControl: "¿Ya hubo gasto?",
      antes: [], despues: [{ texto: SEGMENTOS_P4[2] }],
      pista: PISTAS.p4.yaHuboGasto, porque: (el) => ERROR_SI_NO_P4[el] ?? null,
      modelo: () => <ModeloP4 pago />,
    }),
    hazEleccion({
      id: "que-es", titular: TITULARES_P4.queEs, opciones: OPC_P4_3, correcta: "tiene", nombreControl: "¿Lo tiene, lo debe o es un gasto?",
      antes: [], despues: [{ rotulo: nombre("Pagado por anticipado") }, { texto: SEGMENTOS_P4[3] }],
      pista: PISTAS.p4.queEs, porque: (el) => ERRORES_P4_3[el] ?? null,
      modelo: (listo) => <ModeloP4 pago bloque={listo ? "lleno" : "no"} rotuloBloque={listo ? nombre("Pagado por anticipado") : null} />,
    }),
    pantallaCorte(),
    /* P4-6: el O1 compacto reemplaza a las pistas en esta pantalla. */
    pantallaAsiento({
      id: "asiento-junio", titular: TITULARES_P4.asientoJunio, candidatas: CUENTAS_ASIENTO_P4_JUNIO.candidatas, pie: PIE_ASIENTO_P4_JUNIO, empresa: SAN_CALIXTO_P4,
      despues: [{ texto: SEGMENTOS_P4[5] }], pista: PISTAS.p4.asientoJunio,
    }),
    hazEleccion({
      id: "queda", titular: TITULARES_P4.queda, opciones: OPC_P4_6, correcta: "10000", nombreControl: "¿Cuánto queda en el bloque?",
      antes: [], despues: [{ texto: SEGMENTOS_P4[6] }],
      pista: PISTAS.p4.queda, porque: (el) => ERRORES_P4_6[el] ?? null,
      /* E8: el bloque queda tapado hasta que responde; luego aparece «$10.000». */
      modelo: (listo) => <ModeloP4 pago cierres={1} bloque={listo ? "junio-gastado" : "tapado"} quedan={listo ? ANTICIPO - POR_MES : null} rotuloBloque={nombre("Pagado por anticipado")} />,
    }),
    /*
     * P4-8: el paquete pide 3 pasos (la decisión y, después, las citas de las
     * pp. 142-143 y 145 en la tarjeta de cita, con el titular «Esto se llama
     * diferido»). SecuenciaAprender da los pasos antes de que el Haz espere,
     * no después (#534): va la decisión; la tarjeta entra cuando se pueda.
     */
    hazEleccion({
      id: "costa", titular: TITULARES_P4.costa, opciones: OPC_P4_7, correcta: "debe", nombreControl: "¿Lo tiene o lo debe?",
      antes: [{ texto: frases(SEGMENTOS_P4[7])[0] }], despues: [{ rotulo: nombre("Recibido por anticipado") }, { texto: SEGMENTOS_P4[7] }],
      pista: PISTAS.p4.costa, porque: (el) => ERRORES_P4_7[el] ?? null,
      modelo: (listo) => <ModeloP4 empresa={ARRIENDOS_DE_LA_COSTA} pago bloque="lleno" rotuloBloque={listo ? nombre("Recibido por anticipado") : null} />,
    }),
    pantallaAsiento({
      id: "asiento-costa", titular: TITULARES_P4.asientoCosta, candidatas: CUENTAS_ASIENTO_P4_COSTA.candidatas, empresa: ARRIENDOS_DE_LA_COSTA,
      despues: [{ texto: SEGMENTOS_P4[8] }], pista: PISTAS.p4.asientoCosta,
    }),
    {
      id: "cierre", tipo: "cierre", titular: TITULARES_P4.cierre, nombreFigura: NOMBRE_FIGURA, pasos: 1, rotulosPaso: [CIERRE_2],
      Figura: ({ paso }) => (
        <Figura
          data-pantalla-t3="p4-cierre"
          modelo={<ModeloP4 empresa={ARRIENDOS_DE_LA_COSTA} pago bloque="junio-gastado" cierres={1} rotuloBloque={nombre("Recibido por anticipado")} />}
          zona={[{ texto: paso >= 1 ? CIERRE_2 : CIERRE_1, fuerte: true }]}
        />
      ),
      zonaDe: (_, paso) => [{ texto: paso >= 1 ? CIERRE_2 : CIERRE_1 }],
      medir: [{ nombre: "parte-1", estado: null, paso: 0 }, { nombre: "parte-2", estado: null, paso: 1 }],
    },
  ],
};
