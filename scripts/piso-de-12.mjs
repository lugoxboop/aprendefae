/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL PISO DE 12 PX, MEDIDO EN LA PÁGINA.
 *
 * La regla está en kit.md: ningún texto que el estudiante tenga que leer baja
 * de 12 px. Hasta hoy se comprobaba con `grep fontSize` sobre los archivos, y
 * así se encontraron cinco sitios. Esta sonda, sobre el paquete construido,
 * encontró 112 en seis rutas.
 *
 * POR QUÉ EL GREP NO LLEGA:
 *
 *   · un tamaño heredado no aparece en el archivo del texto: el `span` que se
 *     lee a 9,5 px no dice nada, lo dice su contenedor;
 *   · un tamaño en `em` o en `rem` depende de dónde cuelgue;
 *   · un tamaño en una hoja de CSS no está en ningún `fontSize:`;
 *   · y un `fontSize: "11px"` que ningún estado llega a pintar es un falso
 *     positivo que hace perder la tarde.
 *
 * Lo que mide: cada elemento con texto propio visible, su `font-size`
 * calculado, y de paso si algo se sale del ancho. Mide el texto QUE SE VE: si
 * una pantalla no se abre, no se mide, y lo dice.
 *
 * CÓMO SE CORRE (hace falta el paquete construido y servido):
 *
 *   VITE_SUPABASE_URL=https://x.supabase.co VITE_SUPABASE_ANON_KEY=x npm run build
 *   (cd dist && python3 -m http.server 8099 &)
 *   node scripts/piso-de-12.mjs 320
 *
 * El alto del marco va holgado a propósito: a 900 px varias pantallas dejan
 * contenido fuera, y lo que no se pinta no se mide. Es el mismo error que la
 * primera sonda de blancos de toque.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import pkg from "/opt/npm-tools/node_modules/playwright-core/index.js";
const { chromium } = pkg;

const ANCHO = Number(process.argv[2] ?? 320);
const PISO = 11.95; /* 11,95 y no 12: un 12 px calculado puede llegar como 11,999 */

const RUTAS = [
  { n: "T1 Aprender", p: ["Contabilidad", "Introducción a la contabilidad", "El material que explica"] },
  { n: "T2 Aprender", p: ["Contabilidad", "Las cuentas, el debe y el haber", "El material que explica"] },
  { n: "T3 Aprender", p: ["Contabilidad", "Ingresos, gastos y ajustes", "El material que explica"] },
  { n: "T5 Aprender", p: ["Contabilidad", "Activos financieros temporales", "El material que explica"] },
  { n: "T6 Aprender", p: ["Contabilidad", "Cuentas por cobrar", "El material que explica"] },
  { n: "T1 Hacer", p: ["Contabilidad", "Introducción a la contabilidad", "Los juegos que dan FP"] },
];

const navegador = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
console.log(`——— piso de 12 px · ${ANCHO} px ———`);
let total = 0;
for (const { n, p } of RUTAS) {
  const pagina = await navegador.newPage({ viewport: { width: ANCHO, height: 1400 } });
  const errores = [];
  pagina.on("pageerror", (e) => errores.push(String(e).slice(0, 70)));
  try {
    await pagina.goto("http://127.0.0.1:8099/", { waitUntil: "networkidle" });
    for (const paso of p) {
      await pagina.locator(`button:visible:has-text("${paso}")`).first().click({ timeout: 8000 });
      await pagina.waitForTimeout(600);
    }
    const r = await pagina.evaluate((piso) => {
      const chicas = [], desbordes = [];
      for (const el of document.querySelectorAll("body *")) {
        const caja = el.getBoundingClientRect();
        if (!caja.width || !caja.height) continue;
        const clase = (el.className || "").toString();
        if (!clase.includes("fae-mesh-blob") && (caja.right > window.innerWidth + 1 || caja.left < -1)) {
          desbordes.push(el.tagName.toLowerCase() + "." + clase.split(" ")[0]);
        }
        /* Texto PROPIO: si no, el <div> de arriba se lleva la culpa de su hijo. */
        if (![...el.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim().length > 1)) continue;
        const px = parseFloat(getComputedStyle(el).fontSize);
        if (px < piso) {
          const datos = [...el.attributes].filter((a) => a.name.startsWith("data-")).map((a) => a.name).join(",");
          chicas.push(`${px}px  ${el.tagName.toLowerCase()}${clase ? "." + clase.split(" ")[0] : ""}${datos ? "[" + datos + "]" : ""}  «${el.textContent.trim().slice(0, 30)}»`);
        }
      }
      return { desbordes: [...new Set(desbordes)], chicas: [...new Set(chicas)],
               texto: (document.body.innerText || "").trim().length,
               scrollH: document.documentElement.scrollWidth > window.innerWidth + 1 };
    }, PISO);
    total += r.chicas.length;
    const bien = r.chicas.length === 0 && r.desbordes.length === 0 && !r.scrollH && r.texto > 50 && errores.length === 0;
    console.log(`${bien ? "✅" : "⚠️ "} ${n.padEnd(12)} bajo 12 px: ${String(r.chicas.length).padStart(3)} · desborde ${r.desbordes.length} · scrollH ${r.scrollH}${errores.length ? " · JS " + errores[0] : ""}`);
    for (const c of r.chicas) console.log("        " + c);
  } catch (e) {
    console.log(`   ✗ ${n.padEnd(12)} no se pudo abrir: ${String(e).slice(0, 60)} — NO se midió`);
  }
  await pagina.close();
}
console.log(`\n${total === 0 ? "✅" : "⚠️ "} ${total} texto(s) por debajo de 12 px en ${RUTAS.length} rutas.`);
await navegador.close();
