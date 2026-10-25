import { NotebookPen, Users, FileText } from "lucide-react";
import { FAE } from "../../../../../theme.js";
import { ID, NOMBRES, CUENTA_RESALTADA } from "../../../../../data/contabilidadIntro.js";
import { VERBOS_DEL_LIBRO, VERBO_ANOTAR, EL_HECHO_CORTO } from "../../../../../data/contabilidadT1Pantallas.js";
import { A1_SEC, deFicha, balanceDelHecho } from "../../../../../data/contabilidadT1Secuencia.js";
import { HECHO, facturaDelHecho, USUARIO_DEL_RECORRIDO } from "../../../../../contabilidad/recorridoDeUnHecho.js";
import { pesos } from "../../../../../data/contabilidad.js";
import { FormaHecho } from "../formas.jsx";
import { SIN_DATO } from "../../../../../data/contabilidadIntro.js";
import {
  MarcoFigura, Riel, Escenario, Nota, Fila, SORA, INTER, SECUNDARIO, NAVY,
  PARADA_INICIAL, paradaResuelta, responderParada, estadoEnParada, DevolucionParada, CANTO, N2, SILUETA, conFases, eraEstaDe,
} from "./figurasT1.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * cu0-a1 · EL RECORRIDO DE UN HECHO, EN SECUENCIA — 10 pantallas (Mai §3).
 *
 * Las 14 primeras pantallas de la ficha de Futaba, con las juntas de Mai
 * (F1+F2, F4-F6, F13+F14). Las pantallas 15 a 17 van a la pieza nueva «Ocho
 * leen lo mismo». El riel de las cinco estaciones va arriba en todas.
 *
 * En las pantallas 4, 5, 7 y 8 la ficha se transforma al TOCARLA, no con
 * «Siguiente» (Mai §3.2): eso las hace Míralo. Con movimiento reducido el
 * toque la deja en su forma final sin animar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const T = A1_SEC.pantallas;
const F = (n) => deFicha(ID, n);
const textoDe = (o) => o?.texto ?? null;

/* ═══════════ 1 · La predicción (no califica; R10: la vía va sin nodos) ═══════════ */
function FiguraPrediccion({ estado, setEstado }) {
  const elegida = estado?.elegida ?? null;
  const opciones = T.prediccion.opciones.map((t) => ({ id: t, texto: t }));
  return (
    <MarcoFigura riel={<Riel nodos={elegida !== null} encendidos={0} entran={elegida !== null} />}>
      <Escenario>
        {elegida === null && (
          <div style={{ display: "flex", justifyContent: "center", padding: "2px 0" }}>
            <NotebookPen aria-hidden="true" size={30} strokeWidth={1.75} color={SECUNDARIO} />
          </div>
        )}
        <Fila
          opciones={opciones}
          estadoDe={(id) => (id === elegida ? "acierto" : "reposo")}
          onElegir={(id) => setEstado({ elegida: id })}
          activa={elegida === null}
          data="data-prediccion"
        />
        {elegida !== null && <Nota data-respuesta-prediccion>{T.prediccion.respuesta}</Nota>}
      </Escenario>
    </MarcoFigura>
  );
}

/* ═══════════ 2 · Los siete verbos de la cita ═══════════ */
/* El tramo de la cita que lleva los siete verbos, tal como está en el libro (I:58). */
const TRAMO = (() => {
  const d = NOMBRES[0].delLibro;
  const i = d.indexOf("permite"); const j = d.indexOf("evaluar") + "evaluar".length;
  return `…que ${d.slice(i, j)}…`;
})();

function FiguraVerbos({ estado, setEstado }) {
  const tocados = estado?.tocados ?? [];
  const tocar = (v) => !tocados.includes(v) && setEstado({ tocados: [...tocados, v] });
  /*
   * El toque va DENTRO de la cita (Mai §3.2): cada verbo es un botón de 44 de
   * alto en su sitio del tramo. Así el renglón de la cita mide 44 y el tramo
   * entra en tres renglones a 320.
   */
  const partes = TRAMO.split(new RegExp(`(${VERBOS_DEL_LIBRO.join("|")})`));
  return (
    <MarcoFigura riel={<Riel encendidos={0} />}>
      <Escenario plano>
        <div>
        <p data-cita aria-label={`Así lo dice el libro: ${TRAMO}`} style={{ margin: 0, fontFamily: INTER, fontSize: "13px", lineHeight: "48px", color: FAE.text }}>
          {partes.map((p, k) => {
            if (!VERBOS_DEL_LIBRO.includes(p)) return <span key={k} aria-hidden="true">{p}</span>;
            const on = tocados.includes(p);
            return (
              <button key={k} type="button" className={CANTO} data-verbo={p} aria-pressed={on} onClick={() => tocar(p)} style={{
                height: "44px", padding: "0 3px", margin: "0 1px 4px", verticalAlign: "middle", borderRadius: "8px", boxSizing: "border-box",
                fontFamily: INTER, fontSize: "13px", fontWeight: on ? 700 : 600, color: on ? NAVY : FAE.text, cursor: "pointer",
                background: on ? "#B8C4D4" : N2, border: "2px solid transparent", ...(on ? { "--fae-canto": "#8C9BB0" } : {}),
              }}>
                {p}
              </button>
            );
          })}
          {/*
            La cuenta va al final del tramo, en el hueco del último renglón: con
            el canto (48 por renglón) no queda otro. Sin el «· registrar es
            anotar» de antes: no cabe a 320 y lo dice ya el apoyo (lote G).
          */}
          <span data-cuenta-verbos data-anotar={tocados.includes(VERBO_ANOTAR) ? "si" : undefined} style={{ marginLeft: "6px", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: SECUNDARIO, whiteSpace: "nowrap" }}>
            {tocados.length} de {VERBOS_DEL_LIBRO.length}
          </span>
        </p>
        </div>
      </Escenario>
    </MarcoFigura>
  );
}

/* ═══════════ 3 · Adentro y afuera ═══════════ */
function FiguraAdentroAfuera({ estado, setEstado }) {
  const vistos = estado?.vistos ?? [];
  const tocar = (z) => !vistos.includes(z) && setEstado({ vistos: [...vistos, z] });
  const zona = (z, cuantos) => {
    const on = vistos.includes(z);
    return (
      <button type="button" className={CANTO} data-zona-sec={z} aria-pressed={on} onClick={() => tocar(z)} style={{
        flex: z === "adentro" ? "0 0 44%" : 1, minHeight: "44px", borderRadius: "10px", boxSizing: "border-box",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
        fontFamily: INTER, fontSize: "13px", fontWeight: 600, color: on ? NAVY : FAE.text, cursor: "pointer",
        background: on ? "#B8C4D4" : N2, ...(on ? { "--fae-canto": "#8C9BB0" } : {}),
        border: z === "adentro" ? `2px solid ${on ? "#B8C4D4" : FAE.text}` : `2px dashed ${on ? "#B8C4D4" : "rgba(248,249,250,.5)"}`,
      }}>
        <Users aria-hidden="true" size={16} strokeWidth={2} />{T.adentroAfuera.rotulos[z]} · {cuantos}
      </button>
    );
  };
  return (
    <MarcoFigura riel={<Riel encendidos={0} />}>
      <Escenario>
        <div style={{ display: "flex", gap: "8px" }}>{zona("adentro", 3)}{zona("afuera", 5)}</div>
        {vistos.includes("adentro") && <Nota data-revela="adentro">{T.adentroAfuera.adentro}</Nota>}
        {vistos.includes("afuera") && <Nota data-revela="afuera">{T.adentroAfuera.afuera}</Nota>}
      </Escenario>
    </MarcoFigura>
  );
}

/* ═══════════ 4, 5, 7 y 8 · La ficha que se transforma al tocarla ═══════════ */
const FACTURA = facturaDelHecho();

/*
 * El balance de la estación 4: el de después de la segunda transacción (lote G
 * de Futaba, pp. 36-37), entero: cuatro renglones, el del computador
 * resaltado, y los dos totales iguales a la vista. Sin pie: no queda ninguna
 * cuenta fuera.
 */
export function BalanceCorto({ balance = balanceDelHecho() }) {
  const fila = (clave, rotulo, valor, { marcada = false, total = false } = {}) => (
    <div key={clave} data-linea={total ? undefined : rotulo} data-total={total ? clave : undefined} data-marcada={marcada ? "si" : "no"} style={{
      display: "flex", gap: "8px", fontSize: "12px", lineHeight: "18px", padding: marcada ? "0 6px" : 0, margin: marcada ? "0 -6px" : 0,
      borderRadius: "5px", background: marcada ? "#B8C4D4" : "transparent", color: marcada ? NAVY : total ? FAE.text : SECUNDARIO,
      fontWeight: marcada || total ? 700 : 400, borderTop: total ? "1px solid rgba(248,249,250,0.25)" : 0,
    }}>
      <span style={{ flex: 1, minWidth: 0 }}>{rotulo}</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{pesos(valor)}</span>
    </div>
  );
  const de = (activo) => balance.cuentas.filter((c) => (c.seccion === "activo") === activo)
    .map((c) => fila(c.cuenta, c.rotulo, c.valor, { marcada: c.cuenta === CUENTA_RESALTADA }));
  return (
    <div data-forma="estado-corto" style={{ padding: "6px 10px", borderRadius: "10px", background: "rgba(10,20,34,0.5)", border: `1px solid ${SILUETA}` }}>
      <p style={{ margin: "0 0 2px", fontFamily: SORA, fontSize: "12px", fontWeight: 700, lineHeight: "16px", color: FAE.text, textAlign: "center" }}>Estado de situación financiera</p>
      {de(true)}
      {fila("activos", T.informe.totales.activos, balance.activos, { total: true })}
      {de(false)}
      {fila("pasivosMasPatrimonio", T.informe.totales.pasivosMasPatrimonio, balance.pasivosMasPatrimonio, { total: true })}
    </div>
  );
}

/*
 * ═══════════ LAS FORMAS, A 12 PX ═══════════
 * La factura, el renglón y la pregunta publicados (formas.jsx) llevan rótulos
 * de 9 y 10,5 px y la factura mide 165 a 320: se sale de los 152 del
 * escenario. Aquí van los mismos campos y los mismos datos, con el piso de 12
 * y en filas de 18. Las publicadas no se tocan: las sigue usando la vista de
 * cuatro capas.
 */
const TARJETA = { padding: "7px 10px", borderRadius: "10px", background: "rgba(10,20,34,0.5)", border: `1px solid ${SILUETA}`, boxSizing: "border-box" };
const CEJA = { margin: "0 0 3px", fontFamily: SORA, fontSize: "12px", fontWeight: 700, lineHeight: "16px", color: SECUNDARIO, letterSpacing: "0.06em" };
const FILA = { display: "flex", gap: "8px", fontFamily: INTER, fontSize: "12px", lineHeight: "18px" };

function FacturaSec() {
  return (
    <div data-forma="factura" style={TARJETA}>
      <p style={CEJA}>Factura de compra</p>
      {FACTURA.map((c) => (
        <div key={c.campo} data-campo={c.campo} data-del-libro={c.delLibro ? "si" : "no"} style={FILA}>
          <span style={{ flex: "0 0 46%", color: SECUNDARIO }}>{c.campo}</span>
          <span style={{ flex: 1, minWidth: 0, color: c.valor === SIN_DATO ? SECUNDARIO : FAE.text, fontVariantNumeric: "tabular-nums" }}>
            {typeof c.valor === "number" ? pesos(c.valor) : c.valor}
          </span>
        </div>
      ))}
    </div>
  );
}

function RenglonSec() {
  return (
    <div data-forma="renglon" style={TARJETA}>
      <p style={CEJA}>Libro</p>
      {HECHO.renglon.map((x) => (
        <div key={x.cuenta} data-renglon={x.cuenta} style={FILA}>
          <span style={{ flex: 1, minWidth: 0, color: FAE.text }}>{x.cuenta}</span>
          <span style={{ color: "rgba(248,249,250,0.85)", fontVariantNumeric: "tabular-nums" }}>{pesos(x.valor)}</span>
        </div>
      ))}
    </div>
  );
}

function PreguntaSec() {
  const u = USUARIO_DEL_RECORRIDO;
  return (
    <div data-forma="pregunta" style={TARJETA}>
      <p style={CEJA}>En la mesa de {u.nombre.toLowerCase()}</p>
      <p data-pregunta={u.id} style={{ margin: 0, fontFamily: SORA, fontSize: "13px", fontWeight: 700, lineHeight: "18px", color: FAE.text }}>«{u.pregunta}»</p>
    </div>
  );
}

const FORMAS = {
  hecho: () => <FormaHecho texto={EL_HECHO_CORTO} />,
  factura: () => <FacturaSec />,
  renglon: () => <RenglonSec />,
  estado: () => <BalanceCorto />,
};

/*
 * `antes`: la forma que trae la ficha al llegar (null en la estación 1: el
 * hecho aparece al tocarla); `despues`: la que toma al tocarla.
 */
const figuraTransforma = (estacion, antes, despues, texto) => function FiguraTransforma({ estado, setEstado }) {
  const tocada = Boolean(estado?.tocada);
  const Forma = FORMAS[tocada ? despues : antes] ?? null;
  /* La ficha entera es lo que se toca (Mai §3.2); al tocarla desaparece y vuelve con su otra forma. */
  return (
    <MarcoFigura riel={<Riel encendidos={tocada ? estacion : estacion - 1} />}>
      <Escenario plano>
        <button type="button" className={tocada ? undefined : CANTO} data-tocar-ficha={tocada ? "hecho" : ""} aria-disabled={tocada || undefined}
          aria-label={tocada ? undefined : texto} onClick={() => !tocada && setEstado({ tocada: true })}
          style={{
            display: "block", width: "100%", minHeight: "44px", padding: 0, margin: 0, textAlign: "left", font: "inherit",
            background: tocada ? "transparent" : N2, border: 0, cursor: tocada ? "default" : "pointer", borderRadius: "10px",
          }}>
          {Forma ? <div key={tocada ? "d" : "a"} className="fae-t1s-forma"><Forma /></div> : null}
          {!tocada && (
            <span style={{
              display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40px", marginTop: Forma ? "-40px" : 0,
              position: "relative", fontFamily: INTER, fontSize: "13px", fontWeight: 600, color: FAE.text,
              ...(Forma ? { background: "linear-gradient(transparent, rgba(14,27,46,.92) 40%)", borderRadius: "0 0 10px 10px" } : { border: `2px dashed rgba(248,249,250,.5)`, borderRadius: "10px", minHeight: "76px" }),
            }}>
              {texto}
            </span>
          )}
        </button>
      </Escenario>
    </MarcoFigura>
  );
};

/* ═══════════ 6 y 9 · Las paradas ═══════════ */
const figuraParada = ({ ficha, rotulos, encendidos, duda, Arriba }) => function FiguraParada({ estado, setEstado }) {
  const opciones = ficha.opciones.map((o) => ({ id: o.id, texto: rotulos[o.id] }));
  const correcta = ficha.opciones.find((o) => o.correcta).id;
  const e = estado ?? PARADA_INICIAL;
  const resuelta = paradaResuelta(e);
  return (
    <MarcoFigura riel={<Riel encendidos={e.ok ? encendidos + 1 : encendidos} duda={e.ok ? null : duda} />}>
      <Escenario plano>
        {/* Lo que la pregunta mira, hasta el primer intento; después, su sitio es de la devolución. */}
        {!e.elegidas?.length && <Arriba />}
        <Fila
          opciones={opciones}
          estadoDe={estadoEnParada(e, correcta)}
          onElegir={(id) => setEstado(responderParada(e, id, correcta))}
          activa={!resuelta}
          data="data-parada"
          eraEsta={eraEstaDe(e, correcta)}
        />
        <DevolucionParada
          estado={e}
          pista={textoDe(ficha.pista)}
          porqueDe={(id) => textoDe(ficha.opciones.find((o) => o.id === id)?.devolucion)}
          acierto={textoDe(ficha.opciones.find((o) => o.correcta)?.devolucion)}
        />
      </Escenario>
    </MarcoFigura>
  );
};

/* La factura compacta: lo que la parada 6 mira. */
const FacturaCompacta = () => (
  <div data-forma="factura-compacta" style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: INTER, fontSize: "13px", color: FAE.text }}>
    <FileText aria-hidden="true" size={22} strokeWidth={1.75} color={SECUNDARIO} />
    Factura · Computador · {pesos(HECHO.renglon[0].valor)}
  </div>
);

/* El informe sobre la mesa vacía: lo que la parada 9 mira. */
const InformeEnLaMesa = () => (
  <div data-forma="mesa-vacia" style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: INTER, fontSize: "13px", color: FAE.text }}>
    <FileText aria-hidden="true" size={22} strokeWidth={1.75} color={SECUNDARIO} />
    Informe · sobre una mesa vacía
  </div>
);

/* ═══════════ 10 · El cierre: los jefes deciden y la vuelta se enciende ═══════════ */
function FiguraCierre({ paso }) {
  const vuelta = paso >= 1;
  return (
    <MarcoFigura riel={<Riel encendidos={5} vuelta={vuelta ? "solida" : "tenue"} />}>
      <Escenario>
        {/* Con el paso, la pregunta deja su sitio a la vuelta: el argumento de la pieza. */}
        {!vuelta && <PreguntaSec />}
        {vuelta && <Nota data-paso-vuelta>{T.cierre.pasos[1]}</Nota>}
        <p data-pie-libro style={{ margin: "auto 0 0", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: SECUNDARIO }}>{T.cierre.pie}</p>
      </Escenario>
    </MarcoFigura>
  );
}

/* ═══════════ LA PIEZA ═══════════ */
export const PIEZA_RECORRIDO = conFases({
  id: ID,
  /* La reserva de la pieza (Mai: 184 + el sitio de la devolución de las paradas, que aquí va dentro de la figura). */
  /* La reserva de Mai (§2): 184 en las cuatro piezas y en los dos anchos. */
  altoFigura: { a320: 184, a375: 184 },
  pantallas: [
    { id: "prediccion", tipo: "apertura", ...sinApoyo(T.prediccion), Figura: FiguraPrediccion },
    { id: "verbos", tipo: "apertura", ...pick(T.verbos), Figura: FiguraVerbos },
    { id: "adentro-afuera", tipo: "miralo", ...pick(T.adentroAfuera), Figura: FiguraAdentroAfuera },
    { id: "hecho", tipo: "miralo", ...pick(T.hecho), Figura: figuraTransforma(1, null, "hecho", T.hecho.toca) },
    { id: "papel", tipo: "miralo", ...pick(T.papel), Figura: figuraTransforma(2, "hecho", "factura", T.papel.toca) },
    {
      id: "parada-papel", tipo: "haz", ...sinApoyo(T.paradaPapel), resuelta: paradaResuelta,
      Figura: figuraParada({ ficha: F(9), rotulos: T.paradaPapel.rotulos, encendidos: 2, duda: 3, Arriba: FacturaCompacta }),
    },
    { id: "anota", tipo: "miralo", ...pick(T.anota), Figura: figuraTransforma(3, "factura", "renglon", T.anota.toca) },
    { id: "informe", tipo: "miralo", ...pick(T.informe), Figura: figuraTransforma(4, "renglon", "estado", T.informe.toca) },
    {
      id: "parada-quien", tipo: "haz", ...sinApoyo(T.paradaQuien), resuelta: paradaResuelta,
      Figura: figuraParada({ ficha: F(12), rotulos: T.paradaQuien.rotulos, encendidos: 4, duda: 5, Arriba: InformeEnLaMesa }),
    },
    {
      id: "cierre", tipo: "cierre", titular: T.cierre.titular, apoyo: T.cierre.pasos[0], nombreFigura: T.cierre.nombreFigura,
      pasos: 1, rotulosPaso: [T.cierre.pasos[1]], Figura: FiguraCierre,
    },
  ],
});

/* Lo que la secuencia lee de los textos de una pantalla. */
function pick(t) {
  const o = { titular: t.titular, nombreFigura: t.nombreFigura };
  if (t.apoyo) o.apoyo = t.apoyo;
  if (t.razon) o.razon = t.razon;
  return o;
}
/* Una pantalla de parada no lleva apoyo (Mai, volumen §1 · 4): repetía el titular y a 320 quedaba cortado. */
function sinApoyo(t) { return pick({ ...t, apoyo: null }); }
export { pick, sinApoyo };
