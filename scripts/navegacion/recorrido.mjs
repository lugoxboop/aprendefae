/*
 * Recorre la navegación tocando de verdad: cada opción del menú de cuenta, las
 * tres formas de cerrarlo, «Inicio» de cada materia, volver de un tema y salir
 * de perfil, amigos, clase en vivo y «qué es». A 320, 375 y 1280 px, con el
 * movimiento puesto (sin «reducir movimiento»: con él se esconden fallos).
 *
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build --outDir /tmp/dist
 *   (cd /tmp/dist && python3 -m http.server 8100) &
 *   node scripts/navegacion/recorrido.mjs http://localhost:8100
 */
import { chromium, abrir } from "./base.mjs";
import { mkdirSync } from "node:fs"; mkdirSync("capturas-navegacion", { recursive: true });
const U = process.argv[2]; const nav = await chromium.launch(); const res = [];
const ok = (n, c) => res.push(`${c ? "✓" : "✗"} ${n}`);
const hash = (p) => p.evaluate(() => location.hash || "#/");
for (const [w,h] of [[320,568],[375,667],[1280,800]]) {
  // Menú: cada opción lleva a su sitio
  for (const [opcion, esperado] of [["Inicio","#/"],["Panel docente","#/docente"],["Clase en vivo","#/vivo"],["Mi perfil","#/perfil"],["Amigos","#/amigos"],["Mi avatar","#/perfil/avatar"],["Tienda","#/tienda"]]) {
    const { ctx, page } = await abrir(nav, U, w, h, "#/politica-fiscal");
    await page.click(".fae-cuenta-boton"); await page.waitForTimeout(900);
    await page.locator("[data-panel-cuenta] button", { hasText: opcion }).first().click(); await page.waitForTimeout(900);
    const hh = await hash(page); const cerrado = !(await page.$("[data-panel-cuenta]"));
    ok(`${w}px menú «${opcion}» → ${hh}${cerrado ? "" : " (menú no se cerró)"}`, (hh === esperado || hh.startsWith(esperado + "/") || (esperado==="#/" && (hh==="#/"||hh===""||hh==="#/home"))) && cerrado);
    await ctx.close();
  }
  // Formas de cerrar
  for (const forma of ["X","velo","Escape"]) {
    const { ctx, page } = await abrir(nav, U, w, h, "#/macroeconomia");
    await page.click(".fae-cuenta-boton"); await page.waitForTimeout(900);
    if (forma==="X") { const b = await page.locator(".fae-cerrar-panel").boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); }
    if (forma==="velo") await page.mouse.click(w-10, h/2);
    if (forma==="Escape") await page.keyboard.press("Escape");
    await page.waitForTimeout(700);
    ok(`${w}px cerrar menú con ${forma}`, !(await page.$("[data-panel-cuenta]")));
    await ctx.close();
  }
  // Botón Inicio de cada materia, y volver de un tema a su materia
  for (const m of ["macroeconomia","contabilidad","pensamiento-estrategico"]) {
    const { ctx, page } = await abrir(nav, U, w, h, `#/${m}`);
    const b = await page.locator("button.fae-boton-inicio").boundingBox();
    await page.mouse.click(b.x+b.width/2, b.y+b.height/2); await page.waitForTimeout(800);
    const hh = await hash(page); ok(`${w}px «‹ Inicio» en ${m} (${Math.round(b.width)}×${Math.round(b.height)} px) → ${hh}`, hh==="#/"||hh===""||hh==="#/home");
    await ctx.close();
  }
  for (const [t, m] of [["politica-fiscal","#/macroeconomia"],["introduccion-contabilidad","#/contabilidad"],["fuerzas-porter","#/pensamiento-estrategico"]]) {
    const { ctx, page } = await abrir(nav, U, w, h, `#/${t}`);
    const b = await page.locator("button[aria-label^='Volver a']").first().boundingBox();
    await page.mouse.click(b.x+b.width/2, b.y+b.height/2); await page.waitForTimeout(800);
    const hh = await hash(page); ok(`${w}px volver desde ${t} → ${hh}`, hh===m || hh.startsWith(m));
    await ctx.close();
  }
  // Salir de clase en vivo, y Volver de perfil/tienda/amigos
  for (const [r, sel] of [["vivo","button:has-text('Salir')"],["perfil","button[aria-label='Volver']"],["amigos","button[aria-label='Volver']"],["que-es","button[aria-label='Volver']"]]) {
    const { ctx, page } = await abrir(nav, U, w, h, `#/macroeconomia`);
    await page.evaluate((r)=>{ location.hash = "#/"+r; }, r); await page.waitForTimeout(1500);
    const b = await page.locator(sel).first().boundingBox();
    await page.mouse.click(b.x+b.width/2, b.y+b.height/2); await page.waitForTimeout(800);
    const hh = await hash(page); ok(`${w}px salir de ${r} → ${hh}`, hh !== "#/"+r);
    await ctx.close();
  }
}
// Fotos
for (const [w,h] of [[375,667],[1280,720]]) {
  const { ctx, page } = await abrir(nav, U, w, h, "#/macroeconomia", { quieto: true });
  await page.screenshot({ path: `capturas-navegacion/materia-${w}.png` });
  await page.click(".fae-cuenta-boton"); await page.waitForTimeout(800);
  await page.screenshot({ path: `capturas-navegacion/menu-${w}.png` });
  await ctx.close();
}
await nav.close();
console.log(res.join("\n")); console.log(`\n${res.filter(r=>r[0]==="✓").length}/${res.length} bien`);
