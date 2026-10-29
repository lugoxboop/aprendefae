import { FAE } from "../../theme.js";
import { V1 } from "./estiloV1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPA 0 · LA FRASE DE HOY
 *
 * Lo primero que lee el profesor no es un número, es una oración con sujeto y
 * un botón al lado. La idea es de Google Classroom, que lo resolvió sin un
 * solo gráfico: en vez de «retención 73 %» escribe «estos estudiantes
 * entregaron tarde más de la mitad de sus tareas este mes». El texto lo arma
 * frase.js; aquí solo se pinta.
 *
 * ═══════════ LAS DECISIONES VISUALES, Y POR QUÉ ═══════════
 *
 *   · EL ÚNICO BLOQUE CON ACENTO de la pantalla. Un acento repetido deja de
 *     serlo: si todo está resaltado, nada lo está. El acento es el borde y un
 *     velo del 6 %, no el color del texto — el teal de marca no llega a 4,5:1
 *     sobre estas superficies y en texto está prohibido por el trinquete.
 *   · NINGÚN NÚMERO SE ANIMA. Nada de contadores que suben hasta su valor:
 *     es decoración encima de un dato con el que alguien va a decidir, y
 *     retrasa la lectura. Lo que se anima es la llegada del bloque, una vez.
 *   · EL TEXTO ES EL TAMAÑO DE LECTURA (16 px, interlineado 1.6). Esto se lee
 *     de pie entre dos clases, en un teléfono, no se escanea.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* El velo de acento. Teal de marca al 6 % sobre la tarjeta: suficiente para
 * que el bloque se despegue, lejos de competir con el texto encima. */
const VELO = "rgba(42,157,143,0.06)";

export default function FraseDeHoy({ lineas = [], onIr, className, style }) {
  if (lineas.length === 0) return null;

  return (
    <section
      className={className}
      data-bloque="frase"
      aria-labelledby="pd2-frase-titulo"
      style={{
        padding: "16px",
        borderRadius: "14px",
        background: `linear-gradient(0deg, ${VELO}, ${VELO}), ${V1.tarjeta}`,
        border: `1px solid rgba(42,157,143,0.45)`,
        minWidth: 0,
        marginBottom: "12px",
        ...style,
      }}
    >
      {/* El título existe para el lector de pantalla y para dar orden; no compite con la frase. */}
      <h2
        id="pd2-frase-titulo"
        style={{ margin: "0 0 10px", fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", color: V1.texto2 }}
      >
        HOY, EN TU CLASE
      </h2>

      {lineas.map((l) => (
        <p
          key={l.id}
          data-linea={l.id}
          style={{
            margin: "0 0 6px",
            fontSize: "16px",
            lineHeight: 1.6,
            color: l.id === "sin-grupo" ? V1.texto2 : FAE.text,
            overflowWrap: "anywhere",
          }}
        >
          {l.texto}
        </p>
      ))}

      {/*
       * Los botones. Son la mitad del bloque, no un apéndice: una frase que no
       * termina en algo que hacer es un periódico. Van en fila que envuelve,
       * con 44 px de alto, y a 320 px caen uno debajo de otro sin cortarse.
       */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
        {lineas.filter((l) => l.accion).map((l) => (
          <button
            key={l.id}
            type="button"
            className="pd1-toque pd1-foco"
            data-accion={l.accion.destino}
            onClick={() => onIr?.(l.accion.destino)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0 14px",
              borderRadius: "999px",
              background: "rgba(248,249,250,0.06)",
              border: "1px solid rgba(248,249,250,0.22)",
              color: FAE.text,
              cursor: "pointer",
              fontFamily: "Sora, sans-serif",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {l.accion.texto}
          </button>
        ))}
      </div>
    </section>
  );
}
