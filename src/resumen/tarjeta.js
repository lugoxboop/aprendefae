import { FAE } from "../theme.js";

/*
 * Dibuja el resumen de semestre como imagen descargable.
 *
 * Se dibuja en canvas y no se captura del DOM: la tarjeta sale idéntica en
 * cualquier navegador, con tamaño fijo pensado para historias de Instagram y
 * WhatsApp (1080×1350, la proporción 4:5 que ninguna de las dos recorta).
 *
 * NO SE PUBLICA NADA. La imagen se genera en el dispositivo del estudiante y se
 * descarga; no hay enlace público. Un enlace compartible expondría los datos de
 * un estudiante a cualquiera que lo tuviera, sin pedir sesión, y para esto no
 * compensa.
 *
 * El mecanismo de descarga es el mismo blob + <a download> que ya usa la
 * exportación del panel docente: es el primer sitio donde se comparte una
 * imagen, así que queda como el patrón a reutilizar cuando las medallas de hito
 * quieran compartirse también.
 */

const W = 1080;
const H = 1350;

/* ------------------------- fondos por materia ------------------------- */

/*
 * Un fotograma quieto de la animación de la materia donde más se movió. No es
 * una captura del componente en vivo —eso no sobrevive al canvas— sino el mismo
 * motivo redibujado: tablero en perspectiva para Pensamiento Estratégico,
 * curvas que se cruzan para Macroeconomía.
 */
function fondoAjedrez(ctx) {
  ctx.save();
  ctx.translate(W / 2, H * 0.62);
  ctx.transform(1, 0, -0.55, 0.42, 0, 0); // perspectiva falsa, plana pero convincente
  const lado = 132;
  for (let f = 0; f < 8; f++) {
    for (let c = 0; c < 8; c++) {
      ctx.fillStyle = (f + c) % 2 === 0 ? "rgba(248,249,250,0.045)" : "rgba(42,157,143,0.05)";
      ctx.fillRect((c - 4) * lado, (f - 4) * lado, lado, lado);
    }
  }
  ctx.restore();
}

function fondoOfertaDemanda(ctx) {
  ctx.save();
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  /* Dos curvas que se cruzan: la imagen que abre Macroeconomía. */
  ctx.strokeStyle = "rgba(231,111,81,0.16)";
  ctx.beginPath();
  ctx.moveTo(W * 0.12, H * 0.86);
  ctx.quadraticCurveTo(W * 0.5, H * 0.78, W * 0.9, H * 0.5);
  ctx.stroke();

  ctx.strokeStyle = "rgba(42,157,143,0.16)";
  ctx.beginPath();
  ctx.moveTo(W * 0.12, H * 0.52);
  ctx.quadraticCurveTo(W * 0.5, H * 0.8, W * 0.9, H * 0.88);
  ctx.stroke();
  ctx.restore();
}

/* ------------------------------ el logo ------------------------------ */

/*
 * El símbolo de marca, redibujado: dos nodos abajo, vértice coral arriba. Va en
 * la tarjeta porque esto se comparte fuera del sitio, que es justo donde el
 * logo tiene que hacer su trabajo.
 */
function logo(ctx, x, y, escala) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(escala, escala);
  ctx.strokeStyle = "rgba(248,249,250,0.85)";
  ctx.lineWidth = 2.6;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(2, 20);
  ctx.lineTo(12, 3);
  ctx.lineTo(22, 20);
  ctx.stroke();
  ctx.fillStyle = "rgba(248,249,250,0.85)";
  ctx.beginPath(); ctx.arc(2, 20, 3.1, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(22, 20, 3.1, 0, 7); ctx.fill();
  ctx.fillStyle = FAE.coral;
  ctx.beginPath(); ctx.arc(12, 3, 3.4, 0, 7); ctx.fill();
  ctx.restore();
}

/* ------------------------------ la tarjeta ------------------------------ */

const fmt = (n) => Math.round(n).toLocaleString("es-CO");

export function dibujarResumen(resumen, apodo) {
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");

  /* Base navy, con la misma caída de luz del sitio. */
  ctx.fillStyle = FAE.bg;
  ctx.fillRect(0, 0, W, H);

  if (resumen.materiaPrincipal === "pensamiento-estrategico") fondoAjedrez(ctx);
  else fondoOfertaDemanda(ctx);

  const velo = ctx.createRadialGradient(W / 2, H * 0.34, 0, W / 2, H * 0.34, W * 1.15);
  velo.addColorStop(0, "rgba(14,27,46,0.15)");
  velo.addColorStop(0.6, "rgba(14,27,46,0.7)");
  velo.addColorStop(1, "rgba(10,20,34,0.95)");
  ctx.fillStyle = velo;
  ctx.fillRect(0, 0, W, H);

  const M = 84; // margen

  /* --- cabecera --- */
  logo(ctx, M, 74, 1.9);
  ctx.fillStyle = "rgba(248,249,250,0.9)";
  ctx.font = "700 30px Sora, sans-serif";
  ctx.fillText("aprendeFAE", M + 62, 100);

  ctx.fillStyle = resumen.cerrado ? FAE.teal : FAE.ambar;
  ctx.font = "700 22px Sora, sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillText(resumen.cerrado ? "SEMESTRE CERRADO" : "ASÍ VAS HASTA AHORA", M, 190);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = "rgba(248,249,250,0.65)";
  ctx.font = "400 30px Inter, sans-serif";
  ctx.fillText(apodo ?? "", M, 238);

  /* --- cifra grande --- */
  ctx.fillStyle = FAE.text;
  ctx.font = "700 150px Sora, sans-serif";
  ctx.fillText(fmt(resumen.fpTotal), M, 400);
  ctx.fillStyle = "rgba(248,249,250,0.6)";
  ctx.font = "400 32px Inter, sans-serif";
  ctx.fillText("FP este semestre", M, 448);

  /* --- rejilla de cifras --- */
  const celdas = [
    { n: `${resumen.temasHechos} de ${resumen.temasTotal}`, t: "temas completos" },
    { n: `${resumen.rachaMaxima}`, t: resumen.rachaMaxima === 1 ? "día de racha máxima" : "días de racha máxima" },
    { n: `${resumen.actividadesDistintas}`, t: "actividades distintas" },
  ];
  celdas.forEach((c, i) => {
    const x = M + i * ((W - M * 2) / 3);
    ctx.fillStyle = FAE.text;
    ctx.font = "700 52px Sora, sans-serif";
    ctx.fillText(c.n, x, 560);
    ctx.fillStyle = "rgba(248,249,250,0.5)";
    ctx.font = "400 23px Inter, sans-serif";
    ctx.fillText(c.t, x, 596);
  });

  /* --- desglose por materia: nunca un total suelto sin esto --- */
  let y = 700;
  ctx.fillStyle = "rgba(248,249,250,0.45)";
  ctx.font = "700 21px Sora, sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillText("POR MATERIA", M, y);
  ctx.letterSpacing = "0px";
  y += 46;

  for (const m of resumen.materias) {
    ctx.fillStyle = "rgba(248,249,250,0.08)";
    ctx.beginPath();
    ctx.roundRect(M, y, W - M * 2, 148, 20);
    ctx.fill();

    ctx.fillStyle = FAE.text;
    ctx.font = "700 34px Sora, sans-serif";
    ctx.fillText(m.nombre, M + 30, y + 52);

    ctx.fillStyle = "rgba(248,249,250,0.62)";
    ctx.font = "400 26px Inter, sans-serif";
    ctx.fillText(`${m.temasHechos} de ${m.temasTotal} temas · ${fmt(m.fp)} FP`, M + 30, y + 96);

    /* Posición de liga: por materia, del último ciclo cerrado, o nada. */
    ctx.font = "400 24px Inter, sans-serif";
    ctx.fillStyle = m.posicion ? FAE.teal : "rgba(248,249,250,0.35)";
    ctx.fillText(
      m.posicion ? `Liga ${m.liga} de ${m.totalLigas} · puesto ${m.posicion}` : "Sin ciclo de liga cerrado",
      M + 30,
      y + 132
    );

    y += 170;
  }

  /* --- pie --- */
  ctx.fillStyle = "rgba(248,249,250,0.35)";
  ctx.font = "400 24px Inter, sans-serif";
  ctx.fillText(
    resumen.cerrado ? "aprendefae.com" : "Avance en curso · aprendefae.com",
    M,
    H - 70
  );

  return cv;
}

/* Descarga la imagen. Mismo patrón de blob + <a download> del panel docente. */
export function descargarResumen(canvas, nombre) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}
