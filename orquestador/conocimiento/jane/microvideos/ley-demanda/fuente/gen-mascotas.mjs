import { svgMarioneta } from "../../../../../../src/mascota/marionetas.js";
import fs from "node:fs";
const cast = {
  zorro: [], gato: ["gafas"], panda: [], perro: ["mochila"], hamster: ["gorra"], conejo: [], huron: [],
};
const out = {};
for (const [esp, puestos] of Object.entries(cast)) {
  const r = svgMarioneta(esp, { uid: esp, puestos });
  out[esp] = r;
  console.log(esp, r.viewBox, r.inner.length);
}
fs.writeFileSync("src/mascotas.json", JSON.stringify(out));
