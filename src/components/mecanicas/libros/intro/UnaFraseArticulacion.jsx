import { FAE } from "../../../../theme.js";
import { NEUTRO } from "../../../../data/contabilidadIntro.js";
import {
  PREGUNTA_P4, OPCIONES_P4, FLECHAS_P4, INFORMES_P4, FOTOS,
} from "../../../../data/contabilidadPiezas234.js";
import { evaluarOpcionP4, informeQueRecibeP4 } from "../../../../contabilidad/aprenderTema1.js";
import { useMovimientoReducido } from "../verbos.jsx";
import TresInformes from "./TresInformes.jsx";
import { Foto, Banda } from "./LineaDelTiempo.jsx";
import UnaFrase from "./UnaFrase.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 4 · CAPA 4 — «En una frase».
 *
 * La escena de «el de la foto se hace primero» trae de vuelta la línea de
 * tiempo de la pieza 3, con la foto del comienzo marcada aparte. Es la única
 * forma de enseñar lo que esa devolución dice: que la foto que va primero
 * existe, pero es OTRA — la del comienzo del año, no la del final.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const TODAS = FLECHAS_P4.map((f) => f.id);

function Escena({ escena }) {
  const reducido = useMovimientoReducido();
  if (!escena) return null;

  if (escena.tipo === "linea-de-tiempo") {
    return (
      <div data-escena="linea-de-tiempo" style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <p data-foto-del-comienzo style={{
          margin: 0, fontSize: "10.5px", fontFamily: SORA, fontWeight: 700, color: NEUTRO,
        }}>
          la que va primero es esta, y es otra
        </p>
        <Foto foto={FOTOS[0]} resaltada />
        <Banda llenado={1} atenuada reducido={reducido} />
        <Foto foto={FOTOS[1]} atenuada />
      </div>
    );
  }

  if (escena.tipo === "tres-encabezados") {
    return (
      <div data-escena="tres-encabezados" style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "5px" }}>
        {INFORMES_P4.map((inf) => (
          <span key={inf.id} data-encabezado={inf.id} style={{
            padding: "6px 9px", borderRadius: "8px", background: "rgba(184,196,212,0.12)",
            border: `1px solid ${NEUTRO}`, fontFamily: SORA, fontSize: "11px", fontWeight: 700,
            color: FAE.text,
          }}>
            {inf.nombre}
          </span>
        ))}
      </div>
    );
  }

  /*
   * Las dos que enseñan las cinco: la correcta las enciende con el informe que
   * recibe resaltado —que es lo que su texto afirma—, y la de «cada uno se
   * hace aparte» las enseña de golpe, sin resaltar nada, porque lo único que
   * tiene que decir es que existen.
   */
  const conReceptor = escena.tipo === "cinco-en-secuencia";
  return (
    <div data-escena={escena.tipo} style={{ marginTop: "10px" }}>
      <TresInformes
        activas={TODAS}
        resaltar={conReceptor ? informeQueRecibeP4() : null}
        reducido={reducido}
      />
    </div>
  );
}

export default function UnaFraseArticulacion() {
  return (
    <UnaFrase
      pregunta={PREGUNTA_P4}
      opciones={OPCIONES_P4}
      evaluar={evaluarOpcionP4}
      Escena={Escena}
    />
  );
}
