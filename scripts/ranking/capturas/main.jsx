import { createRoot } from "react-dom/client";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";
import RankingFP from "../../../src/components/ranking/RankingFP.jsx";

/*
 * Banco de CAPTURAS del ranking (antes/después del rediseño). Apodos inventados,
 * especies variadas y tu fila fuera del top para ver el «tú» suelto.
 * ?tu=2 te pone en el podio; ?pocos=1 deja solo dos filas.
 */
const q = new URLSearchParams(location.search);
const ESPECIES = ["zorro", "conejo", "gato", "hamster", "perro", "huron"];
const APODOS = ["Valeria M.", "Tomás_R", "Lucía Fernanda Ospina", "Nico", "Daniela Q.", "Andrés Felipe", "Mariana22", "Samuel", "Juliana Restrepo", "Kevin", "Sofi", "Pablo_04"];
const tu = Number(q.get("tu") ?? 12);
let filas = APODOS.map((nickname, i) => ({
  posicion: i + 1, nickname, fp: [5130, 4023, 3757, 3615, 3144, 2980, 2511, 2302, 1980, 1544, 1210, 860][i],
  es_tuyo: i + 1 === tu, mascota_especie: ESPECIES[i % 6],
}));
if (tu > 10) filas = [...filas.slice(0, 10), filas[tu - 1]];
if (q.get("pocos")) filas = filas.slice(0, 2);
const pedir = async () => ({ data: filas, error: null });
const auth = { session: { user: { id: "u" } }, perfil: { nickname: "yo" }, pedirCuenta: () => {} };

createRoot(document.getElementById("raiz")).render(
  <AuthContext.Provider value={auth}>
    <div style={{ padding: "24px 16px", maxWidth: "560px", margin: "0 auto", boxSizing: "border-box" }}>
      <RankingFP subjectId="macroeconomia" titulo="Ranking de Macroeconomía" nota="Solo esta materia" pedir={pedir} />
    </div>
  </AuthContext.Provider>
);
