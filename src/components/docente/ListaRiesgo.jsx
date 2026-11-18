import { ChevronRight, Copy, Eye } from "lucide-react";
import { useState } from "react";
import { copiar } from "../../docente/copiar.js";
import { FAE } from "../../theme.js";
import { NIVEL, REGLAS_SIN_DATOS } from "../../docente/alertas.js";
import { DIAGNOSTICOS_SIN_DATOS } from "../../docente/diagnosticos.js";
import { AJUSTABLES, claveSilencio } from "../../docente/preferenciasDocente.js";
import MarcaNivel, { NIVEL_MARCA } from "./MarcaNivel.jsx";
import { V1, notaV1, tarjetaV1, tituloBloque } from "./estiloV1.js";
import VistaDocente, { Inicial } from "./VistaDocente.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPA 2 · LA LISTA POR RIESGO
 *
 * Nunca alfabética. Cada fila lleva el nombre, el diagnóstico POR SU NOMBRE,
 * la cifra que lo justifica y el botón de lo que se puede hacer. El orden es
 * el de la urgencia, que es lo contrario de lo que hace un listado de clase.
 *
 * ═══════════ TRES PIEZAS PRESTADAS, Y QUÉ COMPRA CADA UNA ═══════════
 *
 *   · DE ALEKS, el diagnóstico con nombre en vez del índice de riesgo. «Riesgo:
 *     alto» no implica ninguna acción; «responde rápido y acierta poco» y «dejó
 *     de entrar» implican dos conversaciones distintas.
 *   · DE BLACKBOARD, el umbral que pone el profesor. Está aquí mismo, no en
 *     una pantalla de configuración: el sitio donde se duda de un umbral es
 *     delante de la lista que produjo.
 *   · DE MOODLE, el «no aplica». Es el único de los veinte competidores donde
 *     el docente corrige al sistema. Mata la desconfianza de quien piensa
 *     «este estudiante está bien, la máquina se equivoca», y lo que silencia
 *     se puede volver a encender: un botón que no se puede deshacer no se
 *     toca.
 *
 * ═══════════ Y UNA PROHIBICIÓN ═══════════
 *
 * Nada de esto es público. Classcraft hace que al perder salud se entere toda
 * la clase y su propia reseña advierte que eso deja señalado justo al que ya
 * va mal. Estas etiquetas las ve el docente y nadie más; no existe ninguna
 * ruta que las lleve a la vista del estudiante.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * A 1280 el marco del panel son 1040 px y esta vista es una sola columna: sin
 * tope, cada motivo se estira en una línea de mil píxeles y el ojo pierde el
 * principio del renglón siguiente. 76ch es el ancho de lectura cómodo del
 * resto del sitio; en móvil no hace nada, porque la pantalla ya es más
 * estrecha que eso.
 */
const ANCHO_DE_LECTURA = { maxWidth: "76ch" };

const MARCA = {
  [NIVEL.URGENTE]: NIVEL_MARCA.URGENTE,
  [NIVEL.ATENCION]: NIVEL_MARCA.ATENCION,
  [NIVEL.INFO]: NIVEL_MARCA.INFO,
};

const PALABRA = { [NIVEL.URGENTE]: "Actuar", [NIVEL.ATENCION]: "Mirar", [NIVEL.INFO]: "Saber" };

const nombreDe = (e) => e.full_name?.trim() || e.nickname?.trim() || "Sin nombre";

/* Un botón de texto discreto, el mismo en las dos acciones de cada fila. */
const botonFila = {
  display: "inline-flex", alignItems: "center", minHeight: "44px", padding: "0 10px",
  borderRadius: "10px", background: "transparent", border: "1px solid rgba(248,249,250,0.18)",
  color: FAE.text, cursor: "pointer", fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
};

/* La fila se exporta porque el resumen de la primera pantalla enseña estas
 * mismas, recortadas: dos maquetas distintas para el mismo dato acaban
 * discrepando, y la que discrepa es siempre la que nadie mira. */
/* El color de la inicial por nivel. La marca y la palabra van siempre al lado: el color nunca va solo. */
const COLOR_INICIAL = { [NIVEL.URGENTE]: "#E9C46A", [NIVEL.ATENCION]: "#C39BD3", [NIVEL.INFO]: "#8FB8E8" };

export function FilaRiesgo({ fila, silenciado, onAbrir, onSilenciar, indice = 0 }) {
  const { estudiante: e, principal, todos } = fila;
  return (
    <li
      data-riesgo={e.user_id}
      data-diagnostico={principal.id}
      className="pdv-entra"
      style={{
        "--i": indice, padding: "14px 16px", borderRadius: "18px",
        background: "rgba(248,249,250,0.035)", border: "1px solid rgba(248,249,250,0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        <Inicial nombre={nombreDe(e)} color={COLOR_INICIAL[principal.nivel] ?? "#8FB8E8"} tamano={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="pd1-nombre" style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "16px", fontWeight: 700 }}>
            {nombreDe(e)}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "3px", padding: "2px 9px 2px 7px", borderRadius: "999px", background: "rgba(248,249,250,0.06)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#C9D3DF" }}>
            <MarcaNivel nivel={MARCA[principal.nivel]} />
            {PALABRA[principal.nivel]?.toUpperCase()}
          </span>
        </div>
      </div>

      <p style={{ margin: "12px 0 0", fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 600, color: FAE.text }}>
        {principal.nombre}
      </p>
      <p style={{ ...notaV1, marginTop: "3px" }}>{principal.dice}</p>

      {/* Lo demás que le pasa, sin repetir el principal: dos diagnósticos no son dos filas. */}
      {todos.length > 1 && (
        <p style={{ ...notaV1, marginTop: "4px", fontSize: "12px" }} data-otros>
          También: {todos.slice(1).map((d) => d.nombre.toLowerCase()).join(", ")}.
        </p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
        <button type="button" className="pdv-boton" onClick={() => onAbrir?.(e.user_id)} data-ver={e.user_id}>
          {principal.accion ?? "Ver al estudiante"} <ChevronRight size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="pdv-boton pdv-boton--suave"
          onClick={() => onSilenciar?.(e.user_id, principal.id)}
          data-no-aplica={claveSilencio(e.user_id, principal.id)}
          aria-pressed={silenciado}
        >
          No aplica
        </button>
      </div>
    </li>
  );
}

function CopiarNombres({ riesgo }) {
  const [estado, setEstado] = useState("listo");
  if (riesgo.length === 0) return null;

  const texto = riesgo.map((f) => `${nombreDe(f.estudiante)} — ${f.principal.nombre}. ${f.principal.dice}`).join("\n");

  return (
    <div style={{ marginTop: "10px" }}>
      <button
        type="button"
        className="pdv-boton pdv-boton--suave"
        data-copiar-nombres={riesgo.length}
        onClick={async () => {
          const ok = await copiar(texto);
          setEstado(ok ? "copiado" : "fallo");
          if (ok) setTimeout(() => setEstado("listo"), 2400);
        }}
      >
        <Copy size={15} aria-hidden="true" />
        {estado === "copiado" ? "Copiado" : `Copiar ${riesgo.length === 1 ? "el nombre" : `los ${riesgo.length} nombres`} con su motivo`}
      </button>
      <p aria-live="polite" style={{ ...notaV1, marginTop: "6px", marginBottom: 0 }}>
        {estado === "copiado" ? "Listo: pégalo donde hables con ellos." : estado === "fallo" ? "Este navegador no dejó copiar." : ""}
      </p>
    </div>
  );
}

export default function ListaRiesgo({
  riesgo = [],
  silenciados = [],
  prefs,
  cohorte = [],
  onAbrir,
  onSilenciar,
  onAjustar,
  onVolver,
}) {
  const [ajustes, setAjustes] = useState(false);
  const [huecos, setHuecos] = useState(false);
  const porNombre = new Map(cohorte.map((e) => [e.user_id, nombreDe(e)]));
  const faltan = [...DIAGNOSTICOS_SIN_DATOS, ...REGLAS_SIN_DATOS.map((r) => ({ id: r.titulo, nombre: r.titulo, necesita: r.necesita, porque: r.porque }))];

  return (
    <VistaDocente
      vista="riesgo" data-vista="riesgo" Glifo={Eye} rotulo="Seguimiento" titulo="A quién mirar"
      sub={riesgo.length === 0
        ? "Ahora mismo nadie dispara ninguna señal. Es una buena noticia, no un error."
        : `${riesgo.length} de ${cohorte.length} ${cohorte.length === 1 ? "estudiante" : "estudiantes"}, ordenados por urgencia. Cada uno con lo que le pasa y qué hacer.`}
      onVolver={onVolver}
    >
      <section style={{ marginBottom: "16px" }}>
        {riesgo.length > 0 && (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: "12px", alignItems: "start" }} data-lista-riesgo={riesgo.length}>
            {riesgo.map((f, k) => (
              <FilaRiesgo
                key={f.estudiante.user_id}
                indice={k}
                fila={f}
                silenciado={false}
                onAbrir={onAbrir}
                onSilenciar={onSilenciar}
              />
            ))}
          </ul>
        )}

        <CopiarNombres riesgo={riesgo} />
      </section>

      {/* Lo silenciado, visible y reversible. Esconderlo sería silenciarlo dos veces. */}
      {silenciados.length > 0 && (
        <section style={{ ...tarjetaV1, marginBottom: "12px", ...ANCHO_DE_LECTURA }} data-silenciados={silenciados.length}>
          <h2 style={{ ...tituloBloque, fontSize: "15px" }}>Marcadas como «no aplica» ({silenciados.length})</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {silenciados.map((clave) => {
              const [userId, diagId] = clave.split("|");
              return (
                <li key={clave} style={{ display: "flex", alignItems: "center", gap: "10px", borderTop: "1px solid rgba(248,249,250,0.08)" }}>
                  <span className="pd1-nombre" style={{ flex: 1, fontSize: "13.5px", color: V1.texto2 }}>
                    {porNombre.get(userId) ?? "Estudiante"} · {diagId.replaceAll("-", " ")}
                  </span>
                  <button type="button" className="pd1-toque pd1-foco" style={{ ...botonFila, border: "none" }} onClick={() => onSilenciar?.(userId, diagId)} data-reactivar={clave}>
                    Volver a avisarme
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Los umbrales, aquí y no en otra pantalla: se duda de un umbral delante de su lista. */}
      <section style={{ ...tarjetaV1, marginBottom: "12px", ...ANCHO_DE_LECTURA }}>
        <button
          type="button"
          className="pd1-toque pd1-foco"
          aria-expanded={ajustes}
          onClick={() => setAjustes((v) => !v)}
          data-abrir-ajustes
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", background: "transparent", border: "none", cursor: "pointer", color: FAE.text, textAlign: "left", padding: 0 }}
        >
          <span style={{ fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700 }}>Cuándo quiero que me avise</span>
          <span aria-hidden="true" style={{ color: V1.texto2 }}>{ajustes ? "−" : "+"}</span>
        </button>

        {ajustes && (
          <div style={{ marginTop: "10px" }} data-ajustes>
            <p style={{ ...notaV1, marginBottom: "10px" }}>
              Estos dos cortes los pones tú. Cambian a quién ves en esta lista; no cambian ningún dato ni se los enseñan a nadie más.
            </p>
            {AJUSTABLES.map((a) => (
              <div key={a.id} style={{ marginBottom: "12px" }}>
                <label htmlFor={`pd2-${a.id}`} style={{ display: "block", fontSize: "13px", color: FAE.text, marginBottom: "4px" }}>
                  {a.texto}
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    id={`pd2-${a.id}`}
                    className="pd1-foco"
                    type="range"
                    min={a.min}
                    max={a.max}
                    step="1"
                    value={prefs?.[a.id] ?? a.porDefecto}
                    onChange={(ev) => onAjustar?.(a.id, Number(ev.target.value))}
                    data-ajuste={a.id}
                    style={{ flex: 1, minWidth: 0, accentColor: "var(--tono, #2A9D8F)", minHeight: "44px" }}
                  />
                  <span style={{ flexShrink: 0, minWidth: "64px", textAlign: "right", fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {prefs?.[a.id] ?? a.porDefecto} {a.sufijo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/*
       * LO QUE EL PANEL NO TE ESTÁ DICIENDO.
       *
       * Un panel que oculta sus huecos pide fe, y el profesor que descubre un
       * hueco por su cuenta deja de creerse también lo que sí es cierto. Así
       * que los diagnósticos que hoy no se pueden calcular se declaran, con lo
       * que haría falta para tenerlos.
       */}
      <section style={{ ...tarjetaV1, ...ANCHO_DE_LECTURA }}>
        <button
          type="button"
          className="pd1-toque pd1-foco"
          aria-expanded={huecos}
          onClick={() => setHuecos((v) => !v)}
          data-abrir-huecos
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", background: "transparent", border: "none", cursor: "pointer", color: FAE.text, textAlign: "left", padding: 0 }}
        >
          <span style={{ fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700 }}>Lo que este panel todavía no te dice ({faltan.length})</span>
          <span aria-hidden="true" style={{ color: V1.texto2 }}>{huecos ? "−" : "+"}</span>
        </button>

        {huecos && (
          <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0 }} data-huecos={faltan.length}>
            {faltan.map((d) => (
              <li key={d.id} style={{ padding: "10px 0", borderTop: "1px solid rgba(248,249,250,0.08)" }}>
                <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600, color: FAE.text }}>{d.nombre}</p>
                <p style={{ ...notaV1, marginTop: "2px", fontSize: "12.5px" }}>Haría falta: {d.necesita}.</p>
                <p style={{ ...notaV1, marginTop: "2px", fontSize: "12.5px" }}>{d.porque}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </VistaDocente>
  );
}
