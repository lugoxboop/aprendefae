import { useMemo, useState } from "react";
import { ChevronRight, Users } from "lucide-react";
import { FAE } from "../../theme.js";
import { NIVEL } from "../../docente/alertas.js";
import { PALABRA_RIESGO, ordenEstudiantes } from "../../docente/panelV1.js";
import MarcaNivel, { NIVEL_MARCA } from "./MarcaNivel.jsx";
import { V1, notaV1 } from "./estiloV1.js";
import VistaDocente, { Inicial } from "./VistaDocente.jsx";

/*
 * «Mis estudiantes» (Ukyo §6.2): la lista entera, en su propia vista. Cada
 * fila, dos datos: el nombre y la última vez, con la marca de nivel. Lo demás
 * (FP, acierto, el botón de grupo) vive en el detalle, a un toque. Búsqueda
 * en el cliente y 25 filas por página.
 */

export const POR_PAGINA = 25;

const COLOR_NIVEL = { [NIVEL.URGENTE]: "#E9C46A", [NIVEL.ATENCION]: "#C39BD3", [NIVEL.INFO]: "#8FB8E8" };
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
    <VistaDocente
      vista="estudiantes" data-vista="estudiantes" aria-labelledby="pd1-estudiantes"
      Glifo={Users} rotulo="Tu grupo" titulo="Mis estudiantes" tituloId="pd1-estudiantes"
      sub={`${estudiantes.length} ${estudiantes.length === 1 ? "estudiante" : "estudiantes"}. Primero quien más necesita que lo mires; toca un nombre para ver su ficha.`}
      onVolver={onVolver}
    >
      <input
        type="search"
        className="pdv-buscar"
        value={busqueda}
        onChange={(ev) => { setBusqueda(ev.target.value); setPagina(1); }}
        placeholder="Buscar por nombre o apodo"
        aria-label="Buscar por nombre o apodo"
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: "8px" }}>
        {mostrados.map((e, k) => {
          const nivel = nivelDe.get(e.user_id) ?? null;
          const nombre = e.full_name || e.nickname;
          return (
            <button
              key={e.user_id}
              type="button"
              className="pdv-fila pdv-entra"
              onClick={() => onAbrir(e.user_id)}
              data-estudiante={e.user_id}
              aria-label={`${nombre}${nivel ? `, riesgo ${PALABRA_RIESGO[nivel].toLowerCase()}` : ""}${e.es_prueba ? ", cuenta de prueba" : ""}, última vez ${hace(e.dias_inactivo)}. Ver detalle`}
              title={nombre}
              style={{ "--i": k }}
            >
              <Inicial nombre={nombre} color={nivel ? COLOR_NIVEL[nivel] : "rgba(var(--tono-rgb), 0.85)"} tamano={38} />
              <span style={{ display: "grid", flex: 1, minWidth: 0 }}>
                <span className="pd1-nombre" style={{ fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 600, color: FAE.text }}>{nombre}</span>
                {e.es_prueba
                  ? <span style={{ fontSize: "12px", color: V1.texto2 }}>cuenta de prueba · fuera de los promedios</span>
                  : nivel && <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: V1.texto2 }}><MarcaNivel nivel={MARCA[nivel]} tamano={10} />Riesgo {PALABRA_RIESGO[nivel].toLowerCase()}</span>}
              </span>
              <span style={{ flexShrink: 0, padding: "4px 10px", borderRadius: "999px", background: "rgba(248,249,250,0.06)", fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: FAE.text, whiteSpace: "nowrap" }} data-cifra="ultima-vez">
                {hace(e.dias_inactivo)}
              </span>
              <ChevronRight className="pdv-fila__flecha" size={16} aria-hidden="true" />
            </button>
          );
        })}
        {visibles.length === 0 && <p style={notaV1}>Ningún estudiante coincide con esa búsqueda.</p>}
      </div>
      {visibles.length > mostrados.length && (
        <button type="button" className="pdv-boton pdv-boton--suave" style={{ marginTop: "14px" }} onClick={() => setPagina((n) => n + 1)} data-ver-mas>
          Ver más ({visibles.length - mostrados.length})
        </button>
      )}
      {/* Ukyo §8: el párrafo de cohorte y de cuentas de prueba, al pie y en gris. */}
      <p style={{ ...notaV1, marginTop: "16px" }} data-nota-cohorte>{notaCohorte}</p>
    </VistaDocente>
  );
}
