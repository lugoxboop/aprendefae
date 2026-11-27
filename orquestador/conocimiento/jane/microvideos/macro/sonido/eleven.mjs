// node sonido/eleven.mjs <pedido.json>  → corre SOLO en GitHub Actions (allí vive ELEVENLABS_API_KEY
// y hay salida a api.elevenlabs.io; el shell de la nube no la tiene). Workflow: sonido-microvideos.yml.
// Acciones del pedido (cada una idempotente: si el archivo ya existe, no se vuelve a pagar):
//   musica  → pistas instrumentales nuevas (Eleven Music) en sonido/musica/<id>.mp3
//   aislar  → la voz limpia de cada microvideo publicado (Voice Isolator) en sonido/_aislada/<video>.mp3
//   voces   → la misma frase con varias voces, para que Mateo compare, en sonido/voces-muestra/
// La clave solo se lee del entorno; nunca se imprime ni se escribe.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(AQUI, "../../../../../..");
const API = "https://api.elevenlabs.io";
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) throw new Error("Falta ELEVENLABS_API_KEY (secreto de GitHub Actions).");
const H = { "xi-api-key": KEY };
const pedido = JSON.parse(fs.readFileSync(process.argv[2] || path.join(AQUI, "pedido.json"), "utf8"));
const log = [];
const anota = (s) => { console.log(s); log.push(`- ${s}`); };

async function pide(url, op = {}, intentos = 3) {
  for (let i = 0; ; i++) {
    const r = await fetch(url, op);
    if (r.ok) return r;
    const cuerpo = (await r.text()).slice(0, 500);
    if (i + 1 >= intentos || (r.status < 500 && r.status !== 429)) throw new Error(`${op.method || "GET"} ${url.split("?")[0]} → ${r.status}: ${cuerpo}`);
    await new Promise((ok) => setTimeout(ok, 4000 * (i + 1)));
  }
}
const guarda = async (r, f) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); };

const acciones = pedido.acciones || [];

if (acciones.includes("cupo")) {
  try {
    const s = await (await pide(`${API}/v1/user/subscription`, { headers: H })).json();
    anota(`Cupo: plan ${s.tier}, ${s.character_count} de ${s.character_limit} créditos usados.`);
  } catch (e) { anota(`Cupo: no se pudo leer (${e.message.slice(0, 120)}).`); }
}

if (acciones.includes("musica")) {
  for (const p of pedido.musica || []) {
    const f = path.join(AQUI, "musica", `${p.id}.mp3`);
    if (fs.existsSync(f)) { anota(`Música ${p.id}: ya existe.`); continue; }
    try {
      const r = await pide(`${API}/v1/music?output_format=mp3_44100_128`, {
        method: "POST", headers: { ...H, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p.prompt, music_length_ms: p.ms || 80000, model_id: "music_v1", force_instrumental: true }),
      });
      await guarda(r, f);
      anota(`Música ${p.id}: generada (${(fs.statSync(f).size / 1024).toFixed(0)} KB).`);
    } catch (e) { anota(`Música ${p.id}: FALLÓ ${e.message.slice(0, 300)}`); }
  }
}

if (acciones.includes("aislar")) {
  for (const v of pedido.aislar || []) {
    const f = path.join(AQUI, "_aislada", `${v}.mp3`);
    if (fs.existsSync(f)) { anota(`Voz aislada ${v}: ya existe.`); continue; }
    const mp4 = path.join(REPO, "public/macro2026/videos", `${v}.mp4`);
    const tmp = `/tmp/${v}.mp3`;
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", mp4, "-vn", "-ac", "1", "-ar", "44100", "-b:a", "192k", tmp]);
    try {
      const fd = new FormData();
      fd.append("audio", new Blob([fs.readFileSync(tmp)], { type: "audio/mpeg" }), `${v}.mp3`);
      const r = await pide(`${API}/v1/audio-isolation`, { method: "POST", headers: H, body: fd });
      await guarda(r, f);
      anota(`Voz aislada ${v}: lista.`);
    } catch (e) { anota(`Voz aislada ${v}: FALLÓ ${e.message.slice(0, 300)}`); }
  }
}

if (acciones.includes("voces")) {
  const cfg = pedido.voces || {};
  const lista = [...(cfg.fijas || [])];
  // las más en tendencia de la biblioteca en español latino que aún no estén en la lista
  try {
    const q = new URLSearchParams({ language: "es", sort: "trending", page_size: "80" });
    const lib = (await (await pide(`${API}/v1/shared-voices?${q}`, { headers: H })).json()).voices || [];
    const LAT = /latin|mex|colomb|argent|chile|peru|venez|neutral/i;
    const apta = (v) => LAT.test(`${v.accent} ${v.locale}`) && /narra|informative|educ|social|convers/i.test(`${v.use_case} ${v.category}`);
    const nuevas = lib.filter(apta).filter((v) => !lista.some((x) => x.voice_id === v.voice_id));
    const fs2 = nuevas.filter((v) => v.gender === "female").slice(0, cfg.nuevasMujer ?? 2);
    const ms2 = nuevas.filter((v) => v.gender === "male").slice(0, cfg.nuevasHombre ?? 1);
    const mias = (await (await pide(`${API}/v1/voices`, { headers: H })).json()).voices || [];
    for (const v of [...fs2, ...ms2]) {
      let id = mias.find((m) => m.sharing?.original_voice_id === v.voice_id || m.voice_id === v.voice_id)?.voice_id;
      if (!id) {
        try {
          const r = await (await pide(`${API}/v1/voices/add/${v.public_owner_id}/${v.voice_id}`, {
            method: "POST", headers: { ...H, "Content-Type": "application/json" }, body: JSON.stringify({ new_name: v.name }),
          })).json();
          id = r.voice_id;
        } catch (e) { anota(`No pude agregar ${v.name}: ${e.message.slice(0, 160)}`); continue; }
      }
      let al = v.name.split(/[ -]/)[0].toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");
      while (lista.some((x) => x.alias === al)) al += "2";
      lista.push({ alias: al, nombre: v.name, voice_id: id, genero: v.gender, acento: v.accent, uso: v.use_case, nueva: true });
    }
  } catch (e) { anota(`Biblioteca de voces: no se pudo leer (${e.message.slice(0, 160)}).`); }
  const hechas = [];
  for (const v of lista) {
    const f = path.join(AQUI, "voces-muestra", `${v.alias}.mp3`);
    if (!fs.existsSync(f)) {
      let ok = false;
      for (const modelo of cfg.modelos || ["eleven_v3", "eleven_multilingual_v2"]) {
        try {
          const r = await pide(`${API}/v1/text-to-speech/${v.voice_id}?output_format=mp3_44100_128`, {
            method: "POST", headers: { ...H, "Content-Type": "application/json" },
            body: JSON.stringify({ text: cfg.frase, model_id: modelo, voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
          });
          await guarda(r, f); v.modelo = modelo; ok = true; break;
        } catch (e) { anota(`Voz ${v.alias} con ${modelo}: ${e.message.slice(0, 160)}`); }
      }
      if (!ok) continue;
    }
    hechas.push(v);
    anota(`Muestra de voz ${v.alias} (${v.nombre}, ${v.genero}, ${v.acento}): lista.`);
  }
  fs.writeFileSync(path.join(AQUI, "voces-muestra", "voces.json"), JSON.stringify({ frase: cfg.frase, voces: hechas }, null, 2) + "\n");
}

if (acciones.includes("narrar")) {
  // la narración completa de un video (una frase por párrafo) con la voz única del narrador,
  // y su transcripción palabra por palabra (scribe_v1) para alinear las escenas sin Whisper local.
  // pedido.narrar = [{ id, voz, modelo?, texto }] → sonido/narraciones/<id>.mp3 y <id>.palabras.json
  for (const n of pedido.narrar || []) {
    const f = path.join(AQUI, "narraciones", `${n.id}.mp3`);
    if (!fs.existsSync(f)) {
      let ok = false;
      for (const modelo of n.modelo ? [n.modelo] : ["eleven_v3", "eleven_multilingual_v2"]) {
        try {
          const r = await pide(`${API}/v1/text-to-speech/${n.voz}?output_format=mp3_44100_128`, {
            method: "POST", headers: { ...H, "Content-Type": "application/json" },
            body: JSON.stringify({ text: n.texto, model_id: modelo, language_code: "es", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
          });
          await guarda(r, f); ok = true;
          anota(`Narración ${n.id}: lista con ${modelo} (${n.texto.length} caracteres).`);
          break;
        } catch (e) { anota(`Narración ${n.id} con ${modelo}: ${e.message.slice(0, 160)}`); }
      }
      if (!ok) continue;
    } else anota(`Narración ${n.id}: ya existe.`);
    const fj = path.join(AQUI, "narraciones", `${n.id}.palabras.json`);
    if (!fs.existsSync(fj)) {
      try {
        const fd = new FormData();
        fd.append("model_id", "scribe_v1");
        fd.append("language_code", "spa");
        fd.append("file", new Blob([fs.readFileSync(f)], { type: "audio/mpeg" }), `${n.id}.mp3`);
        const r = await (await pide(`${API}/v1/speech-to-text`, { method: "POST", headers: H, body: fd })).json();
        const palabras = (r.words || []).filter((w) => w.type === "word").map((w) => ({ w: w.text, ini: w.start, fin: w.end }));
        fs.writeFileSync(fj, JSON.stringify({ texto: r.text, palabras }, null, 1) + "\n");
        anota(`Transcripción ${n.id}: ${palabras.length} palabras.`);
      } catch (e) { anota(`Transcripción ${n.id}: no se pudo (${e.message.slice(0, 160)}).`); }
    }
  }
}

if (acciones.includes("revisar")) {
  // ¿alguna pista de música trae voz cantada? La transcripción de ElevenLabs lo dice.
  for (const f of fs.readdirSync(path.join(AQUI, "musica")).filter((x) => x.endsWith(".mp3"))) {
    try {
      const fd = new FormData();
      fd.append("model_id", "scribe_v1");
      fd.append("file", new Blob([fs.readFileSync(path.join(AQUI, "musica", f))], { type: "audio/mpeg" }), f);
      const r = await (await pide(`${API}/v1/speech-to-text`, { method: "POST", headers: H, body: fd })).json();
      const palabras = (r.words || []).filter((w) => w.type === "word");
      anota(`Revisión ${f}: ${palabras.length} palabras detectadas${palabras.length ? ` («${palabras.slice(0, 12).map((w) => w.text).join(" ")}»)` : ""}.`);
    } catch (e) { anota(`Revisión ${f}: no se pudo (${e.message.slice(0, 160)}).`); }
  }
}

const reg = path.join(AQUI, "registro-eleven.md");
if (!fs.existsSync(reg)) fs.writeFileSync(reg, "# Registro de ElevenLabs (sonido de los microvideos)\n\n");
fs.appendFileSync(reg, `\n## ${new Date().toISOString()}\n${log.join("\n")}\n`);
