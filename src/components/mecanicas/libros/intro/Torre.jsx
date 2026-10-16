import { FAE } from "../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP } from "../../../../data/contabilidadIntro.js";
import {
  BLOQUES, ROTULO_ACTIVO, ROTULO_PASIVO_PATRIMONIO,
} from "../../../../data/contabilidadPiezas234.js";
import { tramosDeLaTorre } from "../../../../contabilidad/aprenderTema1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA TORRE LEÍDA POR LOS DOS LADOS — la figura de la pieza 2.
 *
 * ═══════════ ES UNA SOLA TORRE, Y ESO ES TODO EL ARGUMENTO ═══════════
 *
 * La confusión que la pieza ataca —«si un lado sube, el otro baja»— nace de
 * imaginar dos cosas que se compensan. Aquí no hay dos cosas: hay UNA columna
 * de bloques que se lee dos veces. Por la izquierda, qué cosa es cada bloque.
 * Por la derecha, de dónde salió. Misma torre, misma altura, siempre.
 *
 * Por eso los rótulos se pintan A LOS COSTADOS de la misma columna y nunca se
 * dibujan dos columnas enfrentadas: dos columnas ya serían dos cosas, y la
 * pieza estaría enseñando lo contrario de lo que dice.
 *
 * ═══════════ NADA DE ESTO ES EL ANILLO ═══════════
 *
 * El anillo de cinco puntos de la pieza 1 significa «el ciclo de la
 * información». Aquí no aparece ni su forma ni su franja: reusarlo para otra
 * cosa lo vaciaría.
 *
 * ═══════════ SIN CIFRAS ═══════════
 *
 * La altura no es una cantidad: es «cuántos bloques hay». La pieza no trae ni
 * un número, y ponerle uno sería inventarse el caso.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const ALTO_BLOQUE = 34;
const ANCHO_BLOQUE = 56;

/*
 * ═══════════ QUÉ BLOQUES HAY, Y EN QUÉ ORDEN SE VEN ═══════════
 *
 * `cambio` es { tramo, signo }: qué tramo de la lectura por la derecha crece o
 * mengua. Crecer y menguar NO se hacen recortando la lista por el final —eso
 * quitaba siempre la máquina, que es de los dueños, aunque el caso dijera que
 * lo que baja es el pasivo—. Se hacen sobre el tramo que el caso nombra.
 *
 * Y el orden de pantalla se calcula UNA vez y lo usan las tres columnas. Aquí
 * estuvo el fallo que cazó una captura: la columna de bloques iba en
 * `column-reverse` y la de rótulos en orden normal, así que «plata» quedaba al
 * lado de la máquina. Nada fallaba —los tres rótulos estaban y los tres
 * bloques también— y la pieza entera se apoya en que cada rótulo esté junto al
 * suyo.
 */
export function torreEnPantalla(cambio = null) {
  const tramos = tramosDeLaTorre().map((t) => {
    if (!cambio || cambio.tramo !== t.tramo) return { ...t, extra: 0 };
    if (cambio.signo > 0) return { ...t, extra: 1 };
    return { ...t, bloques: t.bloques.slice(0, -1), extra: 0 };
  }).filter((t) => t.bloques.length + t.extra > 0);

  /* De arriba abajo: el último tramo de la pila va primero en pantalla. */
  const enPantalla = [...tramos].reverse();
  const celdas = [];
  for (const t of enPantalla) {
    for (let k = 0; k < t.extra; k += 1) celdas.push({ extra: true, tramo: t.tramo, key: `extra-${t.tramo}-${k}` });
    for (const b of [...t.bloques].reverse()) celdas.push({ extra: false, bloque: b, tramo: t.tramo, key: b.id });
  }
  return { tramos: enPantalla, celdas };
}

/*
 * `lado` dice qué lecturas se ven: "ninguna", "izquierda", "derecha" o "ambas".
 */
export default function Torre({
  lado = "ninguna",
  cambio = null,
  marcarTramo = null,
  reducido = false,
}) {
  const verIzq = lado === "izquierda" || lado === "ambas";
  const verDer = lado === "derecha" || lado === "ambas";
  const { tramos, celdas } = torreEnPantalla(cambio);

  const encabezado = (texto, ver, alaDerecha) => (
    <span
      data-rotulo-lado={texto}
      style={{
        flex: "1 1 0", minWidth: 0, fontFamily: SORA, fontSize: "10px", fontWeight: 700,
        letterSpacing: "0.14em", color: NEUTRO, textAlign: alaDerecha ? "left" : "right",
        opacity: ver ? 1 : 0,
        transition: reducido ? "none" : "opacity 400ms ease",
      }}
    >
      {texto}
    </span>
  );

  return (
    <div data-torre data-lado={lado} data-altura={celdas.length}>
      {/*
        ═══════════ LOS DOS ENCABEZADOS VAN EN SU PROPIA FILA ═══════════

        Estaban dentro de las columnas laterales, y eso las hacía más altas que
        la de los bloques: el flex estiraba la fila y los rótulos quedaban un
        bloque por debajo del suyo. «máquina» aparecía al lado del segundo
        bloque. Lo cazó una captura, igual que el orden de las columnas.

        Fuera de las columnas, las tres empiezan a la misma altura y cada
        rótulo cae junto a su bloque sin tener que ajustar nada a mano.
      */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "5px" }}>
        {encabezado(ROTULO_ACTIVO, verIzq, false)}
        <span aria-hidden="true" style={{ flex: "none", width: `${ANCHO_BLOQUE}px` }} />
        {encabezado(ROTULO_PASIVO_PATRIMONIO, verDer, true)}
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "8px" }}>
      {/* Lectura por la izquierda: qué cosa es cada bloque. */}
      <div data-lectura="izquierda" style={{
        flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column",
        alignItems: "flex-end", gap: "3px",
        opacity: verIzq ? 1 : 0.15,
        transition: reducido ? "none" : "opacity 400ms ease",
      }}>
        {/* Una celda por bloque y en el MISMO orden que la columna del medio. */}
        {celdas.map((c) => (
          <span
            key={c.key}
            data-izq={c.extra ? "extra" : c.bloque.id}
            style={{
              height: `${ALTO_BLOQUE}px`, display: "flex", alignItems: "center",
              justifyContent: "flex-end", fontSize: "11px", color: FAE.text, textAlign: "right",
            }}
          >
            {/* El bloque de más no tiene nombre: el capítulo no dice cuál sería. */}
            {verIzq && !c.extra ? c.bloque.izquierda : ""}
          </span>
        ))}
      </div>

      {/* La torre. Una sola, en el medio, y siempre la misma. */}
      <div style={{ flex: "none", display: "flex", flexDirection: "column", gap: "3px" }}>
        {celdas.map((c) => (
          <div
            key={c.key}
            data-bloque={c.extra ? "extra" : c.bloque.id}
            style={{
              width: `${ANCHO_BLOQUE}px`, height: `${ALTO_BLOQUE}px`, borderRadius: "6px",
              background: c.extra ? "rgba(184,196,212,0.45)" : NEUTRO,
              border: `1px solid ${NEUTRO}`,
              transition: reducido ? "none" : "opacity 400ms ease",
            }}
          />
        ))}
      </div>

      {/* Lectura por la derecha: de dónde salió cada tramo. */}
      <div data-lectura="derecha" style={{
        flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: "3px",
        opacity: verDer ? 1 : 0.15,
        transition: reducido ? "none" : "opacity 400ms ease",
      }}>
        {/*
          Los tramos, de arriba abajo y en el mismo orden que las celdas: cada
          rótulo tiene que quedar al lado del tramo que nombra.
        */}
        {tramos.map((t) => {
          const marcado = marcarTramo === t.tramo;
          const cuantos = t.bloques.length + t.extra;
          return (
            <span
              key={t.tramo}
              data-tramo={t.tramo}
              data-marcado={marcado ? "si" : undefined}
              style={{
                height: `${cuantos * ALTO_BLOQUE + (cuantos - 1) * 3}px`,
                display: "flex", alignItems: "center", gap: "5px",
                padding: marcado ? "0 6px" : 0, borderRadius: "7px",
                background: marcado ? "rgba(184,196,212,0.18)" : "transparent",
                /* 12 px: «del banco» y «de los dueños» dicen de quién es cada tramo. */
                fontSize: "12px", color: FAE.text,
              }}
            >
              {verDer && (
                <>
                  <span aria-hidden="true" style={{
                    flex: "none", width: "3px", alignSelf: "stretch", borderRadius: "2px",
                    background: NEUTRO, margin: "2px 0",
                  }} />
                  {t.tramo}
                </>
              )}
            </span>
          );
        })}
      </div>
      </div>
    </div>
  );
}

/*
 * La línea que une las dos alturas. No es decoración: es la prueba de que las
 * dos lecturas llegan al mismo sitio, y va escrita además del trazo porque
 * nada de esta pieza se comunica solo con un dibujo.
 */
export function LineaDeAltura({ texto = "la misma altura" }) {
  return (
    <div data-linea-altura style={{
      display: "flex", alignItems: "center", gap: "7px", margin: "7px 0 0",
    }}>
      <span aria-hidden="true" style={{ flex: 1, height: "1px", background: NEUTRO }} />
      <span style={{
        flex: "none", padding: "1px 7px", borderRadius: "6px", background: NEUTRO,
        color: NAVY_DEL_CHIP, fontFamily: SORA, fontSize: "12px", fontWeight: 700,
      }}>
        {texto}
      </span>
      <span aria-hidden="true" style={{ flex: 1, height: "1px", background: NEUTRO }} />
    </div>
  );
}
