/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · LA CABECERA REAL DE APRENDER (condición 6 de #572; paquete v3, §5.4).
 *
 * El paquete supone desde la v2 que todo lo que va encima de la figura mide
 * 124 px, y de ahí sale el tope de 40 px de desborde del apoyo. El banco de
 * medida (harness-secuencias) monta la vista suelta: sin la aplicación, sin
 * el control de la cuenta y sin sesión. Esta sonda la mide en la página real:
 *
 *   dist servido (vite build con Supabase falso), la sesión fingida y las
 *   fuentes de producción (scripts/t4/panel-docente/pagina.mjs), la ruta
 *   real #/ingresos-gastos-y-caja/aprender con ?t3=secuencia, a 320 × 568 y
 *   375 × 667.
 *
 * Mide en cada pantalla pedida, en el estado más largo que declara:
 *   cabecera   del borde de arriba de la página a la figura (px)
 *   figura     modelo + control (150 / 200)
 *   zona       el alto de la zona del apoyo
 *   nav        si la barra «Anterior / Siguiente» queda fija abajo, y su alto
 *   cabe       si el fondo de la zona queda por encima de la barra, sin
 *              desplazar: lo que el estudiante decide cabe junto en la ventana
 *   holgura    los px que sobran (o faltan) entre el fondo de la zona y la barra
 *
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build
 *   npx vite preview --port 8099 --strictPort &
 *   node --import ./scripts/cargador-jsx.mjs scripts/t3/medir-cabecera-real.mjs [http://localhost:8099] [--capturas carpeta] [--solo regex]
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { abrirPanel, chromium, hayFuentes } from "../t4/panel-docente/pagina.mjs";
import { PIEZAS_SECUENCIA_T3, TEMA_SECUENCIA_T3 } from "../../src/components/mecanicas/libros/tema3/secuencia/index.js";

const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const URL_BASE = process.argv[2]?.startsWith("http") ? process.argv[2] : "http://localhost:8099";
const CAPTURAS = arg("--capturas");
const SOLO = arg("--solo") ? new RegExp(arg("--solo")) : /t3-a4-lo-que-ya-se-pago\/asiento-junio/;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
if (!hayFuentes()) console.warn("⚠ Sin las fuentes de producción (bash scripts/t4/sonda-enganche/fuentes.sh): la medida usa la letra de respaldo y no vale.");
const ALTOS = { 320: 568, 375: 667 };
/*
 * UMBRALES VIGILADOS (Takamura, lote 18): estados que hoy caben justo. Se
 * miden SIEMPRE, aunque --solo no los pida, y la sonda falla si su holgura baja
 * del mínimo o si no se pudieron medir. P1-7 inventario «sin responder» mide
 * 0 px a 320 (el aviso de cambio más el título del hecho): un renglón más y
 * la zona queda bajo la barra fija.
 */
const VIGILADOS = [
  { ancho: 320, clave: "t3-a1-vender-no-es-cobrar/inventario", estado: "sin-responder", minimo: 0, nombre: "P1-7 inventario" },
];
const vigilado = (ancho, clave, estado) => VIGILADOS.find((v) => v.ancho === ancho && v.clave === clave && (estado === undefined || v.estado === estado));

const claves = [];
for (const pz of PIEZAS_SECUENCIA_T3) for (const pt of pz.pantallas) claves.push(`${pz.id}/${pt.id}`);
const guardadoDe = (p, s, pt, m) => {
  const estados = {};
  for (const pz of PIEZAS_SECUENCIA_T3) for (const x of pz.pantallas) estados[`${pz.id}/${x.id}`] = x.estadoInicial ?? null;
  estados[`${PIEZAS_SECUENCIA_T3[p].id}/${pt.id}`] = m.estado ?? pt.estadoInicial ?? null;
  return JSON.stringify({ v: 1, p, s, pasos: m.paso ? { [`${PIEZAS_SECUENCIA_T3[p].id}/${pt.id}`]: m.paso } : {}, estados, resueltas: [] });
};

function medir() {
  const raiz = document.querySelector("[data-secuencia-t3]");
  const fig = raiz?.querySelector(".fae-sec-figura");
  const t3s = fig?.querySelector(".t3s");
  if (!t3s) return { falta: "sin figura" };
  const modelo = t3s.querySelector("[data-modelo]").getBoundingClientRect();
  const control = t3s.querySelector("[data-control]").getBoundingClientRect();
  const zona = t3s.querySelector("[data-zona]");
  const hijos = [...zona.children];
  const zTop = hijos.length ? hijos[0].getBoundingClientRect().top : zona.getBoundingClientRect().top;
  const zBottom = hijos.length ? hijos[hijos.length - 1].getBoundingClientRect().bottom : zTop;
  const nav = document.querySelector("[data-navegacion]");
  const navR = nav.getBoundingClientRect();
  const fija = nav.style.position === "fixed";
  const razon = raiz.querySelector("[data-razon]")?.getBoundingClientRect();
  /* La cuenta flotante (AccountControl): si existe, dónde está. */
  const cuenta = document.querySelector(".fae-cuenta-boton")?.getBoundingClientRect() ?? null;
  return {
    cabecera: Math.round(fig.getBoundingClientRect().top + scrollY),
    titularTop: Math.round(raiz.querySelector("h2").getBoundingClientRect().top + scrollY),
    figura: Math.round(control.bottom - modelo.top),
    zona: Math.round(zBottom - zTop),
    zonaFondo: Math.round(zBottom),
    razonFondo: razon ? Math.round(razon.bottom) : null,
    navFija: fija,
    navTop: Math.round(navR.top),
    navAlto: Math.round(navR.height),
    ventana: innerHeight,
    holgura: Math.round(navR.top - zBottom),
    cuenta: cuenta ? `${Math.round(cuenta.left)},${Math.round(cuenta.top)} ${Math.round(cuenta.width)}×${Math.round(cuenta.height)}` : null,
    barra: document.documentElement.scrollWidth > innerWidth + 1,
  };
}

const nav = await chromium.launch();
const filas = [];
for (const ancho of [320, 375]) {
  for (let p = 0; p < PIEZAS_SECUENCIA_T3.length; p += 1) {
    const pz = PIEZAS_SECUENCIA_T3[p];
    for (let s = 0; s < pz.pantallas.length; s += 1) {
      const pt = pz.pantallas[s];
      const clave = `${pz.id}/${pt.id}`;
      const pedida = SOLO.test(clave);
      if (!pedida && !vigilado(ancho, clave)) continue;
      for (const m of pt.medir ?? [{ nombre: "base", estado: pt.estadoInicial ?? null }]) {
        if (!pedida && !vigilado(ancho, clave, m.nombre)) continue;
        const { ctx, page, errores } = await abrirPanel(nav, { url: URL_BASE, ancho, alto: ALTOS[ancho], ruta: "?t3=secuencia#/ingresos-gastos-y-caja/aprender" });
        await page.evaluate(([k, v]) => sessionStorage.setItem(k, v), [`fae-secuencia:${TEMA_SECUENCIA_T3}`, guardadoDe(p, s, pt, m)]);
        await page.reload();
        await page.waitForSelector("[data-secuencia-t3] .t3s", { timeout: 30000 }).catch(() => {});
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(500);
        const r = await page.evaluate(medir);
        filas.push({ ancho, clave, pantalla: `${pz.id.replace(/^t3-a\d-/, "")}/${pt.id}`, estado: m.nombre, errores: errores.length, ...r });
        if (CAPTURAS && m.nombre === (pt.medir?.find((x) => /acierto/.test(x.nombre))?.nombre ?? m.nombre)) {
          await page.screenshot({ path: join(CAPTURAS, `${pz.id.replace(/^t3-a(\d)-.*/, "p$1")}-${s + 1}-cabecera-real-${m.nombre}-${ancho}.png`) });
        }
        await ctx.close();
      }
    }
  }
}
await nav.close();
console.log("| ancho | pantalla | estado | cabecera | titular | figura | zona | nav fija | nav alto | holgura zona→nav | cuenta flotante | barra | errores |");
console.log("|---|---|---|---|---|---|---|---|---|---|---|---|---|");
for (const f of filas) console.log(`| ${f.ancho} | ${f.pantalla} | ${f.estado} | ${f.cabecera ?? f.falta} | ${f.titularTop} | ${f.figura} | ${f.zona} | ${f.navFija ? "sí" : "no"} | ${f.navAlto} | ${f.holgura} | ${f.cuenta ?? "—"} | ${f.barra ? "SÍ" : "no"} | ${f.errores} |`);
const mal = filas.filter((f) => f.falta || f.holgura < 0 || f.barra || f.errores);
console.log(mal.length ? `\n${mal.length} NO CABEN o fallan.` : "\nTodo cabe: el fondo de la zona queda por encima de la barra en cada estado medido.");
console.log("\n## Umbrales vigilados\n");
const vigilancia = VIGILADOS.map((v) => {
  const f = filas.find((x) => x.ancho === v.ancho && x.clave === v.clave && x.estado === v.estado);
  const pasa = Boolean(f) && !f.falta && Number.isFinite(f.holgura) && f.holgura >= v.minimo;
  console.log(`- ${v.nombre} · ${v.estado} · ${v.ancho}: holgura ${f ? f.holgura ?? f.falta : "SIN MEDIR"} px (mínimo ${v.minimo}) → ${pasa ? "vigilado, pasa" : "**FALLA**"}`);
  return pasa;
});
process.exit(mal.length || vigilancia.includes(false) ? 1 : 0);
