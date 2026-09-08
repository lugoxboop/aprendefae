import { FAE } from "../../theme.js";
import { mensajeSemanal } from "../../ligas/niveles.js";
import InsigniaLiga from "./InsigniaLiga.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CABECERA DEL TABLERO: el nombre del nivel y el mensaje de la semana.
 *
 * ═══════════ UNA SOLA LLAMADA DECIDE LAS DOS COSAS ═══════════
 *
 * `mensajeSemanal` devuelve el nombre Y el texto, calculados los dos a partir
 * del mismo recuento de niveles. No hay una rama que decida el nombre y otra
 * que decida el mensaje: eso es lo que permitiría que un lunes apareciera
 * \"Emergente\" con el texto de bienvenida, o el texto del primer cierre sin
 * nombres a la vista. Si alguna vez hace falta el nombre en otro sitio, sale de
 * aquí, no de una segunda cuenta.
 *
 * ═══════════ CON UN SOLO NIVEL NO HAY NOMBRE, Y NO ES UN CASO SIN TERMINAR ══
 *
 * Es el estado de HOY: una sola liga en Pensamiento Estratégico. `nombre` llega
 * null, la insignia no se dibuja, el título es \"Tu grupo esta semana\" y el
 * texto es el mismo de siempre. El día que el sistema pase a más de un nivel,
 * los nombres aparecen solos: no hay bandera que encender ni despliegue que
 * hacer, porque la condición es el dato.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function CabeceraLiga({
  liga,
  totalNiveles,
  ciclosConNiveles,
  ligaAnterior = null,
  tamLiga = 0,
}) {
  const m = mensajeSemanal({ liga, totalNiveles, ciclosConNiveles, ligaAnterior });

  return (
    <header style={{ marginBottom: "14px" }}>
      {/*
        El sobretítulo solo aparece cuando hay nombre. Una palabra suelta como
        \"Emergente\" en un titular no dice de qué es; con la línea encima, sí. Y
        cuando no hay nombre sobra, porque el titular ya es la frase entera.
      */}
      {m.rotulo && (
        <p
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "rgba(248,249,250,0.38)",
            margin: "0 0 5px",
          }}
        >
          {m.rotulo}
        </p>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          /* A 375 px el contador de compitiendo cae a su propia línea. */
          flexWrap: "wrap",
          gap: "6px 12px",
          marginBottom: "4px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "9px", minWidth: 0 }}>
          <InsigniaLiga nombre={m.nombre} />
          <h3
            style={{
              fontFamily: "Sora, sans-serif",
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              margin: 0,
              color: FAE.text,
            }}
          >
            {m.titulo}
          </h3>
        </div>
        {tamLiga > 0 && (
          <span style={{ fontSize: "12px", color: "rgba(248,249,250,0.45)", whiteSpace: "nowrap" }}>
            {tamLiga} compitiendo
          </span>
        )}
      </div>

      {/* El mensaje base. Todas las semanas, para todos, sin excepción. */}
      <p style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.5)", margin: 0 }}>
        {m.base}
      </p>

      {/*
        La capa de ascenso. Es la única que se añade, y por eso puede llevar
        color y flecha sin que nadie la lea como \"la que falta cuando bajas\":
        cuando no está, lo que queda no es un hueco, es el mensaje de siempre.
      */}
      {m.ascenso && (
        <p
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "Sora, sans-serif",
            fontSize: "12.5px",
            fontWeight: 600,
            color: FAE.teal,
            margin: "8px 0 0",
          }}
        >
          <span aria-hidden="true">↑</span>
          {m.ascenso}
        </p>
      )}
    </header>
  );
}
