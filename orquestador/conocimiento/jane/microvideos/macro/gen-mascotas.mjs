// node gen-mascotas.mjs → src/comun/mascotas.json (marionetas del repo, con accesorio)
import { svgMarioneta } from "../../../../../src/mascota/marionetas.js";
import fs from "node:fs";
const cast = {
  "conejo": ["conejo", []], "zorro-corbata": ["zorro", ["corbata"]], "panda-traje": ["panda", ["traje"]],
  "hamster-gorra": ["hamster", ["gorra"]], "gato-gafas": ["gato", ["gafas"]], "huron": ["huron", []],
  "perro": ["perro", []], "perro-corbatin": ["perro", ["corbatin"]], "huron-corbata": ["huron", ["corbata"]],
  "conejo-casco": ["conejo", ["casco"]], "perro-mochila": ["perro", ["mochila"]], "zorro-corbatin": ["zorro", ["corbatin"]],
  "gato": ["gato", []], "panda": ["panda", []], "hamster": ["hamster", []], "zorro": ["zorro", []],
};
const out = {};
for (const [k, [esp, puestos]] of Object.entries(cast)) {
  const r = svgMarioneta(esp, { uid: k, puestos });
  out[k] = { ...r, esp };
  console.log(k, r.viewBox, r.inner.length);
}
fs.writeFileSync("src/comun/mascotas.json", JSON.stringify(out));
