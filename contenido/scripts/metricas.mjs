// node metricas.mjs → métricas por pieza a 24 h, 72 h y 7 días, y del perfil.
// Guarda contenido/metricas/AAAA-MM-DD.json y añade una fila por pieza a contenido/metricas/historial.csv.
// Lo que más pesa: compartidos, guardados y retención (tiempo promedio / duración).
import path from "node:path";
import fs from "node:fs";
import { graph, igUser } from "./meta.mjs";
import { RAIZ, escribeJSON, ahoraBogota } from "./comun.mjs";

const HITOS = [24, 72, 168];                                   // horas
const M_REEL = "reach,views,likes,comments,saved,shares,total_interactions,ig_reels_avg_watch_time,ig_reels_video_view_total_time";
const M_OTRO = "reach,views,likes,comments,saved,shares,total_interactions";
const dia = ahoraBogota().slice(0, 10);
const medios = (await graph(`${igUser()}/media`, { fields: "id,caption,media_product_type,timestamp,permalink", limit: "50" })).data;
const ahora = Date.now();
const filas = [];
for (const m of medios) {
  const horas = (ahora - Date.parse(m.timestamp)) / 36e5;
  const hito = HITOS.find((h) => horas >= h && horas < h + 24);
  if (!hito) continue;                                          // solo se mide al cruzar cada hito
  const metr = m.media_product_type === "REELS" ? M_REEL : M_OTRO;
  const ins = await graph(`${m.id}/insights`, { metric: metr });
  const v = Object.fromEntries(ins.data.map((d) => [d.name, d.values?.[0]?.value ?? d.total_value?.value]));
  filas.push({ dia, hito_h: hito, id: m.id, tipo: m.media_product_type, permalink: m.permalink, ...v });
}
const perfil = await graph(igUser(), { fields: "followers_count,media_count" });
const dir = path.join(RAIZ, "metricas");
escribeJSON(path.join(dir, `${dia}.json`), { dia, perfil, piezas: filas });
const csv = path.join(dir, "historial.csv");
const COLS = ["dia", "hito_h", "id", "tipo", "permalink", ...M_REEL.split(",")];
if (!fs.existsSync(csv)) fs.writeFileSync(csv, COLS.join(",") + "\n");
for (const f of filas) fs.appendFileSync(csv, COLS.map((c) => f[c] ?? "").join(",") + "\n");
console.log(`Seguidores: ${perfil.followers_count}. Piezas medidas hoy: ${filas.length}.`);
