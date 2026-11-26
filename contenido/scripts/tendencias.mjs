// node tendencias.mjs → datos crudos del radar de las 6:30 (la parte por API).
// 1) hashtags: ig_hashtag_search → top_media (máx. 30 hashtags distintos por semana: se lleva la cuenta).
// 2) Business Discovery de las cuentas de referencia: publicaciones muy por encima de su promedio.
// Deja contenido/tendencias/AAAA-MM-DD.datos.json; el análisis (el .md) lo escribe Nino.
import path from "node:path";
import { graph, igUser } from "./meta.mjs";
import { RAIZ, leeJSON, escribeJSON, ahoraBogota, aviso } from "./comun.mjs";

const dia = ahoraBogota().slice(0, 10);
const cfg = leeJSON(path.join(RAIZ, "tendencias", "fuentes.json"));
const usoF = path.join(RAIZ, "tendencias", "hashtags-usados.json");
const uso = leeJSON(usoF, {});                                  // { "#tag": "AAAA-MM-DD" }
const hace7 = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
const semana = Object.entries(uso).filter(([, d]) => d >= hace7).map(([t]) => t);
const salida = { dia, hashtags: {}, cuentas: {} };

for (const tag of cfg.hashtags) {
  if (!semana.includes(tag) && semana.length >= 30) { aviso(`Tope de 30 hashtags/semana: se salta #${tag}.`); continue; }
  const { data } = await graph("ig_hashtag_search", { user_id: igUser(), q: tag });
  const id = data?.[0]?.id; if (!id) continue;
  const top = await graph(`${id}/top_media`, { user_id: igUser(), fields: "id,caption,media_type,like_count,comments_count,permalink,timestamp", limit: "25" });
  salida.hashtags[tag] = top.data;
  if (!semana.includes(tag)) semana.push(tag);
  uso[tag] = dia;
}
for (const cuenta of cfg.cuentas) {
  const campos = `business_discovery.username(${cuenta}){followers_count,media.limit(25){id,caption,media_product_type,like_count,comments_count,permalink,timestamp}}`;
  try {
    const bd = (await graph(igUser(), { fields: campos })).business_discovery;
    const med = bd.media.data.map((m) => ({ ...m, inter: (m.like_count || 0) + (m.comments_count || 0) }));
    const prom = med.reduce((s, m) => s + m.inter, 0) / Math.max(1, med.length);
    salida.cuentas[cuenta] = { seguidores: bd.followers_count, promedio: Math.round(prom), destacadas: med.filter((m) => m.inter >= 2 * prom) };
  } catch (e) { aviso(`Business Discovery falló para @${cuenta}: ${e.message.slice(0, 120)}`); }
}
escribeJSON(usoF, uso);
escribeJSON(path.join(RAIZ, "tendencias", `${dia}.datos.json`), salida);
console.log(`Hashtags consultados: ${Object.keys(salida.hashtags).length}; cuentas: ${Object.keys(salida.cuentas).length}.`);
