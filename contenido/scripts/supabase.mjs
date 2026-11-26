// Acceso de servicio a Supabase Storage, solo dentro de GitHub Actions.
// La clave de servicio se toma de SUPABASE_SERVICE_ROLE_KEY o, si no existe, se pide a la
// API de gestión con SUPABASE_ACCESS_TOKEN. Se enmascara en el registro y no se escribe nunca.
export const BUCKET = "instagram-publico";

export async function supabase() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  if (!url) throw new Error("Falta VITE_SUPABASE_URL (secreto de GitHub).");
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    const tok = process.env.SUPABASE_ACCESS_TOKEN;
    if (!tok) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY o SUPABASE_ACCESS_TOKEN (secretos de GitHub).");
    const ref = new URL(url).hostname.split(".")[0];
    const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/api-keys?reveal=true`, { headers: { authorization: `Bearer ${tok}` } });
    if (!r.ok) throw new Error(`La API de gestión de Supabase respondió ${r.status}.`);
    const keys = await r.json();
    const k = keys.find((x) => x.type === "secret" && x.api_key) || keys.find((x) => x.name === "service_role");
    if (!k?.api_key) throw new Error("La API de gestión no devolvió una clave de servicio.");
    key = k.api_key;
  }
  if (process.env.GITHUB_ACTIONS) console.log(`::add-mask::${key}`);
  const h = { apikey: key };
  if (!key.startsWith("sb_")) h.authorization = `Bearer ${key}`;
  return { url, h };
}

export const urlPublica = (url, ruta) => `${url}/storage/v1/object/public/${BUCKET}/${ruta}`;
