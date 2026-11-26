// Cliente mínimo de la Graph API de Instagram (Meta). Aún SIN token: Mateo conecta Meta después.
// Host y versión configurables: graph.facebook.com (login con Facebook, necesario para
// hashtags y Business Discovery) o graph.instagram.com (login con Instagram).
import { clave, pide } from "./comun.mjs";
const HOST = process.env.IG_GRAPH_HOST || "graph.facebook.com";
const VER = process.env.IG_GRAPH_VERSION || "v23.0";

export const igUser = () => clave("IG_USER_ID");
export async function graph(ruta, params = {}, metodo = "GET") {
  const q = new URLSearchParams({ ...params, access_token: clave("IG_ACCESS_TOKEN") });
  const url = `https://${HOST}/${VER}/${ruta}`;
  const r = metodo === "GET" ? await pide(`${url}?${q}`) : await pide(url, { method: metodo, body: q });
  return r.json();
}
