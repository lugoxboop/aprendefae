import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TODO BOTÓN DE LA CÉLULA C MIDE 44 PX DE ALTO COMO MÍNIMO.
 *
 * L, tras el juego de Watari: en T7-1 · A1 («La cuenta que no se mueve») los
 * botones medían 41 y 42 px de alto (Chromium, 320 px: 40,8 las opciones y
 * 41,5 «Empezar», «Seguir», «Confirmar», «Probar otra»). Un dedo pide 44.
 *
 * Como letra-minima-celula-c.test.mjs, la prueba lee el CÓDIGO de los
 * componentes de la célula (mecanicas/libros/t7/*.jsx y t5/*.jsx) y no los
 * pinta. El método, para que sea estático y no dependa de la letra:
 *
 *   1. Busca cada `<button` y recorta su etiqueta de apertura entera
 *      (contando llaves, para no cortar en el `>` de un `=>`).
 *   2. Junta lo que puede darle alto a ese botón:
 *        · sus clases fijas (className="…", el texto antes del primer `${`
 *          de className={`…`}, o la cadena de `let clase = "…"` cuando
 *          className es una variable), y de la hoja CSS del mismo archivo
 *          cada regla cuyo último selector empiece por `.esa-clase`, más las
 *          reglas `… button { }` (botones dentro de un contenedor);
 *        · su style en línea: el objeto `{{ … }}` y el cuerpo de cada
 *          función o constante de estilo que use (boton(…), FICHA_BTN(…)).
 *   3. Pide que en eso haya un `min-height`/`minHeight` (o `height`) de 44 px
 *      o más, y que ninguno de los que haya baje de 44.
 *
 * Se exige la declaración explícita, no la cuenta de relleno + alto de línea:
 * esa cuenta depende de la fuente que cargue (el «normal» de Sora no es el de
 * Inter) y fue justo lo que dejó los de A1 en 41,5. Un botón sin estilo de
 * alto que se encuentre también falla: si viene de lo compartido no es un
 * `<button` de estos archivos y no entra aquí (se le anota a Erwin).
 *
 * La excepción es el «¿Por qué?» del plegado (t7/plegable.jsx, data-por-que):
 * va en línea, dentro del renglón del texto, y no puede medir 44 px sin
 * abrirlo. A él se le exige el área de toque invisible de 44 px por fuera
 * (::before con max(100%, 44px) en alto y ancho), como los botones pequeños
 * de global.css.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = new URL("../../../", import.meta.url);
const enCarpeta = (dir) => readdirSync(new URL(dir, RAIZ)).filter((f) => f.endsWith(".jsx")).map((f) => dir + f);
const ARCHIVOS = [...enCarpeta("src/components/mecanicas/libros/t7/"), ...enCarpeta("src/components/mecanicas/libros/t5/")];
const MINIMO = 44;

/* La etiqueta de apertura desde `<button` hasta su `>`, sin cortar en `=>` ni dentro de llaves o cadenas. */
function etiqueta(fuente, desde) {
  let llaves = 0, comilla = null;
  for (let i = desde + 7; i < fuente.length; i++) {
    const c = fuente[i];
    if (comilla) { if (c === comilla && fuente[i - 1] !== "\\") comilla = null; continue; }
    if (c === '"' || c === "'" || c === "`") comilla = c;
    else if (c === "{") llaves++;
    else if (c === "}") llaves--;
    else if (c === ">" && llaves === 0 && fuente[i - 1] !== "=") return fuente.slice(desde, i + 1);
  }
  throw new Error(`etiqueta sin cerrar en ${desde}`);
}

/* El contenido de la expresión JSX que abre en `{` (posición de la llave). */
function entreLlaves(texto, abre) {
  let n = 0;
  for (let i = abre; i < texto.length; i++) {
    if (texto[i] === "{") n++;
    else if (texto[i] === "}" && --n === 0) return texto.slice(abre + 1, i);
  }
  return texto.slice(abre + 1);
}

/* Las reglas CSS del archivo: selector { declaraciones }, sacadas de las plantillas de estilo. */
function reglas(fuente) {
  const out = [];
  /* Las interpolaciones (${P.texto}) llevan llaves: se cambian por una X antes de leer las reglas. */
  const plano = fuente.replace(/\$\{[^{}]*\}/g, "X");
  for (const m of plano.matchAll(/(^|\n)\s*([.@][^{}\n]*?)\s*\{([^{}]*)\}/g)) out.push({ selector: m[2].trim(), cuerpo: m[3] });
  return out;
}

/* Las clases fijas del botón. */
function clases(tag, fuente, pos) {
  const lit = tag.match(/className="([^"]+)"/) ?? tag.match(/className=\{`([^`$]*)/) ?? tag.match(/className=\{[^}]*?"([a-z0-9-]+)"/);
  if (lit) return lit[1].split(/\s+/).filter(Boolean);
  const v = tag.match(/className=\{([A-Za-z_]\w*)\}/);
  if (v) {
    const antes = fuente.slice(0, pos);
    const d = [...antes.matchAll(new RegExp(`(?:let|const)\\s+${v[1]}\\s*=\\s*["\`]([^"\`$]+)`, "g"))].at(-1);
    if (d) return d[1].split(/\s+/).filter(Boolean);
  }
  return [];
}

/* El cuerpo de una función o constante de estilo: desde su nombre hasta la llave que cierra. */
function definicion(fuente, nombre) {
  const m = new RegExp(`(?:function\\s+${nombre}\\s*\\(|const\\s+${nombre}\\s*=)`).exec(fuente);
  if (!m) return "";
  const abre = fuente.indexOf("{", m.index + m[0].length);
  return abre < 0 ? "" : entreLlaves(fuente, abre);
}

/* Los altos declarados en un trozo: min-height: 44px · minHeight: "44px" · height: 44px · minHeight: 44. */
function altos(trozo) {
  const out = [];
  for (const m of trozo.matchAll(/(?:^|[^-\w])(min-height|height|minHeight)\s*:\s*"?(\d+(?:\.\d+)?)(px)?"?/g)) {
    if (m[1] !== "minHeight" && !m[3]) continue;
    out.push(Number(m[2]));
  }
  return out;
}

/* Lo que da alto a cada botón del archivo. */
function botones(archivo) {
  const fuente = readFileSync(new URL(archivo, RAIZ), "utf8");
  const css = reglas(fuente);
  const out = [];
  for (const m of fuente.matchAll(/<button\b/g)) {
    const tag = etiqueta(fuente, m.index);
    const linea = fuente.slice(0, m.index).split("\n").length;
    const trozos = [];
    for (const c of clases(tag, fuente, m.index)) {
      for (const r of css) if (r.selector.split(",").some((s) => s.trim().split(/\s+/).at(-1).startsWith(`.${c}`) && !/:(focus|hover|active|disabled)|\[aria-/.test(s))) trozos.push(r.cuerpo);
    }
    if (/className=/.test(tag) || !/style=/.test(tag)) for (const r of css) if (r.selector.split(",").some((s) => /\sbutton$/.test(s.trim()))) trozos.push(r.cuerpo);
    const st = tag.indexOf("style={");
    if (st >= 0) {
      const expr = entreLlaves(tag, st + 6);
      trozos.push(expr);
      for (const f of expr.matchAll(/\b([A-Za-z_]\w*)\s*\(/g)) trozos.push(definicion(fuente, f[1]));
      for (const f of expr.matchAll(/\.\.\.([A-Za-z_]\w*)\b(?!\s*\()/g)) trozos.push(definicion(fuente, f[1]));
    }
    const hs = trozos.flatMap(altos);
    out.push({ donde: `${archivo}:${linea}`, altos: hs, completo: tag, tag: tag.replace(/\s+/g, " ").slice(0, 90) });
  }
  return out;
}

const TODOS = ARCHIVOS.flatMap(botones);

test("★★★ la prueba encuentra los botones de la célula y lee sus altos", () => {
  assert.ok(ARCHIVOS.length >= 35, `solo ${ARCHIVOS.length} archivos`);
  assert.ok(TODOS.length >= 35, `solo ${TODOS.length} botones`);
  /* Las tres formas: hoja CSS por clase, estilo en línea y función de estilo. */
  assert.ok(TODOS.find((b) => b.donde.includes("ControlInterno.jsx") && b.tag.includes("t7a7-btn")).altos.includes(44));
  assert.ok(TODOS.find((b) => b.donde.includes("armaLaLinea.jsx")).altos.includes(44));
  assert.ok(TODOS.find((b) => b.completo.includes("FICHA_BTN")).altos.includes(44));
  /* Una variable de clase (let clase = "t7a4-cas") y un botón dentro de un contenedor (.t7kx-punto button). */
  assert.ok(TODOS.find((b) => b.donde.includes("ElCierreEnPeriodico.jsx") && b.tag.includes("className={clase}")).altos.includes(44));
  assert.ok(TODOS.find((b) => b.donde.includes("KardexT7_2.jsx")).altos.includes(44));
  /* Los patrones: los que cuentan y los que no. */
  assert.deepEqual(altos('min-height: 44px; minHeight: "46px" · height: 40px · minHeight: 48 · line-height: 30px · border-radius: 8px'), [44, 46, 40, 48]);
});

const EN_LINEA = (b) => b.tag.includes("data-por-que");

test("★★★ el «¿Por qué?», en línea con el texto, lleva su área de toque de 44 px por fuera", () => {
  const enLinea = TODOS.filter(EN_LINEA);
  assert.equal(enLinea.length, 1);
  const css = readFileSync(new URL("src/components/mecanicas/libros/t7/plegable.jsx", RAIZ), "utf8");
  assert.match(css, /\.fae-por-que \{ position: relative; \}/);
  assert.match(css, /\.fae-por-que::before \{ content: ""; position: absolute;[^}]*width: max\(100%, 44px\); height: max\(100%, 44px\);[^}]*\}/);
});

test("★★★ ningún botón de la célula queda por debajo de 44 px de alto", () => {
  const malos = TODOS.filter((b) => !EN_LINEA(b)).filter((b) => !b.altos.some((h) => h >= MINIMO) || b.altos.some((h) => h < MINIMO)).map((b) => `${b.donde} · altos ${JSON.stringify(b.altos)} · ${b.tag}`);
  assert.deepEqual(malos, []);
});
