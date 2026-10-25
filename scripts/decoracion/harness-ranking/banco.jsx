/*
 * EL BANCO DE LAS TABLAS DE POSICIONES.
 *
 * Monta RankingFP y LigaBoard REALES —sin copiarlos ni simplificarlos— dentro
 * de la misma columna que usa TopicIndexView (ancho 100%, tope 560 px), que es
 * la condición que hace aparecer el fallo de #556: el apodo se queda en 0 px
 * cuando el botón de ánimo le disputa el sitio.
 *
 * POR QUÉ EXISTE: `medir-tablas-hanayama.mjs` lo daba por hecho y solo vivía en
 * la copia de Hanayama, así que la medida que sostiene un fallo de producción no
 * se podía repetir desde main. Ahora sí.
 *
 * LO QUE SE FALSIFICA, Y NADA MÁS: la sesión, el perfil y las dos consultas
 * (todas inyectables por diseño de sus componentes). El render, los estilos y
 * la maquetación son los de verdad. `social/animo.js` lo sustituye el propio
 * medidor con un plugin de vite.
 *
 * CASOS, por el hash de la URL: `r:<estado>:<materia>`, `l:<estado>:est`,
 * `p:<estado>:est` (las dos tablas, como en la página).
 *   ranking → sin-sesion · n0 · n1 · n3 · n10 · n10-fuera
 *   liga    → sin-sesion · vacia · sin-niveles · normal · ascenso · ascenso2 · reparto · elite
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";
import RankingFP from "../../../src/components/ranking/RankingFP.jsx";
import LigaBoard from "../../../src/components/ligas/LigaBoard.jsx";

const [tipo = "r", estado = "n10", materia = "conta"] = (location.hash.slice(1) || "r:n10:conta").split(":");
const SUBJECT = { conta: "contabilidad", macro: "macroeconomia", est: "pensamiento-estrategico", general: null }[materia];

/*
 * Apodos de 4 a 20 caracteres, que es el banco con el que Hanayama vio el
 * fallo. El largo va en la fila propia y en una ajena: el caso que importa es
 * el ajeno, porque es el que lleva botón de ánimo.
 */
const APODOS_BASE = ["Ana", "Mariana Villalobos", "Jose", "Kat", "Sebastián Ocampo R", "Luci", "Camilo", "Valentina Restrepo", "Nico", "Dani"];
/*
 * Banco duro, con `?apodos=duros`: lo que rompe un apodo que se parte en vez
 * de cortarse. Una sola palabra larguísima no tiene por dónde partirse, y es
 * el caso que no aparece en una lista de nombres con espacios.
 */
const APODOS_DUROS = ["ElContadorMasRapidoDelOeste", "Ab", "MARIAJOSÉRODRÍGUEZZULUAGA", "x", "Juan Pablo López Ruiz", "深圳会计学生", "a".repeat(40), "Sofía", "AlejandroCastañeda1", "Zoe"];
const APODOS = new URLSearchParams(location.search).get("apodos") === "duros" ? APODOS_DUROS : APODOS_BASE;
const perfilDe = (i) => ({ avatar_shape: "nucleo", avatar_palette: "marea", avatar_level: (i % 4) + 1 });
const filasRanking = (n, tuyoDentro) =>
  Array.from({ length: n }, (_, i) => ({ posicion: i + 1, nickname: APODOS[i % APODOS.length], fp: 980 - i * 37, es_tuyo: tuyoDentro && i === 3, ...perfilDe(i) }));

const SESION = { user: { id: "u-banco" } };
const auth = {
  session: estado === "sin-sesion" ? null : SESION,
  perfil: estado === "sin-sesion" ? null : { nickname: "Valentina Restrepo", ...perfilDe(1) },
  pedirCuenta: () => {},
};

const N = { n0: 0, n1: 1, n3: 3, n10: 10, "n10-fuera": 10, "sin-sesion": 10 }[estado] ?? 10;
const pedir = async () => ({ data: filasRanking(N, estado !== "n10-fuera"), error: null });

const LIGA = {
  vacia: [], "sin-sesion": [],
  normal: 5, "sin-niveles": 5, ascenso: 5, ascenso2: 5, reparto: 5, elite: 5,
};
const filasLiga = () => {
  const n = LIGA[estado];
  if (Array.isArray(n)) return [];
  return Array.from({ length: n }, (_, i) => ({
    nickname: APODOS[i % APODOS.length], fp: 1200 - i * 90, es_tuyo: i === 2,
    en_podio: i < 3, tam_liga: 24, liga: estado === "elite" ? 1 : 3, ...perfilDe(i),
  }));
};
const cargarTablero = async () => ({ filas: filasLiga(), error: null });
const cargarContexto = async () => ({
  contexto: estado === "sin-niveles"
    ? { totalNiveles: 0, ligaAnterior: null, nivelesAnterior: null, transicion: null, activosReparto: null }
    : {
        totalNiveles: 4, ligaAnterior: estado.startsWith("ascenso") ? 4 : 3, nivelesAnterior: 4,
        transicion: estado === "ascenso" ? "sube" : estado === "ascenso2" ? "baja" : null,
        activosReparto: estado === "reparto" ? 18 : null,
      },
});

/* La columna de TopicIndexView, copiada de su JSX: es la que estrecha las filas. */
const COLUMNA = { width: "100%", maxWidth: "560px", display: "flex", flexDirection: "column", gap: "16px" };

createRoot(document.getElementById("raiz")).render(
  <StrictMode>
    <AuthContext.Provider value={auth}>
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", padding: "16px 24px" /* el 24 px horizontal es el de TopicIndexView, línea 70 */ }}>
        <div data-columna style={COLUMNA}>
          {(tipo === "l" || tipo === "p") && <LigaBoard subjectId="pensamiento-estrategico" cargarTablero={cargarTablero} cargarContexto={cargarContexto} />}
          {(tipo === "r" || tipo === "p") && <RankingFP subjectId={SUBJECT} titulo={SUBJECT ? `Ranking de ${materia}` : "Ranking general"} nota={SUBJECT ? "Solo esta materia" : "Todas las materias"} pedir={pedir} />}
        </div>
      </div>
    </AuthContext.Provider>
  </StrictMode>
);
