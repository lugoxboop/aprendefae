import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { FAE } from "../../theme.js";
import { NIVEL } from "../../docente/alertas.js";
import { PALABRA_RIESGO, ordenEstudiantes } from "../../docente/panelV1.js";
import MarcaNivel, { NIVEL_MARCA } from "./MarcaNivel.jsx";
import { V1, tituloBloque, notaV1, volverV1 } from "./estiloV1.js";

/*
 * «Mis estudiantes» (Ukyo §6.2): la lista entera, en su propia vista. Cada
 * fila, dos datos: el nombre y la última vez, con la marca de nivel. Lo demás
 * (FP, acierto, el botón de grupo) vive en el detalle, a un toque. Búsqueda
 * en el cliente y 25 filas por página.
 */

export const POR_PAGINA = 25;

const MARCA = { [NIVEL.URGENTE]: NIVEL_MARCA.URGENTE, [NIVEL.ATENCION]: NIVEL_MARCA.ATENCION, [NIVEL.INFO]: NIVEL_MARCA.INFO };

export function hace(dias) {
  if (dias === null || dias === undefined) return "—";
  if (dias === 0) return "hoy";
  if (dias === 1) return "ayer";
  return `hace ${dias} d`;
}

export default function ListaEstudiantes({ estudiantes, atencion, notaCohorte, onAbrir, onVolver }) {
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const nivelDe = useMemo(() => new Map(atencion.map((a) => [a.estudiante.user_id, a.nivel])), [atencion]);
  const ordenados = useMemo(() => ordenEstudiantes(estudiantes, atencion), [estudiantes, atencion]);
  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return ordenados.filter((e) => !q || `${e.full_name ?? ""} ${e.nickname}`.toLowerCase().includes(q));
  }, [ordenados, busqueda]);
  const mostrados = visibles.slice(0, pagina * POR_PAGINA);

  return (
    <section data-vista="estudiantes" aria-labelledby="pd1-estudiantes">
      <button type="button" style={volverV1} onClick={onVolver} data-volver>‹ Volver al resumen</button>
      <h2 id="pd1-estudiantes" style={{ ...tituloBloque, fontSize: "18px" }}>Mis estudiantes</h2>
      <input
        type="search"
        value={busqueda}
        onChange={(ev) => { setBusqueda(ev.target.value); setPagina(1); }}
        placeholder="Buscar por nombre o apodo"
        aria-label="Buscar por nombre o apodo"
        style={{
          width: "100%", minHeight: "44px", padding: "0 14px", borderRadius: "10px", marginBottom: "12px",
          background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.16)",
          color: FAE.text, fontFamily: "Inter, sans-serif", fontSize: "14px", boxSizing: "border-box",
        }}
      />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", padding: "0 12px 6px", fontSize: "12px", color: V1.texto2 }} aria-hidden="true">
        <span>Nombre</span><span style={{ paddingRight: "26px" }}>Última vez</span>
      </div>
      <div style={{ display: "grid", gap: "8px" }}>
        {mostrados.map((e) => {
          const nivel = nivelDe.get(e.user_id) ?? null;
          const nombre = e.full_name || e.nickname;
          return (
            <button
              key={e.user_id}
              type="button"
              onClick={() => onAbrir(e.user_id)}
              data-estudiante={e.user_id}
              aria-label={`${nombre}${nivel ? `, riesgo ${PALABRA_RIESGO[nivel].toLowerCase()}` : ""}${e.es_prueba ? ", cuenta de prueba" : ""}, última vez ${hace(e.dias_inactivo)}. Ver detalle`}
              title={nombre}
              style={{
                display: "grid", gridTemplateColumns: "auto minmax(0,1fr) auto auto", alignItems: "center", gap: "10px",
                width: "100%", minHeight: "48px", padding: "6px 12px", borderRadius: "10px", textAlign: "left",
                background: V1.tarjeta, border: V1.borde, color: "inherit", cursor: "pointer", font: "inherit",
              }}
            >
              <MarcaNivel nivel={nivel ? MARCA[nivel] : NIVEL_MARCA.NINGUNO} tamano={12} />
              <span style={{ display: "grid", minWidth: 0 }}>
                <span className="pd1-nombre" style={{ fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600, color: FAE.text }}>{nombre}</span>
                {e.es_prueba && <span style={{ fontSize: "12px", color: V1.texto2 }}>cuenta de prueba · fuera de los promedios</span>}
              </span>
              <span style={{ fontFamily: "Sora, sans-serif", fontSize: "14px", fontVariantNumeric: "tabular-nums", color: FAE.text, whiteSpace: "nowrap" }} data-cifra="ultima-vez">
                {hace(e.dias_inactivo)}
              </span>
              <ChevronRight size={16} aria-hidden="true" color={V1.texto2} />
            </button>
          );
        })}
        {visibles.length === 0 && <p style={notaV1}>Ningún estudiante coincide con esa búsqueda.</p>}
      </div>
      {visibles.length > mostrados.length && (
        <button type="button" style={{ ...volverV1, marginTop: "12px" }} onClick={() => setPagina((n) => n + 1)} data-ver-mas>
          Ver más ({visibles.length - mostrados.length})
        </button>
      )}
      {/* Ukyo §8: el párrafo de cohorte y de cuentas de prueba, al pie y en gris. */}
      <p style={{ ...notaV1, marginTop: "16px" }} data-nota-cohorte>{notaCohorte}</p>
    </section>
  );
}
