import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/*
 * CaminoHacer abre cada nodo dentro de una transición, y mientras dura useRuta
 * no atiende hashchange: espera que el cambio llegue por `navegar`. Si la vista
 * del Macro nuevo cambia el hash a mano, la dirección cambia y la pantalla no
 * (pasó en el lote 2: el reto no abría desde el camino). Esta prueba fija que
 * App le da `navegar` y que la vista solo toca el hash como último recurso.
 */
const leer = (r) => readFileSync(new URL(r, import.meta.url), "utf8");

test("★★★ el tema del Macro nuevo navega con el navegar de App, no con el hash a mano", () => {
  const app = leer("../../App.jsx");
  const linea = app.split("\n").find((l) => l.includes("<TemaMacro2026 "));
  assert.ok(linea?.includes("onIr={(vista, modo, extra) => navegar(vista, modo, { extra })}"), "App no le pasa navegar a TemaMacro2026");
  const vista = leer("../TemaMacro2026.jsx");
  assert.equal((vista.match(/location\.hash\s*=/g) ?? []).length, 1, "solo irPorHash toca el hash");
  assert.match(vista, /const irPorHash = /);
  assert.doesNotMatch(vista.replace(/const irPorHash = [^\n]*\n/, ""), /irPorHash\(/, "nadie llama al respaldo directamente");
});
