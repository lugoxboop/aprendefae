import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA MASCOTA no se separa de la base.
 *
 * ESPECIES (mascotas.js) y el check de mascota_especie (0160) son la misma
 * lista en dos sitios: el cliente ofrece un selector, la base rechaza lo que no
 * esté en el check. Si se separan, un botón del selector guardaría algo que la
 * base tira con un error feo. Esta prueba LEE la migración y los compara —el
 * mismo trato que avatar.test.mjs le da a las formas del avatar—.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const migracion = readFileSync(
  fileURLToPath(new URL("../../../supabase/migrations/0160_mascota.sql", import.meta.url)),
  "utf8",
);

/*
 * El check vigente de la especie: el de la última migración que lo define
 * (0168 sumó zorro y conejo; 0173, el panda).
 */
const dirMigraciones = fileURLToPath(new URL("../../../supabase/migrations/", import.meta.url));
const migracionEspecies = (await import("node:fs")).readdirSync(dirMigraciones)
  .filter((f) => f.endsWith(".sql")).sort()
  .map((f) => readFileSync(dirMigraciones + f, "utf8"))
  .filter((t) => /add constraint profiles_mascota_especie_valida/.test(t))
  .at(-1);

const fsMod = await import("node:fs");
/* Los checks vigentes del color y de los ojos: la última migración que los
   define (0162 y 0163; la 0174 los amplió con razas y ojos reales). */
const ultimaCon = (re) => fsMod.readdirSync(dirMigraciones)
  .filter((f) => f.endsWith(".sql")).sort()
  .map((f) => readFileSync(dirMigraciones + f, "utf8"))
  .filter((t) => re.test(t))
  .at(-1);
const migracionColor = ultimaCon(/add constraint profiles_mascota_paleta_valida/);
const migracionOjos = ultimaCon(/add constraint profiles_mascota_ojos_valida/);

const { ESPECIES, IDS_ESPECIE, NOMBRE_MAX, IDS_PALETA, PALETAS_MASCOTA, IDS_OJOS, OJOS_MASCOTA } = await import("../mascotas.js");

test("las especies del selector son exactamente las del check vigente", () => {
  /* Toma el `mascota_especie in ('…','…')` de la migración que amplía la lista. */
  const m = migracionEspecies.match(/mascota_especie in \(([^)]+)\)/);
  assert.ok(m, "la migración declara el check de la especie");
  const enLaBase = m[1].match(/'([^']+)'/g).map((s) => s.slice(1, -1));
  assert.deepEqual(
    [...IDS_ESPECIE].sort(),
    [...enLaBase].sort(),
    "ESPECIES (mascotas.js) y el check de la base tienen que coincidir",
  );
});

/*
 * La 0168 amplió el check pero mascota_elegir guardaba su propia lista de
 * cuatro: zorro y conejo salían en el selector y la base los rechazaba (20-nov).
 * La función vigente (la última migración que la define) acepta las seis.
 */
test("mascota_elegir acepta todas las especies del selector (la función vigente)", async () => {
  const { readdirSync } = await import("node:fs");
  const dir = fileURLToPath(new URL("../../../supabase/migrations/", import.meta.url));
  const conFuncion = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()
    .filter((f) => /create or replace function public\.mascota_elegir\(/.test(readFileSync(dir + f, "utf8")));
  const vigente = readFileSync(dir + conFuncion.at(-1), "utf8");
  const m = vigente.match(/p_especie not in \(([^)]+)\)/);
  assert.ok(m, `${conFuncion.at(-1)} valida la especie`);
  const acepta = m[1].match(/'([^']+)'/g).map((s) => s.slice(1, -1));
  assert.deepEqual([...acepta].sort(), [...IDS_ESPECIE].sort(), `mascota_elegir (${conFuncion.at(-1)}) y ESPECIES tienen que coincidir`);
});

test("el largo máximo del nombre coincide con el de la base", () => {
  const m = migracion.match(/char_length\(mascota_nombre\) between 1 and (\d+)/);
  assert.ok(m, "la migración declara el largo del nombre");
  assert.equal(NOMBRE_MAX, Number(m[1]), "NOMBRE_MAX y el check del nombre tienen que coincidir");
});

test("las paletas de color son exactamente las del check vigente", () => {
  const m = migracionColor.match(/mascota_paleta is null or mascota_paleta in \(([^)]+)\)/);
  assert.ok(m, "la migración declara el check de la paleta");
  const enLaBase = m[1].match(/'([^']+)'/g).map((s) => s.slice(1, -1));
  assert.deepEqual(
    [...IDS_PALETA].sort(),
    [...enLaBase].sort(),
    "IDS_PALETA (mascotas.js) y el check de la base tienen que coincidir",
  );
});

test("los colores de ojos son exactamente los del check vigente", () => {
  const m = migracionOjos.match(/mascota_ojos is null or mascota_ojos in \(([^)]+)\)/);
  assert.ok(m, "la migración declara el check de los ojos");
  const enLaBase = m[1].match(/'([^']+)'/g).map((s) => s.slice(1, -1));
  assert.deepEqual(
    [...IDS_OJOS].sort(),
    [...enLaBase].sort(),
    "IDS_OJOS (mascotas.js) y el check de la base tienen que coincidir",
  );
});

test("el selector de ojos ofrece «natural» más los colores de la base", () => {
  const delSelector = OJOS_MASCOTA.map((o) => o.id);
  assert.equal(delSelector[0], "natural", "natural va primero");
  assert.deepEqual(
    [...delSelector.slice(1)].sort(),
    [...IDS_OJOS].sort(),
    "el selector ofrece natural + exactamente los ojos válidos",
  );
  for (const o of OJOS_MASCOTA) assert.ok(o.nombre && o.muestra, `los ojos ${o.id} tienen nombre y muestra`);
});

test("el selector de color ofrece «natural» más las paletas de la base", () => {
  const delSelector = PALETAS_MASCOTA.map((p) => p.id);
  assert.equal(delSelector[0], "natural", "natural va primero");
  assert.deepEqual(
    [...delSelector.slice(1)].sort(),
    [...IDS_PALETA].sort(),
    "el selector ofrece natural + exactamente las paletas válidas",
  );
  for (const p of PALETAS_MASCOTA) assert.ok(p.nombre && p.muestra, `la paleta ${p.id} tiene nombre y muestra`);
});

test("cada especie tiene nombre y rasgo para el selector", () => {
  for (const e of ESPECIES) {
    assert.ok(e.id && e.nombre && e.rasgo, `la especie ${e.id} está completa`);
  }
});

/* ── El componente ── */
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const { default: Mascota } = await import("../../components/Mascota.jsx");

function montar(nodo) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(nodo));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

test("pinta la especie que se le pide, y un perfil sin mascota no pinta nada", () => {
  const m = montar(
    React.createElement(
      "div",
      null,
      React.createElement(Mascota, { especie: "perro", tamano: 96 }),
      React.createElement(Mascota, { perfil: {}, tamano: 96 }),
      React.createElement(Mascota, { perfil: { mascota_especie: "huron" }, tamano: 96 }),
    ),
  );
  try {
    const svgs = [...m.caja.querySelectorAll("svg")];
    assert.equal(svgs.length, 2, "dos pintan; el perfil vacío no");
    assert.equal(svgs[0].getAttribute("data-mascota"), "perro");
    assert.equal(svgs[1].getAttribute("data-mascota"), "huron", "lee la especie de la fila del perfil");
    assert.ok(svgs[0].querySelector("circle"), "y lleva dibujo dentro");
  } finally { m.desmontar(); }
});

test("sin título es decorativa; con título es una imagen con nombre", () => {
  const m = montar(
    React.createElement(
      "div",
      null,
      React.createElement(Mascota, { especie: "gato", tamano: 56 }),
      React.createElement(Mascota, { especie: "gato", tamano: 56, titulo: "Tu mascota: Pelusa" }),
    ),
  );
  try {
    const [decorativa, conNombre] = [...m.caja.querySelectorAll("svg")];
    assert.equal(decorativa.getAttribute("aria-hidden"), "true");
    assert.equal(conNombre.getAttribute("role"), "img");
    assert.equal(conNombre.getAttribute("aria-label"), "Tu mascota: Pelusa");
  } finally { m.desmontar(); }
});

/*
 * 0174: las funciones vigentes aceptan exactamente lo mismo que el check (una
 * lista propia desfasada ya pasó con mascota_elegir, 20-nov).
 */
test("mascota_personalizar y mascota_ojos_elegir aceptan lo mismo que sus checks", () => {
  const lista = (t, re) => t.match(re)[1].match(/'([^']+)'/g).map((x) => x.slice(1, -1)).sort();
  const fun = ultimaCon(/create or replace function public\.mascota_personalizar\(/);
  assert.deepEqual(lista(fun, /v_paleta not in \(([^)]+)\)/), [...IDS_PALETA].sort());
  const ojos = ultimaCon(/create or replace function public\.mascota_ojos_elegir\(/);
  assert.deepEqual(lista(ojos, /v_ojos not in \(([^)]+)\)/), [...IDS_OJOS].sort());
});

test("cada especie ofrece razas reales: natural primero y solo pelajes válidos", async () => {
  const { RAZAS, razasDe } = await import("../mascotas.js");
  for (const { id } of ESPECIES) {
    const r = RAZAS[id];
    assert.ok(r && r.length >= 3, `${id} tiene al menos tres razas`);
    assert.equal(r[0][0], "natural", `${id}: natural va primero`);
    for (const [p, nombre] of r.slice(1)) assert.ok(IDS_PALETA.includes(p) && nombre, `${id}/${p} es un pelaje válido con nombre`);
  }
  /* Un color que venía de otra especie sigue en la lista, para verse elegido. */
  assert.ok(razasDe("panda", "jengibre").some((x) => x.id === "jengibre"));
});
