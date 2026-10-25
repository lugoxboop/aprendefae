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
/* La búsqueda de Playwright vive en sondas/navegador.mjs: cubre el contenedor
   de los agentes y también GitHub Actions, que no comparten ni el paquete ni
   el ejecutable. */
import { chromium } from "./sondas/navegador.mjs";
const TEMA = process.argv[2] ?? "Las cuentas, el debe y el haber";
const ANCHO = Number(process.argv[3] ?? 320);
const RAIZ = `http://127.0.0.1:${process.env.PUERTO ?? 8099}/`;

const MIRA = `(() => {
  const ficha = document.querySelector("[data-cuenta-compacta], [aria-label^='Tu cuenta'], .fae-cuenta-compacta");
  const env = ficha ? ficha.closest("div[style*='fixed']") || ficha : null;
  if (!env) return { sinFicha: true };
  const f = env.getBoundingClientRect();
  if (f.width < 2) return { sinFicha: true };
  /*
   * Cabe un dedo? El estorbo es un solo rectangulo, asi que las sobras del
   * control son cuatro candidatos exactos: arriba, abajo, izquierda y derecha.
   */
  const cabeElDedo = (r) => {
    const pideW = Math.min(44, r.width);
    const pideH = Math.min(44, r.height);
    return [
      { w: r.width, h: Math.min(r.bottom, f.top) - r.top },
      { w: r.width, h: r.bottom - Math.max(r.top, f.bottom) },
      { w: Math.min(r.right, f.left) - r.left, h: r.height },
      { w: r.right - Math.max(r.left, f.right), h: r.height },
    ].some((c) => c.w >= pideW && c.h >= pideH);
  };
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
    const tocable = /^(button|a)$/i.test(el.tagName);

    /*
     * TERCER CRITERIO, y la razon de cambiarlo otra vez.
     *
     * El segundo era «el centro queda debajo». Acuso una flecha de 34 x 94 a
     * la que la ficha le tapa 38 px del medio y le deja 46 libres abajo: mas
     * que el piso de toque de 44. El dedo llega de sobra. El centro es el
     * sitio natural en un boton de 44, pero en uno alto no manda.
     *
     * Asi que para lo que se TOCA: inalcanzable es que no quede ni una zona
     * libre de 44 x 44 (o del tamano del control, si es mas chico). Se calcula
     * exacto porque el estorbo es un solo rectangulo: arriba, abajo, izquierda
     * y derecha de la ficha dentro del control.
     *
     * Para lo que se LEE sigue valiendo el centro: un texto con la ficha
     * encima no se lee ahi, y no hay dedo que lo arregle.
     */
    let decorativo = false;
    if (tocable) {
      if (cabeElDedo(r)) continue;
    } else {
      const quien = document.elementFromPoint(cx, cy);
      if (!(quien && (env.contains(quien) || quien === env))) continue;
      /*
       * Un glifo dentro de un boton que SI es alcanzable no es un hallazgo
       * aparte: su alcance es el del boton. Pero tampoco se tira a la basura,
       * porque taparlo es un problema de lectura — el estudiante ve un boton
       * con la flecha escondida. Va contado aparte, fuera del numero de
       * cabecera, para que ese numero no se infle con cosmetica.
       */
      const padre = el.closest("button, a");
      if (padre && padre !== el && cabeElDedo(padre.getBoundingClientRect())) decorativo = true;
    }
    tapados.push({ texto: txt.slice(0, 40), etiqueta: el.tagName.toLowerCase(), tocable, decorativo });
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
/*
 * CÓMO LLEGA LA SONDA AL TEMA, en orden de preferencia.
 *
 *   RUTA=#/activos-financieros   el tema por su dirección. Hay temas ocultos
 *                                del índice cuya ruta sí abre, y a esos no se
 *                                llega tocando botones (#349).
 *   MATERIA_ID=contabilidad      la MATERIA por su dirección, y de ahí el tema
 *                                con un toque.
 *   MATERIA="Macroeconomía"      desde la portada, a golpe de botón.
 *
 * El del medio existe desde el 27-oct y es el que debería usarse siempre: la
 * portada dejó de enseñar Pensamiento Estratégico, así que buscar ahí un
 * botón con el nombre de la materia falla para esa materia. Una sonda que
 * depende de lo que la portada enseñe hoy se rompe cada vez que la portada
 * cambie, y la portada va a seguir cambiando.
 */
if (process.env.RUTA) {
  await p.goto(RAIZ + process.env.RUTA, { waitUntil: "networkidle" });
  await p.waitForTimeout(700);
} else {
  const pasos = [];
  if (process.env.MATERIA_ID) {
    await p.goto(`${RAIZ}#/${process.env.MATERIA_ID}`, { waitUntil: "networkidle" });
  } else {
    await p.goto(RAIZ, { waitUntil: "networkidle" });
    pasos.push(process.env.MATERIA ?? "Contabilidad");
  }
  await p.waitForTimeout(700);
  for (const paso of [...pasos, TEMA]) {
  /*
   * El ratón se aparta antes de cada toque: tras tocar la materia quedaba
   * encima de la tarjeta de T3, que al pasar el ratón sube 2 px, deja de
   * estar debajo, baja, y vuelve a subir. Playwright la veía «inestable» y la
   * sonda salía NO MEDIDO (ficha-tapa de «Ingresos, gastos y ajustes»).
   */
  await p.mouse.move(1, 1);
    await p.locator(`button:visible:has-text("${paso}")`).first().click({ timeout: 9000 });
    await p.waitForTimeout(700);
  }
}
const todos = [];
const glifos = [];
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
      for (const t of r.tapados) (t.decorativo ? glifos : todos).push(`${t.tocable ? "CONTROL" : "texto  "}  «${t.texto}»`);
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
  if (glifos.length) console.log(`Y ${new Set(glifos).size} glifo(s) dentro de controles que SÍ se alcanzan: tapan el dibujo, no el toque.`);
  console.log(`Pantallas CON ficha: ${conFicha} · SIN ficha: ${sinFicha}.`);
  process.exit(conFicha === 0 ? 2 : (u.length === 0 ? 0 : 1));
}
/*
 * EL CAMINO DE HACER, NODO POR NODO (#349). Cada nodo se abre desde la
 * dirección del camino, de cero, y si sale su ficha se toca «Empezar».
 * Antes la sonda volvía con el historial y salía del tema: medía UNA
 * actividad, 3 pantallas por tema, un verde que casi no midió nada.
 *
 * Dentro de la actividad se mide arriba, en dos alturas intermedias y abajo
 * del todo, y lo mismo después de tocar «Saltar» o el primer botón de
 * avance, si lo hay: el tutorial y el juego son pantallas distintas.
 */
const CAMINO = p.url();
/* Los ids de los nodos VISIBLES, sin repetir: hay caminos con copias ocultas para otro ancho. */
const idsDeNodos = await p.evaluate(() => [...new Set([...document.querySelectorAll("[data-nodo]")]
  .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; })
  .map((e) => e.dataset.nodo))]);
const medirAqui = async () => {
  for (const desplazar of [0, 220, 460, "fondo"]) {
    await p.evaluate((d) => window.scrollTo(0, d === "fondo" ? document.documentElement.scrollHeight : d), desplazar);
    await p.waitForTimeout(260);
    const r = await p.evaluate(MIRA);
    if (r.sinFicha) { sinFicha++; continue; }
    conFicha++;
    for (const t of r.tapados) (t.decorativo ? glifos : todos).push(`${t.tocable ? "CONTROL" : "texto  "}  «${t.texto}»`);
  }
};
let actividades = 0;
for (const id of idsDeNodos) {
  /* De cero: un cambio solo de hash no siempre cierra la actividad abierta. */
  await p.goto("about:blank");
  await p.goto(CAMINO, { waitUntil: "networkidle" }).catch(() => {});
  await p.waitForTimeout(700);
  const nodo = p.locator(`[data-nodo="${id}"]:visible`).first();
  if ((await nodo.count()) === 0) continue;
  await nodo.scrollIntoViewIfNeeded().catch(() => {});
  await nodo.click({ timeout: 5000 }).catch(() => {});
  await p.waitForTimeout(600);
  /* Unos caminos abren la ficha del nodo con «Empezar»; otros, la actividad directamente. */
  const empezar = p.locator("button.fae-dn-empezar:visible");
  if ((await empezar.count()) > 0) await empezar.first().click({ timeout: 5000 }).catch(() => {});
  await p.waitForTimeout(900);
  /* Dentro de una actividad siempre está «Volver al camino»; la dirección no siempre cambia. */
  const dentro = (await p.locator('button:visible:has-text("Volver al camino")').count()) > 0;
  if (process.env.DEPURAR) console.log("nodo", id, dentro);
  if (!dentro) continue;
  actividades++;
  await medirAqui();
  const avance = p.locator('button:visible:has-text("Saltar"), button:visible:has-text("Empezar"), button:visible:has-text("Siguiente")');
  if ((await avance.count()) > 0) {
    await avance.first().click({ timeout: 5000 }).catch(() => {});
    await p.waitForTimeout(700);
    await medirAqui();
  }
}
console.log(`Actividades abiertas: ${actividades} de ${idsDeNodos.length} nodos.`);
await b.close();
const unicos = [...new Set(todos)];
for (const t of unicos) console.log("  " + t);
console.log(`\n${unicos.length} elemento(s) tapados por la ficha de FP en «${TEMA}» a ${ANCHO} px.`);
if (glifos.length) console.log(`Y ${new Set(glifos).size} glifo(s) dentro de controles que SÍ se alcanzan: tapan el dibujo, no el toque.`);
console.log(`Pantallas CON ficha: ${conFicha} · SIN ficha: ${sinFicha}.`);
if (conFicha === 0) {
  console.log("NO MEDIDO: la ficha no se pintó en ninguna pantalla, así que este cero no vale.");
  console.log("La píldora de FP solo sale con sesión; sin ella no hay nada que pueda tapar.");
  process.exit(2);
}
process.exit(unicos.length === 0 ? 0 : 1);
