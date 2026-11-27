/*
 * Sonda del simulador con IA (Aprender de Macro 2026): abre una pieza en la
 * vista previa con sesión fingida y la IA simulada, recorre puerta →
 * capacitación → expediente y deja capturas (y video con --video) a 320, 375
 * y 1280. Uso:
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=x npx vite build
 *   node scripts/simulador/capturas-simulador.mjs <carpeta> [--video] [--pieza da26-a0-ley-demanda]
 */
import { mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { abrirPanel, chromium, RAIZ } from "../t4/panel-docente/pagina.mjs";

const args = process.argv.slice(2);
const SALIDA = args.find((a) => !a.startsWith("--") && !args[args.indexOf(a) - 1]?.startsWith("--pieza")) ?? "revisiones/simulador";
const VIDEO = args.includes("--video");
const PIEZA = args.includes("--pieza") ? args[args.indexOf("--pieza") + 1] : "da26-a0-ley-demanda";
mkdirSync(SALIDA, { recursive: true });

const CASO = {
  nombre: "Familia Quintero Salgado", titular: "Los Quintero tienen un mejor ingreso este año",
  quien: "Marta Quintero, madre", testigo: "Seguimos recibiendo el mismo subsidio y pagando el mismo porcentaje de impuestos, pero el sueldo es otro.",
  datos: [
    { dato: "Renta mensual de la familia", antes: "4.000.000 pesos", ahora: "5.000.000 pesos", tendencia: "sube" },
    { dato: "Transferencias del Gobierno", antes: "200.000 pesos", ahora: "200.000 pesos", tendencia: "igual" },
    { dato: "Tasa de impuestos directos", antes: "10 %", ahora: "10 %", tendencia: "igual" },
  ],
  respuesta: ["desplaza"],
};

const PUERTO = 4377;
const srv = spawn("npx", ["vite", "preview", "--port", String(PUERTO), "--strictPort"], { cwd: RAIZ, stdio: "ignore" });
await new Promise((r) => setTimeout(r, 2500));
const url = `http://localhost:${PUERTO}`;
const nav = await chromium.launch();
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  for (const [ancho, alto] of [[320, 640], [375, 720], [1280, 820]]) {
    const { ctx, page, errores } = await abrirPanel(nav, { url, ancho, alto, ruta: `#/macro-2026/${PIEZA}` });
    await ctx.close();
    const ctx2 = await nav.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 2, ...(VIDEO ? { recordVideo: { dir: `${SALIDA}/video-${ancho}`, size: { width: ancho, height: alto } } } : {}) });
    // Reusar el enrutado de abrirPanel en el contexto con video.
    const p = await ctx2.newPage();
    await p.route("**/functions/v1/simulador", (r) => {
      let b = {}; try { b = r.request().postDataJSON(); } catch {}
      const cuerpo = b.accion === "caso" ? { caso: CASO, dice: "Compañero, sobre la mesa está el expediente de la familia Quintero Salgado. Fíjate en su renta y en lo que recibe y paga al Gobierno, antes y ahora. Dime qué pasa con su consumo.", sugerencias: ["¿Qué mueve la curva entera?"], usadas: 3, limite: 40 }
        : b.accion === "diagnostico" ? { veredicto: "acierto", correctos: ["desplaza"], dice: "¡Exacto! Cambió la renta, no el precio: la curva entera se corre.", usadas: 4, limite: 40 }
        : { dice: "Buena pregunta.", usadas: 5, limite: 40 };
      return r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" }, body: JSON.stringify(cuerpo) });
    });
    await p.route("**/*", (r) => {
      const u = r.request().url();
      if (u.includes("functions/v1/simulador")) return r.fallback();
      if (u.includes("fake.supabase.test")) {
        if (r.request().method() === "OPTIONS") return r.fulfill({ status: 200, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
        return r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: u.includes("/auth/v1/user") ? JSON.stringify({ id: "00000000-0000-0000-0000-000000000001" }) : "[]" });
      }
      if (u.startsWith(url) || u.includes("fonts.g")) return r.continue();
      return r.abort();
    }, { times: Infinity });
    const ses = await page.evaluate(() => localStorage.getItem("aprendefae-auth")).catch(() => null);
    await p.addInitScript((s) => { try { if (s) localStorage.setItem("aprendefae-auth", s); } catch {} }, ses);
    p.on("pageerror", (e) => console.log("error:", String(e).slice(0, 160)));
    await p.goto(`${url}/#/macro-2026/${PIEZA}`);
    await p.waitForSelector("[data-simulador]", { state: "attached", timeout: 20000 });
    const pest = p.locator('[data-pestana="simulador"]');
    if (await pest.isVisible()) await pest.click();
    await p.waitForSelector("[data-simulador]", { timeout: 5000 });
    // La sonda no tiene sesión real: se esconde el botón flotante de «Entrar» para que no tape la pieza.
    await p.evaluate(() => {
      for (const el of document.querySelectorAll("button, span")) {
        const t = (el.textContent || "").trim();
        if (t !== "Entrar" && t !== "Continuar con Google") continue;
        for (let n = el; n && n !== document.body; n = n.parentElement) if (getComputedStyle(n).position === "fixed") { n.style.visibility = "hidden"; break; }
      }
    });
    const sim = p.locator("[data-simulador]");
    await sim.scrollIntoViewIfNeeded();
    await espera(600);
    await p.screenshot({ path: `${SALIDA}/${ancho}-1-puerta.png` });
    await p.click("[data-entrar]");
    await espera(2600);
    await p.locator("[data-globo]").scrollIntoViewIfNeeded();
    await p.evaluate(() => document.querySelector("[data-sim-escena]").scrollIntoView({ block: "start" }));
    await espera(400);
    await p.screenshot({ path: `${SALIDA}/${ancho}-2-capacitacion.png` });
    while (await p.locator("[data-siguiente-capacitacion]").count()) { await p.click("[data-siguiente-capacitacion]"); await espera(900); }
    await p.waitForSelector("[data-expediente]", { timeout: 10000 });
    await espera(1600);
    await p.evaluate(() => document.querySelector("[data-globo]").scrollIntoView({ block: "start" }));
    await espera(500);
    await p.screenshot({ path: `${SALIDA}/${ancho}-3-expediente.png` });
    await p.click('[data-opcion="desplaza"]');
    await p.click("[data-diagnosticar]");
    await espera(1800);
    await p.evaluate(() => document.querySelector("[data-consigna]").scrollIntoView({ block: "start" }));
    await espera(500);
    await p.screenshot({ path: `${SALIDA}/${ancho}-4-veredicto.png` });
    // Desborde horizontal: nada debe salirse.
    const desborde = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    console.log(`${ancho}px · desborde ${desborde}px · errores ${errores.length}`);
    await ctx2.close();
  }
} finally {
  await nav.close();
  srv.kill();
}
