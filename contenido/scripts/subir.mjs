// node subir.mjs <archivo.mp4|jpg|png> <ruta-en-bucket>  → sube al bucket público y comprueba el enlace.
import fs from "node:fs";
import { supabase, urlPublica, BUCKET } from "./supabase.mjs";
import { registra } from "./comun.mjs";

const [archivo, ruta] = process.argv.slice(2);
if (!archivo || !ruta) throw new Error("Uso: node subir.mjs <archivo> <ruta-en-bucket>");
const tipo = archivo.endsWith(".mp4") ? "video/mp4" : archivo.endsWith(".png") ? "image/png" : "image/jpeg";
const { url, h } = await supabase();
const r = await fetch(`${url}/storage/v1/object/${BUCKET}/${ruta}`, {
  method: "POST", headers: { ...h, "content-type": tipo, "x-upsert": "true", "cache-control": "3600" }, body: fs.readFileSync(archivo),
});
if (!r.ok) throw new Error(`Subida fallida: ${r.status} ${(await r.text()).slice(0, 300)}`);
const pub = urlPublica(url, ruta);
const c = await fetch(pub, { method: "HEAD" });
if (!c.ok) throw new Error(`Subió, pero el enlace público responde ${c.status}.`);
const mb = (fs.statSync(archivo).size / 1048576).toFixed(1);
registra(`Subido ${ruta} (${mb} MB) → ${pub}`);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `- [${ruta}](${pub}) (${mb} MB)\n`);
