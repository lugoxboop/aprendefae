// node video.mjs <pedido-video.json>
// PRUEBA: animar una escena con la API de video de ElevenLabs (POST /v1/flows/video) a partir de
// un cuadro nuestro (start_frame), para compararla con la animación de Remotion.
// Deja el mp4 en el bucket (pruebas/) y 6 cuadros pequeños en contenido/registro/video-ia/<id>/ para revisarlos.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { clave, pide, leeJSON, RAIZ, registra, ahoraBogota } from "./comun.mjs";
import { cupo } from "./cupo.mjs";

const pedido = leeJSON(path.resolve(process.argv[2]));
const API = "https://api.elevenlabs.io";
const H = { "xi-api-key": clave("ELEVENLABS_API_KEY"), "content-type": "application/json" };
const img = fs.readFileSync(path.join(RAIZ, pedido.primer_cuadro));
const antes = await cupo();

const cuerpo = {
  model_id: pedido.modelo || "veo-3.1-fast-generate-001",
  prompt: pedido.prompt,
  negative_prompt: pedido.negativo,
  aspect_ratio: "9:16",
  duration_secs: pedido.segundos || 8,
  resolution: pedido.resolucion || "720p",
  generate_audio: false,
  start_frame: { type: "inline_base64", content_base64: img.toString("base64"), mime_type: "image/jpeg" },
};
const r = await (await pide(`${API}/v1/flows/video`, { method: "POST", headers: H, body: JSON.stringify(cuerpo) }, { reintentos: 0 })).json();
console.log("Generación", r.id, r.status);
let g;
for (let i = 0; i < 90; i++) {                       // hasta ~15 min
  await new Promise((ok) => setTimeout(ok, 10000));
  g = await (await pide(`${API}/v1/flows/video/${r.id}`, { headers: H })).json();
  if (g.status === "completed" || g.status === "failed") break;
}
if (g.status !== "completed") throw new Error(`La generación terminó en «${g.status}»: ${g.failure_reason || ""} ${g.error_message || ""}`);

const id = `${ahoraBogota().slice(0, 10)}-${pedido.id}`;
const tmp = path.join(RAIZ, "estudio", "salida"); fs.mkdirSync(tmp, { recursive: true });
const mp4 = path.join(tmp, `ia-${id}.mp4`);
fs.writeFileSync(mp4, Buffer.from(await (await pide(g.content_url)).arrayBuffer()));
const despues = await cupo();
const gasto = antes.sinDatos ? "?" : despues.character_count - antes.character_count;
const dirC = path.join(RAIZ, "registro", "video-ia", id); fs.mkdirSync(dirC, { recursive: true });
// 6 cuadros a 360 px de ancho con el ffmpeg de Remotion
execFileSync("npx", ["remotion", "ffmpeg", "-v", "error", "-y", "-i", mp4, "-vf", `fps=6/${cuerpo.duration_secs},scale=360:-2`, path.join(dirC, "c%02d.jpg")], { cwd: path.join(RAIZ, "estudio"), stdio: "inherit" });
fs.writeFileSync(path.join(dirC, "pedido.json"), JSON.stringify({ ...cuerpo, start_frame: pedido.primer_cuadro, generacion: r.id, creditos: gasto }, null, 2));
registra(`Video IA ${id}: ${cuerpo.model_id}, ${cuerpo.duration_secs} s ${cuerpo.resolution}, créditos usados: ${gasto}. Cuadros en registro/video-ia/${id}/`);
fs.writeFileSync(path.join(tmp, "ia-ultimo.txt"), mp4);
