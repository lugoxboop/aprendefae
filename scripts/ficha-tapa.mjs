/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿LA FICHA DE FP TAPA ALGO?
 *
 * La píldora de la cuenta va FIJA arriba a la derecha y es deliberado: dentro
 * de una actividad los FP en vivo importan más que la identidad. Lo que no
 * puede pasar es que se coma un título o un control: un botón que no se puede
 * tocar porque hay algo encima no es un botón.
 *
 * Esta sonda busca el solape de verdad: no mira si dos rectángulos se cruzan
 * —eso lo hace cualquier cosa fija— sino si en el punto donde debería estar
 * el texto o el control, quien recibe el toque es la píldora.
 *
 * Se corre con el paquete construido y servido:
 *   node scripts/ficha-tapa.mjs "Las cuentas, el debe y el haber" 320
 * ═══════════════════════════════════════════════════════════════════════════
 */
import pkg from "/opt/npm-tools/node_modules/playwright-core/index.js";
const { chromium } = pkg;
const TEMA = process.argv[2] ?? "Las cuentas, el debe y el haber";
const ANCHO = Number(process.argv[3] ?? 320);
const RAIZ = `http://127.0.0.1:${process.env.PUERTO ?? 8099}/`;

const MIRA = `(() => {
  const ficha = document.querySelector("[data-cuenta-compacta], [aria-label^='Tu cuenta'], .fae-cuenta-compacta");
  const env = ficha ? ficha.closest("div[style*='fixed']") || ficha : null;
  if (!env) return { sinFicha: true };
  const f = env.getBoundingClientRect();
  if (f.width < 2) return { sinFicha: true };
  const tapados = [];
  for (const el of document.querySelectorAll("h1,h2,h3,p,span,button,a")) {
    if (env.contains(el) || el.contains(env)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (r.bottom < f.top || r.top > f.bottom || r.right < f.left || r.left > f.right) continue;
    const txt = (el.textContent || "").trim();
    if (!txt) continue;
    /*
     * Tapado NO es cruzarse. Una ficha que muerde la esquina de un botón de
     * 256 px no lo rompe: el dedo llega al resto. Lo que lo rompe es que el
     * CENTRO quede debajo, porque ahí es donde se toca.
     *
     * Lo midió esta misma sonda contra sí misma: marcaba una opción de
     * 256 × 62 a la que la ficha le comía 19 × 29 de la esquina, y la daba
     * por tapada. Habría arreglado algo que no estaba roto.
     */
    const cx = (r.left + r.right) / 2;
    const cy = (r.top + r.bottom) / 2;
    if (cy < 0 || cy > window.innerHeight) continue;
    const quien = document.elementFromPoint(cx, cy);
    const centroTapado = quien && (env.contains(quien) || quien === env);
    if (!centroTapado) continue;
    tapados.push({ texto: txt.slice(0, 40), etiqueta: el.tagName.toLowerCase(), tocable: /^(button|a)$/i.test(el.tagName) });
  }
  return { ficha: [Math.round(f.left), Math.round(f.top), Math.round(f.width), Math.round(f.height)], tapados };
})()`;

/*
 * La ficha de FP solo existe CON sesión, así que sin fingir una esta sonda
 * mide un cero vacío. La receta es la misma que usa la sonda de enganche:
 * una sesión en localStorage y los tres caminos de Supabase respondidos aquí.
 */
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const exp = Math.floor(Date.now() / 1000) + 3600;
const USUARIO = { id: "00000000-0000-0000-0000-000000000001", aud: "authenticated", role: "authenticated", email: "p@s.test", app_metadata: {}, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" };
const SESION = { access_token: b64({ alg: "HS256", typ: "JWT" }) + "." + b64({ sub: USUARIO.id, exp, role: "authenticated", aud: "authenticated" }) + ".f", token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: "r", user: USUARIO };

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: ANCHO, height: 760 } });
await p.addInitScript((s2) => { try { localStorage.setItem("aprendefae-auth", s2); } catch (e) {} }, JSON.stringify(SESION));
await p.route("**/*", (route) => {
  const u = route.request().url();
  if (u.includes("/auth/v1/user")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(USUARIO) });
  if (u.includes("/rest/v1/rpc/registrar_fp")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ fp_awarded: 0, repeat_index: 0 }) });
  if (u.includes("/rest/v1/profiles")) {
    /*
     * El PEOR caso, no uno cómodo: apodo largo y muchos FP hacen la ficha
     * todo lo ancha que puede ser. Con un apodo corto medía 37 px y no tapaba
     * nada; eso habría sido un verde de laboratorio.
     */
    const perfil = { user_id: USUARIO.id, nickname: process.env.APODO ?? "Mateo Lugo Duque", full_name: "Mateo Lugo Duque", fp_total: 987654 };
    const objeto = (route.request().headers()["accept"] || "").includes("vnd.pgrst.object");
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(objeto ? perfil : [perfil]) });
  }
  if (/supabase\.co/.test(u)) return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  return route.continue();
});
await p.goto(RAIZ, { waitUntil: "networkidle" });
for (const paso of ["Contabilidad", TEMA]) {
  await p.locator(`button:visible:has-text("${paso}")`).first().click({ timeout: 9000 });
  await p.waitForTimeout(700);
}
const todos = [];
let sinFicha = 0, conFicha = 0;
const APRENDER = process.argv.includes("--aprender");
for (const rotulo of APRENDER ? ["El material que explica", "Aprender"] : ["Los juegos que dan FP", "Hacer"]) {
  const puerta = p.locator(`button:visible:has-text("${rotulo}")`);
  if ((await puerta.count()) === 0) continue;
  await puerta.first().click({ timeout: 9000 }).catch(() => {});
  await p.waitForTimeout(800);
  break;
}
if (APRENDER) {
  const AVANCE = 'button:visible:has-text("Siguiente"), button:visible:has-text("Seguir")';
  for (let i = 0; i < 26; i++) {
    /*
     * Posiciones NATURALES, no inventadas: arriba del todo y abajo del todo.
     * Desplazar a un número arbitrario puede poner un botón bajo la ficha en
     * un sitio donde el estudiante nunca lo deja, y eso sería un fallo mío,
     * no de la pantalla.
     */
    for (const desplazar of ["arriba", "abajo"]) {
      await p.evaluate((d) => window.scrollTo(0, d === "arriba" ? 0 : document.documentElement.scrollHeight), desplazar);
      await p.waitForTimeout(240);
      const r = await p.evaluate(MIRA);
      if (r.sinFicha) { sinFicha++; continue; }
      conFicha++;
      for (const t of r.tapados) todos.push(`${t.tocable ? "CONTROL" : "texto  "}  «${t.texto}»`);
    }
    const sig = p.locator(AVANCE);
    if ((await sig.count()) === 0) break;
    await sig.first().click({ timeout: 5000 }).catch(() => {});
    await p.waitForTimeout(340);
  }
  await b.close();
  const u = [...new Set(todos)];
  for (const t of u) console.log("  " + t);
  console.log(`\n${u.length} elemento(s) tapados por la ficha de FP en «${TEMA}» (Aprender) a ${ANCHO} px.`);
  console.log(`Pantallas CON ficha: ${conFicha} · SIN ficha: ${sinFicha}.`);
  process.exit(conFicha === 0 ? 2 : (u.length === 0 ? 0 : 1));
}
const nodos = await p.locator("[data-nodo], .fae-ch-estrecho .fae-ch-rotulo").count();
for (let k = 0; k < Math.min(nodos, 10); k++) {
  const punto = await p.evaluate((i) => {
    const e = [...document.querySelectorAll("[data-nodo], .fae-ch-estrecho .fae-ch-rotulo")][i];
    if (!e) return null;
    const r = e.getBoundingClientRect();
    if (r.width < 2) return null;
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, k);
  if (!punto) continue;
  await p.mouse.click(punto.x, punto.y);
  await p.waitForTimeout(900);
  for (const desplazar of [0, 220, 460]) {
    await p.evaluate((d) => window.scrollTo(0, d), desplazar);
    await p.waitForTimeout(260);
    const r = await p.evaluate(MIRA);
    if (r.sinFicha) { sinFicha++; continue; }
    conFicha++;
    for (const t of r.tapados) todos.push(`${t.tocable ? "CONTROL" : "texto  "}  «${t.texto}»`);
  }
  await p.goBack().catch(() => {});
  await p.waitForTimeout(600);
}
await b.close();
const unicos = [...new Set(todos)];
for (const t of unicos) console.log("  " + t);
console.log(`\n${unicos.length} elemento(s) tapados por la ficha de FP en «${TEMA}» a ${ANCHO} px.`);
console.log(`Pantallas CON ficha: ${conFicha} · SIN ficha: ${sinFicha}.`);
if (conFicha === 0) {
  console.log("NO MEDIDO: la ficha no se pintó en ninguna pantalla, así que este cero no vale.");
  console.log("La píldora de FP solo sale con sesión; sin ella no hay nada que pueda tapar.");
  process.exit(2);
}
process.exit(unicos.length === 0 ? 0 : 1);
