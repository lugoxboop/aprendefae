/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · P1 «Vender no es cobrar» en SecuenciaAprender · 9 pantallas.
 *
 * Paquete e3-t3-secuencias-aprender-v3.md, §2 (secuencia) y §4 (tabla de
 * correspondencia: se monta contra «Texto clave»). Los textos aprobados vienen
 * de contabilidadTema3.js sin reescribir; los nuevos (titulares, opciones,
 * errores, pistas) de t3SecuenciasTextos.js (Miyata v1).
 *
 * Modelo: las dos líneas compactas con contadores (2 × 44 + 6 = 94 de 98).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import {
  SAN_CALIXTO, COMPANIA_CUALQUIERA, MARCAS, CONTADORES, ROTULO_PISTA, RESULTADOS, CAJA,
  TEXTO_PASO_1, CIERRE, AVISO_CAMBIO, PIEZA_VENDER_NO_ES_COBRAR,
} from "../../../../../data/contabilidadTema3.js";
import {
  TITULARES_P1, OPC_PREDICE, PREDICE_CORRECTA, errorPredice, PISTAS, RAZON_HAZ_T3, RAZONES_HAZ_T3,
} from "../../../../../data/t3SecuenciasTextos.js";
import { hazResuelto, mostrarCorrecto, responderHaz } from "../../../../secuencia/secuencia.js";
import { contadores, estadoPaso, PASOS as PASOS_CAPA_2 } from "../../../../../contabilidad/dosLineas.js";
import {
  Figura, PistaCompacta, Cifras, Botones, HAZ_T3, elegir, zonaHaz, verDe, ALTO_FIGURA_T3,
} from "./base.jsx";

/* ═══════════ LAS DOS LÍNEAS COMPACTAS ═══════════ */

const xDe = (i, n) => `${((i + 0.5) / n) * 100}%`;

/*
 * Las marcas y los contadores de una empresa hasta el hecho `hasta` (incluido
 * si `conActual`). Condición 1 de #572: los contadores salen de los hechos
 * publicados de P1 (contabilidadTema3.js) con la misma suma que usa la pieza
 * publicada (`contadores` de contabilidad/dosLineas.js), acumulados hecho por
 * hecho: antes de responder, lo de los hechos anteriores; al responder, se
 * suma el del hecho actual. Sin cifras propias ni de prueba.
 */
export function modeloP1(empresa, hasta, conActual) {
  const n = empresa.hechos.length;
  const marcas = { [RESULTADOS]: [], [CAJA]: [] };
  const vistas = [];
  empresa.hechos.forEach((h, i) => {
    if (i > hasta || (i === hasta && !conActual)) return;
    const actual = i === hasta;
    h.marcas.forEach((m) => {
      const def = MARCAS[m.tipo];
      marcas[def.pista].push({ forma: def.forma, llena: def.llena, x: xDe(i, n), actual, nueva: actual });
      vistas.push(m);
    });
  });
  return { marcas, suma: contadores(vistas) };
}

/*
 * El Cierre es el paso 6 de la Capa 2 publicada («Mírelo funcionar», San
 * Calixto): las cuatro marcas en blanco y los contadores de los cuatro hechos
 * (estadoPaso de dosLineas.js). CIERRE habla de esa empresa: la caja subió
 * más de lo que vendió. Antes iba Compañía Cualquiera, y su «Salió $100.000»
 * no es de ningún hecho de San Calixto.
 */
export function modeloCierreP1() {
  const e = estadoPaso(PASOS_CAPA_2);
  const marcas = { [RESULTADOS]: [], [CAJA]: [] };
  for (const m of e.marcas) {
    const def = MARCAS[m.tipo];
    marcas[def.pista].push({ forma: def.forma, llena: def.llena, x: xDe(m.columna, e.columnas), actual: true, nueva: false });
  }
  return { marcas, suma: e.contadores };
}

function DosLineasCompactas({ empresa, hasta = -1, conActual = false, rotulos = [true, true], cierre = false }) {
  const { marcas, suma } = cierre ? modeloCierreP1() : modeloP1(empresa, hasta, conActual);
  const pista = (p, k) => (
    <PistaCompacta
      key={p}
      data-pista={p}
      rotulo={rotulos[k] ? ROTULO_PISTA[p] : ""}
      cifras={rotulos[k] ? <Cifras pares={CONTADORES[p].map((t) => [MARCAS[t].nombre, suma[t]])} /> : <span />}
      marcas={marcas[p]}
    />
  );
  return (
    <div style={{ display: "grid", rowGap: "6px" }}>
      {pista(RESULTADOS, 0)}
      {pista(CAJA, 1)}
    </div>
  );
}

/* ═══════════ LA ZONA DE CADA HECHO ═══════════ */

/* El texto aprobado partido por frase completa, sin reescribir (§1, «Desborde del apoyo»). */
export const frases = (texto) => texto.split(/(?<=[.:!?])\s+(?=[A-ZÁÉÍÓÚÑ¿])/u);

/*
 * Antes de responder no se ve nada que diga la respuesta. Los dos textos que
 * pasan de 4 líneas a 320 (aporte y máquina, §2) se parten en «Paso 1 de 2»
 * (su primera frase, que es el planteamiento) y «Paso 2 de 2» (el resto, la
 * consecuencia). Los demás: antes, el título del hecho; después, su texto.
 */
const PARTIDOS = new Set(["aporte", "maquina"]);

export function zonaHecho(hecho) {
  if (PARTIDOS.has(hecho.id)) {
    const [primera, ...resto] = frases(hecho.texto);
    return {
      antes: [{ paso: "Paso 1 de 2" }, { texto: primera }],
      despues: [{ paso: "Paso 2 de 2" }, { texto: resto.join(" ") }],
    };
  }
  return { antes: [{ texto: hecho.titulo }], despues: [{ texto: hecho.texto }] };
}

/* ═══════════ LAS PANTALLAS ═══════════ */

const NOMBRE_FIGURA = "Las dos líneas: ingresos y gastos arriba, caja abajo";

function pantallaHecho(empresa, indice, { aviso = false } = {}) {
  const hecho = empresa.hechos[indice];
  const correcta = PREDICE_CORRECTA[hecho.id];
  const { antes, despues } = zonaHecho(hecho);
  const conAviso = aviso ? [{ texto: AVISO_CAMBIO, tipo: "aviso" }, ...antes] : antes;
  const zonaDe = (estado) => zonaHaz(estado, {
    antes: conAviso, despues, pista: PISTAS.p1[hecho.id], porque: (el) => errorPredice(hecho.id, el),
  });
  function FiguraHecho({ estado, setEstado }) {
    const e = estado ?? HAZ_T3;
    return (
      <Figura
        data-pantalla-t3={`p1-${hecho.id}`}
        ver={verDe(e)}
        modelo={<DosLineasCompactas empresa={empresa} hasta={indice} conActual={hazResuelto(e)} />}
        control={<Botones nombre="¿Qué línea se mueve?" opciones={OPC_PREDICE} estado={e} correcta={correcta} onElegir={(id) => setEstado((x) => elegir(x, id, correcta))} />}
        resuelta={hazResuelto(e)}
        recogido={<Botones nombre="¿Qué línea se mueve?" opciones={OPC_PREDICE} estado={e} correcta={correcta} onElegir={(id) => setEstado((x) => elegir(x, id, correcta))} recoger />}
        zona={zonaDe(e)}
      />
    );
  }
  return {
    id: hecho.id,
    tipo: "haz",
    titular: TITULARES_P1[hecho.id],
    Figura: FiguraHecho,
    nombreFigura: NOMBRE_FIGURA,
    estadoInicial: HAZ_T3,
    resuelta: hazResuelto,
    razon: RAZON_HAZ_T3,
    zonaDe,
    medir: medirEleccion(OPC_PREDICE, correcta),
  };
}

/** Los estados que la sonda mide de un Haz de elección: sin responder, pista, correcto y dos errores. */
export function medirEleccion(opciones, correcta) {
  const mal = opciones.filter((o) => o.id !== correcta).map((o) => o.id);
  const resp = (ids) => ids.reduce((e, id) => elegir(e, id, correcta), HAZ_T3);
  const estados = [
    { nombre: "sin-responder", estado: HAZ_T3 },
    { nombre: "acierto", estado: resp([correcta]) },
  ];
  /* La pista y el porqué de cada opción equivocada: el texto más largo sale de alguna. */
  for (const id of mal) {
    estados.push({ nombre: `pista-${id}`, estado: resp([id]) });
    estados.push({ nombre: `dos-errores-${id}`, estado: resp([id, mal.find((o) => o !== id) ?? id]) });
  }
  return estados;
}

/* P1-6: cada nombre a su marca (toque: el nombre y luego la marca). */
const FICHAS = PIEZA_VENDER_NO_ES_COBRAR.nombres.slice(0, 4);
const DESTINO = { Ingreso: "ingreso", Cobro: "entrada", Gasto: "gasto", Pago: "salida" };
const DESTINOS = ["ingreso", "gasto", "entrada", "salida"];
export const NOMBRES_INICIAL = { activa: null, it: {}, ultimo: null };

export function ponerNombre(estado, ficha, destino) {
  const e = estado ?? NOMBRES_INICIAL;
  const antes = e.it[ficha];
  if (hazResuelto(antes)) return e;
  const ok = DESTINO[ficha] === destino;
  const nuevo = responderHaz(antes, ok);
  return { activa: hazResuelto(nuevo) ? null : ficha, it: { ...e.it, [ficha]: nuevo }, ultimo: { ficha, ok } };
}
const nombresResueltos = (e) => FICHAS.every((f) => hazResuelto(e?.it?.[f.termino]));
const colocadoEn = (e, destino) => FICHAS.find((f) => DESTINO[f.termino] === destino && hazResuelto(e?.it?.[f.termino]))?.termino ?? null;

export function zonaNombres(estado) {
  const e = estado ?? NOMBRES_INICIAL;
  const u = e.ultimo;
  if (!u) return [];
  const t = e.it[u.ficha];
  if (!u.ok && !mostrarCorrecto(t)) return [{ texto: PISTAS.p1.nombres, fuerte: true, tipo: "pista" }];
  /* Acierto o dos errores: la ficha queda en su marca y su definición pasa al apoyo. */
  return [{ texto: FICHAS.find((f) => f.termino === u.ficha).definicion }];
}

function FiguraNombres({ estado, setEstado }) {
  const e = estado ?? NOMBRES_INICIAL;
  const ver = e.ultimo ? (e.ultimo.ok ? "bien" : mostrarCorrecto(e.it[e.ultimo.ficha]) ? null : "mal") : null;
  const destino = (d) => {
    const m = MARCAS[d];
    const puesto = colocadoEn(e, d);
    return (
      <button
        key={d}
        type="button"
        className="t3s-ctl"
        data-destino={d}
        aria-label={`Marca de ${m.nombre.toLowerCase()}${puesto ? `: ${puesto}` : ""}`}
        aria-disabled={!e.activa || puesto ? "true" : undefined}
        onClick={!e.activa || puesto ? undefined : () => setEstado((x) => ponerNombre(x, (x ?? NOMBRES_INICIAL).activa, d))}
        style={{ display: "grid", placeItems: "center", alignContent: "center", gap: "2px", padding: "4px 2px" }}
      >
        <span aria-hidden="true" style={{
          display: "block", width: "10px", height: "10px", borderRadius: m.forma === "circulo" ? "50%" : "2px",
          background: m.llena ? "#FFFFFF" : "transparent", border: m.llena ? "none" : "2px solid #FFFFFF",
        }} />
        <span style={{ fontSize: "12px", lineHeight: "16px", minHeight: "16px" }}>{puesto ?? ""}</span>
      </button>
    );
  };
  return (
    <Figura
      data-pantalla-t3="p1-nombres"
      ver={ver}
      resuelta={nombresResueltos(e)}
      recogido={null}
      modelo={(
        <div style={{ display: "grid", rowGap: "4px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <span className="t3s-rotulo" style={{ flex: 1, height: "auto", whiteSpace: "normal" }}>{ROTULO_PISTA[RESULTADOS]}</span>
            <span className="t3s-rotulo" style={{ flex: 1, height: "auto", whiteSpace: "normal" }}>{ROTULO_PISTA[CAJA]}</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>{DESTINOS.map(destino)}</div>
        </div>
      )}
      control={(
        <div role="group" aria-label="Los cuatro nombres" style={{ display: "flex", gap: "8px", flex: "1 1 0", minWidth: 0 }}>
          {FICHAS.map((f) => {
            const listo = hazResuelto(e.it[f.termino]);
            return (
              <button
                key={f.termino}
                type="button"
                className="t3s-ctl"
                data-ficha={f.termino}
                data-activa={e.activa === f.termino ? "" : undefined}
                aria-pressed={e.activa === f.termino ? "true" : "false"}
                aria-disabled={listo ? "true" : undefined}
                onClick={listo ? undefined : () => setEstado((x) => ({ ...(x ?? NOMBRES_INICIAL), activa: f.termino }))}
                style={listo ? { visibility: "hidden" } : undefined}
              >
                {f.termino}
              </button>
            );
          })}
        </div>
      )}
      zona={zonaNombres(e)}
    />
  );
}

function medirNombres() {
  const poner = (pares) => pares.reduce((e, [f, d]) => ponerNombre(e, f, d), NOMBRES_INICIAL);
  const largo = FICHAS.reduce((a, f) => (f.definicion.length > a.definicion.length ? f : a));
  return [
    { nombre: "sin-responder", estado: NOMBRES_INICIAL },
    { nombre: "pista", estado: poner([["Ingreso", "gasto"]]) },
    { nombre: "definicion-mas-larga", estado: poner([[largo.termino, DESTINO[largo.termino]]]) },
    { nombre: "todas", estado: poner(FICHAS.map((f) => [f.termino, DESTINO[f.termino]])) },
  ];
}

/* ═══════════ LA PIEZA ═══════════ */

function FiguraApertura({ paso }) {
  return (
    <Figura
      data-pantalla-t3="p1-apertura"
      modelo={<DosLineasCompactas empresa={SAN_CALIXTO} rotulos={[paso >= 1, paso >= 2]} />}
      zona={[{ texto: TEXTO_PASO_1 }]}
    />
  );
}

function FiguraCierre() {
  return (
    <Figura
      data-pantalla-t3="p1-cierre"
      modelo={<DosLineasCompactas empresa={SAN_CALIXTO} cierre />}
      zona={[{ texto: CIERRE, fuerte: true }]}
    />
  );
}

export const SECUENCIA_P1 = {
  id: PIEZA_VENDER_NO_ES_COBRAR.id,
  titulo: PIEZA_VENDER_NO_ES_COBRAR.titulo,
  altoFigura: ALTO_FIGURA_T3,
  pantallas: [
    {
      id: "apertura", tipo: "apertura", titular: TITULARES_P1.apertura, Figura: FiguraApertura, nombreFigura: NOMBRE_FIGURA,
      pasos: 2, rotulosPaso: [ROTULO_PISTA[RESULTADOS], ROTULO_PISTA[CAJA]],
      zonaDe: () => [{ texto: TEXTO_PASO_1 }],
      medir: [{ nombre: "paso-0", estado: null, paso: 0 }, { nombre: "paso-2", estado: null, paso: 2 }],
    },
    ...SAN_CALIXTO.hechos.map((_, i) => pantallaHecho(SAN_CALIXTO, i)),
    {
      id: "nombres", tipo: "haz", titular: TITULARES_P1.nombres, Figura: FiguraNombres, nombreFigura: "Las cuatro marcas, cada una esperando su nombre",
      estadoInicial: NOMBRES_INICIAL, resuelta: nombresResueltos, razon: RAZONES_HAZ_T3.ubicar, zonaDe: zonaNombres, medir: medirNombres(),
    },
    pantallaHecho(COMPANIA_CUALQUIERA, 0, { aviso: true }),
    pantallaHecho(COMPANIA_CUALQUIERA, 1),
    {
      id: "cierre", tipo: "cierre", titular: TITULARES_P1.cierre, Figura: FiguraCierre, nombreFigura: NOMBRE_FIGURA,
      zonaDe: () => [{ texto: CIERRE }], medir: [{ nombre: "cierre", estado: null }],
    },
  ],
};
