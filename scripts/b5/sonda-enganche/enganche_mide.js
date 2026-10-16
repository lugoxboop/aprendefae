/*
 * SONDA DE ENGANCHE (Shibukawa, 15 oct 2026; copia de la Célula B). Mide una tarjeta tal como la ve el estudiante.
 * Lo único de B: el acierto del Retro compartido, que no lleva marca de datos, cuenta como marcador.
 * Se evalúa en la página con page.evaluate(MIDE, {raiz, tarjeta}).
 *  - raiz: selector de algo DENTRO de la tarjeta (p. ej. [data-pieza="..."] o [data-t4-h4]).
 *  - tarjeta: "section" (por defecto: el <section> más cercano, que es el Panel/Marco) o "body".
 * Devuelve: palabras visibles (sin el texto solo para lector), palabras fuera de figura,
 * Y de la figura y de la interacción respecto al tope de la tarjeta, palabras antes de la
 * primera de las dos, mecánica, textos repetidos, foto de la figura y foto de colores teal/ámbar.
 */
(arg) => {
  const raiz = document.querySelector(arg.raiz);
  if (!raiz) return { error: "sin raiz " + arg.raiz };
  let tarjeta = raiz.closest("section") || raiz;
  if (arg.tarjeta === "body") tarjeta = document.body;
  else if (arg.tarjeta && arg.tarjeta.startsWith("padre:")) { tarjeta = raiz; for (let k = +arg.tarjeta.slice(6); k > 0; k--) tarjeta = tarjeta.parentElement; }
  const ct = tarjeta.getBoundingClientRect().top;

  // ¿Lo ve un estudiante vidente? No: display none, visibility hidden, opacity 0, recortado a 1 px (solo lector).
  const veo = (el) => {
    for (let x = el; x && x.nodeType === 1; x = x.parentElement) {
      const c = getComputedStyle(x);
      if (c.display === "none" || c.visibility === "hidden" || c.opacity === "0") return false;
      if (c.clip && c.clip !== "auto" && /rect\(0/.test(c.clip)) return false;
      if (c.clipPath && /inset\(50%/.test(c.clipPath)) return false;
      const r = x.getBoundingClientRect();
      if ((r.width <= 1 || r.height <= 1) && c.overflow === "hidden") return false;
      if (x === tarjeta) break;
    }
    return true;
  };
  const NAV = /^(Siguiente|Ir a |Ver mi resumen|Otra vez|¿Cómo se juega\?|Pausar|Seguir|Empezar|Comprobar|Confirmar|Probar otra|Volver|Jugar|Comenzar|Entendido|Listo|Saltar)/;
  const esNav = (b) => NAV.test((b.innerText || "").replace(/^[?\s]+/, "").trim()) || /¿Cómo se juega\?/.test(b.innerText || "") || ["seguir", "empezar", "probar-otra", "confirmar"].includes(b.dataset?.boton);

  function figurasPadre(f) { const p = f.parentElement && f.parentElement.closest(arg.figura || "figure"); return Boolean(p && tarjeta.contains(p)); }
  const textos = [];
  const w = document.createTreeWalker(tarjeta, NodeFilter.SHOW_TEXT);
  let t;
  while ((t = w.nextNode())) {
    const s = t.textContent;
    if (!s.trim() || !t.parentElement || !veo(t.parentElement)) continue;
    if (t.parentElement.closest("style,script")) continue;
    textos.push(t);
  }
  const cuenta = (s) => (s.match(/[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ$¿¡«»]+[^\s]*/g) || []).length;

  const SELFIG = arg.figura || "figure";
  const figuras = [...tarjeta.querySelectorAll(SELFIG)].filter((f) => veo(f) && !figurasPadre(f));
  const fig = figuras.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0] || null;
  const controles = [...tarjeta.querySelectorAll("button, input, select, textarea, [role=button], [data-opcion]")]
    .filter((e) => veo(e) && !(e.tagName === "BUTTON" && esNav(e)) && !(e.matches("[data-opcion]") && e.querySelector("button")));
  const inter = controles[0] || null;
  const dentroFig = controles.filter((c) => c.closest(arg.figura || "figure"));
  const mecanica = dentroFig.length ? "figura manipulable"
    : tarjeta.querySelector("[data-constructor]") && veo(tarjeta.querySelector("[data-constructor]")) ? "constructor"
    : controles.some((c) => c.tagName === "INPUT") ? "campo de cifra"
    : controles.length ? "radio (lista de opciones)"
    : "ninguna (solo lectura)";

  const y = (e) => (e ? Math.round(e.getBoundingClientRect().top - ct) : null);
  const primero = [fig, inter].filter(Boolean).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0] || null;
  let antes = 0, total = 0, enFig = 0;
  for (const n of textos) {
    const k = cuenta(n.textContent);
    total += k;
    if (n.parentElement.closest(arg.figura || "figure")) enFig += k;
    if (primero && (primero.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_PRECEDING) && !primero.contains(n)) antes += k;
  }
  if (!primero) antes = total;

  // Bloques de texto: cada nodo de texto va a su bloque más cercano (p, li, h*, button, o display block/flex/grid).
  const bloqueDe = (el) => {
    for (let x = el; x && x !== tarjeta.parentElement; x = x.parentElement) {
      if (/^(P|LI|H[1-6]|BUTTON|LABEL|FIGCAPTION|TD|TH|DT|DD)$/.test(x.tagName)) return x;
      const d = getComputedStyle(x).display;
      if (/block|flex|grid|list-item|table-cell/.test(d)) return x;
    }
    return tarjeta;
  };
  const bloques = new Map();
  for (const n of textos) {
    const b = bloqueDe(n.parentElement);
    bloques.set(b, (bloques.get(b) || "") + n.textContent);
  }
  const norm = (s) => s.replace(/\s+/g, " ").trim().toLowerCase();
  const vistos = new Map();
  for (const [b, s] of bloques) {
    for (const f of s.split(/(?<=[.!?:])\s+/)) {
      const z = norm(f);
      if (cuenta(z) < 5) continue;
      if (!vistos.has(z)) vistos.set(z, []);
      vistos.get(z).push(b);
    }
  }
  const repetidos = [...vistos].filter(([, bs]) => bs.length > 1).map(([z, bs]) => ({ frase: z, veces: bs.length, donde: bs.map((b) => Math.round(b.getBoundingClientRect().top - ct)) }));

  // Colores: dónde hay teal (debe) o ámbar (haber), fuera de las figuras, y en los marcadores de veredicto.
  const TEAL = ["42, 157, 143", "47, 168, 160"], AMBAR = ["233, 196, 106", "255, 200, 87"];
  const tono = (e) => {
    const c = getComputedStyle(e);
    const v = [c.color, c.borderTopColor, c.borderLeftColor, c.borderRightColor, c.borderBottomColor, c.backgroundColor, c.boxShadow, c.outlineColor, c.fill, c.stroke].join("|");
    const tw = (+c.borderTopWidth || 0) + (+c.borderLeftWidth.replace("px", "") || 0);
    const r = [];
    if (TEAL.some((p) => v.includes(p))) r.push("teal");
    if (AMBAR.some((p) => v.includes(p))) r.push("ambar");
    return r;
  };
  const camino = (e) => { const p = []; for (let x = e; x && x !== tarjeta; x = x.parentElement) { const ix = x.parentElement ? [...x.parentElement.children].indexOf(x) : 0; p.unshift(x.tagName.toLowerCase() + ix); } return p.join(">"); };
  const colores = {};
  for (const e of tarjeta.querySelectorAll("*")) {
    if (!veo(e) || e.closest(arg.figura || "figure")) continue;
    const h = tono(e);
    if (h.length) colores[camino(e)] = { tonos: h, txt: (e.innerText || e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60), marca: e.dataset?.estado || e.dataset?.mensaje || e.dataset?.panel || null };
  }
  /* Célula B: el Retro compartido (corazon/juego.jsx) no lleva marca de datos; su acierto es el role="status" que empieza por «Correcto:». */
  const retroBien = [...tarjeta.querySelectorAll('[role="status"]')].filter((e) => /^\s*Correcto:/.test(e.textContent || ""));
  const marcadores = [...tarjeta.querySelectorAll('[data-estado="correcta"], [data-estado="revelada"], [data-mensaje="acierto"], [data-panel="acierto"], [data-marca="correcta"], .t4p-msg-ok, .fae-jg-acierto'), ...retroBien]
    .filter(veo).map((e) => {
      const hs = new Set(tono(e)); e.querySelectorAll("*").forEach((d) => tono(d).forEach((x) => hs.add(x)));
      return { estado: e.dataset.estado || e.dataset.mensaje || e.dataset.panel || e.className, tonos: [...hs], txt: (e.innerText || "").replace(/\s+/g, " ").trim().slice(0, 60) };
    });

  // Filas del constructor tras el veredicto: una fila al HABER con borde teal es un acierto pintado de debe.
  const filas = [...tarjeta.querySelectorAll("[data-fila-asiento]")].filter(veo).map((f) => {
    const c = getComputedStyle(f); const lado = [...f.querySelectorAll("button")].find((b) => /^(Debe|Haber)$/.test(b.innerText.trim()) && tono(b).length);
    return { lado: lado ? lado.innerText.trim() : null, borde: c.borderTopColor, tonos: tono(f), txt: (f.innerText || "").replace(/\s+/g, " ").trim().slice(0, 50) };
  });
  return {
    filas,
    tarjetaAlto: Math.round(tarjeta.getBoundingClientRect().height),
    palabras: total, palabrasFueraFigura: total - enFig, palabrasEnFigura: enFig,
    palabrasInnerText: cuenta(tarjeta.innerText || ""),
    figY: y(fig), figTipo: fig ? (fig.dataset.figura || fig.className.toString().slice(0, 20) || "figure") : null,
    interY: y(inter), interQue: inter ? (inter.dataset?.opcion ? "opcion" : inter.tagName.toLowerCase()) + ":" + (inter.innerText || inter.value || "").trim().slice(0, 30) : null,
    primeroY: y(primero), palabrasAntes: antes,
    mecanica, controles: controles.length,
    repetidos,
    figHTML: figuras.map((f) => f.outerHTML).join("\n"),
    figTexto: figuras.map((f) => (f.innerText || "").replace(/\s+/g, " ").trim()).join(" | "),
    colores, marcadores,
    sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
  };
}
