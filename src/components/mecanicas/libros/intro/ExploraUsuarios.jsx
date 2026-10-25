import { useState } from "react";
import {
  USUARIOS, TEXTO_DEL_SELECTOR, VACIO_CAPA_3, ALTERNATIVOS, ALT_RETORNO, NEUTRO, NAVY_DEL_CHIP,
} from "../../../../data/contabilidadIntro.js";
import {
  BALANCE, retornoParaUsuario, usuarioPorId, ENCENDIDO,
} from "../../../../contabilidad/recorridoDeUnHecho.js";
import { useMovimientoReducido, SOLO_LECTOR } from "../verbos.jsx";
import FranjaDelCiclo from "./FranjaDelCiclo.jsx";
import { FormaEstado, FormaPregunta } from "./formas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPA 3 · «AHORA PRUEBE USTED» — los ocho que miran el mismo resumen.
 *
 * El estudiante elige un usuario y ve qué le pregunta ese usuario AL MISMO
 * estado financiero. El resumen no cambia: cambia la pregunta.
 *
 * ═══════════ Y EL TRAZO DE RETORNO SOLO SE ENCIENDE CON UNO ═══════════
 *
 * Los ocho consultan el resumen, pero solo la decisión de la administración
 * cambia lo que la empresa HACE — y por eso solo ahí el ciclo se cierra. Con
 * los otros siete el trazo se queda ATENUADO, nunca invisible: el ciclo existe
 * igual, lo esté cerrando ese usuario o no. Borrarlo diría que para un
 * acreedor la contabilidad no es un ciclo, y eso sería falso.
 *
 * Esa diferencia es la que convierte «interno / externo» de etiqueta en algo
 * que se ve: la administración está DENTRO del ciclo; los demás lo consultan
 * desde afuera.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";

export default function ExploraUsuarios() {
  const reducido = useMovimientoReducido();
  const [elegido, setElegido] = useState(null);

  const usuario = usuarioPorId(elegido);
  const retorno = retornoParaUsuario(usuario);

  const chip = (u) => {
    const activo = u.id === elegido;
    return (
      <button
        key={u.id}
        type="button"
        data-usuario={u.id}
        data-elegido={activo ? "si" : "no"}
        aria-pressed={activo}
        onClick={() => setElegido(activo ? null : u.id)}
        onKeyDown={(ev) => { if (ev.key === "Escape") setElegido(null); }}
        style={{
          padding: "6px 9px", borderRadius: "999px", cursor: "pointer", textAlign: "left",
          background: activo ? NEUTRO : "transparent",
          color: activo ? NAVY_DEL_CHIP : "rgba(248,249,250,0.72)",
          border: `1px solid ${activo ? NEUTRO : "rgba(248,249,250,0.22)"}`,
          fontFamily: SORA, fontSize: "12px", fontWeight: activo ? 700 : 500,
        }}
      >
        {u.nombre}
        <span style={{ marginLeft: "5px", opacity: 0.7, fontSize: "12px" }}>
          {u.tipo === "interno" ? "interno" : "externo"}
        </span>
      </button>
    );
  };

  return (
    <div data-explora-usuarios data-retorno={retorno}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {USUARIOS.map(chip)}
      </div>

      <div style={{ display: "flex", gap: "6px", alignItems: "stretch", marginTop: "12px" }}>
        <FranjaDelCiclo retorno={retorno} reducido={reducido} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "7px" }}>
          {/* El resumen es el mismo para los ocho: no se mueve de aquí. */}
          <FormaEstado balance={BALANCE} />
          {usuario
            ? (
              <>
                <FormaPregunta usuario={usuario} empresa={BALANCE.empresa} />
                <p data-proposito style={{
                  margin: 0, padding: "7px 9px", borderRadius: "9px", fontSize: "11px",
                  lineHeight: 1.45, color: "rgba(248,249,250,0.66)",
                  background: "rgba(10,20,34,0.4)", border: "1px solid rgba(248,249,250,0.12)",
                }}>
                  Lo usa para {usuario.proposito}.
                </p>
              </>
            )
            : (
              <p data-vacio style={{
                margin: 0, padding: "13px 10px", textAlign: "center", fontSize: "12px",
                color: "#A8B6C8",
              }}>
                {VACIO_CAPA_3}
              </p>
            )}
        </div>
      </div>

      <p style={{ margin: "12px 0 0", fontSize: "12.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.75)" }}>
        {TEXTO_DEL_SELECTOR}
      </p>
      <p style={SOLO_LECTOR}>{ALTERNATIVOS.capa3}</p>
      {usuario && (
        <p style={SOLO_LECTOR}>
          {retorno === ENCENDIDO ? ALT_RETORNO.encendido : ALT_RETORNO.atenuado}
        </p>
      )}
    </div>
  );
}
