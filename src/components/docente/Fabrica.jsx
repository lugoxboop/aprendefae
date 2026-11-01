import { useEffect, useRef, useState } from "react";
import { FAE } from "../../theme.js";
import { supabase } from "../../lib/supabase.js";
import { V1, tarjetaV1, tituloBloque, notaV1, volverV1 } from "./estiloV1.js";
import {
  MAX_ARCHIVOS, revisar, formatearPeso, encargar, misBorradores, cambiarEstado,
} from "../../docente/fabrica.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA FÁBRICA — el profesor crea sus propias actividades
 *
 * Encargo de Mateo (1-nov). El profesor sube su material, escribe qué quiere,
 * y el sitio le devuelve actividades hechas con el molde de «Aprender».
 *
 * ═══════════ POR QUÉ NO ES UN CHAT ═══════════
 *
 * Mateo lo pensó primero como un chatbot. Un chat es la forma correcta cuando
 * no se sabe de antemano qué se va a pedir; aquí se sabe: hay un material, un
 * encargo y un resultado. Un campo, un botón y una lista hacen el mismo
 * trabajo sin enseñarle a nadie a conversar con una máquina, y sin que el
 * profesor tenga que adivinar qué decir para que salga bien.
 *
 * Se puede escribir, adjuntar, o las dos cosas. Lo único que no se puede es
 * mandar el encargo vacío.
 *
 * ═══════════ LO QUE SALE SON BORRADORES ═══════════
 *
 * Nada de esto llega a un estudiante solo. Quedan en esta pantalla hasta que
 * el profesor los lee y los publica, que es la misma regla con la que Duolingo
 * genera ejercicios: la máquina propone, el experto elige. Aquí el experto es
 * él, que además conoce a su curso.
 *
 * ═══════════ EL ARCHIVO NO SE GUARDA ═══════════
 *
 * Va en la petición, el modelo lo lee y se descarta. Se le dice en pantalla,
 * porque subir el capítulo de un libro a un sitio ajeno es justo la clase de
 * cosa sobre la que un profesor tiene derecho a saber qué pasa.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Lo que tarda de verdad: un PDF entero y tres actividades no son instantáneos. */
const AVISO_ESPERA = "Esto tarda hasta un minuto. Puedes dejar la pestaña abierta.";

const campo = {
  width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: "110px",
  padding: "12px 14px", borderRadius: "14px",
  background: "rgba(10,20,34,0.45)", border: `1px solid ${V1.borde ?? "rgba(248,249,250,0.16)"}`,
  color: FAE.text, fontFamily: "Inter, sans-serif", fontSize: "16px", lineHeight: 1.5,
};

const boton = (activo) => ({
  minHeight: "44px", padding: "0 22px", borderRadius: "999px", border: "none",
  background: activo ? FAE.teal : "rgba(248,249,250,0.10)",
  color: activo ? "#06202A" : "rgba(248,249,250,0.62)",
  fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 700,
  cursor: activo ? "pointer" : "not-allowed",
});

export default function Fabrica({ materia, nombreMateria, onVolver }) {
  const [mensaje, setMensaje] = useState("");
  const [archivos, setArchivos] = useState([]);
  const [trabajando, setTrabajando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [borradores, setBorradores] = useState([]);
  const [abierto, setAbierto] = useState(null);
  const entrada = useRef(null);

  const cargar = async () => {
    const r = await misBorradores(supabase, materia);
    if (r.ok) setBorradores(r.borradores);
  };

  useEffect(() => { cargar(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [materia]);

  const elegirArchivos = (lista) => {
    const malo = revisar(lista);
    if (malo) { setAviso({ tipo: "error", texto: malo }); return; }
    setAviso(null);
    setArchivos(Array.from(lista));
  };

  const quitar = (i) => setArchivos((a) => a.filter((_, k) => k !== i));

  const enviar = async () => {
    if (trabajando) return;
    setTrabajando(true);
    setAviso({ tipo: "espera", texto: AVISO_ESPERA });
    const r = await encargar(supabase, { materia, mensaje, archivos });
    setTrabajando(false);
    if (!r.ok) { setAviso({ tipo: "error", texto: r.motivo }); return; }
    setAviso({
      tipo: "bien",
      texto: r.creadas === 1 ? "Lista una actividad. Léela antes de publicarla." : `Listas ${r.creadas} actividades. Léelas antes de publicarlas.`,
    });
    setMensaje("");
    setArchivos([]);
    if (entrada.current) entrada.current.value = "";
    await cargar();
  };

  const marcar = async (id, estado) => {
    const r = await cambiarEstado(supabase, id, estado);
    if (r.ok) { setAbierto(null); await cargar(); }
  };

  const puede = Boolean(mensaje.trim() || archivos.length) && !trabajando;

  return (
    <section data-vista="fabrica">
      <button type="button" style={volverV1} onClick={onVolver} data-volver>‹ Volver al resumen</button>

      <section style={{ ...tarjetaV1, marginBottom: "22px" }} data-fabrica-encargo>
        <h2 style={{ ...tituloBloque, fontSize: "16px" }}>Crear actividades desde tu material</h2>
        <p style={{ ...notaV1, marginBottom: "16px" }}>
          Sube el capítulo o el tema y dime qué quieres que salga. Te dejo tres borradores
          de <strong style={{ color: FAE.text }}>{nombreMateria || materia}</strong> para que los leas
          y publiques los que sirvan. <strong style={{ color: FAE.text }}>Tu archivo no se guarda</strong>:
          se usa para crearlas y se descarta.
        </p>

        <label htmlFor="fabrica-mensaje" style={{ ...notaV1, display: "block", marginBottom: "6px", color: FAE.text, fontWeight: 600 }}>
          Qué quieres que haga
        </label>
        <textarea
          id="fabrica-mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value.slice(0, 4000))}
          placeholder="Por ejemplo: del capítulo 3, tres actividades sobre causación, con ejemplos en pesos. O: explica la diferencia entre gasto y pago, que ahí se enredan todos."
          style={campo}
        />

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginTop: "14px" }}>
          <input
            ref={entrada}
            id="fabrica-archivos"
            type="file"
            multiple
            accept=".pdf,.txt,.md,.csv,application/pdf,text/plain,text/markdown,text/csv"
            onChange={(e) => elegirArchivos(e.target.files)}
            style={{ display: "none" }}
          />
          <label
            htmlFor="fabrica-archivos"
            style={{
              display: "inline-flex", alignItems: "center", minHeight: "44px", padding: "0 18px",
              borderRadius: "999px", background: "transparent", border: "1px solid rgba(248,249,250,0.28)",
              color: FAE.text, fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600, cursor: "pointer",
            }}
          >
            Adjuntar archivo
          </label>
          <span style={{ ...notaV1, fontSize: "12.5px" }}>PDF o texto · hasta {MAX_ARCHIVOS} · 8 MB cada uno</span>
        </div>

        {archivos.length > 0 && (
          <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "grid", gap: "6px" }}>
            {archivos.map((a, i) => (
              <li key={`${a.name}-${i}`} style={{
                display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px",
                borderRadius: "12px", background: "rgba(248,249,250,0.05)", fontSize: "13px",
              }}>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
                <span style={{ color: V1.texto2, fontSize: "12px" }}>{formatearPeso(a.size)}</span>
                <button
                  type="button"
                  onClick={() => quitar(i)}
                  aria-label={`Quitar ${a.name}`}
                  style={{
                    minWidth: "44px", minHeight: "44px", background: "transparent", border: "none",
                    color: "rgba(248,249,250,0.6)", cursor: "pointer", fontSize: "18px", lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "18px", flexWrap: "wrap" }}>
          <button type="button" onClick={enviar} disabled={!puede} style={boton(puede)} data-crear>
            {trabajando ? "Creando…" : "Crear actividades"}
          </button>
          {aviso && (
            <p
              role={aviso.tipo === "error" ? "alert" : "status"}
              style={{
                margin: 0, fontSize: "13px", lineHeight: 1.45,
                color: aviso.tipo === "error" ? FAE.coral : aviso.tipo === "bien" ? FAE.node : V1.texto2,
              }}
            >
              {aviso.texto}
            </p>
          )}
        </div>
      </section>

      <h2 style={{ ...tituloBloque, fontSize: "15px" }}>
        Tus borradores {borradores.length > 0 && <span style={{ color: V1.texto2, fontWeight: 400 }}>({borradores.length})</span>}
      </h2>

      {borradores.length === 0 ? (
        <p style={{ ...notaV1, marginBottom: "28px" }}>
          Todavía no hay ninguno. Lo que crees aquí aparece en esta lista y no lo ve nadie más hasta que lo publiques.
        </p>
      ) : (
        <ul style={{ listStyle: "none", margin: "0 0 28px", padding: 0, display: "grid", gap: "10px" }}>
          {borradores.map((b) => (
            <li key={b.id} style={{ ...tarjetaV1, marginBottom: 0, padding: "14px 16px" }} data-borrador={b.id}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                  <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 700, color: FAE.text }}>
                    {b.titulo}
                  </p>
                  <p style={{ ...notaV1, marginTop: "3px", fontSize: "12.5px" }}>
                    {b.estado === "publicada" ? "Publicada" : "Borrador"}
                    {b.pieza?.nombres ? ` · ${b.pieza.nombres.length} términos` : ""}
                    {b.pieza?.pasos ? ` · ${b.pieza.pasos.length} pasos` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAbierto(abierto === b.id ? null : b.id)}
                  style={{
                    minHeight: "44px", padding: "0 16px", borderRadius: "999px", cursor: "pointer",
                    background: "transparent", border: "1px solid rgba(248,249,250,0.26)",
                    color: FAE.text, fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600,
                  }}
                  data-leer
                >
                  {abierto === b.id ? "Cerrar" : "Leer"}
                </button>
              </div>

              {abierto === b.id && <Vista pieza={b.pieza} encargo={b.encargo} />}

              {abierto === b.id && (
                <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
                  {b.estado !== "publicada" && (
                    <button type="button" onClick={() => marcar(b.id, "publicada")} style={boton(true)} data-publicar>
                      Publicar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => marcar(b.id, "descartada")}
                    style={{
                      minHeight: "44px", padding: "0 18px", borderRadius: "999px", cursor: "pointer",
                      background: "transparent", border: "1px solid rgba(231,111,81,0.5)",
                      color: FAE.text, fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600,
                    }}
                    data-descartar
                  >
                    Descartar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* La actividad tal cual quedó, para leerla entera antes de decidir. */
function Vista({ pieza, encargo }) {
  if (!pieza) return null;
  const termino = (i) => pieza.nombres?.[i]?.termino ?? null;

  return (
    <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid rgba(248,249,250,0.12)" }} data-vista-borrador>
      {encargo && (
        <p style={{ ...notaV1, fontSize: "12.5px", fontStyle: "italic", marginBottom: "12px" }}>
          Lo pediste así: «{encargo}»
        </p>
      )}
      {pieza.objetivo && (
        <p style={{ ...notaV1, marginBottom: "12px", color: FAE.node }}>{pieza.objetivo}</p>
      )}

      <p style={{ margin: "0 0 6px", fontSize: "12px", letterSpacing: "0.06em", color: V1.texto2 }}>TÉRMINOS</p>
      <ul style={{ margin: "0 0 14px", paddingLeft: "18px", display: "grid", gap: "4px" }}>
        {(pieza.nombres ?? []).map((n, i) => (
          <li key={i} style={{ fontSize: "13.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.85)" }}>
            <strong style={{ color: FAE.text }}>{n.termino}:</strong> {n.definicion}
          </li>
        ))}
      </ul>

      <p style={{ margin: "0 0 6px", fontSize: "12px", letterSpacing: "0.06em", color: V1.texto2 }}>PASOS</p>
      <ol style={{ margin: "0 0 14px", paddingLeft: "18px", display: "grid", gap: "6px" }}>
        {(pieza.pasos ?? []).map((p, i) => (
          <li key={i} style={{ fontSize: "13.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.85)" }}>
            {p.texto}
            {termino(p.resaltar) && (
              <span style={{ color: V1.texto2, fontSize: "12px" }}> — enciende «{termino(p.resaltar)}»</span>
            )}
          </li>
        ))}
      </ol>

      <p style={{ margin: "0 0 6px", fontSize: "12px", letterSpacing: "0.06em", color: V1.texto2 }}>PREGUNTA FINAL</p>
      <p style={{ margin: "0 0 8px", fontSize: "14px", lineHeight: 1.5, color: FAE.text, fontWeight: 600 }}>{pieza.pregunta}</p>
      {pieza.respuesta && (
        <p style={{
          margin: 0, padding: "10px 12px", borderRadius: "12px", fontSize: "13.5px", lineHeight: 1.55,
          color: "rgba(248,249,250,0.85)", background: "rgba(42,157,143,0.08)", borderLeft: `3px solid ${FAE.teal}`,
        }}>
          {pieza.respuesta}
        </p>
      )}
    </div>
  );
}
