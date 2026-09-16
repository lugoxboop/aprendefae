import { useState } from "react";
import { FAE } from "../../theme.js";
import { CAMPO, ETIQUETA, AYUDA } from "../auth/estilosCampo.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EDITAR PERFIL — el panel que se abre desde "Tu perfil".
 *
 * Hoy tiene una sección: el apodo (lo que ven los demás en rankings y ligas) y
 * el nombre real (lo que ve el docente en su panel). Mañana tendrá la del
 * avatar, y por eso está hecho de SECCIONES:
 *
 *   id          nombre de la sección
 *   titulo      su encabezado dentro del panel
 *   campos      las columnas del perfil que edita
 *   Componente  lo que se pinta: recibe { valores, cambiar }
 *   validar     opcional, (valores) → true si se puede guardar. Por defecto:
 *               que ningún campo de texto esté vacío
 *
 * El panel no sabe qué campos hay. Lleva un solo borrador con los campos de
 * todas las secciones, un solo botón de guardar y un solo cambio hacia la base
 * con todo lo que las secciones declararon. Añadir el avatar es añadir una
 * entrada a SECCIONES (y su columna a CAMPOS_EDITABLES): ni el diseño del
 * panel, ni la navegación, ni el guardado cambian.
 *
 * VALIDACIÓN: solo que los campos no estén vacíos. Nada más —ni largo, ni
 * unicidad, ni filtro de palabras, ni límite de cambios—, por decisión de
 * producto. Las reglas que la base ya tenía se cuentan en perfilEditable.js.
 *
 * Los estilos son los del paso de apodo del primer ingreso (CAMPO, ETIQUETA,
 * AYUDA) y los botones de pastilla del perfil: aquí no hay componentes
 * visuales nuevos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

function SeccionIdentidad({ valores, cambiar }) {
  return (
    <>
      <label htmlFor="editar-apodo" style={ETIQUETA}>Apodo</label>
      <input
        id="editar-apodo"
        value={valores.nickname}
        onChange={(e) => cambiar("nickname", e.target.value)}
        autoComplete="nickname"
        style={CAMPO}
      />
      <p style={AYUDA}>Es lo que ven los demás en los rankings y las ligas.</p>

      <label htmlFor="editar-nombre" style={ETIQUETA}>Nombre real</label>
      <input
        id="editar-nombre"
        value={valores.full_name}
        onChange={(e) => cambiar("full_name", e.target.value)}
        autoComplete="name"
        style={CAMPO}
      />
      <p style={{ ...AYUDA, marginBottom: 0 }}>Solo lo ve el profesor de tu curso, para saber cómo vas. No aparece en los rankings.</p>
    </>
  );
}

export const SECCIONES = [
  { id: "identidad", titulo: "Cómo te llamas aquí", campos: ["nickname", "full_name"], Componente: SeccionIdentidad },
];

const vacio = (v) => typeof v !== "string" || v.trim() === "";

/** El borrador inicial: el valor actual de cada campo de cada sección. */
export function borradorDe(perfil, secciones = SECCIONES) {
  return Object.fromEntries(secciones.flatMap((s) => s.campos).map((c) => [c, perfil?.[c] ?? ""]));
}

/** ¿Se puede guardar? Cada sección con su `validar`, o ningún campo vacío. */
export function sePuedeGuardar(borrador, secciones = SECCIONES) {
  return secciones.every((s) => (s.validar ? s.validar(borrador) : s.campos.every((c) => !vacio(borrador[c]))));
}

/** El cambio que se manda: los campos de todas las secciones, sin espacios en los extremos. */
export function cambioDe(borrador, secciones = SECCIONES) {
  return Object.fromEntries(
    secciones.flatMap((s) => s.campos).map((c) => [c, typeof borrador[c] === "string" ? borrador[c].trim() : borrador[c]]),
  );
}

const PASTILLA = {
  fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600,
  padding: "10px 18px", borderRadius: "999px", cursor: "pointer",
};

export default function EditarPerfil({ perfil, guardar, onCancelar, onGuardado, secciones = SECCIONES }) {
  const [borrador, setBorrador] = useState(() => borradorDe(perfil, secciones));
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const listo = sePuedeGuardar(borrador, secciones) && !guardando;
  const cambiar = (campo, valor) => {
    setBorrador((b) => ({ ...b, [campo]: valor }));
    setError(null);
  };

  const enviar = async (e) => {
    e?.preventDefault?.();
    if (!listo) return;
    setGuardando(true);
    setError(null);
    const { error: err } = (await guardar(cambioDe(borrador, secciones))) ?? {};
    setGuardando(false);
    if (err) setError(err);
    else onGuardado?.();
  };

  return (
    <form data-editar-perfil onSubmit={enviar} noValidate>
      <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "22px", letterSpacing: "-0.025em", margin: "0 0 18px", color: FAE.text }}>
        Editar perfil
      </h2>

      {secciones.map(({ id, titulo, campos, Componente }) => (
        <fieldset key={id} data-seccion={id} style={{ border: "none", padding: 0, margin: "0 0 22px", minWidth: 0 }}>
          <legend style={{ padding: 0, marginBottom: "12px", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: FAE.teal }}>
            {titulo.toUpperCase()}
          </legend>
          <Componente valores={Object.fromEntries(campos.map((c) => [c, borrador[c]]))} cambiar={cambiar} />
        </fieldset>
      ))}

      {error && <p role="alert" style={{ fontSize: "13px", lineHeight: 1.5, color: FAE.coral, margin: "0 0 14px" }}>{error}</p>}

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          type="submit"
          disabled={!listo}
          style={{
            ...PASTILLA, border: "none",
            cursor: listo ? "pointer" : "default",
            backgroundColor: listo ? FAE.teal : "rgba(248,249,250,0.08)",
            color: listo ? FAE.bg : "rgba(248,249,250,0.4)",
          }}
        >
          {guardando ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          disabled={guardando}
          style={{ ...PASTILLA, background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.72)" }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
