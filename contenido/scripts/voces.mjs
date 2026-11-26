// node voces.mjs [n=3] → renueva la lista de VOCES DE CONFIANZA en contenido/voz.json.
// La voz no es fija (corrección de Mateo, 2026-11-26): varía con lo que está en tendencia
// y con el tono de cada pieza, e incluye voces de mujer. Este script:
//   1. lista las voces en tendencia de la biblioteca de ElevenLabs en español latino,
//   2. elige n (al menos una de mujer y una de hombre), las agrega a la cuenta (reversible),
//   3. deja en voz.json la lista con voice_id, género, acento y tono, y el modelo.
// Gasta 0 caracteres: solo lista. Todas salen del plan Creator (licencia comercial).
import path from "node:path";
import fs from "node:fs";
import { clave, pide, escribeJSON, leeJSON, RAIZ, registra, ahoraBogota } from "./comun.mjs";

const N = Number(process.argv[2] || 3);
const API = "https://api.elevenlabs.io";
const H = { "xi-api-key": clave("ELEVENLABS_API_KEY") };
const CONF = path.join(RAIZ, "voz.json");
const conf = leeJSON(CONF, {});

// 1. Modelo: el más nuevo multilingüe con texto a voz.
const modelos = await (await pide(`${API}/v1/models`, { headers: H })).json();
const ids = modelos.filter((m) => m.can_do_text_to_speech).map((m) => m.model_id);
const PREF = ["eleven_v4", "eleven_multilingual_v4", "eleven_multilingual_v2"];
const modelo = PREF.find((p) => ids.includes(p)) || ids.find((i) => /multilingual/.test(i)) || ids[0];

// 2. Tendencia: biblioteca compartida, español, orden «trending».
const q = new URLSearchParams({ language: "es", sort: "trending", page_size: "60" });
const lib = (await (await pide(`${API}/v1/shared-voices?${q}`, { headers: H })).json()).voices || [];
const LATAM = /latin|mex|colomb|argent|chile|peru|venez|caribe|neutral/i;
const cand = lib.filter((v) => LATAM.test(v.accent || "") || LATAM.test(v.locale || "") || LATAM.test(v.description || ""));
const filas = cand.slice(0, 20).map((v, i) => `${i + 1}. ${v.name} · ${v.gender} · ${v.age} · ${v.accent} · ${v.use_case || "-"} · ${v.descriptive || "-"} · usada ${v.usage_character_count_1y ?? "?"} [${v.voice_id}]`);
const dia = ahoraBogota().slice(0, 10);
fs.mkdirSync(path.join(RAIZ, "registro"), { recursive: true });
fs.writeFileSync(path.join(RAIZ, "registro", `voces-tendencia-${dia}.md`), `# Voces en tendencia (ElevenLabs, español latino) — ${dia}\n\nOrden de la biblioteca: trending. Modelo: ${modelo}. Modelos disponibles: ${ids.join(", ")}.\n\n${filas.join("\n")}\n`);
console.log(filas.join("\n"));

// Preferimos voces de narración / redes sociales; primero una de mujer y una de hombre.
const apta = (v) => /narra|social|convers|character|entertain|advert|informative/i.test(`${v.use_case} ${v.category}`);
const orden = [...cand.filter(apta), ...cand.filter((v) => !apta(v))];
const elegidas = [];
for (const g of ["female", "male"]) { const v = orden.find((x) => x.gender === g && !elegidas.includes(x)); if (v) elegidas.push(v); }
for (const v of orden) { if (elegidas.length >= N) break; if (!elegidas.includes(v)) elegidas.push(v); }
if (!elegidas.length) throw new Error("La biblioteca no devolvió voces en español latino en tendencia.");

// 3. Agregar a la cuenta (si ya están, se reutilizan) y guardar.
const mias = (await (await pide(`${API}/v1/voices`, { headers: H })).json()).voices;
const confianza = [];
for (const v of elegidas) {
  let id = mias.find((m) => m.name === v.name || m.sharing?.original_voice_id === v.voice_id)?.voice_id;
  if (!id) {
    const r = await (await pide(`${API}/v1/voices/add/${v.public_owner_id}/${v.voice_id}`, {
      method: "POST", headers: { ...H, "content-type": "application/json" }, body: JSON.stringify({ new_name: v.name }),
    })).json();
    id = r.voice_id;
  }
  const alias = v.name.split(/[\s\-–—]/)[0].toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
  confianza.push({ alias, nombre: v.name, voice_id: id, genero: v.gender, edad: v.age, acento: v.accent, uso: v.use_case, tono: v.descriptive, desde: dia });
}
escribeJSON(CONF, {
  _nota: "Voces de confianza: se renuevan según la tendencia (node voces.mjs). Cada pieza anota qué voz usó en tiempos-<alias>.json y en el registro.",
  ...conf, confianza, modelo, ajustes: { stability: 0.5, similarity_boost: 0.75 }, formato: "mp3_44100_128", cupo: { plan: "Creator", aviso: 0.8 },
});
registra(`Voces de confianza renovadas (${modelo}): ${confianza.map((c) => `${c.nombre} [${c.genero}, ${c.acento}]`).join("; ")}.`);
