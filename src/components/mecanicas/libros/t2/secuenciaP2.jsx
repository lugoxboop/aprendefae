import { FAE } from "../../../../theme.js";
import { HAZ_INICIAL, hazResuelto, mostrarCorrecto } from "../../../secuencia/secuencia.js";
import { P2_ID, P2_OBJETIVO, P2_TEXTOS as T, P2_ALTO_FIGURA } from "../../../../data/contabilidadT2Secuencia.js";
import {
  BLANCO, LINEA, CONTORNO, SUAVE, SECUNDARIO, Raiz, Lado, Control, Fila,
  responder, leerHaz, marcaDe, useBarajado, enOrden, colaInicial, colaResuelta, fichaActual, responderCola, marcaDestino,
} from "./secuenciaComun.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · P2 «Las dos familias de cuentas» EN SECUENCIA — las figuras y la pieza.
 *
 * Forma: c-t2-3-watari-figuras.md §2 (9 pantallas), con el delta T2-7
 * (altoFigura 171 a 320 y 158 a 375; sin pastilla en «Sí, se cierra» y «No,
 * sigue abierta»). Objeto propio: los cajones que se vacían el 31 de
 * diciembre. Textos: contabilidadT2Secuencia.js. Un cajón lleno se dibuja con
 * tres fichas, sin cifra: el tema no da saldos para estas cuentas y la figura
 * no inventa números; el cajón vacío dice $0, que es la verdad del cierre.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las fichas de un cajón lleno: dibujo, no texto. */
const Lleno = ({ marca }) => (
  <span aria-hidden="true" style={{ display: "flex", gap: "4px", justifyContent: "center", padding: "4px 0" }}>
    {[0, 1, 2].map((k) => (
      <span key={k} style={{ width: "14px", height: "10px", borderRadius: "3px", border: marca === "error" ? `1px dashed ${FAE.coral}` : `1px solid ${LINEA}`, background: marca === "error" ? "transparent" : "rgba(248,249,250,0.18)" }} />
    ))}
  </span>
);

/* Lo que hay dentro de un cajón: lleno, o $0. */
const Contenido = ({ cero, marca, clase }) => (
  cero
    ? <span className={clase} data-cero style={{ display: "block", textAlign: "center", fontSize: "14px", lineHeight: "18px", fontVariantNumeric: "tabular-nums", color: FAE.text }}>$0</span>
    : <span className={clase}><Lleno marca={marca} /></span>
);

/* El nombre de un cajón, 12 px, que se parte si es largo. */
const NombreCajon = ({ children }) => (
  <span style={{ display: "block", textAlign: "center", fontSize: "12px", lineHeight: "15px", fontWeight: 700, overflowWrap: "anywhere" }}>{children}</span>
);

/* Un cajón que no se toca. `marca`: "bien" (borde blanco), "error" (coral punteado). */
function Cajon({ nombre, cero, marca, clase, children }) {
  const borde = marca === "error" ? `2px dashed ${FAE.coral}` : marca === "bien" ? `2px solid ${BLANCO}` : `1px solid ${LINEA}`;
  return (
    <div className={clase} style={{ flex: "1 1 0", minWidth: 0, border: borde, borderRadius: "8px", padding: "4px", boxSizing: "border-box", minHeight: "44px" }}>
      <NombreCajon>{nombre}</NombreCajon>
      {children ?? <Contenido cero={cero} marca={marca} />}
    </div>
  );
}

/* El calendario: 31 de diciembre o 1 de enero. */
const Calendario = ({ dia }) => (
  <p data-calendario style={{ margin: "0 0 6px", textAlign: "center", fontSize: "12px", lineHeight: "16px", color: SECUNDARIO }}>
    <span style={{ display: "inline-block", padding: "1px 8px", border: `1px solid ${CONTORNO}`, borderRadius: "999px", color: FAE.text }}>{dia}</span>
  </p>
);

const DIC = "31 de diciembre";
const ENE = "1 de enero";

/* ─────────────── 0 · Apertura: dos cajones llenos el 31 de diciembre ─────────────── */

function FiguraApertura({ primeraVez, reducido }) {
  const anima = primeraVez && !reducido;
  return (
    <Raiz>
      <Calendario dia={DIC} />
      <div style={{ display: "flex", gap: "8px" }}>
        {["Caja", "Ingresos por servicios"].map((c, k) => (
          <Cajon key={c} nombre={c} clase={anima ? "fae-t2s-llega" : undefined}>
            <span style={{ display: "block", animationDelay: anima ? `${120 * k}ms` : undefined }}><Lleno /></span>
          </Cajon>
        ))}
      </div>
    </Raiz>
  );
}

/* ─────────────── 1 · Haz sin calificar: ¿cuál sigue al día siguiente? ─────────────── */

const DIA_DESPUES = [
  { cuenta: "Caja", real: true },
  { cuenta: "Ingresos por servicios", real: false },
];

function FiguraDiaDespues({ estado, setEstado }) {
  const elegida = estado?.elegida ?? null;
  const despues = elegida !== null;
  return (
    <Raiz>
      <Calendario dia={despues ? ENE : DIC} />
      <div style={{ display: "flex", gap: "8px" }}>
        {DIA_DESPUES.map((c) => (
          <Lado key={c.cuenta} onClick={() => setEstado({ elegida: c.cuenta })} etiqueta={c.cuenta} elegido={elegida === c.cuenta}
            style={{ border: `1px solid ${elegida === c.cuenta ? BLANCO : CONTORNO}`, borderRadius: "8px" }}>
            <NombreCajon>{c.cuenta}</NombreCajon>
            <Contenido key={`${c.cuenta}-${despues}`} cero={despues && !c.real} clase={despues ? "fae-t2s-cae" : undefined} />
            {elegida === c.cuenta && <span className="fae-t2s-cae" style={{ textAlign: "center", fontSize: "12px", lineHeight: "15px", color: SUAVE }}>Tu elección</span>}
          </Lado>
        ))}
      </div>
    </Raiz>
  );
}

/* ─────────────── 2 · Míralo: las reales cruzan al año nuevo con su contenido ─────────────── */

const REALES = ["Caja", "Cuentas por pagar", "Aportes sociales"];

function FiguraReales({ estado, setEstado }) {
  const cruzadas = estado?.cruzadas ?? [];
  const cruzar = (c) => setEstado({ cruzadas: cruzadas.includes(c) ? cruzadas : [...cruzadas, c] });
  return (
    <Raiz>
      <Calendario dia={cruzadas.length === REALES.length ? ENE : DIC} />
      <div style={{ display: "flex", gap: "6px" }}>
        {REALES.map((c) => {
          const ya = cruzadas.includes(c);
          return (
            <Lado key={c} onClick={() => cruzar(c)} etiqueta={c} elegido={ya} style={{ border: `1px solid ${ya ? BLANCO : CONTORNO}`, borderRadius: "8px" }}>
              <NombreCajon>{c}</NombreCajon>
              <span key={String(ya)} className={ya ? "fae-t2s-cruza" : undefined}><Lleno /></span>
              <span style={{ textAlign: "center", fontSize: "12px", lineHeight: "15px", color: ya ? FAE.text : "transparent" }}>{ya ? ENE : "·"}</span>
            </Lado>
          );
        })}
      </div>
    </Raiz>
  );
}

/* ─────────────── 3 · Míralo: la nominal se vacía y queda en $0 ─────────────── */

function FiguraNominales({ estado, setEstado }) {
  const vaciada = Boolean(estado?.vaciada);
  return (
    <Raiz>
      <Calendario dia={vaciada ? ENE : DIC} />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Lado onClick={() => setEstado({ vaciada: true })} etiqueta="Ingresos por servicios" elegido={vaciada}
          style={{ flex: "0 1 200px", border: `1px solid ${vaciada ? BLANCO : CONTORNO}`, borderRadius: "8px" }}>
          <NombreCajon>Ingresos por servicios</NombreCajon>
          <Contenido key={String(vaciada)} cero={vaciada} clase="fae-t2s-cae" />
        </Lado>
      </div>
    </Raiz>
  );
}

/* ─────────────── 4 · Haz calificado: ¿gasto o costo? ─────────────── */

const FICHA_MERCANCIA = "Lo que te costó esa mercancía";

function Ficha({ texto, marca, clase }) {
  const borde = marca === "error" ? `2px dashed ${FAE.coral}` : marca === "bien" ? `2px solid ${BLANCO}` : `1px solid ${LINEA}`;
  return (
    <span className={clase} data-ficha={marca || undefined} style={{
      display: "block", margin: "2px 0 0", padding: "1px 6px", borderRadius: "6px", border: borde, textAlign: "center",
      fontSize: "12px", lineHeight: "15px", color: marca === "error" ? FAE.coral : FAE.text, overflowWrap: "anywhere",
    }}>{texto}</span>
  );
}

function FiguraGastoOCosto({ estado, setEstado }) {
  const { e, resuelto, verdad, error } = leerHaz(estado);
  const cajones = enOrden([{ nombre: "Gastos", opcion: T.gastoOCosto.opciones[0] }, { nombre: "Costos", opcion: T.gastoOCosto.opciones[1] }], useBarajado(estado, setEstado, 2));
  const buena = T.gastoOCosto.opciones[1];
  return (
    <Raiz>
      {!verdad && !error && <Ficha texto={FICHA_MERCANCIA} />}
      {(verdad || error) && <span style={{ display: "block", height: "19px" }} />}
      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
        {cajones.map((c) => (
          <Lado key={c.nombre} onClick={() => { if (!resuelto) responder(setEstado, c.opcion === buena, c.opcion); }} etiqueta={c.opcion}
            elegido={e.eleccion === c.opcion} marca={marcaDe(e, c.opcion, buena)} style={{ border: `1px solid ${CONTORNO}`, borderRadius: "8px", minHeight: "64px" }}>
            <NombreCajon>{c.nombre}</NombreCajon>
            {verdad && c.opcion === buena && <Ficha clase="fae-t2s-cae" texto={FICHA_MERCANCIA} marca="bien" />}
            {error && c.opcion !== buena && <Ficha clase="fae-t2s-cae" texto={FICHA_MERCANCIA} marca="error" />}
          </Lado>
        ))}
      </div>
    </Raiz>
  );
}

/* ─────────────── 5 · Míralo: tres nominales, una tarjeta abierta a la vez ─────────────── */

function FiguraTresNominales({ estado, setEstado }) {
  const abierta = estado?.abierta ?? null;
  const t = T.tresNominales.tarjetas.find((x) => x.nombre === abierta);
  return (
    <Raiz>
      <Fila style={{ marginTop: 0, gap: "6px" }}>
        {T.tresNominales.tarjetas.map((x) => (
          <Control key={x.nombre} chico onClick={() => setEstado({ abierta: x.nombre })} elegido={abierta === x.nombre}>{x.nombre}</Control>
        ))}
      </Fila>
      {t && (
        <div key={t.nombre} className="fae-t2s-cae" data-tarjeta={t.nombre} style={{ marginTop: "8px", padding: "6px 8px", border: `1px solid ${LINEA}`, borderRadius: "8px" }}>
          <p style={{ margin: 0, fontSize: "12px", lineHeight: "16px", color: FAE.text }}>{t.nombre}: «{t.definicion}»</p>
          {t.ejemplo && <p style={{ margin: "4px 0 0", fontSize: "12px", lineHeight: "16px", color: SUAVE }}>Ejemplo: {t.ejemplo}</p>}
        </div>
      )}
    </Raiz>
  );
}

/* ─────────────── 6 · Haz calificado: ¿se cierra igual? ─────────────── */

function FiguraSeCierra({ estado, setEstado }) {
  const { e, resuelto, verdad, error } = leerHaz(estado);
  const [si, no] = T.seCierra.opciones;
  const orden = useBarajado(estado, setEstado, 2);
  return (
    <Raiz>
      <div style={{ display: "flex", gap: "8px" }}>
        <Cajon nombre={`Gastos de operación · ${DIC}`} />
        {verdad && <Cajon clase="fae-t2s-cae" nombre={`Gastos de operación · ${ENE}`} cero marca="bien" />}
        {error && <Cajon clase="fae-t2s-cae" nombre={`Gastos de operación · ${ENE}`} marca="error" />}
        {!verdad && !error && <div style={{ flex: "1 1 0" }} />}
      </div>
      <Fila>
        {enOrden([si, no], orden).map((op) => (
          <Control key={op} chico onClick={() => { if (!resuelto) responder(setEstado, op === si, op); }} elegido={e.eleccion === op} marca={marcaDe(e, op, si)}>{op}</Control>
        ))}
      </Fila>
    </Raiz>
  );
}

/* ─────────────── 7 · Haz de seis fichas: una sola pregunta ─────────────── */

const CUENTAS_7 = T.unaPregunta.cuentas;
const [SIGUE, CERO] = T.unaPregunta.cajones;
const cajonBueno = (k) => (CUENTAS_7[k].real ? SIGUE : CERO);

function FiguraUnaPregunta({ estado, setEstado }) {
  /* Las seis cuentas salen barajadas (Mello T2-9): ordenadas, después de la tercera el orden daba la respuesta. */
  const orden = useBarajado(estado, setEstado, CUENTAS_7.length, colaInicial(CUENTAS_7.length));
  const e = { ...(estado ?? colaInicial(CUENTAS_7.length)), orden };
  const k = fichaActual(e);
  const dentro = (cajon) => CUENTAS_7.map((c, i) => {
    const r = e.cola[i];
    if (hazResuelto(r) && cajonBueno(i) === cajon) return <Ficha key={c.cuenta} clase="fae-t2s-cae" texto={c.cuenta} marca={mostrarCorrecto(r) ? "bien" : undefined} />;
    if (!hazResuelto(r) && r.ultimo === "error" && e.destinos[i] === cajon) return <Ficha key={c.cuenta} clase="fae-t2s-cae" texto={c.cuenta} marca="error" />;
    return null;
  });
  return (
    <Raiz>
      <div style={{ minHeight: "21px", textAlign: "center" }}>
        {k >= 0 && <span key={k} className="fae-t2s-llega" data-ficha-actual style={{ display: "inline-block" }}><Ficha texto={CUENTAS_7[k].cuenta} /></span>}
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
        {[SIGUE, CERO].map((cajon) => (
          <Lado key={cajon} onClick={() => { if (k >= 0) responderCola(setEstado, (i, d) => cajonBueno(i) === d, cajon); }} etiqueta={cajon}
            disabled={k < 0} marca={marcaDestino(e, cajon, cajonBueno)} style={{ border: `1px solid ${CONTORNO}`, borderRadius: "8px", minHeight: "64px", justifyContent: "flex-start" }}>
            <NombreCajon>{cajon}</NombreCajon>
            {dentro(cajon)}
          </Lado>
        ))}
      </div>
    </Raiz>
  );
}

/* ─────────────── 8 · Cierre: la frase pegada a dos cajones ─────────────── */

function FiguraCierre() {
  return (
    <Raiz>
      <Calendario dia={ENE} />
      <div style={{ display: "flex", gap: "8px" }}>
        <Cajon nombre="Salarios por pagar" />
        <Cajon nombre="Gasto en salarios" cero />
      </div>
      <p data-frase-cierre style={{ margin: "8px 0 0", fontSize: "14px", lineHeight: "20px", color: FAE.text }}>{T.cierre.frase}</p>
    </Raiz>
  );
}

/* ─────────────── la pieza ─────────────── */

const devolucionDe = (t) => () => ({ pista: t.pista, porque: t.porque, consecuencia: t.consecuencia ?? null });

/* P2·7: la devolución es de la cuenta en juego (Near T2-7 §6), con su nombre en la plantilla. */
function devolucionUnaPregunta(estado) {
  const c = CUENTAS_7[estado?.item ?? 0];
  const plantilla = c.real ? T.unaPregunta.porqueReal : T.unaPregunta.porqueNominal;
  return {
    pista: T.unaPregunta.pista,
    porque: plantilla.replace("{Cuenta}", c.cuenta),
    consecuencia: c.cuenta === "Bancos" ? T.unaPregunta.consecuenciaBancos : null,
  };
}

export const PIEZA_P2 = {
  id: P2_ID,
  objetivo: P2_OBJETIVO,
  altoFigura: P2_ALTO_FIGURA,
  pantallas: [
    { id: "objetivo", tipo: "apertura", titular: T.apertura.titular, apoyo: T.apertura.apoyo, Figura: FiguraApertura, nombreFigura: "Dos cajones llenos el 31 de diciembre" },
    {
      id: "el-dia-despues", tipo: "haz", titular: T.diaDespues.titular, apoyo: T.diaDespues.apoyo, razon: T.diaDespues.razon,
      Figura: FiguraDiaDespues, nombreFigura: "Los cajones de Caja y de Ingresos por servicios", estadoInicial: { elegida: null },
      prediccion: true, resuelta: (e) => Boolean(e?.elegida),
    },
    { id: "las-reales", tipo: "miralo", titular: T.reales.titular, apoyo: T.reales.apoyo, Figura: FiguraReales, nombreFigura: "Tres cajones de cuentas reales", estadoInicial: { cruzadas: [] } },
    { id: "las-nominales", tipo: "miralo", titular: T.nominales.titular, apoyo: T.nominales.apoyo, Figura: FiguraNominales, nombreFigura: "El cajón de Ingresos por servicios", estadoInicial: { vaciada: false } },
    {
      id: "gasto-o-costo", tipo: "haz", titular: T.gastoOCosto.titular, apoyo: T.gastoOCosto.apoyo, razon: T.gastoOCosto.razon,
      Figura: FiguraGastoOCosto, nombreFigura: "Los cajones de Gastos y de Costos", estadoInicial: HAZ_INICIAL, resuelta: hazResuelto,
      devolucion: devolucionDe(T.gastoOCosto), opciones: T.gastoOCosto.opciones, buena: T.gastoOCosto.opciones[1],
    },
    { id: "tres-nominales", tipo: "miralo", titular: T.tresNominales.titular, apoyo: T.tresNominales.apoyo, textual: true, Figura: FiguraTresNominales, nombreFigura: "Tres tarjetas de cuentas nominales", estadoInicial: { abierta: null } },
    {
      id: "se-cierra-igual", tipo: "haz", titular: T.seCierra.titular, apoyo: T.seCierra.apoyo, razon: T.seCierra.razon,
      Figura: FiguraSeCierra, nombreFigura: "El cajón de Gastos de operación", estadoInicial: HAZ_INICIAL, resuelta: hazResuelto,
      devolucion: devolucionDe(T.seCierra), opciones: T.seCierra.opciones, buena: T.seCierra.opciones[0],
    },
    {
      id: "una-sola-pregunta", tipo: "haz", titular: T.unaPregunta.titular, apoyo: T.unaPregunta.apoyo, razon: T.unaPregunta.razon,
      Figura: FiguraUnaPregunta, nombreFigura: "Los cajones Sigue y Vuelve a cero", estadoInicial: colaInicial(CUENTAS_7.length), resuelta: colaResuelta,
      devolucion: devolucionUnaPregunta, fichas: CUENTAS_7.map((c) => c.cuenta), destinos: [SIGUE, CERO], buenoDe: cajonBueno, malaDe: (i) => (cajonBueno(i) === SIGUE ? CERO : SIGUE),
    },
    { id: "cierre", tipo: "cierre", titular: T.cierre.titular, apoyo: T.cierre.apoyo, Figura: FiguraCierre, nombreFigura: "Salarios por pagar y el gasto en salarios el 1 de enero", ...(T.cierre.pie ? { razon: T.cierre.pie } : {}) },
  ],
};
