// node bucket.mjs → crea (si no existe) el bucket PÚBLICO instagram-publico de Supabase Storage.
// Solo videos e imágenes terminados para Instagram. NUNCA datos de estudiantes.
// Idempotente: si ya existe, solo confirma su configuración.
import { supabase, BUCKET } from "./supabase.mjs";

const { url, h } = await supabase();
const conf = { public: true, file_size_limit: 50 * 1024 * 1024, allowed_mime_types: ["video/mp4", "image/jpeg", "image/png"] };
const r = await fetch(`${url}/storage/v1/bucket/${BUCKET}`, { headers: h });
if (r.status === 200) {
  const b = await r.json();
  console.log(`El bucket ${BUCKET} ya existe (público: ${b.public}).`);
  if (!b.public) throw new Error("Existe pero NO es público: revisar a mano antes de tocarlo.");
} else {
  const c = await fetch(`${url}/storage/v1/bucket`, { method: "POST", headers: { ...h, "content-type": "application/json" }, body: JSON.stringify({ id: BUCKET, name: BUCKET, ...conf }) });
  if (!c.ok) throw new Error(`No se pudo crear el bucket: ${c.status} ${(await c.text()).slice(0, 300)}`);
  console.log(`Bucket ${BUCKET} creado: público, máx. 50 MB, solo mp4/jpg/png.`);
}
