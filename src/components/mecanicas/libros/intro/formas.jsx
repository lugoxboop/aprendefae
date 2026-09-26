import { FAE } from "../../../../theme.js";
import { pesos } from "../../../../data/contabilidad.js";
import { NEUTRO, NAVY_DEL_CHIP, CUENTA_RESALTADA, SIN_DATO } from "../../../../data/contabilidadIntro.js";
import { SECCIONES } from "../../../../contabilidad/armaElBalance.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS CINCO FORMAS DEL MISMO HECHO.
 *
 * No son cinco cosas: son una, mirada en cinco momentos. Por eso la ficha no
 * se desliza de una estación a la siguiente — se desvanece y REAPARECE con
 * otra forma. Una cinta transportadora lleva la misma caja de un sitio a
 * otro; aquí lo que importa es que la caja deja de ser una caja.
 *
 * NINGUNA usa el vocabulario del Tema 2: no hay ▲, ni marcador de saldo, ni
 * arcos, ni balanza, ni teal o ámbar significando debe y haber. El estudiante
 * que ve esto todavía no sabe qué es un débito, y el renglón de la estación 3
 * se lo enseña sin nombrarlo: dos cuentas y dos cifras, sin columnas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const CIFRA = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontVariantNumeric: "tabular-nums",
};
const CAJA = {
  padding: "9px 10px", borderRadius: "10px",
  background: "rgba(10,20,34,0.5)", border: "1px solid rgba(248,249,250,0.14)",
};

/* 1 · El hecho: lo que pasó en el mundo, antes de que hubiera un libro. */
export function FormaHecho({ texto }) {
  return (
    <div data-forma="hecho" style={{ ...CAJA }}>
      <p style={{ margin: 0, fontSize: "12.5px", lineHeight: 1.5, color: FAE.text }}>{texto}</p>
    </div>
  );
}

/*
 * 2 · La factura. Tres campos vienen del capítulo y tres no, y los que no
 * llevan un GUION: un guion dice «esto no lo da la fuente», mientras que un
 * hueco en blanco parece que la pieza se quedó a medias y un dato inventado
 * sería peor que las dos cosas.
 */
export function FormaFactura({ campos }) {
  return (
    <div data-forma="factura" style={{ ...CAJA }}>
      <p style={{
        margin: "0 0 7px", fontFamily: SORA, fontSize: "9px", fontWeight: 700,
        letterSpacing: "0.14em", color: "rgba(248,249,250,0.5)", textAlign: "center",
        borderBottom: "1px solid rgba(248,249,250,0.14)", paddingBottom: "5px",
      }}>
        FACTURA DE COMPRA
      </p>
      <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "3px" }}>
        {campos.map((c) => (
          <div key={c.campo} data-campo={c.campo} data-del-libro={c.delLibro ? "si" : "no"}
            style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
            <dt style={{ flex: "0 0 44%", fontSize: "10.5px", color: "rgba(248,249,250,0.55)" }}>{c.campo}</dt>
            <dd style={{
              margin: 0, flex: 1, minWidth: 0, ...CIFRA, fontSize: "11.5px",
              color: c.valor === SIN_DATO ? "rgba(248,249,250,0.4)" : FAE.text,
            }}>
              {typeof c.valor === "number" ? pesos(c.valor) : c.valor}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/*
 * 3 · El renglón de libro. SIN columnas de debe y haber, sin sangría y sin
 * decir cuál se debita: esta pieza no enseña eso todavía, solo muestra que el
 * paso existe. Ponerle columnas sería enseñar el Tema 2 de contrabando.
 */
export function FormaRenglon({ renglon }) {
  return (
    <div data-forma="renglon" style={{ ...CAJA }}>
      <p style={{
        margin: "0 0 7px", fontFamily: SORA, fontSize: "9px", fontWeight: 700,
        letterSpacing: "0.14em", color: "rgba(248,249,250,0.5)", textAlign: "center",
        borderBottom: "1px solid rgba(248,249,250,0.14)", paddingBottom: "5px",
      }}>
        LIBRO
      </p>
      {renglon.map((r) => (
        <div key={r.cuenta} data-renglon={r.cuenta}
          style={{ display: "flex", gap: "8px", alignItems: "baseline", padding: "2px 0" }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: "12px", color: FAE.text }}>{r.cuenta}</span>
          <span style={{ ...CIFRA, fontSize: "12px", color: "rgba(248,249,250,0.8)" }}>{pesos(r.valor)}</span>
        </div>
      ))}
    </div>
  );
}

/*
 * 4 · La línea dentro del estado financiero. El balance entero, con UNA línea
 * resaltada y las demás legibles pero en segundo plano: el punto es que el
 * computador ya no está solo.
 *
 * Y no se «arregla» nada de lo que se ve raro: Cuentas por pagar dice 15.000
 * aunque la deuda naciera en 25.000, porque una transacción posterior canceló
 * 10.000. Sale del mayor, así que no hay forma de retocarlo aquí.
 */
export function FormaEstado({ balance }) {
  const de = (seccion) => balance.cuentas.filter((c) => c.seccion === seccion);
  const activos = de(SECCIONES[0].id);
  const derecha = [...de(SECCIONES[1].id), ...de(SECCIONES[2].id)];
  const filas = Math.max(activos.length, derecha.length);

  const celda = (c) => {
    if (!c) return <span style={{ display: "block", minHeight: "16px" }} />;
    const marcada = c.cuenta === CUENTA_RESALTADA;
    return (
      <span
        data-linea={c.cuenta}
        data-marcada={marcada ? "si" : "no"}
        style={{
          display: "flex", gap: "5px", alignItems: "baseline", minHeight: "16px",
          padding: marcada ? "1px 4px" : "1px 0", borderRadius: "5px",
          background: marcada ? NEUTRO : "transparent",
          color: marcada ? NAVY_DEL_CHIP : "rgba(248,249,250,0.5)",
          fontWeight: marcada ? 700 : 400,
        }}
      >
        <span style={{ flex: 1, minWidth: 0, fontSize: "9.5px", lineHeight: 1.25 }}>{c.cuenta}</span>
        <span style={{ ...CIFRA, fontSize: "9.5px" }}>{pesos(c.valor)}</span>
      </span>
    );
  };

  return (
    <div data-forma="estado" style={{ ...CAJA }}>
      <p style={{
        margin: "0 0 2px", fontFamily: SORA, fontSize: "9.5px", fontWeight: 700,
        textAlign: "center", color: FAE.text,
      }}>
        {balance.empresa}
      </p>
      <p style={{
        margin: "0 0 7px", fontSize: "8.5px", textAlign: "center", color: "rgba(248,249,250,0.45)",
        borderBottom: "1px solid rgba(248,249,250,0.14)", paddingBottom: "5px",
      }}>
        Estado de situación financiera
      </p>
      <div style={{ display: "flex", gap: "9px" }}>
        {[["Activos", activos], ["Pasivos y Patrimonio", derecha]].map(([titulo, lista]) => (
          <div key={titulo} style={{ flex: "1 1 0", minWidth: 0 }}>
            <p style={{
              margin: "0 0 3px", fontFamily: SORA, fontSize: "8.5px", fontWeight: 700,
              letterSpacing: "0.06em", color: "rgba(248,249,250,0.45)",
            }}>
              {titulo}
            </p>
            {Array.from({ length: filas }, (_, k) => (
              <div key={k}>{celda(lista[k])}</div>
            ))}
            <div style={{
              display: "flex", gap: "5px", alignItems: "baseline", marginTop: "4px",
              paddingTop: "4px", borderTop: "1px solid rgba(248,249,250,0.2)",
            }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: "9px", fontWeight: 700, color: "rgba(248,249,250,0.6)" }}>Total</span>
              <span data-total={titulo === "Activos" ? "activos" : "pasivos-patrimonio"}
                style={{ ...CIFRA, fontSize: "9.5px", fontWeight: 700, color: "rgba(248,249,250,0.75)" }}>
                {pesos(titulo === "Activos" ? balance.activos : balance.pasivosMasPatrimonio)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 5 · La pregunta, sobre la mesa de quien decide. */
export function FormaPregunta({ usuario, empresa }) {
  return (
    <div data-forma="pregunta" style={{ ...CAJA }}>
      <p style={{
        margin: "0 0 5px", fontFamily: SORA, fontSize: "9px", fontWeight: 700,
        letterSpacing: "0.12em", color: "rgba(248,249,250,0.5)",
      }}>
        EN LA MESA DE {usuario.nombre.toUpperCase()} · {empresa}
      </p>
      <p data-pregunta={usuario.id} style={{
        margin: 0, fontFamily: SORA, fontSize: "12.5px", fontWeight: 700,
        lineHeight: 1.4, color: FAE.text,
      }}>
        «{usuario.pregunta}»
      </p>
    </div>
  );
}
