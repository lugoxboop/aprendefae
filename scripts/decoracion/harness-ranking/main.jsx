/*
 * Banco de las tablas de posiciones (decoración, zonas-hanayama.md v3). Lo usa
 * scripts/decoracion/medir-tablas-hanayama.mjs con sus CASOS en el hash:
 *
 *   #r:<estado>:<materia>   RankingFP     estado: sin-sesion · n0 · n1 · n3 · n10 · n10-fuera
 *                                        materia: conta · macro · est · general (el del perfil)
 *   #l:<estado>:est         LigaBoard     estado: sin-sesion · vacia · sin-niveles · normal ·
 *                                        ascenso · ascenso2 · reparto · elite
 *   #p:<n10|n3>:est         el índice de Estratégico: la liga y el ranking juntos
 *   #v:<n10|n3>:<materia>   la pantalla real del índice de la materia (conta · macro · est), con
 *                           su fondo. Necesita el sustituto de src/lib/supabase.js que pone
 *                           scripts/decoracion/medir-decoracion.mjs: lee window.__RPC
 *
 * Con ?banda=1 las tablas reciben `decoracion` como se la pasan las vistas
 * (TopicIndexView y PerfilView); sin él, se montan como antes. Datos al tope
 * real: apodos de 20 caracteres (0001_profiles.sql), FP de cinco cifras, tú en
 * el 127, una liga de 17 con 3 en el podio y tú en el 14.
 */
import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "../../../src/styles/global.css";
import RankingFP from "../../../src/components/ranking/RankingFP.jsx";
import LigaBoard from "../../../src/components/ligas/LigaBoard.jsx";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";
import { decoracionDe } from "../../../src/data/decoracionTablas.js";

const [tipo, estado, materia] = location.hash.slice(1).split(":");
const BANDA = new URLSearchParams(location.search).has("banda");
const SUBJECT = { conta: "contabilidad", macro: "macroeconomia", est: "pensamiento-estrategico", general: null };
const NOMBRE = { conta: "Contabilidad", macro: "Macroeconomía", est: "Pensamiento Estratégico" };

/* 20 caracteres, el tope del esquema. */
const apodo = (n) => `estudiante_largo_${String(n).padStart(3, "0")}`.slice(0, 20);
const fila = (posicion, es_tuyo = false) => ({
  posicion, nickname: es_tuyo ? "mi_apodo_es_largo_20" : apodo(posicion), fp: 99_999 - posicion * 731, es_tuyo,
  avatar_shape: null, avatar_palette: null, avatar_level: (posicion % 4) + 1,
});
const RANKING = {
  n0: [],
  n1: [fila(1, true)],
  n3: [fila(1), fila(2, true), fila(3)],
  n10: Array.from({ length: 10 }, (_, i) => fila(i + 1, i === 5)),
  "n10-fuera": [...Array.from({ length: 10 }, (_, i) => fila(i + 1)), fila(127, true)],
};
const filaLiga = (posicion, es_tuyo, en_podio, liga) => ({ ...fila(posicion, es_tuyo), liga, total_ligas: 3, tam_liga: 17, en_podio });
const LIGA_FILAS = (liga, tuPodio = false) => [
  filaLiga(1, tuPodio, true, liga), filaLiga(2, false, true, liga), filaLiga(3, false, true, liga),
  ...(tuPodio ? [] : [filaLiga(14, true, false, liga)]),
];
const LIGA = {
  "sin-sesion": { filas: [], ctx: {} },
  vacia: { filas: [], ctx: { total_ligas: 3 } },
  "sin-niveles": { filas: LIGA_FILAS(1), ctx: { total_ligas: 1 } },
  normal: { filas: LIGA_FILAS(2), ctx: { total_ligas: 3, liga_anterior: 2 } },
  ascenso: { filas: LIGA_FILAS(2), ctx: { total_ligas: 3, liga_anterior: 1 } },
  ascenso2: { filas: LIGA_FILAS(2, true), ctx: { total_ligas: 3, liga_anterior: 1 } },
  reparto: { filas: LIGA_FILAS(2), ctx: { total_ligas: 3, transicion: "reparto", activos_reparto: 128 } },
  elite: { filas: LIGA_FILAS(3), ctx: { total_ligas: 3, transicion: "elite" } },
};

const pedir = (filas) => async () => ({ data: filas, error: null });
const sesion = estado === "sin-sesion" ? null : { user: { id: "u" } };
const liga = (e) => ({
  cargarTablero: async () => ({ filas: LIGA[e]?.filas ?? LIGA_FILAS(2), error: null }),
  cargarContexto: async () => {
    const c = LIGA[e]?.ctx ?? { total_ligas: 3 };
    return { contexto: { totalNiveles: c.total_ligas ?? 0, ligaAnterior: c.liga_anterior ?? null, nivelesAnterior: null, transicion: c.transicion ?? null, activosReparto: c.activos_reparto ?? null }, error: null };
  },
});

function Columna({ ancho, children }) {
  return <div data-columna style={{ width: "100%", maxWidth: `${ancho}px`, margin: "16px auto", padding: "0 24px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "16px" }}>{children}</div>;
}

const VISTA = {
  conta: lazy(() => import("../../../src/components/ContabilidadTopicIndex.jsx")),
  macro: lazy(() => import("../../../src/components/MacroTopicIndex.jsx")),
  est: lazy(() => import("../../../src/components/EstrategiaTopicIndex.jsx")),
};

let contenido;
if (tipo === "v") {
  /* Las respuestas de las funciones que llaman las tablas (las lee el sustituto de supabase). */
  window.__RPC = {
    ranking_fp: RANKING[estado] ?? RANKING.n10,
    liga_tablero: LIGA_FILAS(2),
    liga_contexto: [{ total_ligas: 3, liga_anterior: 2 }],
  };
  const Vista = VISTA[materia];
  contenido = <Suspense fallback={null}><Vista onOpenTopic={() => {}} /></Suspense>;
} else if (tipo === "r") {
  const sid = SUBJECT[materia];
  const general = materia === "general";
  contenido = (
    <Columna ancho={general ? 680 : 560}>
      <RankingFP
        subjectId={sid}
        titulo={general ? "Ranking general" : `Ranking de ${NOMBRE[materia]}`}
        nota={general ? "Todas las materias" : "Solo esta materia"}
        pedir={pedir(RANKING[estado] ?? [])}
        decoracion={BANDA ? decoracionDe(general ? "general" : sid) : null}
      />
    </Columna>
  );
} else if (tipo === "l") {
  contenido = (
    <Columna ancho={560}>
      <LigaBoard subjectId="pensamiento-estrategico" {...liga(estado)} decoracion={BANDA ? decoracionDe("pensamiento-estrategico") : null} />
    </Columna>
  );
} else {
  const sid = "pensamiento-estrategico";
  /* El índice de Estratégico: como TopicIndexView, una sola banda en bucle y una sola Fae (la de la liga). */
  contenido = (
    <Columna ancho={560}>
      <LigaBoard subjectId={sid} {...liga("normal")} decoracion={BANDA ? decoracionDe(sid) : null} />
      <RankingFP subjectId={sid} titulo={`Ranking de ${NOMBRE.est}`} nota="Solo esta materia" pedir={pedir(RANKING[estado] ?? [])}
        decoracion={BANDA ? decoracionDe(sid, { bucle: false, fae: false }) : null} />
    </Columna>
  );
}

createRoot(document.getElementById("root")).render(
  <AuthContext.Provider value={{ session: sesion, usuario: sesion ? { id: "u" } : null, perfil: sesion ? { nickname: "mi_apodo_es_largo_20" } : null, pedirCuenta: () => {} }}>
    {contenido}
  </AuthContext.Provider>,
);
