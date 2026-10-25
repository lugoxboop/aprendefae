/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «DEL RESULTADO A LA CAJA» (#557) · LAS DOS CAPTURAS DE PENSAMIENTO
 * ESTRATÉGICO que pide Kamogawa, porque el PR toca dos archivos compartidos:
 * src/docente/etiquetasItem.js y src/data/subjects.js.
 *
 *   (a) el panel docente con un ítem de PE y sus etiquetas: «Radar de
 *       profundidad» (#/docente/radar-profundidad) con un diagnóstico por
 *       ítem cuyos ids son los de BLIPS_RADAR; cada renglón debe salir con su
 *       enunciado (etiquetaDeItem), ninguno con el id interno;
 *   (b) la lista de temas de PE cargando (#/pensamiento-estrategico): los
 *       tres temas de SUBJECTS["pensamiento-estrategico"] en pantalla.
 *
 * Sobre dist servido (vite build con Supabase falso), con la sesión fingida y
 * el curso falso del panel (scripts/t4/panel-docente/pagina.mjs); encima, las
 * RPC de PE. Nada escribe en ningún lado. A 320 × 568 y 375 × 667, a media
 * escala (deviceScaleFactor 1).
 *
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build
 *   npx vite preview --port 8099 --strictPort &
 *   node --import ./scripts/cargador-jsx.mjs scripts/t3/capturas-pe-resultado-caja.mjs [http://localhost:8099] [carpeta]
 *
 * Sale con 1 si algo no cumple.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { abrirPanel, chromium, RAIZ } from "../t4/panel-docente/pagina.mjs";
import { BLIPS_RADAR } from "../../src/data/icebergActividades.js";
import { SUBJECTS } from "../../src/data/subjects.js";
import { etiquetaDeItem } from "../../src/docente/etiquetasItem.js";

const URL_BASE = process.argv[2] ?? "http://localhost:8099";
const DIR = process.argv[3] ?? join(RAIZ, "orquestador/revisiones/t3-del-resultado-a-la-caja");
mkdirSync(DIR, { recursive: true });
const ACT = "radar-profundidad";
const PE = SUBJECTS["pensamiento-estrategico"];
const ALTOS = { 320: 568, 375: 667 };
const fallos = [];
const salida = [];

/* El diagnóstico por ítem de «Radar de profundidad»: un renglón por blip, con fallos inventados y fijos. */
const ITEMS = BLIPS_RADAR.slice(0, 6).map((b, k) => {
  const veces = 24;
  const fallos = [11, 3, 7, 14, 2, 5][k];
  return { item_id: b.id, veces, fallos, pct_fallo: (fallos / veces) * 100, respuesta_top: null, respuesta_top_veces: null };
});
const ACTIVIDAD = {
  activity_id: ACT, modality: "evaluativa", difficulty: "media", completaron: 18, en_grupo: 14, grupo_total: 22,
  intentos: 24, pct_medio: 71.4, distribucion_visible: true, banda_alta: 7, banda_media: 8, banda_baja: 3,
  duracion_media_ms: 184000, fp_medio: 62, intentos_con_detalle: 24, detalle_desde: "2026-10-01T12:00:00Z",
};

async function conPE(page) {
  await page.route("**/rest/v1/rpc/**", async (route) => {
    const rpc = route.request().url().match(/\/rpc\/([a-z_]+)/)?.[1];
    const json = (x) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(x) });
    if (rpc === "materias_docente") return json(["pensamiento-estrategico", "contabilidad"]);
    if (rpc === "panel_actividad") return json([ACTIVIDAD]);
    if (rpc === "panel_items") return json(ITEMS);
    return route.fallback();
  });
}

const nav = await chromium.launch();
for (const ancho of [320, 375]) {
  /* (a) El panel docente con un ítem de PE y sus etiquetas. */
  {
    const { ctx, page, errores } = await abrirPanel(nav, { url: URL_BASE, ancho, alto: ALTOS[ancho], ruta: `#/docente/${ACT}` });
    await conPE(page);
    await page.reload();
    const esperadas = ITEMS.map((it) => etiquetaDeItem(ACT, it.item_id));
    if (esperadas.some((e) => !e)) fallos.push(`${ancho}: etiquetaDeItem no nombra todos los ítems de ${ACT}`);
    await page.waitForFunction((t) => document.body.innerText.includes(t), esperadas[0].slice(0, 30), { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(500);
    const r = await page.evaluate(({ esperadas, ids }) => {
      const texto = document.body.innerText;
      const primera = [...document.querySelectorAll("div, p, span")].find((el) => el.children.length === 0 && el.textContent.trim().startsWith(esperadas[0].slice(0, 30)));
      primera?.scrollIntoView({ block: "center" });
      return {
        vistas: esperadas.filter((e) => texto.includes(e.slice(0, 30))).length,
        idsCrudos: ids.filter((id) => new RegExp(`(^|\\s)${id}(\\s|$)`).test(texto)),
        sinNombrar: /no se pud(o|ieron) nombrar/.test(texto),
        barra: document.documentElement.scrollWidth > innerWidth + 1,
      };
    }, { esperadas, ids: ITEMS.map((it) => it.item_id) });
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(DIR, `pe-panel-docente-${ancho}.png`), fullPage: true });
    salida.push(`| ${ancho} | (a) panel docente, «Radar de profundidad» | ${r.vistas} de ${esperadas.length} ítems con su enunciado | ids crudos: ${r.idsCrudos.length ? r.idsCrudos.join(", ") : "ninguno"} | aviso «no se pudo nombrar»: ${r.sinNombrar ? "sí" : "no"} | barra: ${r.barra ? "sí" : "no"} | errores: ${errores.length} |`);
    if (r.vistas !== esperadas.length || r.idsCrudos.length || r.sinNombrar || r.barra || errores.length) fallos.push(`${ancho} · (a): ${JSON.stringify({ ...r, errores })}`);
    await ctx.close();
  }
  /* (b) La lista de temas de PE cargando. */
  {
    const { ctx, page, errores } = await abrirPanel(nav, { url: URL_BASE, ancho, alto: ALTOS[ancho], ruta: "#/pensamiento-estrategico" });
    const nombres = PE.topics.map((t) => t.title);
    await page.waitForFunction((n) => n.every((x) => document.body.textContent.includes(x)), nombres, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(600);
    const r = await page.evaluate((n) => ({
      vistos: n.filter((x) => document.body.textContent.includes(x)).length,
      cargando: /Cargando…/.test(document.body.innerText),
      barra: document.documentElement.scrollWidth > innerWidth + 1,
    }), nombres);
    await page.screenshot({ path: join(DIR, `pe-temas-${ancho}.png`) });
    salida.push(`| ${ancho} | (b) temas de PE | ${r.vistos} de ${nombres.length} temas en pantalla (${nombres.join(", ")}) | queda «Cargando…»: ${r.cargando ? "sí" : "no"} | — | barra: ${r.barra ? "sí" : "no"} | errores: ${errores.length} |`);
    if (r.vistos !== nombres.length || r.cargando || r.barra || errores.length) fallos.push(`${ancho} · (b): ${JSON.stringify({ ...r, errores })}`);
    await ctx.close();
  }
}
await nav.close();
console.log("| Ancho | Captura | Lo que se ve | | | | |\n|---|---|---|---|---|---|---|");
console.log(salida.join("\n"));
console.log(fallos.length ? `\n${fallos.length} NO CUMPLEN:\n${fallos.join("\n")}` : "\nPE cumple a 320 y 375: los ítems de «Radar de profundidad» salen con su enunciado y la lista de temas carga entera.");
process.exit(fallos.length ? 1 : 0);
