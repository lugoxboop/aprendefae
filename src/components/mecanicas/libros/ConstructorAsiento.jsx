import { FAE } from "../../../theme.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../data/contabilidad.js";
import { CampoCifra, leerCifra } from "./piezas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CONSTRUCTOR DE ASIENTOS — la pieza de Arma el Asiento y de El Asiento
 * Compuesto.
 *
 * El estudiante no elige entre asientos ya armados: arma el suyo. Elige las
 * cuentas de una paleta, le pone lado a cada una y —en el compuesto— su cifra.
 * Es la diferencia entre reconocer un asiento y saber escribirlo, que es lo
 * que separa Aplicación de Análisis en este tema.
 *
 * ═══════════ POR QUÉ UNA FILA ES UNA TARJETA Y NO UN RENGLÓN ═══════════
 *
 * En un libro diario de verdad la fila es un renglón: cuenta, debe, haber, en
 * columnas. A 375 px eso no cabe —el nombre de una cuenta como «Flota y equipo
 * de transporte» se come el ancho entero— y partirlo en columnas estrechas
 * obliga a leer cada celda por separado. Así que la fila se apila: el nombre
 * arriba, el lado debajo y la cifra al final. Se pierde el parecido con la
 * hoja del libro y se gana poder tocarlo con el pulgar.
 *
 * ═══════════ EL COLOR DICE EL LADO, SIEMPRE ═══════════
 *
 * Teal el debe, ámbar el haber, igual que en la cuenta T y en el fondo de la
 * materia. Una fila puesta al debe se ve teal antes de leerla.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * Para el lector de pantalla: lo que el borde dice con grosor, aquí se dice
 * con palabras. No se enseña, pero se lee.
 */
const SOLO_LECTOR_ASIENTO = {
  position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px",
  overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
};

/** Una fila vacía: ni cuenta, ni lado, ni cifra. */
export const filaVacia = () => ({ cuenta: null, lado: null, valor: "" });

/**
 * El asiento que se ha construido, en la forma que usa todo el resto del tema:
 * `{ debe: [[cuenta, valor]], haber: [...] }`. Las filas a medias se caen.
 */
export function asientoDe(filas) {
  const asiento = { debe: [], haber: [] };
  for (const f of filas) {
    if (!f.cuenta || !f.lado) continue;
    const valor = leerCifra(f.valor);
    asiento[f.lado === DEBE ? "debe" : "haber"].push([f.cuenta, valor ?? 0]);
  }
  return asiento;
}

const ROTULO = {
  margin: "16px 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
  fontWeight: 700, letterSpacing: "0.16em",
};

/* Una fila del asiento en construcción. */
function Fila({ fila, indice, conCifras, deshabilitado, estado, onLado, onQuitar, onCifra }) {
  const vacia = !fila.cuenta;
  const acento = fila.lado ? COLOR_LADO[fila.lado] : "rgba(248,249,250,0.22)";
  const correcta = estado === "correcta";
  /*
   * EL ACIERTO NO SE PINTA CON UN COLOR QUE YA SIGNIFICA OTRA COSA.
   *
   * Aquí arriba está escrito que el color dice el lado: teal el debe, ámbar
   * el haber. Pero el estado «correcta» pintaba el borde de FAE.teal, que es
   * EXACTAMENTE el mismo #2A9D8F del debe. Resultado: una fila puesta al
   * HABER, y bien puesta, se veía con el color del DEBE — el sitio le decía
   * al estudiante lo contrario de la lección justo en el momento en que le
   * decía que había acertado.
   *
   * Así que el acierto deja el color del lado en paz y se dice con FORMA: el
   * borde se engrosa y aparece una palomita junto a la cuenta. El error sí
   * conserva su color, porque el coral no significa ningún lado: está
   * reservado para «error» en todo el sitio y no choca con nada.
   */
  const borde = estado === "incorrecta" ? FAE.coral : acento;
  const grosor = correcta || estado === "incorrecta" ? 2 : 1;

  return (
    <div
      data-fila-asiento={indice}
      style={{
        padding: "11px 13px", borderRadius: "13px",
        background: vacia ? "rgba(10,20,34,0.3)" : "rgba(10,20,34,0.55)",
        border: `${grosor}px ${vacia ? "dashed" : "solid"} ${borde}`,
        transition: "border-color 200ms ease, background 200ms ease",
      }}
    >
      {vacia ? (
        <p style={{ margin: 0, fontSize: "13px", color: "rgba(248,249,250,0.4)" }}>
          Toca una cuenta de abajo
        </p>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ flex: 1, minWidth: 0, fontSize: "13.5px", color: FAE.text, lineHeight: 1.35 }}>
              {fila.cuenta}
            </span>
            {correcta && (
              /*
               * La palomita es la señal, no el color: va en el tono del lado
               * para no contradecirlo, y lleva su propio texto para quien no
               * distinga colores ni vea el dibujo.
               */
              <svg width="17" height="17" viewBox="0 0 18 18" role="img" aria-label="Bien puesta" style={{ flexShrink: 0 }}>
                <circle cx="9" cy="9" r="8" fill="none" stroke={acento} strokeWidth="1.5" />
                <path d="M5.4 9.3 L7.9 11.7 L12.6 6.6" fill="none" stroke={acento} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {!deshabilitado && (
              <button
                type="button"
                onClick={() => onQuitar(indice)}
                aria-label={`Quitar ${fila.cuenta}`}
                style={{
                  flexShrink: 0, width: "26px", height: "26px", borderRadius: "999px", cursor: "pointer",
                  background: "rgba(248,249,250,0.08)", border: "1px solid rgba(248,249,250,0.2)",
                  color: "rgba(248,249,250,0.7)", fontSize: "13px", lineHeight: 1,
                }}
              >
                ✕
              </button>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "9px" }}>
            {[DEBE, HABER].map((lado) => {
              const puesto = fila.lado === lado;
              return (
                <button
                  key={lado}
                  type="button"
                  disabled={deshabilitado}
                  onClick={() => onLado(indice, lado)}
                  style={{
                    padding: "9px 8px", borderRadius: "10px", cursor: deshabilitado ? "default" : "pointer",
                    background: puesto ? `${COLOR_LADO[lado]}22` : "rgba(14,27,46,0.5)",
                    border: `1px solid ${puesto ? COLOR_LADO[lado] : "rgba(248,249,250,0.18)"}`,
                    color: puesto ? COLOR_LADO[lado] : "rgba(248,249,250,0.75)",
                    fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700,
                  }}
                >
                  {lado === DEBE ? "Debe" : "Haber"}
                </button>
              );
            })}
          </div>
          {conCifras && (
            <div style={{ marginTop: "9px" }}>
              <CampoCifra
                valor={fila.valor}
                onCambio={(v) => onCifra(indice, v)}
                deshabilitado={deshabilitado}
                etiqueta={`Valor de ${fila.cuenta}`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ConstructorAsiento({
  filas, cuentas, conCifras = false, deshabilitado = false, estados = null,
  acento = FAE.ambar, onFilas, maximo = null,
}) {
  const usadas = new Set(filas.map((f) => f.cuenta).filter(Boolean));

  const cambiar = (k, cambio) => onFilas(filas.map((f, i) => (i === k ? { ...f, ...cambio } : f)));

  const ponerCuenta = (cuenta) => {
    if (deshabilitado || usadas.has(cuenta)) return;
    const hueco = filas.findIndex((f) => !f.cuenta);
    if (hueco >= 0) { cambiar(hueco, { cuenta }); return; }
    /* Sin huecos: se añade una fila, hasta el tope que permita la actividad. */
    if (maximo !== null && filas.length >= maximo) return;
    onFilas([...filas, { ...filaVacia(), cuenta }]);
  };

  const quitar = (k) => {
    if (deshabilitado) return;
    /*
     * Vaciar, no borrar, mientras queden las filas mínimas: si la fila
     * desapareciera, el asiento se encogería debajo del dedo y habría que
     * volver a buscar dónde estaba todo.
     */
    const minimas = conCifras ? 2 : filas.length;
    if (filas.length > minimas) onFilas(filas.filter((_, i) => i !== k));
    else cambiar(k, filaVacia());
  };

  const totales = (() => {
    const a = asientoDe(filas);
    const debe = a.debe.reduce((s, [, v]) => s + v, 0);
    const haber = a.haber.reduce((s, [, v]) => s + v, 0);
    return { debe, haber, cuadra: debe === haber && debe > 0 };
  })();

  return (
    <div>
      <p style={{ ...ROTULO, color: acento }}>EL ASIENTO</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        {filas.map((f, k) => (
          <Fila
            key={k}
            fila={f}
            indice={k}
            conCifras={conCifras}
            deshabilitado={deshabilitado}
            estado={estados?.[k] ?? null}
            onLado={(i, lado) => cambiar(i, { lado })}
            onCifra={(i, valor) => cambiar(i, { valor })}
            onQuitar={quitar}
          />
        ))}
      </div>

      {/*
        El marcador de totales solo sale cuando hay cifras. En Arma el Asiento
        no hay nada que sumar —las dos cuentas llevan el mismo valor y no se
        escribe— y un marcador en cero sería ruido.
      */}
      {conCifras && (
        <div
          data-totales
          style={{
            display: "flex", justifyContent: "space-between", gap: "10px",
            marginTop: "11px", padding: "9px 13px", borderRadius: "11px",
            background: "rgba(10,20,34,0.4)",
            /*
             * Tampoco aquí el teal. Esta caja lleva los DOS lados dentro —el
             * debe en teal a la izquierda, el haber en ámbar a la derecha—, y
             * rodearla del color del debe cuando cuadra inclina la lectura
             * hacia un lado justo cuando lo que hay que ver es que los dos
             * son iguales. Cuadrar se dice con un borde neutro más marcado, y
             * con palabras para quien no ve el borde.
             */
            border: `${totales.cuadra ? 2 : 1}px solid ${totales.cuadra ? "rgba(248,249,250,0.6)" : "rgba(248,249,250,0.14)"}`,
          }}
        >
          <span style={SOLO_LECTOR_ASIENTO}>
            {totales.cuadra ? "El asiento cuadra: el debe y el haber suman lo mismo." : "El asiento todavía no cuadra."}
          </span>
          <span style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, color: COLOR_LADO[DEBE] }}>
            DEBE {pesos(totales.debe)}
          </span>
          <span style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, color: COLOR_LADO[HABER] }}>
            HABER {pesos(totales.haber)}
          </span>
        </div>
      )}

      <p style={{ ...ROTULO, color: acento }}>LAS CUENTAS</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {cuentas.map((c) => {
          const puesta = usadas.has(c);
          return (
            <button
              key={c}
              type="button"
              disabled={deshabilitado || puesta}
              onClick={() => ponerCuenta(c)}
              style={{
                padding: "9px 13px", borderRadius: "999px",
                cursor: deshabilitado || puesta ? "default" : "pointer",
                background: puesta ? "rgba(248,249,250,0.04)" : "rgba(14,27,46,0.6)",
                border: `1px solid ${puesta ? "rgba(248,249,250,0.1)" : "rgba(248,249,250,0.22)"}`,
                color: puesta ? "rgba(248,249,250,0.3)" : FAE.text,
                fontSize: "12.5px", lineHeight: 1.3, textAlign: "left",
              }}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
