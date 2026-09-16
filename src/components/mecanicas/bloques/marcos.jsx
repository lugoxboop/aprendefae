import { FAE } from "../../../theme.js";
import { Panel, CSS_SALA } from "../salaDeControl/marco.jsx";
import { Camaraseccion } from "../corazon/circulatorio.jsx";
import { CSS_JUEGO } from "../corazon/juego.jsx";
import { Tesoreria } from "../tesoreria/tesoreria.jsx";

/*
 * El marco de cada materia, para las mecánicas que se comparten entre ellas.
 *
 * Una mecánica nueva no trae un mundo nuevo: se sienta dentro del de su
 * materia. Política Económica es la Sala de Control, Demanda Agregada el
 * corazón, Política Fiscal la Tesorería. Las piezas de juego —la opción que
 * se toca, la devolución, los pulsos— son las de corazon/juego.jsx en las
 * tres, que ya resolvieron el color que nunca va solo.
 *
 * Todos reciben lo mismo: { rotulo, titulo, acento, children }.
 */

export function MarcoSala({ rotulo, titulo, acento = FAE.teal, children }) {
  return (
    <Panel rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_SALA + CSS_JUEGO}</style>
      {children}
    </Panel>
  );
}

export function MarcoCorazon({ rotulo, titulo, acento = FAE.teal, children }) {
  return (
    <Camaraseccion rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_JUEGO}</style>
      {children}
    </Camaraseccion>
  );
}

/* La Tesorería ya trae dentro el CSS de los juegos. */
export const MarcoTesoreria = Tesoreria;

/*
 * La Sala de Máquinas (Política Monetaria): el mismo panel del edificio, con
 * su rótulo. No trae mundo visual propio dentro de los juegos: el volante y
 * las correas viven en las piezas de Aprender y en los juegos que las usan.
 */
export function MarcoMaquinas({ rotulo, titulo, acento = FAE.teal, children }) {
  return (
    <Panel rotulo={rotulo ? `SALA DE MÁQUINAS · ${rotulo}` : "SALA DE MÁQUINAS"} titulo={titulo} acento={acento}>
      <style>{CSS_SALA + CSS_JUEGO}</style>
      {children}
    </Panel>
  );
}

/*
 * El rótulo de una cifra que no es del bloque de datos verificados. La regla
 * del prompt maestro: ninguna cifra simulada sale sin él. No es un error: va
 * en ámbar y con el texto escrito, nunca en coral.
 */
export function RotuloEscenario({ texto = "Escenario simulado" }) {
  return (
    <p
      data-rotulo-escenario
      style={{
        display: "inline-block", margin: "8px 0 0", padding: "3px 9px", borderRadius: "999px",
        fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em",
        color: FAE.ambar, border: `1px solid ${FAE.ambar}66`, background: "rgba(233,196,106,0.08)",
      }}
    >
      {texto}
    </p>
  );
}

/** El botón de avance y el texto pequeño de un cierre, los mismos en las tres. */
export { Avanzar, TEXTO_CIERRE } from "../tesoreria/tesoreria.jsx";
