import { useEffect, useRef, useState } from "react";
import { CSS_JUEGO, Cierre } from "../mecanicas/corazon/juego.jsx";
/* Los estados de calificación, el punto y la palabra: de comun.jsx (B4, E3). */
import {
  C, INTER, SORA, MARCA, CEJILLA, CIFRA, HUNDIDO, REPOSO, CSS_FOCO, Devolucion, BotonSiguiente, Responder, Comprobar,
  ESTADOS, MarcaPieza, Pastilla, useTrasError,
} from "./comun.jsx";
import { cifra, leerCifra } from "./ToroNegro.jsx";
import { OpcionR5 } from "./OpcionR5.jsx";
import { Cabecera, Pista } from "./Cabecera.jsx";
import { ACTIVIDAD_MATE, ConActividad, TarjetasDeDatos, Armador, HojaRenglon } from "./Mate.jsx";
import { useReducido, useTemporizadores, useCifra, terminarAnimaciones, BARRA_DEL_SITIO } from "./movimiento.js";
import { cifraK } from "../../contabilidad/t7_2Kardex.js";
import { KARDEX, fila, enLibro, unitarioEnLibro, habriaSido, VENDIDO_PERIODICO, VENDIDO_PERMANENTE, FRANJA_DEL_10 } from "../../data/repasoCap5Permanente.js";
import {
  R5_5, PANTALLAS, HOJA_PERMANENTE, ENTRADA_PERMANENTE, DATOS_DEL_LIBRO_PERMANENTE, DATOS_DECLARADOS_PERMANENTE,
  ROTULOS_PERMANENTE as RP, DETALLES, MES_CORTO, AVISO_COMA, lineaHabriaSido, pantalla,
} from "../../data/repasoCap5PermanenteTextos.js";
import {
  evaluarP1, evaluarP2, evaluarP3, evaluarP4, evaluarP5, estadosDeValoresP2, faltaLaComa, puntuarR5_5, respuestaDe, TOTAL_R5_5,
} from "../../data/repasoCap5PermanenteJuego.js";
import { puedeRevisarMate } from "../../data/repasoCap5MateJuego.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-5 «SEPTIEMBRE EN PERMANENTE» (Célula E) — la mecánica, con el diseño de
 * Itagaki (v1 y v1.1) y las «Decisiones v1.3» de Kamogawa, que mandan.
 *
 *   entrada → 5 pantallas (una calificación cada una) → kárdex cerrado + Cierre
 *
 * Toda pantalla: enunciado → kárdex (lo que se toca, dentro de la fila en
 * curso) → barra de inventario → «Revisar» → devolución → «Siguiente».
 *
 * E8 de enganche.md: toda cifra que una pantalla pide calcular está TAPADA
 * (bloque #0E1B2E sin borde, «pendiente») desde que aparecería hasta que se
 * revisa la pantalla que la pide. La única excepción, escrita en la v1.3
 * (decisión 5): el saldo de la fila del 10 en la pantalla 3.
 *
 * El armador del asiento, su hoja y las tarjetas de la entrada son los de
 * r5-3 (Mate.jsx), con los datos de r5-5; los estados, de comun.jsx.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const DIVISORIA = "1px solid rgba(184,196,212,0.25)";
const ESPERA_P1 = 900;
const ESPERA_P3 = 1200;
const PAUSA_BARRA = 800;

/* La actividad que leen el armador, su hoja y las tarjetas de datos. */
const ACTIVIDAD_PERMANENTE = {
  ...ACTIVIDAD_MATE,
  id: "r5-5", RM: RP, HOJA_MATE: HOJA_PERMANENTE,
  DATOS_DEL_LIBRO: DATOS_DEL_LIBRO_PERMANENTE, DATOS_DECLARADOS: DATOS_DECLARADOS_PERMANENTE,
};

/*
 * Las columnas del kárdex (diseño v1): marca, cantidad, unitario y total, con
 * tres huecos de 6. 319 px de caja a 375 (60 · 64 · 76 · 101) y 264 a 320.
 * Medido en Chromium (v1.3, decisión 7): «ENTRADA» mide 59,9 px con el
 * espaciado de las marcas y 52,6 con 0,02 em, que no caben en 52; y
 * «10.000,00» (la pantalla 3 de v1.3, con 10.000) medía 71,1, que no cabía en 62. A 320
 * las columnas pasan a 53 · 41 · 72 · 80 (la cantidad más ancha, «8.200», mide
 * 40,1; el total, «17.467.426» en 600, 80): suman 264 igual. Nada se trunca.
 */
const CSS_PERMANENTE = `
.r55-k { display: grid; grid-template-columns: 60px 64px 76px 101px; column-gap: 6px; align-items: center; }
@media (max-width: 359px) { .r55-k { grid-template-columns: 53px 41px 72px 80px; } }
@keyframes r55-destapa { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
.r55-destapa { animation: r55-destapa 200ms ease-out both; }
@keyframes r55-entra { from { max-height: 0; opacity: 0; } to { max-height: 200px; opacity: 1; } }
.r55-entra { animation: r55-entra 300ms ease-out both; overflow: hidden; }
@keyframes r55-franja { from { max-height: 0; } to { max-height: 80px; } }
.r55-franja { animation: r55-franja 240ms ease-out both; overflow: hidden; }
@keyframes r55-despliega { from { max-height: 0; opacity: 0; } to { max-height: 1200px; opacity: 1; } }
.r55-despliega { animation: r55-despliega 300ms ease-out both; overflow: hidden; }
.r55-campo-entra { animation: r55-despliega 240ms ease-out both; overflow: hidden; }
@media (prefers-reduced-motion: reduce) { .r55-destapa, .r55-entra, .r55-franja, .r55-despliega, .r55-campo-entra { animation: none; } }
` + CSS_FOCO;

const NUMERO = { ...CIFRA, fontSize: "14px", lineHeight: "18px", color: C.texto, textAlign: "right", whiteSpace: "nowrap" };
const MARCA_K = { ...MARCA, letterSpacing: "0.02em" };
const fechaDe = (f) => `${f.dia} ${MES_CORTO}`;

/* ═══════════ EL KÁRDEX ═══════════ */

/* La celda tapada (v1.3, decisión 6): relleno #0E1B2E, sin borde ni texto; su etiqueta accesible, «pendiente». */
function Tapada() {
  return <span role="img" aria-label={RP.pendiente} data-tapada style={{ display: "block", height: "18px", width: "calc(100% - 4px)", marginLeft: "auto", borderRadius: "3px", background: C.fondo }} />;
}

/*
 * Un renglón del kárdex: la marca (ENTRADA, SALIDA, SALDO) y la terna.
 * `valores` son tres textos; `tapadas`, tres booleanos; `destapa` anima las
 * celdas que se acaban de destapar (200 ms, 80 ms de desfase).
 */
function RenglonK({ marca, valores, tapadas = [false, false, false], destapa = false, negrita = false, linea = false, dato }) {
  return (
    <div className="r55-k" data-renglon-k={dato} style={{ minHeight: "24px", ...(linea ? { borderTop: DIVISORIA } : {}) }}>
      <span style={{ ...MARCA_K, whiteSpace: "nowrap" }}>{marca}</span>
      {valores.map((v, k) => (
        <span key={k} data-celda={k} style={{ ...NUMERO, ...(k === 2 && negrita ? { fontWeight: 600 } : {}) }}>
          {tapadas[k]
            ? <Tapada />
            : <span className={destapa ? "r55-destapa" : undefined} style={{ display: "block", animationDelay: destapa ? `${k * 80}ms` : undefined }}>{v}</span>}
        </span>
      ))}
    </div>
  );
}

function Encabezado({ f, declarado = false }) {
  return (
    <div style={{ minHeight: "20px", display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{ ...MARCA, whiteSpace: "nowrap" }}>{fechaDe(f)}</span>
      <span data-detalle style={{ fontFamily: INTER, fontSize: "13px", lineHeight: "18px", color: C.texto }}>{DETALLES[f.id]}</span>
      {declarado && <span data-marca-declarado style={{ ...MARCA, marginLeft: "auto" }}>{RP.declarado}</span>}
    </div>
  );
}

/*
 * Una fila del kárdex. Modos (v1 y v1.1 §0):
 *   abierta   encabezado, movimiento y saldo (76 px)
 *   saldo     la fila anterior: encabezado y saldo (52 px)
 *   plegada   fecha, detalle y la cantidad del saldo (28 px)
 * `tapar` dice qué celdas siguen tapadas; `mov`/`saldo`, si se pintan otras
 * cifras (lo que eligió el estudiante en la pantalla 3); `slot`, la
 * interacción, después del encabezado o del movimiento.
 */
function FilaK({ id, modo, tapar = {}, mov = null, saldo = null, destapa = false, entra = false, declarado = false, slot = null, slotTras = "encabezado" }) {
  const f = fila(id);
  if (modo === "plegada") {
    return (
      <div data-fila={id} data-modo="plegada" style={{ minHeight: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
          <span style={{ ...MARCA, whiteSpace: "nowrap" }}>{fechaDe(f)}</span>
          <span style={{ fontFamily: INTER, fontSize: "13px", lineHeight: "18px", color: C.texto }}>{DETALLES[f.id]}</span>
        </span>
        <span style={{ ...NUMERO, fontSize: "13px", color: C.atenuado }}>{RP.unidadesCorto(cifraK(f.saldo[0]))}</span>
      </div>
    );
  }
  const movTxt = mov ?? (f.mov ? enLibro(f.mov) : null);
  const saldoTxt = saldo ?? enLibro(f.saldo);
  const conMov = modo === "abierta" && movTxt;
  return (
    <div
      data-fila={id}
      data-modo={modo}
      className={entra ? "r55-entra" : undefined}
      style={{ padding: "4px 0", ...(declarado ? { border: `1.5px dashed ${C.atenuado}`, borderRadius: "8px", padding: "4px 6px", margin: "0 -6px" } : {}) }}
    >
      <Encabezado f={f} declarado={declarado} />
      {slotTras === "encabezado" && slot}
      {conMov && <RenglonK dato="mov" marca={f.tipo === "salida" ? RP.salida : RP.entrada} valores={movTxt} tapadas={tapar.mov} destapa={destapa} negrita />}
      {slotTras === "movimiento" && slot}
      <RenglonK dato="saldo" marca={RP.saldo} valores={saldoTxt} tapadas={tapar.saldo} destapa={destapa} linea={Boolean(conMov) || slotTras === "movimiento"} />
    </div>
  );
}

function Kardex({ children, cajaRef, onTocar }) {
  return (
    <div ref={cajaRef} data-kardex onClick={onTocar} style={{ ...HUNDIDO, borderRadius: "12px", padding: "12px" }}>
      <div className="r55-k" aria-hidden="true" style={{ minHeight: "24px" }}>
        <span />
        {[RP.cant, RP.cUnit, RP.total].map((m) => <span key={m} style={{ ...MARCA_K, textAlign: "right" }}>{m}</span>)}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {Array.isArray(children)
          ? children.filter(Boolean).map((c, k) => <div key={k} style={{ borderTop: DIVISORIA }}>{c}</div>)
          : <div style={{ borderTop: DIVISORIA }}>{children}</div>}
      </div>
    </div>
  );
}

/* ═══════════ LA BARRA «INVENTARIO DE MERCANCÍAS» ═══════════ */

/* Escalas fijas para toda la pieza: el mayor saldo de unidades y el mayor valor que se dibuja (con lo inflado de la pantalla 3). */
const ESCALA_Q = Math.max(...KARDEX.map((f) => f.saldo[0]));
const ESCALA_V = Math.max(...KARDEX.map((f) => Math.round(f.saldo[2])), ...PANTALLAS.find((p) => p.id === "p3").botones.map(habriaSido));
const pct = (x, m) => `${Math.max(0, Math.min(100, (x / m) * 100))}%`;

/* Arranca cuando la caja está a la vista en al menos la mitad (corrección de Takamura): no desplaza la página. */
function useAlaVista(ref) {
  const [vista, setVista] = useState(() => typeof IntersectionObserver !== "function");
  useEffect(() => {
    if (vista || !ref.current) return undefined;
    const obs = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting && e.intersectionRatio >= 0.5)) { setVista(true); obs.disconnect(); } }, { threshold: [0, 0.5, 1] });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [vista]); // eslint-disable-line react-hooks/exhaustive-deps
  return vista;
}

/*
 * `pasos`: los estados por los que pasa ({ q, v }); el último es el que queda.
 * Cada vez que cambia `clave`, la barra vuelve a pasar por ellos al estar a la
 * vista, con 400 ms por paso y 800 entre uno y otro (v1.1 §2). Un toque la
 * lleva al final; con reduced-motion va directo.
 */
function Barra({ pasos, clave, contorno = null, linea = null }) {
  const reducido = useReducido();
  const caja = useRef(null);
  const { despues, cancelar } = useTemporizadores();
  const final = pasos[pasos.length - 1];
  const [i, setI] = useState(pasos.length - 1);
  const [antes, setAntes] = useState(final);
  const [jugada, setJugada] = useState(clave);
  const vista = useAlaVista(caja);
  const enCurso = jugada !== clave;
  useEffect(() => {
    if (!enCurso) return;
    if (reducido) { setI(pasos.length - 1); setJugada(clave); return; }
    if (!vista) return;
    cancelar();
    setI(0);
    pasos.slice(1).forEach((_, k) => despues(400 + PAUSA_BARRA + k * (400 + PAUSA_BARRA), () => setI(k + 1)));
    despues(pasos.length * 400 + (pasos.length - 1) * PAUSA_BARRA, () => { setJugada(clave); setAntes(final); });
  }, [clave, vista, enCurso]); // eslint-disable-line react-hooks/exhaustive-deps
  /* Mientras espera a la vista, la barra muestra lo de antes. */
  const ahora = enCurso && !vista && !reducido ? antes : pasos[Math.min(i, pasos.length - 1)];
  const saltar = () => { if (enCurso) { cancelar(); setI(pasos.length - 1); setJugada(clave); setAntes(final); } };
  const q = useCifra(ahora.q, reducido ? 0 : 400, antes.q);
  const v = useCifra(ahora.v, reducido ? 0 : 400, antes.v);
  const ancho = { transition: reducido ? "none" : "width 400ms cubic-bezier(0.2,0.8,0.2,1)" };
  const renglon = (et, txt, w, dato, extra = null) => (
    <div data-barra={dato}>
      <div style={{ minHeight: "18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <span style={{ fontFamily: INTER, fontSize: "13px", color: C.atenuado }}>{et}</span>
        <span data-barra-cifra={dato} style={{ ...CIFRA, fontSize: "14px", fontWeight: 600, color: C.texto }}>{txt}</span>
      </div>
      <div style={{ position: "relative", marginTop: "4px", height: "8px", borderRadius: "4px", background: C.fondo }}>
        <div data-relleno={dato} style={{ height: "100%", borderRadius: "4px", background: C.hecho, width: w, ...ancho }} />
        {extra}
      </div>
    </div>
  );
  return (
    <div ref={caja} data-barra-inventario data-en-curso={enCurso ? "si" : "no"} onClick={saltar} style={{ ...HUNDIDO, borderRadius: "12px", padding: "10px 12px" }}>
      <p style={{ ...MARCA, margin: "0 0 6px" }}>{RP.inventario}</p>
      {renglon(RP.unidades, RP.unidadesCorto(cifraK(Math.round(q))), pct(ahora.q, ESCALA_Q), "unidades")}
      <div style={{ height: "6px" }} />
      {renglon(RP.valorBarra, cifra(Math.round(v)), pct(ahora.v, ESCALA_V), "valor",
        contorno !== null && (
          /* Lo que habría sido: contorno discontinuo de 1 px #B8C4D4 (v1.1 §2). */
          <div data-contorno aria-hidden="true" style={{ position: "absolute", left: 0, top: "-1px", height: "10px", boxSizing: "border-box", width: pct(contorno, ESCALA_V), border: `1px dashed ${C.atenuado}`, borderRadius: "4px" }} />
        ))}
      {linea && <p data-linea-habria style={{ margin: "6px 0 0", minHeight: "12px", fontFamily: INTER, fontSize: "12px", lineHeight: "12px", color: C.atenuado }}>{linea}</p>}
    </div>
  );
}

const estadoDe = (id) => { const s = fila(id).saldo; return { q: s[0], v: Math.round(s[2]) }; };

/* ═══════════ LOS CAMPOS ═══════════ */

/* El unitario «la coma se pone sola» (diseño § campos): los dos últimos dígitos son los centavos. */
export const DIGITOS_UNITARIO = 8;
export function leerUnitario(texto) {
  const digitos = String(texto).replace(/\D/g, "").replace(/^0+/, "").slice(0, DIGITOS_UNITARIO);
  return digitos === "" ? null : Number(digitos) / 100;
}
export const pintarUnitario = (n) => (n === null ? "" : unitarioEnLibro(n));

function Campo({ etiqueta, tipo, valor, onValor, estado = null, bloqueado = false, aviso = false, nota = null, dato }) {
  const id = `r55-${dato}`;
  /* §4.1: reposo 1 px; el aviso de la coma no es un error (coral solo error): 2 px #F8F9FA. */
  const borde = estado ? ESTADOS[estado].border : aviso ? ESTADOS.ok.border : REPOSO;
  return (
    <div data-campo-bloque={dato}>
      {/* Con un solo campo por fila (pantalla 4), la marca puede pasar sobre la mitad vacía de la derecha. */}
      <label htmlFor={id} style={{ ...MARCA, display: "block", width: "max-content", marginBottom: "4px", whiteSpace: "nowrap" }}>{etiqueta}</label>
      <input
        id={id}
        data-campo={dato}
        className="r55-campo"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={tipo === "unitario" ? "0,00" : "0"}
        readOnly={bloqueado}
        value={tipo === "unitario" ? pintarUnitario(valor) : (valor === null ? "" : cifra(valor))}
        onChange={(e) => onValor(tipo === "unitario" ? leerUnitario(e.target.value) : leerCifra(e.target.value, 9))}
        style={{
          width: "100%", height: "48px", boxSizing: "border-box", borderRadius: "10px", padding: "0 8px", background: estado ? ESTADOS[estado].background : "transparent",
          border: borde, ...CIFRA, fontSize: "17px", fontWeight: 600, textAlign: "right", color: C.texto,
        }}
      />
      {estado && <span style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px", minHeight: "16px" }}><MarcaPieza pieza="valor" estado={estado} /></span>}
      {nota && !estado && <p data-coma-sola style={{ margin: "4px 0 0", minHeight: "16px", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: C.atenuado }}>{nota}</p>}
    </div>
  );
}

/* El aviso de la coma (v1.3, decisión 3): no califica ni revela la clave. */
function AvisoComa() {
  return <p data-aviso-coma role="status" style={{ margin: "6px 0 0", fontFamily: INTER, fontSize: "13px", lineHeight: "18px", color: C.texto }}>{AVISO_COMA}</p>;
}

/* Un botón de elección (§4.1 y §4.2): sin relleno; su estado con la pastilla común. */
function Eleccion({ texto, estado = null, onClick, bloqueado, dato, alto = 52, cifraArriba = false }) {
  const visto = ESTADOS[estado] ?? ESTADOS.reposo;
  return (
    <button
      type="button"
      data-eleccion={dato}
      data-estado={estado ?? "ninguno"}
      aria-disabled={bloqueado ? "true" : undefined}
      onClick={bloqueado ? undefined : onClick}
      style={{
        minHeight: `${alto}px`, width: "100%", boxSizing: "border-box", borderRadius: "10px", padding: cifraArriba ? "8px 8px 4px" : "6px 8px",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: cifraArriba ? "flex-start" : "center", gap: "2px",
        cursor: bloqueado ? "default" : "pointer", color: C.texto, ...visto,
      }}
    >
      <span style={cifraArriba
        ? { ...CIFRA, fontSize: "15px", lineHeight: "20px", fontWeight: 600 }
        : { ...MARCA, color: C.texto, fontSize: "12px", letterSpacing: "0.04em" }}
      >
        {texto}
      </span>
      <span style={{ minHeight: "16px", display: "inline-flex", alignItems: "center" }}>
        {estado && <Pastilla estado={estado} />}
      </span>
    </button>
  );
}

/* §4.3: «Comprobar» (varios campos), el Responder común. */
function BotonRevisar({ activo, onClick, dato = "revisar" }) {
  return <Comprobar activo={activo} onClick={onClick} dato={dato} />;
}

const PAR = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" };
const MEDIA = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", margin: "4px 0 8px" };

/* El asiento del costo (pantallas 2 y 3): el del ingreso «YA REGISTRADO» encima, de solo lectura (v1.3, decisión 2). */
let siguienteId = 0;
function AsientoDelCosto({ p, r, onRevisar }) {
  const [renglones, setRenglones] = useState([]);
  const [hoja, setHoja] = useState(null);
  const revelar = useTrasError(Boolean(r?.asiento && !r.asiento.ok));
  const listo = ({ lado, cuenta, valor }) => {
    setRenglones((xs) => (hoja.inicial ? xs.map((x) => (x.id === hoja.inicial.id ? { ...x, cuenta, valor } : x)) : [...xs, { id: `p${siguienteId++}`, lado, cuenta, valor }]));
    setHoja(null);
  };
  const asiento = r?.asiento ?? null;
  return (
    <div className="r55-despliega" data-asiento-del-costo style={{ marginTop: "16px" }}>
      <Armador datos={{ "data-armador": "ya-registrado" }} soloLectura marca={RP.yaRegistrado} renglones={p.ingreso.map((c, k) => ({ ...c, id: `i${k}` }))} />
      <div style={{ marginTop: "12px" }}>
        <Armador
          datos={{ "data-armador": "tu-asiento" }}
          renglones={renglones}
          estados={asiento ? asiento.estados : null}
          piezas={asiento ? asiento.piezas : null}
          bloqueado={Boolean(r)}
          onAnadir={(lado) => setHoja({ lado, inicial: null })}
          onEditar={(x) => setHoja({ lado: x.lado, inicial: x })}
        />
      </div>
      {/* §4.2: «Iba aquí», 0,7 s después del error. */}
      {revelar && (
        <div style={{ marginTop: "12px" }}>
          <Armador datos={{ "data-armador": "era-este" }} soloLectura revelada renglones={asiento.correcto.map((c, k) => ({ ...c, id: `c${k}` }))} />
        </div>
      )}
      {!r && <BotonRevisar dato="revisar-asiento" activo={puedeRevisarMate(renglones)} onClick={() => onRevisar(renglones)} />}
      {hoja && (
        <HojaRenglon
          lado={hoja.lado}
          inicial={hoja.inicial}
          renglones={renglones}
          onListo={listo}
          onQuitar={(x) => { setRenglones((xs) => xs.filter((y) => y.id !== x.id)); setHoja(null); }}
          onCancelar={() => setHoja(null)}
        />
      )}
    </div>
  );
}

const TODO = [true, true, true];
const NADA = [false, false, false];

/* ═══════════ PANTALLA 1 · LA COMPRA TRAE SU FLETE ═══════════ */

function Pantalla1({ r, onCalificar }) {
  const reducido = useReducido();
  const { despues } = useTemporizadores();
  const [destino, setDestino] = useState(null);
  const [revelada, setRevelada] = useState(false);
  const [campo, setCampo] = useState(false);
  const [unitario, setUnitario] = useState(null);
  const [aviso, setAviso] = useState(false);
  const elegir = (d) => {
    if (destino) return;
    setDestino(d);
    if (d === "gasto") {
      const corregir = () => { setRevelada(true); setCampo(true); };
      if (reducido) corregir(); else despues(ESPERA_P1, corregir);
    } else setCampo(true);
  };
  const revisar = () => {
    if (faltaLaComa(unitario)) { setAviso(true); return; }
    const v = evaluarP1({ destino, unitario });
    onCalificar(v, { destino, unitario });
  };
  const estadoBoton = (d) => {
    if (!destino) return null;
    if (d === destino) return d === "compra" ? "ok" : "mal";
    return d === "compra" && revelada ? "revelada" : null;
  };
  const tapado = !r;
  return (
    <>
      <Kardex>
        <FilaK id="inicial" modo="abierta" />
        <FilaK
          id="c2"
          modo="abierta"
          destapa={Boolean(r)}
          tapar={{ mov: tapado ? [false, true, true] : NADA, saldo: tapado ? TODO : NADA }}
          slot={(
            <div style={{ margin: "4px 0 8px" }}>
              <div style={PAR}>
                <Eleccion dato="compra" texto={RP.aLaCompra} estado={estadoBoton("compra")} bloqueado={Boolean(destino)} onClick={() => elegir("compra")} />
                <Eleccion dato="gasto" texto={RP.alGasto} estado={estadoBoton("gasto")} bloqueado={Boolean(destino)} onClick={() => elegir("gasto")} />
              </div>
              {campo && (
                <div className="r55-campo-entra" style={{ ...MEDIA, marginBottom: 0 }}>
                  <div>
                    <Campo dato="unitario" etiqueta={RP.costoUnitario} tipo="unitario" valor={unitario} bloqueado={Boolean(r)} estado={r ? r.estados.unitario : null} aviso={aviso}
                      onValor={(x) => { setUnitario(x); setAviso(false); }} nota={RP.comaSola} />
                    {aviso && <AvisoComa />}
                  </div>
                </div>
              )}
            </div>
          )}
        />
        {r && <FilaK id="d8" modo="abierta" entra declarado tapar={{ saldo: [false, true, false] }} />}
      </Kardex>
      <div style={{ marginTop: "16px" }}>
        <Barra clave={r ? "p1-revisada" : "p1"} pasos={r ? [estadoDe("c2"), estadoDe("d8")] : [estadoDe("inicial")]} />
      </div>
      {!r && <BotonRevisar activo={Boolean(campo && unitario)} onClick={revisar} />}
    </>
  );
}

/* ═══════════ PANTALLA 2 · VENDE 6.000 ═══════════ */

function Pantalla2({ r, onCalificar }) {
  const p = pantalla("p2");
  const [promedio, setPromedio] = useState(null);
  const [costo, setCosto] = useState(null);
  const [aviso, setAviso] = useState(false);
  const [valores, setValores] = useState(null); // los estados de los dos campos, tras «Revisar valores»
  const revisarValores = () => {
    if (faltaLaComa(promedio)) { setAviso(true); return; }
    setValores(estadosDeValoresP2({ promedio, costo }));
  };
  const revisarAsiento = (renglones) => onCalificar(evaluarP2({ promedio, costo, renglones }), { promedio, costo, renglones });
  const tapado = !valores;
  return (
    <>
      <Kardex>
        <FilaK id="inicial" modo="plegada" />
        <FilaK id="c2" modo="plegada" />
        <FilaK id="d8" modo="saldo" destapa={!tapado} tapar={{ saldo: tapado ? [false, true, false] : NADA }} declarado />
        <FilaK
          id="v10"
          modo="abierta"
          destapa={!tapado}
          tapar={{ mov: tapado ? [false, true, true] : NADA, saldo: tapado ? [false, true, true] : NADA }}
          slot={(
            <div style={MEDIA}>
              <div>
                <Campo dato="promedio" etiqueta={RP.costoUnitario} tipo="unitario" valor={promedio} bloqueado={Boolean(valores)} estado={valores?.promedio ?? null} aviso={aviso}
                  onValor={(x) => { setPromedio(x); setAviso(false); }} />
                {aviso && <AvisoComa />}
              </div>
              <Campo dato="costo" etiqueta={RP.costoTotal} tipo="total" valor={costo} bloqueado={Boolean(valores)} estado={valores?.costo ?? null} onValor={setCosto} />
            </div>
          )}
        />
      </Kardex>
      <div style={{ marginTop: "16px" }}>
        <Barra clave={valores ? "p2-revisada" : "p2"} pasos={valores ? [estadoDe("v10")] : [estadoDe("d8")]} />
      </div>
      {!valores && <BotonRevisar dato="revisar-valores" activo={Boolean(promedio && costo)} onClick={revisarValores} />}
      {valores && <AsientoDelCosto p={p} r={r} onRevisar={revisarAsiento} />}
    </>
  );
}

/* ═══════════ PANTALLA 3 · VUELVEN 200 ═══════════ */

/* El orden de los cuatro botones se baraja una vez por intento (v1.1 §2). */
function barajar(xs) {
  const a = [...xs];
  for (let k = a.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [a[k], a[j]] = [a[j], a[k]];
  }
  return a;
}

function Pantalla3({ r, onCalificar, orden = null }) {
  const p = pantalla("p3");
  const reducido = useReducido();
  const { despues, cancelar } = useTemporizadores();
  const [botones] = useState(() => orden ?? barajar(p.botones));
  const [elegido, setElegido] = useState(null);
  const [corregida, setCorregida] = useState(false);
  const clave = p.clave.unitario;
  const elegir = (x) => {
    if (elegido !== null) return;
    setElegido(x);
    if (x === clave || reducido) setCorregida(true);
    else despues(ESPERA_P3, () => setCorregida(true));
  };
  /* El toque en el kárdex mientras espera lo lleva al estado corregido. */
  const saltar = () => { if (elegido !== null && !corregida) { cancelar(); setCorregida(true); } };
  const bien = elegido === clave;
  const pintado = elegido === null ? null : corregida ? clave : elegido;
  const d15 = fila("d15");
  const v10 = fila("v10");
  const movDe = (u) => [cifraK(d15.mov[0]), unitarioEnLibro(u), cifraK(Math.round(d15.mov[0] * u))];
  const saldoDe = (u) => {
    const v = v10.saldo[2] + d15.mov[0] * u;
    return [cifraK(d15.saldo[0]), unitarioEnLibro(v / d15.saldo[0]), cifraK(Math.round(v))];
  };
  const estadoBoton = (x) => {
    if (elegido === null) return null;
    if (x === elegido) return bien ? "ok" : "mal";
    return x === clave && corregida ? "revelada" : null;
  };
  const listo = elegido !== null && corregida;
  const conError = elegido !== null && !bien;
  const correcto = { q: d15.saldo[0], v: Math.round(d15.saldo[2]) };
  const habria = { q: d15.saldo[0], v: habriaSido(elegido ?? clave) };
  return (
    <>
      <Kardex onTocar={saltar}>
        <FilaK id="inicial" modo="plegada" />
        <FilaK id="c2" modo="plegada" />
        <FilaK id="d8" modo="plegada" />
        {/* v1.3, decisión 5: la excepción a E8, por escrito. El saldo del 10 sigue a la vista. */}
        <FilaK id="v10" modo="saldo" />
        <FilaK
          id="d15"
          modo="abierta"
          destapa={pintado !== null}
          mov={pintado === null ? null : movDe(pintado)}
          saldo={pintado === null ? null : saldoDe(pintado)}
          tapar={{ mov: pintado === null ? [false, true, true] : NADA, saldo: pintado === null ? TODO : NADA }}
          slot={(
            <div data-rejilla style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", margin: "4px 0 8px" }}>
              {botones.map((x) => (
                <Eleccion key={x} dato={String(x)} texto={unitarioEnLibro(x)} cifraArriba alto={56} estado={estadoBoton(x)} bloqueado={elegido !== null} onClick={() => elegir(x)} />
              ))}
            </div>
          )}
        />
      </Kardex>
      <div style={{ marginTop: "16px" }}>
        <Barra
          clave={elegido === null ? "p3" : `p3-${elegido}`}
          pasos={elegido === null ? [estadoDe("v10")] : conError ? [habria, correcto] : [correcto]}
          contorno={conError ? habria.v : null}
          linea={conError ? lineaHabriaSido(elegido) : null}
        />
      </div>
      {listo && <AsientoDelCosto p={p} r={r} onRevisar={(renglones) => onCalificar(evaluarP3({ unitario: elegido, renglones }), { unitario: elegido, renglones })} />}
    </>
  );
}

/* ═══════════ PANTALLA 4 · LLEGA EL LOTE BARATO Y SALE LA DEL 28 ═══════════ */

function Pantalla4({ r, onCalificar }) {
  const [promedio, setPromedio] = useState(null);
  const [costo, setCosto] = useState(null);
  const [aviso, setAviso] = useState(false);
  const revisar = () => {
    if (faltaLaComa(promedio)) { setAviso(true); return; }
    onCalificar(evaluarP4({ promedio, costo }), { promedio, costo });
  };
  const tapado = !r;
  return (
    <>
      <Kardex>
        <FilaK id="inicial" modo="plegada" />
        <FilaK id="c2" modo="plegada" />
        <FilaK id="d8" modo="plegada" />
        <FilaK id="v10" modo="plegada" />
        <FilaK id="d15" modo="saldo" />
        <FilaK
          id="c25"
          modo="abierta"
          destapa={!tapado}
          tapar={{ saldo: tapado ? [false, true, false] : NADA }}
          slotTras="movimiento"
          slot={(
            <div style={MEDIA}>
              <div>
                <Campo dato="promedio" etiqueta={RP.nuevoPromedio} tipo="unitario" valor={promedio} bloqueado={Boolean(r)} estado={r ? r.estados.promedio : null} aviso={aviso}
                  onValor={(x) => { setPromedio(x); setAviso(false); }} />
                {aviso && <AvisoComa />}
              </div>
            </div>
          )}
        />
        <FilaK
          id="v28"
          modo="abierta"
          destapa={!tapado}
          tapar={{ mov: tapado ? [false, true, true] : NADA, saldo: tapado ? [false, true, true] : NADA }}
          slot={(
            <div style={MEDIA}>
              <Campo dato="costo" etiqueta={RP.costoDeLas} tipo="total" valor={costo} bloqueado={Boolean(r)} estado={r ? r.estados.costo : null} onValor={setCosto} />
            </div>
          )}
        />
      </Kardex>
      <div style={{ marginTop: "16px" }}>
        <Barra clave={r ? "p4-revisada" : "p4"} pasos={r ? [estadoDe("v28")] : [estadoDe("c25")]} />
      </div>
      {!r && <BotonRevisar activo={Boolean(promedio && costo)} onClick={revisar} />}
    </>
  );
}

/* ═══════════ PANTALLA 5 · ¿POR QUÉ NO DA LO MISMO? ═══════════ */

/* v1.3, decisión 4: dos renglones, sin barras (con barras, el 0,3 % medía menos de 1 px). */
function CostoDelMes() {
  return (
    <div data-costo-del-mes style={{ ...HUNDIDO, borderRadius: "12px", padding: "10px 12px" }}>
      <p style={{ ...MARCA, margin: "0 0 4px" }}>{RP.vendidoEnElMes}</p>
      {[[RP.periodico, VENDIDO_PERIODICO], [RP.permanente, VENDIDO_PERMANENTE]].map(([m, v]) => (
        <div key={m} style={{ minHeight: "28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={MARCA}>{m}</span>
          <span style={{ ...NUMERO, fontSize: "15px", fontWeight: 600 }}>{cifra(v)}</span>
        </div>
      ))}
    </div>
  );
}

function FilaDelDiez({ abierta, onTocar }) {
  const f = fila("v10");
  return (
    <div>
      <button
        type="button"
        data-fila-del-diez
        aria-expanded={abierta ? "true" : "false"}
        onClick={onTocar}
        style={{
          width: "100%", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", margin: "4px 0",
          padding: "0 8px", borderRadius: "8px", border: REPOSO, background: "transparent", cursor: "pointer", color: C.texto,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ ...MARCA, whiteSpace: "nowrap" }}>{fechaDe(f)}</span>
          <span style={{ fontFamily: INTER, fontSize: "13px" }}>{DETALLES.v10}</span>
        </span>
        <span style={{ fontFamily: INTER, fontSize: "13px", fontWeight: 600 }}>{RP.verSuCosto}</span>
      </button>
      {abierta && (
        <div data-franja-del-diez className="r55-franja" style={{ minHeight: "56px", padding: "2px 8px 6px" }}>
          {[[RP.periodico, FRANJA_DEL_10.periodico], [RP.permanente, FRANJA_DEL_10.permanente]].map(([m, v]) => (
            <div key={m} style={{ minHeight: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={MARCA}>{m}</span>
              <span style={NUMERO}>{unitarioEnLibro(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* La fila del 10 es la única que se toca: abre su franja y, debajo del kárdex, las cuatro opciones. */
function Pantalla5({ r, onCalificar }) {
  const p = pantalla("p5");
  const [abierta, setAbierta] = useState(false);
  const estado = (o) => {
    if (!r) return null;
    if (o.id === r.elegida) return r.ok ? "correcta" : "incorrecta";
    return o.correcta ? "revelada" : null;
  };
  return (
    <>
      <CostoDelMes />
      <div style={{ marginTop: "16px" }}>
        <Kardex>
          <FilaK id="inicial" modo="plegada" />
          <FilaK id="c2" modo="plegada" />
          <FilaK id="d8" modo="plegada" />
          <FilaDelDiez abierta={abierta} onTocar={() => setAbierta(true)} />
          <FilaK id="d15" modo="plegada" />
          <FilaK id="c25" modo="plegada" />
          <FilaK id="v28" modo="abierta" />
        </Kardex>
      </div>
      {abierta && (
        <div data-opciones className="r55-despliega" style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {p.opciones.map((o) => (
            <div key={o.id} data-opcion={o.id}>
              <OpcionR5 estado={estado(o)} deshabilitada={Boolean(r)} onClick={() => onCalificar(evaluarP5(o.id), { elegida: o.id })}>
                {o.texto}
              </OpcionR5>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const MECANICAS = { p1: Pantalla1, p2: Pantalla2, p3: Pantalla3, p4: Pantalla4, p5: Pantalla5 };

/* ═══════════ LA ENTRADA (v1.3, decisión 1) ═══════════ */

function Entrada({ onEmpezar }) {
  return (
    <div data-r5-5 data-r5 data-paso="entrada">
      <p data-objetivo style={{ margin: "0 0 16px", fontFamily: INTER, fontSize: "14px", lineHeight: 1.5, color: C.atenuado }}>{R5_5.objetivo}</p>
      <p style={{ ...CEJILLA, margin: 0 }}>{ENTRADA_PERMANENTE.marca}</p>
      <h3 style={{ margin: "8px 0 0", fontFamily: SORA, fontSize: "24px", lineHeight: "32px", fontWeight: 600, color: C.texto }}>{ENTRADA_PERMANENTE.titulo}</h3>
      <p data-apertura style={{ margin: "8px 0 0", fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: C.texto }}>{ENTRADA_PERMANENTE.apertura}</p>
      <p data-instruccion style={{ margin: "8px 0 0", fontFamily: INTER, fontSize: "14px", lineHeight: "20px", color: C.atenuado }}>{ENTRADA_PERMANENTE.instruccion}</p>
      <div style={{ marginTop: "16px" }}><TarjetasDeDatos /></div>
      {/* §4.3: el botón principal es el Responder común, nunca ámbar. */}
      <div style={{ marginTop: "10px" }}><Responder onClick={onEmpezar} datos={{ "data-empezar": true }}>{ENTRADA_PERMANENTE.empezar}</Responder></div>
    </div>
  );
}

/* ═══════════ EL CIERRE: EL MES ENTERO EN UNA FIGURA ═══════════ */

function KardexCerrado() {
  return (
    <div data-kardex-cerrado>
      <Kardex>
        {KARDEX.map((f) => <FilaK key={f.id} id={f.id} modo={f.id === "v28" ? "abierta" : "plegada"} />)}
      </Kardex>
    </div>
  );
}

/* ═══════════ LA ACTIVIDAD ═══════════ */

/*
 * `pasoInicial`: −1 abre en la entrada; las pruebas abren una pantalla directo.
 * `ordenP3`: el orden de los botones de la pantalla 3 (las pruebas lo fijan).
 */
export function Permanente({ onCompletar, pasoInicial = -1, ordenP3 = null }) {
  return (
    <ConActividad actividad={ACTIVIDAD_PERMANENTE}>
      <Partida onCompletar={onCompletar} pasoInicial={pasoInicial} ordenP3={ordenP3} />
    </ConActividad>
  );
}

function Partida({ onCompletar, pasoInicial, ordenP3 }) {
  const [paso, setPaso] = useState(pasoInicial);
  const [r, setR] = useState(null);
  const [pistaAbierta, setPistaAbierta] = useState(false);
  const [resultados, setResultados] = useState({});
  const [terminado, setTerminado] = useState(false);
  const [intento, setIntento] = useState(0);
  const detalle = useRef([]);
  const inicio = useRef(Date.now());
  const boton = useRef(null);
  const raiz = useRef(null);
  const bien = Object.values(resultados).filter(Boolean).length;

  useEffect(() => {
    if (terminado) onCompletar?.(puntuarR5_5(bien, TOTAL_R5_5), Date.now() - inicio.current, detalle.current);
  }, [terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  /* El foco baja a «Siguiente» sin mover la página (E2). */
  useEffect(() => { if (r) boton.current?.focus({ preventScroll: true }); }, [r]);
  /*
   * Cada pantalla empieza con su borde de arriba al pie de la barra del sitio:
   * las posiciones del diseño (v1.1) se miden desde ahí, en la ventana útil.
   */
  useEffect(() => {
    if (paso < 0 || !raiz.current?.getBoundingClientRect) return;
    try { globalThis.scrollTo?.(0, Math.max(0, globalThis.scrollY + raiz.current.getBoundingClientRect().top - BARRA_DEL_SITIO)); } catch { /* sin ventana */ }
  }, [paso]);

  const p = PANTALLAS[paso];
  const calificar = (veredicto, respuesta) => {
    if (r) return;
    detalle.current.push({ item: p.id, ok: veredicto.ok, intentos: 1, respuesta: veredicto.ok ? null : respuestaDe(p.id, respuesta), orden: detalle.current.length + 1, pista: pistaAbierta });
    setResultados((x) => ({ ...x, [p.id]: veredicto.ok }));
    setR(veredicto);
  };
  const siguiente = (e) => {
    terminarAnimaciones(e?.currentTarget?.closest?.("[data-r5-5]"));
    setR(null);
    setPistaAbierta(false);
    if (paso + 1 < TOTAL_R5_5) setPaso(paso + 1);
    else {
      setTerminado(true);
      try { globalThis.scrollTo?.(0, 0); } catch { /* sin ventana */ }
    }
  };
  const reiniciar = () => {
    setPaso(-1); setR(null); setPistaAbierta(false); setResultados({}); setTerminado(false); setIntento((n) => n + 1);
    detalle.current = []; inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <div data-r5-5 data-r5 data-cierre>
        <style>{CSS_JUEGO + CSS_PERMANENTE}</style>
        <KardexCerrado />
        <Cierre pct={Math.round(puntuarR5_5(bien, TOTAL_R5_5))} onReiniciar={reiniciar} />
      </div>
    );
  }
  if (paso < 0) {
    return (
      <>
        <style>{CSS_JUEGO + CSS_PERMANENTE}</style>
        <Entrada onEmpezar={() => setPaso(0)} />
      </>
    );
  }
  const Mecanica = MECANICAS[p.id];
  return (
    <div ref={raiz} data-r5-5 data-r5 data-paso={p.id} style={{ paddingTop: "12px" }}>
      <style>{CSS_JUEGO + CSS_PERMANENTE}</style>
      <Cabecera actual={paso} total={TOTAL_R5_5} escena="bodega" progreso={RP.progreso} />
      <p data-enunciado style={{ margin: "8px 0 0", fontFamily: INTER, fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: C.texto }}>{p.enunciado}</p>
      <div data-interaccion style={{ marginTop: "16px" }}>
        <Mecanica key={`${p.id}-${intento}`} r={r} onCalificar={calificar} orden={ordenP3} />
      </div>
      {!r && <Pista key={p.id} texto={p.pista} abierta={pistaAbierta} onAbrir={() => setPistaAbierta(true)} />}
      <Devolucion r={r && { ok: r.ok, textos: r.textos }} />
      {r && <BotonSiguiente onClick={siguiente} botonRef={boton} sustantivo={RP.sustantivo} ultimo={paso + 1 === TOTAL_R5_5} />}
    </div>
  );
}

