import { FAE } from "../../../../theme.js";
import { pesos } from "../../../../data/contabilidad.js";
import { CUENTA_RESALTADA, SIN_DATO } from "../../../../data/contabilidadIntro.js";
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
        letterSpacing: "0.14em", color: "#A8B6C8", textAlign: "center",
        borderBottom: "1px solid rgba(248,249,250,0.14)", paddingBottom: "5px",
      }}>
        FACTURA DE COMPRA
      </p>
      <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "3px" }}>
        {campos.map((c) => (
          <div key={c.campo} data-campo={c.campo} data-del-libro={c.delLibro ? "si" : "no"}
            style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
            <dt style={{ flex: "0 0 44%", fontSize: "10.5px", color: "#A8B6C8" }}>{c.campo}</dt>
            <dd style={{
              margin: 0, flex: 1, minWidth: 0, ...CIFRA, fontSize: "11.5px",
              color: c.valor === SIN_DATO ? "#A8B6C8" : FAE.text,
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
        letterSpacing: "0.14em", color: "#A8B6C8", textAlign: "center",
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
  /*
   * ═══════════ REHECHA A UNA COLUMNA (Xeno, 16 oct.) ═══════════
   *
   * Hasta hoy eran dos columnas de 96,5 px dentro de una tarjeta de 224, con
   * la letra a 8, 8,5, 9 y 9,5 px. Al subirla al piso de 12 las dos columnas
   * dejaban de existir: «Equipo de computación» mide 134 px a 12 px y
   * «Obligaciones financieras» otro tanto —medido en la página, no estimado—.
   *
   * Así que no es un cambio de tamaño, es otra figura: UNA columna sobre los
   * 202 px útiles (96,5 × 2 + 9 del hueco que había entre ellas). Con eso la
   * fila más larga mide 189 px —«Obligaciones financieras» 135 + 8 + cifra
   * 46— y cabe con 13 de sobra. Si un nombre no cabe en otra pantalla, rompe
   * a dos renglones; nunca se corta.
   *
   * Lo que se descartó, y por qué: la cifra debajo del nombre deja los dos
   * bloques igual de altos y se lee peor; acortar los nombres no se puede
   * porque son las cuentas del mayor y «Equipo de computación» es justo la
   * línea que señala el texto de la estación 4.
   *
   * Los colores por opacidad (.38, .45, .5) no llegaban a 4,5:1 de contraste.
   * Pasan a sólidos: #A8B6C8 (6,79:1 sobre la tarjeta) y #B8C4D4 (7,92:1).
   * La fila resaltada se distingue por RELLENO y negrita, no solo por color.
   */
  const de = (seccion) => balance.cuentas.filter((c) => c.seccion === seccion);
  const bloques = [
    ["Activos", de(SECCIONES[0].id), balance.activos],
    ["Pasivos y Patrimonio", [...de(SECCIONES[1].id), ...de(SECCIONES[2].id)], balance.pasivosMasPatrimonio],
  ];

  const fila = (c, ultima) => {
    const marcada = c.cuenta === CUENTA_RESALTADA;
    return (
      <span
        key={c.cuenta}
        data-linea={c.cuenta}
        data-marcada={marcada ? "si" : "no"}
        style={{
          display: "flex", gap: "8px", alignItems: "baseline", minHeight: "20px",
          /* El filete va ENTRE renglones: ninguno antes del Total, que ya trae el suyo. */
          borderBottom: ultima ? "none" : "1px solid rgba(248,249,250,0.08)",
          /* El margen negativo compensa el relleno de la píldora: el texto no se corre. */
          padding: marcada ? "2px 6px" : "2px 0",
          margin: marcada ? "0 -6px" : 0,
          borderRadius: marcada ? "5px" : 0,
          background: marcada ? "#B8C4D4" : "transparent",
          color: marcada ? "#1D3557" : "#A8B6C8",
          fontWeight: marcada ? 700 : 400,
        }}
      >
        <span style={{ flex: 1, minWidth: 0, fontSize: "12px", lineHeight: "16px" }}>{c.cuenta}</span>
        <span style={{ ...CIFRA, flex: "none", whiteSpace: "nowrap", textAlign: "right", fontSize: "12px" }}>
          {pesos(c.valor)}
        </span>
      </span>
    );
  };

  return (
    <div data-forma="estado" style={{ ...CAJA }}>
      <p style={{
        margin: "0 0 2px", fontFamily: SORA, fontSize: "12px", fontWeight: 700,
        textAlign: "center", color: FAE.text,
      }}>
        {balance.empresa}
      </p>
      <p style={{ margin: "0 0 1px", fontSize: "12px", textAlign: "center", color: "#A8B6C8" }}>
        Estado de situación financiera
      </p>
      {/*
        El mismo renglón que lleva el balance de «Arma el Balance»: en qué
        momento está hecha la foto. Caleja cierra el capítulo 2 con 465.000 y
        este balance dice 415.000 — son las primeras seis transacciones, no
        una cifra distinta de la misma cosa.
      */}
      {balance.subtitulo && (
        <p data-subtitulo style={{
          margin: "0 0 9px", fontSize: "12px", textAlign: "center", color: "#A8B6C8",
          borderBottom: "1px solid rgba(248,249,250,0.14)", paddingBottom: "6px",
        }}>
          {balance.subtitulo}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {bloques.map(([titulo, lista, total]) => (
          <div key={titulo}>
            <p style={{
              margin: "0 0 3px", fontFamily: SORA, fontSize: "12px", fontWeight: 700,
              letterSpacing: "0.04em", color: "#B8C4D4",
            }}>
              {titulo}
            </p>
            {lista.map((c, k) => fila(c, k === lista.length - 1))}
            <div style={{
              display: "flex", gap: "8px", alignItems: "baseline", minHeight: "20px",
              marginTop: "4px", paddingTop: "4px", borderTop: "1px solid rgba(248,249,250,0.2)",
            }}>
              <span style={{ flex: 1, minWidth: 0, fontFamily: SORA, fontSize: "12px", fontWeight: 700, color: "#B8C4D4" }}>
                Total
              </span>
              <span data-total={titulo === "Activos" ? "activos" : "pasivos-patrimonio"}
                style={{ ...CIFRA, flex: "none", whiteSpace: "nowrap", fontSize: "12px", fontWeight: 700, color: FAE.text }}>
                {pesos(total)}
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
        letterSpacing: "0.12em", color: "#A8B6C8",
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
