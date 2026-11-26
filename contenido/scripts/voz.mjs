// node voz.mjs <pieza> [alias|todas] [--forzar]
// alias = una voz de la lista de confianza de contenido/voz.json (por defecto, la primera);
// «todas» genera la pieza con cada voz de la lista (para comparar: una variable a la vez).
// Lee estudio/src/piezas/<pieza>/guion.txt (una frase = una escena, una por línea),
// genera TODO el guion en UNA llamada al endpoint with-timestamps de ElevenLabs y deja:
//   estudio/public/voz/<pieza>-<alias>.mp3          la narración
//   estudio/src/piezas/<pieza>/tiempos-<alias>.json  inicio/fin de cada escena y de cada palabra
// Si el guion no cambió desde la última vez (mismo hash), no gasta cupo y sale.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { clave, pide, leeJSON, escribeJSON, RAIZ, ESTUDIO, registra, aviso } from "./comun.mjs";
import { cupo } from "./cupo.mjs";

const args = process.argv.slice(2);
const banderas = args.filter((a) => a.startsWith("--"));
const [pieza, quien] = args.filter((a) => !a.startsWith("--"));
if (!pieza) throw new Error("Uso: node voz.mjs <pieza> [alias|todas] [--forzar]");
const dir = path.join(ESTUDIO, "src", "piezas", pieza);
const frases = fs.readFileSync(path.join(dir, "guion.txt"), "utf8").split("\n").map((l) => l.trim()).filter(Boolean);
const texto = frases.join("\n\n");
const conf = leeJSON(path.join(RAIZ, "voz.json"));
if (!conf?.confianza?.length) throw new Error("Falta la lista de voces en contenido/voz.json: corre antes node voces.mjs");
// Sin alias: ROTA entre las voces de confianza (Mateo, 26-nov): cada pieza nueva usa la siguiente.
const rota = !quien;
const turno = (conf.rotacion || 0) % conf.confianza.length;
const lista = quien === "todas" ? conf.confianza : [quien ? conf.confianza.find((v) => v.alias === quien) : conf.confianza[turno]];
if (!lista[0]) throw new Error(`No hay una voz «${quien}» en la lista de confianza.`);

async function genera(voz) {
const hash = crypto.createHash("sha256").update(JSON.stringify([texto, voz.voice_id, conf.modelos || conf.modelo, conf.ajustes])).digest("hex").slice(0, 16);
const fTiempos = path.join(dir, `tiempos-${voz.alias}.json`);
const previo = leeJSON(fTiempos);
if (previo?.hash === hash && !banderas.includes("--forzar")) { console.log(`La voz de ${pieza} ya está al día (hash ${hash}); no se gasta cupo.`); return; }

const antes = await cupo();
if (antes.character_limit - antes.character_count < texto.length) throw new Error("No queda cupo de caracteres este mes.");

const url = `https://api.elevenlabs.io/v1/text-to-speech/${voz.voice_id}/with-timestamps?output_format=${conf.formato}`;
// Prueba los modelos en orden (el más nuevo primero); si uno no sirve con esta voz o con
// marcas de tiempo, pasa al siguiente. El que funcionó queda anotado en tiempos.
let r, modelo;
for (modelo of conf.modelos || [conf.modelo]) {
  try {
    r = await (await pide(url, {
      method: "POST",
      headers: { "xi-api-key": clave("ELEVENLABS_API_KEY"), "content-type": "application/json" },
      body: JSON.stringify({ text: texto, model_id: modelo, voice_settings: /eleven_v[34]$/.test(modelo) ? { stability: 0.5, similarity_boost: 0.75 } : conf.ajustes }),
    })).json();
    break;
  } catch (e) { aviso(`Modelo ${modelo} falló con ${voz.alias}: ${e.message.slice(0, 160)}`); }
}
if (!r) throw new Error(`Ningún modelo generó la voz de ${voz.alias}.`);

const mp3 = path.join(ESTUDIO, "public", "voz", `${pieza}-${voz.alias}.mp3`);
fs.mkdirSync(path.dirname(mp3), { recursive: true });
fs.writeFileSync(mp3, Buffer.from(r.audio_base64, "base64"));

// alineación carácter a carácter → escenas y palabras
const al = r.alignment;
const chars = al.characters.join("");
if (chars !== texto) aviso(`La alineación no coincide letra por letra con el guion (${chars.length} vs ${texto.length}); se alinea por búsqueda.`);
const ini = al.character_start_times_seconds, fin = al.character_end_times_seconds;
let cursor = 0;
const escenas = frases.map((frase) => {
  const base = chars.indexOf(frase.slice(0, 12), cursor);
  const off = base >= 0 ? base : cursor;
  const palabras = [...frase.matchAll(/\S+/g)].map((m) => {
    const a = Math.min(off + m.index, ini.length - 1), b = Math.min(off + m.index + m[0].length - 1, fin.length - 1);
    return { w: m[0], ini: +ini[a].toFixed(3), fin: +fin[b].toFixed(3) };
  });
  cursor = off + frase.length;
  return { ini: palabras[0].ini, fin: palabras.at(-1).fin, texto: frase, palabras };
});

// comprobación de que no se cortó el final (ya pasó una vez)
let duracion = fin.at(-1) + 0.2;
try {
  duracion = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3]).toString().trim();
} catch {
  // Sin ffprobe: el mp3 es de tasa fija (128 kb/s), así que duración = bytes × 8 / 128 000.
  const kbps = Number((conf.formato.match(/_(\d+)$/) || [, 128])[1]);
  duracion = (fs.statSync(mp3).size * 8) / (kbps * 1000);
}
const ultima = escenas.at(-1).fin;
if (duracion + 0.05 < ultima) throw new Error(`El audio (${duracion}s) termina antes que la última palabra (${ultima}s): se cortó el final. Regenerar.`);

escribeJSON(fTiempos, { audio: `voz/${pieza}-${voz.alias}.mp3`, duracion: +duracion.toFixed(3), hash, voz: voz.nombre, voice_id: voz.voice_id, genero: voz.genero, modelo, caracteres: texto.length, escenas });
registra(`Voz de ${pieza} con ${voz.nombre} (${voz.genero}): ${frases.length} frases, ${texto.length} caracteres, ${duracion.toFixed(1)} s, última palabra a ${ultima}s (completa).`);
}

for (const voz of lista) await genera(voz);
if (rota) escribeJSON(path.join(RAIZ, "voz.json"), { ...conf, rotacion: turno + 1 });
await cupo();
