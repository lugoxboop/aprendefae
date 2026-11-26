// node publicar.mjs <url-publica.mp4> <pie.txt> [portada_segundos]
// Publica un Reel por la API de contenido de Instagram: contenedor → espera → publicar → comprobar.
// Reintenta 2 veces; si sigue fallando, el error sale en una línea para Mateo.
// OJO: nunca se corre sobre una pieza que Mateo no aprobó (ver skill contenido-instagram, §3).
import fs from "node:fs";
import { graph, igUser } from "./meta.mjs";
import { registra } from "./comun.mjs";

const [video, fPie, portada = "1"] = process.argv.slice(2);
if (!video || !fPie) throw new Error("Uso: node publicar.mjs <url-publica.mp4> <pie.txt> [portada_s]");
const caption = fs.readFileSync(fPie, "utf8").trim();
const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));

async function intento() {
  const { id: cont } = await graph(`${igUser()}/media`, { media_type: "REELS", video_url: video, caption, share_to_feed: "true", thumb_offset: String(Math.round(+portada * 1000)) }, "POST");
  for (let i = 0; i < 40; i++) {                       // hasta ~10 min procesando
    const { status_code, status } = await graph(cont, { fields: "status_code,status" });
    if (status_code === "FINISHED") break;
    if (status_code === "ERROR" || status_code === "EXPIRED") throw new Error(`Instagram no pudo procesar el video: ${status}`);
    await espera(15000);
  }
  const { id } = await graph(`${igUser()}/media_publish`, { creation_id: cont }, "POST");
  const m = await graph(id, { fields: "permalink,timestamp,media_product_type" });   // comprobación
  return m;
}

let ultimo;
for (let n = 0; n < 3; n++) {
  try { const m = await intento(); registra(`Publicado Reel ${m.permalink} (${m.timestamp}).`); process.exit(0); }
  catch (e) { ultimo = e; console.log(`Intento ${n + 1} falló: ${e.message}`); }
}
registra(`NO se pudo publicar tras 3 intentos: ${ultimo.message}`);
process.exit(1);
