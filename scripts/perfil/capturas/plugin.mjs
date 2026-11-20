/* Los datos fingidos del banco de «Tu perfil»: logros, resumen, ánimos, ranking y acceso docente. */
const GANADAS = ["primera-leccion", "primer-avance", "primer-quiz", "liga-union", "racha-3", "racha-7", "quiz-perfecto", "liga-top10", "liga-top3"];
const APODOS = ["Ana", "Luis", "Mariana", "Santiago22", "Mateo", "Sebastián Gómez", "Isabella_Martínez", "Camila", "Juan Pablo", "Sofi"];
const STUBS = {
  "/src/medallas/logros.js": `import { MEDALLAS } from "../data/medallas.js";
    export async function cargarLogros(){ return { ganadas: new Set(${JSON.stringify(GANADAS)}), disponible: true }; }
    export function conEstado(g){ return MEDALLAS.map((m)=>({ ...m, ganable: m.disparador==="activo", obtenida: g.has(m.id) })); }`,
  "/src/social/animo.js": `export async function animosRecibidos(){return 4;} export async function estadoDeAnimos(){return {};} export async function darAnimo(){return {};}`,
  "/src/resumen/resumen.js": `export async function cargarResumen(){ return { hay:true, cerrado:false, fpTotal:1840, rachaMaxima:9, temasHechos:3, temasTotal:12, actividadesDistintas:14,
    materias:[{id:"contabilidad",nombre:"Contabilidad",fp:1240,actividades:10,temasHechos:2,temasTotal:7,liga:null,posicion:null,totalLigas:null,cicloFinal:null},
    {id:"macroeconomia",nombre:"Macroeconomía",fp:600,actividades:4,temasHechos:1,temasTotal:5,liga:null,posicion:null,totalLigas:null,cicloFinal:null}], materiaPrincipal:"contabilidad" }; }`,
  "/src/docente/useAccesoDocente.js": `export function useAccesoDocente(){return {esDocente:false};}`,
};
export const fingir = { name: "fingir", enforce: "pre", load(id) {
  for (const [k, v] of Object.entries(STUBS)) if (id.endsWith(k)) return v;
}, transform(code, id) {
  if (id.endsWith("/src/components/ranking/RankingFP.jsx")) {
    return code.replace("if (!supabase) return { data: [], error: null };", `return { data: ${JSON.stringify(APODOS.map((nickname, i) => ({ posicion: i + 1, nickname, fp: 4280 - i * 377, es_tuyo: i === 4, forma: 0, paleta: 0, nivel: 1 })))}, error: null };`);
  }
} };
