import { FAE } from "../../theme.js";
import { mensajeSemanal, TIPO_MENSAJE } from "../../ligas/niveles.js";
import InsigniaLiga from "./InsigniaLiga.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CABECERA DEL TABLERO: el nombre del nivel y el mensaje de la semana.
 *
 * ═══════════ UNA SOLA LLAMADA DECIDE LAS DOS COSAS ═══════════
 *
 * `mensajeSemanal` devuelve el nombre Y el texto, calculados a partir del mismo
 * recuento de niveles. No hay una rama que decida el nombre y otra el mensaje:
 * eso es lo que permitiría que un lunes apareciera "Emergente" con un texto que
 * no corresponde a ese nivel.
 *
 * ═══════════ CON UN SOLO NIVEL NO HAY NOMBRE, Y NO ES UN CASO SIN TERMINAR ══
 *
 * `nombre` llega null, la insignia no se dibuja y el título es "Tu grupo esta
 * semana". El día que el servidor reparta, los nombres aparecen solos: la
 * condición es el dato.
 *
 * ═══════════ LAS SEMANAS DE TRANSICIÓN SE VEN DISTINTAS ═══════════
 *
 * El texto del reparto y el de Élite son largos, se leen una sola vez en la
 * vida del grupo, y explican algo que la persona no ha visto nunca. Con el
 * mismo gris tenue de la línea de siempre, el ojo lo saltaría como "la frase
 * de cada lunes". Van en un recuadro con borde teal: no es una alerta —no hay
 * nada malo que avisar—, es una nota que merece leerse entera.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function CabeceraLiga({
  liga,
  totalNiveles,
  ligaAnterior = null,
  nivelesAnterior = null,
  transicion = null,
  activosReparto = null,
  tamLiga = 0,
}) {
  const m = mensajeSemanal({ liga, totalNiveles, ligaAnterior, nivelesAnterior, transicion, activosReparto });
  const transitoria = m.tipo === TIPO_MENSAJE.REPARTO || m.tipo === TIPO_MENSAJE.ELITE;

  return (
    <header style={{ marginBottom: "14px" }}>
      {/*
        El sobretítulo solo aparece cuando hay nombre. Una palabra suelta como
        "Emergente" en un titular no dice de qué es; con la línea encima, sí.
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

      {transitoria ? (
        <p
          style={{
            fontSize: "12.5px",
            lineHeight: 1.6,
            color: "rgba(248,249,250,0.78)",
            margin: "8px 0 0",
            padding: "10px 12px",
            borderLeft: `2px solid ${FAE.teal}`,
            borderRadius: "0 10px 10px 0",
            background: "rgba(42,157,143,0.08)",
          }}
        >
          {m.base}
        </p>
      ) : (
        /* El mensaje base. Todas las semanas, para todos, sin excepción. */
        <p style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.5)", margin: 0 }}>
          {m.base}
        </p>
      )}

      {/*
        La capa de ascenso. Es la única que se añade, y por eso puede llevar
        color y flecha sin que nadie la lea como "la que falta cuando bajas":
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
