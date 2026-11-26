// node cupo.mjs → cuántos caracteres del mes van gastados; avisa al 80 %.
import { clave, pide, aviso, registra } from "./comun.mjs";

export async function cupo() {
  const s = await (await pide("https://api.elevenlabs.io/v1/user/subscription", { headers: { "xi-api-key": clave("ELEVENLABS_API_KEY") } })).json();
  const uso = s.character_count / s.character_limit;
  const renueva = s.next_character_count_reset_unix ? new Date(s.next_character_count_reset_unix * 1000).toISOString().slice(0, 10) : "?";
  const linea = `Cupo ElevenLabs (${s.tier}): ${s.character_count.toLocaleString("es-CO")} de ${s.character_limit.toLocaleString("es-CO")} caracteres (${(uso * 100).toFixed(1)} %), se renueva ${renueva}.`;
  registra(linea);
  if (uso >= 0.8) aviso(`Cupo de voz al ${(uso * 100).toFixed(0)} %: avisar a Mateo.`);
  return { ...s, uso };
}
if (import.meta.url === `file://${process.argv[1]}`) await cupo();
