import { NEUTRO, NAVY_DEL_CHIP, USUARIOS } from "../../../../data/contabilidadIntro.js";
import { PREGUNTA_P3, OPCIONES_P3, FOTOS } from "../../../../data/contabilidadPiezas234.js";
import { evaluarOpcionP3 } from "../../../../contabilidad/aprenderTema1.js";
import { useMovimientoReducido } from "../verbos.jsx";
import { FiguraDelTiempo } from "./LineaDelTiempo.jsx";
import UnaFrase from "./UnaFrase.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 3 · CAPA 4 — «En una frase».
 *
 * Dos de las tres devoluciones equivocadas no se explican con la figura del
 * tiempo, sino con los ocho usuarios de la pieza 1: «uno es para los de
 * adentro y el otro para los de afuera» se desmiente enseñando que los ocho
 * leen los dos. Reusar ahí a los ocho no gasta nada —significan lo mismo que
 * en la pieza 1— y ata las dos piezas por donde se tocan de verdad.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";

function Escena({ escena }) {
  const reducido = useMovimientoReducido();
  if (!escena) return null;

  if (escena.tipo === "ocho-leyendo" || escena.tipo === "estado-lee") {
    const soloElEstado = escena.tipo === "estado-lee";
    return (
      <div data-escena={escena.tipo} style={{ marginTop: "10px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {USUARIOS.map((u) => {
            const marcado = soloElEstado ? u.id === "estado" : true;
            return (
              <span key={u.id} data-usuario={u.id} data-marcado={marcado ? "si" : "no"} style={{
                padding: "4px 8px", borderRadius: "999px", fontFamily: SORA, fontSize: "10px",
                fontWeight: marcado ? 700 : 500,
                background: marcado ? NEUTRO : "transparent",
                color: marcado ? NAVY_DEL_CHIP : "rgba(248,249,250,0.5)",
                border: `1px solid ${marcado ? NEUTRO : "rgba(248,249,250,0.18)"}`,
              }}>
                {u.nombre}
              </span>
            );
          })}
        </div>
        <p data-quien-lee style={{ margin: "7px 0 0", fontSize: "11px", color: "rgba(248,249,250,0.6)" }}>
          {soloElEstado ? "el Estado es uno de los que leen" : "los ocho leen los dos informes"}
        </p>
      </div>
    );
  }

  /* Las dos que sí usan la figura: la correcta, y la de «uno tiene cifras». */
  const conCifras = escena.tipo === "las-dos-con-cifras";
  return (
    <div data-escena={escena.tipo} style={{ marginTop: "10px" }}>
      <FiguraDelTiempo
        fotos={FOTOS}
        escena={{ tipo: "dos-fotos" }}
        llenado={1}
        conCifras={conCifras}
        reducido={reducido}
      />
    </div>
  );
}

export default function UnaFraseFotoPelicula() {
  return (
    <UnaFrase
      pregunta={PREGUNTA_P3}
      opciones={OPCIONES_P3}
      evaluar={evaluarOpcionP3}
      Escena={Escena}
    />
  );
}
