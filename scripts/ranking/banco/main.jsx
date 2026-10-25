import { createRoot } from "react-dom/client";
import { AuthContext } from "../../../src/auth/AuthProvider.jsx";
import RankingFP from "../../../src/components/ranking/RankingFP.jsx";
import LigaBoard from "../../../src/components/ligas/LigaBoard.jsx";

/*
 * Banco de medida del RankingFP (#556). Lo monta en la misma columna que el
 * índice de materia (padding 24 a cada lado, tope de 560) con sesión fingida
 * y diez filas de apodos de 4 a 20 caracteres. Lo usa scripts/ranking/medir.mjs.
 */
const APODOS = ["Ana", "Luis", "Mariana", "Santiago22", "ValentinaRojas", "Sebastián Gómez", "Isabella_Martínez", "AlejandroCastañeda1", "Camila", "Juan Pablo López Ruiz"];
const filas = APODOS.map((nickname, i) => ({ posicion: i + 1, nickname, fp: 4280 - i * 377, es_tuyo: i === 4, forma: 0, paleta: 0, nivel: 1 }));
const pedir = async () => ({ data: filas, error: null });
const PODIO = ["ElContadorMasRapidoDelOeste", "MARIAJOSÉRODRÍGUEZZULUAGA", "Ab"];
const filasLiga = [
  ...PODIO.map((nickname, i) => ({ liga: 1, total_ligas: 1, tam_liga: 17, corte_podio: 3, posicion: i + 1, nickname, fp: 300 - i * 40, es_tuyo: false, en_podio: true })),
  ...Array.from({ length: 14 }, (_, i) => ({ liga: 1, total_ligas: 1, tam_liga: 17, corte_podio: 3, posicion: 4 + i, nickname: `otro_${i}`, fp: 100 - i, es_tuyo: i === 5, en_podio: false })),
];
const cargarTablero = async () => ({ filas: filasLiga, error: null });
const cargarContexto = async () => ({ contexto: { totalNiveles: 1, ligaAnterior: null, nivelesAnterior: null, transicion: null, activosReparto: null }, error: null });
const auth = { session: { user: { id: "u" } }, perfil: { nickname: "ValentinaRojas" }, pedirCuenta: () => {} };

createRoot(document.getElementById("raiz")).render(
  <AuthContext.Provider value={auth}>
    <div data-columna style={{ padding: "24px", maxWidth: "560px", boxSizing: "border-box" }}>
      <RankingFP subjectId="contabilidad" titulo="Ranking de Contabilidad" nota="Solo esta materia" pedir={pedir} />
      {/* La liga (#570): solo existe en Estratégico. Podio de 3 con los apodos duros de Ukyo, el tuyo fuera. */}
      <div style={{ height: "16px" }} />
      <LigaBoard subjectId="pensamiento-estrategico" cargarTablero={cargarTablero} cargarContexto={cargarContexto} />
    </div>
  </AuthContext.Provider>
);
